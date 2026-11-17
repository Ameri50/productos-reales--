import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";
import {
  Clock3,
  House,
  Moon,
  ShoppingBag,
  Sparkles,
  Sun,
  UserRound,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from "@/lib/types";

const NAV = [
  { to: "/", label: "Inicio", icon: House, end: true },
  { to: "/tienda", label: "Tienda", icon: ShoppingBag, end: false },
  { to: "/soporte", label: "Soporte", icon: Sparkles, end: false },
  { to: "/historial", label: "Historial", icon: Clock3, end: false },
  { to: "/perfil", label: "Perfil", icon: UserRound, end: false },
];

function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("productos-reales.theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("productos-reales.theme", dark ? "dark" : "light");
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", dark ? "#0a0a0b" : "#f5f5f7");
  }, [dark]);

  return { dark, toggle: () => setDark((value) => !value) };
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    const frame = window.requestAnimationFrame(() =>
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior }),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);
  return null;
}

export function Layout() {
  const { dark, toggle } = useTheme();
  const { count, total } = useCart();
  const { user, displayName } = useAuth();

  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollToTop />

      <header className="glass sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Logo />

          <nav className="ml-6 hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "rounded-full px-3.5 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-black/[0.06] text-zinc-900 dark:bg-white/10 dark:text-white"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggle}
              aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className="grid h-10 w-10 place-items-center rounded-full text-zinc-600 transition hover:bg-black/[0.05] dark:text-zinc-300 dark:hover:bg-white/10"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Link
              to="/carrito"
              aria-label={`Carrito, ${count} producto(s)`}
              className="relative grid h-10 w-10 place-items-center rounded-full text-zinc-600 transition hover:bg-black/[0.05] dark:text-zinc-300 dark:hover:bg-white/10"
            >
              <ShoppingBag size={19} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#0a84ff] px-1 text-[10px] font-semibold text-white">
                  {count}
                </span>
              )}
            </Link>

            {user ? (
              <Link
                to="/perfil"
                className="ml-1 hidden items-center gap-2 rounded-full border border-black/10 py-1.5 pl-1.5 pr-3.5 text-sm font-medium transition hover:bg-black/[0.04] sm:flex dark:border-white/15 dark:hover:bg-white/10"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-[#0a84ff] to-[#1d4ed8] text-[11px] font-semibold text-white">
                  {displayName.slice(0, 1).toUpperCase()}
                </span>
                <span className="max-w-24 truncate">{displayName}</span>
              </Link>
            ) : (
              <Link
                to="/ingresar"
                className="ml-1 hidden rounded-full bg-[#0a84ff] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(10,132,255,0.9)] transition hover:bg-[#0077ed] sm:block"
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>

        {count > 0 && (
          <div className="border-t border-black/[0.05] bg-white/60 dark:border-white/[0.06] dark:bg-[#141416]/60">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-xs text-zinc-600 dark:text-zinc-400">
              <span>
                {count} producto{count === 1 ? "" : "s"} en tu carrito · reserva
                de 24 h
              </span>
              <Link to="/carrito" className="font-semibold text-[#0a84ff]">
                Ver carrito · {formatPrice(total)}
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 md:pb-16 md:pt-10">
        <Outlet />
      </main>

      <footer className="border-t border-black/[0.06] bg-white/70 pb-24 pt-10 dark:border-white/[0.06] dark:bg-[#0f0f11] md:pb-10">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 max-w-56 text-sm text-zinc-500 dark:text-zinc-400">
              Productos Apple originales con reserva de 24 horas y confirmación
              directa por WhatsApp.
            </p>
          </div>

          <div className="text-sm">
            <p className="mb-3 font-semibold">Tienda</p>
            <ul className="space-y-2 text-zinc-500 dark:text-zinc-400">
              {NAV.slice(1, 4).map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="transition hover:text-[#0a84ff]">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/nosotros" className="transition hover:text-[#0a84ff]">
                  Nosotros
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-sm">
            <p className="mb-3 font-semibold">Cuenta</p>
            <ul className="space-y-2 text-zinc-500 dark:text-zinc-400">
              <li>
                <Link to="/perfil" className="transition hover:text-[#0a84ff]">
                  Mi perfil
                </Link>
              </li>
              <li>
                <Link to="/historial" className="transition hover:text-[#0a84ff]">
                  Mis reservas y pedidos
                </Link>
              </li>
              <li>
                <Link to="/carrito" className="transition hover:text-[#0a84ff]">
                  Carrito
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-sm">
            <p className="mb-3 font-semibold">Contacto</p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25d366]/12 px-3 py-1.5 font-medium text-[#0f8f45] transition hover:bg-[#25d366]/20 dark:text-[#4ade80]"
            >
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
            <p className="mt-3 text-zinc-500 dark:text-zinc-400">
              Lima, Perú · Lun a sáb, 9:00 – 19:00
            </p>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-6xl border-t border-black/[0.06] px-4 pt-5 text-xs text-zinc-500 dark:border-white/[0.06] dark:text-zinc-500">
          © {new Date().getFullYear()} Productos Reales. Precios en soles (PEN).
          Las reservas vencen automáticamente a las 24 horas.
        </div>
      </footer>

      <nav className="glass fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t md:hidden">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition",
                  isActive
                    ? "text-[#0a84ff]"
                    : "text-zinc-500 dark:text-zinc-400",
                ].join(" ")
              }
            >
              <Icon size={20} strokeWidth={2} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
