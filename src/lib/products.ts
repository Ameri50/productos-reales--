import type { ColorOption, Product, StorageOption } from "./types";

type RawRecord = Record<string, unknown>;

function firstString(source: RawRecord, keys: string[]): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function firstNumber(source: RawRecord, keys: string[], fallback: number): number {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return fallback;
}

function parseColors(raw: unknown): ColorOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const record = entry as RawRecord;
      const name = typeof record.name === "string" ? record.name.trim() : "";
      const hexColor =
        firstString(record, ["hexColor", "hex", "color", "value"]) || "#9ca3af";
      if (!name) return null;
      return { name, hexColor };
    })
    .filter((entry): entry is ColorOption => entry !== null);
}

function parseStorages(raw: unknown): StorageOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const record = entry as RawRecord;
      const capacity =
        typeof record.capacity === "string" ? record.capacity.trim() : "";
      const multiplier = firstNumber(record, ["priceMultiplier", "multiplier"], 1);
      if (!capacity) return null;
      return { capacity, priceMultiplier: multiplier > 0 ? multiplier : 1 };
    })
    .filter((entry): entry is StorageOption => entry !== null);
}

/**
 * Normaliza documentos de Firestore escritos por la app iOS, el panel web y
 * el seed antiguo (`imageName`, `biography`, `colors`, `storages`...).
 */
export function normalizeProduct(id: string, data: RawRecord): Product {
  const colors = parseColors(
    data.colorOptions ?? data.colors ?? data.color_options,
  );
  const storages = parseStorages(
    data.storageOptions ?? data.storages ?? data.storage_options,
  );
  const price = firstNumber(data, ["price", "precio"], 0);
  const stock = firstNumber(data, ["stock", "cantidad"], 0);

  // `imageURL` en documentos antiguos apunta a un asset local de la app
  // ("/assets/Applicon.jpg"), inservible en la web: solo aceptamos http(s).
  const imageCandidates = ["image_url", "imageURL", "imageUrl", "image"].map(
    (key) => data[key],
  );
  const imageUrl =
    imageCandidates.find(
      (value): value is string =>
        typeof value === "string" && /^https?:\/\//i.test(value.trim()),
    ) ?? "";

  return {
    id,
    name: firstString(data, ["name", "product_name", "nombre"]) || "Producto",
    price,
    category: firstString(data, ["category", "categoria"]) || "Otros",
    imageUrl,
    description: firstString(data, ["description", "biography", "descripcion"]),
    stock: Math.max(0, Math.round(stock)),
    colors,
    storages,
  };
}

export function searchText(product: Product): string {
  return [
    product.name,
    product.category,
    product.description,
    product.price.toString(),
    ...product.colors.flatMap((c) => [c.name, c.hexColor]),
    ...product.storages.map((s) => s.capacity),
  ]
    .join(" ")
    .toLowerCase();
}

export function priceForStorage(product: Product, storage: string): number {
  const option = product.storages.find((entry) => entry.capacity === storage);
  const multiplier = option?.priceMultiplier ?? 1;
  return Math.round(product.price * multiplier * 100) / 100;
}

export const CATEGORY_ORDER = [
  "iPhone",
  "iPad",
  "Mac",
  "Apple Watch",
  "AirPods",
  "Accesorios",
  "Audio",
  "TV",
];

export function sortCategories(categories: string[]): string[] {
  return [...categories].sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a);
    const indexB = CATEGORY_ORDER.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}
