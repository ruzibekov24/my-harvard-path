import { sessionCookieHeader, json } from '../_lib.js';

// POST /api/logout
export async function onRequestPost() {
  return json({ ok: true }, {
    headers: { 'Set-Cookie': sessionCookieHeader('', { clear: true }) },
  });
}
