// GET /api/app-login-check?code=...   (ilova har ikki soniyada so'raydi)
// Telegram orqali tasdiqlangan bo'lsa, foydalanuvchi ma'lumoti va sessiya tokenini bir marta qaytaradi.

import { json } from '../_lib.js';

export async function onRequestGet({ request, env }) {
  if (!env.MHP_KV) return json({ ok: false, error: 'Server sozlanmagan' }, { status: 500 });
  const code = new URL(request.url).searchParams.get('code') || '';
  if (!/^[a-f0-9]{16,64}$/.test(code)) return json({ ok: false, error: 'bad code' }, { status: 400 });

  const raw = await env.MHP_KV.get(`applogin:${code}`);
  if (!raw) return json({ ok: false, pending: true });
  await env.MHP_KV.delete(`applogin:${code}`); // bir martalik
  return json({ ok: true, user: JSON.parse(raw) });
}
