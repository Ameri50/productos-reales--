import { doc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";
import { formatDate, formatPrice } from "./format";
import {
  RESERVATION_MS,
  WHATSAPP_NUMBER,
  type CartLine,
  type Order,
  type OrderItem,
  type OrderStatus,
} from "./types";

export function makeOrderCode(now = new Date()): string {
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const suffix = String(Math.floor(100 + Math.random() * 900));
  return `ORD-${date}-${suffix}`;
}

export function cartLinesToItems(lines: CartLine[]): OrderItem[] {
  return lines.map((line) => ({
    productId: line.productId,
    name: line.name,
    color: line.color,
    storage: line.storage,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
  }));
}

export function itemsTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

type CreateReservationInput = {
  lines: CartLine[];
  uid: string;
  email: string;
  customerName: string;
};

/**
 * Crea la reserva en Firestore con el mismo esquema que la app iOS
 * (`orders/{code}`), válida 24 horas y visible desde la app y el panel.
 */
export async function createReservation({
  lines,
  uid,
  email,
  customerName,
}: CreateReservationInput): Promise<Order> {
  if (!uid) throw new Error("Inicia sesión para reservar.");
  if (lines.length === 0) throw new Error("Tu carrito está vacío.");

  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + RESERVATION_MS);
  const code = makeOrderCode(createdAt);
  const items = cartLinesToItems(lines);
  const total = itemsTotal(items);

  const payload = {
    code,
    userEmail: email.trim().toLowerCase() || "invitado",
    userUid: uid,
    createdAt: Timestamp.fromDate(createdAt),
    expiresAt: Timestamp.fromDate(expiresAt),
    status: "reserved" satisfies OrderStatus,
    total,
    imageSource: lines[0]?.imageUrl ?? "",
    source: "web",
    customerName: customerName.trim(),
    updatedAt: serverTimestamp(),
    items,
  };

  await setDoc(doc(db, "orders", code), payload);

  return {
    id: code,
    code,
    userUid: uid,
    userEmail: payload.userEmail,
    createdAt,
    expiresAt,
    status: "reserved",
    total,
    imageSource: payload.imageSource,
    source: "web",
    items,
  };
}

type RawOrder = Record<string, unknown>;

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return null;
}

export function parseOrder(id: string, data: RawOrder): Order | null {
  const createdAt = toDate(data.createdAt);
  if (!createdAt) return null;
  const expiresAt =
    toDate(data.expiresAt) ?? new Date(createdAt.getTime() + RESERVATION_MS);

  const rawStatus = typeof data.status === "string" ? data.status : "reserved";
  const status: OrderStatus =
    rawStatus === "confirmed" ||
    rawStatus === "cancelled" ||
    rawStatus === "expired"
      ? rawStatus
      : "reserved";

  const items: OrderItem[] = Array.isArray(data.items)
    ? data.items
        .map((entry) => {
          if (!entry || typeof entry !== "object") return null;
          const raw = entry as RawOrder;
          const name = typeof raw.name === "string" ? raw.name : "";
          if (!name) return null;
          return {
            productId: typeof raw.productId === "string" ? raw.productId : "",
            name,
            color: typeof raw.color === "string" ? raw.color : "",
            storage: typeof raw.storage === "string" ? raw.storage : "",
            quantity: typeof raw.quantity === "number" ? raw.quantity : 1,
            unitPrice: typeof raw.unitPrice === "number" ? raw.unitPrice : 0,
          };
        })
        .filter((entry): entry is OrderItem => entry !== null)
    : [];

  return {
    id,
    code: typeof data.code === "string" ? data.code : id,
    userUid: typeof data.userUid === "string" ? data.userUid : "",
    userEmail:
      typeof data.userEmail === "string" ? data.userEmail.toLowerCase() : "",
    createdAt,
    expiresAt,
    status,
    total: typeof data.total === "number" ? data.total : itemsTotal(items),
    imageSource: typeof data.imageSource === "string" ? data.imageSource : "",
    source: typeof data.source === "string" ? data.source : "web",
    items,
  };
}

/** Una reserva pasa a "vencida" sola a las 24 h, igual que en la app. */
export function effectiveStatus(order: Order, now = Date.now()): OrderStatus {
  if (order.status === "reserved" && now >= order.expiresAt.getTime()) {
    return "expired";
  }
  return order.status;
}

export function buildWhatsAppUrl(order: Order, customerName: string): string {
  const lines: string[] = [
    "🛒 *NUEVO PEDIDO — PRODUCTOS REALES*",
    `🔖 *Código:* ${order.code}`,
    customerName ? `👤 *Cliente:* ${customerName}` : "",
    `✉️ *Correo:* ${order.userEmail}`,
    "",
    "📝 *Detalle del pedido*",
    "═══════════════════════════",
    "",
  ];

  order.items.forEach((item, index) => {
    lines.push(`📦 *Producto ${index + 1}:*`);
    lines.push(`   • Nombre: ${item.name}`);
    if (item.color) lines.push(`   • Color: ${item.color}`);
    if (item.storage) lines.push(`   • Capacidad: ${item.storage}`);
    lines.push(
      `   • Cantidad: ${item.quantity} x ${formatPrice(item.unitPrice)}`,
    );
    lines.push(
      `   • Subtotal: ${formatPrice(item.unitPrice * item.quantity)}`,
    );
    lines.push("");
  });

  lines.push("═══════════════════════════");
  lines.push(`💰 *Total:* ${formatPrice(order.total)}`);
  lines.push(`📅 *Fecha:* ${formatDate(order.createdAt)}`);
  lines.push("⏳ *Reserva válida por 24 horas*");
  lines.push("🙏 ¡Gracias por tu compra!");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.filter((line) => line !== undefined).join("\n"))}`;
}
