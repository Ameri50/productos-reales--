import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, UserRound } from "lucide-react";
import { Logo } from "@/components/Logo";
import { authErrorMessage, useAuth } from "@/context/AuthContext";

function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md py-4">
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>
      <div className="card-surface p-6 sm:p-7">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
      <div className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {footer}
      </div>
    </div>
  );
}

function PasswordField({
  value,
  onChange,
  autoComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Lock
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
      />
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required
        minLength={6}
        placeholder="Contraseña"
        className="field pl-10 pr-11"
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-zinc-400 transition hover:bg-black/5 dark:hover:bg-white/10"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export function LoginPage() {
  const { user, loading, signIn, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to={next} replace />;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      await signIn(email, password);
      navigate(next, { replace: true });
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  const forgot = async () => {
    if (!email.trim()) {
      setError("Escribe tu correo primero para enviarte el enlace.");
      return;
    }
    try {
      await resetPassword(email);
      setNotice("Te enviamos un enlace para restablecer tu contraseña.");
      setError(null);
    } catch (caught) {
      setError(authErrorMessage(caught));
    }
  };

  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="Accede con la misma cuenta que usas en la app."
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link
            to={`/registro?next=${encodeURIComponent(next)}`}
            className="font-semibold text-[#0a84ff]"
          >
            Crear cuenta
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-3">
        <div className="relative">
          <Mail
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            placeholder="Correo electrónico"
            className="field pl-10"
          />
        </div>

        <PasswordField
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />

        {error && (
          <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-300">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-xl bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0a84ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0077ed] disabled:opacity-70"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Ingresar
        </button>
      </form>

      <div className="mt-3 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => void forgot()}
          className="font-medium text-zinc-500 transition hover:text-[#0a84ff] dark:text-zinc-400"
        >
          ¿Olvidaste tu contraseña?
        </button>
        <Link
          to="/tienda"
          className="font-medium text-zinc-500 transition hover:text-[#0a84ff] dark:text-zinc-400"
        >
          Explorar sin cuenta
        </Link>
      </div>
    </AuthShell>
  );
}

export function RegisterPage() {
  const { user, loading, signUp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setError(null);
  }, [password, confirm]);

  if (!loading && user) {
    return <Navigate to={next} replace />;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await signUp(name, email, password);
      navigate(next, { replace: true });
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Guarda tus reservas y sigue tus pedidos desde cualquier dispositivo."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link
            to={`/ingresar?next=${encodeURIComponent(next)}`}
            className="font-semibold text-[#0a84ff]"
          >
            Iniciar sesión
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-3">
        <div className="relative">
          <UserRound
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
            placeholder="Tu nombre"
            className="field pl-10"
          />
        </div>

        <div className="relative">
          <Mail
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            placeholder="Correo electrónico"
            className="field pl-10"
          />
        </div>

        <PasswordField
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />

        <div className="relative">
          <Lock
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
            placeholder="Repite la contraseña"
            className="field pl-10"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0a84ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0077ed] disabled:opacity-70"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Crear mi cuenta
        </button>
      </form>
    </AuthShell>
  );
}
