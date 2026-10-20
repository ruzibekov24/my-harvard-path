/* Hamkor maqolani sayt ichida ko'rsatish: faqat maqolaning o'zi (sarlavha, rasm, matn), manba saytining menyulari va boshqa sahifalari yo'q. */
(function () {
  var ALLOWED = ['sirdaryo24.uz'];
  var q = new URLSearchParams(location.search);
  var url = q.get('u') || '';
  var host = '';
  try { var x = new URL(url); if (x.protocol === 'https:' && ALLOWED.indexOf(x.hostname.replace(/^www\./, '')) > -1) host = x.hostname.replace(/^www\./, ''); } catch (e) {}
  var art = document.getElementById('vwArt'), load = document.getElementById('vwLoad');
  // Ingliz tiliga tarjimalar (Ilyos Ruzibekov tarjimasi), manba havolasi bo'yicha
  var TR = {
    'https://sirdaryo24.uz/uz/news/166': {
      title: 'A battle of mind and spirit',
      date: '15 October 2026',
      paragraphs: [
        'Most people have at least some idea of chess, the game of the intellect that is becoming more and more popular in our country. Its long history and the successes our land has achieved in this field are known to all of us. In truth, the table on which the game is played cannot be called just a wooden field. It holds a kind of magic made of millions of decisions, hidden plans and unexpected moves.',
        'Every piece seems to have a character of its own: one is small, yet strides forward fiercely without ever turning back; another can cut across the whole board in an instant and strike suddenly. The moment you reach for one of the pieces, your heartbeat slows and countless different scenarios come alive in your mind at once.',
        'There is no room for chance in this struggle. Every move, every retreat and every sacrificed piece is an expression of deep thought and contentment. Across the board it is not first of all your opponent but your own patience and attention that are being tested. Time seems to stop for a moment, as if the fight were truly alive, all the noise around you fades, and only one aim remains: to shake the foundations of your opponent with a single, precise and perfect move.',
        'Your body relishes the thrill of springing the trap, and the face of the one who has lost his defence brings excitement and pride at once, along with a final, decisive sharpness of feeling. Shah and mat…'
      ],
      by: ['Shahzoda OBLOQULOVA,', 'Halima Xudoyberdiyeva Creative School', 'Member of the “Young Creators” club'],
      credit: 'Translated into English by Ilyos Ruzibekov',
      source: 'Source', sourceNote: 'The full article is on the original page.', badge: 'Articles'
    }
  };
  var lang = (function () { try { var p = new URLSearchParams(location.search).get('lang'); return p === 'en' ? 'en' : p === 'uz' ? 'uz' : (localStorage.getItem('mhp_read_lang') === 'en' ? 'en' : 'uz'); } catch (e) { return 'uz'; } })();
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

  var last = null;
  function render(d) {
    last = d;
    var t = TR[d.url] || TR[url];
    var en = lang === 'en' && !!t;
    var title = en ? t.title : d.title, date = en ? t.date : d.date, image = d.image;
    var paras = en ? t.paragraphs.slice() : d.paragraphs.slice(), by = [];
    if (en) by = t.by.slice();
    else while (paras.length > 2 && paras[paras.length - 1].length < 90 && by.length < 3) by.unshift(paras.pop());
    document.title = title + ' — MyHarvardPath';
    var sw = t ? '<div class="vw-lang" role="tablist"><button type="button" data-l="uz" class="' + (en ? '' : 'on') + '">O’zbekcha</button><button type="button" data-l="en" class="' + (en ? 'on' : '') + '">English</button></div>' : '';
    art.innerHTML =
      '<div class="vw-top">' + sw + '</div>' +
      '<div class="vw-meta"><span class="vw-badge">' + (en ? t.badge : 'Maqolalar') + '</span>' + (date ? '<time>' + esc(date) + '</time>' : '') + '</div>' +
      '<h1>' + esc(title) + '</h1>' +
      (image ? '<img class="vw-hero" src="' + esc(image) + '" alt="' + esc(title) + '" referrerpolicy="no-referrer">' : '') +
      '<div class="vw-body">' + paras.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' +
      (by.length ? '<div class="vw-by">' + by.map(function (p) { return '<div>' + esc(p) + '</div>'; }).join('') + '</div>' : '') +
      (en ? '<div class="vw-tr">' + esc(t.credit) + '</div>' : '') +
      '<div class="vw-src">' + (en ? t.source : 'Manba') + ': <a href="' + esc(d.url) + '" target="_blank" rel="noopener">Yangi Sirdaryo ' + (en ? 'newspaper' : 'gazetasi') + ' (' + esc(d.source) + ') ↗</a><span>' + (en ? t.sourceNote : "Maqola to'liq holda asl sahifada.") + '</span></div>';
    art.querySelectorAll('.vw-lang button').forEach(function (b) {
      b.onclick = function () { lang = b.dataset.l; try { localStorage.setItem('mhp_read_lang', lang); } catch (e) {} render(last); document.querySelector('.vw-frame').scrollTop = 0; };
    });
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
