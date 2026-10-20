/* Hamkor maqolani sayt ichida ko'rsatish: faqat maqolaning o'zi (sarlavha, rasm, matn), manba saytining menyulari va boshqa sahifalari yo'q. */
(function () {
  var ALLOWED = ['sirdaryo24.uz'];
  var q = new URLSearchParams(location.search);
  var url = q.get('u') || '';
  var host = '';
  try { var x = new URL(url); if (x.protocol === 'https:' && ALLOWED.indexOf(x.hostname.replace(/^www\./, '')) > -1) host = x.hostname.replace(/^www\./, ''); } catch (e) {}
  var art = document.getElementById('vwArt'), load = document.getElementById('vwLoad');
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var fail = function (msg) {
    load.style.display = 'none';
    art.hidden = false;
    art.innerHTML = '<p class="vw-err">' + msg + ' <a href="maqolalar.html">Maqolalarga qaytish</a></p>';
  };
  if (!host) return fail("Bu manba ruxsat etilmagan yoki havola noto'g'ri.");
  document.getElementById('vwHost').textContent = host;
  document.getElementById('vwUrl').textContent = url;
  document.getElementById('vwOpen').href = url;
  document.title = (q.get('t') || 'Maqola') + ' — MyHarvardPath';

  function render(d) {
    document.title = d.title + ' — MyHarvardPath';
    var paras = d.paragraphs.slice(), by = [];
    // oxirgi qisqa qatorlar muallif ma'lumoti
    while (paras.length > 2 && paras[paras.length - 1].length < 90 && by.length < 3) by.unshift(paras.pop());
    art.innerHTML =
      '<div class="vw-meta"><span class="vw-badge">Maqolalar</span>' + (d.date ? '<time>' + esc(d.date) + '</time>' : '') + '</div>' +
      '<h1>' + esc(d.title) + '</h1>' +
      (d.image ? '<img class="vw-hero" src="' + esc(d.image) + '" alt="' + esc(d.title) + '" referrerpolicy="no-referrer">' : '') +
      '<div class="vw-body">' + paras.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' +
      (by.length ? '<div class="vw-by">' + by.map(function (p) { return '<div>' + esc(p) + '</div>'; }).join('') + '</div>' : '') +
      '<div class="vw-src">Manba: <a href="' + esc(d.url) + '" target="_blank" rel="noopener">Yangi Sirdaryo gazetasi (' + esc(d.source) + ') ↗</a><span>Maqola to\'liq holda asl sahifada.</span></div>';
    load.style.display = 'none';
    art.hidden = false;
  }

  function get() {
    load.style.display = 'flex'; art.hidden = true;
    fetch('/api/embed?u=' + encodeURIComponent(url))
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(render)
      .catch(function () { fail("Maqolani yuklab bo'lmadi."); });
  }
  document.getElementById('vwReload').onclick = get;
  get();
})();
