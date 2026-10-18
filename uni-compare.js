/* Universitetlarni taqqoslash — foydalanuvchi o'zi tanlaydi.
   Ma'lumot data/universities.json'dan olinadi, tanlov localStorage'da saqlanadi. */
(function () {
  const grid = document.getElementById('uniGrid');
  if (!grid) return;

  const STORAGE_KEY = 'mhp-compare-selection';
  const MAX = 4;

  const searchEl = document.getElementById('uniSearch');
  const filtersEl = document.getElementById('uniFilters');
  const emptyEl = document.getElementById('uniEmpty');
  const countEl = document.getElementById('uniCount');
  const hintEl = document.getElementById('compareHint');
  const wrapEl = document.getElementById('compareWrap');
  const tableEl = document.getElementById('compareTable');

  let data = { universities: [], fields: [] };
  let selected = load();
  let region = 'all';
  let query = '';

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(raw) ? raw.slice(0, MAX) : [];
    } catch { return []; }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(selected)); } catch {}
  }

  function esc(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  const FX = { '$': 1, '€': 1.08, '£': 1.27, 'S$': 0.74 };
  const PALETTE = ['#A51C30', '#0088ff', '#34c759', '#ff9f0a'];
  function initials(u) { return u.name.replace(/^(The )?University of /i, '').split(/[\s-]+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 3).toUpperCase(); }
  function logo(u) {
    return `<span class="uni-logo"><b>${esc(initials(u))}</b><img src="images/uni/${esc(u.id)}.png" alt="" loading="lazy" width="48" height="48" onerror="this.remove()"></span>`;
  }
  const nums = (t) => (String(t || '').match(/\d[\d,]*\.?\d*/g) || []).map((x) => parseFloat(x.replace(/,/g, '')));
  function mid(a) { return a.length ? a.reduce((x, y) => x + y, 0) / a.length : null; }
  const METRICS = [
    { key: 'acceptanceRate', title: 'Qabul foizi', unit: '%', get: (u) => { const n = nums(u.acceptanceRate); return n.length ? mid(n.slice(0, 2)) : null; }, fmt: (v) => v.toFixed(v < 10 ? 1 : 0) + '%', note: 'Past son = qabul qiyinroq' },
    { key: 'tuition', title: "Yillik o'qish puli (taxminan, USD)", get: (u) => {
        const t = String(u.tuition || ''); const n = nums(t); if (!n.length) return null;
        const cur = /S\$/.test(t) ? 'S$' : /€|�/.test(t) || /EUR/.test(t) ? '€' : /£/.test(t) ? '£' : '$';
        const base = /\+/.test(t) ? n[0] : mid(n.slice(0, 2));
        return Math.round(base * (u.tuitionFx || FX[cur] || 1) / 100) * 100;
      }, fmt: (v) => '$' + Math.round(v).toLocaleString('en-US').replace(/,/g, ' '), note: "Ba'zilarida stipendiya narxni tushiradi" },
    { key: 'ielts', title: 'IELTS (minimal ball)', get: (u) => { const n = nums(u.ielts); return n.length ? Math.max(...n.slice(0, 2)) : null; }, fmt: (v) => v.toFixed(1), min: 5, max: 9, note: "Majburiy bo'lmasa, ko'rsatilmaydi" },
  ];

  function renderCharts(chosen) {
    let host = document.getElementById('compareCharts');
    if (!host) { host = document.createElement('div'); host.id = 'compareCharts'; host.className = 'uni-charts'; wrapEl.parentNode.insertBefore(host, wrapEl); }
    host.hidden = false;
    host.innerHTML = METRICS.map((m) => {
      const vals = chosen.map((u) => m.get(u));
      const top = m.max || Math.max(...vals.filter((v) => v != null), 1);
      const low = m.min || 0;
      return `<div class="uni-chart"><h3>${esc(m.title)}</h3>${chosen.map((u, i) => {
        const v = vals[i];
        const pct = v == null ? 0 : Math.max(4, ((v - low) / (top - low)) * 100);
        return `<div class="uni-bar-row">${logo(u)}<div class="uni-bar-track">${v == null ? `<span class="uni-bar-none">${esc(u[m.key] || '—')}</span>` : `<i class="uni-bar" style="--w:${pct}%;--c:${PALETTE[i % PALETTE.length]}"></i>`}</div><span class="uni-bar-val" data-to="${v == null ? '' : v}" data-m="${m.key}">${v == null ? '' : m.fmt(0)}</span></div>`;
      }).join('')}<p class="uni-chart-note">${esc(m.note)}</p></div>`;
    }).join('');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      host.classList.add('is-go');
      host.querySelectorAll('.uni-bar-val').forEach((el) => {
        const to = parseFloat(el.dataset.to); if (isNaN(to)) return;
        const m = METRICS.find((x) => x.key === el.dataset.m); const t0 = performance.now();
        const step = (t) => { const k = Math.min(1, (t - t0) / 900); const e = 1 - Math.pow(1 - k, 3); el.textContent = m.fmt(to * e); if (k < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      });
    }));
  }

  function matches(u) {
    if (region !== 'all' && u.region !== region) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.country.toLowerCase().includes(q) || (u.city || '').toLowerCase().includes(q);
  }

  function renderGrid() {
    const list = data.universities.filter(matches);
    emptyEl.hidden = list.length > 0;
    grid.innerHTML = list.map((u) => {
      const on = selected.includes(u.id);
      const full = !on && selected.length >= MAX;
      return `<button type="button" class="uni-item${on ? ' is-on' : ''}" data-id="${esc(u.id)}"
                ${full ? 'disabled' : ''} aria-pressed="${on}">
        ${logo(u)}
        <span class="uni-item-name">${esc(u.name)}</span>
        <span class="uni-item-meta">${esc(u.country)}${u.city ? ' · ' + esc(u.city) : ''}</span>
        <span class="uni-item-rate">${esc(u.acceptanceRate)}</span>
      </button>`;
    }).join('');
  }

  function renderCompare() {
    const chosen = selected.map((id) => data.universities.find((u) => u.id === id)).filter(Boolean);

    if (chosen.length < 2) {
      wrapEl.hidden = true;
      const ch = document.getElementById('compareCharts'); if (ch) ch.hidden = true;
      hintEl.hidden = false;
      hintEl.textContent = chosen.length === 0
        ? 'Yuqoridan kamida 2 ta universitet tanlang.'
        : 'Yana kamida bitta universitet tanlang — taqqoslash uchun 2 ta kerak.';
      return;
    }

    hintEl.hidden = true;
    wrapEl.hidden = false;
    renderCharts(chosen);

    const head = `<thead><tr><th scope="col">Mezon</th>${chosen.map((u) =>
      `<th scope="col">${logo(u)}<span class="uni-col-name">${esc(u.name)}</span>
        <span class="uni-col-meta">${esc(u.country)}</span></th>`).join('')}</tr></thead>`;

    const rows = data.fields.map((f) =>
      `<tr><th scope="row">${esc(f.label)}</th>${chosen.map((u) =>
        `<td>${esc(u[f.key] || '—')}</td>`).join('')}</tr>`).join('');

    const links = `<tr><th scope="row">Rasmiy sahifa</th>${chosen.map((u) =>
      `<td><a class="uni-link" href="${esc(u.website)}" target="_blank" rel="noopener">Qabul sahifasi →</a></td>`).join('')}</tr>`;

    tableEl.innerHTML =
      `<caption>${esc(data.note || '')}</caption>${head}<tbody>${rows}${links}</tbody>`;
  }

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.uni-item');
    if (!btn || btn.disabled) return;
    const id = btn.dataset.id;
    const i = selected.indexOf(id);
    if (i >= 0) selected.splice(i, 1);
    else if (selected.length < MAX) selected.push(id);
    save();
    renderGrid();
    renderCompare();
  });

  searchEl?.addEventListener('input', (e) => {
    query = e.target.value.trim();
    renderGrid();
  });

  filtersEl?.addEventListener('click', (e) => {
    const btn = e.target.closest('.uni-filter');
    if (!btn) return;
    region = btn.dataset.region;
    filtersEl.querySelectorAll('.uni-filter').forEach((b) => b.classList.toggle('is-on', b === btn));
    renderGrid();
  });

  fetch('data/universities.json')
    .then((r) => r.json())
    .then((json) => {
      data = json;
      if (countEl) countEl.textContent = String(data.universities.length);
      // Saqlangan tanlovda endi mavjud bo'lmagan id qolib ketmasin
      selected = selected.filter((id) => data.universities.some((u) => u.id === id));
      renderGrid();
      renderCompare();
    })
    .catch(() => {
      grid.innerHTML = '';
      emptyEl.hidden = false;
      emptyEl.textContent = "Universitetlar ro'yxatini yuklab bo'lmadi. Sahifani yangilab ko'ring.";
    });
})();
