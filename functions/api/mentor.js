import { askAI, aiConfigured } from '../_ai.js';

// POST /api/mentor: mobil ilovadagi "Yo'ldosh" AI maslahatchisi uchun chat.
// Kalit va modellar bitta joyda: functions/_ai.js (qanday almashtirish: AI-KEYS.md).
// Kalit yo'q bo'lsa 503 qaytadi va ilova oddiy (lokal) javobga o'tib ketadi.

const DAILY_LIMIT = 20; // bir IP uchun kuniga (ilovaning o'zida 5 ta bepul so'rov limiti bor)

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

const clip = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').slice(0, n);

const SYSTEM =
  "Siz \"Yo'ldosh\" ismli, O'zbekistonlik o'quvchilarga Harvard va boshqa top universitetlarga kirishga tayyorlanishda yordam beradigan samimiy va halol maslahatchisiz. " +
  "Faqat o'zbek tilida (lotin) javob bering, qisqa va aniq: 3-6 jumla yoki qisqa ro'yxat. " +
  "Aniq qabul kafolatini bermang. Sana, narx yoki foizni faqat to'liq ishonchingiz komil bo'lsa yozing, aks holda universitetning rasmiy saytini tekshirishni tavsiya qiling. " +
  "Talabaning ma'lumotiga (GPA, SAT, IELTS, yo'nalish, qolgan oy) tayanib, amaliy va bajariladigan qadamlarni taklif qiling. " +
  "Mavzudan chetga chiqmang: ta'lim, qabul, test, insho, stipendiya va o'qish odatlari.";

export async function onRequestPost({ request, env }) {
  if (!aiConfigured(env)) return json({ error: 'ai_off' }, 503);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'bad json' }, 400); }

  if (env.MHP_KV) {
    const ip = request.headers.get('cf-connecting-ip') || 'x';
    const key = `mentor:${ip}:${new Date().toISOString().slice(0, 10)}`;
    const used = parseInt((await env.MHP_KV.get(key)) || '0', 10);
    if (used >= DAILY_LIMIT) return json({ error: 'limit' }, 429);
    await env.MHP_KV.put(key, String(used + 1), { expirationTtl: 90000 });
  }

  const c = body.context || {};
  const facts = {
    ism: clip(c.name, 40), universitet: clip(c.uni, 80), yil: Number(c.year) || null, yonalish: clip(c.major, 60),
    gpa_4: Number(c.gpa4) || null, sat: Number(c.sat) || null, act: Number(c.act) || null, ielts: Number(c.ielts) || null,
    yutuqlar: (Array.isArray(c.certs) ? c.certs : []).slice(0, 10).map((x) => clip(x, 40)),
    tayyorlik_foizi: Number(c.score) || null, qolgan_oy: Number(c.months) || null,
    yetishmayotgan: (Array.isArray(c.gaps) ? c.gaps : []).slice(0, 5).map((x) => clip(x, 120)),
  };

  const msgs = (Array.isArray(body.messages) ? body.messages : []).slice(-10);
  const contents = msgs
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: clip(m.content, 1200) }] }));
  if (!contents.length || contents[contents.length - 1].role !== 'user') return json({ error: 'no message' }, 400);

  try {
    const { text } = await askAI(env, { system: SYSTEM + '\n\nTalaba ma\'lumoti: ' + JSON.stringify(facts), contents, temperature: 0.6, maxTokens: 700 });
    return json({ reply: clip(text, 3000) });
  } catch (e) {
    return json({ error: 'upstream', detail: e.detail || '' }, 502);
  }
}
