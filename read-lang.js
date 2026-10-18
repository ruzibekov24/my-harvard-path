// Maqolalar uchun o'qish tili (UZ / EN) almashtirgichi.
// Sahifada [data-lang] bloklari bo'lsa, pastki burchakda "o'qish tili" paneli paydo bo'ladi.
// Tanlov localStorage'da saqlanadi; ?lang=en havolasi ham ishlaydi.
// Boshlang'ich holat <head>dagi kichik skript orqali sahifa chizilishidan oldin qo'yiladi (miltillamaydi).
(function () {
  const root = document.documentElement;
  const KEY = 'mhp_read_lang';
  if (!document.querySelector('[data-lang]')) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const current = () => (root.getAttribute('data-read') === 'en' ? 'en' : 'uz');
  const titles = {
    uz: document.title,
    en: (document.querySelector('meta[name="title-en"]') || {}).content || document.title,
  };

  const dock = document.createElement('div');
  dock.className = 'rl-dock';
  dock.setAttribute('role', 'radiogroup');
  dock.innerHTML =
    '<span class="rl-thumb" aria-hidden="true"><span class="rl-thumb-in"></span></span>' +
    '<button type="button" role="radio" data-set="uz" lang="uz"><img src="images/emoji/emoji-uz.png" alt="" width="18" height="18">O‘zbekcha</button>' +
    '<button type="button" role="radio" data-set="en" lang="en"><img src="images/emoji/emoji-gb.png" alt="" width="18" height="18">English</button>';
  document.body.appendChild(dock);

  const buttons = dock.querySelectorAll('[data-set]');
  const thumb = dock.querySelector('.rl-thumb');

  function syncUi() {
    const l = current();
    dock.setAttribute('aria-label', l === 'en' ? 'Article language' : 'Maqola tili');
    buttons.forEach(b => {
      const on = b.dataset.set === l;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    document.title = titles[l];
  }

  const inView = el => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight && r.width > 0;
  };

  // Sarlavha harflari tasodifiy belgilardan asl matnga "yig'iladi".
  function scramble(el) {
    if (el.children.length || !el.textContent.trim()) return;
    const target = el.textContent;
    const pool = 'ABCDEFGHIKLMNOPRSTUVXYZabdefghiklmnoprstuvxyzʻ’';
    const dur = 620, t0 = performance.now();
    el.setAttribute('aria-label', target);
    const tick = now => {
      const k = Math.min(1, (now - t0) / dur);
      const fixed = Math.floor(k * target.length);
      let out = target.slice(0, fixed);
      for (let i = fixed; i < target.length; i++) {
        const c = target[i];
        out += c === ' ' || /[.,:;?!“”"'—–-]/.test(c) ? c : pool[(Math.random() * pool.length) | 0];
      }
      el.textContent = out;
      if (k < 1) requestAnimationFrame(tick);
      else { el.textContent = target; el.removeAttribute('aria-label'); }
    };
    requestAnimationFrame(tick);
  }

  function pieces(lang) {
    const set = [];
    document.querySelectorAll(`[data-lang="${lang}"]`).forEach(block => {
      const parts = block.matches('.lang-block')
        ? block.querySelectorAll(':scope > header > *, :scope > figure, :scope > .mq-body > *')
        : [block];
      parts.forEach(p => { if (inView(p)) set.push(p); });
    });
    return set;
  }

  let busy = false, queued = null;
  async function setLang(lang, animate) {
    if (busy) { queued = lang; dock.dataset.pos = lang; return; }
    if (lang === current()) { dock.dataset.pos = lang; return; }
    busy = true;
    const scroller = document.documentElement;
    const ratio = scrollY / Math.max(1, scroller.scrollHeight - innerHeight);
    const motion = animate && !reduce && 'animate' in Element.prototype && document.visibilityState === 'visible';

    dock.dataset.pos = lang;

    if (motion) {
      const outgoing = pieces(current());
      const fades = Promise.all(outgoing.map((el, i) => el.animate(
        [{ opacity: 1, filter: 'blur(0)', transform: 'none' }, { opacity: 0, filter: 'blur(6px)', transform: 'translateY(-10px)' }],
        { duration: 220, delay: Math.min(i, 6) * 18, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' }
      ).finished.catch(() => {})));
      // Animatsiya to'xtab qolsa ham (masalan, fon tabida) almashish kutib qolmasin.
      await Promise.race([fades, new Promise(r => setTimeout(r, 350))]);
      outgoing.forEach(el => el.getAnimations().forEach(a => a.cancel()));
    }

    if (lang === 'en') root.setAttribute('data-read', 'en'); else root.removeAttribute('data-read');
    try { localStorage.setItem(KEY, lang); } catch (e) { /* xotira yopiq bo'lsa ham ishlayveradi */ }
    try {
      const u = new URL(location.href);
      if (lang === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang');
      history.replaceState(null, '', u);
    } catch (e) {}
    syncUi();

    if (document.querySelector('.lang-block')) {
      scrollTo(0, ratio * Math.max(0, scroller.scrollHeight - innerHeight));
    }

    if (motion) {
      pieces(lang).forEach((el, i) => {
        el.animate(
          [{ opacity: 0, filter: 'blur(6px)', transform: 'translateY(14px)' }, { opacity: 1, filter: 'blur(0)', transform: 'none' }],
          { duration: 460, delay: 40 + Math.min(i, 10) * 55, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }
        );
        el.querySelectorAll('h1, h2, h3').forEach(scramble);
        if (/^H[1-3]$/.test(el.tagName)) scramble(el);
      });
    }
    setTimeout(() => {
      busy = false;
      // Animatsiya paytida bosilgan oxirgi tanlov yo'qolmasin.
      if (queued) { const q = queued; queued = null; setLang(q, animate); }
    }, motion ? 300 : 0);
  }

  // Klaviatura (Enter/Probel) orqali bosish; sichqoncha/barmoq pastdagi pointer hodisalarida.
  buttons.forEach(b => b.addEventListener('click', e => { if (e.detail === 0) setLang(b.dataset.set, true); }));

  // iOS 26 kabi: bosilganda tanlov shisha linzaga aylanadi, uni sudrab ham o'tkazish mumkin.
  let drag = null, lensTimer = 0;
  dock.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    clearTimeout(lensTimer);
    dock.setPointerCapture(e.pointerId);
    const r = dock.getBoundingClientRect();
    drag = { x0: e.clientX, r, half: (r.width - 6) / 2, from: current(), moved: false, x: 0 };
    dock.classList.add('pressing');
  });
  dock.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x0;
    if (!drag.moved && Math.abs(dx) > 4) { drag.moved = true; dock.classList.add('dragging'); }
    if (!drag.moved) return;
    const base = drag.from === 'en' ? drag.half : 0;
    drag.x = Math.max(0, Math.min(drag.half, base + dx));
    thumb.style.transform = `translateX(${drag.x}px)`;
  });
  dock.addEventListener('pointerup', e => {
    if (!drag) return;
    const target = drag.moved
      ? (drag.x > drag.half / 2 ? 'en' : 'uz')
      : (e.clientX - drag.r.left > drag.r.width / 2 ? 'en' : 'uz');
    dock.classList.remove('dragging');
    thumb.style.transform = '';
    drag = null;
    if (target !== current()) setLang(target, true);
    else dock.dataset.pos = target;
    lensTimer = setTimeout(() => dock.classList.remove('pressing'), reduce ? 0 : 320);
  });
  dock.addEventListener('pointercancel', () => {
    dock.classList.remove('pressing', 'dragging'); thumb.style.transform = ''; drag = null;
  });
  dock.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    const next = current() === 'uz' ? 'en' : 'uz';
    setLang(next, true).then(() => dock.querySelector(`[data-set="${next}"]`).focus());
  });

  dock.dataset.pos = current();
  syncUi();
  requestAnimationFrame(() => setTimeout(() => dock.classList.add('in'), 450));
})();
