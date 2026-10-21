// GET /api/channel?before=<postId>
// @MyHarvardPath kanalining ochiq postlarini (t.me/s/MyHarvardPath) o'qib, saytda Telegram uslubida ko'rsatish uchun
// tozalangan JSON qaytaradi. Bot tokeni kerak emas: faqat kanalning ochiq veb-ko'rinishi ishlatiladi.
// Natija Cloudflare keshida 5 daqiqa saqlanadi.

const CHANNEL = 'MyHarvardPath';
const TTL = 300;

const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
const decode = (s) => String(s || '').replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (m) => ENT[m]).replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16)));
const plain = (h) => decode(String(h || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).trim();

// Xabar matnidagi HTML'ni xavfsiz kichik to'plamga qisqartiramiz (b, i, u, s, a, code, pre, blockquote, br, spoiler).
function cleanHtml(h) {
  if (!h) return '';
  let s = String(h)
    // Telegram emoji rasmlari -> oddiy emoji belgisi
    .replace(/<i class="emoji"[^>]*><b>([\s\S]*?)<\/b><\/i>/g, '$1')
    .replace(/<tg-emoji[^>]*>([\s\S]*?)<\/tg-emoji>/g, '$1');
  const allowed = { b: 1, strong: 1, i: 1, em: 1, u: 1, s: 1, del: 1, code: 1, pre: 1, blockquote: 1, br: 1, a: 1 };
  s = s.replace(/<(\/?)([a-z0-9-]+)([^>]*)>/gi, (m, close, tag, attrs) => {
    tag = tag.toLowerCase();
    if (tag === 'span' && /tg-spoiler/.test(attrs) && !close) return '<span class="tg-spoiler">';
    if (tag === 'span' && close) return '</span>';
    if (!allowed[tag]) return '';
    if (close) return '</' + tag + '>';
    if (tag === 'br') return '<br>';
    if (tag === 'a') {
      const href = (attrs.match(/href="([^"]+)"/) || [])[1] || '';
      const url = decode(href);
      if (!/^(https?:|tg:)/i.test(url) && !url.startsWith('/')) return '<a>';
      const full = url.startsWith('/') ? 'https://t.me' + url : url;
      return '<a href="' + full.replace(/"/g, '&quot;') + '" target="_blank" rel="noopener nofollow">';
    }
    return '<' + tag + '>';
  });
  // ochiq qolgan span'larni yopish
  const opens = (s.match(/<span class="tg-spoiler">/g) || []).length, closes = (s.match(/<\/span>/g) || []).length;
  if (closes > opens) { let extra = closes - opens; s = s.replace(/<\/span>/g, (m) => (extra-- > 0 ? '' : m)); }
  // <br> bor bo'lsa, HTML ichidagi oddiy yangi qatorlar ortiqcha bo'sh qator beradi
  if (/<br>/.test(s)) s = s.replace(/\n+/g, '');
  return s.trim();
}

function between(src, startRe, endStr) {
  const m = src.match(startRe);
  if (!m) return null;
  const from = m.index + m[0].length;
  const to = src.indexOf(endStr, from);
  return to < 0 ? null : src.slice(from, to);
}

// <div class="tgme_widget_message_text ..."> ... </div> ichki div'lari bo'lishi mumkin: chuqurlik bo'yicha yopilishini topamiz
function divInner(src, classRe) {
  const m = src.match(new RegExp('<div class="[^"]*' + classRe + '[^"]*"[^>]*>'));
  if (!m) return null;
  let i = m.index + m[0].length, depth = 1;
  const re = /<\/?div\b[^>]*>/g;
  re.lastIndex = i;
  let t;
  while ((t = re.exec(src))) {
    depth += t[0][1] === '/' ? -1 : 1;
    if (depth === 0) return src.slice(i, t.index);
  }
  return null;
}

function parsePost(block) {
  const post = (block.match(/data-post="[^/]+\/(\d+)"/) || [])[1];
  if (!post) return null;
  const out = { id: +post, url: 'https://t.me/' + CHANNEL + '/' + post };
  out.date = (block.match(/<time datetime="([^"]+)"/) || [])[1] || null;
  out.views = plain((block.match(/tgme_widget_message_views">([^<]*)</) || [])[1] || '');
  out.edited = /tgme_widget_message_meta">\s*edited/.test(block);
  const text = divInner(block, 'tgme_widget_message_text');
  out.html = cleanHtml(text);
  // rasmlar (albom ham)
  out.photos = [];
  const pr = /tgme_widget_message_photo_wrap[^"]*"[^>]*?style="([^"]*)"/g;
  let m;
  while ((m = pr.exec(block))) {
    const u = (m[1].match(/background-image:url\('([^']+)'\)/) || [])[1];
    const w = +((m[1].match(/width:(\d+)px/) || [])[1] || 0), h = +((m[1].match(/height:(\d+)px/) || [])[1] || 0);
    if (u) out.photos.push({ src: u.startsWith('//') ? 'https:' + u : u, w, h });
  }
  const ratio = (block.match(/tgme_widget_message_photo"[^>]*style="padding-top:([\d.]+)%/) || [])[1];
  if (ratio && out.photos.length === 1) out.photos[0].ratio = +ratio;
  // video
  const vsrc = (block.match(/<video[^>]+src="([^"]+)"/) || [])[1];
  const vthumb = (block.match(/tgme_widget_message_video_thumb"[^>]*background-image:url\('([^']+)'\)/) || [])[1];
  if (vsrc || vthumb) out.video = { src: vsrc || null, thumb: vthumb || null, duration: plain((block.match(/message_video_duration[^>]*>([^<]*)</) || [])[1] || '') };
  // stiker
  const sticker = (block.match(/tgme_widget_message_sticker[^"]*"[^>]*?(?:data-webp|style="[^"]*background-image:url\(')([^'"]+)/) || [])[1];
  if (sticker) out.sticker = sticker;
  // ovozli xabar
  if (/tgme_widget_message_voice/.test(block)) out.voice = { duration: plain((block.match(/message_voice_duration[^>]*>([^<]*)</) || [])[1] || '') };
  // javob (reply)
  const reply = between(block, /<a class="tgme_widget_message_reply"[^>]*>/, '</a>');
  if (reply) out.reply = { name: plain((reply.match(/message_author_name">([\s\S]*?)<\/span>/) || [])[1] || ''), text: plain(divInner(reply, 'tgme_widget_message_text') || (reply.match(/message_metatext[^>]*>([\s\S]*?)<\/div>/) || [])[1] || '').slice(0, 160) };
  // forward
  const fwd = (block.match(/tgme_widget_message_forwarded_from_name"[^>]*>([\s\S]*?)<\/(?:a|span)>/) || [])[1];
  if (fwd) out.forwarded = plain(fwd);
  // havola ko'rinishi
  const lp = between(block, /<a class="tgme_widget_message_link_preview"[^>]*>/, '</a>');
  if (lp) {
    out.preview = {
      url: decode((block.match(/<a class="tgme_widget_message_link_preview" href="([^"]+)"/) || [])[1] || ''),
      site: plain((lp.match(/link_preview_site_name[^>]*>([\s\S]*?)<\/div>/) || [])[1] || ''),
      title: plain((lp.match(/link_preview_title[^>]*>([\s\S]*?)<\/div>/) || [])[1] || ''),
      desc: plain((lp.match(/link_preview_description[^>]*>([\s\S]*?)<\/div>/) || [])[1] || '').slice(0, 300),
      image: (lp.match(/background-image:url\('([^']+)'\)/) || [])[1] || null,
    };
  }
  // reaksiyalar
  out.reactions = [];
  const rr = /<span class="tgme_reaction[^"]*">([\s\S]*?)<\/span>/g;
  while ((m = rr.exec(block))) {
    const emoji = (m[1].match(/<b>([\s\S]*?)<\/b>/) || [])[1] || '';
    const count = plain(m[1].replace(/<i[\s\S]*?<\/i>/g, ''));
    if (emoji || count) out.reactions.push({ emoji: plain(emoji), count });
  }
  // qo'llab-quvvatlanmagan turlar (so'rovnoma va h.k.)
  out.unsupported = !out.html && !out.photos.length && !out.video && !out.sticker && !out.voice;
  return out;
}

function parseChannel(html) {
  const info = {
    title: plain((html.match(/tgme_channel_info_header_title"><span[^>]*>([\s\S]*?)<\/span>/) || [])[1] || 'MyHarvardPath'),
    username: CHANNEL,
    avatar: ((html.match(/tgme_page_photo_image[^>]*>\s*<img src="([^"]+)"/) || [])[1]) || null,
    description: cleanHtml(divInner(html, 'tgme_channel_info_description') || ''),
    counters: {},
  };
  const cr = /tgme_channel_info_counter"><span class="counter_value">([^<]+)<\/span>\s*<span class="counter_type">([^<]+)<\/span>/g;
  let m;
  while ((m = cr.exec(html))) info.counters[m[2].trim()] = m[1].trim();
  const parts = html.split('<div class="tgme_widget_message_wrap').slice(1);
  const posts = parts.map(parsePost).filter(Boolean);
  return { channel: info, posts };
}

export async function onRequestGet({ request, waitUntil }) {
  const url = new URL(request.url);
  const before = url.searchParams.get('before');
  if (before && !/^\d{1,9}$/.test(before)) return new Response('{"error":"bad before"}', { status: 400 });
  const cacheKey = new Request(url.origin + '/api/channel' + (before ? '?before=' + before : ''));
  const cache = caches.default;
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  let html;
  try {
    const res = await fetch('https://t.me/s/' + CHANNEL + (before ? '?before=' + before : ''), {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; MyHarvardPathBot/1.0)', 'accept-language': 'en' },
    });
    if (!res.ok) return new Response(JSON.stringify({ error: 'upstream', status: res.status }), { status: 502, headers: { 'content-type': 'application/json' } });
    html = await res.text();
  } catch (e) {
    return new Response('{"error":"upstream"}', { status: 502, headers: { 'content-type': 'application/json' } });
  }
  const data = parseChannel(html);
  const resp = new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=' + TTL },
  });
  waitUntil(cache.put(cacheKey, resp.clone()));
  return resp;
}

// Node'da sinash uchun
export { parseChannel };
