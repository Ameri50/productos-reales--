import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  Clock3,
  Loader2,
  MessageCircle,
  Trash2,
  XCircle,
} from "lucide-react";
import { Countdown, StatusPill } from "@/components/OrderBits";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { formatDate, formatPrice } from "@/lib/format";
import { buildWhatsAppUrl, effectiveStatus, parseOrder } from "@/lib/orders";
import type { Order } from "@/lib/types";

type Tab = "reservations" | "orders" | "all";

const TABS: Array<{ value: Tab; label: string }> = [
  { value: "reservations", label: "Reservaciones" },
  { value: "orders", label: "Pedidos" },
  { value: "all", label: "Todas" },
];

export function HistoryPage() {
  const { user, loading: authLoading, displayName } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("reservations");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "orders"),
      where("userUid", "==", user.uid),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const parsed = snapshot.docs
          .map((entry) => parseOrder(entry.id, entry.data()))
          .filter((entry): entry is Order => entry !== null)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setOrders(parsed);
        setError(null);
        setLoading(false);
      },
      (caught) => {
        setError(
          caught.code === "permission-denied"
            ? "Firestore no permite leer tu historial todavía. Pide al administrador que publique las reglas actualizadas."
            : "No pudimos cargar tu historial. Revisa tu conexión.",
        );
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  const filtered = useMemo(() => {
    if (tab === "all") return orders;
    return orders.filter((order) =>
      tab === "reservations"
        ? effectiveStatus(order, now) === "reserved"
        : effectiveStatus(order, now) === "confirmed",
    );
  }, [orders, tab, now]);

  const counts = useMemo(() => {
    return {
      reservations: orders.filter(
        (order) => effectiveStatus(order, now) === "reserved",
      ).length,
      orders: orders.filter(
        (order) => effectiveStatus(order, now) === "confirmed",
      ).length,
      all: orders.length,
    };
  }, [orders, now]);

  const cancel = async (order: Order) => {
    if (
      !window.confirm(
        `¿Cancelar la reserva ${order.code}? El stock volverá a estar disponible.`,
      )
    ) {
      return;
    }
    setPendingId(order.code);
    try {
      await updateDoc(doc(db, "orders", order.code), {
        status: "cancelled",
        updatedAt: serverTimestamp(),
      });
    } catch {
      window.alert("No pudimos cancelar la reserva. Inténtalo de nuevo.");
    } finally {
      setPendingId(null);
    }
  };

  const remove = async (order: Order) => {
    if (!window.confirm(`¿Eliminar el registro ${order.code}?`)) return;
    setPendingId(order.code);
    try {
      await deleteDoc(doc(db, "orders", order.code));
    } catch {
      window.alert("No pudimos eliminar el registro.");
    } finally {
      setPendingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center py-20 text-zinc-400">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-black/[0.05] text-zinc-400 dark:bg-white/[0.07]">
          <Clock3 size={30} />
        </div>
        <h1 className="mt-4 text-xl font-semibold">
          Inicia sesión para ver tu historial
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Aquí encontrarás tus reservas de 24 horas y los pedidos confirmados,
          igual que en la app.
        </p>
        <Link
          to="/ingresar?next=/historial"
          className="mt-5 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
        >
          Ingresar
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Historial
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Reservas y pedidos sincronizados con la app y el panel.
        </p>
      </header>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={[
              "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition",
              tab === item.value
                ? "border-transparent bg-zinc-900 text-white dark:bg-white dark:text-black"
                : "border-black/10 bg-white text-zinc-600 hover:border-black/20 dark:border-white/15 dark:bg-[#141416] dark:text-zinc-300",
            ].join(" ")}
          >
            {item.label} ({counts[item.value]})
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-3xl bg-black/[0.06] dark:bg-white/[0.06]"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/10 px-6 py-16 text-center dark:border-white/10">
          <p className="font-medium">
            {tab === "reservations"
              ? "No tienes reservas activas"
              : tab === "orders"
                ? "Aún no hay pedidos confirmados"
                : "Todavía no hay registros"}
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Cuando reserves un producto aparecerá aquí automáticamente.
          </p>
          <Link
            to="/tienda"
            className="mt-4 inline-flex rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const status = effectiveStatus(order, now);
            const busy = pendingId === order.code;
            return (
              <article key={order.code} className="card-surface p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold">
                      {order.code}
                    </span>
                    <StatusPill status={status} />
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                <ul className="mt-3 space-y-1.5 border-t border-black/[0.06] pt-3 text-sm dark:border-white/10">
                  {order.items.map((item, index) => (
                    <li
                      key={`${item.productId}-${index}`}
                      className="flex justify-between gap-3"
                    >
                      <span className="min-w-0 text-zinc-600 dark:text-zinc-300">
                        <span className="font-medium text-zinc-900 dark:text-zinc-50">
                          {item.quantity}×
                        </span>{" "}
                        {item.name}
                        {(item.color || item.storage) && (
                          <span className="text-zinc-400">
                            {" "}
                            · {[item.color, item.storage].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] pt-3 dark:border-white/10">
                  <div className="text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Total{" "}
                    </span>
                    <span className="text-base font-semibold">
                      {formatPrice(order.total)}
                    </span>
                    {status === "reserved" && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-accent">
                        <Clock3 size={12} />
                        <Countdown target={order.expiresAt} />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={buildWhatsAppUrl(order, displayName)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold transition hover:bg-black/[0.04] dark:border-white/15 dark:hover:bg-white/10"
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                    {status === "reserved" && (
                      <button
                        type="button"
                        onClick={() => void cancel(order)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold transition hover:bg-black/[0.04] disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/10"
                      >
                        {busy ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <XCircle size={14} />
                        )}
                        Cancelar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void remove(order)}
                      disabled={busy}
                      aria-label={`Eliminar ${order.code}`}
                      className="grid h-8 w-8 place-items-center rounded-full text-zinc-400 transition hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
