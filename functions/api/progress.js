import { getCookie, verifySessionToken, json } from '../_lib.js';

/* XP manbalari. Avval faqat kitob o'qish bor edi — endi har bir turdagi
   faoliyat o'z ballini beradi. Yangi manba qo'shish uchun shu jadvalga
   bitta qator qo'shish kifoya (va mos `list` nomi user obyektida). */
export const XP_RULES = {
  book:      { xp: 10, list: 'readBooks' },
  checklist: { xp: 25, list: 'checklist' },
  vocab:     { xp: 5,  list: 'vocabSets' },
};

/** Eski foydalanuvchi obyektlarida yangi ro'yxatlar bo'lmasligi mumkin. */
export function normalizeUser(user) {
  user.readBooks = user.readBooks || [];
  user.checklist = user.checklist || [];
  user.vocabSets = user.vocabSets || [];
  user.streak = user.streak || { count: 0, best: 0, lastDay: null };
  user.xp = typeof user.xp === 'number' ? user.xp : 0;
  return user;
}

/** XP'ni ro'yxatlardan qayta hisoblaydi — streak XP'si alohida saqlanadi. */
export function recomputeXp(user) {
  let total = user.streakXp || 0;
  for (const { xp, list } of Object.values(XP_RULES)) {
    total += (user[list]?.length || 0) * xp;
  }
  return total;
}

// POST /api/progress
// Body: { type: "book" | "checklist" | "vocab", itemId: "beginner-01", done: true }
// Eski format ham ishlaydi: { bookId: "...", read: true }
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

  // Orqaga moslik: eski mijoz { bookId, read } yuboradi.
  const type = body.type || (body.bookId ? 'book' : null);
  const itemId = body.itemId || body.bookId;
  const done = body.done !== undefined ? body.done : body.read;

  const rule = XP_RULES[type];
  if (!rule) return json({ ok: false, error: "Noma'lum tur" }, { status: 400 });
  if (!itemId) return json({ ok: false, error: 'itemId kerak' }, { status: 400 });

  const key = `user:${userId}`;
  const raw = await env.MHP_KV.get(key);
  if (!raw) return json({ ok: false, error: 'Foydalanuvchi topilmadi' }, { status: 404 });
  const user = normalizeUser(JSON.parse(raw));

  const list = user[rule.list];
  const already = list.includes(itemId);
  if (done && !already) {
    list.push(itemId);
  } else if (!done && already) {
    user[rule.list] = list.filter((id) => id !== itemId);
  }

  user.xp = recomputeXp(user);
  await env.MHP_KV.put(key, JSON.stringify(user));
  return json({ ok: true, user });
}
