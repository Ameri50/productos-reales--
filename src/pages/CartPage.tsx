import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { Countdown } from "@/components/OrderBits";
import { ProductImage } from "@/components/ProductImage";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { buildWhatsAppUrl, createReservation } from "@/lib/orders";
import type { Order } from "@/lib/types";

function checkoutErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String((error as { code: unknown }).code);
    if (code === "permission-denied") {
      return "Tu cuenta no tiene permiso para registrar la reserva todavía. Escríbenos por WhatsApp y lo resolvemos.";
    }
    if (code === "unavailable" || code === "network-request-failed") {
      return "Sin conexión con el servidor. Revisa tu internet e inténtalo otra vez.";
    }
  }
  return "No pudimos registrar la reserva. Inténtalo de nuevo en unos segundos.";
}

export function CartPage() {
  const { lines, total, count, setQuantity, remove, clear } = useCart();
  const { user, profile, displayName } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const checkout = async () => {
    if (lines.length === 0 || submitting) return;
    if (!user) {
      navigate("/ingresar?next=/carrito");
      return;
    }

    // Se abre en blanco dentro del gesto del usuario para que el navegador
    // no bloquee la pestaña de WhatsApp tras la escritura en Firestore.
    const popup = window.open("", "_blank");
    setSubmitting(true);
    setError(null);

    try {
      const created = await createReservation({
        lines,
        uid: user.uid,
        email: user.email ?? profile?.email ?? "",
        customerName: displayName,
      });
      const url = buildWhatsAppUrl(created, displayName);
      if (popup) popup.location.href = url;
      setOrder(created);
      clear();
      window.scrollTo({ top: 0 });
    } catch (caught) {
      popup?.close();
      setError(checkoutErrorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  if (order) {
    return (
      <div className="mx-auto max-w-xl space-y-5 py-6 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent/10 text-accent">
          <CheckCircle2 size={34} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Reserva registrada
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Tu pedido quedó guardado y también es visible desde la app y el
            panel.
          </p>
        </div>

        <div className="card-surface space-y-4 p-6 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
              Código
            </span>
            <span className="rounded-full bg-black/[0.05] px-3 py-1 font-mono text-sm font-semibold dark:bg-white/10">
              {order.code}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Total</span>
            <span className="font-semibold">{formatPrice(order.total)}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">
              Reserva válida
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-accent">
              <Clock3 size={14} />
              <Countdown target={order.expiresAt} />
            </span>
          </div>

          <p className="rounded-2xl bg-accent/8 px-4 py-3 text-xs leading-relaxed text-accent">
            Envía el detalle por WhatsApp para confirmar la compra. Si la
            reserva vence, el producto vuelve a estar disponible.
          </p>

          <a
            href={buildWhatsAppUrl(order, displayName)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
          >
            <MessageCircle size={17} /> Abrir WhatsApp
          </a>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            to="/historial"
            className="flex-1 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
          >
            Ver mi historial
          </Link>
          <Link
            to="/tienda"
            className="flex-1 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-black/[0.05] text-zinc-400 dark:bg-white/[0.07]">
          <ShoppingBag size={30} />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Tu carrito está vacío</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Agrega productos para reservarlos y confirmar por WhatsApp.
        </p>
        <Link
          to="/tienda"
          className="mt-5 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
        >
          Explorar la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Carrito
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {count} producto{count === 1 ? "" : "s"} · reserva de 24 horas
          </p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="text-sm font-medium text-zinc-500 transition hover:text-red-500 dark:text-zinc-400"
        >
          Vaciar
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="space-y-3">
          {lines.map((line) => (
            <article
              key={line.key}
              className="card-surface flex gap-3 p-3 sm:gap-4 sm:p-4"
            >
              <Link
                to={`/producto/${line.productId}`}
                className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl sm:h-28 sm:w-28"
              >
                <ProductImage
                  product={{
                    name: line.name,
                    category: line.category,
                    imageUrl: line.imageUrl,
                  }}
                  className="h-full w-full"
                  padding="p-3"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/producto/${line.productId}`}
                    className="line-clamp-2 text-sm font-semibold leading-snug transition hover:text-accent sm:text-[15px]"
                  >
                    {line.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(line.key)}
                    aria-label={`Quitar ${line.name}`}
                    className="shrink-0 rounded-full p-1.5 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {[line.color, line.storage].filter(Boolean).join(" · ")}
                </p>

                <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                  <div className="inline-flex items-center rounded-full border border-black/10 dark:border-white/15">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(line.key, line.quantity - 1)
                      }
                      disabled={line.quantity <= 1}
                      aria-label="Quitar una unidad"
                      className="grid h-8 w-8 place-items-center rounded-l-full transition hover:bg-black/5 disabled:opacity-40 dark:hover:bg-white/10"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(line.key, line.quantity + 1)
                      }
                      aria-label="Agregar una unidad"
                      className="grid h-8 w-8 place-items-center rounded-r-full transition hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatPrice(line.unitPrice * line.quantity)}
                    </p>
                    {line.quantity > 1 && (
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {formatPrice(line.unitPrice)} c/u
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}

          <Link
            to="/tienda"
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent"
          >
            ← Seguir comprando
          </Link>
        </div>

        <aside className="card-surface space-y-4 p-5 lg:sticky lg:top-24">
          <h2 className="font-semibold">Resumen del pedido</h2>

          <div className="space-y-2 text-sm">
            {lines.map((line) => (
              <div key={line.key} className="flex justify-between gap-3">
                <span className="line-clamp-1 text-zinc-500 dark:text-zinc-400">
                  {line.quantity} × {line.name}
                </span>
                <span className="shrink-0">
                  {formatPrice(line.unitPrice * line.quantity)}
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t border-black/[0.06] pt-2 text-base font-semibold dark:border-white/10">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {!user && (
            <p className="rounded-2xl bg-black/[0.04] px-4 py-3 text-xs leading-relaxed text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
              Inicia sesión para que tu reserva quede guardada y puedas seguirla
              en el historial.
            </p>
          )}

          {error && (
            <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-600 dark:text-red-300">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => void checkout()}
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <MessageCircle size={17} />
            )}
            {submitting ? "Registrando reserva…" : "Reservar y enviar por WhatsApp"}
          </button>

          <p className="text-center text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            Se registra tu reserva por 24 h y se abre WhatsApp con el detalle.
            {user ? "" : " Necesitas iniciar sesión."}
          </p>
        </aside>
      </div>
    </div>
  );
}
