const MODEL = "gemini-3.8-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim() ?? "";

export type ChatTurn = { role: "user" | "model"; text: string };

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

const FRIENDLY_BUSY =
  "El asistente está saturado en este momento. Espera unos segundos e inténtalo otra vez.";

function extractText(payload: unknown): string {
  const data = payload as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    promptFeedback?: { blockReason?: string };
  };
  if (data.promptFeedback?.blockReason) {
    return "No puedo responder a esa consulta. ¿Te ayudo con algo del catálogo?";
  }
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((part) => part.text ?? "")
    .join("")
    .trim();
}

export async function askGemini(turns: ChatTurn[]): Promise<string> {
  if (!API_KEY) {
    throw new Error(
      "Falta la clave de Gemini. Configura VITE_GEMINI_API_KEY para usar el chat.",
    );
  }

  const contents = turns.slice(-12).map((turn) => ({
    role: turn.role,
    parts: [{ text: turn.text }],
  }));

  let lastStatus = 0;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`${ENDPOINT}?key=${encodeURIComponent(API_KEY)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          temperature: 0.6,
          topP: 0.9,
          maxOutputTokens: 700,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (response.ok) {
      const text = extractText(await response.json());
      return text || "No obtuve respuesta. ¿Puedes reformular tu pregunta?";
    }

    lastStatus = response.status;
    if (response.status !== 503 && response.status !== 429) break;
    await new Promise((resolve) => window.setTimeout(resolve, 600 * (attempt + 1)));
  }

  if (lastStatus === 503 || lastStatus === 429) throw new Error(FRIENDLY_BUSY);
  if (lastStatus === 401 || lastStatus === 403) {
    throw new Error("La clave de Gemini no es válida o está restringida.");
  }
  throw new Error("No pude conectar con el asistente. Inténtalo de nuevo.");
}
