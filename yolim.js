/* Mening rejam — shaxsiy yo'l xaritasi + AI tahlil. Profil brauzerda (localStorage) saqlanadi. */
(function () {
  const form = document.getElementById('ylForm');
  if (!form) return;
  const $ = (id) => document.getElementById(id);
  const KEY = 'mhp-plan';
  const MS_DAY = 86400000;
  let unis = [];
  let certs = new Set();

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  const save = (p) => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

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

  const nums = (t) => (String(t || '').match(/\d+(?:\.\d+)?/g) || []).map(parseFloat);
  const need = (u) => {
    const t = String(u.ielts || '');
    if (/majburiy emas/i.test(t)) return 0;
    const n = nums(t).filter((x) => x >= 4 && x <= 9);
    return n.length ? Math.max.apply(null, n.slice(0, 2)) : 6.5;
  };
  const rate = (u) => { const n = nums(u.acceptanceRate); return n.length ? n[0] : 40; };
  // Universitet qiyinligiga qarab taxminiy kutiladigan GPA (4.0) va SAT
  const bar = (u) => { const a = rate(u); return a < 8 ? { g: 3.85, s: 1520 } : a < 20 ? { g: 3.7, s: 1450 } : a < 50 ? { g: 3.4, s: 1300 } : { g: 3.0, s: 1100 }; };
  const needsSat = (u) => !/yo.q|kerak emas|majburiy emas|test-optional/i.test(String(u.test || '')) || /SAT|ACT/i.test(String(u.test || ''));
  const gpa4 = (v, scale) => {
    v = parseFloat(v) || 0;
    const x = scale === '5' ? (v / 5) * 4 : scale === '100' ? (v / 100) * 4 : v;
    return Math.max(0, Math.min(4, x));
  };
  const addMonths = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() - m); return x; };
  const fmtDate = (d) => d.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long' });

  function fillYears() {
    const y0 = new Date().getFullYear() + 1;
    $('ylYear').innerHTML = [0, 1, 2, 3, 4].map((i) => '<option value="' + (y0 + i) + '">' + (y0 + i) + '</option>').join('');
  }
  const ieltsText = (v) => (Number(v) > 0 ? Number(v).toFixed(1) : "yo'q");
  const satText = (v) => (Number(v) > 0 ? String(v) : "yo'q");
  $('ylIelts').addEventListener('input', (e) => { $('ylIeltsOut').textContent = ieltsText(e.target.value); });
  $('ylSatScore').addEventListener('input', (e) => { $('ylSatOut').textContent = satText(e.target.value); });
  $('ylChips').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const c = b.dataset.c;
    if (certs.has(c)) certs.delete(c); else certs.add(c);
    b.classList.toggle('on', certs.has(c));
  });

  // ---- tayyorlik tahlili (lokal hisob) ----
  function fit(p, u, doneRatio, months) {
    const b = bar(u), needV = need(u), g = gpa4(p.gpa, p.gpaScale);
    const gpaK = Math.min(1, g / b.g);
    const satReq = needsSat(u);
    const satK = p.sat > 0 ? Math.min(1, p.sat / b.s) : (satReq ? 0 : 0.6);
    const ieltsK = needV ? Math.min(1, p.ielts / needV) : 1;
    const certN = (p.certs || []).length + (p.extra && p.extra.trim().length > 10 ? 1 : 0);
    const certK = Math.min(1, certN * 0.22);
    const timeK = 1 - Math.abs(Math.min(1, months / 18) - 0.6);
    const score = Math.round(100 * (0.27 * gpaK + 0.2 * satK + 0.2 * ieltsK + 0.13 * certK + 0.15 * doneRatio + 0.05 * timeK));
    return { score, rows: [
      { k: 'GPA', v: gpaK, t: g.toFixed(2) + ' / ' + b.g.toFixed(2) },
      { k: 'SAT', v: satK, t: (p.sat > 0 ? p.sat : "yo'q") + (satReq ? ' / ' + b.s : ' (majburiy emas)') },
      { k: 'IELTS', v: ieltsK, t: (p.ielts > 0 ? p.ielts.toFixed(1) : "yo'q") + ' / ' + (needV ? needV.toFixed(1) : '—') },
      { k: 'Yutuqlar', v: certK, t: certN + ' ta' },
    ] };
  }

  function build(p) {
    const u = unis.find((x) => x.id === p.uni) || unis[0];
    const deadline = new Date(p.year, 0, 1);
    const today = new Date();
    const days = Math.max(0, Math.ceil((deadline - today) / MS_DAY));
    const months = Math.max(0, Math.round(days / 30.4));
    const needV = need(u);
    const needSatStep = needsSat(u) && !(p.sat >= bar(u).s);
    const steps = STEPS
      .filter((s) => (!s.sat || p.sat || needSatStep) && (!s.aid || p.aid) && (!s.ielts || p.ielts < needV))
      .map((s) => Object.assign({}, s, { id: 's' + s.m, date: addMonths(deadline, s.m) }));
    const done = new Set(p.done || []);
    let last = null;

    const render = () => {
      const doneN = steps.filter((s) => done.has(s.id)).length;
      const prog = steps.length ? doneN / steps.length : 0;
      const f = fit(p, u, prog, months);
      last = f;
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
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / 800);
        $('ylScore').textContent = Math.round(from + (f.score - from) * (1 - Math.pow(1 - k, 3))) + '%';
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
    $('ylAiBtn').onclick = () => runAi(p, u, last, months);
    $('ylAiOut').innerHTML = '';
    $('ylResult').hidden = false;
  }

  // ---- AI tahlil ----
  const VERD = { reach: ['Reach: qiyin, lekin imkon bor', '#ff9f0a'], match: ['Match: kuchli imkoniyat', '#0088ff'], safe: ['Safe: ehtimol yuqori', '#34c759'] };
  function renderAi(r, tag) {
    const v = VERD[r.verdict] || VERD.reach;
    const li = (a) => (a || []).map((x) => '<li>' + esc(x) + '</li>').join('');
    $('ylAiOut').innerHTML =
      '<div class="yl-verdict" style="--c:' + v[1] + '"><b>' + v[0] + '</b>' + (r.chance ? '<span>Taxminiy imkoniyat: ' + esc(r.chance) + '</span>' : '') + (tag ? '<em>' + esc(tag) + '</em>' : '') + '</div>' +
      (r.summary ? '<p class="yl-sum">' + esc(r.summary) + '</p>' : '') +
      '<div class="yl-two"><div><h4>Kuchli tomonlar</h4><ul>' + li(r.strengths) + '</ul></div><div><h4>Kuchaytirish kerak</h4><ul>' + li(r.gaps) + '</ul></div></div>' +
      (r.certificates ? '<p class="yl-cert"><b>Sertifikat va yutuqlar:</b> ' + esc(r.certificates) + '</p>' : '') +
      '<h4>Keyingi qadamlar</h4><ol class="yl-actions">' + li(r.actions) + '</ol>';
  }
  function localAi(p, u, f, months) {
    const weak = f.rows.filter((r) => r.v < 0.85).sort((a, b) => a.v - b.v);
    const strong = f.rows.filter((r) => r.v >= 0.85);
    const verdict = f.score >= 75 ? 'match' : f.score >= 55 ? 'reach' : 'reach';
    const act = [];
    weak.forEach((r) => {
      if (r.k === 'GPA') act.push("GPA: joriy baholarni yaxshilang va murakkab fanlarni (AP/IB yoki kuchaytirilgan kurs) tanlang.");
      if (r.k === 'SAT') act.push('SAT: diagnostik test topshiring va haftasiga 3–4 soat tayyorlaning, maqsad ' + bar(u).s + '+.');
      if (r.k === 'IELTS') act.push('IELTS: ' + (need(u) || 6.5).toFixed(1) + ' ballga yetish uchun kurs va haftalik mock testlar rejalashtiring.');
      if (r.k === 'Yutuqlar') act.push("Yutuqlar: 1–2 ta chuqur faoliyat tanlang (olimpiada, tadqiqot yoki loyiha) va natijani raqamda ko'rsating.");
    });
    act.push('Insho: ' + Math.max(2, months - 3) + " oy ichida kamida ikki qoralama yozing va tahrir qildiring.");
    return {
      verdict: verdict, chance: '', summary: u.name + ' uchun tayyorlik darajangiz taxminan ' + f.score + "%. Bu oddiy hisob; aniqroq tahlil uchun AI ulanishi kerak.",
      strengths: strong.map((r) => r.k + ': ' + r.t), gaps: weak.map((r) => r.k + ': ' + r.t), actions: act,
      certificates: (p.certs || []).length ? "Tanlangan yutuqlar arizangizni kuchaytiradi, ularni insho va faoliyat ro'yxatida aniq natijalar bilan yozing." : "Sertifikat yoki yutuq qo'shsangiz, tahlil aniqroq bo'ladi.",
    };
  }
  async function runAi(p, u, f, months) {
    const btn = $('ylAiBtn');
    btn.disabled = true; btn.textContent = 'Tahlil qilinmoqda…';
    $('ylAiOut').innerHTML = '<div class="yl-ai-load"><span></span><span></span><span></span></div>';
    try {
      const res = await fetch('/api/plan-ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uni: { name: u.name, acceptanceRate: u.acceptanceRate, tuition: u.tuition, aid: u.aid, ielts: u.ielts, test: u.test, system: u.system, deadline: u.deadline },
          profile: { year: p.year, grade: p.grade, gpa4: +gpa4(p.gpa, p.gpaScale).toFixed(2), sat: p.sat, ielts: p.ielts, certs: p.certs, extra: p.extra, aid: p.aid, score: f.score, months: months } }),
      });
      if (res.status === 429) { $('ylAiOut').innerHTML = '<p class="yl-sum">Bugungi AI limiti tugadi. Ertaga qayta urinib ko\'ring.</p>'; }
      else if (!res.ok) { renderAi(localAi(p, u, f, months), 'Oddiy hisob (AI hozir ulanmagan)'); }
      else renderAi(await res.json(), 'AI tahlili');
    } catch (e) { renderAi(localAi(p, u, f, months), 'Oddiy hisob (AI hozir ulanmagan)'); }
    btn.disabled = false; btn.textContent = 'Qayta hisoblash';
  }

  function readForm(prev) {
    const same = prev && prev.uni === $('ylUni').value && String(prev.year) === $('ylYear').value;
    return {
      uni: $('ylUni').value, year: parseInt($('ylYear').value, 10), grade: $('ylGrade').value,
      gpa: parseFloat($('ylGpa').value) || 0, gpaScale: $('ylGpaScale').value,
      ielts: parseFloat($('ylIelts').value) || 0, sat: parseInt($('ylSatScore').value, 10) || 0,
      certs: Array.from(certs), extra: $('ylExtra').value.slice(0, 500),
      satPrep: $('ylSat').checked, aid: $('ylAid').checked, done: same ? (prev.done || []) : [],
    };
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const p = readForm(load());
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
      $('ylGrade').value = p.grade;
      if (p.gpa != null) { $('ylGpa').value = p.gpa; $('ylGpaScale').value = p.gpaScale || '5'; }
      $('ylIelts').value = p.ielts || 0; $('ylIeltsOut').textContent = ieltsText(p.ielts);
      $('ylSatScore').value = p.sat || 0; $('ylSatOut').textContent = satText(p.sat);
      (p.certs || []).forEach((c) => certs.add(c));
      document.querySelectorAll('#ylChips button').forEach((b) => b.classList.toggle('on', certs.has(b.dataset.c)));
      $('ylExtra').value = p.extra || '';
      $('ylSat').checked = !!(p.satPrep || p.sat);
      $('ylAid').checked = !!p.aid;
      if (Array.prototype.some.call($('ylYear').options, (o) => o.value === String(p.year))) build(p);
    }
  });
})();
