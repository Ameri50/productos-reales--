import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { priceForStorage } from "@/lib/products";
import type { CartLine, Product } from "@/lib/types";

const STORAGE_KEY = "productos-reales.cart.v1";

function readCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function lineKey(productId: string, color: string, storage: string) {
  return `${productId}::${color}::${storage}`;
}

type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (
    product: Product,
    selection: { color: string; storage: string; quantity: number },
  ) => number;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  availableStock: (product: Product) => number;
  heldQuantity: (productId: string) => number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => readCart());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Almacenamiento no disponible: el carrito vive solo en memoria.
    }
  }, [lines]);

  const heldQuantity = useCallback(
    (productId: string) =>
      lines
        .filter((line) => line.productId === productId)
        .reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  );

  const availableStock = useCallback(
    (product: Product) =>
      Math.max(0, product.stock - heldQuantity(product.id)),
    [heldQuantity],
  );

  const add = useCallback(
    (
      product: Product,
      selection: { color: string; storage: string; quantity: number },
    ) => {
      const color = selection.color || product.colors[0]?.name || "";
      const storage = selection.storage || product.storages[0]?.capacity || "";
      const requested = Math.max(1, Math.floor(selection.quantity || 1));
      const available = Math.max(0, product.stock - heldQuantity(product.id));
      const accepted = Math.min(requested, available);
      if (accepted <= 0) return 0;

      const key = lineKey(product.id, color, storage);
      const unitPrice = priceForStorage(product, storage);

      setLines((current) => {
        const existing = current.find((line) => line.key === key);
        if (existing) {
          return current.map((line) =>
            line.key === key
              ? { ...line, quantity: line.quantity + accepted }
              : line,
          );
        }
        return [
          ...current,
          {
            key,
            productId: product.id,
            name: product.name,
            category: product.category,
            imageUrl: product.imageUrl,
            color,
            storage,
            quantity: accepted,
            unitPrice,
          },
        ];
      });

      return accepted;
    },
    [heldQuantity],
  );

  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((current) =>
      current.map((line) =>
        line.key === key
          ? { ...line, quantity: Math.max(1, Math.min(99, Math.floor(quantity))) }
          : line,
      ),
    );
  }, []);

  const remove = useCallback((key: string) => {
    setLines((current) => current.filter((line) => line.key !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const count = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  );

  const total = useMemo(
    () => lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [lines],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count,
      total,
      add,
      setQuantity,
      remove,
      clear,
      availableStock,
      heldQuantity,
    }),
    [lines, count, total, add, setQuantity, remove, clear, availableStock, heldQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
}
