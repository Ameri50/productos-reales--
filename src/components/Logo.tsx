import { Link } from "react-router-dom";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      className="group flex items-center gap-2.5"
      aria-label="Productos Reales, ir al inicio"
    >
      <span className="relative grid h-9 w-9 place-items-center rounded-[11px] bg-gradient-to-br from-[#0a84ff] via-[#3b82f6] to-[#1d4ed8] text-[13px] font-semibold tracking-tight text-white shadow-[0_8px_20px_-8px_rgba(10,132,255,0.9)] transition group-hover:scale-105">
        PR
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-[15px] font-semibold tracking-tight">
            Productos Reales
          </span>
          <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
            Tienda Apple · Perú
          </span>
        </span>
      )}
    </Link>
  );
}
