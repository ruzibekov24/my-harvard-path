import { json } from '../_lib.js';

/* Birlashtirilgan reyting.

   Ballar ikki joyda to'planadi va ikkalasi ham bir xil Telegram ID'ga bog'langan:
     - sayt XP  — KV (`user:<id>`), kitob/checklist/lug'at/streak uchun
     - viktorina ballari — @MHP_adminbot D1 bazasida

   Bot ishlab turgani uchun unga tegilmaydi: uning mavjud ochiq
   /api/leaderboard endpointi o'qiladi va natijalar shu yerda qo'shiladi. */

const BOT_LEADERBOARD = 'https://harvard-path-admin-bot.ilyosbek41624.workers.dev/api/leaderboard';

export async function onRequestGet({ env }) {
  if (!env.MHP_KV) {
    return json({ ok: false, error: 'Server sozlanmagan' }, { status: 500 });
  }

  // 1. Saytda ro'yxatdan o'tgan foydalanuvchilar (KV)
  const merged = new Map();
  let cursor;
  do {
    const page = await env.MHP_KV.list({ prefix: 'user:', cursor });
    for (const k of page.keys) {
      const raw = await env.MHP_KV.get(k.name);
      if (!raw) continue;
      let u;
      try { u = JSON.parse(raw); } catch { continue; }
      merged.set(String(u.id), {
        id: String(u.id),
        name: u.username ? '@' + u.username : (u.firstName || 'Foydalanuvchi'),
        firstName: u.firstName || '',
        photoUrl: u.photoUrl || '',
        siteXp: u.xp || 0,
        quizPoints: 0,
        streak: u.streak?.count || 0,
      });
    }
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);

  // 2. Botdagi viktorina ballari — xato bo'lsa ham sayt reytingi ishlashda davom etadi
  try {
    const res = await fetch(BOT_LEADERBOARD, { cf: { cacheTtl: 60 } });
    if (res.ok) {
      const data = await res.json();
      for (const row of data.leaderboard || []) {
        const id = String(row.user_id);
        const existing = merged.get(id);
        if (existing) {
          existing.quizPoints = row.points || 0;
        } else {
          merged.set(id, {
            id,
            name: row.username ? '@' + row.username : (row.first_name || 'Foydalanuvchi'),
            firstName: row.first_name || '',
            photoUrl: '',
            siteXp: 0,
            quizPoints: row.points || 0,
            streak: 0,
          });
        }
      }
    }
  } catch {
    // bot javob bermadi — faqat sayt XP'si bilan davom etamiz
  }

  const leaderboard = [...merged.values()]
    .map((u) => ({ ...u, total: u.siteXp + u.quizPoints }))
    .filter((u) => u.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 50);

  return json({ ok: true, leaderboard });
}
