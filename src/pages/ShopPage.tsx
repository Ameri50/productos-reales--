import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { RefreshCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/context/ProductsContext";
import { searchText } from "@/lib/products";

type SortKey = "relevancia" | "precio-asc" | "precio-desc" | "nombre";

const SORTS: Array<{ value: SortKey; label: string }> = [
  { value: "relevancia", label: "Relevancia" },
  { value: "precio-asc", label: "Menor precio" },
  { value: "precio-desc", label: "Mayor precio" },
  { value: "nombre", label: "Nombre A-Z" },
];

export function ShopPage() {
  const { products, categories, loading, error, refresh } = useProducts();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("categoria") ?? "Todas");
  const [sort, setSort] = useState<SortKey>("relevancia");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const items = products
      .filter((product) => category === "Todas" || product.category === category)
      .filter((product) => !query || searchText(product).includes(query));

    switch (sort) {
      case "precio-asc":
        return [...items].sort((a, b) => a.price - b.price);
      case "precio-desc":
        return [...items].sort((a, b) => b.price - a.price);
      case "nombre":
        return [...items].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return items;
    }
  }, [products, category, search, sort]);

  const selectCategory = (value: string) => {
    setCategory(value);
    const next = new URLSearchParams(params);
    if (value === "Todas") next.delete("categoria");
    else next.set("categoria", value);
    setParams(next, { replace: true });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Tienda
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {loading
              ? "Cargando catálogo…"
              : `${filtered.length} de ${products.length} productos`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar producto…"
              aria-label="Buscar producto"
              className="field w-56 pl-9 pr-9 sm:w-72"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <label className="relative hidden sm:block">
            <SlidersHorizontal
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              aria-label="Ordenar productos"
              className="field appearance-none py-2.5 pl-9 pr-8 text-sm"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {["Todas", ...categories].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => selectCategory(item)}
            className={[
              "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition",
              category === item
                ? "border-transparent bg-zinc-900 text-white dark:bg-white dark:text-black"
                : "border-black/10 bg-white text-zinc-600 hover:border-black/20 dark:border-white/15 dark:bg-[#141416] dark:text-zinc-300",
            ].join(" ")}
          >
            {item}
          </button>
        ))}
      </div>

      {error ? (
        <div className="card-surface px-6 py-14 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{error}</p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            <RefreshCcw size={15} /> Reintentar
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-3xl bg-black/[0.06] dark:bg-white/[0.06]"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/10 px-6 py-20 text-center dark:border-white/10">
          <p className="font-medium">No encontramos productos</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Prueba con otra palabra o cambia de categoría.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              selectCategory("Todas");
            }}
            className="mt-4 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
