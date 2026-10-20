/* Safari oynasi: macOS'dagidek ishlaydigan tugmalar va animatsiyalar + aylanib turuvchi art fon.
   Maqola ko'ruvchi (oqish.html) va oddiy maqolalar (macwin.js) uchun umumiy. */
(function () {
  var win = document.querySelector('.sf-win');
  if (!win) return;
  var body = document.body, bar = win.querySelector('.sf-bar');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scroller = win.querySelector('.vw-frame');
  var groups = bar ? bar.children : [];
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var HOME = 'maqolalar.html';

  // ---------- 1. Art fon: o'xshash uslubdagi illyustratsiyalar almashib turadi ----------
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function ridge(r, W, base, amp, rough, n) {
    var pts = [];
    for (var i = 0; i <= n; i++) {
      var x = (i / n) * W;
      var y = base - amp * (0.35 + 0.65 * Math.sin(i * 0.9 + r() * 2.2) * 0.5 + 0.5 * r()) + (r() - 0.5) * rough;
      pts.push([x, y]);
    }
    var d = 'M0 1000 L0 ' + pts[0][1].toFixed(1);
    for (var j = 1; j < pts.length; j++) {
      var p = pts[j - 1], q = pts[j], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
      d += ' Q' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ' ' + mx.toFixed(1) + ' ' + my.toFixed(1);
    }
    return d + ' L' + W + ' ' + pts[pts.length - 1][1].toFixed(1) + ' L' + W + ' 1000 Z';
  }
  function art(p) {
    var W = 1600, r = rng(p.seed), s = '';
    s += '<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.sky[0] + '"/><stop offset="1" stop-color="' + p.sky[1] + '"/></linearGradient>' +
      '<linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.water[0] + '"/><stop offset="1" stop-color="' + p.water[1] + '"/></linearGradient></defs>';
    s += '<rect width="1600" height="1000" fill="url(#s)"/>';
    if (p.stars) for (var k = 0; k < 90; k++) s += '<circle cx="' + (r() * W).toFixed(0) + '" cy="' + (r() * 420).toFixed(0) + '" r="' + (0.6 + r() * 1.4).toFixed(1) + '" fill="#fff" opacity="' + (0.35 + r() * 0.6).toFixed(2) + '"/>';
    if (p.sun) s += '<circle cx="' + p.sun[0] + '" cy="' + p.sun[1] + '" r="' + p.sun[2] + '" fill="' + p.sun[3] + '"/>';
    var L = p.layers.length;
    for (var i = 0; i < L; i++) {
      var base = 430 + i * (330 / L), amp = (L - i) * 52 + 40;
      s += '<path d="' + ridge(r, W, base, amp, 30 + i * 6, 7 + i * 2) + '" fill="' + p.layers[i] + '"/>';
      if (p.glow && i === 0) s += '<path d="' + ridge(rng(p.seed + 9), W, base - 8, amp * 0.6, 20, 7) + '" fill="' + p.glow + '" opacity=".55"/>';
    }
    // suv va aks
    s += '<path d="M0 860 C 300 840 520 880 800 860 S 1300 840 1600 865 L1600 1000 L0 1000 Z" fill="url(#w)"/>';
    for (var t = 0; t < 7; t++) { var y = 880 + t * 16, x = 300 + r() * 900; s += '<rect x="' + x.toFixed(0) + '" y="' + y + '" width="' + (120 + r() * 260).toFixed(0) + '" height="4" rx="2" fill="#fff" opacity=".18"/>'; }
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">' + s + '</svg>');
  }
  var ARTS = [
    'images/bg-mountain.webp',
    art({ seed: 11, sky: ['#f6c9a3', '#8f9ccc'], sun: [1180, 330, 70, '#ffe2bd'], glow: '#f7a27c', layers: ['#a597c4', '#7c74ad', '#555a8e', '#353a68', '#1d2142'], water: ['#6b78ad', '#2b3263'] }),
    art({ seed: 23, sky: ['#9fc6dd', '#e9eef0'], sun: [380, 260, 54, '#fff6e6'], layers: ['#c1d6e1', '#93b5ca', '#638cab', '#3a6383', '#1f3d55'], water: ['#7fa8c2', '#2d5470'] }),
    art({ seed: 37, sky: ['#fbd7ae', '#f09d79'], sun: [820, 360, 90, '#fff0d4'], layers: ['#eab88c', '#d9926a', '#b86b50', '#8b4c3e', '#5b302c'], water: ['#d28968', '#6a3a33'] }),
    art({ seed: 51, sky: ['#d3e6db', '#8bb6ad'], layers: ['#a1c6ba', '#72a698', '#4b8274', '#2e5e53', '#183b35'], glow: '#e9d9b5', water: ['#6aa093', '#1e4a43'] }),
    art({ seed: 67, sky: ['#1b2350', '#4a5384'], stars: true, sun: [1240, 220, 44, '#f4ebd3'], layers: ['#424b7a', '#323a63', '#242a4c', '#171b35', '#0b0e20'], water: ['#2c3566', '#0a0d1e'] })
  ];
  var bgA = document.createElement('div'), bgB = document.createElement('div');
  bgA.className = bgB.className = 'mw-bg';
  body.insertBefore(bgB, body.firstChild); body.insertBefore(bgA, body.firstChild);
  body.classList.add('has-art');
  var idx = Math.floor(Math.random() * ARTS.length), front = bgA;
  var show = function (src) {
    var back = front === bgA ? bgB : bgA;
    var im = new Image();
    im.onload = function () {
      back.style.backgroundImage = 'url("' + src + '")';
      back.classList.add('on'); front.classList.remove('on'); front = back;
    };
    im.src = src;
  };
  show(ARTS[idx]);
  if (!reduce) setInterval(function () { if (document.visibilityState !== 'visible') return; idx = (idx + 1) % ARTS.length; show(ARTS[idx]); }, 20000);

  // ---------- 2. Oyna ochilish animatsiyasi ----------
  if (!reduce) { win.classList.add('sf-open'); win.addEventListener('animationend', function () { win.classList.remove('sf-open'); }, { once: true }); }

  // ---------- 3. Svetofor: yopish, yig'ish, to'liq ekran ----------
  var lights = win.querySelector('.sf-lights');
  if (lights) {
    var R = lights.children[0], Y = lights.children[1], G = lights.children[2];
    R.setAttribute('title', 'Yopish'); Y.setAttribute('title', "Yig'ish"); G.setAttribute('title', "To'liq ekran");
    Y.setAttribute('role', 'button'); G.setAttribute('role', 'button');
    R.addEventListener('click', function (e) {
      e.preventDefault();
      var go = function () { location.href = HOME; };
      if (reduce) return go();
      win.classList.add('sf-closing'); setTimeout(go, 260);
    });
    var dockIcon = null;
    Y.addEventListener('click', function () {
      if (win.classList.contains('sf-min')) return;
      win.classList.add('sf-min');
      dockIcon = document.createElement('button');
      dockIcon.type = 'button'; dockIcon.className = 'mw-dockicon';
      dockIcon.innerHTML = '<span class="mw-dockapp"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#fff" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2.2 4.8-4.8 2.2 2.2-4.8z" fill="#fff" stroke="none"/></svg></span><span>' + esc(document.title.split(' — ')[0]) + '</span>';
      body.appendChild(dockIcon);
      requestAnimationFrame(function () { dockIcon.classList.add('in'); });
      dockIcon.onclick = function () { win.classList.remove('sf-min'); dockIcon.remove(); dockIcon = null; };
    });
    var full = function () { win.classList.toggle('sf-full'); };
    G.addEventListener('click', full);
    if (bar) bar.addEventListener('dblclick', function (e) { if (e.target === bar) full(); });
  }

  // ---------- 4. Navigatsiya tugmalari ----------
  var sameOrigin = document.referrer && document.referrer.indexOf(location.origin) === 0;
  var backBtn = groups[2] && groups[2].querySelector('.sf-ic');
  var fwdBtn = groups[2] && groups[2].querySelectorAll('.sf-ic')[1];
  if (backBtn) backBtn.addEventListener('click', function (e) { if (sameOrigin && history.length > 1) { e.preventDefault(); history.back(); } });
  if (fwdBtn) { fwdBtn.classList.remove('dim'); fwdBtn.setAttribute('role', 'button'); fwdBtn.title = 'Oldinga'; fwdBtn.addEventListener('click', function () { history.forward(); }); }
  var plus = groups[5] && groups[5].querySelectorAll('.sf-ic')[1];
  if (plus) { plus.setAttribute('role', 'button'); plus.title = 'Yangi oyna: Maqolalar'; plus.addEventListener('click', function () { location.href = HOME; }); }
  var reload = win.querySelector('#vwReload, #mwReload');
  if (reload) reload.addEventListener('click', function () { reload.classList.remove('spin'); void reload.offsetWidth; reload.classList.add('spin'); });

  // ---------- 5. Bildirishnoma ----------
  var toastT = 0;
  function toast(msg) {
    var t = win.querySelector('.mw-toast');
    if (!t) { t = document.createElement('div'); t.className = 'mw-toast'; win.appendChild(t); }
    t.textContent = msg; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 1800);
  }

  // ---------- 6. Manzil kapsulasi: bosilganda to'liq havola nusxalanadi ----------
  var addr = win.querySelector('.sf-addr');
  var pageUrl = location.href.indexOf('oqish.html') > -1 ? (new URLSearchParams(location.search).get('u') || location.href) : location.origin + location.pathname;
  if (addr) addr.addEventListener('click', function (e) {
    if (e.target.closest('button')) return;
    addr.classList.add('focus');
    try { navigator.clipboard.writeText(pageUrl); toast('Havola nusxalandi'); } catch (err) {}
    setTimeout(function () { addr.classList.remove('focus'); }, 1400);
  });

  // ---------- 7. Tarix (soat tugmasi) ----------
  var HKEY = 'mhp_hist';
  var hist = [];
  try { hist = JSON.parse(localStorage.getItem(HKEY) || '[]'); } catch (e) {}
  var record = function () {
    var title = document.title.split(' — ')[0];
    var here = location.pathname.split('/').pop() + location.search;
    hist = hist.filter(function (h) { return h.u !== here; });
    hist.unshift({ u: here, t: title, at: Date.now() });
    hist = hist.slice(0, 12);
    try { localStorage.setItem(HKEY, JSON.stringify(hist)); } catch (e) {}
  };
  setTimeout(record, 1500); // sarlavha (maqola yuklangach) aniq bo'lsin

  function popover(anchor, html, cls) {
    closePop();
    var pop = document.createElement('div');
    pop.className = 'mw-pop ' + (cls || '');
    pop.innerHTML = html;
    win.appendChild(pop);
    var a = anchor.getBoundingClientRect(), w = win.getBoundingClientRect();
    pop.style.left = Math.max(12, Math.min(w.width - 312, a.left - w.left - 20)) + 'px';
    pop.style.top = (a.bottom - w.top + 8) + 'px';
    requestAnimationFrame(function () { pop.classList.add('on'); });
    setTimeout(function () { document.addEventListener('click', outside, true); }, 0);
  }
  function outside(e) { var p = win.querySelector('.mw-pop'); if (p && !p.contains(e.target)) closePop(); }
  function closePop() { var p = win.querySelector('.mw-pop'); if (p) p.remove(); document.removeEventListener('click', outside, true); }
  var ago = function (ms) { var m = Math.round((Date.now() - ms) / 60000); return m < 1 ? 'hozirgina' : m < 60 ? m + ' daqiqa oldin' : m < 1440 ? Math.round(m / 60) + ' soat oldin' : Math.round(m / 1440) + ' kun oldin'; };
  var clock = groups[3] && groups[3].querySelector('.sf-ic');
  if (clock) {
    clock.setAttribute('role', 'button'); clock.title = 'Tarix';
    clock.addEventListener('click', function (e) {
      e.stopPropagation();
      var list = hist.filter(function (h) { return h.t; }).slice(0, 8);
      popover(clock, '<h4>Yaqinda o‘qilganlar</h4>' + (list.length ? list.map(function (h) { return '<a href="' + esc(h.u) + '"><b>' + esc(h.t) + '</b><span>' + ago(h.at) + '</span></a>'; }).join('') : '<p>Hali tarix yo‘q</p>') + (list.length ? '<button type="button" class="mw-clear">Tarixni tozalash</button>' : ''));
      var c = win.querySelector('.mw-clear');
      if (c) c.onclick = function () { hist = []; try { localStorage.removeItem(HKEY); } catch (err) {} closePop(); toast('Tarix tozalandi'); };
    });
  }

  // ---------- 8. Yon panel (sidebar): barcha maqolalar ----------
  var side = null;
  var sideBtn = groups[1];
  function openSide() {
    if (!side) {
      side = document.createElement('aside');
      side.className = 'mw-side';
      side.innerHTML = '<div class="mw-side-h">Maqolalar</div><div class="mw-side-list"><p class="mw-side-load">Yuklanmoqda…</p></div>';
      win.appendChild(side);
      fetch(HOME).then(function (r) { return r.text(); }).then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var here = location.pathname.split('/').pop();
        var items = Array.prototype.map.call(doc.querySelectorAll('.mq-feature > a:last-child, a.mq-card'), function (a) {
          var h = a.querySelector('h2 [data-lang="uz"], h3 [data-lang="uz"]') || a.querySelector('h2, h3');
          var k = a.querySelector('.mq-kicker [data-lang="uz"]') || a.querySelector('.mq-kicker');
          var img = a.querySelector('img') || (a.parentNode && a.parentNode.querySelector('img'));
          return { href: a.getAttribute('href'), t: h ? h.textContent.trim() : '', k: k ? k.textContent.trim() : '', img: img ? img.getAttribute('src') : '' };
        }).filter(function (x) { return x.t; });
        side.querySelector('.mw-side-list').innerHTML = items.map(function (x) {
          var on = x.href === here || (x.href.indexOf('oqish.html') === 0 && location.pathname.indexOf('oqish') > -1);
          return '<a href="' + esc(x.href) + '" class="' + (on ? 'on' : '') + '">' + (x.img ? '<img src="' + esc(x.img) + '" alt="" loading="lazy">' : '<i class="mw-noimg"></i>') + '<span><b>' + esc(x.t) + '</b><em>' + esc(x.k) + '</em></span></a>';
        }).join('');
      }).catch(function () { side.querySelector('.mw-side-list').innerHTML = '<p class="mw-side-load">Yuklab bo‘lmadi</p>'; });
    }
    requestAnimationFrame(function () { win.classList.toggle('side-on'); });
  }
  if (sideBtn) { sideBtn.setAttribute('role', 'button'); sideBtn.title = 'Yon panel'; sideBtn.style.cursor = 'pointer'; sideBtn.addEventListener('click', openSide); }

  // ---------- 9. Pastga aylantirganda manzil qatori yig'iladi (Safari kabi) ----------
  if (scroller) {
    var lastY = 0, ticking = false;
    scroller.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = scroller.scrollTop;
        if (y > lastY + 6 && y > 80) win.classList.add('compact');
        else if (y < lastY - 6 || y < 40) win.classList.remove('compact');
        lastY = y; ticking = false;
      });
    }, { passive: true });
  }

  // Esc: ochiq panel/popoverni yopadi, to'liq ekrandan chiqaradi
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (win.querySelector('.mw-pop')) return closePop();
    if (win.classList.contains('side-on')) return win.classList.remove('side-on');
    win.classList.remove('sf-full');
  });
})();
