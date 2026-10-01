const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ===== TOAST =====
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== THÈME CLAIR / SOMBRE =====
const themeBtn = $('#themeToggle');
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (themeBtn) themeBtn.textContent = theme === 'dark' ? 'Clair' : 'Sombre';
}
let savedTheme = null;
try { savedTheme = localStorage.getItem('theme'); } catch (e) {}
applyTheme(savedTheme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
}

// ===== MENU BURGER =====
const burger = $('#burger');
const navLinks = $('#navLinks');
if (burger) {
  burger.addEventListener('click', () => navLinks.classList.toggle('active'));
  $$('.nav-links a').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('active')));
}

// ===== SCROLL : progression, retour en haut, lien actif =====
const progressBar = $('#progressBar');
const toTop = $('#toTop');
const sections = $$('main section[id], section[id]');
const navAnchors = $$('.nav-links a');
function onScroll() {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  if (progressBar) progressBar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  if (toTop) toTop.classList.toggle('show', h.scrollTop > 600);
  let current = '';
  sections.forEach(s => { if (s.getBoundingClientRect().top < 140) current = s.id; });
  navAnchors.forEach(a => a.classList.toggle('current', current && a.getAttribute('href').endsWith('#' + current)));
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ===== BULLES DU HERO =====
const bubbles = $('.hero-bubbles');
if (bubbles) {
  for (let i = 0; i < 14; i++) {
    const b = document.createElement('span');
    const size = 20 + Math.random() * 70;
    b.className = 'bubble';
    b.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;animation-duration:${8 + Math.random() * 12}s;animation-delay:${-Math.random() * 15}s`;
    bubbles.appendChild(b);
  }
}

// ===== MOTS QUI TOURNENT =====
const rotator = $('#rotator');
if (rotator) {
  const words = ['la douleur chronique', 'la fatigue invisible', 'une maladie rare', 'l\'incompréhension', 'une force immense'];
  let i = 0;
  setInterval(() => {
    rotator.classList.add('fade');
    setTimeout(() => { i = (i + 1) % words.length; rotator.textContent = words[i]; rotator.classList.remove('fade'); }, 400);
  }, 2800);
}

// ===== COMPTEURS ANIMÉS + REVEAL (IntersectionObserver) =====
function animateCounter(el) {
  const target = +el.dataset.count;
  const suffix = el.dataset.suffix || '';
  const start = performance.now();
  const dur = 1600;
  const tick = now => {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString('fr-FR') + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('active');
    if (e.target.dataset.count) animateCounter(e.target);
    io.unobserve(e.target);
  });
}, { threshold: 0.05, rootMargin: "0px 0px -40px 0px" });
$$('.card, .disease-card, .symptom, .stat-item').forEach(el => { el.classList.add('reveal'); io.observe(el); });
$$('[data-count]').forEach(el => io.observe(el));

// ===== FILTRE / RECHERCHE DES MALADIES =====
const grid = $('#diseaseGrid');
if (grid) {
  const search = $('#diseaseSearch');
  let filter = 'all';
  const apply = () => {
    const q = search.value.trim().toLowerCase();
    let n = 0;
    $$('.disease-card', grid).forEach(c => {
      const ok = (filter === 'all' || c.dataset.status === filter) && c.textContent.toLowerCase().includes(q);
      c.hidden = !ok;
      if (ok) n++;
    });
    $('#noResult').hidden = n > 0;
  };
  search.addEventListener('input', apply);
  $$('.chip').forEach(ch => ch.addEventListener('click', () => {
    $$('.chip').forEach(c => c.classList.remove('active'));
    ch.classList.add('active');
    filter = ch.dataset.filter;
    apply();
  }));
}

// ===== QUIZ VRAI / FAUX =====
const quiz = $('#quiz');
if (quiz) {
  const qs = [
    { q: 'Une personne qui a l\'air en bonne santé ne peut pas avoir de handicap.', a: false, e: 'Faux : 80 % des handicaps sont invisibles. L\'apparence ne dit rien de la douleur ou de la fatigue.' },
    { q: 'On parle de maladie rare quand elle touche moins d\'une personne sur 2 000.', a: true, e: 'Vrai : c\'est le seuil européen. Mais il existe plus de 3 000 maladies rares, donc des millions de personnes concernées.' },
    { q: 'Les douleurs chroniques sont souvent « dans la tête ».', a: false, e: 'Faux : la douleur chronique est réelle. Cette idée reçue retarde parfois les diagnostics de plusieurs années.' },
    { q: 'Se reposer suffit à faire disparaître la fatigue d\'une maladie chronique.', a: false, e: 'Faux : cette fatigue n\'est pas celle d\'une mauvaise nuit. Le repos aide, mais ne la guérit pas.' }
  ];
  let idx = 0, score = 0;
  const qEl = $('#quizQ'), exp = $('#quizExplain'), next = $('#quizNext'), acts = $('#quizActions');
  const buttons = $$('button', acts);
  function show() {
    const cur = qs[idx];
    qEl.textContent = cur.q;
    exp.textContent = '';
    next.hidden = true;
    acts.hidden = false;
    buttons.forEach(b => { b.disabled = false; b.classList.remove('good', 'bad'); });
    $('#quizStep').textContent = `Question ${idx + 1}/${qs.length}`;
    $('#quizScore').textContent = `Score : ${score}`;
    $('#quizProgress').style.width = (idx / qs.length) * 100 + '%';
  }
  buttons.forEach(b => b.addEventListener('click', () => {
    const ans = b.dataset.answer === 'true';
    const ok = ans === qs[idx].a;
    if (ok) score++;
    buttons.forEach(x => x.disabled = true);
    b.classList.add(ok ? 'good' : 'bad');
    exp.textContent = (ok ? 'Bonne réponse. ' : 'Pas tout à fait. ') + qs[idx].e;
    $('#quizScore').textContent = `Score : ${score}`;
    next.textContent = idx === qs.length - 1 ? 'Voir mon résultat' : 'Suivant →';
    next.hidden = false;
  }));
  next.addEventListener('click', () => {
    idx++;
    if (idx < qs.length) return show();
    $('#quizProgress').style.width = '100%';
    qEl.innerHTML = `<span class="final">${score}/${qs.length}</span><br>bonnes réponses`;
    exp.textContent = 'Merci d\'avoir joué. Partagez ce quiz pour faire reculer les idées reçues !';
    acts.hidden = true;
    next.textContent = 'Rejouer';
    next.onclick = () => { idx = 0; score = 0; next.onclick = null; show(); };
  });
  show();
}

// ===== THÉORIE DES CUILLÈRES =====
const spoonBar = $('#spoonBar');
if (spoonBar) {
  const TOTAL = 12;
  const tasks = [
    { n: 'Prendre une douche', c: 2 }, { n: 'Préparer à manger', c: 2 },
    { n: 'Faire les courses', c: 3 }, { n: 'Travailler / étudier', c: 4 },
    { n: 'Faire le ménage', c: 3 }, { n: 'Voir des amis', c: 2 },
    { n: 'Rendez-vous médical', c: 3 }, { n: 'Appeler un proche', c: 1 }
  ];
  let left = TOTAL;
  const tasksEl = $('#spoonTasks'), msg = $('#spoonMsg');
  function render() {
    spoonBar.innerHTML = '';
    for (let i = 0; i < TOTAL; i++) {
      const s = document.createElement('span');
            if (i >= left) s.className = 'used';
      spoonBar.appendChild(s);
    }
    $('#spoonLeft').textContent = left;
    $$('.task', tasksEl).forEach(t => { if (!t.classList.contains('done')) t.disabled = +t.dataset.cost > left; });
  }
  function reset() {
    left = TOTAL;
    tasksEl.innerHTML = '';
    tasks.forEach(t => {
      const b = document.createElement('button');
      b.className = 'task';
      b.dataset.cost = t.c;
      b.innerHTML = `${t.n}<b>−${t.c} cuillère${t.c > 1 ? 's' : ''}</b>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('done') || t.c > left) return;
        left -= t.c;
        b.classList.add('done');
        b.disabled = true;
        msg.textContent = left === 0
          ? 'Plus aucune cuillère. Pour beaucoup de malades, c\'est le quotidien : il faut choisir, et renoncer.'
          : 'Il reste de l\'énergie… mais chaque choix en retire. Demain, il faudra recommencer.';
        render();
      });
      tasksEl.appendChild(b);
    });
    msg.textContent = 'Choisissez vos activités de la journée…';
    render();
  }
  $('#spoonReset').addEventListener('click', reset);
  reset();
}

// ===== FORMULAIRE =====
const form = $('#contact-form');
if (form) {
  const msgBox = $('#message'), count = $('#msgCount');
  msgBox.addEventListener('input', () => count.textContent = `${msgBox.value.length} / 500`);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const nom = $('#nom').value.trim();
    $('#form-message').textContent = `Merci ${nom}. Votre message a bien été envoyé !`;
    toast('Message envoyé');
    form.reset();
    count.textContent = '0 / 500';
  });
}

// ===== PAGE ARTICLE : symptômes dépliables, checklist, partage =====
const details = {
  'Hypermobilité articulaire': 'Les articulations dépassent leur amplitude normale : subluxations, instabilité, douleurs après un simple effort.',
  'Fragilité de la peau': 'Ecchymoses spontanées, cicatrices larges et « papyracées », plaies longues à guérir.',
  'Douleurs chroniques': 'Souvent musculaires et articulaires, présentes même au repos. Elles fluctuent d\'un jour à l\'autre.',
  'Fatigue intense': 'Un sommeil réparateur ne suffit pas. Le moindre effort peut coûter plusieurs jours de récupération.',
  'Troubles cardiovasculaires': 'Dysautonomie (POTS) : le cœur s\'emballe au passage debout, avec vertiges et risque de malaise.',
  'Troubles digestifs': 'Digestion ralentie, douleurs abdominales, intolérances alimentaires.'
};
$$('.symptom').forEach(s => {
  const more = document.createElement('p');
  more.className = 'more';
  more.textContent = details[$('h4', s).textContent] || '';
  s.appendChild(more);
  const toggle = () => s.classList.toggle('open');
  s.addEventListener('click', toggle);
  s.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
});

const checklist = $('#checklist');
if (checklist) {
  const res = $('#checkResult');
  checklist.addEventListener('change', () => {
    const n = $$('input:checked', checklist).length;
    res.textContent = n === 0 ? 'Aucun signe coché.'
      : n < 3 ? `${n} signe(s) coché(s). Rien de concluant, mais restez à l'écoute de votre corps.`
      : `${n} signes cochés. Parlez-en à votre médecin : il pourra vous orienter vers un centre de référence.`;
  });
}

const share = $('#shareBtn');
if (share) {
  share.addEventListener('click', async () => {
    const data = { title: document.title, url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(location.href); toast('Lien copié'); }
    } catch (e) {}
  });
}
