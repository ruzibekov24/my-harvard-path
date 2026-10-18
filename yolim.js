/* Mening rejam: bosqichma-bosqich savollar -> AI qabul ehtimoli -> shaxsiy yo'l xaritasi. Hammasi brauzerda saqlanadi. */
(function () {
  const wiz = document.getElementById('ylWiz');
  if (!wiz) return;
  const $ = (id) => document.getElementById(id);
  const KEY = 'mhp-plan2';
  const MS_DAY = 86400000;
  let unis = [];
  let a = {}; // javoblar
  let stepIx = 0;

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  const save = (p) => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  const MAJORS = ['Computer Science', 'Data Science / AI', 'Engineering (umumiy)', 'Electrical Engineering', 'Mechanical Engineering', 'Biology / Biotech', 'Medicine (Pre-med)', 'Chemistry', 'Physics', 'Mathematics', 'Economics', 'Finance', 'Business / Management', 'Accounting', 'Political Science', 'International Relations', 'Law (Pre-law)', 'Psychology', 'Sociology', 'History', 'English / Literature', 'Journalism / Media', 'Architecture', 'Design / Art', 'Education', 'Environmental Science', 'Neuroscience', 'Philosophy', 'Linguistics', 'Hali aniq emas (Undeclared)'];
  const COUNTRIES = ["O'zbekiston", "Qozog'iston", "Qirg'iziston", 'Tojikiston', 'Turkmaniston', 'Rossiya', 'Turkiya', 'Ukraina', 'Boshqa davlat'];
  const CERTS = ['Fan olimpiadasi', 'TOEFL / Duolingo', 'AP / IB / A-level', 'Tadqiqot / loyiha', 'Volontyorlik', "Sport / san'at", 'Liderlik / klub', 'Onlayn kurs (Coursera, edX)'];

  const STEPS = [
    { id: 'uni', t: 'Qaysi universitetga kirmoqchisiz?', s: "Ro'yxatdan qidirib tanlang." },
    { id: 'kind', t: 'Siz qanday abituriyentsiz?', s: "Qabul foizi oddiy va transfer abituriyentlar uchun farq qiladi.", opts: [['hs', "Maktab o'quvchisi"], ['tr', 'Kollej talabasi (transfer)']] },
    { id: 'gender', t: 'Jinsingiz?', opts: [['m', 'Erkak'], ['f', 'Ayol']] },
    { id: 'grad', t: 'Qaysi yil bitirasiz?', s: "Qabul foizi har yili oldingi yillardagi ko'rsatkichlarga qarab o'zgaradi." },
    { id: 'major', t: "Qaysi yo'nalishni tanlamoqchisiz?", s: "Ba'zi universitetlarda qabul foizi yo'nalishga qarab farq qiladi." },
    { id: 'school', t: "Qaysi maktabda o'qiysiz?", s: "Maktab raqobati qabul imkoniyatiga ta'sir qilishi mumkin." },
    { id: 'dob', t: "Tug'ilgan sanangiz?", s: "Yosh va bitirish yiliga qarab tengdoshlaringizdan ajralib turishingiz mumkin." },
    { id: 'country', t: 'Qayerdansiz?', s: "Universitetlar turli mintaqalardan abituriyentlarni qidiradi." },
    { id: 'gpa', t: "O'rtacha bahoingiz (GPA)?", s: "O'zingizga qulay shkalani tanlang." },
    { id: 'sat', t: 'SAT balingiz?', s: 'Ixtiyoriy (400–1600).' },
    { id: 'act', t: 'ACT balingiz?', s: 'Ixtiyoriy (10–36).' },
    { id: 'ielts', t: 'IELTS balingiz?', s: "Bo'lmasa «Yo'q» ni belgilang." },
    { id: 'certs', t: "Qo'shimcha sertifikat va yutuqlaringiz bormi?", s: 'Bir nechtasini tanlashingiz mumkin.' },
    { id: 'aid', t: 'Moliyaviy yordam kerakmi?', opts: [['1', 'Ha, kerak'], ['0', "Yo'q, o'zim to'layman"]] },
  ];

  // ---------- hisob-kitob yordamchilari ----------
  const nums = (t) => (String(t || '').match(/\d+(?:\.\d+)?/g) || []).map(parseFloat);
  const need = (u) => {
    const t = String(u.ielts || '');
    if (/majburiy emas/i.test(t)) return 0;
    const n = nums(t).filter((x) => x >= 4 && x <= 9);
    return n.length ? Math.max.apply(null, n.slice(0, 2)) : 6.5;
  };
  const rate = (u) => { const n = nums(u.acceptanceRate); return n.length ? n[0] : 40; };
  const bar = (u) => { const r = rate(u); return r < 8 ? { g: 3.85, s: 1520, act: 34 } : r < 20 ? { g: 3.7, s: 1450, act: 32 } : r < 50 ? { g: 3.4, s: 1300, act: 28 } : { g: 3.0, s: 1100, act: 22 }; };
  const needsSat = (u) => !/yo.q|kerak emas|majburiy emas|test-optional/i.test(String(u.test || '')) || /SAT|ACT/i.test(String(u.test || ''));
  const gpa4 = (v, scale) => { v = parseFloat(v) || 0; const x = scale === '5' ? (v / 5) * 4 : scale === '100' ? (v / 100) * 4 : v; return Math.max(0, Math.min(4, x)); };
  const addMonths = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() - m); return x; };
  const fmtDate = (d) => d.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long' });

  const STEPS_PLAN = [
    { m: 18, t: 'Akademik poydevor', d: "GPA ni ushlab turing, kuchli fanlaringizni tanlang va 1–2 ta faoliyatga chuqur kirishing.", icon: 'books' },
    { m: 14, t: 'IELTS / TOEFL: birinchi urinish', d: "Darajangizni bilib oling. Past bo'lsa, kurs va mock testlarni boshlang.", icon: 'headphones', ielts: true },
    { m: 12, t: 'SAT / ACT tayyorgarligi', d: 'Haftasiga 3–4 soat: diagnostika testi, keyin zaif mavzular.', icon: 'memo', sat: true },
    { m: 10, t: 'Faoliyat va loyiha', d: "Olimpiada, volontyorlik yoki shaxsiy loyiha: natijani raqam bilan ko'rsata oladigan narsa.", icon: 'target' },
    { m: 8, t: "Universitetlar ro'yxati", d: 'Reach / match / safe: kamida 6–8 ta. Taqqoslash sahifasidan foydalaning.', icon: 'classical-building' },
    { m: 6, t: 'Insho: mavzu va qoralama', d: 'Uchta mavzu yozing, eng shaxsiysini tanlang va birinchi qoralamani tugating.', icon: 'writing-hand' },
    { m: 5, t: 'Tavsiyanomalar', d: "Ikki o'qituvchidan oldindan so'rang va ularga o'zingiz haqingizda qisqa ma'lumot bering.", icon: 'speech-balloon' },
    { m: 4, t: 'Moliyaviy yordam hujjatlari', d: "CSS Profile va oilaviy daromad hujjatlarini yig'ing, tarjima va notarial tasdiq.", icon: 'check-mark', aid: true },
    { m: 3, t: 'Inshoni tahrir qilish', d: "Inshoni 2–3 kishiga o'qitib, tahrir qiling. IELTS ball yetmasa, oxirgi imkoniyat.", icon: 'repeat' },
    { m: 2, t: 'Common App / ariza shakli', d: "Barcha bo'limlarni to'ldiring, faoliyatlar tavsifini qisqa va aniq yozing.", icon: 'laptop' },
    { m: 1, t: 'Yakuniy tekshiruv', d: "Imlo, hujjatlar, to'lov va test ballari yuborilganini tekshiring.", icon: 'magnifier' },
    { m: 0, t: 'Topshirish!', d: "Muddatdan kamida 2–3 kun oldin yuboring: oxirgi kun serverlar band bo'ladi.", icon: 'trophy' },
  ];

  function fit(p, u, doneRatio, months) {
    const b = bar(u), needV = need(u), g = gpa4(p.gpa, p.gpaScale);
    const gpaK = Math.min(1, g / b.g);
    const satReq = needsSat(u);
    const testK = Math.max(p.sat > 0 ? Math.min(1, p.sat / b.s) : 0, p.act > 0 ? Math.min(1, p.act / b.act) : 0);
    const satK = testK > 0 ? testK : (satReq ? 0 : 0.6);
    const ieltsK = needV ? Math.min(1, p.ielts / needV) : 1;
    const certN = (p.certs || []).length + (p.extra && p.extra.trim().length > 10 ? 1 : 0);
    const certK = Math.min(1, certN * 0.22);
    const timeK = 1 - Math.abs(Math.min(1, months / 18) - 0.6);
    const academic = 0.4 * gpaK + 0.3 * satK + 0.3 * ieltsK;
    const score = Math.round(100 * (0.27 * gpaK + 0.2 * satK + 0.2 * ieltsK + 0.13 * certK + 0.15 * doneRatio + 0.05 * timeK));
    return { score: score, academic: academic, certK: certK, rows: [
      { k: 'GPA', v: gpaK, t: g.toFixed(2) + ' / ' + b.g.toFixed(2) },
      { k: 'SAT/ACT', v: satK, t: (p.sat > 0 ? 'SAT ' + p.sat : p.act > 0 ? 'ACT ' + p.act : "yo'q") + (satReq ? ' / ' + b.s : ' (majburiy emas)') },
      { k: 'IELTS', v: ieltsK, t: (p.ielts > 0 ? p.ielts.toFixed(1) : "yo'q") + ' / ' + (needV ? needV.toFixed(1) : '—') },
      { k: 'Yutuqlar', v: certK, t: certN + ' ta' },
    ] };
  }
  /** AI ulanmagan bo'lsa: universitetning umumiy qabul foizi va profil kuchiga asoslangan taxmin. */
  function localChance(p, u) {
    const f = fit(p, u, 0, 12);
    const r = rate(u);
    const strength = 0.8 * f.academic + 0.2 * f.certK;
    const mult = 0.25 + 2.3 * strength * strength;
    let c = r * mult;
    if (r > 50) c = r + (100 - r) * (strength - 0.5) * 0.9;
    return Math.max(1, Math.min(97, Math.round(c)));
  }

  // ---------- savollar oynasi ----------
  const set = (k, v) => { a[k] = v; };
  const total = STEPS.length;

  function optionsHtml(opts, cur) {
    return '<div class="yl-opts">' + opts.map((o) => '<button type="button" class="yl-opt' + (cur === o[0] ? ' on' : '') + '" data-v="' + esc(o[0]) + '">' + esc(o[1]) + '</button>').join('') + '</div>';
  }
  const sel = (id, items, cur, ph) => '<select id="' + id + '"><option value="">' + esc(ph) + '</option>' + items.map((it) => { const v = Array.isArray(it) ? it[0] : it, l = Array.isArray(it) ? it[1] : it; return '<option value="' + esc(v) + '"' + (String(cur) === String(v) ? ' selected' : '') + '>' + esc(l) + '</option>'; }).join('') + '</select>';

  function renderStep() {
    const st = STEPS[stepIx];
    let body = '';
    if (st.id === 'uni') {
      body = '<input type="search" id="ylQ" class="yl-search" placeholder="Universitet nomini yozing…" autocomplete="off"><div class="yl-list" id="ylUniList"></div>';
    } else if (st.opts) {
      body = optionsHtml(st.opts, a[st.id]);
    } else if (st.id === 'grad') {
      const y0 = new Date().getFullYear() + 1;
      body = '<div class="yl-row2">' + sel('ylGm', MONTHS.map((m, i) => [String(i + 1), m]), a.gm || '6', 'Oy') + sel('ylGy', [0, 1, 2, 3, 4].map((i) => String(y0 + i)), a.gy || String(y0), 'Yil') + '</div>';
    } else if (st.id === 'major') {
      body = '<input type="search" id="ylQ" class="yl-search" placeholder="Yo\'nalishni qidiring…" autocomplete="off" value="' + esc(a.major || '') + '"><div class="yl-list" id="ylMajList"></div>';
    } else if (st.id === 'school') {
      body = '<input type="text" id="ylSchool" class="yl-search" placeholder="Maktab nomini yozing" maxlength="80" value="' + esc(a.school || '') + '"><label class="yl-check"><input type="checkbox" id="ylNoSchool"' + (a.noSchool ? ' checked' : '') + '> Ro\'yxatda yo\'q / aytmayman</label>' + '<p class="yl-tip">Maslahat: maktabingiz raqobati va darajasi universitet uchun muhim signal.</p>';
    } else if (st.id === 'dob') {
      const yrs = []; const cy = new Date().getFullYear(); for (let y = cy - 12; y >= cy - 30; y--) yrs.push(String(y));
      body = '<div class="yl-row3">' + sel('ylDm', MONTHS.map((m, i) => [String(i + 1), m]), a.dm, 'Oy') + sel('ylDd', Array.from({ length: 31 }, (_, i) => String(i + 1)), a.dd, 'Kun') + sel('ylDy', yrs, a.dy, 'Yil') + '</div>';
    } else if (st.id === 'country') {
      body = sel('ylCountry', COUNTRIES, a.country || COUNTRIES[0], 'Davlatni tanlang');
    } else if (st.id === 'gpa') {
      body = '<div class="yl-big"><input type="number" id="ylGpa" min="0" max="100" step="0.01" value="' + esc(a.gpa != null ? a.gpa : '') + '" placeholder="0.0"><select id="ylGpaScale"><option value="5"' + (a.gpaScale === '5' ? ' selected' : '') + '>5 ballik</option><option value="4"' + (a.gpaScale === '4' ? ' selected' : '') + '>4.0 shkala</option><option value="100"' + (a.gpaScale === '100' ? ' selected' : '') + '>100 ball (%)</option></select></div>';
    } else if (st.id === 'sat') {
      const v = a.sat || 400;
      body = '<div class="yl-sl"><input type="range" id="ylSat" min="400" max="1600" step="10" value="' + v + '"' + (a.noSat ? ' disabled' : '') + '><output id="ylSatOut" class="yl-pillbig">' + (a.noSat ? '—' : v) + '</output></div><label class="yl-check"><input type="checkbox" id="ylNoSat"' + (a.noSat ? ' checked' : '') + '> SAT topshirmaganman</label>';
    } else if (st.id === 'act') {
      body = sel('ylAct', Array.from({ length: 27 }, (_, i) => String(10 + i)), a.act, 'ACT ballini tanlang') + '<label class="yl-check"><input type="checkbox" id="ylNoAct"' + (a.noAct ? ' checked' : '') + '> ACT topshirmaganman</label>';
    } else if (st.id === 'ielts') {
      const v = a.ielts || 6;
      body = '<div class="yl-sl"><input type="range" id="ylIelts" min="4" max="9" step="0.5" value="' + v + '"' + (a.noIelts ? ' disabled' : '') + '><output id="ylIeltsOut" class="yl-pillbig">' + (a.noIelts ? '—' : Number(v).toFixed(1)) + '</output></div><label class="yl-check"><input type="checkbox" id="ylNoIelts"' + (a.noIelts ? ' checked' : '') + '> IELTS topshirmaganman</label>';
    } else if (st.id === 'certs') {
      body = '<div class="yl-chips" id="ylChips">' + CERTS.map((c) => '<button type="button" data-c="' + esc(c) + '" class="' + ((a.certs || []).indexOf(c) > -1 ? 'on' : '') + '">' + esc(c) + '</button>').join('') + '</div><textarea id="ylExtra" rows="3" maxlength="500" placeholder="Boshqa yutuqlaringiz (ixtiyoriy): masalan, Matematika olimpiadasi, viloyat 2-o\'rin">' + esc(a.extra || '') + '</textarea>';
    }
    const last = stepIx === total - 1;
    wiz.innerHTML =
      '<div class="yl-prog-top"><div class="yl-prog-fill" style="width:' + Math.round(((stepIx + 1) / total) * 100) + '%"></div></div>' +
      '<div class="yl-stage" id="ylStage"><span class="yl-count-s">' + (stepIx + 1) + ' / ' + total + '</span><h2>' + esc(st.t) + '</h2>' + (st.s ? '<p>' + esc(st.s) + '</p>' : '') + '<div class="yl-body">' + body + '</div></div>' +
      '<div class="yl-nav">' + (stepIx > 0 ? '<button type="button" class="yl-back" id="ylBack">Orqaga</button>' : '<span></span>') + (st.opts ? '' : '<button type="button" class="btn-primary" id="ylNext">' + (last ? 'Hisoblash' : 'Davom etish') + '</button>') + '</div>';
    bindStep(st);
  }

  function renderUniList(q) {
    const list = unis.filter((u) => !q || (u.name + ' ' + u.country + ' ' + (u.city || '')).toLowerCase().indexOf(q.toLowerCase()) > -1).slice(0, 30);
    $('ylUniList').innerHTML = list.map((u) => '<button type="button" class="yl-li' + (a.uni === u.id ? ' on' : '') + '" data-id="' + esc(u.id) + '"><span class="yl-lilogo"><b>' + esc(u.name.split(' ').map((w) => w[0]).join('').slice(0, 3)) + '</b><img src="images/uni/' + esc(u.id) + '.png" alt="" onerror="this.remove()"></span><span><b>' + esc(u.name) + '</b><em>' + esc(u.country) + (u.city ? ' · ' + esc(u.city) : '') + '</em></span><i>' + esc(u.acceptanceRate) + '</i></button>').join('') || '<p class="yl-tip">Topilmadi</p>';
  }
  function renderMajList(q) {
    const list = MAJORS.filter((m) => !q || m.toLowerCase().indexOf(q.toLowerCase()) > -1).slice(0, 12);
    $('ylMajList').innerHTML = list.map((m) => '<button type="button" class="yl-li' + (a.major === m ? ' on' : '') + '" data-m="' + esc(m) + '"><span><b>' + esc(m) + '</b></span></button>').join('') + (q && !MAJORS.some((m) => m.toLowerCase() === q.toLowerCase()) ? '<button type="button" class="yl-li" data-m="' + esc(q) + '"><span><b>«' + esc(q) + '» ni ishlatish</b></span></button>' : '');
  }

  function valid(st) {
    if (st.id === 'uni') return !!a.uni;
    if (st.opts) return a[st.id] != null;
    if (st.id === 'grad') return !!(a.gm && a.gy);
    if (st.id === 'major') return !!a.major;
    if (st.id === 'school') return !!(a.noSchool || (a.school && a.school.trim().length > 1));
    if (st.id === 'dob') return !!(a.dm && a.dd && a.dy);
    if (st.id === 'country') return !!a.country;
    if (st.id === 'gpa') return a.gpa > 0;
    return true;
  }

  function bindStep(st) {
    const next = () => {
      if (!valid(st)) { const n = $('ylNext'); if (n) { n.classList.remove('shake'); void n.offsetWidth; n.classList.add('shake'); } return; }
      if (stepIx < total - 1) go(1); else finish();
    };
    if ($('ylNext')) $('ylNext').onclick = next;
    if ($('ylBack')) $('ylBack').onclick = () => go(-1);
    if (st.opts) wiz.querySelectorAll('.yl-opt').forEach((b) => { b.onclick = () => { set(st.id, b.dataset.v); b.classList.add('on'); setTimeout(next, 220); }; });
    if (st.id === 'uni') {
      renderUniList('');
      $('ylQ').oninput = (e) => renderUniList(e.target.value);
      $('ylUniList').onclick = (e) => { const b = e.target.closest('.yl-li'); if (!b) return; set('uni', b.dataset.id); $('ylUniList').querySelectorAll('.yl-li').forEach((x) => x.classList.toggle('on', x === b)); setTimeout(next, 220); };
    }
    if (st.id === 'grad') { $('ylGm').onchange = (e) => set('gm', e.target.value); $('ylGy').onchange = (e) => set('gy', e.target.value); if (!a.gm) set('gm', '6'); if (!a.gy) set('gy', $('ylGy').value); }
    if (st.id === 'major') {
      renderMajList(a.major || '');
      $('ylQ').oninput = (e) => { set('major', ''); renderMajList(e.target.value); };
      $('ylMajList').onclick = (e) => { const b = e.target.closest('.yl-li'); if (!b) return; set('major', b.dataset.m); $('ylQ').value = b.dataset.m; $('ylMajList').querySelectorAll('.yl-li').forEach((x) => x.classList.toggle('on', x === b)); setTimeout(next, 220); };
    }
    if (st.id === 'school') {
      $('ylSchool').oninput = (e) => set('school', e.target.value);
      $('ylNoSchool').onchange = (e) => set('noSchool', e.target.checked);
      $('ylSchool').onkeydown = (e) => { if (e.key === 'Enter') next(); };
    }
    if (st.id === 'dob') { ['ylDm:dm', 'ylDd:dd', 'ylDy:dy'].forEach((x) => { const p = x.split(':'); $(p[0]).onchange = (e) => set(p[1], e.target.value); }); }
    if (st.id === 'country') { set('country', $('ylCountry').value || COUNTRIES[0]); $('ylCountry').onchange = (e) => set('country', e.target.value); }
    if (st.id === 'gpa') {
      const upd = () => { set('gpa', parseFloat($('ylGpa').value) || 0); set('gpaScale', $('ylGpaScale').value); };
      $('ylGpa').oninput = upd; $('ylGpaScale').onchange = upd; set('gpaScale', $('ylGpaScale').value);
      $('ylGpa').onkeydown = (e) => { if (e.key === 'Enter') { upd(); next(); } };
      setTimeout(() => { try { $('ylGpa').focus(); } catch (e) {} }, 50);
    }
    if (st.id === 'sat') {
      set('sat', a.noSat ? 0 : parseInt($('ylSat').value, 10));
      $('ylSat').oninput = (e) => { set('sat', parseInt(e.target.value, 10)); $('ylSatOut').textContent = e.target.value; };
      $('ylNoSat').onchange = (e) => { set('noSat', e.target.checked); $('ylSat').disabled = e.target.checked; $('ylSatOut').textContent = e.target.checked ? '—' : $('ylSat').value; set('sat', e.target.checked ? 0 : parseInt($('ylSat').value, 10)); };
    }
    if (st.id === 'act') {
      $('ylAct').onchange = (e) => { set('act', parseInt(e.target.value, 10) || 0); if (e.target.value) { set('noAct', false); $('ylNoAct').checked = false; } };
      $('ylNoAct').onchange = (e) => { set('noAct', e.target.checked); if (e.target.checked) { set('act', 0); $('ylAct').value = ''; } };
    }
    if (st.id === 'ielts') {
      set('ielts', a.noIelts ? 0 : parseFloat($('ylIelts').value));
      $('ylIelts').oninput = (e) => { set('ielts', parseFloat(e.target.value)); $('ylIeltsOut').textContent = Number(e.target.value).toFixed(1); };
      $('ylNoIelts').onchange = (e) => { set('noIelts', e.target.checked); $('ylIelts').disabled = e.target.checked; $('ylIeltsOut').textContent = e.target.checked ? '—' : Number($('ylIelts').value).toFixed(1); set('ielts', e.target.checked ? 0 : parseFloat($('ylIelts').value)); };
    }
    if (st.id === 'certs') {
      a.certs = a.certs || [];
      $('ylChips').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; const c = b.dataset.c, i = a.certs.indexOf(c); if (i > -1) a.certs.splice(i, 1); else a.certs.push(c); b.classList.toggle('on', i === -1); };
      $('ylExtra').oninput = (e) => set('extra', e.target.value);
    }
  }

  function go(d) {
    const stage = $('ylStage');
    if (stage) { stage.classList.add(d > 0 ? 'out-l' : 'out-r'); }
    setTimeout(() => { stepIx = Math.max(0, Math.min(total - 1, stepIx + d)); renderStep(); const s = $('ylStage'); if (s) s.classList.add(d > 0 ? 'in-r' : 'in-l'); }, 170);
  }

  // ---------- hisoblash animatsiyasi ----------
  const CALC_MSG = ['Universitet talablari tekshirilmoqda…', 'Profilingiz solishtirilmoqda…', 'Oldingi yillar statistikasi tahlil qilinmoqda…', 'AI shansingizni hisoblayapti…'];
  function toPlan() {
    const y = parseInt(a.gy, 10);
    return { uni: a.uni, year: y, kind: a.kind, gender: a.gender, gradMonth: a.gm, major: a.major, school: a.noSchool ? '' : a.school, country: a.country, gpa: a.gpa, gpaScale: a.gpaScale || '5', sat: a.noSat ? 0 : (a.sat || 0), act: a.noAct ? 0 : (a.act || 0), ielts: a.noIelts ? 0 : (a.ielts || 0), certs: a.certs || [], extra: a.extra || '', aid: a.aid === '1', done: (load() && load().uni === a.uni && load().year === y) ? (load().done || []) : [], answers: a };
  }

  async function finish() {
    const p = toPlan();
    save(p);
    const u = unis.find((x) => x.id === p.uni) || unis[0];
    wiz.innerHTML = '<div class="yl-calc"><div class="yl-orb"><i></i><i></i><i></i></div><h2>Shansingizni hisoblayapmiz</h2><p id="ylCalcMsg">' + CALC_MSG[0] + '</p><div class="yl-prog-top"><div class="yl-prog-fill" id="ylCalcBar" style="width:6%"></div></div></div>';
    let i = 0;
    const msgTimer = setInterval(() => { i = (i + 1) % CALC_MSG.length; const m = $('ylCalcMsg'); if (m) { m.style.opacity = 0; setTimeout(() => { m.textContent = CALC_MSG[i]; m.style.opacity = 1; }, 180); } const b = $('ylCalcBar'); if (b) b.style.width = Math.min(92, 6 + (i + 1) * 22) + '%'; }, 1100);
    const minWait = new Promise((r) => setTimeout(r, 4600));
    const ai = fetchAi(p, u);
    const res = await Promise.all([ai, minWait]).then((x) => x[0]);
    clearInterval(msgTimer);
    const b = $('ylCalcBar'); if (b) b.style.width = '100%';
    await new Promise((r) => setTimeout(r, 350));
    wiz.hidden = true;
    build(p, res);
    $('ylResult').hidden = false;
    $('ylResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function fetchAi(p, u) {
    const f = fit(p, u, 0, 12);
    const payload = { uni: { name: u.name, acceptanceRate: u.acceptanceRate, tuition: u.tuition, aid: u.aid, ielts: u.ielts, test: u.test, system: u.system, deadline: u.deadline },
      profile: { year: p.year, kind: p.kind, gender: p.gender, major: p.major, school: p.school, country: p.country, gpa4: +gpa4(p.gpa, p.gpaScale).toFixed(2), sat: p.sat, act: p.act, ielts: p.ielts, certs: p.certs, extra: p.extra, aid: p.aid, score: f.score, months: Math.max(0, Math.round((new Date(p.year, 0, 1) - new Date()) / MS_DAY / 30.4)) } };
    try {
      const res = await fetch('/api/plan-ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.status === 429) return { local: true, limit: true, ...localAi(p, u) };
      if (!res.ok) return { local: true, ...localAi(p, u) };
      const j = await res.json();
      if (typeof j.chance_pct !== 'number') j.chance_pct = localChance(p, u);
      return j;
    } catch (e) { return { local: true, ...localAi(p, u) }; }
  }

  // ---------- natija ----------
  const VERD = { reach: ['Reach: qiyin, lekin imkon bor', '#ff9f0a'], match: ['Match: kuchli imkoniyat', '#0088ff'], safe: ['Safe: ehtimol yuqori', '#34c759'] };
  function verdictOf(pct) { return pct >= 60 ? 'safe' : pct >= 25 ? 'match' : 'reach'; }
  function localAi(p, u) {
    const f = fit(p, u, 0, 12);
    const weak = f.rows.filter((r) => r.v < 0.85).sort((x, y) => x.v - y.v);
    const strong = f.rows.filter((r) => r.v >= 0.85);
    const act = [];
    weak.forEach((r) => {
      if (r.k === 'GPA') act.push("GPA: joriy baholarni yaxshilang va murakkab fanlarni (AP/IB yoki kuchaytirilgan kurs) tanlang.");
      if (r.k === 'SAT/ACT') act.push('SAT/ACT: diagnostik test topshiring va haftasiga 3–4 soat tayyorlaning, maqsad SAT ' + bar(u).s + '+.');
      if (r.k === 'IELTS') act.push('IELTS: ' + (need(u) || 6.5).toFixed(1) + ' ballga yetish uchun kurs va haftalik mock testlar rejalashtiring.');
      if (r.k === 'Yutuqlar') act.push("Yutuqlar: 1–2 ta chuqur faoliyat tanlang (olimpiada, tadqiqot yoki loyiha) va natijani raqamda ko'rsating.");
    });
    act.push("Insho: kamida ikki qoralama yozing va ularni tahrir qildiring.");
    const pct = localChance(p, u);
    return { chance_pct: pct, verdict: verdictOf(pct), chance: '', summary: u.name + ' uchun taxminiy qabul ehtimolingiz ' + pct + "%. Bu universitetning umumiy qabul foizi va profilingizga asoslangan oddiy hisob.", strengths: strong.map((r) => r.k + ': ' + r.t), gaps: weak.map((r) => r.k + ': ' + r.t), actions: act, certificates: (p.certs || []).length ? "Tanlangan yutuqlar arizangizni kuchaytiradi: ularni insho va faoliyat ro'yxatida aniq natijalar bilan yozing." : "Sertifikat yoki yutuq qo'shsangiz, hisob aniqroq bo'ladi." };
  }
  function renderAi(r, tag) {
    const v = VERD[r.verdict] || VERD[verdictOf(r.chance_pct || 0)] || VERD.reach;
    const li = (arr) => (arr || []).map((x) => '<li>' + esc(x) + '</li>').join('');
    $('ylAiOut').innerHTML =
      '<div class="yl-verdict" style="--c:' + v[1] + '"><b>' + v[0] + '</b>' + (r.chance ? '<span>Taxminiy imkoniyat: ' + esc(r.chance) + '</span>' : '') + (tag ? '<em>' + esc(tag) + '</em>' : '') + '</div>' +
      (r.summary ? '<p class="yl-sum">' + esc(r.summary) + '</p>' : '') +
      '<div class="yl-two"><div><h4>Kuchli tomonlar</h4><ul>' + li(r.strengths) + '</ul></div><div><h4>Kuchaytirish kerak</h4><ul>' + li(r.gaps) + '</ul></div></div>' +
      (r.certificates ? '<p class="yl-cert"><b>Sertifikat va yutuqlar:</b> ' + esc(r.certificates) + '</p>' : '') +
      '<h4>Keyingi qadamlar</h4><ol class="yl-actions">' + li(r.actions) + '</ol>';
  }
  function renderChance(r, u, p) {
    const pct = Math.max(1, Math.min(97, Math.round(r.chance_pct)));
    const v = VERD[r.verdict] || VERD[verdictOf(pct)];
    $('ylChance').innerHTML = '<div class="yl-chance-in" style="--c:' + v[1] + '"><div class="yl-bigpct"><b id="ylPct">0</b><span>%</span></div><div><small>' + esc(u.name) + ' · ' + p.year + '</small><h2>Siz taxminan <u>' + pct + '%</u> ehtimol bilan qabul qilinasiz</h2><p>' + v[0] + (r.local ? ' · oddiy hisob' : ' · AI tahlili') + '</p></div></div>';
    const t0 = performance.now();
    const tick = (t) => { const k = Math.min(1, (t - t0) / 1400); $('ylPct').textContent = Math.round(pct * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }

  function build(p, aiRes) {
    const u = unis.find((x) => x.id === p.uni) || unis[0];
    const deadline = new Date(p.year, 0, 1);
    const today = new Date();
    const days = Math.max(0, Math.ceil((deadline - today) / MS_DAY));
    const months = Math.max(0, Math.round(days / 30.4));
    const needV = need(u);
    const satGap = needsSat(u) && !(p.sat >= bar(u).s || p.act >= bar(u).act);
    const steps = STEPS_PLAN
      .filter((s) => (!s.sat || satGap) && (!s.aid || p.aid) && (!s.ielts || p.ielts < needV))
      .map((s) => Object.assign({}, s, { id: 's' + s.m, date: addMonths(deadline, s.m) }));
    const done = new Set(p.done || []);
    let lastFit = null;

    if (aiRes) renderChance(aiRes, u, p);
    if (aiRes) renderAi(aiRes, aiRes.local ? (aiRes.limit ? "Bugungi AI limiti tugadi, oddiy hisob" : 'Oddiy hisob (AI hozir ulanmagan)') : 'AI tahlili');

    const render = () => {
      const doneN = steps.filter((s) => done.has(s.id)).length;
      const prog = steps.length ? doneN / steps.length : 0;
      const f = fit(p, u, prog, months);
      lastFit = f;
      const ieltsK = needV ? Math.min(1, p.ielts / needV) : 1;
      $('ylTitle').textContent = u.name + ' · ' + p.year;
      $('ylDays').textContent = days;
      $('ylMonths').textContent = months;
      $('ylHave').textContent = p.ielts > 0 ? p.ielts.toFixed(1) : "yo'q";
      $('ylNeed').textContent = needV ? needV.toFixed(1) : '—';
      $('ylIeltsBar').style.width = Math.round(ieltsK * 100) + '%';
      $('ylProgBar').style.width = Math.round(prog * 100) + '%';
      $('ylProgText').textContent = 'Vazifalar: ' + doneN + ' / ' + steps.length + ' bajarildi';
      $('ylBars').innerHTML = f.rows.map((r) => '<div class="yl-brow"><span>' + r.k + '</span><div class="yl-track"><i style="width:' + Math.round(r.v * 100) + '%"></i></div><em>' + esc(r.t) + '</em></div>').join('');
      const C = 2 * Math.PI * 52, ring = $('ylRing');
      ring.style.strokeDasharray = C;
      ring.style.strokeDashoffset = C * (1 - f.score / 100);
      const t0 = performance.now(), from = parseInt($('ylScore').textContent, 10) || 0;
      const tick = (t) => { const k = Math.min(1, (t - t0) / 800); $('ylScore').textContent = Math.round(from + (f.score - from) * (1 - Math.pow(1 - k, 3))) + '%'; if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
      const nextStep = steps.find((s) => !done.has(s.id) && s.date >= today);
      const nextId = nextStep ? nextStep.id : null;
      $('ylLine').innerHTML = steps.map((s) => {
        const isDone = done.has(s.id), late = !isDone && s.date < today, isNext = s.id === nextId;
        return '<li class="yl-step' + (isDone ? ' is-done' : '') + (late ? ' is-late' : '') + (isNext ? ' is-next' : '') + '" data-id="' + s.id + '">' +
          '<button type="button" class="yl-tick" aria-label="Bajarildi deb belgilash"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button>' +
          '<img class="emo" src="images/emoji/' + s.icon + '.png" alt="" width="28" height="28">' +
          '<div><b>' + s.t + '</b><span>' + s.d + '</span><em>' + (late ? 'Kechikkan · ' : isNext ? 'Hozirgi vazifa · ' : '') + fmtDate(s.date) + '</em></div></li>';
      }).join('');
    };
    render();
    $('ylLine').onclick = (e) => {
      const li = e.target.closest('.yl-step');
      if (!li) return;
      const id = li.dataset.id;
      if (done.has(id)) done.delete(id); else done.add(id);
      p.done = Array.from(done);
      save(p);
      render();
    };
    $('ylAiBtn').onclick = async () => {
      const btn = $('ylAiBtn'); btn.disabled = true; btn.textContent = 'Hisoblanmoqda…';
      $('ylAiOut').innerHTML = '<div class="yl-ai-load"><span></span><span></span><span></span></div>';
      const r = await fetchAi(p, u);
      renderChance(r, u, p);
      renderAi(r, r.local ? 'Oddiy hisob (AI hozir ulanmagan)' : 'AI tahlili');
      btn.disabled = false; btn.textContent = 'Qayta hisoblash';
    };
    $('ylRestart').onclick = () => { $('ylResult').hidden = true; wiz.hidden = false; stepIx = 0; renderStep(); wiz.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  }

  fetch('data/universities.json').then((r) => r.json()).then((d) => {
    unis = d.universities;
    const p = load();
    if (p && p.answers && unis.some((u) => u.id === p.uni)) {
      a = p.answers;
      wiz.hidden = true;
      build(p, null);
      // saqlangan natijani yengil hisob bilan ko'rsatish (AI chaqirilmaydi)
      const u = unis.find((x) => x.id === p.uni);
      const r = localAi(p, u); r.local = true;
      renderChance(r, u, p); renderAi(r, 'Oddiy hisob: AI uchun «Qayta hisoblash» ni bosing');
      $('ylResult').hidden = false;
    } else renderStep();
  });
})();
