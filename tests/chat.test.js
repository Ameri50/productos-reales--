import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/chat.js";

function response() {
  return {
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    end() { return this; },
  };
}

test("GitHub Pages can preflight the Vercel endpoint", async () => {
  const res = response();
  await handler({ method: "OPTIONS", headers: { origin: "https://ameri50.github.io" } }, res);
  assert.equal(res.statusCode, 204);
  assert.equal(res.headers["Access-Control-Allow-Origin"], "https://ameri50.github.io");
});

test("invalid origins and conversations are rejected", async () => {
  const blocked = response();
  await handler({ method: "POST", headers: { origin: "https://other.example" } }, blocked);
  assert.equal(blocked.statusCode, 403);

  const invalid = response();
  await handler({ method: "POST", headers: {}, body: { turns: [{ role: "user", text: "" }] } }, invalid);
  assert.equal(invalid.statusCode, 400);
});

test("missing server key is reported without making an upstream request", async (t) => {
  const originalKey = process.env.GEMINI_API_KEY;
  const originalError = console.error;
  delete process.env.GEMINI_API_KEY;
  console.error = () => {};
  t.after(() => {
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
    console.error = originalError;
  });
  const res = response();
  await handler({ method: "POST", headers: {}, body: { turns: [{ role: "user", text: "Hola" }] } }, res);
  assert.equal(res.statusCode, 503);
  assert.match(res.body.message, /no está configurado/);
});

test("server sends the key to Gemini and returns only the response text", async (t) => {
  const originalKey = process.env.GEMINI_API_KEY;
  const originalFetch = globalThis.fetch;
  process.env.GEMINI_API_KEY = "test-key";
  t.after(() => {
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async (url, options) => {
    assert.match(url, /gemini-3\.5-flash-lite:generateContent$/);
    assert.equal(options.headers["x-goog-api-key"], "test-key");
    assert.ok(options.signal instanceof AbortSignal);
    const body = JSON.parse(options.body);
    assert.equal(body.contents[0].role, "user");
    assert.equal(body.generationConfig.thinkingConfig.thinkingLevel, "minimal");
    return { ok: true, status: 200, json: async () => ({
      candidates: [{ content: { parts: [{ text: "Hola, ¿en qué te ayudo?" }] } }],
    }) };
  };
  const res = response();
  await handler({
    method: "POST",
    headers: { origin: "https://productos-reales.vercel.app" },
    body: { turns: [{ role: "model", text: "Hola" }, { role: "user", text: "Consulta" }] },
  }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { message: "Hola, ¿en qué te ayudo?" });
});

test("upstream timeouts return a clear error within the configured limit", async (t) => {
  const originalKey = process.env.GEMINI_API_KEY;
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  process.env.GEMINI_API_KEY = "test-key";
  console.error = () => {};
  t.after(() => {
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
    globalThis.fetch = originalFetch;
    console.error = originalError;
  });
  globalThis.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(signal.reason), { once: true });
  });
  const res = response();
  const started = Date.now();
  await handler({ method: "POST", headers: {}, body: { turns: [{ role: "user", text: "Hola" }] } }, res);
  const elapsed = Date.now() - started;
  assert.ok(elapsed >= 9_000 && elapsed < 12_000, `timeout took ${elapsed}ms`);
  assert.equal(res.statusCode, 504);
  assert.match(res.body.message, /tardó demasiado/);
});

test("quota errors are returned without retrying", async (t) => {
  const originalKey = process.env.GEMINI_API_KEY;
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  process.env.GEMINI_API_KEY = "test-key";
  console.error = () => {};
  t.after(() => {
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
    globalThis.fetch = originalFetch;
    console.error = originalError;
  });
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return { ok: false, status: 429 };
  };
  const res = response();
  await handler({ method: "POST", headers: {}, body: { turns: [{ role: "user", text: "Hola" }] } }, res);
  assert.equal(calls, 1);
  assert.equal(res.statusCode, 503);
  assert.match(res.body.message, /saturado/);
});
