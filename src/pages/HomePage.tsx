import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/context/ProductsContext";

const STEPS = [
  {
    icon: PackageCheck,
    title: "Elige tu producto",
    text: "Explora el catálogo completo con colores, capacidades y stock real en vivo.",
  },
  {
    icon: MessageCircle,
    title: "Reserva por WhatsApp",
    text: "Generamos un código de reserva y te llevamos al chat con el detalle del pedido.",
  },
  {
    icon: BadgeCheck,
    title: "Confirma en 24 horas",
    text: "Tu reserva queda activa 24 h. Coordinamos entrega y pago por WhatsApp.",
  },
];

export function HomePage() {
  const { products, categories, loading } = useProducts();

  const featured = products
    .filter((product) => product.imageUrl && product.stock > 0)
    .slice(0, 8);

  return (
    <div className="space-y-14">
      <section
        className="relative overflow-hidden rounded-[32px] bg-[#0b0b0d] px-6 py-12 text-white sm:px-10 sm:py-16"
        style={{
          backgroundImage:
            "radial-gradient(900px 420px at 12% -10%, rgba(10,132,255,0.42), transparent 60%), radial-gradient(700px 380px at 92% 8%, rgba(168,85,247,0.32), transparent 62%)",
        }}
      >
        <div className="max-w-2xl animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80 backdrop-blur">
            <Sparkles size={13} /> Tienda Apple en Perú
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            Todo el ecosistema Apple,
            <br />
            <span className="bg-gradient-to-r from-[#6eb9ff] via-white to-[#c7b4ff] bg-clip-text text-transparent">
              reservado en 24 horas.
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            iPhone, iPad, Mac, Apple Watch y accesorios originales. Arma tu
            carrito, reserva el stock y confirma tu compra por WhatsApp. Lo
            mismo que ves en la app, ahora desde tu navegador.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/tienda"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Ver catálogo <ArrowRight size={16} />
            </Link>
            <Link
              to="/soporte"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              <MessageCircle size={16} /> Hablar por WhatsApp
            </Link>
          </div>

          <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.12em] text-white/50">
                Productos
              </dt>
              <dd className="mt-1 text-2xl font-semibold">
                {loading ? "—" : products.length}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.12em] text-white/50">
                Categorías
              </dt>
              <dd className="mt-1 text-2xl font-semibold">
                {loading ? "—" : categories.length}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.12em] text-white/50">
                Reserva
              </dt>
              <dd className="mt-1 text-2xl font-semibold">24 h</dd>
            </div>
          </dl>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Compra por categoría
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Las mismas categorías que encuentras en la app.
            </p>
          </div>
          <Link
            to="/tienda"
            className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-[#0a84ff] sm:inline-flex"
          >
            Ver todo <ArrowRight size={15} />
          </Link>
        </div>

        <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1">
          {categories.map((category) => (
            <Link
              key={category}
              to={`/tienda?categoria=${encodeURIComponent(category)}`}
              className="card-surface snap-start whitespace-nowrap px-5 py-3.5 text-sm font-medium transition hover:-translate-y-0.5 hover:text-[#0a84ff]"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Recomendados
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Disponibles ahora, con stock actualizado.
            </p>
          </div>
          <Link
            to="/tienda"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#0a84ff]"
          >
            Ver todo <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-3xl bg-black/[0.06] dark:bg-white/[0.06]"
              />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-black/10 py-16 text-center text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
            El catálogo está sincronizándose. Vuelve en un momento.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="card-surface p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0a84ff]/10 text-[#0a84ff]">
                  <Icon size={19} />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                  Paso {index + 1}
                </span>
              </div>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {step.text}
              </p>
            </div>
          );
        })}
      </section>

      <section className="card-surface grid gap-5 p-6 sm:grid-cols-3 sm:p-8">
        {[
          {
            icon: ShieldCheck,
            title: "Productos originales",
            text: "Catálogo sincronizado con la app y el panel de administración.",
          },
          {
            icon: Clock3,
            title: "Stock reservado 24 h",
            text: "Al reservar, el producto queda separado para ti durante un día.",
          },
          {
            icon: Truck,
            title: "Entrega coordinada",
            text: "Delivery en Lima o recojo, siempre confirmado por WhatsApp.",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex gap-3">
              <span className="mt-0.5 text-[#0a84ff]">
                <Icon size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                  {item.text}
                </p>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
