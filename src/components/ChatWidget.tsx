import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2, MessageCircle, SendHorizontal, X } from "lucide-react";
import { askGemini, type ChatTurn } from "@/lib/gemini";

const GREETING: ChatTurn = {
  role: "model",
  text: "¡Hola! Soy el asistente de Productos Reales. Te ayudo con productos Apple, reservas de 24 h y envíos. ¿Qué estás buscando?",
};

const QUICK_QUESTIONS = [
  { label: "¿Cómo reservo?", text: "¿Cómo hago una reserva y cuánto dura?" },
  { label: "Envíos", text: "¿Hacen envíos a provincias?" },
  { label: "Categorías", text: "¿Qué categorías de productos tienen disponibles?" },
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ block: "end" });
    inputRef.current?.focus();
  }, [open, turns, busy]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || busy) return;
    setInput("");
    setError(null);
    setBusy(true);
    const next: ChatTurn[] = [...turns, { role: "user", text: message }];
    setTurns(next);
    try {
      const reply = await askGemini(next);
      setTurns((current) => [...current, { role: "model", text: reply }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pude responder.");
    } finally {
      setBusy(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void send(input);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Cerrar chat de ayuda" : "Abrir chat de ayuda"}
        aria-expanded={open}
        className="fixed bottom-24 right-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-[0_16px_36px_-14px_rgba(0,0,0,0.7)] ring-1 ring-black/10 transition hover:bg-brand-strong hover:scale-105 sm:bottom-6 sm:right-6 dark:ring-white/20"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <section
          aria-label="Chat de ayuda"
          className="card-surface fixed bottom-40 left-4 right-4 z-50 flex max-h-[min(560px,calc(100dvh-13rem))] flex-col overflow-hidden sm:bottom-24 sm:left-auto sm:right-6 sm:w-[380px]"
        >
          <header className="flex items-center gap-3 border-b border-black/[0.06] px-4 py-3 dark:border-white/10">
            <img
              src="./logo-support.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg bg-white object-cover ring-1 ring-black/10 dark:ring-white/15"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">Asistente SUPPORT</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Con Gemini · respuestas al instante
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              className="ml-auto grid h-8 w-8 place-items-center rounded-full text-zinc-500 transition hover:bg-black/5 dark:text-zinc-400 dark:hover:bg-white/10"
            >
              <X size={16} />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {turns.map((turn, index) => (
              <p
                key={index}
                className={[
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  turn.role === "user"
                    ? "ml-auto rounded-br-md bg-brand text-white"
                    : "rounded-bl-md bg-black/[0.04] text-zinc-800 dark:bg-white/[0.07] dark:text-zinc-100",
                ].join(" ")}
              >
                {turn.text}
              </p>
            ))}

            {busy && (
              <p className="flex w-fit items-center gap-2 rounded-2xl rounded-bl-md bg-black/[0.04] px-3.5 py-2.5 text-xs text-zinc-500 dark:bg-white/[0.07] dark:text-zinc-400">
                <Loader2 size={14} className="animate-spin" /> Escribiendo…
              </p>
            )}

            {error && (
              <p className="rounded-2xl bg-red-500/10 px-3.5 py-2.5 text-xs leading-relaxed text-red-600 dark:text-red-300">
                {error}
              </p>
            )}

            {turns.length === 1 && !busy && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_QUESTIONS.map((question) => (
                  <button
                    key={question.label}
                    type="button"
                    onClick={() => void send(question.text)}
                    className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-black/[0.04] dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/10"
                  >
                    {question.label}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={submit}
            className="flex items-center gap-2 border-t border-black/[0.06] px-3 py-2.5 dark:border-white/10"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Escribe tu consulta…"
              className="field px-4 py-2.5"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Enviar mensaje"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SendHorizontal size={17} />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
