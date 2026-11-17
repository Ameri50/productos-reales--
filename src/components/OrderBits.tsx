import { useEffect, useState } from "react";
import { countdown } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

export function Countdown({
  target,
  className = "",
}: {
  target: Date;
  className?: string;
}) {
  const [label, setLabel] = useState(() => countdown(target));

  useEffect(() => {
    const timer = window.setInterval(() => setLabel(countdown(target)), 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  return <span className={className}>{label}</span>;
}

const STATUS_STYLES: Record<OrderStatus, { label: string; className: string }> = {
  reserved: {
    label: "Reservado",
    className:
      "border border-black/15 text-zinc-700 dark:border-white/20 dark:text-zinc-200",
  },
  confirmed: {
    label: "Confirmado",
    className: "bg-brand text-white",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-zinc-500/12 text-zinc-600 dark:bg-white/10 dark:text-zinc-300",
  },
  expired: {
    label: "Vencido",
    className: "bg-red-500/12 text-red-600 dark:bg-red-400/15 dark:text-red-300",
  },
};

export function StatusPill({ status }: { status: OrderStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${style.className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {style.label}
    </span>
  );
}
