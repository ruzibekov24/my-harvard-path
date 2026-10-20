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
  // Past o'lchamli fotosuratlar to'liq ekranda xira chiqqani uchun olib tashlandi; mayin abstrakt fonlar kattalashtirilganda ham toza ko'rinadi.
  var ARTS = ['images/bg-mountain.webp', 'images/wall/waves-light.jpg', 'images/wall/waves-dark.jpg', 'images/wall/wave-blue.jpg', 'images/wall/liquid.avif'];
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
    // macOS "Genie" (lamp) effekti. Egri chiziq formulasi Windhawk "MacOS Minimize Animation" modidan
    // (Abdullah Masood, Potassiumuncher'ning genie dvigateli, MIT litsenziyasi) JavaScript'ga ko'chirildi.
    // Oyna bir marta rasmga olinadi (html2canvas), so'ng WebGL'da 32x32 to'r bo'ylab egiladi:
    // DOM klonlari yo'q, shuning uchun animatsiya silliq va piksellar ko'rinmaydi.
    var DUR = 480, TILES = 32;
    var snap = null, snapKey = '', snapBusy = null;
    function lamp(tx, ty, p, w, i) {
      var split = 0.3;
      var k = p <= split ? p / split : 1, j = p > split ? (p - split) / (1 - split) : 0;
      var expandHeight = i.y - w.y - w.height;
      var fullHeight = (i.y - w.y) - expandHeight * (1 - k);
      var height = fullHeight - j * fullHeight;
      var y = ty * height;
      var x = tx * i.width + tx * (w.width - i.width) * (1 - j) * (1 - ty) + tx * (w.width - i.width) * (1 - k) * ty;
      var offsetX = (i.x - w.x) * (y / (fullHeight + 0.1)) * k + (i.x - w.x) * j;
      var offsetY = i.y - w.y - height - expandHeight * (1 - k);
      var effectX = Math.sin(((height - y) / fullHeight) * 2 * Math.PI + Math.PI) * (w.x + w.width * tx - (i.x + i.width * tx)) / 7 * k;
      return [w.x + x + offsetX + effectX, w.y + y + offsetY];
    }
    function loadH2C() {
      if (window.html2canvas) return Promise.resolve();
      return new Promise(function (ok, bad) {
        var s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        s.onload = ok; s.onerror = bad; document.head.appendChild(s);
      });
    }
    function capture() {
      var r = win.getBoundingClientRect();
      var key = Math.round(r.width) + 'x' + Math.round(r.height) + ':' + (scroller ? scroller.scrollTop : 0) + ':' + document.documentElement.getAttribute('data-read');
      if (snap && snapKey === key) return Promise.resolve(snap);
      if (snapBusy) return snapBusy;
      var st = scroller ? scroller.scrollTop : 0;
      snapBusy = loadH2C().then(function () {
        return window.html2canvas(win, {
          backgroundColor: null, scale: Math.min(2, window.devicePixelRatio || 1), useCORS: true, logging: false,
          ignoreElements: function (el) { return el.classList && (el.classList.contains('mw-pop') || el.classList.contains('mw-toast')); },
          onclone: function (doc) {
            var c = doc.querySelector('.sf-win'); if (!c) return;
            c.classList.remove('sf-open'); c.style.animation = 'none'; c.style.transform = 'none';
            var sc = c.querySelector('.vw-frame'); if (sc) sc.scrollTop = st;
          }
        });
      }).then(function (cv) { snap = cv; snapKey = key; snapBusy = null; return cv; }, function (e) { snapBusy = null; throw e; });
      return snapBusy;
    }
    // svetofor ustiga kelinganda oldindan rasmga olib qo'yamiz: bosilganda kechikish bo'lmaydi
    var prewarm = function () { if (!reduce && !win.classList.contains('sf-min')) capture().catch(function () {}); };
    lights.addEventListener('mouseenter', prewarm);
    if (bar) bar.addEventListener('mouseenter', prewarm);
    // kutubxonani sahifa bo'shaganda oldindan yuklab qo'yamiz
    (window.requestIdleCallback || function (f) { setTimeout(f, 2500); })(function () { if (!reduce) loadH2C().catch(function () {}); });

    var gl = null, glc = null, prog = null, posBuf = null, uvBuf = null, idxBuf = null, tex = null, nIdx = 0;
    function setupGL() {
      if (gl) return true;
      glc = document.createElement('canvas');
      glc.className = 'mw-genie';
      gl = glc.getContext('webgl2', { premultipliedAlpha: true, antialias: true, alpha: true }) || glc.getContext('webgl', { premultipliedAlpha: true, antialias: true, alpha: true });
      if (!gl) return false;
      var vs = 'attribute vec2 p;attribute vec2 uv;uniform vec2 res;varying vec2 v;void main(){v=uv;vec2 c=p/res*2.0-1.0;gl_Position=vec4(c.x,-c.y,0.0,1.0);}';
      var fs = 'precision mediump float;varying vec2 v;uniform sampler2D t;void main(){gl_FragColor=texture2D(t,v);}';
      var sh = function (type, src) { var o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return o; };
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { gl = null; return false; }
      var uv = [], idx = [];
      for (var y = 0; y <= TILES; y++) for (var x = 0; x <= TILES; x++) uv.push(x / TILES, y / TILES);
      for (var yy = 0; yy < TILES; yy++) for (var xx = 0; xx < TILES; xx++) {
        var a = yy * (TILES + 1) + xx, b = a + 1, c = a + TILES + 1, d = c + 1;
        idx.push(a, b, c, b, d, c);
      }
      nIdx = idx.length;
      uvBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
      idxBuf = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
      posBuf = gl.createBuffer();
      tex = gl.createTexture();
      return true;
    }
    function uploadTex(cv) {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv);
      var isGL2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      if (isGL2) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
      else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    var simple = function (reverse, done) {
      // WebGL yoki rasmga olish ishlamasa: oddiy kichrayish
      if (reverse) { win.style.visibility = ''; done(); return; }
      win.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(40vh) scale(.08)', opacity: 0 }], { duration: 380, easing: 'cubic-bezier(.55,.05,.35,1)' }).finished.then(done, done);
    };
    function genie(reverse, target, done) {
      var r = win.getBoundingClientRect();
      if (reduce || !r.width) { done(); return; }
      var run = function (cv) {
        if (!cv || !setupGL()) return simple(reverse, done);
        var dpr = window.devicePixelRatio || 1, VW = innerWidth, VH = innerHeight;
        glc.width = Math.round(VW * dpr); glc.height = Math.round(VH * dpr);
        glc.style.width = VW + 'px'; glc.style.height = VH + 'px';
        if (!glc.isConnected) body.appendChild(glc);
        gl.viewport(0, 0, glc.width, glc.height);
        gl.useProgram(prog);
        uploadTex(cv);
        gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        var locP = gl.getAttribLocation(prog, 'p'), locUV = gl.getAttribLocation(prog, 'uv');
        gl.uniform2f(gl.getUniformLocation(prog, 'res'), VW, VH);
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf); gl.enableVertexAttribArray(locUV); gl.vertexAttribPointer(locUV, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
        var wG = { x: r.left, y: r.top, width: r.width, height: r.height };
        // Dock oynadan pastda bo'lishi shart (formula shuni kutadi)
        var iG = { x: target.x - 11, y: Math.max(target.y - 18, r.bottom + 2), width: 22, height: 36 };
        var pos = new Float32Array((TILES + 1) * (TILES + 1) * 2);
        var t0 = performance.now(), shown = false;
        function draw(now) {
          var raw = Math.max(0, Math.min(1, (now - t0) / DUR));
          var e = raw * raw * (3 - 2 * raw);
          var p = reverse ? 1 - e : e, n = 0;
          for (var y = 0; y <= TILES; y++) for (var x = 0; x <= TILES; x++) {
            var q = lamp(x / TILES, y / TILES, p, wG, iG);
            pos[n++] = q[0]; pos[n++] = q[1];
          }
          gl.bindBuffer(gl.ARRAY_BUFFER, posBuf); gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW);
          gl.enableVertexAttribArray(locP); gl.vertexAttribPointer(locP, 2, gl.FLOAT, false, 0, 0);
          gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
          gl.drawElements(gl.TRIANGLES, nIdx, gl.UNSIGNED_SHORT, 0);
          if (!shown) { shown = true; glc.style.visibility = 'visible'; if (!reverse) win.style.visibility = 'hidden'; }
          if (raw < 1) requestAnimationFrame(draw);
          else {
            if (reverse) win.style.visibility = '';
            requestAnimationFrame(function () { glc.style.visibility = 'hidden'; gl.clear(gl.COLOR_BUFFER_BIT); done(); });
          }
        }
        requestAnimationFrame(draw);
      };
      if (reverse && snap) run(snap);
      else capture().then(run, function () { run(null); });
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
      var d = dockIcon;
      genie(false, dockTarget(), function () { win.style.visibility = ''; win.classList.add('sf-min'); d.classList.add('ready'); });
      dockIcon.onclick = function () {
        if (!d.classList.contains('ready')) return;
        d.classList.remove('ready');
        var tgt = dockTarget();
        win.style.visibility = 'hidden';
        win.classList.remove('sf-min');
        genie(true, tgt, function () {
          win.style.visibility = '';
          d.classList.remove('in');
          dockIcon = null;
          setTimeout(function () { d.remove(); }, 450);
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
