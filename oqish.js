/* Hamkor maqolalarni sayt ichida ko'rsatuvchi sahifa. Faqat ruxsat etilgan manbalar ochiladi. */
(function () {
  var ALLOWED = ['sirdaryo24.uz'];
  var q = new URLSearchParams(location.search);
  var url = q.get('u') || '';
  var host = '';
  try { var x = new URL(url); if (x.protocol === 'https:' && ALLOWED.indexOf(x.hostname.replace(/^www\./, '')) > -1) host = x.hostname; } catch (e) {}
  var frame = document.getElementById('vwFrame'), load = document.getElementById('vwLoad');
  if (!host) {
    document.querySelector('.vw-frame').innerHTML = '<p class="vw-err">Bu manba ruxsat etilmagan yoki havola noto\'g\'ri. <a href="maqolalar.html">Maqolalarga qaytish</a></p>';
    return;
  }
  document.getElementById('vwTitle').textContent = q.get('t') || 'Maqola';
  document.getElementById('vwHost').textContent = host;
  document.getElementById('vwOpen').href = url;
  document.title = (q.get('t') || 'Maqola') + ' — MyHarvardPath';
  frame.addEventListener('load', function () { load.style.display = 'none'; });
  frame.src = url;
  setTimeout(function () { load.style.display = 'none'; }, 8000);
})();
