/* ==========================================================================
   MyHarvardPath — "Kunning so'zi" va Flashcard lug'at moduli
   Faqat lugat-va-iboralar.html sahifasida ishlaydi.
   ========================================================================== */

const VOCAB_WORDS = [
  // ---- Insho / college essay ----
  { w: "eloquent", p: "sifat", uz: "notiq, ta'sirli va ravon so'zlovchi", ex: "Her eloquent speech convinced the entire admissions committee.", cat: "insho" },
  { w: "resilience", p: "ot", uz: "chidamlilik, qiyinchiliklarga bardosh berish qobiliyati", ex: "The essay focused on the resilience she showed after her family moved abroad.", cat: "insho" },
  { w: "tenacity", p: "ot", uz: "qat'iyatlilik, mustahkam sabot", ex: "His tenacity during three years of training finally paid off.", cat: "insho" },
  { w: "altruistic", p: "sifat", uz: "fidoyi, o'zgalar manfaatini ko'zlovchi", ex: "She started an altruistic project to tutor younger students for free.", cat: "insho" },
  { w: "pragmatic", p: "sifat", uz: "amaliy, real hayotga mos yondashadigan", ex: "He took a pragmatic approach to solving the school's recycling problem.", cat: "insho" },
  { w: "integrity", p: "ot", uz: "halollik, ichki poklik", ex: "Admissions officers pay close attention to signs of integrity in your essay.", cat: "insho" },
  { w: "perseverance", p: "ot", uz: "matonat, qiyinchilikka qaramay davom etish", ex: "Perseverance, not talent alone, got her through the hardest year of school.", cat: "insho" },
  { w: "innovative", p: "sifat", uz: "innovatsion, yangilik kirituvchi", ex: "The club launched an innovative way to teach coding to younger kids.", cat: "insho" },
  { w: "discern", p: "fe'l", uz: "farqlamoq, chuqur anglab yetmoq", ex: "It took time for him to discern which career path truly excited him.", cat: "insho" },
  { w: "feasible", p: "sifat", uz: "amalga oshirish mumkin bo'lgan", ex: "The team proposed a feasible plan to reduce plastic waste at school.", cat: "insho" },
  { w: "coherent", p: "sifat", uz: "izchil, mantiqiy bog'langan", ex: "A coherent essay connects every paragraph back to one central idea.", cat: "insho" },
  { w: "comprehensive", p: "sifat", uz: "keng qamrovli, har tomonlama", ex: "She gave a comprehensive account of her three years of research.", cat: "insho" },
  { w: "advocate", p: "fe'l / ot", uz: "himoya qilmoq, tarafdorlik qilmoq / tarafdor", ex: "He became a strong advocate for mental health awareness at his school.", cat: "insho" },
  { w: "contemplate", p: "fe'l", uz: "chuqur o'ylamoq, mulohaza yuritmoq", ex: "Sitting by the river, she contemplated why she loved biology so much.", cat: "insho" },
  { w: "endeavor", p: "ot / fe'l", uz: "jiddiy urinish, harakat / harakat qilmoq", ex: "Starting the school newspaper was her most ambitious endeavor yet.", cat: "insho" },
  { w: "cultivate", p: "fe'l", uz: "rivojlantirmoq, asta-sekin shakllantirmoq", ex: "Debate club helped him cultivate the confidence to speak in public.", cat: "insho" },
  { w: "foster", p: "fe'l", uz: "rivojlanishiga ko'maklashmoq, quvvatlamoq", ex: "The teacher fostered a genuine love of literature in her students.", cat: "insho" },
  { w: "encompass", p: "fe'l", uz: "o'z ichiga olmoq, qamrab olmoq", ex: "Her interests encompass everything from robotics to poetry.", cat: "insho" },
  { w: "underscore", p: "fe'l", uz: "alohida ta'kidlamoq, urg'u bermoq", ex: "This experience underscored how much she valued community work.", cat: "insho" },
  { w: "exemplify", p: "fe'l", uz: "misolida ko'rsatmoq, aniq namoyon etmoq", ex: "This one afternoon exemplifies everything I learned that summer.", cat: "insho" },
  { w: "facilitate", p: "fe'l", uz: "qulaylashtirmoq, yengillashtirib bermoq", ex: "The mentorship program facilitated his transition to a new school.", cat: "insho" },
  { w: "conscientious", p: "sifat", uz: "vijdonli, mas'uliyatli va ehtiyotkor", ex: "Teachers described her as a quiet but conscientious student.", cat: "insho" },
  { w: "gratitude", p: "ot", uz: "minnatdorchilik", ex: "The essay ended with a note of gratitude toward her grandmother.", cat: "insho" },
  { w: "humility", p: "ot", uz: "kamtarlik", ex: "Winning the competition taught him more about humility than pride.", cat: "insho" },
  { w: "authenticity", p: "ot", uz: "asllik, o'zgarmagan haqiqiy holat", ex: "Admissions officers value authenticity far more than perfect grammar.", cat: "insho" },
  { w: "vulnerability", p: "ot", uz: "ochiqlik, o'z zaifligini yashirmaslik", ex: "Writing about failure with vulnerability made her essay memorable.", cat: "insho" },
  { w: "adversity", p: "ot", uz: "qiyinchilik, mushkulot", ex: "He wrote about overcoming adversity after his family lost their business.", cat: "insho" },
  { w: "aspiration", p: "ot", uz: "orzu-umid, intilish", ex: "Her aspiration is to study environmental engineering.", cat: "insho" },
  { w: "introspective", p: "sifat", uz: "o'z ichki dunyosini kuzatuvchi", ex: "The prompt asked for an introspective look at a moment of change.", cat: "insho" },
  { w: "catalyst", p: "ot", uz: "turtki beruvchi omil, sabab", ex: "That one conversation was the catalyst for her decision to apply.", cat: "insho" },

  // ---- IELTS / akademik yozuv ----
  { w: "consequently", p: "ravish", uz: "natijada, oqibatda", ex: "The factory closed; consequently, hundreds of jobs were lost.", cat: "ielts" },
  { w: "nevertheless", p: "ravish", uz: "shunga qaramay", ex: "The task was difficult; nevertheless, most students completed it on time.", cat: "ielts" },
  { w: "whereas", p: "bog'lovchi", uz: "holbuki, aksincha", ex: "Public transport is cheap in the city, whereas it is scarce in rural areas.", cat: "ielts" },
  { w: "albeit", p: "bog'lovchi", uz: "garchi ... bo'lsa-da", ex: "The plan worked, albeit more slowly than expected.", cat: "ielts" },
  { w: "notwithstanding", p: "predlog / ravish", uz: "shunga qaramasdan", ex: "Notwithstanding the risks, the government approved the new policy.", cat: "ielts" },
  { w: "corroborate", p: "fe'l", uz: "tasdiqlamoq, dalil bilan quvvatlamoq", ex: "Recent studies corroborate the earlier findings on climate change.", cat: "ielts" },
  { w: "substantiate", p: "fe'l", uz: "dalillar bilan asoslamoq", ex: "The essay fails to substantiate its main argument with evidence.", cat: "ielts" },
  { w: "dwindle", p: "fe'l", uz: "kamayib bormoq, qisqarmoq", ex: "The town's population has dwindled over the past two decades.", cat: "ielts" },
  { w: "plummet", p: "fe'l", uz: "keskin pasaymoq", ex: "Sales plummeted after the new tax was introduced.", cat: "ielts" },
  { w: "surge", p: "ot / fe'l", uz: "keskin ko'tarilish, oshib ketish", ex: "There was a sudden surge in applications this year.", cat: "ielts" },
  { w: "fluctuate", p: "fe'l", uz: "o'zgarib turmoq, tebranmoq", ex: "Oil prices fluctuate depending on global demand.", cat: "ielts" },
  { w: "exacerbate", p: "fe'l", uz: "yomonlashtirmoq, kuchaytirmoq", ex: "Poor drainage exacerbates flooding in the region.", cat: "ielts" },
  { w: "stagnant", p: "sifat", uz: "turg'un, o'zgarmas holatda qolgan", ex: "Wages have remained stagnant for the last five years.", cat: "ielts" },
  { w: "unprecedented", p: "sifat", uz: "misli ko'rilmagan", ex: "The country faced an unprecedented rise in energy costs.", cat: "ielts" },
  { w: "ramifications", p: "ot (ko'plik)", uz: "oqibatlar, natijalar", ex: "The policy change had serious ramifications for small businesses.", cat: "ielts" },
  { w: "implications", p: "ot (ko'plik)", uz: "ta'sirlar, yashirin natijalar", ex: "The report examines the implications of automation for future jobs.", cat: "ielts" },
  { w: "discrepancy", p: "ot", uz: "nomuvofiqlik, farq", ex: "There is a clear discrepancy between the two sets of data.", cat: "ielts" },
  { w: "anomaly", p: "ot", uz: "g'ayrioddiy hodisa, me'yordan chetlanish", ex: "This year's results are an anomaly compared to the usual trend.", cat: "ielts" },
  { w: "paradox", p: "ot", uz: "paradoks, o'zaro ziddiyatli holat", ex: "It is a paradox that richer countries often waste more food.", cat: "ielts" },
  { w: "dilemma", p: "ot", uz: "qiyin tanlov, ikkilanish holati", ex: "Governments face a dilemma between economic growth and environmental protection.", cat: "ielts" },
  { w: "consensus", p: "ot", uz: "umumiy kelishuv, birdamlik", ex: "There is a growing consensus among scientists on this issue.", cat: "ielts" },
  { w: "deteriorate", p: "fe'l", uz: "yomonlashmoq", ex: "Air quality in the city has deteriorated over the past decade.", cat: "ielts" },
  { w: "flourish", p: "fe'l", uz: "gullab-yashnamoq, rivojlanmoq", ex: "Small businesses flourished after the new law was passed.", cat: "ielts" },
  { w: "circumvent", p: "fe'l", uz: "chetlab o'tmoq (qoida yoki to'siqni)", ex: "Some companies find ways to circumvent environmental regulations.", cat: "ielts" },
  { w: "comprehend", p: "fe'l", uz: "tushunmoq, anglamoq", ex: "It can be hard to comprehend the true scale of the problem.", cat: "ielts" },
  { w: "infer", p: "fe'l", uz: "xulosa chiqarmoq", ex: "From the graph, we can infer that sales rose steadily.", cat: "ielts" },
  { w: "presume", p: "fe'l", uz: "taxmin qilmoq, faraz qilmoq", ex: "It is reasonable to presume that the trend will continue.", cat: "ielts" },
  { w: "perceive", p: "fe'l", uz: "idrok etmoq, qabul qilmoq", ex: "The policy was perceived as unfair by many residents.", cat: "ielts" },
  { w: "scrutinize", p: "fe'l", uz: "diqqat bilan tekshirmoq", ex: "Reviewers scrutinize every essay for originality.", cat: "ielts" },
  { w: "elucidate", p: "fe'l", uz: "tushuntirmoq, oydinlashtirmoq", ex: "The professor elucidated the theory with a simple example.", cat: "ielts" },

  // ---- Kundalik / rasmiy suhbat ----
  { w: "versatile", p: "sifat", uz: "ko'p qirrali, moslashuvchan", ex: "She's a versatile student who is good at both science and art.", cat: "suhbat" },
  { w: "ambitious", p: "sifat", uz: "shuhratparast, katta maqsad qo'yuvchi", ex: "He has always been ambitious about studying abroad.", cat: "suhbat" },
  { w: "humble", p: "sifat", uz: "kamtar", ex: "Despite winning, she stayed humble and thanked her teammates.", cat: "suhbat" },
  { w: "diligent", p: "sifat", uz: "tirishqoq, mehnatsevar", ex: "He's known as the most diligent student in his class.", cat: "suhbat" },
  { w: "disciplined", p: "sifat", uz: "intizomli", ex: "You need to be disciplined to study for the SAT while working.", cat: "suhbat" },
  { w: "adaptable", p: "sifat", uz: "moslashuvchan", ex: "Moving schools twice made her very adaptable to new environments.", cat: "suhbat" },
  { w: "curious", p: "sifat", uz: "qiziquvchan", ex: "He was always curious about how machines worked.", cat: "suhbat" },
  { w: "compassionate", p: "sifat", uz: "mehribon, rahmdil", ex: "Her compassionate nature made her a great volunteer.", cat: "suhbat" },
  { w: "resourceful", p: "sifat", uz: "tadbirkor, chora topa oladigan", ex: "With no budget, the team was resourceful and built the set from recycled wood.", cat: "suhbat" },
  { w: "proactive", p: "sifat", uz: "oldindan chora ko'ruvchi, tashabbuskor", ex: "She was proactive about asking teachers for extra help.", cat: "suhbat" },
  { w: "genuine", p: "sifat", uz: "samimiy, chin", ex: "His interest in astronomy is completely genuine.", cat: "suhbat" },
  { w: "candid", p: "sifat", uz: "ochiq-oshkora, samimiy gapiradigan", ex: "She gave a candid answer about why she failed the first exam.", cat: "suhbat" },
  { w: "articulate", p: "sifat / fe'l", uz: "fikrini aniq ifodalay oladigan / aniq ifodalamoq", ex: "He's remarkably articulate for someone his age.", cat: "suhbat" },
  { w: "profound", p: "sifat", uz: "chuqur (ta'sir yoki ma'noda)", ex: "The trip had a profound effect on how she saw the world.", cat: "suhbat" },
  { w: "subtle", p: "sifat", uz: "nozik, sezilar-sezilmas", ex: "There was a subtle change in his tone after the interview.", cat: "suhbat" },
  { w: "ambiguous", p: "sifat", uz: "noaniq, ikki xil tushuniladigan", ex: "The instructions were a bit ambiguous, so students asked for clarification.", cat: "suhbat" },
  { w: "meticulous", p: "sifat", uz: "juda diqqatli, mayda-chuydasigacha ehtiyotkor", ex: "She was meticulous about checking every source in her essay.", cat: "suhbat" },
  { w: "skeptical", p: "sifat", uz: "shubhalanuvchi", ex: "He was skeptical at first, but the results convinced him.", cat: "suhbat" },
  { w: "plausible", p: "sifat", uz: "ishonarli, mantiqan to'g'ri", ex: "That's a plausible explanation for the delay.", cat: "suhbat" },
  { w: "credible", p: "sifat", uz: "ishonchli", ex: "Always check whether a source is credible before citing it.", cat: "suhbat" },
  { w: "controversial", p: "sifat", uz: "bahsli, tortishuvli", ex: "The topic she chose for her essay was quite controversial.", cat: "suhbat" },
  { w: "prevalent", p: "sifat", uz: "keng tarqalgan", ex: "Smartphone addiction is increasingly prevalent among teenagers.", cat: "suhbat" },
  { w: "ubiquitous", p: "sifat", uz: "hamma joyda uchraydigan", ex: "Social media has become ubiquitous in daily life.", cat: "suhbat" },
  { w: "subjective", p: "sifat", uz: "shaxsiy qarashga asoslangan", ex: "Grading essays can be somewhat subjective.", cat: "suhbat" },
  { w: "objective", p: "sifat / ot", uz: "xolis, adolatli / maqsad", ex: "Try to give an objective summary, not just your opinion.", cat: "suhbat" },
  { w: "inevitable", p: "sifat", uz: "muqarrar, sodir bo'lishi shubhasiz", ex: "With so little preparation, failure felt almost inevitable.", cat: "suhbat" },
  { w: "arguably", p: "ravish", uz: "ehtimol, deyarli shubhasiz (fikr bildirishda)", ex: "This is arguably the most important decision of her life so far.", cat: "suhbat" },
  { w: "significant", p: "sifat", uz: "muhim, sezilarli", ex: "There was a significant improvement in her writing this year.", cat: "suhbat" },
  { w: "crucial", p: "sifat", uz: "hal qiluvchi, juda muhim", ex: "Recommendation letters play a crucial role in the application.", cat: "suhbat" },
  { w: "paramount", p: "sifat", uz: "eng muhim, ustuvor", ex: "Honesty is paramount when writing your personal essay.", cat: "suhbat" }
];

const CAT_LABELS = { insho: "Insho", ielts: "IELTS", suhbat: "Suhbat" };
const KNOWN_KEY = 'mhp-vocab-known';
const BEST_KEY = 'mhp-vocab-best';

function loadKnown() {
  try { return JSON.parse(localStorage.getItem(KNOWN_KEY) || '{}'); }
  catch { return {}; }
}
function saveKnown(state) {
  try { localStorage.setItem(KNOWN_KEY, JSON.stringify(state)); } catch {}
}
function loadBest() {
  try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}'); }
  catch { return {}; }
}
function saveBest(state) {
  try { localStorage.setItem(BEST_KEY, JSON.stringify(state)); } catch {}
}

/* ---------- Kunning so'zi ---------- */
(function wordOfDay() {
  const wodWord = document.getElementById('wodWord');
  if (!wodWord) return;
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const dayOfYear = Math.floor(diff / 86400000);
  const idx = dayOfYear % VOCAB_WORDS.length;
  const item = VOCAB_WORDS[idx];

  document.getElementById('wodWord').textContent = item.w;
  document.getElementById('wodPos').textContent = item.p;
  document.getElementById('wodCat').textContent = CAT_LABELS[item.cat];
  document.getElementById('wodUz').textContent = item.uz;
  document.getElementById('wodEx').textContent = item.ex;
  const dateEl = document.getElementById('wodDate');
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  const wodEx = document.getElementById('wodEx');
  if (wodEx && !document.getElementById('wodCopy')) {
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'wod-copy';
    copyBtn.id = 'wodCopy';
    copyBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg> Nusxalash';
    wodEx.insertAdjacentElement('afterend', copyBtn);
    copyBtn.addEventListener('click', () => {
      const text = `${item.w} — ${item.uz}\n${item.ex}`;
      navigator.clipboard?.writeText(text).then(() => {
        copyBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Nusxalandi';
        setTimeout(() => { copyBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg> Nusxalash'; }, 1500);
      });
    });
  }
})();

/* ---------- Mode tabs (Flashcard / Test) ---------- */
(function modeTabs() {
  const tabs = document.querySelectorAll('.mode-tab');
  const flashPane = document.getElementById('flashPane');
  const testPane = document.getElementById('testPane');
  if (!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const mode = tab.dataset.mode;
      flashPane.hidden = mode !== 'flash';
      testPane.hidden = mode !== 'test';
    });
  });
})();

/* ---------- Umumiy progress bar ---------- */
function updateVocabProgress() {
  const known = loadKnown();
  const fill = document.getElementById('vpFill');
  const label = document.getElementById('vpLabel');
  if (!fill || !label) return;
  const total = VOCAB_WORDS.length;
  const count = VOCAB_WORDS.filter(w => known[w.w]).length;
  const pct = total ? Math.round((count / total) * 100) : 0;
  fill.style.width = pct + '%';
  label.textContent = `${count} / ${total} so'zni bilasiz`;
}

/* ---------- Flashcardlar ---------- */
(function flashcards() {
  const card = document.getElementById('flashcard');
  if (!card) return;

  const front = document.getElementById('flashFrontWord');
  const frontPos = document.getElementById('flashFrontPos');
  const frontCat = document.getElementById('flashFrontCat');
  const backUz = document.getElementById('flashBackUz');
  const backEx = document.getElementById('flashBackEx');
  const progress = document.getElementById('flashProgress');
  const chips = document.getElementById('flashChips');
  const onlyUnknownChip = document.getElementById('onlyUnknownChip');

  let deck = VOCAB_WORDS.slice();
  let pos = 0;
  let activeCat = 'all';
  let onlyUnknown = false;

  function buildDeck() {
    const known = loadKnown();
    let pool = activeCat === 'all' ? VOCAB_WORDS.slice() : VOCAB_WORDS.filter(w => w.cat === activeCat);
    if (onlyUnknown) pool = pool.filter(w => !known[w.w]);
    deck = pool;
    pos = 0;
    card.classList.remove('flipped');
    render();
  }

  function render() {
    if (!deck.length) {
      front.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:44px;height:44px;color:var(--teal)"><circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 5-5"/></svg>';
      frontPos.textContent = "";
      frontCat.textContent = "";
      backUz.textContent = "Bu kategoriyada barcha so'zlarni bilasiz!";
      backEx.textContent = "";
      progress.textContent = `0 / 0`;
      return;
    }
    const item = deck[pos];
    front.textContent = item.w;
    frontPos.textContent = item.p;
    frontCat.textContent = CAT_LABELS[item.cat];
    backUz.textContent = item.uz;
    backEx.textContent = item.ex;
    progress.textContent = `${pos + 1} / ${deck.length}`;
    card._currentWord = item;
  }

  function advance() {
    if (!deck.length) return;
    pos = (pos + 1) % deck.length;
    card.classList.remove('flipped');
    render();
  }

  card.addEventListener('click', () => { if (deck.length) card.classList.toggle('flipped'); });

  if (backEx && !document.getElementById('flashCopy')) {
    const flashCopyBtn = document.createElement('button');
    flashCopyBtn.type = 'button';
    flashCopyBtn.className = 'flash-copy';
    flashCopyBtn.id = 'flashCopy';
    flashCopyBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg> Nusxalash';
    backEx.insertAdjacentElement('afterend', flashCopyBtn);
    flashCopyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = card._currentWord;
      if (!item) return;
      const text = `${item.w} — ${item.uz}\n${item.ex}`;
      navigator.clipboard?.writeText(text).then(() => {
        flashCopyBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Nusxalandi';
        flashCopyBtn.classList.add('copied');
        setTimeout(() => { flashCopyBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg> Nusxalash'; flashCopyBtn.classList.remove('copied'); }, 1500);
      });
    });
  }

  const nextBtn = document.getElementById('flashNext');
  const prevBtn = document.getElementById('flashPrev');
  const shuffleBtn = document.getElementById('flashShuffle');
  const knowBtn = document.getElementById('flashKnow');
  const unknownBtn = document.getElementById('flashUnknown');

  if (nextBtn) nextBtn.addEventListener('click', advance);
  if (prevBtn) prevBtn.addEventListener('click', () => {
    if (!deck.length) return;
    pos = (pos - 1 + deck.length) % deck.length;
    card.classList.remove('flipped');
    render();
  });
  if (shuffleBtn) shuffleBtn.addEventListener('click', () => {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    pos = 0;
    card.classList.remove('flipped');
    render();
  });

  if (knowBtn) knowBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!deck.length) return;
    const known = loadKnown();
    known[deck[pos].w] = true;
    saveKnown(known);
    updateVocabProgress();
    if (onlyUnknown) { buildDeck(); } else { advance(); }
  });
  if (unknownBtn) unknownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!deck.length) return;
    const known = loadKnown();
    delete known[deck[pos].w];
    saveKnown(known);
    updateVocabProgress();
    advance();
  });

  if (chips) {
    chips.querySelectorAll('.chip:not(.chip-alt)').forEach(chip => {
      chip.addEventListener('click', () => {
        chips.querySelectorAll('.chip:not(.chip-alt)').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeCat = chip.dataset.cat;
        buildDeck();
      });
    });
  }
  if (onlyUnknownChip) {
    onlyUnknownChip.addEventListener('click', () => {
      onlyUnknown = !onlyUnknown;
      onlyUnknownChip.classList.toggle('active', onlyUnknown);
      buildDeck();
    });
  }

  buildDeck();
  updateVocabProgress();
})();

/* ---------- Test rejimi ---------- */
(function testMode() {
  const wordEl = document.getElementById('testWord');
  if (!wordEl) return;

  const optionsEl = document.getElementById('testOptions');
  const countEl = document.getElementById('testCount');
  const bestEl = document.getElementById('testBest');
  const nextBtn = document.getElementById('testNext');
  const restartBtn = document.getElementById('testRestart');
  const resultEl = document.getElementById('testResult');
  const chips = document.getElementById('testChips');

  const QUIZ_LENGTH = 10;
  let activeCat = 'all';
  let quiz = [];
  let qIndex = 0;
  let score = 0;
  let answered = false;

  function pool() {
    return activeCat === 'all' ? VOCAB_WORDS.slice() : VOCAB_WORDS.filter(w => w.cat === activeCat);
  }

  function shuffled(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function showBest() {
    const best = loadBest();
    const b = best[activeCat];
    bestEl.textContent = b ? `Eng yaxshi natija: ${b.score} / ${b.total}` : '';
  }

  function startQuiz() {
    const source = pool();
    const len = Math.min(QUIZ_LENGTH, source.length);
    quiz = shuffled(source).slice(0, len);
    qIndex = 0;
    score = 0;
    answered = false;
    resultEl.hidden = true;
    nextBtn.style.display = 'none';
    showBest();
    renderQuestion();
  }

  function renderQuestion() {
    answered = false;
    nextBtn.style.display = 'none';
    const item = quiz[qIndex];
    countEl.textContent = `Savol ${qIndex + 1} / ${quiz.length} — ${score} to'g'ri`;
    wordEl.textContent = item.w;

    const distractorSource = VOCAB_WORDS.filter(w => w.w !== item.w);
    const distractors = shuffled(distractorSource).slice(0, 3);
    const options = shuffled([item, ...distractors]);

    optionsEl.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'test-option';
      btn.textContent = opt.uz;
      btn.addEventListener('click', () => selectAnswer(btn, opt.w === item.w));
      optionsEl.appendChild(btn);
    });
  }

  function selectAnswer(btn, isCorrect) {
    if (answered) return;
    answered = true;
    if (isCorrect) {
      score++;
      btn.classList.add('correct');
    } else {
      btn.classList.add('wrong');
      optionsEl.querySelectorAll('.test-option').forEach(o => {
        if (o.textContent === quiz[qIndex].uz) o.classList.add('correct');
      });
    }
    optionsEl.querySelectorAll('.test-option').forEach(o => o.disabled = true);
    countEl.textContent = `Savol ${qIndex + 1} / ${quiz.length} — ${score} to'g'ri`;

    if (qIndex + 1 < quiz.length) {
      nextBtn.style.display = 'inline-block';
    } else {
      finishQuiz();
    }
  }

  function finishQuiz() {
    const best = loadBest();
    const prev = best[activeCat];
    if (!prev || score > prev.score) {
      best[activeCat] = { score, total: quiz.length };
      saveBest(best);
    }
    resultEl.hidden = false;
    resultEl.textContent = `Test tugadi: ${score} / ${quiz.length} to'g'ri javob.`;
    showBest();
  }

  if (nextBtn) nextBtn.addEventListener('click', () => {
    qIndex++;
    renderQuestion();
  });
  if (restartBtn) restartBtn.addEventListener('click', startQuiz);
  if (chips) {
    chips.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        chips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeCat = chip.dataset.cat;
        startQuiz();
      });
    });
  }

  startQuiz();
})();
