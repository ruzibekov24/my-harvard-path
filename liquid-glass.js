/* "Clear" Liquid Glass (iOS 26 / macOS 26 uslubi) butun sayt uchun.
   Frosted/blur o'rniga: orqadagi kontent tiniq ko'rinadi, faqat chetlarida linza kabi egiladi (refraction)
   va qirralarda yorug'lik aksi bor. Egilish SVG displacement map bilan qilinadi: har bir shisha element uchun
   o'z o'lchamidagi xarita yaratiladi, shuning uchun chetdagi egilish kengligi har doim bir xil (piksellarda).
   backdrop-filter: url() faqat Chromium'da ishlaydi; boshqa brauzerlarda shisha tiniq qoladi, lekin egilishsiz. */
(function () {
  if (window.__liquidGlass) return;
  window.__liquidGlass = true;

  var CLEAR = [
    '.rl-dock', 'header.nav.is-pill .nav-inner',
    '.rz-tabs-main', '.rz-tabs-side', '.rz-gal-hud', '.rz-gal-zoom button',
    '.yl-sf', '.sf-pill', '.sf-url', '.mw-dockicon'
  ].join(',');
  var EDGE = 16;      // chetdagi egilish zonasi, px
  var STRENGTH = 26;  // egilish kuchi, px
  var refract = !!window.chrome && /Chrom(e|ium)\/|Edg\//.test(navigator.userAgent);
  var NS = 'http://www.w3.org/2000/svg';
  document.documentElement.classList.add('lg', refract ? 'lg-refract' : 'lg-flat');
  var css = document.createElement('style');
  css.textContent = 'html.lg .lg-on{background-color:rgba(255,255,255,.07)!important;background-image:linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,.03) 60%)!important;border-color:transparent!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.8),inset 0 -1px 0 rgba(255,255,255,.25),inset 1px 0 0 rgba(255,255,255,.3),inset -1px 0 0 rgba(255,255,255,.3),0 0 0 .5px rgba(0,0,0,.08),0 10px 28px rgba(0,0,0,.14)!important}\nhtml.lg-flat .lg-on{-webkit-backdrop-filter:saturate(1.6) brightness(1.05)!important;backdrop-filter:saturate(1.6) brightness(1.05)!important}\nhtml.lg header.nav.is-pill .nav-inner.lg-on{background-color:rgba(255,255,255,.2)!important}\nhtml[data-theme="dark"].lg .lg-on{background-color:rgba(28,28,32,.16)!important;background-image:linear-gradient(180deg,rgba(255,255,255,.09),rgba(255,255,255,0) 60%)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.3),inset 0 -1px 0 rgba(255,255,255,.08),inset 1px 0 0 rgba(255,255,255,.12),inset -1px 0 0 rgba(255,255,255,.12),0 0 0 .5px rgba(255,255,255,.08),0 10px 28px rgba(0,0,0,.45)!important}\nhtml[data-theme="dark"].lg header.nav.is-pill .nav-inner.lg-on{background-color:rgba(28,28,32,.35)!important}';
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

  // Displacement map: R = gorizontal, G = vertikal surilish; 128 = joyida. Chetlarga yaqinlashganda qiymat
  // keskin o'zgaradi (qavariq linza qirrasi), markaz esa tekis va tiniq.
  function mapURI(w, h, r) {
    var fx = Math.min(0.45, EDGE / w), fy = Math.min(0.45, EDGE / h);
    var stops = function (f, ch) {
      var c = function (v) { return ch === 'r' ? 'rgb(' + v + ',0,0)' : 'rgb(0,' + v + ',0)'; };
      return '<stop offset="0" stop-color="' + c(255) + '"/>' +
        '<stop offset="' + (f * 0.35).toFixed(4) + '" stop-color="' + c(205) + '"/>' +
        '<stop offset="' + f.toFixed(4) + '" stop-color="' + c(128) + '"/>' +
        '<stop offset="' + (1 - f).toFixed(4) + '" stop-color="' + c(128) + '"/>' +
        '<stop offset="' + (1 - f * 0.35).toFixed(4) + '" stop-color="' + c(51) + '"/>' +
        '<stop offset="1" stop-color="' + c(0) + '"/>';
    };
    var s = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' +
      '<defs><linearGradient id="x" x1="0" y1="0" x2="1" y2="0">' + stops(fx, 'r') + '</linearGradient>' +
      '<linearGradient id="y" x1="0" y1="0" x2="0" y2="1">' + stops(fy, 'g') + '</linearGradient>' +
      '<filter id="b"><feGaussianBlur stdDeviation="' + Math.max(1, Math.min(r, EDGE) / 4).toFixed(1) + '"/></filter></defs>' +
      '<rect width="' + w + '" height="' + h + '" fill="rgb(128,128,0)"/>' +
      '<g filter="url(#b)"><rect width="' + w + '" height="' + h + '" fill="url(#x)"/>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#y)" style="mix-blend-mode:screen"/></g></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
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
    var r = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 12;
    var f = st.f;
    if (!f) {
      f = document.createElementNS(NS, 'filter');
      f.setAttribute('id', st.id);
      f.setAttribute('filterUnits', 'userSpaceOnUse');
      f.setAttribute('primitiveUnits', 'userSpaceOnUse');
      f.setAttribute('color-interpolation-filters', 'sRGB');
      f.innerHTML = '<feImage result="m" preserveAspectRatio="none"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="m" xChannelSelector="R" yChannelSelector="G"/>';
      ensureDefs().appendChild(f);
      st.f = f;
    }
    f.setAttribute('x', '0'); f.setAttribute('y', '0'); f.setAttribute('width', w); f.setAttribute('height', h);
    var img = f.firstChild;
    img.setAttribute('x', '0'); img.setAttribute('y', '0'); img.setAttribute('width', w); img.setAttribute('height', h);
    img.setAttribute('href', mapURI(w, h, r));
    f.lastChild.setAttribute('scale', Math.min(STRENGTH, Math.min(w, h) * 0.5).toFixed(1));
    var v = 'url(#' + st.id + ') saturate(1.6) brightness(1.05)';
    el.style.setProperty('backdrop-filter', v, 'important');
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
  new MutationObserver(soon).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', soon);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
})();
