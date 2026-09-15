import { getCookie, verifySessionToken, json } from '../_lib.js';
import { normalizeUser, XP_RULES } from './progress.js';

// GET /api/me — joriy foydalanuvchini qaytaradi (agar kirgan bo'lsa)
export async function onRequestGet({ request, env }) {
  if (!env.SESSION_SECRET || !env.MHP_KV) {
    return json({ ok: false, error: 'Server sozlanmagan' }, { status: 500 });
  }
  const token = getCookie(request, 'mhp_session');
  const userId = await verifySessionToken(token, env.SESSION_SECRET);
  if (!userId) {
    return json({ ok: false, user: null }, { status: 200 });
  }
  const raw = await env.MHP_KV.get(`user:${userId}`);
  if (!raw) return json({ ok: false, user: null });

  const user = normalizeUser(JSON.parse(raw));
  // XP qayerdan kelgani — profil sahifasi shuni ko'rsatadi
  const breakdown = {
    streak: user.streakXp || 0,
    ...Object.fromEntries(
      Object.entries(XP_RULES).map(([type, { xp, list }]) => [type, (user[list]?.length || 0) * xp])
    ),
  };
  return json({ ok: true, user, breakdown });
}
