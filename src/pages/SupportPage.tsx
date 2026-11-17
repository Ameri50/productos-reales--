import { Link } from "react-router-dom";
import {
  Clock3,
  CreditCard,
  MapPin,
  MessageCircle,
  PackageCheck,
  RotateCcw,
  Truck,
} from "lucide-react";
import { WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from "@/lib/types";

const FAQ = [
  {
    question: "¿Cómo reservo un producto?",
    answer:
      "Agrega el producto al carrito con el color y capacidad que quieras, inicia sesión y pulsa «Reservar y enviar por WhatsApp». El stock queda separado 24 horas y el detalle del pedido se abre en el chat.",
  },
  {
    question: "¿Cuánto dura mi reserva?",
    answer:
      "24 horas desde que la generas. Si no se confirma la compra en ese plazo, la reserva vence y el producto vuelve a estar disponible para otros clientes.",
  },
  {
    question: "¿Puedo cancelar una reserva?",
    answer:
      "Sí. En Historial → Reservaciones puedes cancelarla tú mismo. También puedes escribirnos por WhatsApp y la anulamos por ti.",
  },
  {
    question: "¿Cómo pago?",
    answer:
      "La confirmación y el pago se coordinan por WhatsApp con un asesor: transferencia, Yape/Plin o el medio que acuerden. No se cobra nada desde la web.",
  },
  {
    question: "¿Hacen envíos?",
    answer:
      "Sí, delivery en Lima metropolitana y envíos a provincias coordinados por WhatsApp. El costo se confirma según tu distrito.",
  },
  {
    question: "¿Los productos son originales?",
    answer:
      "Sí, todos los productos del catálogo son originales. El inventario se administra desde el mismo panel que alimenta la app iOS.",
  },
];

const CHANNELS = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    text: "La vía más rápida para confirmar, pagar y coordinar la entrega.",
    action: "Escribir ahora",
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
  },
  {
    icon: Clock3,
    title: "Horario de atención",
    text: "Lunes a sábado, 9:00 a 19:00 (hora de Lima).",
  },
  {
    icon: MapPin,
    title: "Ubicación",
    text: "Lima, Perú. Entregas en Lima y envíos a todo el país.",
  },
];

export function SupportPage() {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Soporte
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-zinc-500 dark:text-zinc-400">
          Resolvemos tus dudas sobre reservas, pagos y entregas. Si necesitas
          ayuda con un pedido, ten a la mano tu código de reserva.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        {CHANNELS.map((channel) => {
          const Icon = channel.icon;
          return (
            <div key={channel.title} className="card-surface flex flex-col p-5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0a84ff]/10 text-[#0a84ff]">
                <Icon size={18} />
              </span>
              <p className="mt-3 font-semibold">{channel.title}</p>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {channel.text}
              </p>
              {channel.href && (
                <a
                  href={channel.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0a84ff]"
                >
                  {channel.action} <span aria-hidden>→</span>
                </a>
              )}
            </div>
          );
        })}
      </section>

      <section className="card-surface overflow-hidden">
        <div
          className="px-6 py-7 text-white"
          style={{
            backgroundImage:
              "radial-gradient(600px 260px at 8% -20%, rgba(37,211,102,0.45), transparent 65%), radial-gradient(500px 240px at 100% 0%, rgba(10,132,255,0.4), transparent 65%)",
            backgroundColor: "#0b0b0d",
          }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
            Atención directa
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {WHATSAPP_DISPLAY}
          </h2>
          <p className="mt-2 max-w-md text-sm text-white/70">
            Envía tu código de reserva y te confirmamos stock, forma de pago y
            entrega.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25d366] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          >
            <MessageCircle size={16} /> Abrir WhatsApp
          </a>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">
          Preguntas frecuentes
        </h2>
        <div className="card-surface divide-y divide-black/[0.06] dark:divide-white/10">
          {FAQ.map((item) => (
            <details key={item.question} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium">
                {item.question}
                <span className="text-zinc-400 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {[
          {
            icon: PackageCheck,
            title: "Revisa tus reservas",
            text: "Todas tus reservas y pedidos quedan en tu historial.",
            to: "/historial",
          },
          {
            icon: RotateCcw,
            title: "¿Reserva vencida?",
            text: "Vuelve a reservar en segundos desde el catálogo.",
            to: "/tienda",
          },
          {
            icon: CreditCard,
            title: "Pagos coordinados",
            text: "Sin cobros automáticos: todo se confirma por chat.",
            to: "/nosotros",
          },
          {
            icon: Truck,
            title: "Entregas en Perú",
            text: "Lima y provincias con seguimiento por WhatsApp.",
            to: "/nosotros",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              to={item.to}
              className="card-surface flex gap-3 p-4 transition hover:-translate-y-0.5"
            >
              <span className="mt-0.5 text-[#0a84ff]">
                <Icon size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {item.text}
                </p>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
