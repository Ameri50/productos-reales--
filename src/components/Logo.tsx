import { Link } from "react-router-dom";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      className="group flex items-center gap-2.5"
      aria-label="Productos Reales, ir al inicio"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-[10px] bg-white ring-1 ring-black/10 transition group-hover:scale-105 dark:ring-white/20">
        <img
          src="./logo-support.png"
          alt=""
          width={36}
          height={36}
          className="h-full w-full object-cover"
        />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-[15px] font-semibold tracking-tight">
            Productos Reales
          </span>
          <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
            Support · Tienda Apple
          </span>
        </span>
      )}
    </Link>
  );
}
