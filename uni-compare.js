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
      hintEl.hidden = false;
      hintEl.textContent = chosen.length === 0
        ? 'Yuqoridan kamida 2 ta universitet tanlang.'
        : 'Yana kamida bitta universitet tanlang — taqqoslash uchun 2 ta kerak.';
      return;
    }

    hintEl.hidden = true;
    wrapEl.hidden = false;

    const head = `<thead><tr><th scope="col">Mezon</th>${chosen.map((u) =>
      `<th scope="col"><span class="uni-col-name">${esc(u.name)}</span>
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
