import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import { formatPrice } from "@/lib/format";
import { priceForStorage } from "@/lib/products";

export function ProductDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { products, byId, loading } = useProducts();
  const { add, availableStock } = useCart();
  const product = byId(id);

  const [color, setColor] = useState("");
  const [storage, setStorage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(0);

  useEffect(() => {
    if (!product) return;
    setColor(product.colors[0]?.name ?? "");
    setStorage(product.storages[0]?.capacity ?? "");
    setQuantity(1);
  }, [product]);

  const related = useMemo(() => {
    if (!product) return [];
    return products
      .filter(
        (entry) =>
          entry.id !== product.id &&
          entry.category === product.category &&
          entry.stock > 0,
      )
      .slice(0, 4);
  }, [products, product]);

  if (!product && loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-96 animate-pulse rounded-3xl bg-black/[0.06] dark:bg-white/[0.06]" />
        <div className="space-y-3">
          <div className="h-6 w-1/3 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.06]" />
          <div className="h-10 w-2/3 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.06]" />
          <div className="h-24 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.06]" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-semibold">Producto no disponible</p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Puede que ya no esté en el catálogo.
        </p>
        <Link
          to="/tienda"
          className="mt-5 inline-flex rounded-full bg-[#0a84ff] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Volver a la tienda
        </Link>
      </div>
    );
  }

  const unitPrice = priceForStorage(product, storage);
  const stockLeft = availableStock(product);
  const soldOut = product.stock <= 0 || stockLeft <= 0;
  const maxQuantity = Math.max(1, stockLeft);

  const handleAdd = (goToCart: boolean) => {
    const accepted = add(product, { color, storage, quantity });
    if (accepted === 0) return;
    if (goToCart) {
      navigate("/carrito");
      return;
    }
    setAdded(accepted);
    window.setTimeout(() => setAdded(0), 2000);
  };

  return (
    <div className="space-y-12">
      <Link
        to="/tienda"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-[#0a84ff] dark:text-zinc-400"
      >
        <ArrowLeft size={15} /> Volver a la tienda
      </Link>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="card-surface overflow-hidden">
          <ProductImage
            product={product}
            className="aspect-square w-full"
            padding="p-10"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0a84ff]">
            {product.category}
          </span>
          <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {product.name}
          </h1>

          {product.description && (
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {product.description}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-3xl font-semibold tracking-tight">
              {formatPrice(unitPrice)}
            </p>
            {unitPrice !== product.price && (
              <span className="text-sm text-zinc-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              incluye IGV
            </span>
          </div>

          {product.colors.length > 0 && (
            <section className="mt-6">
              <p className="text-sm font-semibold">
                Color:{" "}
                <span className="font-normal text-zinc-500 dark:text-zinc-400">
                  {color}
                </span>
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2.5">
                {product.colors.map((option) => (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => setColor(option.name)}
                    aria-label={option.name}
                    aria-pressed={color === option.name}
                    className={[
                      "relative grid h-10 w-10 place-items-center rounded-full border transition",
                      color === option.name
                        ? "border-[#0a84ff] ring-2 ring-[#0a84ff]/25"
                        : "border-black/10 dark:border-white/20",
                    ].join(" ")}
                  >
                    <span
                      className="h-7 w-7 rounded-full border border-black/10 dark:border-white/10"
                      style={{ backgroundColor: option.hexColor }}
                    />
                    {color === option.name && (
                      <Check
                        size={13}
                        className="absolute text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                      />
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {product.storages.length > 0 && (
            <section className="mt-6">
              <p className="text-sm font-semibold">Capacidad</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {product.storages.map((option) => {
                  const optionPrice = priceForStorage(product, option.capacity);
                  return (
                    <button
                      key={option.capacity}
                      type="button"
                      onClick={() => setStorage(option.capacity)}
                      aria-pressed={storage === option.capacity}
                      className={[
                        "rounded-2xl border px-4 py-2.5 text-left transition",
                        storage === option.capacity
                          ? "border-[#0a84ff] bg-[#0a84ff]/8 text-[#0a84ff]"
                          : "border-black/10 hover:border-black/25 dark:border-white/15 dark:hover:border-white/30",
                      ].join(" ")}
                    >
                      <span className="block text-sm font-semibold">
                        {option.capacity}
                      </span>
                      <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                        {formatPrice(optionPrice)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <section className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Cantidad</p>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {soldOut
                  ? "Sin stock disponible"
                  : `${stockLeft} disponible${stockLeft === 1 ? "" : "s"}`}
              </span>
            </div>
            <div className="mt-2.5 inline-flex items-center rounded-full border border-black/10 dark:border-white/15">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                disabled={quantity <= 1}
                aria-label="Quitar una unidad"
                className="grid h-10 w-10 place-items-center rounded-l-full text-zinc-600 transition hover:bg-black/5 disabled:opacity-40 dark:text-zinc-300 dark:hover:bg-white/10"
              >
                <Minus size={15} />
              </button>
              <span className="w-10 text-center text-sm font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((value) => Math.min(maxQuantity, value + 1))
                }
                disabled={quantity >= maxQuantity}
                aria-label="Agregar una unidad"
                className="grid h-10 w-10 place-items-center rounded-r-full text-zinc-600 transition hover:bg-black/5 disabled:opacity-40 dark:text-zinc-300 dark:hover:bg-white/10"
              >
                <Plus size={15} />
              </button>
            </div>
          </section>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={() => handleAdd(false)}
              disabled={soldOut}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0a84ff] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_-16px_rgba(10,132,255,0.9)] transition hover:bg-[#0077ed] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none dark:disabled:bg-white/10 dark:disabled:text-zinc-500"
            >
              {added > 0 ? <Check size={17} /> : <ShoppingBag size={17} />}
              {added > 0
                ? `Agregado (${added})`
                : soldOut
                  ? "Agotado"
                  : "Agregar al carrito"}
            </button>
            <button
              type="button"
              onClick={() => handleAdd(true)}
              disabled={soldOut}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-black/10 px-5 py-3.5 text-sm font-semibold transition hover:bg-black/[0.04] disabled:opacity-40 dark:border-white/15 dark:hover:bg-white/10"
            >
              Comprar ahora <ChevronRight size={16} />
            </button>
          </div>

          <ul className="mt-6 grid gap-2 text-[13px] text-zinc-600 dark:text-zinc-300">
            <li className="flex items-center gap-2">
              <Clock3 size={15} className="text-[#0a84ff]" /> Reserva el stock
              por 24 horas.
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-[#0a84ff]" /> Confirmación
              del pedido por WhatsApp.
            </li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold tracking-tight">
            También en {product.category}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {related.map((entry) => (
              <ProductCard key={entry.id} product={entry} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
