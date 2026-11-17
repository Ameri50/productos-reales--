const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";
const ALLOWED_ORIGINS = new Set([
  "https://productos-reales.vercel.app",
  "https://ameri50.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

const SYSTEM_PROMPT = `Eres el asistente virtual de "Productos Reales", una tienda Apple en Lima, Perú.
Ayudas a los clientes a elegir productos, entender precios, stock, reservas y envíos.

Reglas:
- Responde siempre en español, en 1 a 3 frases breves y claras. Usa viñetas solo si hace falta.
- Los precios están en soles peruanos (S/). Nunca inventes precios, stock ni disponibilidad: si no tienes el dato, indica que puede verificarlo en el catálogo del sitio.
- El flujo de compra: se agrega al carrito, se elige color y capacidad, se reserva el stock por 24 horas y luego se confirma todo por WhatsApp al +51 997 609 045.
- Los envíos: delivery en Lima metropolitana y envíos a provincias; el costo se coordina por WhatsApp.
- Los productos son originales.
- Si preguntan algo ajeno a la tienda, redirige amablemente al catálogo o a WhatsApp.
- No pidas datos personales ni medios de pago por el chat.`;

const BUSY = "El asistente está saturado en este momento. Espera unos segundos e inténtalo otra vez.";
const UNAVAILABLE = "No pude conectar con el asistente. Inténtalo de nuevo.";
const TIMEOUT = "El asistente tardó demasiado en responder. Inténtalo de nuevo.";

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return res.status(403).json({ message: "Origen no autorizado." });
  }
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Método no permitido." });

  const turns = req.body?.turns;
  if (
    !Array.isArray(turns) ||
    turns.length === 0 ||
    turns.length > 12 ||
    turns.some((turn) =>
      !turn ||
      (turn.role !== "user" && turn.role !== "model") ||
      typeof turn.text !== "string" ||
      !turn.text.trim() ||
      turn.text.length > 5000
    ) ||
    turns.at(-1).role !== "user"
  ) {
    return res.status(400).json({ message: "La conversación no es válida." });
  }
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    console.error("GEMINI_API_KEY no está configurada.");
    return res.status(503).json({ message: "El asistente no está configurado. Inténtalo más tarde." });
  }

  const contents = turns
    .slice(turns.findIndex((turn) => turn.role === "user"))
    .map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] }));

  const signal = AbortSignal.timeout(10_000);
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          maxOutputTokens: 1024,
          thinkingConfig: { thinkingLevel: "minimal" },
        },
      }),
    });

    if (!response.ok) {
      console.error("Error de Gemini:", response.status);
      if (response.status === 401 || response.status === 403) {
        return res.status(502).json({ message: "La clave de Gemini no es válida o no tiene acceso al modelo." });
      }
      return res.status(response.status === 429 || response.status === 503 ? 503 : 502)
        .json({ message: response.status === 429 || response.status === 503 ? BUSY : UNAVAILABLE });
    }
    const data = await response.json();
    if (data.promptFeedback?.blockReason) {
      return res.status(200).json({ message: "No puedo responder a esa consulta. ¿Te ayudo con algo del catálogo?" });
    }
    const text = (data.candidates?.[0]?.content?.parts ?? [])
      .map((part) => part.text ?? "")
      .join("")
      .trim();
    return res.status(200).json({ message: text || "No obtuve respuesta. ¿Puedes reformular tu pregunta?" });
  } catch (error) {
    console.error("Error al consultar Gemini:", error instanceof Error ? error.message : "Error desconocido");
    if (signal.aborted) return res.status(504).json({ message: TIMEOUT });
    return res.status(502).json({ message: UNAVAILABLE });
  }
}
