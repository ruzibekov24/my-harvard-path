// Umumiy yordamchi funksiyalar — barcha /functions/api/*.js fayllari shundan foydalanadi.

// ---- Hex yordamchilari ----
function bufToHex(buf) {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Bytes(input) {
  const enc = new TextEncoder().encode(input);
  return await crypto.subtle.digest('SHA-256', enc);
}

async function hmacSha256Hex(keyBytes, message) {
  const key = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return bufToHex(sig);
}

// ---- Telegram Login Widget tekshiruvi ----
// https://core.telegram.org/widgets/login#checking-authorization
export async function verifyTelegramAuth(data, botToken) {
  const { hash, ...rest } = data;
  if (!hash) return false;

  const checkString = Object.keys(rest)
    .filter(k => rest[k] !== undefined && rest[k] !== null)
    .sort()
    .map(k => `${k}=${rest[k]}`)
    .join('\n');

  const secretKey = await sha256Bytes(botToken); // ArrayBuffer
  const computedHash = await hmacSha256Hex(secretKey, checkString);

  if (computedHash !== hash) return false;

  // auth_date 24 soatdan eski bo'lmasin
  const authDate = Number(rest.auth_date || 0);
  const now = Math.floor(Date.now() / 1000);
  if (!authDate || now - authDate > 86400) return false;

  return true;
}

// ---- Sessiya tokeni (imzolangan, KV'siz ham tekshirish mumkin) ----
export async function createSessionToken(userId, secret) {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 30; // 30 kun
  const payload = `${userId}.${exp}`;
  const sigKey = await sha256Bytes(secret);
  const sig = await hmacSha256Hex(sigKey, payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token, secret) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [userId, exp, sig] = parts;
  const payload = `${userId}.${exp}`;
  const sigKey = await sha256Bytes(secret);
  const expected = await hmacSha256Hex(sigKey, payload);
  if (expected !== sig) return null;
  if (Date.now() > Number(exp)) return null;
  return userId;
}

export function getCookie(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function sessionCookieHeader(token, { clear = false } = {}) {
  const maxAge = clear ? 0 : 60 * 60 * 24 * 30;
  const value = clear ? '' : token;
  return `mhp_session=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
}
