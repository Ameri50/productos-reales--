import { Loader2 } from "lucide-react";

function GoogleGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

type Props = {
  onClick: () => void;
  busy?: boolean;
  disabled?: boolean;
  label?: string;
};

export function GoogleButton({
  onClick,
  busy = false,
  disabled = false,
  label = "Continuar con Google",
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy ? <Loader2 size={17} className="animate-spin" /> : <GoogleGlyph />}
      {busy ? "Conectando con Google…" : label}
    </button>
  );
}

export function AuthDivider() {
  return (
    <div className="relative my-4 text-center">
      <span className="absolute inset-x-0 top-1/2 h-px bg-black/[0.07] dark:bg-white/10" />
      <span className="relative bg-white px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 dark:bg-[#141416]">
        o con tu correo
      </span>
    </div>
  );
}
