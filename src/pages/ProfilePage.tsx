import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Check,
  Clock3,
  ExternalLink,
  Loader2,
  LogOut,
  Settings2,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { initials } from "@/lib/format";
import { PANEL_URL, WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from "@/lib/types";

type FormState = {
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
  edad: string;
};

const EMPTY_FORM: FormState = {
  nombre: "",
  apellido: "",
  telefono: "",
  direccion: "",
  edad: "",
};

export function ProfilePage() {
  const { user, profile, loading, isAdmin, displayName, saveProfile, signOutUser } =
    useAuth();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setForm({
      nombre: profile.nombre,
      apellido: profile.apellido,
      telefono: profile.telefono,
      direccion: profile.direccion,
      edad: profile.edad,
    });
  }, [profile?.uid]);

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-zinc-400">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md py-14 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#0a84ff]/10 text-[#0a84ff]">
          <UserRound size={30} />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Tu cuenta</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Inicia sesión para guardar tus datos, ver tus reservas y seguir tus
          pedidos.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            to="/ingresar"
            className="flex-1 rounded-full bg-[#0a84ff] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Ingresar
          </Link>
          <Link
            to="/registro"
            className="flex-1 rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    );
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await saveProfile(form);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("No pudimos guardar tus datos. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="card-surface flex items-center gap-4 p-5">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#0a84ff] to-[#1d4ed8] text-lg font-semibold text-white">
          {initials(form.nombre || displayName, user.email ?? "")}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 truncate text-lg font-semibold">
            {form.nombre || displayName}
            {isAdmin && (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-300">
                Admin
              </span>
            )}
          </p>
          <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
            {user.email}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          to="/historial"
          className="card-surface flex items-center gap-3 p-4 transition hover:-translate-y-0.5"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0a84ff]/10 text-[#0a84ff]">
            <Clock3 size={17} />
          </span>
          <span className="text-sm font-medium">Historial</span>
        </Link>
        <Link
          to="/tienda"
          className="card-surface flex items-center gap-3 p-4 transition hover:-translate-y-0.5"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShoppingBag size={17} />
          </span>
          <span className="text-sm font-medium">Tienda</span>
        </Link>
        <Link
          to="/nosotros"
          className="card-surface flex items-center gap-3 p-4 transition hover:-translate-y-0.5"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <BadgeCheck size={17} />
          </span>
          <span className="text-sm font-medium">Nosotros</span>
        </Link>
      </div>

      <form onSubmit={submit} className="card-surface space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="font-semibold">Mis datos</h2>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Se sincronizan con tu perfil de la app.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["nombre", "Nombre", "name"],
              ["apellido", "Apellido", "family-name"],
              ["telefono", "Teléfono", "tel"],
              ["edad", "Edad", "off"],
            ] as Array<[keyof FormState, string, string]>
          ).map(([key, label, autoComplete]) => (
            <label key={key} className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {label}
              </span>
              <input
                value={form[key]}
                onChange={(event) =>
                  setForm((current) => ({ ...current, [key]: event.target.value }))
                }
                autoComplete={autoComplete}
                className="field px-4"
              />
            </label>
          ))}
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Dirección de entrega
          </span>
          <input
            value={form.direccion}
            onChange={(event) =>
              setForm((current) => ({ ...current, direccion: event.target.value }))
            }
            autoComplete="street-address"
            className="field px-4"
          />
        </label>

        {error && (
          <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0a84ff] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0077ed] disabled:opacity-70"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saved ? (
            <Check size={16} />
          ) : (
            <Settings2 size={16} />
          )}
          {saving ? "Guardando…" : saved ? "Guardado" : "Guardar cambios"}
        </button>
      </form>

      <div className="card-surface space-y-3 p-5">
        <p className="text-sm font-semibold">Contacto y administración</p>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-2xl border border-black/[0.06] px-4 py-3 text-sm transition hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/5"
        >
          <span>WhatsApp {WHATSAPP_DISPLAY}</span>
          <ExternalLink size={15} className="text-zinc-400" />
        </a>

        {isAdmin && (
          <a
            href={PANEL_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-2xl border border-black/[0.06] px-4 py-3 text-sm transition hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/5"
          >
            <span>Panel de administración</span>
            <ExternalLink size={15} className="text-zinc-400" />
          </a>
        )}

        <button
          type="button"
          onClick={() => void signOutUser()}
          className="inline-flex items-center gap-2 rounded-full border border-red-500/25 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
        >
          <LogOut size={15} /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}
