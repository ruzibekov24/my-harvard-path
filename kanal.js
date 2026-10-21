/* Telegram kanali (@MyHarvardPath) postlari saytda, Telegram ko'rinishida.
   Ma'lumot /api/channel dan keladi (kanalning ochiq veb-sahifasi, server tomonda o'qiladi). */
(function () {
  var feed = document.getElementById('tgFeed');
  if (!feed) return;
  var head = document.getElementById('tgHead');
  var more = document.getElementById('tgMore');
  var posts = new Map(), oldest = null, newest = null, busy = false;
  var MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var dayKey = function (d) { return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); };
  var dayLabel = function (d) {
    var t = new Date(), y = new Date(); y.setDate(t.getDate() - 1);
    if (dayKey(d) === dayKey(t)) return 'Bugun';
    if (dayKey(d) === dayKey(y)) return 'Kecha';
    return d.getDate() + '-' + MONTHS[d.getMonth()] + (d.getFullYear() !== t.getFullYear() ? ' ' + d.getFullYear() : '');
  };
  var EYE = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';

  function media(p) {
    var h = '';
    if (p.photos && p.photos.length === 1) {
      var ph = p.photos[0], ratio = ph.ratio || (ph.w && ph.h ? (ph.h / ph.w) * 100 : 66);
      h += '<button type="button" class="tg-photo" data-src="' + esc(ph.src) + '" style="--r:' + Math.min(130, ratio).toFixed(2) + '%"><img src="' + esc(ph.src) + '" alt="" loading="lazy"></button>';
    } else if (p.photos && p.photos.length > 1) {
      var n = p.photos.length;
      h += '<div class="tg-album n' + Math.min(n, 5) + '">' + p.photos.map(function (ph) { return '<button type="button" class="tg-photo" data-src="' + esc(ph.src) + '"><img src="' + esc(ph.src) + '" alt="" loading="lazy"></button>'; }).join('') + '</div>';
    }
    if (p.video) {
      h += p.video.src
        ? '<video class="tg-video" controls preload="none" playsinline' + (p.video.thumb ? ' poster="' + esc(p.video.thumb) + '"' : '') + ' src="' + esc(p.video.src) + '"></video>'
        : '<a class="tg-photo tg-vthumb" href="' + esc(p.url) + '" target="_blank" rel="noopener" style="--r:56.25%">' + (p.video.thumb ? '<img src="' + esc(p.video.thumb) + '" alt="" loading="lazy">' : '') + '<i class="tg-play"></i>' + (p.video.duration ? '<em>' + esc(p.video.duration) + '</em>' : '') + '</a>';
    }
    if (p.sticker) h += '<img class="tg-sticker" src="' + esc(p.sticker) + '" alt="Stiker" loading="lazy">';
    return h;
  }

  function bubble(p) {
    var d = p.date ? new Date(p.date) : null;
    var time = d ? pad(d.getHours()) + ':' + pad(d.getMinutes()) : '';
    var hasMedia = (p.photos && p.photos.length) || p.video;
    var h = '<article class="tg-msg" id="post-' + p.id + '" data-id="' + p.id + '">' +
      '<a class="tg-ava" href="https://t.me/MyHarvardPath" target="_blank" rel="noopener" aria-hidden="true" tabindex="-1"></a>' +
      '<div class="tg-bubble' + (hasMedia && !p.html ? ' only-media' : '') + (p.sticker && !p.html ? ' is-sticker' : '') + '">' +
      (hasMedia ? '' : '<div class="tg-name">Going to Harvard | Garvard sari</div>');
    if (hasMedia) h += media(p) + '<div class="tg-name in">Going to Harvard | Garvard sari</div>';
    if (p.forwarded) h += '<div class="tg-fwd">Forward: <b>' + esc(p.forwarded) + '</b></div>';
    if (p.reply) h += '<div class="tg-reply"><b>' + esc(p.reply.name) + '</b><span>' + esc(p.reply.text) + '</span></div>';
    if (!hasMedia && p.sticker) h += media(p);
    if (p.voice) h += '<a class="tg-voice" href="' + esc(p.url) + '" target="_blank" rel="noopener"><i></i><span>Ovozli xabar' + (p.voice.duration ? ' · ' + esc(p.voice.duration) : '') + '</span><em>Telegramda tinglash</em></a>';
    if (p.html) h += '<div class="tg-text">' + p.html + '</div>';
    if (p.preview && (p.preview.title || p.preview.desc)) {
      h += '<a class="tg-preview" href="' + esc(p.preview.url) + '" target="_blank" rel="noopener nofollow">' +
        (p.preview.site ? '<b>' + esc(p.preview.site) + '</b>' : '') + (p.preview.title ? '<strong>' + esc(p.preview.title) + '</strong>' : '') +
        (p.preview.desc ? '<span>' + esc(p.preview.desc) + '</span>' : '') + (p.preview.image ? '<img src="' + esc(p.preview.image) + '" alt="" loading="lazy">' : '') + '</a>';
    }
    if (p.unsupported) h += '<a class="tg-unsup" href="' + esc(p.url) + '" target="_blank" rel="noopener">Bu postni Telegramda ko‘ring ↗</a>';
    h += '<div class="tg-foot">' +
      (p.reactions && p.reactions.length ? '<div class="tg-reacts">' + p.reactions.map(function (r) { return '<span>' + esc(r.emoji) + ' <b>' + esc(r.count) + '</b></span>'; }).join('') + '</div>' : '') +
      '<a class="tg-meta" href="' + esc(p.url) + '" target="_blank" rel="noopener" title="Telegramda ochish">' +
      (p.views ? '<span class="tg-views">' + EYE + esc(p.views) + '</span>' : '') + (p.edited ? '<span>tahrirlangan</span>' : '') + '<time datetime="' + esc(p.date || '') + '">' + time + '</time></a></div>' +
      '</div></article>';
    return h;
  }

  function render() {
    var list = Array.from(posts.values()).sort(function (a, b) { return a.id - b.id; });
    var html = '', lastDay = '';
    list.forEach(function (p) {
      if (p.date) {
        var d = new Date(p.date), k = dayKey(d);
        if (k !== lastDay) { html += '<div class="tg-day"><span>' + dayLabel(d) + '</span></div>'; lastDay = k; }
      }
      html += bubble(p);
    });
    feed.innerHTML = html;
  }

  function header(ch) {
    if (!ch || !head) return;
    var subs = ch.counters && (ch.counters.subscribers || ch.counters.subscriber);
    head.innerHTML =
      (ch.avatar ? '<img class="tg-hava" src="' + esc(ch.avatar) + '" alt="">' : '<span class="tg-hava"></span>') +
      '<div class="tg-htext"><b>' + esc(ch.title) + '</b><span>@' + esc(ch.username) + (subs ? ' · ' + esc(subs) + ' obunachi' : '') + '</span></div>' +
      '<a class="tg-join" href="https://t.me/' + esc(ch.username) + '" target="_blank" rel="noopener">Obuna bo‘lish</a>';
    if (ch.avatar) document.documentElement.style.setProperty('--tg-ava', 'url("' + ch.avatar.replace(/"/g, '') + '")');
  }

  function load(before, opts) {
    if (busy) return Promise.resolve();
    busy = true;
    if (more) more.classList.add('busy');
    return fetch('/api/channel' + (before ? '?before=' + before : ''))
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        header(d.channel);
        var added = 0;
        (d.posts || []).forEach(function (p) { if (!posts.has(p.id)) added++; posts.set(p.id, p); });
        var ids = Array.from(posts.keys());
        oldest = Math.min.apply(null, ids); newest = Math.max.apply(null, ids);
        var anchor = opts && opts.keep ? document.getElementById('post-' + opts.keep) : null;
        var anchorTop = anchor ? anchor.getBoundingClientRect().top : 0;
        render();
        if (anchor) { var a2 = document.getElementById('post-' + opts.keep); if (a2) window.scrollBy(0, a2.getBoundingClientRect().top - anchorTop); }
        if (opts && opts.toBottom) requestAnimationFrame(function () { var last = feed.lastElementChild; if (last) last.scrollIntoView({ block: 'end' }); });
        if (more) more.hidden = (d.posts || []).length < 5 || added === 0 && !!before;
      })
      .catch(function () {
        if (!posts.size) feed.innerHTML = '<div class="tg-err">Postlarni yuklab bo‘lmadi. <a href="https://t.me/MyHarvardPath" target="_blank" rel="noopener">Kanalni Telegramda oching ↗</a></div>';
      })
      .then(function () { busy = false; if (more) more.classList.remove('busy'); });
  }

  if (more) more.addEventListener('click', function () { load(oldest, { keep: oldest }); });

  // rasmni kattalashtirib ko'rish
  var box = document.createElement('div');
  box.className = 'tg-lightbox';
  box.innerHTML = '<img alt="">';
  document.body.appendChild(box);
  box.addEventListener('click', function () { box.classList.remove('on'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') box.classList.remove('on'); });
  feed.addEventListener('click', function (e) {
    var ph = e.target.closest('button.tg-photo');
    if (ph) { box.querySelector('img').src = ph.dataset.src; box.classList.add('on'); return; }
    var sp = e.target.closest('.tg-spoiler');
    if (sp) sp.classList.add('open');
  });

  load(null, { toBottom: true });
  // yangi postlar uchun har 2 daqiqada tekshirish
  setInterval(function () { if (document.visibilityState === 'visible') load(null); }, 120000);
})();
