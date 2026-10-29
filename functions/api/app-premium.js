// GET /api/app-premium   Authorization: Bearer <sessiya tokeni>
// Ilova ochilganda Premium (kanal a'zoligi) holatini qayta tekshiradi: kanaldan chiqib ketgan bo'lsa, Premium o'chadi.

import { verifySessionToken, json } from '../_lib.js';
import { isChannelMember } from './app-login-complete.js';

export async function onRequestGet({ request, env }) {
  if (!env.BOT_TOKEN || !env.SESSION_SECRET) return json({ ok: false, error: 'Server sozlanmagan' }, { status: 500 });
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const userId = await verifySessionToken(token, env.SESSION_SECRET);
  if (!userId) return json({ ok: false, error: 'unauthorized' }, { status: 401 });
  return json({ ok: true, premium: await isChannelMember(env, userId) });
}
