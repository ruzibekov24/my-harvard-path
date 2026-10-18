/* Mening rejam — shaxsiy yo'l xaritasi. Hamma narsa brauzerda (localStorage) saqlanadi. */
(function () {
  const form = document.getElementById('ylForm');
  if (!form) return;
  const $ = (id) => document.getElementById(id);
  const KEY = 'mhp-plan';
  const MS_DAY = 86400000;
  let unis = [];

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  const save = (p) => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} };

  const STEPS = [
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

  const need = (u) => {
    const t = String(u.ielts || '');
    if (/majburiy emas/i.test(t)) return 0;
    const n = (t.match(/\d+(?:\.\d+)?/g) || []).map(parseFloat).filter((x) => x >= 4 && x <= 9);
    return n.length ? Math.max.apply(null, n.slice(0, 2)) : 6.5;
  };
  const addMonths = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() - m); return x; };
  const fmtDate = (d) => d.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long' });

  function fillYears() {
    const y0 = new Date().getFullYear() + 1;
    $('ylYear').innerHTML = [0, 1, 2, 3, 4].map((i) => '<option value="' + (y0 + i) + '">' + (y0 + i) + '</option>').join('');
  }
  $('ylIelts').addEventListener('input', (e) => { $('ylIeltsOut').textContent = Number(e.target.value).toFixed(1); });

  function build(p) {
    const u = unis.find((x) => x.id === p.uni) || unis[0];
    const deadline = new Date(p.year, 0, 1);
    const today = new Date();
    const days = Math.max(0, Math.ceil((deadline - today) / MS_DAY));
    const months = Math.max(0, Math.round(days / 30.4));
    const needV = need(u);
    const steps = STEPS
      .filter((s) => (!s.sat || p.sat) && (!s.aid || p.aid) && (!s.ielts || p.ielts < needV))
      .map((s) => Object.assign({}, s, { id: 's' + s.m, date: addMonths(deadline, s.m) }));
    const done = new Set(p.done || []);

    const render = () => {
      const doneN = steps.filter((s) => done.has(s.id)).length;
      const prog = steps.length ? doneN / steps.length : 0;
      const ieltsK = needV ? Math.min(1, p.ielts / needV) : 1;
      const timeK = Math.min(1, months / 18);
      const score = Math.round(100 * (0.4 * ieltsK + 0.45 * prog + 0.15 * (1 - Math.abs(timeK - 0.6))));
      $('ylTitle').textContent = u.name + ' · ' + p.year;
      $('ylDays').textContent = days;
      $('ylMonths').textContent = months;
      $('ylHave').textContent = p.ielts.toFixed(1);
      $('ylNeed').textContent = needV ? needV.toFixed(1) : '—';
      $('ylIeltsBar').style.width = Math.round(ieltsK * 100) + '%';
      $('ylProgBar').style.width = Math.round(prog * 100) + '%';
      $('ylProgText').textContent = 'Vazifalar: ' + doneN + ' / ' + steps.length + ' bajarildi';
      const C = 2 * Math.PI * 52, ring = $('ylRing');
      ring.style.strokeDasharray = C;
      ring.style.strokeDashoffset = C * (1 - score / 100);
      const t0 = performance.now(), from = parseInt($('ylScore').textContent, 10) || 0;
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / 800);
        $('ylScore').textContent = Math.round(from + (score - from) * (1 - Math.pow(1 - k, 3))) + '%';
        if (k < 1) requestAnimationFrame(tick);
      };
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
    $('ylResult').hidden = false;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const prev = load();
    const same = prev && prev.uni === $('ylUni').value && String(prev.year) === $('ylYear').value;
    const p = { uni: $('ylUni').value, year: parseInt($('ylYear').value, 10), ielts: parseFloat($('ylIelts').value), grade: $('ylGrade').value, sat: $('ylSat').checked, aid: $('ylAid').checked, done: same ? prev.done : [] };
    save(p);
    build(p);
    $('ylResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  fillYears();
  fetch('data/universities.json').then((r) => r.json()).then((d) => {
    unis = d.universities;
    $('ylUni').innerHTML = unis.map((u) => '<option value="' + u.id + '">' + u.name + ' (' + u.country + ')</option>').join('');
    const p = load();
    if (p) {
      $('ylUni').value = p.uni;
      $('ylYear').value = p.year;
      $('ylIelts').value = p.ielts;
      $('ylIeltsOut').textContent = Number(p.ielts).toFixed(1);
      $('ylGrade').value = p.grade;
      $('ylSat').checked = !!p.sat;
      $('ylAid').checked = !!p.aid;
      if (Array.prototype.some.call($('ylYear').options, (o) => o.value === String(p.year))) build(p);
    }
  });
})();
