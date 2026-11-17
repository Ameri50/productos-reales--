import { Link } from "react-router-dom";
import { ArrowRight, HeartHandshake, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useProducts } from "@/context/ProductsContext";

export function AboutPage() {
  const { products, categories } = useProducts();

  return (
    <div className="space-y-10">
      <header className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#0a84ff]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0a84ff]">
          <Sparkles size={13} /> Nosotros
        </span>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Tecnología Apple, atención de barrio.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-300">
          Productos Reales nació en Lima con una idea simple: comprar un equipo
          Apple debería ser tan claro como conversar con alguien que sabe. Por
          eso el catálogo es transparente, el stock es real y cada reserva se
          confirma con una persona por WhatsApp.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          {
            icon: ShieldCheck,
            title: "Productos originales",
            text: "Catálogo verificado y administrado desde un panel propio.",
          },
          {
            icon: HeartHandshake,
            title: "Atención directa",
            text: "Sin bots ni formularios eternos: te responde un asesor.",
          },
          {
            icon: Truck,
            title: "Entrega coordinada",
            text: "Lima y provincias, con seguimiento hasta la puerta.",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="card-surface p-5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0a84ff]/10 text-[#0a84ff]">
                <Icon size={18} />
              </span>
              <p className="mt-3 font-semibold">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {item.text}
              </p>
            </div>
          );
        })}
      </section>

      <section className="card-surface grid gap-6 p-6 sm:grid-cols-3 sm:p-8">
        {[
          { value: products.length || "—", label: "productos en catálogo" },
          { value: categories.length || "—", label: "categorías disponibles" },
          { value: "24 h", label: "de reserva por pedido" },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      <section className="max-w-2xl space-y-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Cómo trabajamos
        </h2>
        <p>
          El inventario vive en un único catálogo compartido entre esta web, la
          app iOS y el panel de administración. Cuando reservas, se genera un
          código único, se separa el stock por 24 horas y se registra el pedido
          para que puedas seguirlo desde cualquier dispositivo.
        </p>
        <p>
          El pago y la entrega se coordinan siempre por WhatsApp al{" "}
          <a
            href="https://wa.me/51997609045"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#0a84ff]"
          >
            +51 997 609 045
          </a>
          . No pedimos datos de tarjeta en la web.
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link
          to="/tienda"
          className="inline-flex items-center gap-2 rounded-full bg-[#0a84ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0077ed]"
        >
          Ver catálogo <ArrowRight size={16} />
        </Link>
        <Link
          to="/soporte"
          className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
        >
          Ir a soporte
        </Link>
      </div>
    </div>
  );
}
