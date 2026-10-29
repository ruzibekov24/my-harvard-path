// AI sozlamalari BITTA joyda: kalitlar va modellar. Boshqa fayllar (mentor.js, plan-ai.js) faqat shu yerdan foydalanadi.
//
// KALITNI ALMASHTIRISH (kodga tegmasdan): Cloudflare Pages -> loyiha -> Settings -> Environment variables
//   GEMINI_API_KEYS   = kalit1,kalit2,kalit3     (vergul bilan; birinchisi asosiy, limit/kvota tugasa avtomatik keyingisiga o'tadi)
//   GEMINI_API_KEY    = eski nom ham ishlaydi
//   ANTHROPIC_API_KEY = ixtiyoriy zaxira (Gemini hammasi ishlamasa Claude javob beradi)
// O'zgartirgandan keyin "Retry deployment" qiling. Batafsil: AI-KEYS.md

// Modellar (tartib bilan sinaladi). Yangi model chiqsa, faqat shu yerni o'zgartiring.
export const GEMINI_MODELS = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];
export const CLAUDE_MODEL = 'claude-sonnet-5-5';

export function geminiKeys(env) {
  return [env.GEMINI_API_KEYS, env.GEMINI_API_KEY]
    .filter(Boolean)
    .join(',')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function aiConfigured(env) {
  return geminiKeys(env).length > 0 || !!env.ANTHROPIC_API_KEY;
}

async function callGemini(key, model, { system, contents, temperature, maxTokens, json, timeoutMs }) {
  const generationConfig = { temperature, maxOutputTokens: maxTokens };
  if (json) generationConfig.responseMimeType = 'application/json';
  if (model.startsWith('gemini-2.5')) generationConfig.thinkingConfig = { thinkingBudget: 0 };
  return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents, generationConfig }),
    signal: AbortSignal.timeout(timeoutMs),
  });
}

async function callClaude(key, { system, contents, temperature, maxTokens, timeoutMs }) {
  const messages = contents.map((c) => ({ role: c.role === 'model' ? 'assistant' : 'user', content: (c.parts || []).map((p) => p.text || '').join('') }));
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: Math.min(maxTokens, 2000), temperature, system, messages }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error('claude ' + res.status);
  const data = await res.json();
  return ((data.content || []).find((c) => c.type === 'text') || {}).text || '';
}

/**
 * Matn so'raydi. Tartib: har bir Gemini kaliti x har bir model; kalit kvotasi tugasa (429/401/403) keyingi kalitga,
 * model band bo'lsa (503/timeout) keyingi modelga o'tadi. Oxirida Claude (agar kalit bo'lsa).
 * Natija: { text, via } yoki xato tashlaydi (err.detail ichida oxirgi sabab).
 */
export async function askAI(env, { system, contents, temperature = 0.5, maxTokens = 700, json = false, timeoutMs = 12000 }) {
  let last = 'no_key';
  for (const key of geminiKeys(env)) {
    for (const model of GEMINI_MODELS) {
      let res;
      try {
        res = await callGemini(key, model, { system, contents, temperature, maxTokens, json, timeoutMs });
      } catch (e) {
        last = `${model}: timeout`;
        continue; // sekin/band: keyingi model
      }
      if (res.ok) {
        const data = await res.json();
        const parts = (((data.candidates || [])[0] || {}).content || {}).parts || [];
        const text = parts.map((p) => p.text || '').join('').trim();
        if (text) return { text, via: `gemini:${model}` };
        last = `${model}: empty`;
        continue;
      }
      last = `${model}: ${res.status}`;
      if (res.status === 429 || res.status === 401 || res.status === 403) break; // kalit muammosi: keyingi kalit
    }
  }
  if (env.ANTHROPIC_API_KEY) {
    try {
      const text = (await callClaude(env.ANTHROPIC_API_KEY, { system, contents, temperature, maxTokens, timeoutMs: timeoutMs + 8000 })).trim();
      if (text) return { text, via: 'claude' };
      last = 'claude: empty';
    } catch (e) {
      last = String(e.message || e);
    }
  }
  const err = new Error('ai_failed');
  err.detail = last;
  throw err;
}
