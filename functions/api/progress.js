import { getCookie, verifySessionToken, json } from '../_lib.js';

const XP_PER_BOOK = 10;

// POST /api/progress
// Body: { bookId: "beginner-01", read: true }
export async function onRequestPost({ request, env }) {
  if (!env.SESSION_SECRET || !env.MHP_KV) {
    return json({ ok: false, error: 'Server sozlanmagan' }, { status: 500 });
  }
  const token = getCookie(request, 'mhp_session');
  const userId = await verifySessionToken(token, env.SESSION_SECRET);
  if (!userId) {
    return json({ ok: false, error: 'Kirish talab qilinadi' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Noto'g'ri so'rov" }, { status: 400 });
  }
  const { bookId, read } = body;
  if (!bookId) return json({ ok: false, error: 'bookId kerak' }, { status: 400 });

  const key = `user:${userId}`;
  const raw = await env.MHP_KV.get(key);
  if (!raw) return json({ ok: false, error: 'Foydalanuvchi topilmadi' }, { status: 404 });
  const user = JSON.parse(raw);

  const already = user.readBooks.includes(bookId);
  if (read && !already) {
    user.readBooks.push(bookId);
    user.xp += XP_PER_BOOK;
  } else if (!read && already) {
    user.readBooks = user.readBooks.filter(id => id !== bookId);
    user.xp = Math.max(0, user.xp - XP_PER_BOOK);
  }

  await env.MHP_KV.put(key, JSON.stringify(user));
  return json({ ok: true, user });
}
