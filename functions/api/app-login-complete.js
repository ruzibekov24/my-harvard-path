// POST /api/app-login-complete
// Mobil ilovadagi "Telegram orqali kirish": brauzerdagi /app-login.html sahifasi Telegram Login Widget natijasini
// va ilova bergan bir martalik `code` ni shu yerga yuboradi. Biz HMAC bilan tekshiramiz, kanal a'zoligini
// (Premium) Bot API orqali aniqlaymiz va natijani 10 daqiqaga KV'ga yozamiz; ilova uni /api/app-login-check orqali oladi.
//
// Kerak: BOT_TOKEN, SESSION_SECRET, MHP_KV (SETUP-LOGIN.md dagidek). Kanal a'zoligini tekshirish uchun bot
// premium kanalda administrator bo'lishi kerak. Ixtiyoriy: PREMIUM_CHANNEL (default @MyHarvardPath).

import { verifyTelegramAuth, createSessionToken, json } from '../_lib.js';

export async function isChannelMember(env, userId) {
  const channel = env.PREMIUM_CHANNEL || '@MyHarvardPath';
  try {
    const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/getChatMember?chat_id=${encodeURIComponent(channel)}&user_id=${encodeURIComponent(userId)}`);
    const j = await r.json();
    if (!j.ok) return false;
    const st = j.result && j.result.status;
    if (st === 'creator' || st === 'administrator' || st === 'member') return true;
    return st === 'restricted' && j.result.is_member === true;
  } catch (e) {
    return false;
  }
}

export async function onRequestPost({ request, env }) {
  if (!env.BOT_TOKEN || !env.SESSION_SECRET || !env.MHP_KV) return json({ ok: false, error: 'Server sozlanmagan' }, { status: 500 });

  let body;
  try { body = await request.json(); } catch (e) { return json({ ok: false, error: 'bad json' }, { status: 400 }); }

  const code = String(body.code || '');
  if (!/^[a-f0-9]{16,64}$/.test(code)) return json({ ok: false, error: 'bad code' }, { status: 400 });

  const auth = body.auth;
  if (!auth || !(await verifyTelegramAuth(auth, env.BOT_TOKEN))) return json({ ok: false, error: 'Telegram tasdiqlash muvaffaqiyatsiz' }, { status: 401 });
  if (Date.now() / 1000 - Number(auth.auth_date || 0) > 600) return json({ ok: false, error: 'Muddati o\'tgan' }, { status: 401 });

  const userId = String(auth.id);
  const premium = await isChannelMember(env, userId);
  const token = await createSessionToken(userId, env.SESSION_SECRET);

  await env.MHP_KV.put(
    `applogin:${code}`,
    JSON.stringify({
      id: userId,
      name: [auth.first_name, auth.last_name].filter(Boolean).join(' '),
      username: auth.username || '',
      photo: auth.photo_url || '',
      premium,
      token,
    }),
    { expirationTtl: 600 }
  );
  return json({ ok: true, premium });
}
