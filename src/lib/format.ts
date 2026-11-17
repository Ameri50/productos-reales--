const currencyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

export function formatPrice(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function countdown(target: Date, now = Date.now()): string {
  const diff = target.getTime() - now;
  if (diff <= 0) return "Vencida";
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours >= 1) return `${hours} h ${String(minutes).padStart(2, "0")} min`;
  return `${minutes} min ${String(seconds).padStart(2, "0")} s`;
}

export function initials(name: string, email: string): string {
  const source = name.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "PR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
