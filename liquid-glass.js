/* iOS 27 "Clear" Liquid Glass butun sayt uchun.
   Material qiymatlari Figma'dagi "iOS 27 Liquid Glass Material" faylidan olingan:
     fill #F8F8F8 6%, tashqi chiziq #000 40% 0.5px, 8 ta ichki soya + 1 ta tashqi soya,
     Glass effekti: light -45° 80%, refraction 63, depth 44, dispersion 100, frost 0, splay 0.
   Refraction: har bir element uchun uning yumaloq to'rtburchak shakli bo'yicha masofa maydoni (SDF) hisoblanadi.
   Qirra zonasida orqa fon ichkariga qarab kuchli suriladi; surilish zonadan katta bo'lgani uchun qirrada tasvir
   teskari (ko'zgudek) ko'rinadi, markaz esa tiniq qoladi. Dispersion: R, G, B kanallari biroz farqli kuch bilan
   suriladi, shuning uchun qirralarda rangli (moviy/to'q sariq) chiziq paydo bo'ladi.
   backdrop-filter: url() faqat Chromium'da ishlaydi; boshqa brauzerlarda shisha tiniq, lekin egilishsiz. */
(function () {
  if (window.__liquidGlass) return;
  window.__liquidGlass = true;

  var CLEAR = [
    'header.nav.is-pill .nav-inner', '.theme-seg', '.tg-user-box', '.nav-cta', '.tg-login',
    '.btn-ghost-dark', '.btn-ghost', '.chip', '.uni-filter', '.mode-tab', '.flash-mark',
    '.rl-dock', '.book-modal-close', '.theme-toggle',
    '.rz-tabs-main', '.rz-tabs-side', '.rz-gal-hud', '.rz-gal-zoom button', '.rz-seg', '.rz-pill',
    '.yl-sf', '.yl-chips button', '.yl-back', '.yl-count-s', '.yl-pillbig',
    '.sf-pill', '.sf-url', '.mw-dockicon'
  ].join(',');
  var REFRACTION = 0.63, DEPTH = 0.44, DISPERSION = 1.0;
  var refract = !!window.chrome && /Chrom(e|ium)\/|Edg\//.test(navigator.userAgent);
  var NS = 'http://www.w3.org/2000/svg';
  var root = document.documentElement;
  root.classList.add('lg', refract ? 'lg-refract' : 'lg-flat');

  // Figma'dagi soyalar va to'ldirish aynan shu tartibda
  var SHADOWS = [
    'inset 0 -4px 4px rgba(255,255,255,.45)', 'inset 0 4px 4px rgba(255,255,255,.45)',
    'inset 0 6px 10px rgba(255,255,255,.02)', 'inset 0 -14px 34px rgba(255,255,255,.04)',
    'inset -4px 0 14px rgba(0,0,0,.08)', 'inset 4px 0 14px rgba(0,0,0,.08)',
    'inset 0 2px 0 rgba(255,255,255,.35)', 'inset 0 -2px 0 rgba(255,255,255,.35)',
    '0 2px 10px rgba(0,0,0,.10)', '0 0 0 .5px rgba(0,0,0,.40)'
  ].join(',');
  var css = document.createElement('style');
  css.textContent =
    'html.lg .lg-on{background-color:rgba(248,248,248,.06)!important;background-image:none!important;border-color:transparent!important;box-shadow:' + SHADOWS + '!important}' +
    'html.lg-flat .lg-on{-webkit-backdrop-filter:saturate(1.5) brightness(1.04)!important;backdrop-filter:saturate(1.5) brightness(1.04)!important}' +
    // matn ko'p bo'lgan navbar kapsulasi o'qilishi uchun yengil tus
    'html.lg header.nav.is-pill .nav-inner.lg-on{background-color:rgba(255,255,255,.42)!important}' +
    'html[data-theme="dark"].lg .lg-on{background-color:rgba(20,20,24,.10)!important;box-shadow:inset 0 -4px 4px rgba(255,255,255,.12),inset 0 4px 4px rgba(255,255,255,.14),inset -4px 0 14px rgba(0,0,0,.25),inset 4px 0 14px rgba(0,0,0,.25),inset 0 2px 0 rgba(255,255,255,.18),inset 0 -2px 0 rgba(255,255,255,.1),0 2px 10px rgba(0,0,0,.3),0 0 0 .5px rgba(255,255,255,.18)!important}' +
    'html[data-theme="dark"].lg header.nav.is-pill .nav-inner.lg-on{background-color:rgba(28,28,32,.55)!important}';
  document.head.appendChild(css);

  var defs = null;
  function ensureDefs() {
    if (defs) return defs;
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
    defs = document.createElementNS(NS, 'defs');
    svg.appendChild(defs);
    document.body.appendChild(svg);
    return defs;
  }

  // Yumaloq to'rtburchak bo'yicha displacement xaritasi (canvas'da hisoblanadi).
  // R/G: ichkariga qarab surilish yo'nalishi * kuch; 128 = joyida.
  var cvs = document.createElement('canvas');
  function rimMap(w, h, r, band) {
    cvs.width = w; cvs.height = h;
    var ctx = cvs.getContext('2d');
    var img = ctx.createImageData(w, h), d = img.data;
    var hw = w / 2, hh = h / 2, ex = hw - r, ey = hh - r;
    for (var y = 0; y < h; y++) {
      var py = y + 0.5 - hh, ay = Math.abs(py), qy = ay - ey;
      for (var x = 0; x < w; x++) {
        var px = x + 0.5 - hw, ax = Math.abs(px), qx = ax - ex;
        var nx, ny, dist;
        if (qx > 0 && qy > 0) {
          var len = Math.sqrt(qx * qx + qy * qy) || 1;
          nx = qx / len; ny = qy / len; dist = r - len;
        } else if (qx > qy) { nx = 1; ny = 0; dist = r - qx; }
        else { nx = 0; ny = 1; dist = r - qy; }
        var f = dist < band ? Math.pow(1 - Math.max(0, dist) / band, 1.7) : 0;
        var sx = px < 0 ? 1 : -1, sy = py < 0 ? 1 : -1;   // ichkariga
        var i = (y * w + x) * 4;
        d[i] = Math.round(128 + 127 * sx * nx * f);
        d[i + 1] = Math.round(128 + 127 * sy * ny * f);
        d[i + 2] = 128; d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return cvs.toDataURL('image/png');
  }

  var state = new Map(), seq = 0;
  function build(el) {
    var w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
    if (w < 8 || h < 8) return;
    var st = state.get(el);
    if (st && st.w === w && st.h === h) return;
    if (!st) { st = { id: 'lg' + (++seq) }; state.set(el, st); ro && ro.observe(el); }
    st.w = w; st.h = h;
    el.classList.add('lg-on');
    if (!refract) return;
    var r = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 12, w / 2, h / 2);
    var band = Math.max(6, Math.min(40, Math.min(w, h) * DEPTH * 0.85, r));
    var S = band * (0.55 + REFRACTION * 0.85);   // zonadan katta surilish: qirrada ko'zgu effekti
    var f = st.f;
    if (!f) {
      f = document.createElementNS(NS, 'filter');
      f.setAttribute('id', st.id);
      f.setAttribute('filterUnits', 'userSpaceOnUse');
      f.setAttribute('primitiveUnits', 'userSpaceOnUse');
      f.setAttribute('color-interpolation-filters', 'sRGB');
      ensureDefs().appendChild(f);
      st.f = f;
    }
    f.setAttribute('x', '0'); f.setAttribute('y', '0'); f.setAttribute('width', w); f.setAttribute('height', h);
    var box = ' x="0" y="0" width="' + w + '" height="' + h + '" preserveAspectRatio="none"';
    var sc = function (k) { return (2 * S * k).toFixed(1); };
    var disp = DISPERSION * 0.035;
    f.innerHTML =
      '<feImage result="m"' + box + ' href="' + rimMap(w, h, r, band) + '"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="m" scale="' + sc(1) + '" xChannelSelector="R" yChannelSelector="G" result="dr"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="m" scale="' + sc(1 - disp) + '" xChannelSelector="R" yChannelSelector="G" result="dg"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="m" scale="' + sc(1 - 2 * disp) + '" xChannelSelector="R" yChannelSelector="G" result="db"/>' +
      '<feColorMatrix in="dr" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="cr"/>' +
      '<feColorMatrix in="dg" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="cg"/>' +
      '<feColorMatrix in="db" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="cb"/>' +
      '<feComposite in="cr" in2="cg" operator="arithmetic" k2="1" k3="1" result="rg"/>' +
      '<feComposite in="rg" in2="cb" operator="arithmetic" k2="1" k3="1"/>';
    el.style.setProperty('backdrop-filter', 'url(#' + st.id + ') saturate(1.45) brightness(1.04)', 'important');
  }
  function drop(el) {
    var st = state.get(el); if (!st) return;
    el.classList.remove('lg-on');
    el.style.removeProperty('backdrop-filter');
    if (st.f) st.f.remove();
    ro && ro.unobserve(el);
    state.delete(el);
  }

  var ro = 'ResizeObserver' in window ? new ResizeObserver(function (entries) { entries.forEach(function (e) { build(e.target); }); }) : null;
  var pending = false;
  function scan() {
    pending = false;
    var now = new Set(document.querySelectorAll(CLEAR));
    state.forEach(function (_, el) { if (!now.has(el) || !el.isConnected) drop(el); });
    now.forEach(build);
  }
  function soon() { if (!pending) { pending = true; requestAnimationFrame(scan); } }
  new MutationObserver(soon).observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', soon);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
})();
