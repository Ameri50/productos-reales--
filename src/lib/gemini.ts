const CHAT_ENDPOINT = "https://productos-reales.vercel.app/api/chat";

export type ChatTurn = { role: "user" | "model"; text: string };

export async function askGemini(turns: ChatTurn[]): Promise<string> {
  const signal = AbortSignal.timeout(15_000);
  let response: Response;
  let result: unknown;
  try {
    response = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ turns: turns.slice(-12) }),
      signal,
    });
    result = await response.json();
  } catch {
    if (signal.aborted) {
      throw new Error("El asistente tardó demasiado en responder. Inténtalo de nuevo.");
    }
    throw new Error("No pude conectar con el asistente. Inténtalo de nuevo.");
  }
  if (
    typeof result !== "object" ||
    result === null ||
    !("message" in result) ||
    typeof result.message !== "string"
  ) {
    throw new Error("No pude conectar con el asistente. Inténtalo de nuevo.");
  }
  if (!response.ok) throw new Error(result.message);
  return result.message;
}
