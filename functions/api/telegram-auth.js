import { verifyTelegramAuth, createSessionToken, sessionCookieHeader, json } from '../_lib.js';
import { normalizeUser, recomputeXp } from './progress.js';

const STREAK_XP = 5;
const STREAK_BONUS = { 7: 25, 30: 100 };

/** Toshkent vaqti bo'yicha "bugun" (UTC+5) — kun chegarasi mahalliy bo'lsin. */
function todayKey(now = Date.now()) {
  return new Date(now + 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** Kunlik kirish streak'ini yangilaydi va shu kirish uchun berilgan XP'ni qaytaradi. */
function applyStreak(user) {
  const today = todayKey();
  if (user.streak.lastDay === today) return 0; // bugun allaqachon hisoblangan

  const yesterday = todayKey(Date.now() - 24 * 60 * 60 * 1000);
  user.streak.count = user.streak.lastDay === yesterday ? user.streak.count + 1 : 1;
  user.streak.lastDay = today;
  user.streak.best = Math.max(user.streak.best || 0, user.streak.count);

  const earned = STREAK_XP + (STREAK_BONUS[user.streak.count] || 0);
  user.streakXp = (user.streakXp || 0) + earned;
  return earned;
}

// POST /api/telegram-auth
// Body: Telegram Login Widget natijasi (id, first_name, last_name, username, photo_url, auth_date, hash)
export async function onRequestPost({ request, env }) {
  if (!env.BOT_TOKEN) {
    return json({ ok: false, error: 'BOT_TOKEN sozlanmagan (Cloudflare Pages > Settings > Environment variables)' }, { status: 500 });
  }
  if (!env.SESSION_SECRET) {
    return json({ ok: false, error: 'SESSION_SECRET sozlanmagan' }, { status: 500 });
  }
  if (!env.MHP_KV) {
    return json({ ok: false, error: 'MHP_KV (KV namespace) ulanmagan' }, { status: 500 });
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const valid = await verifyTelegramAuth(data, env.BOT_TOKEN);
  if (!valid) {
    return json({ ok: false, error: 'Telegram tasdiqlash muvaffaqiyatsiz' }, { status: 401 });
  }

  const userId = String(data.id);
  const key = `user:${userId}`;
  const existingRaw = await env.MHP_KV.get(key);
  const existing = existingRaw ? JSON.parse(existingRaw) : null;

  const user = normalizeUser({
    ...(existing || {}),
    id: userId,
    firstName: data.first_name || '',
    lastName: data.last_name || '',
    username: data.username || '',
    photoUrl: data.photo_url || '',
    joinedAt: existing?.joinedAt || Date.now(),
    lastLoginAt: Date.now(),
  });

  const streakEarned = applyStreak(user);
  user.xp = recomputeXp(user);

  await env.MHP_KV.put(key, JSON.stringify(user));

  const token = await createSessionToken(userId, env.SESSION_SECRET);

  return json({ ok: true, user, streakEarned }, {
    headers: { 'Set-Cookie': sessionCookieHeader(token) },
  });
}
