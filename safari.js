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
  // Foydalanuvchi tanlagan macOS uslubidagi fon rasmlari
  var ARTS = ['images/bg-mountain.webp', 'images/wall/desert-day.jpg', 'images/wall/desert-dusk.jpg', 'images/wall/mojave-day.jpg', 'images/wall/mojave-night.jpg', 'images/wall/waves-light.jpg', 'images/wall/waves-dark.jpg', 'images/wall/wave-blue.jpg', 'images/wall/liquid.avif'];
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
    // macOS "Genie" effekti: oyna gorizontal bo'laklarga bo'linadi, pastki qismi Dock belgisiga qarab
    // voronka shaklida torayadi va butun oyna o'sha nuqtaga "so'rilib" kiradi. Qaytarishda teskari.
    var SLICES = 40;
    function genie(reverse, target, done) {
      var r = win.getBoundingClientRect();
      if (reduce || !r.width) { done(); return; }
      var layer = document.createElement('div');
      layer.className = 'mw-genie';
      var sTop = scroller ? scroller.scrollTop : 0, parts = [];
      var sliceH = r.height / SLICES;
      for (var i = 0; i < SLICES; i++) {
        var c = win.cloneNode(true);
        c.classList.remove('sf-open', 'sf-min', 'side-on');
        c.removeAttribute('id');
        c.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });
        c.style.cssText = 'position:fixed;left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px;margin:0;transform-origin:50% 0;clip-path:inset(' + (i * sliceH) + 'px 0 ' + Math.max(0, r.height - (i + 1) * sliceH - 0.6) + 'px 0);transition:none;animation:none;will-change:transform;';
        layer.appendChild(c);
        parts.push({ el: c, y0: i * sliceH });
      }
      body.appendChild(layer);
      parts.forEach(function (p) { var sc = p.el.querySelector('.vw-frame'); if (sc) sc.scrollTop = sTop; });
      win.style.visibility = 'hidden';
      var W = r.width, H = r.height, cx0 = r.left + W / 2;
      var tx = target.x, ty = target.y, iconW = 46, dist = ty - r.top;
      var D = 620, t0 = performance.now();
      var ease = function (x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
      function frame(now) {
        var k = Math.min(1, (now - t0) / D);
        var t = reverse ? 1 - k : k;
        var pinch = ease(Math.min(1, t / 0.45));           // 1-bosqich: pastki qism torayadi
        var slide = ease(Math.max(0, (t - 0.25) / 0.75));    // 2-bosqich: oyna nuqtaga oqib tushadi
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i];
          var yAbs = r.top + p.y0 + slide * (dist + 30);     // bo'lakning yangi o'rni
          var u = Math.max(0, Math.min(1, (yAbs - r.top) / Math.max(1, dist)));
          var f = (1 - Math.cos(Math.PI * u)) / 2;            // voronka egriligi
          var w = W - (W - iconW) * f * pinch;
          var cx = cx0 + (tx - cx0) * f * pinch;
          var gone = yAbs > ty + 4;
          p.el.style.transform = 'translate(' + (cx - cx0) + 'px,' + (yAbs - r.top - p.y0) + 'px) scaleX(' + (w / W).toFixed(4) + ')';
          p.el.style.opacity = gone ? '0' : '1';
        }
        if (k < 1) requestAnimationFrame(frame);
        else { layer.remove(); win.style.visibility = ''; done(); }
      }
      requestAnimationFrame(frame);
    }
    var dockIcon = null;
    var dockTarget = function () {
      var b = dockIcon.querySelector('.mw-dockapp').getBoundingClientRect();
      return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
    };
    Y.addEventListener('click', function () {
      if (win.classList.contains('sf-min') || dockIcon) return;
      dockIcon = document.createElement('button');
      dockIcon.type = 'button'; dockIcon.className = 'mw-dockicon';
      dockIcon.innerHTML = '<span class="mw-dockapp"><img src="images/wall/safari.png" alt="" width="48" height="48"></span><span class="mw-docktitle">' + esc(document.title.split(' — ')[0]) + '</span>';
      body.appendChild(dockIcon);
      dockIcon.getBoundingClientRect();
      dockIcon.classList.add('in');
      setTimeout(function () {
        genie(false, dockTarget(), function () { win.classList.add('sf-min'); dockIcon.classList.add('ready'); });
      }, 120);
      dockIcon.onclick = function () {
        if (!dockIcon.classList.contains('ready')) return;
        var tgt = dockTarget();
        win.classList.remove('sf-min');
        genie(true, tgt, function () {
          dockIcon.classList.remove('in');
          var d = dockIcon; dockIcon = null;
          setTimeout(function () { d.remove(); }, 400);
        });
      };
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
