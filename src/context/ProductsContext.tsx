import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { normalizeProduct, sortCategories } from "@/lib/products";
import type { Product } from "@/lib/types";

const CACHE_KEY = "productos-reales.catalog.v1";

type CatalogCache = {
  savedAt: number;
  items: Product[];
};

function readCache(): Product[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CatalogCache;
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

function writeCache(items: Product[]) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ savedAt: Date.now(), items } satisfies CatalogCache),
    );
  } catch {
    // Modo privado o cuota llena: el catálogo igual funciona en memoria.
  }
}

type ProductsContextValue = {
  products: Product[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  byId: (id: string) => Product | undefined;
  categories: string[];
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => readCache());
  const [loading, setLoading] = useState(() => readCache().length === 0);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      // Lectura única: el catálogo público no necesita tiempo real y así no
      // se mantiene una conexión abierta por visitante.
      const snapshot = await getDocs(collection(db, "products"));
      const items = snapshot.docs
        .map((entry) => normalizeProduct(entry.id, entry.data()))
        .filter((product) => product.name && product.price > 0);
      setProducts(items);
      writeCache(items);
      setError(null);
    } catch {
      setError(
        "No pudimos cargar el catálogo. Revisa tu conexión e inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const categories = useMemo(
    () =>
      sortCategories(
        Array.from(new Set(products.map((product) => product.category))).filter(
          Boolean,
        ),
      ),
    [products],
  );

  const byId = useCallback(
    (id: string) => products.find((product) => product.id === id),
    [products],
  );

  const value = useMemo<ProductsContextValue>(
    () => ({ products, loading, error, refresh, byId, categories }),
    [products, loading, error, refresh, byId, categories],
  );

  return (
    <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts debe usarse dentro de ProductsProvider");
  }
  return context;
}
