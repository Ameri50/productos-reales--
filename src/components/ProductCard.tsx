import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Plus } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { add, availableStock } = useCart();
  const [added, setAdded] = useState(false);
  const stock = availableStock(product);
  const soldOut = product.stock <= 0;

  const quickAdd = () => {
    const accepted = add(product, {
      color: product.colors[0]?.name ?? "",
      storage: product.storages[0]?.capacity ?? "",
      quantity: 1,
    });
    if (accepted > 0) {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1200);
    }
  };

  return (
    <article className="card-surface group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-34px_rgba(0,0,0,0.45)]">
      <Link
        to={`/producto/${product.id}`}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        <ProductImage
          product={product}
          className="h-full w-full transition duration-500 group-hover:scale-[1.03]"
          padding="p-7"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white backdrop-blur">
          {product.category}
        </span>
        {soldOut ? (
          <span className="absolute right-3 top-3 rounded-full bg-red-500/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            Agotado
          </span>
        ) : (
          stock <= 3 && (
            <span className="absolute right-3 top-3 rounded-full bg-amber-500/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
              Últimas {stock}
            </span>
          )
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          to={`/producto/${product.id}`}
          className="line-clamp-2 font-semibold leading-snug transition group-hover:text-[#0a84ff]"
        >
          {product.name}
        </Link>

        {product.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {product.description}
          </p>
        )}

        {product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 pt-0.5">
            {product.colors.slice(0, 5).map((color) => (
              <span
                key={color.name}
                title={color.name}
                className="h-3 w-3 rounded-full border border-black/10 shadow-sm dark:border-white/20"
                style={{ backgroundColor: color.hexColor }}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-[10px] text-zinc-400">
                +{product.colors.length - 5}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className="text-[17px] font-semibold tracking-tight">
              {formatPrice(product.price)}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {soldOut ? "Sin stock" : `${stock} disponibles`}
            </p>
          </div>

          <button
            type="button"
            onClick={quickAdd}
            disabled={soldOut || stock <= 0}
            aria-label={`Agregar ${product.name} al carrito`}
            className="grid h-9 w-9 place-items-center rounded-full bg-[#0a84ff] text-white shadow-[0_10px_20px_-12px_rgba(10,132,255,0.9)] transition hover:bg-[#0077ed] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none dark:disabled:bg-white/10 dark:disabled:text-zinc-500"
          >
            {added ? <Check size={17} /> : <Plus size={18} />}
          </button>
        </div>
      </div>
    </article>
  );
}
