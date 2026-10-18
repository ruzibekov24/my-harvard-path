/* Rizqulloh English — o'quvchi bo'limi (saytdagi ilova).
   Ma'lumot Rizqulloh English botining Worker'idan olinadi (/site/api/*). Kirish: botdagi /sayt tugmasi bergan havola (#t=...) sessiyaga
   almashtiriladi va brauzerda saqlanadi. Bot tokeni saytda hech qachon bo'lmaydi. */
(function () {
  'use strict';

  const API = 'https://rizqulloh-bot.ilyosbek41624.workers.dev/site/api/';
  const BOT_URL = 'https://t.me/Rizqulloh_bot';
  const KEY = 'rz_session';
  const root = document.getElementById('rz-app');
  if (!root) return;

  // ---------- yordamchilar ----------
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => Number(n || 0).toLocaleString('en-US').replace(/,/g, ' ');
  const CDN = 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.1.2/img/apple/64/';
  const EMOJI_RE = /\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|\p{Emoji_Modifier})*|[\u{1F1E6}-\u{1F1FF}]{2}/gu;

  /** Emoji belgisi -> iOS (Apple) rasmi. Fayl nomi fe0f bilan yoki fe0fsiz bo'lishi mumkin: xato bo'lsa ikkinchisini sinaydi. */
  function emo(ch, size) {
    const u = [...ch].map(c => c.codePointAt(0).toString(16)).join('-');
    const alt = u.indexOf('-fe0f') > -1 ? u.replace(/-fe0f/g, '') : u + '-fe0f';
    return '<img class="rz-emo" src="' + CDN + u + '.png" alt="' + esc(ch) + '" width="' + (size || 20) + '" height="' + (size || 20) + '" data-alt="' + alt + '" onerror="rzEmoErr(this)">';
  }
  window.rzEmoErr = function (img) {
    if (img.dataset.alt) { img.src = CDN + img.dataset.alt + '.png'; delete img.dataset.alt; }
    else img.replaceWith(document.createTextNode(img.alt));
  };
  /** Matn ichidagi emojilarni rasmga aylantiradi (qolgan matn xavfsiz holatda). */
  function rich(text, size) {
    const s = String(text == null ? '' : text); let out = '', last = 0, m;
    EMOJI_RE.lastIndex = 0;
    while ((m = EMOJI_RE.exec(s))) { out += esc(s.slice(last, m.index)) + emo(m[0], size || 18); last = m.index + m[0].length; }
    return out + esc(s.slice(last));
  }

  let token = null;
  try { token = localStorage.getItem(KEY); } catch (e) { /* xotira yopiq bo'lsa ham ishlayveradi */ }
  const save = t => { token = t; try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch (e) {} };

  async function api(path, opts) {
    opts = opts || {};
    const res = await fetch(API + path, {
      method: opts.method || (opts.body ? 'POST' : 'GET'),
      headers: Object.assign({ 'content-type': 'application/json' }, token ? { authorization: 'Bearer ' + token } : {}),
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 || res.status === 403) { if (token) { save(null); } const e = new Error('auth'); e.auth = true; throw e; }
    if (!res.ok) { const e = new Error(data.error || 'xatolik'); e.status = res.status; e.data = data; throw e; }
    return data;
  }

  // ---------- umumiy UI ----------
  let toastTimer = 0;
  function toast(msg) {
    let t = document.getElementById('rz-toast');
    if (!t) { t = document.createElement('div'); t.id = 'rz-toast'; t.className = 'rz-toast'; document.body.appendChild(t); }
    t.innerHTML = rich(msg); t.classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 2600);
  }
  const loading = () => '<div class="rz-loading"><span></span><span></span><span></span></div>';
  const failBox = msg => '<div class="rz-card rz-center"><p>' + rich(msg || "Yuklab bo'lmadi. Internetni tekshirib, qayta urinib ko'ring.") + '</p><button class="btn-primary" onclick="location.reload()">Qayta urinish</button></div>';
  const bar = r => '<div class="rz-bar"><i style="width:' + Math.max(2, Math.min(100, Math.round(r * 100))) + '%"></i></div>';

  const ic = d => '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  const TABS = [
    { id: 'home', label: 'Bosh', svg: ic('<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>') },
    { id: 'review', label: "O'rganish", svg: ic('<path d="M12 6c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13C17 4 14 4.500 12 6zM12 6v13"/>') },
    { id: 'play', label: "O'yin", svg: ic('<rect x="3" y="7" width="18" height="11" rx="5.500"/><path d="M8 10.500v4M6 12.500h4M15.500 11.500h.01M17.500 13.500h.01"/>') },
    { id: 'board', label: 'Reyting', svg: ic('<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.500a3 3 0 0 0 3.500 4M16 6h3.500a3 3 0 0 1-3.500 4M12 13v4M8.500 20h7M10 17h4"/>') },
    { id: 'shop', label: "Do'kon", svg: ic('<path d="M5 8h14l-1 12H6zM9 8V7a3 3 0 0 1 6 0v1"/>') },
    { id: 'profile', label: 'Profil', svg: ic('<circle cx="12" cy="8" r="4"/><path d="M4.500 20a7.500 7.500 0 0 1 15 0"/>') },
  ];

  function shell() {
    const tab = t => '<a href="#/' + t.id + '" data-tab="' + t.id + '" aria-label="' + t.label + '">' + t.svg + '<span>' + t.label + '</span></a>';
    root.innerHTML =
      '<div class="rz-wrap"><div id="rz-view" class="rz-view"></div></div>' +
      '<nav class="rz-tabs" id="rz-tabs" aria-label="Rizqulloh English bo&#39;limlari"><div class="rz-tabs-main"><i class="rz-ind"></i>' +
      TABS.slice(0, 5).map(tab).join('') + '</div>' + '<div class="rz-tabs-side">' + tab(TABS[5]) + '</div></nav>';
  }
  const view = () => document.getElementById('rz-view');
  function setActive(id) {
    const main = document.querySelector('.rz-tabs-main');
    let hit = null;
    document.querySelectorAll('#rz-tabs a').forEach(a => { const on = a.dataset.tab === id; a.classList.toggle('on', on); if (on && main && main.contains(a)) hit = a; });
    const ind = main && main.querySelector('.rz-ind');
    if (!ind) return;
    if (!hit) { ind.style.opacity = 0; return; }
    ind.style.opacity = 1;
    if (ind.dataset.x && ind.dataset.x !== String(hit.offsetLeft)) { ind.classList.remove('go'); void ind.offsetWidth; ind.classList.add('go'); }
    ind.dataset.x = hit.offsetLeft;
    ind.style.width = hit.offsetWidth + 'px';
    ind.style.transform = 'translateX(' + hit.offsetLeft + 'px)';
  }
  window.addEventListener('resize', () => { const a = document.querySelector('.rz-tabs-main a.on'); if (a) setActive(a.dataset.tab); });

  // ---------- kirish ekrani ----------
  function loginScreen(note) {
    root.innerHTML =
      '<div class="rz-wrap rz-login"><div class="rz-card rz-center rz-hero-card">' +
      emo('🎓', 64) +
      '<h1>Rizqulloh English</h1>' +
      '<p class="rz-lead">Botda to\'plagan XP, streak va o\'yinlaringiz shu yerda ham. Kirish uchun botdan bir marta havola oling.</p>' +
      (note ? '<p class="rz-note">' + rich(note) + '</p>' : '') +
      '<div id="rz-widget" class="rz-widget"></div><p class="rz-or">yoki botdan havola orqali</p>' +
      '<ol class="rz-steps"><li>Telegramda <b>@Rizqulloh_bot</b> ni oching</li><li><code>/sayt</code> buyrug\'ini yuboring</li><li><b>Saytni ochish</b> tugmasini bosing</li></ol>' +
      '<a class="btn-primary" href="' + BOT_URL + '" target="_blank" rel="noopener">Botni ochish</a>' +
      '</div></div>';
    const slot = document.getElementById('rz-widget');
    if (slot && window.onTelegramAuth) {
      const sc = document.createElement('script');
      sc.async = true; sc.src = 'https://telegram.org/js/telegram-widget.js?22';
      sc.setAttribute('data-telegram-login', 'Rizqulloh_bot'); sc.setAttribute('data-size', 'large'); sc.setAttribute('data-radius', '20');
      sc.setAttribute('data-onauth', 'onTelegramAuth(user)'); sc.setAttribute('data-request-access', 'write');
      slot.appendChild(sc);
    }
  }

  // ---------- Bosh ----------
  async function renderHome() {
    const d = await api('me');
    const u = d.user, p = u.progress;
    view().innerHTML =
      '<header class="rz-head"><div><p class="rz-eyebrow">' + rich(u.title) + '</p><h1>Salom, ' + esc(u.name || 'do\'st') + '!</h1></div></header>' +
      '<section class="rz-card rz-level"><div class="rz-level-top"><div class="rz-level-badge">' + u.level + '</div>' +
      '<div><b>' + fmt(u.xp) + ' XP</b><span>Keyingi darajagacha ' + fmt(p.toNext) + ' XP</span></div></div>' + bar(p.ratio) + '</section>' +
      '<section class="rz-grid">' +
      stat('🔥', u.streak, 'kun ketma-ket') + stat('📖', d.words.due, 'takrorlanadigan so\'z') +
      stat('🧠', d.words.learned, "o'rganilgan so'z") + stat('🏆', u.rank || '—', "umumiy o'rin") + '</section>' +
      '<section class="rz-cols">' +
      '<a class="rz-feature" href="#/play/galaxy"><span class="rz-new">YANGI · faqat saytda</span><b>So&#39;z galaktikasi</b><i>Botda o&#39;rgangan so&#39;zlaringiz yulduzlarga aylangan: ' + fmt(d.words.learned) + ' ta yulduz sizni kutmoqda.</i></a>' +
      link('play', '🎯', 'Kunlik viktorina', d.challenge.played ? 'Bugun ' + d.challenge.score + ' ball. Ertaga yangisi!' : 'Bugun hali o\'ynalmagan. XP yig\'ing!') +
      link('review', '📖', 'Takrorlash', d.words.due ? d.words.due + " ta so'z navbat kutmoqda" : "Hozircha takrorlanadigan so'z yo'q") +
      link('shop', '🛍️', "XP do'koni", 'Nishonlar, streak muzlatgich va sovg\'alar') +
      '</section>' +
      botCard();
  }
  const stat = (icon, n, label) => '<div class="rz-stat">' + emo(icon, 26) + '<b>' + esc(n) + '</b><span>' + label + '</span></div>';
  const link = (tab, icon, title, sub) => '<a class="rz-link rz-card" href="#/' + tab + '">' + emo(icon, 34) + '<div><b>' + title + '</b><span>' + sub + '</span></div></a>';
  const botCard = () => '<section class="rz-card rz-bot"><div>' + emo('✈️', 28) + '<b>Boshqa funksiyalar botda</b></div><p>Mafia, guruh o\'yinlari, ovozli talaffuz tekshiruvi va kanal yangiliklari Telegramning o\'zida ishlaydi.</p><a class="btn-ghost-dark" href="' + BOT_URL + '" target="_blank" rel="noopener">Botni ochish</a></section>';

  // ---------- O'rganish (takrorlash) ----------
  async function renderReview() {
    view().innerHTML = loading();
    let batch = (await api('review')).words, i = 0, flipped = false, gained = 0, done = 0;
    const draw = () => {
      if (!batch.length || i >= batch.length) {
        view().innerHTML = '<div class="rz-card rz-center">' + emo(done ? '🎉' : '✅', 56) + '<h2>' + (done ? 'Ajoyib!' : "Hozircha hammasi tayyor") + '</h2><p>' + (done ? done + " ta so'z takrorlandi, +" + gained + ' XP' : "Takrorlash uchun so'z yo'q. Yangi so'zlar botda o'rganiladi.") + '</p>' +
          (done ? '<button class="btn-primary" id="rz-more">Yana</button>' : '<a class="btn-primary" href="' + BOT_URL + '" target="_blank" rel="noopener">Botda yangi so\'z o\'rganish</a>') + '</div>';
        const more = document.getElementById('rz-more');
        if (more) more.onclick = renderReview;
        return;
      }
      const w = batch[i];
      view().innerHTML = '<header class="rz-head"><h1>Takrorlash</h1><span class="rz-pill">' + (i + 1) + ' / ' + batch.length + '</span></header>' +
        '<div class="rz-flash' + (flipped ? ' flip' : '') + '" id="rz-flash"><div class="rz-flash-in">' +
        '<div class="rz-face"><span class="rz-pos">' + esc(w.pos || '') + (w.cefr ? ' · ' + esc(w.cefr) : '') + '</span><h2>' + esc(w.headword) + '</h2><em>Aylantirish uchun bosing</em></div>' +
        '<div class="rz-face rz-back"><h2>' + esc(w.uz) + '</h2><p>' + esc(w.definition || '') + '</p><i>' + esc(w.example || '') + '</i></div></div></div>' +
        '<div class="rz-row"><button class="btn-ghost-dark" data-k="0">Bilmayman</button><button class="btn-primary" data-k="1">Bilaman</button></div>';
      document.getElementById('rz-flash').onclick = () => { flipped = !flipped; document.getElementById('rz-flash').classList.toggle('flip', flipped); };
      view().querySelectorAll('[data-k]').forEach(b => b.onclick = async () => {
        b.disabled = true;
        try {
          const r = await api('review', { body: { word_id: w.id, known: b.dataset.k === '1' } });
          if (r.ok) { done++; gained += r.xp || 0; }
        } catch (e) { if (e.auth) return start(); toast("Javob saqlanmadi. Qayta urinib ko'ring."); b.disabled = false; return; }
        i++; flipped = false; draw();
      });
    };
    draw();
  }

  // ---------- O'yin: kunlik viktorina + xotira ----------
  async function renderPlay() {
    view().innerHTML =
      '<header class="rz-head"><h1>O\'yinlar</h1></header>' +
      '<a class="rz-feature" href="#/play/galaxy"><span class="rz-new">YANGI · faqat saytda</span><b>So&#39;z galaktikasi</b><i>O&#39;rgangan har bir so&#39;zingiz galaktikada yulduz bo&#39;lib porlaydi. Yaqinlashtiring, bosing va talaffuzini eshiting.</i></a>' +
      '<section class="rz-cols"><a class="rz-link rz-card" href="#/play/challenge">' + emo('🎯', 34) + '<div><b>Kunlik viktorina</b><span>Har kuni bir marta, XP beradi</span></div></a>' +
      '<a class="rz-link rz-card" href="#/play/memory">' + emo('🧩', 34) + '<div><b>Xotira</b><span>So\'z juftliklarini toping (XPsiz mashq)</span></div></a></section>' + botCard();
  }

  async function renderChallenge() {
    view().innerHTML = loading();
    const d = await api('challenge');
    if (d.played) {
      view().innerHTML = '<div class="rz-card rz-center">' + emo('🏁', 56) + '<h2>Bugungi viktorina o\'ynalgan</h2><p>Natijangiz: <b>' + d.score + ' ball</b>. Ertaga yangi savollar!</p><a class="btn-primary" href="#/board">Reytingni ko\'rish</a></div>';
      return;
    }
    const qs = d.questions, answers = []; let i = 0;
    const draw = () => {
      if (i >= qs.length) return finish();
      const q = qs[i];
      view().innerHTML = '<header class="rz-head"><h1>Viktorina</h1><span class="rz-pill">' + (i + 1) + ' / ' + qs.length + '</span></header>' + bar(i / qs.length) +
        '<div class="rz-card rz-q"><h2>' + rich(q.prompt) + '</h2><div class="rz-opts">' + q.options.map((o, k) => '<button class="rz-opt" data-i="' + k + '">' + rich(o) + '</button>').join('') + '</div></div>';
      view().querySelectorAll('.rz-opt').forEach(b => b.onclick = () => { answers.push(Number(b.dataset.i)); i++; draw(); });
    };
    const finish = async () => {
      view().innerHTML = loading();
      try {
        const r = await api('challenge', { body: { answers } });
        view().innerHTML = '<div class="rz-card rz-center">' + emo('🎉', 56) + '<h2>' + r.score + ' / ' + r.n + '</h2><p>+' + r.xp + ' XP. Bugungi o\'rin: <b>' + r.place + '</b> / ' + r.total + '</p><a class="btn-primary" href="#/board">Reyting</a></div>';
      } catch (e) { view().innerHTML = failBox(e.status === 409 ? 'Bu viktorina allaqachon o\'ynalgan.' : null); }
    };
    draw();
  }

  async function renderMemory() {
    view().innerHTML = loading();
    const pairs = (await api('memory')).pairs;
    const tiles = [];
    pairs.forEach(p => { tiles.push({ id: p.id, t: p.en }); tiles.push({ id: p.id, t: p.uz }); });
    for (let k = tiles.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [tiles[k], tiles[j]] = [tiles[j], tiles[k]]; }
    let open = [], moves = 0, matched = 0, lock = false;
    view().innerHTML = '<header class="rz-head"><h1>Xotira</h1><span class="rz-pill" id="rz-moves">0 yurish</span></header><div class="rz-mem" id="rz-mem">' +
      tiles.map((t, k) => '<button class="rz-tile" data-k="' + k + '"><span>' + esc(t.t) + '</span></button>').join('') + '</div>';
    document.querySelectorAll('.rz-tile').forEach(b => b.onclick = () => {
      if (lock || b.classList.contains('up') || b.classList.contains('ok')) return;
      b.classList.add('up'); open.push(b);
      if (open.length < 2) return;
      moves++; document.getElementById('rz-moves').textContent = moves + ' yurish';
      const [a, c] = open; open = [];
      if (tiles[a.dataset.k].id === tiles[c.dataset.k].id) {
        a.classList.add('ok'); c.classList.add('ok'); matched++;
        if (matched === pairs.length) setTimeout(() => toast('🎉 Barcha juftliklar topildi: ' + moves + ' yurishda'), 300);
      } else { lock = true; setTimeout(() => { a.classList.remove('up'); c.classList.remove('up'); lock = false; }, 800); }
    });
  }

  // ---------- So'z galaktikasi (faqat saytda) ----------
  const CEFR_COL = { A1: '#8ecbff', A2: '#7ad7a6', B1: '#ffd36a', B2: '#ffa35c', C1: '#ff7a8a', C2: '#c08bff' };
  const hash = n => { let x = (n * 2654435761) >>> 0; x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13; return (x >>> 0) / 4294967296; };

  async function renderGalaxy() {
    view().innerHTML = loading();
    const d = await api('galaxy');
    const words = d.words;
    const pct = d.total ? Math.max(0.1, (words.length / d.total) * 100) : 0;
    view().innerHTML =
      '<header class="rz-head"><h1>So\'z galaktikasi</h1><span class="rz-pill">' + fmt(words.length) + ' yulduz</span></header>' +
      '<div class="rz-gal"><canvas id="rz-gal-cv"></canvas>' +
      '<div class="rz-gal-hud"><b>' + fmt(words.length) + '</b> / ' + fmt(d.total) + ' so\'z · ' + pct.toFixed(1) + '% kashf etildi</div>' +
      '<div class="rz-gal-zoom"><button data-z="1.3" aria-label="Kattalashtirish">+</button><button data-z="0.77" aria-label="Kichraytirish">−</button></div>' +
      '<div class="rz-gal-card" id="rz-gal-card" hidden></div></div>' +
      '<div class="rz-legend">' + Object.keys(CEFR_COL).map(k => '<span><i style="background:' + CEFR_COL[k] + '"></i>' + k + '</span>').join('') + '<span><i class="due"></i>takrorlash vaqti</span><span><i class="gold"></i>o\'zlashtirilgan</span></div>' +
      (words.length ? '' : '<p class="rz-center rz-hint">Hali yulduz yo\'q. Botda so\'z o\'rganing: har bir so\'z galaktikada yangi yulduzga aylanadi!</p>');

    const cv = document.getElementById('rz-gal-cv'), ctx = cv.getContext('2d');
    const card = document.getElementById('rz-gal-card');
    let W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
    let scale = 1, ox = 0, oy = 0, sel = null, drag = null, moved = false;
    const stars = words.map(w => {
      const arm = Math.floor(hash(w.id + 7) * 3), r = Math.pow(hash(w.id + 1), 0.62);
      const a = arm * 2.0944 + r * 5.2 + (hash(w.id + 3) - 0.5) * 0.9 * (1.1 - r);
      const off = (hash(w.id + 5) - 0.5) * 0.12;
      return { w, r, a, off, s: 1.6 + w.box * 0.7 + (w.mastered ? 1.2 : 0), ph: hash(w.id + 9) * 6.28 };
    });
    const bg = Array.from({ length: 90 }, (_, i) => ({ x: hash(i + 500), y: hash(i + 900), s: hash(i + 1300) }));
    const resize = () => {
      const b = cv.parentElement.getBoundingClientRect();
      W = b.width; H = b.height; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const R = () => Math.min(W, H) * 0.46 * scale;
    const pos = (s, t) => { const a = s.a + t * (0.015 / (0.3 + s.r)); const rr = (s.r + s.off) * R(); return [W / 2 + ox + Math.cos(a) * rr, H / 2 + oy + Math.sin(a) * rr * 0.72]; };

    let alive = true, t0 = performance.now();
    const draw = now => {
      if (!alive || !cv.isConnected) { alive = false; return; }
      const t = (now - t0) / 1000;
      const g = ctx.createRadialGradient(W / 2 + ox, H / 2 + oy, 0, W / 2 + ox, H / 2 + oy, R() * 1.1);
      g.addColorStop(0, '#2b1f5c'); g.addColorStop(0.45, '#120d33'); g.addColorStop(1, '#05030f');
      ctx.fillStyle = '#05030f'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      bg.forEach(b => { ctx.globalAlpha = 0.25 + 0.5 * Math.abs(Math.sin(t * 0.6 + b.s * 9)); ctx.fillStyle = '#fff'; ctx.fillRect(b.x * W, b.y * H, 1.2, 1.2); });
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'lighter';
      stars.forEach(s => {
        const [x, y] = pos(s, t); s._x = x; s._y = y;
        if (x < -20 || y < -20 || x > W + 20 || y > H + 20) return;
        const col = CEFR_COL[s.w.cefr] || '#fff';
        const pulse = s.w.due ? 1 + 0.35 * Math.sin(t * 3 + s.ph) : 1;
        const rad = s.s * Math.sqrt(scale) * pulse;
        const gr = ctx.createRadialGradient(x, y, 0, x, y, rad * 3.2);
        gr.addColorStop(0, col); gr.addColorStop(0.25, col + '55'); gr.addColorStop(1, col + '00');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, rad * 3.2, 0, 6.283); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, rad * 0.6, 0, 6.283); ctx.fill();
        if (s.w.mastered) { ctx.strokeStyle = '#ffd60a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, rad * 1.8, 0, 6.283); ctx.stroke(); }
        if (s.w.due) { ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, rad * (2.2 + 0.6 * Math.sin(t * 3 + s.ph)), 0, 6.283); ctx.stroke(); }
      });
      ctx.globalCompositeOperation = 'source-over';
      if (sel) {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(sel._x, sel._y, 14, 0, 6.283); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = '600 13px Inter, sans-serif'; ctx.fillText(sel.w.en, sel._x + 18, sel._y + 4);
      }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);

    const pick = (px, py) => { let best = null, bd = 18 * 18; stars.forEach(s => { const dx = s._x - px, dy = s._y - py, dd = dx * dx + dy * dy; if (dd < bd) { bd = dd; best = s; } }); return best; };
    const show = s => {
      sel = s;
      if (!s) { card.hidden = true; return; }
      const w = s.w;
      card.hidden = false;
      card.innerHTML = '<b>' + esc(w.en) + '</b><span>' + esc(w.uz) + '</span><em>' + esc(w.cefr) + ' · ' + esc(w.pos) + ' · ' + (w.mastered ? "o'zlashtirilgan" : w.box + '/5 quti') + (w.due ? ' · takrorlash vaqti!' : '') + '</em><button class="btn-ghost-dark" id="rz-say">Eshitish</button>';
      document.getElementById('rz-say').onclick = () => { try { const u = new SpeechSynthesisUtterance(w.en); u.lang = 'en-US'; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) { toast('Brauzer ovozni qo\'llamaydi'); } };
    };
    const rel = e => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY, ox, oy }; moved = false; });
    cv.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) moved = true; ox = drag.ox + dx; oy = drag.oy + dy; });
    cv.addEventListener('pointerup', e => { if (!moved) { const [px, py] = rel(e); show(pick(px, py)); } drag = null; });
    cv.addEventListener('wheel', e => { e.preventDefault(); scale = Math.max(0.5, Math.min(6, scale * (e.deltaY < 0 ? 1.12 : 0.9))); }, { passive: false });
    view().querySelectorAll('[data-z]').forEach(b => b.onclick = () => { scale = Math.max(0.5, Math.min(6, scale * Number(b.dataset.z))); });
    window.addEventListener('resize', resize);
  }

  // ---------- Reyting ----------
  const PERIOD_LABEL = { today: 'Bugun', week: 'Hafta', month: 'Oy', all: 'Hammasi', cycle: 'Davr', streak: 'Streak' };
  async function renderBoard(period) {
    view().innerHTML = loading();
    const d = await api('board?period=' + encodeURIComponent(period || 'week'));
    const medal = ['🥇', '🥈', '🥉'];
    view().innerHTML = '<header class="rz-head"><h1>Reyting</h1></header>' +
      '<div class="rz-seg" role="tablist">' + d.periods.map(p => '<button role="tab" class="' + (p === d.period ? 'on' : '') + '" data-p="' + p + '">' + (PERIOD_LABEL[p] || p) + '</button>').join('') + '</div>' +
      '<ol class="rz-board">' + d.top.map((r, k) => '<li class="' + (r.me ? 'me' : '') + '"><span class="rz-rank">' + (k < 3 ? emo(medal[k], 24) : k + 1) + '</span><b>' + esc(r.name || r.username || '—') + '</b><em>Lv ' + r.level + '</em><span class="rz-val">' + fmt(r.value) + (d.unit === 'days' ? ' kun' : ' XP') + '</span></li>').join('') + '</ol>' +
      (d.me ? '<p class="rz-me-line">Sizning o\'rningiz: <b>' + (d.me.rank || '—') + '</b> · ' + fmt(d.me.value) + (d.unit === 'days' ? ' kun' : ' XP') + '</p>' : '');
    view().querySelectorAll('.rz-seg button').forEach(b => b.onclick = () => renderBoard(b.dataset.p));
  }

  // ---------- Do'kon ----------
  async function renderShop(notice) {
    view().innerHTML = loading();
    const d = await api('shop');
    view().innerHTML = '<header class="rz-head"><h1>XP do\'koni</h1></header>' +
      '<section class="rz-card rz-balance">' + emo('💎', 36) + '<div><span>Sarflash mumkin</span><b>' + fmt(d.balance) + ' XP</b></div></section>' +
      '<p class="rz-hint">Sarflash darajangiz va reytingingizni tushirmaydi. Nishon ismingiz oldida reytingda ko\'rinadi.</p>' +
      '<section class="rz-shop">' + d.items.map(it => {
        const worn = it.kind === 'badge' && it.owned && d.badge === it.icon;
        const btn = it.kind === 'badge' && it.owned
          ? '<button class="btn-ghost-dark" data-eq="' + it.id + '">' + (worn ? 'Kiyilgan' : 'Kiyish') + '</button>'
          : '<button class="btn-primary" data-buy="' + it.id + '"' + (d.balance < it.price ? ' disabled' : '') + '>' + fmt(it.price) + ' XP</button>';
        return '<div class="rz-card rz-item">' + emo(it.icon, 44) + '<b>' + esc(it.name) + '</b>' + btn + '</div>';
      }).join('') + '</section>' + (d.badge ? '<p class="rz-center"><button class="btn-ghost-dark" id="rz-unwear">Nishonni olib tashlash</button></p>' : '');
    if (notice) toast(notice);
    view().querySelectorAll('[data-buy]').forEach(b => b.onclick = async () => {
      b.disabled = true;
      const r = await api('shop/buy', { body: { item: b.dataset.buy } });
      const msg = { ok: '✅ Sotib olindi!', poor: 'XP yetarli emas', owned: 'Bu nishon sizda bor', full: 'Muzlatgichlar to\'lib qolgan', unknown: 'Topilmadi' }[r.result];
      renderShop(msg);
    });
    view().querySelectorAll('[data-eq]').forEach(b => b.onclick = async () => { await api('shop/equip', { body: { item: b.dataset.eq } }); renderShop(); });
    const un = document.getElementById('rz-unwear');
    if (un) un.onclick = async () => { await api('shop/equip', { body: { item: null } }); renderShop(); };
  }

  // ---------- Profil ----------
  async function renderProfile() {
    const d = await api('me'); const u = d.user;
    const max = Math.max(1, ...d.calendar.days.map(x => x.xp));
    const cells = Array(d.calendar.startWeekday).fill('<i class="blank"></i>').concat(d.calendar.days.map(x => {
      const lv = x.xp ? Math.min(4, 1 + Math.floor((x.xp / max) * 3.99)) : 0;
      return '<i class="l' + lv + '" title="' + x.day + ': ' + x.xp + ' XP"></i>';
    })).join('');
    view().innerHTML =
      '<section class="rz-card rz-me"><div class="rz-avatar">' + esc((u.name || '?').trim().charAt(0).toUpperCase()) + '</div><div><h1>' + esc(u.name) + '</h1><span>' + rich(u.title) + ' · Lv ' + u.level + '</span></div></section>' +
      '<section class="rz-grid">' + stat('💎', fmt(u.xp), 'jami XP') + stat('🔥', u.streak, 'kun streak') + stat('🧊', u.freezes, 'muzlatgich') + stat('🎁', u.boxes, 'sirli quti') + '</section>' +
      '<section class="rz-card"><h2>So\'nggi 28 kun</h2><div class="rz-cal">' + cells + '</div></section>' +
      '<section class="rz-card"><h2>So\'zlar</h2><div class="rz-words"><div><b>' + d.words.learned + '</b><span>o\'rganilgan</span></div><div><b>' + d.words.mastered + '</b><span>o\'zlashtirilgan</span></div><div><b>' + d.words.due + '</b><span>navbatda</span></div></div></section>' +
      '<section class="rz-card"><h2>Yutuqlar</h2><div class="rz-ach">' + d.achievements.map(a => '<div class="' + (a.unlocked ? 'on' : '') + '">' + rich(a.icon, 30) + '<span>' + esc(a.name) + '</span></div>').join('') + '</div></section>' +
      '<p class="rz-center"><button class="btn-ghost-dark" id="rz-out">Chiqish</button></p>';
    document.getElementById('rz-out').onclick = () => { save(null); start(); };
  }

  // ---------- yo'naltirish ----------
  const ROUTES = {
    home: [renderHome, 'home'], review: [renderReview, 'review'], play: [renderPlay, 'play'], 'play/challenge': [renderChallenge, 'play'],
    'play/memory': [renderMemory, 'play'], 'play/galaxy': [renderGalaxy, 'play'], board: [renderBoard, 'board'], shop: [renderShop, 'shop'], profile: [renderProfile, 'profile'],
  };
  let routeSeq = 0, lastKey = null;
  async function route() {
    const key = (location.hash.replace(/^#\/?/, '') || 'home').split('?')[0];
    const r = ROUTES[key] || ROUTES.home;
    const seq = ++routeSeq, v = view();
    setActive(r[1]);
    if (lastKey !== null && lastKey !== key) { v.classList.remove('rz-in'); v.classList.add('rz-out'); await new Promise(res => setTimeout(res, 150)); if (seq !== routeSeq) return; }
    lastKey = key;
    v.classList.remove('rz-out');
    window.scrollTo({ top: 0 });
    v.innerHTML = loading();
    try { await r[0](); }
    catch (e) { if (seq !== routeSeq) return; if (e.auth) return start('Sessiya tugadi. Botdan yangi havola oling.'); v.innerHTML = failBox(); }
    if (seq !== routeSeq) return;
    void v.offsetWidth; v.classList.add('rz-in');
  }

  async function start(note) {
    const m = /[#&]t=([\w.\-]+)/.exec(location.hash);
    if (m) {
      history.replaceState(null, '', location.pathname + '#/home');
      try {
        const r = await api('session', { body: { link: m[1] } });
        save(r.token);
      } catch (e) { return loginScreen("Havola eskirgan yoki noto'g'ri. Botda /sayt buyrug'ini qayta yuboring."); }
    }
    if (!token) return loginScreen(note);
    shell();
    route();
  }
  window.addEventListener('hashchange', () => { if (token && document.getElementById('rz-view')) route(); });
  start();
})();
