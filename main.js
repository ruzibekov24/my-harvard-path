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

// Scroll reveal
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
    });
  });
  updateProgress();
}

/* ==========================================================================
   YANGI QO'SHILGAN FUNKSIYALAR
   ========================================================================== */

/* ---------- Dark mode ---------- */
(function themeToggle() {
  const KEY = 'mhp-theme';
  const saved = localStorage.getItem(KEY);
  if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

  const navInner = document.querySelector('.nav-inner');
  if (!navInner) return;
  const btn = document.createElement('button');
  btn.className = 'theme-toggle';
  btn.type = 'button';
  btn.setAttribute('aria-label', "Rejimni almashtirish");
  btn.innerHTML = document.documentElement.getAttribute('data-theme') === 'dark' ? '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' : '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.5A8.5 8.5 0 1 1 11.5 3a7 7 0 0 0 9.5 9.5Z"/></svg>';
  navInner.appendChild(btn);

  btn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem(KEY, 'light');
      btn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.5A8.5 8.5 0 1 1 11.5 3a7 7 0 0 0 9.5 9.5Z"/></svg>';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem(KEY, 'dark');
      btn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    }
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
      labelEl.textContent = "Ariza muddati";
      numsEl.innerHTML = `<div><b>—</b><span>Yaqinda e'lon qilinadi</span></div>`;
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    labelEl.textContent = "Keyingi FLEX arizasi muddatigacha";
    numsEl.innerHTML = `
      <div><b>${days}</b><span>Kun</span></div>
      <div><b>${hours}</b><span>Soat</span></div>
      <div><b>${mins}</b><span>Daqiqa</span></div>`;
  }
  tick();
  setInterval(tick, 60000);
})();

/* ---------- Telegram orqali kirish + XP holati ---------- */
(function telegramAuth() {
  const navInner = document.querySelector('.nav-inner');
  if (!navInner) return;

  const BOT_USERNAME = 'GoingToHarvard_bot';

  const wrap = document.createElement('div');
  wrap.className = 'tg-auth-wrap';
  wrap.id = 'tgAuthWrap';
  navInner.appendChild(wrap);

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

    const profileSlot = document.getElementById('profileLoginWidget');
    if (profileSlot) {
      profileSlot.innerHTML = '';
      const tgScript2 = tgScript.cloneNode();
      profileSlot.appendChild(tgScript2);
    }
  }

  function broadcastAuth(user) {
    document.dispatchEvent(new CustomEvent('mhp:user', { detail: { user } }));
  }

  function renderLoggedIn(user) {
    wrap.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'tg-user-box';
    box.innerHTML = `
      ${user.photoUrl ? `<img src="${user.photoUrl}" alt="" class="tg-user-avatar">` : ''}
      <a href="profil.html" class="tg-user-name">${user.firstName || user.username || 'Foydalanuvchi'}</a>
      <span class="tg-user-xp"><svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.5 1.3 6.6L12 16.9l-5.9 3.5 1.3-6.6-4.9-4.5 6.6-.7Z"/></svg> ${user.xp} XP</span>
      <button type="button" class="tg-logout" title="Chiqish"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg></button>
    `;
    wrap.appendChild(box);
    box.querySelector('.tg-logout').addEventListener('click', async (e) => {
      e.preventDefault();
      await fetch('/api/logout', { method: 'POST' });
      window.currentUser = null;
      renderLoggedOut();
      broadcastAuth(null);
    });
  }

  window.onTelegramAuth = async function (tgUser) {
    try {
      const res = await fetch('/api/telegram-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tgUser),
      });
      const data = await res.json();
      if (data.ok) {
        window.currentUser = data.user;
        renderLoggedIn(data.user);
        syncReadBooksToServer(data.user);
        broadcastAuth(data.user);
      }
    } catch (e) { console.error('Telegram auth xatosi', e); }
  };

  // Kitob "o'qidim" belgilarini serverdagi XP bilan sinxronlash
  async function syncReadBooksToServer(user) {
    document.querySelectorAll('input[data-book-id]').forEach(box => {
      if (user.readBooks.includes(box.dataset.bookId) && !box.checked) {
        box.checked = true;
        box.dispatchEvent(new Event('change'));
      }
    });
  }

  document.addEventListener('change', (e) => {
    if (!e.target.matches('input[data-book-id]')) return;
    if (!window.currentUser) return;
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId: e.target.dataset.bookId, read: e.target.checked }),
    }).then(r => r.json()).then(data => {
      if (data.ok) { window.currentUser = data.user; broadcastAuth(data.user); }
    }).catch(() => {});
  });

  // Sahifa yuklanganda joriy foydalanuvchini tekshirish
  renderLoggedOut();
  fetch('/api/me').then(r => r.json()).then(data => {
    if (data.ok && data.user) {
      window.currentUser = data.user;
      renderLoggedIn(data.user);
      syncReadBooksToServer(data.user);
    }
    broadcastAuth(data.user || null);
  }).catch(() => broadcastAuth(null));
})();
