/* Maqolalarda matnni rangli marker bilan belgilash.
   Matnni tanlang -> tepasida shisha panel chiqadi -> rangni bosing. Belgini bossangiz rangini almashtirish yoki o'chirish mumkin.
   Belgilar shu brauzerda (localStorage) har bir maqola va til uchun alohida saqlanadi. */
(function () {
  if (window.mhpHighlights) return;
  var COLORS = [
    { id: 'yellow', name: 'Sariq' }, { id: 'green', name: 'Yashil' }, { id: 'pink', name: 'Pushti' },
    { id: 'blue', name: "Ko'k" }, { id: 'purple', name: 'Binafsha' }
  ];
  var key = 'mhp_hl:' + location.pathname.replace(/\.html$/, '') + (location.pathname.indexOf('oqish') > -1 ? '?' + (new URLSearchParams(location.search).get('u') || '') : '');
  var list = [];
  try { list = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) {}
  var save = function () { try { localStorage.setItem(key, JSON.stringify(list)); } catch (e) {} };

  var css = document.createElement('style');
  css.textContent =
    'mark.hl{--hl:rgba(255,222,0,.78);color:inherit;background:linear-gradient(104deg,transparent .4em,var(--hl) .5em,var(--hl) calc(100% - .5em),transparent calc(100% - .4em)) no-repeat 0 60%/100% 78%;padding:0 .12em;margin:0 -.04em;border-radius:.35em;-webkit-box-decoration-break:clone;box-decoration-break:clone;cursor:pointer;transition:background-color .2s,filter .2s}' +
    'mark.hl:hover{filter:saturate(1.3) brightness(.97)}' +
    'mark.hl.hl-new{animation:hlSweep .5s cubic-bezier(.2,.8,.2,1) both}' +
    '@keyframes hlSweep{from{background-size:0% 78%}to{background-size:100% 78%}}' +
    'mark.hl-yellow{--hl:rgba(255,222,0,.78)} mark.hl-green{--hl:rgba(60,230,110,.58)} mark.hl-pink{--hl:rgba(255,80,160,.48)} mark.hl-blue{--hl:rgba(40,160,255,.48)} mark.hl-purple{--hl:rgba(190,110,255,.50)}' +
    'html[data-theme="dark"] mark.hl-yellow{--hl:rgba(255,222,0,.52)} html[data-theme="dark"] mark.hl-green{--hl:rgba(60,230,110,.45)} html[data-theme="dark"] mark.hl-pink{--hl:rgba(255,80,160,.45)} html[data-theme="dark"] mark.hl-blue{--hl:rgba(70,170,255,.48)} html[data-theme="dark"] mark.hl-purple{--hl:rgba(200,120,255,.48)}' +
    '.hl-bar{position:fixed;z-index:90;display:flex;align-items:center;gap:6px;padding:7px 8px;border-radius:999px;background:rgba(255,255,255,.62);-webkit-backdrop-filter:blur(20px) saturate(1.9);backdrop-filter:blur(20px) saturate(1.9);box-shadow:inset 0 1px 1px rgba(255,255,255,.9),inset 0 0 0 .5px rgba(255,255,255,.6),0 12px 32px rgba(0,0,0,.22),0 0 0 .5px rgba(0,0,0,.08);transform:translate(-50%,6px) scale(.9);opacity:0;pointer-events:none;transition:transform .28s cubic-bezier(.2,.9,.25,1.2),opacity .18s ease}' +
    'html[data-theme="dark"] .hl-bar{background:rgba(44,44,48,.72);box-shadow:inset 0 1px 1px rgba(255,255,255,.18),0 12px 32px rgba(0,0,0,.5)}' +
    '.hl-bar.on{transform:translate(-50%,0) scale(1);opacity:1;pointer-events:auto}' +
    '.hl-bar::after{content:"";position:absolute;left:50%;bottom:-6px;width:12px;height:12px;margin-left:-6px;transform:rotate(45deg);background:inherit;border-radius:2px;z-index:-1}' +
    '.hl-bar.below::after{bottom:auto;top:-6px}' +
    '.hl-dot{width:26px;height:26px;border-radius:50%;border:0;padding:0;cursor:pointer;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.75),0 1px 3px rgba(0,0,0,.2);transition:transform .2s cubic-bezier(.3,1.6,.5,1)}' +
    '.hl-dot:hover{transform:scale(1.18)} .hl-dot:active{transform:scale(.9)} .hl-dot.on{box-shadow:0 0 0 2px #fff,0 0 0 4px rgba(0,0,0,.55)}' +
    '.hl-dot[data-c=yellow]{background:#ffd60a} .hl-dot[data-c=green]{background:#34c759} .hl-dot[data-c=pink]{background:#ff3787} .hl-dot[data-c=blue]{background:#0a84ff} .hl-dot[data-c=purple]{background:#af52de}' +
    '.hl-act{width:30px;height:30px;border:0;border-radius:50%;background:transparent;color:#3a3a3c;display:grid;place-items:center;cursor:pointer;padding:0}' +
    'html[data-theme="dark"] .hl-act{color:#f2f2f7}' +
    '.hl-act:hover{background:rgba(120,120,128,.18)} .hl-sep{width:1px;height:20px;background:rgba(60,60,67,.25);margin:0 2px}';
  document.head.appendChild(css);

  // ---- matn ofsetlari: konteyner ichidagi umumiy belgi raqami <-> (matn tuguni, ofset) ----
  function containers() { return Array.prototype.slice.call(document.querySelectorAll('[data-lang].lang-block, .vw-art [data-lang], .vw-art')).filter(function (c) { return !c.querySelector('[data-lang]') || c.matches('[data-lang]'); }); }
  function cid(c) { return c.getAttribute('data-lang') || 'art'; }
  function textNodes(c) {
    var out = [], w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT, null);
    while (w.nextNode()) out.push(w.currentNode);
    return out;
  }
  function offsetOf(c, node, off) {
    var n = 0, nodes = textNodes(c);
    for (var i = 0; i < nodes.length; i++) { if (nodes[i] === node) return n + off; n += nodes[i].length; }
    return -1;
  }
  function wrap(c, s, e, color, id, anim) {
    var nodes = textNodes(c), n = 0, made = [];
    nodes.forEach(function (t) {
      var a = n, b = n + t.length; n = b;
      if (b <= s || a >= e || !t.length) return;
      if (!t.textContent.trim() && (a < s || b > e)) return;
      var from = Math.max(0, s - a), to = Math.min(t.length, e - a);
      var mid = t;
      if (from > 0) mid = mid.splitText(from);
      if (to - from < mid.length) mid.splitText(to - from);
      var m = document.createElement('mark');
      m.className = 'hl hl-' + color + (anim ? ' hl-new' : '');
      m.setAttribute('data-hl', id);
      mid.parentNode.insertBefore(m, mid);
      m.appendChild(mid);
      made.push(m);
    });
    if (anim) setTimeout(function () { made.forEach(function (m) { m.classList.remove('hl-new'); }); }, 600);
    return made;
  }
  function unwrap(id) {
    document.querySelectorAll('mark.hl[data-hl="' + id + '"]').forEach(function (m) {
      var p = m.parentNode;
      while (m.firstChild) p.insertBefore(m.firstChild, m);
      p.removeChild(m); p.normalize();
    });
  }
  function restore() {
    var cs = containers();
    list.forEach(function (h) {
      if (document.querySelector('mark.hl[data-hl="' + h.id + '"]')) return;
      var c = cs.filter(function (x) { return cid(x) === h.c; })[0];
      if (!c) return;
      var txt = c.textContent, s = h.s, e = h.e;
      if (txt.slice(s, e) !== h.t) { var i = txt.indexOf(h.t); if (i < 0) return; s = i; e = i + h.t.length; }
      wrap(c, s, e, h.color, h.id, false);
    });
  }

  // ---- panel ----
  var bar = document.createElement('div');
  bar.className = 'hl-bar';
  bar.setAttribute('role', 'toolbar');
  bar.innerHTML = COLORS.map(function (c) { return '<button type="button" class="hl-dot" data-c="' + c.id + '" title="' + c.name + '" aria-label="' + c.name + ' bilan belgilash"></button>'; }).join('') +
    '<i class="hl-sep"></i><button type="button" class="hl-act" data-a="copy" title="Nusxalash" aria-label="Nusxalash"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg></button>' +
    '<button type="button" class="hl-act" data-a="del" title="O‘chirish" aria-label="Belgini o‘chirish"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg></button>';
  document.body.appendChild(bar);
  var cur = null; // { mode: 'new', c, s, e, t } yoki { mode: 'edit', id }
  function place(rect) {
    var top = rect.top - 54, below = false;
    if (top < 70) { top = rect.bottom + 14; below = true; }
    bar.style.left = Math.max(150, Math.min(innerWidth - 150, rect.left + rect.width / 2)) + 'px';
    bar.style.top = top + 'px';
    bar.classList.toggle('below', below);
    bar.classList.add('on');
  }
  function hide() { bar.classList.remove('on'); cur = null; }
  function show(mode) {
    bar.querySelector('[data-a="del"]').style.display = mode === 'edit' ? '' : 'none';
    bar.querySelectorAll('.hl-dot').forEach(function (d) { d.classList.toggle('on', !!(cur && cur.mode === 'edit' && cur.color === d.dataset.c)); });
  }
  function onSelect() {
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    var r = sel.getRangeAt(0), text = r.toString();
    if (text.trim().length < 2) return;
    var c = containers().filter(function (x) { return x.contains(r.commonAncestorContainer); })[0];
    if (!c || r.startContainer.nodeType !== 3 || r.endContainer.nodeType !== 3) return;
    var s = offsetOf(c, r.startContainer, r.startOffset), e = offsetOf(c, r.endContainer, r.endOffset);
    if (s < 0 || e <= s) return;
    cur = { mode: 'new', c: c, s: s, e: e, t: c.textContent.slice(s, e) };
    show('new');
    place(r.getBoundingClientRect());
  }
  document.addEventListener('mouseup', function (e) { if (bar.contains(e.target)) return; setTimeout(onSelect, 10); });
  document.addEventListener('touchend', function (e) { if (bar.contains(e.target)) return; setTimeout(onSelect, 200); });
  document.addEventListener('click', function (e) {
    if (bar.contains(e.target)) return;
    var m = e.target.closest && e.target.closest('mark.hl');
    if (m && window.getSelection().isCollapsed) {
      var h = list.filter(function (x) { return x.id === m.getAttribute('data-hl'); })[0];
      if (!h) return;
      cur = { mode: 'edit', id: h.id, color: h.color, t: h.t };
      show('edit');
      place(m.getBoundingClientRect());
      return;
    }
    if (window.getSelection().isCollapsed) hide();
  });
  document.addEventListener('scroll', function () { if (bar.classList.contains('on')) hide(); }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });

  bar.addEventListener('mousedown', function (e) { e.preventDefault(); }); // tanlov yo'qolmasin
  bar.addEventListener('click', function (e) {
    var dot = e.target.closest('.hl-dot'), act = e.target.closest('.hl-act');
    if (!cur) return;
    if (dot) {
      var color = dot.dataset.c;
      if (cur.mode === 'new') {
        var id = 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
        list.push({ id: id, c: cid(cur.c), s: cur.s, e: cur.e, t: cur.t, color: color, at: Date.now() });
        save();
        wrap(cur.c, cur.s, cur.e, color, id, true);
        window.getSelection().removeAllRanges();
      } else {
        list.forEach(function (h) { if (h.id === cur.id) h.color = color; });
        save();
        document.querySelectorAll('mark.hl[data-hl="' + cur.id + '"]').forEach(function (m) { m.className = 'hl hl-' + color; });
      }
      hide();
    } else if (act && act.dataset.a === 'copy') {
      try { navigator.clipboard.writeText(cur.t || window.getSelection().toString()); } catch (err) {}
      hide();
    } else if (act && act.dataset.a === 'del' && cur.mode === 'edit') {
      unwrap(cur.id);
      list = list.filter(function (h) { return h.id !== cur.id; });
      save(); hide();
    }
  });

  window.mhpHighlights = { restore: restore };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', restore); else restore();
})();
