import { getCookie, verifySessionToken, json } from '../_lib.js';

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
  return json({ ok: true, user: JSON.parse(raw) });
}
