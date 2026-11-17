const CHAT_ENDPOINT = "https://productos-reales.vercel.app/api/chat";

export type ChatTurn = { role: "user" | "model"; text: string };

export async function askGemini(turns: ChatTurn[]): Promise<string> {
  const response = await fetch(CHAT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ turns: turns.slice(-12) }),
  });

  let result: unknown;
  try {
    result = await response.json();
  } catch {
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
