/* ---------- Silliq (inertial) scroll ----------
   Brauzerning o'z scroll'i qattiq va sakrab tushadi. Bu yerda haqiqiy scroll
   pozitsiyasiga har kadrda asta-sekin yaqinlashamiz (lerp), natijada tez
   aylantirilganda ham sahifa yumshoq to'xtaydi.

   Kutubxona ishlatilmadi — 30 qator kod kifoya. Klaviatura, sensor va
   "reduced motion" sozlamasi hurmat qilinadi. */
(function smoothScroll() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches; // telefon/planshet
  if (reduced || coarse) return; // sensorli ekranda tizimning o'z inertiyasi bor

  let target = window.scrollY;
  let current = target;
  let running = false;
  let lastSet = current; // biz o'rnatgan oxirgi pozitsiya

  function max() {
    return document.documentElement.scrollHeight - window.innerHeight;
  }

  function frame() {
    if (!running) return;

    /* Tashqi scroll (havola, scrollTo, klaviatura, scrollIntoView) ustun:
       o'tgan kadrda biz qo'ygan joydan siljigan bo'lsa, boshqa kimdir
       ko'chirgan — animatsiyani to'xtatamiz. Tekshiruv kadr ichida, chunki
       scroll hodisasi kechikib kelib yolg'on signal berardi. */
    if (Math.abs(window.scrollY - lastSet) > 3) {
      running = false;
      current = target = lastSet = window.scrollY;
      return;
    }

    current += (target - current) * 0.12;
    if (Math.abs(target - current) < 0.4) {
      current = target;
      running = false;
    }
    // 'instant' shart: CSS'dagi scroll-behavior: smooth bo'lmasa, har bir
    // qadamimizni brauzer yana qayta animatsiya qilib, harakat sudraladi
    window.scrollTo({ top: current, behavior: 'instant' });
    lastSet = window.scrollY;
    if (running) requestAnimationFrame(frame);
  }

  /* Ichida o'z scroll'i bor element (modal, uzun ro'yxat, dropdown) ustida
     turgan bo'lsak — sahifani emas, o'sha elementni aylantirish kerak.
     Kursor tagidagi zanjirni tekshiramiz: shu yo'nalishda joyi qolgan
     birinchi scrollable topilsa, brauzerga o'zi bajarsin deb qo'yib beramiz. */
  function scrollableUnder(node, dy) {
    for (let el = node; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
      if (!(el instanceof Element)) continue;
      const room = el.scrollHeight - el.clientHeight;
      if (room <= 1) continue;
      const oy = getComputedStyle(el).overflowY;
      if (oy !== 'auto' && oy !== 'scroll') continue;
      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollTop >= room - 1;
      if ((dy < 0 && !atTop) || (dy > 0 && !atBottom)) return true;
    }
    return false;
  }

  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) return; // zoom — tegmaymiz
    if (scrollableUnder(e.target, e.deltaY)) return;
    e.preventDefault();
    target = Math.min(max(), Math.max(0, target + e.deltaY));
    if (!running) { running = true; requestAnimationFrame(frame); }
  }, { passive: false });

  // Animatsiya ishlamayotganda boshqa manbalar bilan sinxron turamiz
  window.addEventListener('scroll', () => {
    if (!running) { current = target = lastSet = window.scrollY; }
  }, { passive: true });

  window.addEventListener('resize', () => { target = Math.min(target, max()); });
})();

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const navGroups = document.querySelectorAll('.nav-group');

function closeAllNavGroups() {
  navGroups.forEach(g => {
    g.classList.remove('open');
    const trigger = g.querySelector('.nav-group-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  });
}

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    if (!navLinks.classList.contains('open')) closeAllNavGroups();
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    closeAllNavGroups();
  }));
}

// Nav dropdown groups: click/tap to open (covers touch + keyboard; desktop mouse also gets CSS hover)
navGroups.forEach(group => {
  const trigger = group.querySelector('.nav-group-trigger');
  if (!trigger) return;
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = group.classList.contains('open');
    navGroups.forEach(g => { if (g !== group) { g.classList.remove('open'); g.querySelector('.nav-group-trigger')?.setAttribute('aria-expanded', 'false'); } });
    group.classList.toggle('open', !isOpen);
    trigger.setAttribute('aria-expanded', String(!isOpen));
  });
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-group')) closeAllNavGroups();
});

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  if (!q) return;
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// Scroll reveal — panjara (grid) ichidagi kartalarga ustuniga qarab turli
// yo'nalish beriladi (chap/o'ng/ichdan), panjaradan tashqarisi pastdan chiqadi.
document.querySelectorAll('.cards').forEach(grid => {
  const colsClass = [...grid.classList].find(c => /^cols-\d+$/.test(c));
  const numCols = colsClass ? parseInt(colsClass.split('-')[1], 10) : 3;
  const items = grid.querySelectorAll(':scope > .reveal');
  items.forEach((el, i) => {
    const col = i % numCols;
    if (numCols >= 3) {
      if (col === 0) el.classList.add('reveal-left');
      else if (col === numCols - 1) el.classList.add('reveal-right');
      else el.classList.add('reveal-scale');
    } else if (numCols === 2) {
      el.classList.add(col === 0 ? 'reveal-left' : 'reveal-right');
    }
    // Ketma-ket (stagger) kechikish — kartalar birma-bir, kinematik chiqadi
    el.style.transitionDelay = `${col * 90}ms`;
  });
});

const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

// Resource search + category filter (ingliz-tili.html)
const resGrid = document.getElementById('resGrid');
const resSearch = document.getElementById('resSearch');
const resChips = document.getElementById('resChips');
const resEmpty = document.getElementById('resEmpty');
if (resGrid && resChips) {
  const cards = Array.from(resGrid.querySelectorAll('.card'));
  let activeCat = 'all';

  function applyFilter() {
    const q = (resSearch?.value || '').trim().toLowerCase();
    let visibleCount = 0;
    cards.forEach(card => {
      const matchesCat = activeCat === 'all' || card.dataset.cat === activeCat;
      const matchesText = !q || card.textContent.toLowerCase().includes(q);
      const show = matchesCat && matchesText;
      card.classList.toggle('hide', !show);
      if (show) visibleCount++;
    });
    if (resEmpty) resEmpty.hidden = visibleCount !== 0;
  }

  resChips.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      resChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCat = chip.dataset.cat;
      applyFilter();
    });
  });

  if (resSearch) resSearch.addEventListener('input', applyFilter);
}

// Application checklist (harvard-yoli.html) — saved in localStorage
const clItems = document.getElementById('checklistItems');
if (clItems) {
  const STORAGE_KEY = 'myharvardpath-checklist';
  const boxes = Array.from(clItems.querySelectorAll('input[type="checkbox"]'));
  const fill = document.getElementById('clFill');
  const label = document.getElementById('clLabel');

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage unavailable — checklist still works for this session
    }
  }

  function updateProgress() {
    const checked = boxes.filter(b => b.checked).length;
    const pct = boxes.length ? Math.round((checked / boxes.length) * 100) : 0;
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = `${checked} / ${boxes.length} bajarildi`;
  }

  const state = loadState();
  boxes.forEach(box => {
    const key = box.dataset.cl;
    if (state[key]) box.checked = true;
    box.addEventListener('change', () => {
      const s = loadState();
      s[key] = box.checked;
      saveState(s);
      updateProgress();
      // Kirgan bo'lsa, serverga ham yozamiz — har bosqich 25 XP beradi.
      // Kirmagan bo'lsa localStorage'da qolaveradi (401 e'tiborsiz qoldiriladi).
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'checklist', itemId: key, done: box.checked }),
      }).catch(() => {});
    });
  });
  updateProgress();

  // Serverdagi holat localStorage'dan ustun: boshqa qurilmada belgilangan
  // bosqichlar ham shu yerda ko'rinsin.
  fetch('/api/me')
    .then(r => r.json())
    .then(data => {
      const done = data?.user?.checklist;
      if (!Array.isArray(done) || done.length === 0) return;
      const s = loadState();
      boxes.forEach(box => {
        if (done.includes(box.dataset.cl) && !box.checked) {
          box.checked = true;
          s[box.dataset.cl] = true;
        }
      });
      saveState(s);
      updateProgress();
    })
    .catch(() => {});
}

/* ==========================================================================
   YANGI QO'SHILGAN FUNKSIYALAR
   ========================================================================== */

/* ---------- Dark mode ----------
   Kun/tun almashtirgichi — maqolalardagi til tugmasi kabi iOS segmentli boshqaruv:
   oq "suzuvchi" tanlov, bosilganda shisha linza, sudrab o'tkazish ham mumkin. */
(function themeToggle() {
  const KEY = 'mhp-theme';
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === 'dark') root.setAttribute('data-theme', 'dark');

  const navInner = document.querySelector('.nav-inner');
  if (!navInner) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const current = () => (root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  const seg = document.createElement('div');
  seg.className = 'theme-seg';
  seg.setAttribute('role', 'radiogroup');
  seg.setAttribute('aria-label', 'Rejim');
  seg.innerHTML =
    '<span class="ts-thumb" aria-hidden="true"><span class="ts-thumb-in"></span></span>' +
    '<button type="button" role="radio" data-set="light" title="Kunduzgi rejim" aria-label="Kunduzgi rejim"><svg class="ts-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.6" fill="currentColor"/><g stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M12 2.4v2.2M12 19.4v2.2M2.4 12h2.2M19.4 12h2.2M5.2 5.2l1.55 1.55M17.25 17.25l1.55 1.55M5.2 18.8l1.55-1.55M17.25 6.75l1.55-1.55"/></g></svg></button>' +
    '<button type="button" role="radio" data-set="dark" title="Tungi rejim" aria-label="Tungi rejim"><svg class="ts-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.6 14.9a.75.75 0 0 0-.98-.9 7.4 7.4 0 0 1-9.6-9.6.75.75 0 0 0-.9-.98A9.25 9.25 0 1 0 20.6 14.9Z"/></svg></button>';
  navInner.appendChild(seg);
  const buttons = seg.querySelectorAll('[data-set]');
  const thumb = seg.querySelector('.ts-thumb');

  function apply(mode, save) {
    if (mode === 'dark') root.setAttribute('data-theme', 'dark'); else root.removeAttribute('data-theme');
    seg.dataset.pos = mode;
    buttons.forEach(b => {
      const on = b.dataset.set === mode;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    if (save) { try { localStorage.setItem(KEY, mode); } catch (e) {} }
  }
  apply(current(), false);

  buttons.forEach(b => b.addEventListener('click', e => { if (e.detail === 0) apply(b.dataset.set, true); }));
  seg.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    const next = current() === 'light' ? 'dark' : 'light';
    apply(next, true);
    seg.querySelector(`[data-set="${next}"]`).focus();
  });

  let drag = null, lensTimer = 0;
  seg.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    clearTimeout(lensTimer);
    seg.setPointerCapture(e.pointerId);
    const r = seg.getBoundingClientRect();
    drag = { x0: e.clientX, r, half: (r.width - 6) / 2, from: current(), moved: false, x: 0 };
    seg.classList.add('pressing');
  });
  seg.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x0;
    if (!drag.moved && Math.abs(dx) > 3) { drag.moved = true; seg.classList.add('dragging'); }
    if (!drag.moved) return;
    const base = drag.from === 'dark' ? drag.half : 0;
    drag.x = Math.max(0, Math.min(drag.half, base + dx));
    thumb.style.transform = `translateX(${drag.x}px)`;
  });
  seg.addEventListener('pointerup', e => {
    if (!drag) return;
    const target = drag.moved
      ? (drag.x > drag.half / 2 ? 'dark' : 'light')
      : (e.clientX - drag.r.left > drag.r.width / 2 ? 'dark' : 'light');
    seg.classList.remove('dragging');
    thumb.style.transform = '';
    drag = null;
    apply(target, true);
    lensTimer = setTimeout(() => seg.classList.remove('pressing'), reduce ? 0 : 320);
  });
  seg.addEventListener('pointercancel', () => {
    seg.classList.remove('pressing', 'dragging'); thumb.style.transform = ''; drag = null;
  });
})();

/* ---------- Kitoblar: papka-modal, qidiruv, "o'qidim" belgisi, PDF ko'ruvchi ---------- */
(function bookFolders() {
  const openBtns = document.querySelectorAll('[data-open-modal]');
  if (!openBtns.length) return;

  const READ_KEY = 'mhp-books-read';
  function loadRead() { try { return JSON.parse(localStorage.getItem(READ_KEY) || '{}'); } catch { return {}; } }
  function saveRead(state) { try { localStorage.setItem(READ_KEY, JSON.stringify(state)); } catch {} }

  function updateProgress(level) {
    const grid = document.querySelector(`[data-book-grid="${level}"]`);
    if (!grid) return;
    const boxes = Array.from(grid.querySelectorAll('input[data-book-id]'));
    const total = boxes.length;
    const checked = boxes.filter(b => b.checked).length;
    const pct = total ? Math.round((checked / total) * 100) : 0;
    document.querySelectorAll(`[data-progress-fill="${level}"]`).forEach(el => el.style.width = pct + '%');
    document.querySelectorAll(`[data-progress-text="${level}"]`).forEach(el => el.textContent = `${checked} / ${total} o'qildi`);
    document.querySelectorAll(`[data-progress-label="${level}"]`).forEach(el => el.textContent = `${checked} / ${total} o'qildi`);
  }

  // Init read state + checkbox listeners for each level
  document.querySelectorAll('[data-book-grid]').forEach(grid => {
    const level = grid.dataset.bookGrid;
    const state = loadRead();
    grid.querySelectorAll('input[data-book-id]').forEach(box => {
      const card = box.closest('.book-card');
      if (state[box.dataset.bookId]) { box.checked = true; card?.classList.add('is-read'); }
      box.addEventListener('change', () => {
        const s = loadRead();
        s[box.dataset.bookId] = box.checked;
        saveRead(s);
        card?.classList.toggle('is-read', box.checked);
        updateProgress(level);
      });
    });
    updateProgress(level);
  });

  // Open/close folder modals
  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = document.getElementById(btn.dataset.openModal);
      if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
    });
  });
  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', () => {
      const modal = el.closest('.book-modal');
      if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
    });
  });

  // Search within each folder modal
  document.querySelectorAll('[data-book-search]').forEach(input => {
    const level = input.dataset.bookSearch;
    const grid = document.querySelector(`[data-book-grid="${level}"]`);
    const empty = document.querySelector(`[data-book-empty="${level}"]`);
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.book-card'));
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const show = !q || (card.dataset.bookName || '').includes(q) || card.textContent.toLowerCase().includes(q);
        card.classList.toggle('hide', !show);
        if (show) visible++;
      });
      if (empty) empty.hidden = visible !== 0;
    });
  });

  // Onlayn PDF o'quvchi
  const pdfModal = document.getElementById('pdfModal');
  if (pdfModal) {
    const frame = pdfModal.querySelector('[data-pdf-frame]');
    const title = pdfModal.querySelector('[data-pdf-title]');
    const download = pdfModal.querySelector('[data-pdf-download]');
    document.querySelectorAll('.book-read-online').forEach(btn => {
      btn.addEventListener('click', () => {
        const src = btn.dataset.pdfSrc;
        frame.src = src;
        title.textContent = btn.dataset.pdfName || 'Kitob';
        download.href = src;
        pdfModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
    document.querySelectorAll('[data-close-pdf]').forEach(el => {
      el.addEventListener('click', () => {
        pdfModal.classList.remove('open');
        frame.src = '';
        document.body.style.overflow = '';
      });
    });
  }

  // Escape key closes any open modal
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.book-modal.open, .pdf-modal.open').forEach(m => m.classList.remove('open'));
    document.body.style.overflow = '';
  });
})();

/* ---------- FLEX ariza muddati sanog'i ---------- */
(function flexCountdown() {
  const el = document.getElementById('flexCountdown');
  if (!el) return;
  const deadline = new Date(el.dataset.deadline); // masalan data-deadline="2027-03-01"
  const numsEl = el.querySelector('.flex-countdown-nums');
  const labelEl = el.querySelector('.flex-countdown-label');

  function tick() {
    const now = new Date();
    const diff = deadline - now;
    if (isNaN(deadline.getTime()) || diff <= 0) {
      labelEl.textContent = "Deadline";
      numsEl.innerHTML = `<div><b>—</b><span>Yaqinda e'lon qilinadi</span></div>`;
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    labelEl.textContent = "Deadline gacha qoldi";
    numsEl.innerHTML = `
      <div><b>${days}</b><span>Kun</span></div>
      <div><b>${hours}</b><span>Soat</span></div>
      <div><b>${mins}</b><span>Daqiqa</span></div>`;
  }
  tick();
  setInterval(tick, 60000);
})();

/* ---------- Telegram orqali kirish (Rizqulloh English boti) + XP holati ---------- */
(function rizqullohAuth() {
  const navInner = document.querySelector('.nav-inner');
  if (!navInner) return;

  const BOT_USERNAME = 'Rizqulloh_bot';
  const API = 'https://rizqulloh-bot.ilyosbek41624.workers.dev/site/api/';
  const KEY = 'rz_session';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const wrap = document.createElement('div');
  wrap.className = 'tg-auth-wrap';
  wrap.id = 'tgAuthWrap';
  navInner.appendChild(wrap);
  // Tor ekranlarda (burger menyu) kirish bloki sarlavhaga sig'maydi: menyu ichiga ko'chiriladi.
  const navLinksEl = document.getElementById('navLinks');
  const compact = window.matchMedia('(max-width: 1100px)');
  const placeAuth = () => {
    const host = compact.matches && navLinksEl ? navLinksEl : navInner;
    if (wrap.parentElement !== host) host.appendChild(wrap);
    const cta = document.querySelector('.nav-cta');
    if (cta) { if (compact.matches && navLinksEl) { if (cta.parentElement !== navLinksEl) navLinksEl.appendChild(cta); } else if (cta.parentElement !== navInner) navInner.appendChild(cta); }
  };
  placeAuth();
  if (compact.addEventListener) compact.addEventListener('change', placeAuth); else compact.addListener(placeAuth);

  const getToken = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const setToken = t => { try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch (e) {} };
  const broadcastAuth = user => document.dispatchEvent(new CustomEvent('mhp:user', { detail: { user } }));

  function renderLoggedOut() {
    wrap.innerHTML = '';
    const tgScript = document.createElement('script');
    tgScript.async = true;
    tgScript.src = 'https://telegram.org/js/telegram-widget.js?22';
    tgScript.setAttribute('data-telegram-login', BOT_USERNAME);
    tgScript.setAttribute('data-size', 'medium');
    tgScript.setAttribute('data-radius', '8');
    tgScript.setAttribute('data-onauth', 'onTelegramAuth(user)');
    tgScript.setAttribute('data-request-access', 'write');
    wrap.appendChild(tgScript);
    const slot = document.getElementById('profileLoginWidget');
    if (slot) { slot.innerHTML = ''; slot.appendChild(tgScript.cloneNode()); }
  }

  function renderLoggedIn(u) {
    wrap.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'tg-user-box';
    box.innerHTML = `
      <span class="tg-user-avatar tg-initial">${esc((u.name || '?').trim().charAt(0).toUpperCase())}</span>
      <a href="rizqulloh.html#/profile" class="tg-user-name">${esc(u.name || 'Foydalanuvchi')}</a>
      <span class="tg-user-xp"><img class="emo" src="images/emoji/trophy.png" alt="" width="16" height="16"> ${Number(u.xp || 0).toLocaleString('en-US').replace(/,/g, ' ')} XP</span>
      ${u.streak > 1 ? `<span class="tg-user-streak" title="Ketma-ket kunlar">${u.streak} kun</span>` : ''}
      <button type="button" class="tg-logout" title="Chiqish"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg></button>
    `;
    wrap.appendChild(box);
    box.querySelector('.tg-logout').addEventListener('click', (e) => {
      e.preventDefault();
      setToken(null);
      window.currentUser = null;
      broadcastAuth(null);
      if (/rizqulloh/.test(location.pathname)) location.reload(); else renderLoggedOut();
    });
  }

  function applyMe(u) {
    window.currentUser = { firstName: u.name, xp: u.xp, streak: { count: u.streak }, readBooks: [] };
    renderLoggedIn(u);
    broadcastAuth(window.currentUser);
  }

  async function loadMe() {
    const token = getToken();
    if (!token) return broadcastAuth(null);
    try {
      const r = await fetch(API + 'me', { headers: { authorization: 'Bearer ' + token } });
      if (r.status === 401 || r.status === 403) { setToken(null); return broadcastAuth(null); }
      const d = await r.json();
      if (d && d.user) applyMe(d.user); else broadcastAuth(null);
    } catch (e) { broadcastAuth(null); }
  }

  // Telegram vidjeti ma'lumotni Rizqulloh botining serveriga yuboradi: imzoni o'sha bot tekshiradi.
  window.onTelegramAuth = async function (tgUser) {
    try {
      const res = await fetch(API + 'telegram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tgUser) });
      const data = await res.json();
      if (res.status === 403) { alert("Avval Telegramda @" + BOT_USERNAME + " botini ochib /start bosing, keyin qayta kiring."); return; }
      if (!res.ok || !data.token) return;
      setToken(data.token);
      if (/rizqulloh/.test(location.pathname)) location.reload(); else loadMe();
    } catch (e) { console.error('Kirish xatosi', e); }
  };

  renderLoggedOut();
  loadMe();
})();

/* ---------- Navbar: tepada yopishgan panel, pastda suzuvchi "pill" ---------- */
(function navPill() {
  const header = document.querySelector('header.nav');
  if (!header) return;
  let pill = false, ticking = false;
  const update = () => {
    ticking = false;
    const next = window.scrollY > 24;
    if (next !== pill) { pill = next; header.classList.toggle('is-pill', pill); }
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();
