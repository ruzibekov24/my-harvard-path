/* Oddiy maqola sahifalarini macOS Safari oynasi ichida ko'rsatadi: sayt menyusi va footeri yashiriladi, maqola oyna ichida aylanadi. */
(function () {
  var nav = document.querySelector('header.nav'), foot = document.querySelector('footer');
  if (!nav || !foot || document.body.classList.contains('vwp')) return;
  var BAR = "<div class=\"sf-bar\">\n    <div class=\"sf-lights\"><a href=\"maqolalar.html\" class=\"r\" aria-label=\"Yopish\"></a><i class=\"y\"></i><i class=\"g\"></i></div>\n    <div class=\"sf-pill sf-grp\"><span class=\"sf-ic\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"4.5\" width=\"18\" height=\"15\" rx=\"3.5\"/><path d=\"M9.5 4.5v15M5.8 8.5h1.4M5.8 11.5h1.4\"/></svg></span><span class=\"sf-ic sm\"><svg viewBox=\"0 0 24 24\" width=\"13\" height=\"13\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M7 10l5 5 5-5\"/></svg></span></div>\n    <div class=\"sf-pill sf-grp\"><a href=\"maqolalar.html\" class=\"sf-ic\" aria-label=\"Orqaga\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M14.5 6l-6 6 6 6\"/></svg></a><i class=\"sf-sep\"></i><span class=\"sf-ic dim\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M9.5 6l6 6-6 6\"/></svg></span></div>\n    <div class=\"sf-pill sf-grp\"><span class=\"sf-ic\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.5V12l3.2 1.8\"/></svg></span></div>\n    <div class=\"sf-pill sf-addr\"><span class=\"sf-ic sm dim\"><svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"4.5\" y=\"5\" width=\"15\" height=\"14\" rx=\"3\"/><path d=\"M4.5 9.5h15\"/></svg></span><span id=\"mwHost\">sirdaryo24.uz</span><button type=\"button\" id=\"mwReload\" class=\"sf-ic sm\" aria-label=\"Yangilash\"><svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M19.2 12a7.2 7.2 0 1 1-2.2-5.2\"/><path d=\"M19.5 4.5v4.6h-4.6\"/></svg></button></div>\n    <div class=\"sf-pill sf-grp\"><a id=\"mwShare\" class=\"sf-ic\" href=\"#\" aria-label=\"Ulashish\" title=\"Havolani ulashish\"><svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7.5v8M8.4 12.6l3.6 3.6 3.6-3.6\"/></svg></a><i class=\"sf-sep\"></i><span class=\"sf-ic\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 5.5v13M5.5 12h13\"/></svg></span></div>\n  </div>\n  <div class=\"sf-urlrow\"><div class=\"sf-url\"><img src=\"favicon-16x16.png\" alt=\"\" width=\"16\" height=\"16\"><span id=\"mwUrl\">https://sirdaryo24.uz</span></div></div>\n  ";
  var win = document.createElement('div');
  win.className = 'sf-win mw-win';
  win.innerHTML = BAR + '<div class="vw-frame mw-scroll" id="mwScroll"></div>';
  var scroll = win.querySelector('#mwScroll');
  // menyu va footer orasidagi hamma narsa oyna ichiga ko'chadi
  var n = nav.nextSibling, move = [];
  while (n && n !== foot) { move.push(n); n = n.nextSibling; }
  move.forEach(function (el) { scroll.appendChild(el); });
  nav.style.display = 'none'; foot.style.display = 'none';
  document.body.classList.add('vwp', 'mw');
  document.body.insertBefore(win, nav);

  var url = location.host + location.pathname.replace(/\.html$/, '');
  win.querySelector('#mwHost').textContent = location.host;
  win.querySelector('#mwUrl').textContent = location.protocol + '//' + url;
  win.querySelector('#mwReload').onclick = function () { location.reload(); };
  win.querySelector('#mwShare').onclick = function (e) {
    e.preventDefault();
    var href = location.origin + location.pathname;
    if (navigator.share) { navigator.share({ title: document.title, url: href }).catch(function () {}); return; }
    try { navigator.clipboard.writeText(href); var a = e.currentTarget; a.classList.add('ok'); setTimeout(function () { a.classList.remove('ok'); }, 1200); } catch (err) {}
  };
})();
