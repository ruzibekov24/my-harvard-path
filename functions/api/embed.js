// GET /api/embed?u=<maqola havolasi>: hamkor maqolaning faqat o'zini (sarlavha, rasm, matn) qaytaradi.
// Faqat ruxsat etilgan manbalar; HTML emas, tozalangan matn qaytadi, shuning uchun sahifada boshqa havolalar yoki skriptlar bo'lmaydi.

const ALLOWED = ['sirdaryo24.uz'];

const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), { status, headers: Object.assign({ 'content-type': 'application/json; charset=utf-8' }, extra) });

const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ', '&rsquo;': '’', '&lsquo;': '‘', '&ldquo;': '“', '&rdquo;': '”' };
const text = (h) =>
  String(h || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&(?:amp|lt|gt|quot|#39|nbsp|rsquo|lsquo|ldquo|rdquo);/g, (m) => ENT[m] || m)
    .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(Number(n)))
    .replace(/[ \t]+/g, ' ')
    .trim();

export async function onRequestGet({ request }) {
  const u = new URL(request.url).searchParams.get('u') || '';
  let target;
  try { target = new URL(u); } catch (e) { return json({ error: 'bad url' }, 400); }
  if (target.protocol !== 'https:' || ALLOWED.indexOf(target.hostname.replace(/^www\./, '')) === -1) return json({ error: 'forbidden' }, 403);

  let html;
  try {
    const res = await fetch(target.toString(), { headers: { 'user-agent': 'Mozilla/5.0 (compatible; MyHarvardPathBot/1.0)', accept: 'text/html' }, cf: { cacheTtl: 3600, cacheEverything: true } });
    if (!res.ok) return json({ error: 'upstream' }, 502);
    html = await res.text();
  } catch (e) { return json({ error: 'upstream' }, 502); }

  const a0 = html.indexOf('<article');
  const a1 = html.indexOf('</article>', a0);
  if (a0 < 0 || a1 < 0) return json({ error: 'parse' }, 502);
  const art = html.slice(a0, a1);

  const h1 = art.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const img = art.match(/<img[^>]+src="(https:\/\/[^"]+)"/i);
  const date = art.match(/Chop etilgan[\s\S]*?<span[^>]*>\s*([^<]+?)\s*<\/span>\s*<\/div>/i);
  const afterH1 = h1 ? art.slice(art.indexOf(h1[0]) + h1[0].length) : art;
  const end = afterH1.indexOf('Teglar');
  const body = end > -1 ? afterH1.slice(0, end) : afterH1;
  const paras = [];
  const re = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(body))) { let t = text(m[1]); if (t.indexOf('Ulashish') > -1) t = t.slice(t.lastIndexOf('Ulashish') + 8); t = t.replace(/\s+/g, ' ').trim(); if (t) paras.push(t.slice(0, 2000)); if (paras.length > 60) break; }
  if (!h1 || !paras.length) return json({ error: 'parse' }, 502);

  const imgUrl = img && ALLOWED.indexOf(new URL(img[1]).hostname.replace(/^www\./, '')) > -1 ? img[1] : '';
  return json(
    { title: text(h1[1]).slice(0, 200), image: imgUrl, date: date ? text(date[1]).slice(0, 40) : '', paragraphs: paras, source: target.hostname, url: target.toString() },
    200,
    { 'cache-control': 'public, max-age=1800' },
  );
}
