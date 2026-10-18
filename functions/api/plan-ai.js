// POST /api/plan-ai: "Mening rejam" sahifasi uchun qabul ehtimoli va AI tahlil.
// Kalit saytda emas, faqat Cloudflare Pages muhitida saqlanadi:
//   Settings -> Environment variables -> GEMINI_API_KEY (Secret)   [Google AI Studio kaliti]
//   (zaxira sifatida ANTHROPIC_API_KEY ham ishlaydi)
// Kalit yo'q bo'lsa 503 qaytadi va sahifa oddiy (lokal) hisobga o'tib ketadi.

const GEMINI_MODEL = 'gemini-2.5-flash';
const CLAUDE_MODEL = 'claude-sonnet-5-5';
const DAILY_LIMIT = 8; // bir IP uchun kuniga

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

const clip = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').slice(0, n);

const SYSTEM =
  "Siz O'zbekistonlik o'quvchilarga chet el universitetlariga kirishda yordam beradigan samimiy va halol maslahatchisiz. " +
  "Faqat berilgan ma'lumotga tayanib, o'zbek tilida (lotin) javob bering. Aniq qabul kafolatini bermang, real va ehtiyotkor taxmin qiling: " +
  "universitetning umumiy qabul foizini asos qilib, talabaning GPA, SAT/ACT, IELTS, yutuqlari va yo'nalishiga qarab ko'taring yoki tushiring. " +
  "Javobni FAQAT bitta JSON obyekt sifatida qaytaring: " +
  '{"chance_pct":butun son 1-95,"verdict":"reach|match|safe","chance":"oraliq, masalan 5-10%","summary":"2-3 gap","strengths":["..."],"gaps":["..."],"actions":["aniq, bajariladigan 4-6 qadam, har biri muddat bilan"],"certificates":"qo\'shimcha sertifikat/yutuqlar bahosi, 1-2 gap"}. ' +
  "Har ro'yxat 3-6 band, har band 1 jumla.";

async function askGemini(key, prompt) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.4, maxOutputTokens: 1800, thinkingConfig: { thinkingBudget: 0 } },
    }),
  });
  if (!res.ok) throw new Error('gemini ' + res.status);
  const data = await res.json();
  const parts = (((data.candidates || [])[0] || {}).content || {}).parts || [];
  return parts.map((p) => p.text || '').join('');
}

async function askClaude(key, prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 1400, system: SYSTEM, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) throw new Error('claude ' + res.status);
  const data = await res.json();
  return ((data.content || []).find((c) => c.type === 'text') || {}).text || '';
}

export async function onRequestPost({ request, env }) {
  if (!env.GEMINI_API_KEY && !env.ANTHROPIC_API_KEY) return json({ error: 'ai_off' }, 503);

  // faqat o'z saytimizdan
  const origin = request.headers.get('origin') || '';
  const host = new URL(request.url).host;
  if (origin && new URL(origin).host !== host) return json({ error: 'forbidden' }, 403);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'bad json' }, 400); }

  // kunlik cheklov (KV bo'lsa)
  if (env.MHP_KV) {
    const ip = request.headers.get('cf-connecting-ip') || 'x';
    const key = `plan-ai:${ip}:${new Date().toISOString().slice(0, 10)}`;
    const used = parseInt((await env.MHP_KV.get(key)) || '0', 10);
    if (used >= DAILY_LIMIT) return json({ error: 'limit' }, 429);
    await env.MHP_KV.put(key, String(used + 1), { expirationTtl: 90000 });
  }

  const u = body.uni || {};
  const p = body.profile || {};
  const facts = {
    universitet: clip(u.name, 80), umumiy_qabul_foizi: clip(u.acceptanceRate, 60), oqish_puli: clip(u.tuition, 80),
    yordam: clip(u.aid, 120), ielts_talab: clip(u.ielts, 60), test_talab: clip(u.test, 60), tizim: clip(u.system, 40), muddat: clip(u.deadline, 40),
    boshlash_yili: Number(p.year) || null, abituriyent_turi: p.kind === 'tr' ? 'transfer' : 'maktab', yonalish: clip(p.major, 60),
    maktab: clip(p.school, 80), davlat: clip(p.country, 40),
    gpa_4: Number(p.gpa4) || null, sat: Number(p.sat) || null, act: Number(p.act) || null, ielts: Number(p.ielts) || null,
    sertifikatlar: (Array.isArray(p.certs) ? p.certs : []).slice(0, 10).map((c) => clip(c, 40)),
    boshqa_yutuqlar: clip(p.extra, 600), moliyaviy_yordam_kerak: !!p.aid,
    oddiy_hisob_tayyorlik_foizi: Number(p.score) || null, qolgan_oy: Number(p.months) || null,
  };
  const prompt = "Talaba ma'lumoti:\n" + JSON.stringify(facts);

  let text;
  try {
    text = env.GEMINI_API_KEY ? await askGemini(env.GEMINI_API_KEY, prompt) : await askClaude(env.ANTHROPIC_API_KEY, prompt);
  } catch (e) { return json({ error: 'upstream' }, 502); }

  const m = String(text).match(/\{[\s\S]*\}/);
  if (!m) return json({ error: 'parse' }, 502);
  try {
    const out = JSON.parse(m[0]);
    const list = (a) => (Array.isArray(a) ? a.slice(0, 8).map((x) => clip(x, 300)) : []);
    const pct = Math.max(1, Math.min(95, Math.round(Number(out.chance_pct) || 0)));
    return json({
      chance_pct: pct,
      verdict: ['reach', 'match', 'safe'].includes(out.verdict) ? out.verdict : (pct >= 60 ? 'safe' : pct >= 25 ? 'match' : 'reach'),
      chance: clip(out.chance, 30), summary: clip(out.summary, 600),
      strengths: list(out.strengths), gaps: list(out.gaps), actions: list(out.actions), certificates: clip(out.certificates, 400),
    });
  } catch (e) { return json({ error: 'parse' }, 502); }
}
