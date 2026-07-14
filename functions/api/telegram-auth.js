import { verifyTelegramAuth, createSessionToken, sessionCookieHeader, json } from '../_lib.js';

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

  const user = {
    id: userId,
    firstName: data.first_name || '',
    lastName: data.last_name || '',
    username: data.username || '',
    photoUrl: data.photo_url || '',
    xp: existing?.xp || 0,
    readBooks: existing?.readBooks || [],
    joinedAt: existing?.joinedAt || Date.now(),
    lastLoginAt: Date.now(),
  };

  await env.MHP_KV.put(key, JSON.stringify(user));

  const token = await createSessionToken(userId, env.SESSION_SECRET);

  return json({ ok: true, user }, {
    headers: { 'Set-Cookie': sessionCookieHeader(token) },
  });
}
