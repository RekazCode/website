// Rekaz Interactive Script
// Core features: rotating crystal canvas, intersection animations, dynamic projects, modal, contact form validation, theme toggle.

const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const $ = (sel, ctx = document) => ctx.querySelector(sel);

// Rotating abstract crystal using Canvas 2D pseudo-3D
class Crystal {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.t = 0;
    this.points = this.generatePoints();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    requestAnimationFrame(() => this.draw());
  }
  generatePoints() {
    // Icosahedron-like set
    const pts = [];
    const phi = (1 + Math.sqrt(5)) / 2; // golden ratio
    const s = 140;
    const raw = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ];
    for (const p of raw) pts.push({ x: p[0] * s, y: p[1] * s, z: p[2] * s });
    return pts;
  }
  resize() {
  this.canvas.width = this.canvas.clientWidth;
  this.canvas.height = this.canvas.clientHeight;
  }
  project(pt, angleX, angleY) {
    // basic rotation + perspective
    const cosX = Math.cos(angleX), sinX = Math.sin(angleX);
    const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
    let { x, y, z } = pt;
    // rotate Y
    let dx = x * cosY - z * sinY;
    let dz = x * sinY + z * cosY;
    // rotate X
    let dy = y * cosX - dz * sinX;
    dz = y * sinX + dz * cosX;
    const scale = 400 / (400 + dz);
    return {
      x: dx * scale + this.canvas.width / 2,
      y: dy * scale + this.canvas.height / 2,
      depth: dz
    };
  }
  draw() {
    if (document.hidden) { requestAnimationFrame(()=>this.draw()); return; }
    const ctx = this.ctx;
    this.t += 0.0042; // slightly slower for power save
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const angleX = this.t * 0.7;
    const angleY = this.t * 0.9;
    const projected = this.points.map(p => this.project(p, angleX, angleY));

    // draw connecting lines elegantly
    ctx.lineWidth = 1.2;
    for (let i = 0; i < projected.length; i++) {
      for (let j = i + 1; j < projected.length; j++) {
        const a = projected[i], b = projected[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 260) {
          const alpha = 1 - dist / 260;
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, `rgba(123,66,198,${alpha * 0.9})`);
            grad.addColorStop(1, `rgba(255,255,255,${alpha * 0.35})`);
          ctx.strokeStyle = grad;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    // glow center pulse
    const pulse = (Math.sin(this.t * 2) + 1) / 2;
    const r = 140 + pulse * 20;
    const gradient = ctx.createRadialGradient(this.canvas.width/2, this.canvas.height/2, r*0.1, this.canvas.width/2, this.canvas.height/2, r);
    gradient.addColorStop(0, 'rgba(123,66,198,0.16)');
    gradient.addColorStop(1, 'rgba(123,66,198,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

  requestAnimationFrame(() => this.draw());
  }
}

// Intersection Observer for fade-in
function initScrollAnimations() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.25 });
  $$('[data-animate]').forEach(el => io.observe(el));
}

// Dynamic project data
const projects = [
  { id: 'p1', title: 'Cognitive Data Mesh', desc: 'Self-describing data fabric orchestrating AI feature streams across domains.', tags: ['Data', 'AI Fabric', 'Streaming'] },
  { id: 'p2', title: 'Adaptive UI Engine', desc: 'Real-time intent modeling to reshape interface components for task flow.', tags: ['UX', 'NLP', 'Realtime'] },
  { id: 'p3', title: 'Predictive Ops Core', desc: 'Autonomous observability & remediation suggestions using hybrid models.', tags: ['MLOps', 'Observability'] },
  { id: 'p4', title: 'Trust Layer', desc: 'Explainability, drift detection & policy governance across model lifecycle.', tags: ['Governance', 'XAI'] },
  { id: 'p5', title: 'Autonomous Edge Swarm', desc: 'Federated on-device intelligence with latency-aware coordination.', tags: ['Edge', 'Federated'] },
  { id: 'p6', title: 'Knowledge Graph Synthesizer', desc: 'Multi-source embedding alignment & semantic consolidation.', tags: ['Graph', 'NLP'] }
];

function renderProjects() {
  const grid = $('#projectsGrid');
  projects.forEach(p => {
    const el = document.createElement('div');
    el.className = 'project';
    el.tabIndex = 0;
    el.dataset.id = p.id;
    el.innerHTML = `<h3>${p.title}</h3>`;
    el.addEventListener('click', () => openProject(p.id));
    el.addEventListener('keypress', (e) => { if (e.key === 'Enter') openProject(p.id); });
    grid.appendChild(el);
  });
}

function openProject(id) {
  const project = projects.find(p => p.id === id);
  if (!project) return;
  const body = $('#modalBody');
  body.innerHTML = `
    <h3>${project.title}</h3>
    <p>${project.desc}</p>
    <div class="tags">${project.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
  `;
  showModal();
}

function showModal() {
  const modal = $('#projectModal');
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  const modal = $('#projectModal');
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function initModal() {
  $('#projectModal').addEventListener('click', e => {
    if (e.target.matches('[data-close]')) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

function initYear() { $('#year').textContent = new Date().getFullYear(); }

function initContactForm() {
  const form = $('#contactForm');
  const status = $('#formStatus');
  form.addEventListener('submit', e => {
    e.preventDefault();
    status.textContent = '';
    const data = Object.fromEntries(new FormData(form).entries());
    let valid = true;
    ['name','email','message'].forEach(field => {
      const input = form.elements[field];
      const errorEl = form.querySelector(`[data-error-for="${field}"]`);
      const lang = localStorage.getItem('rekaz-lang') || 'en';
      const dict = I18N[lang] || I18N.en;
      if (!input.value.trim()) { errorEl.textContent = dict.required; valid = false; }
      else errorEl.textContent = '';
      if (field === 'email' && input.value) {
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.value)) { errorEl.textContent = dict.invalidEmail; valid = false; }
      }
    });
    const lang = localStorage.getItem('rekaz-lang') || 'en';
    const dict = I18N[lang] || I18N.en;
    if (!valid) { status.textContent = dict.fixFields; return; }
    status.textContent = dict.sending;
    // Simulated async send
    setTimeout(() => {
      status.textContent = dict.sent;
      form.reset();
    }, 900);
  });
}

function initThemeToggle() {
  const btn = $('#themeToggle');
  if (!btn) return;
  // migrate old key if exists
  const old = localStorage.getItem('rikaz-theme');
  if (old && !localStorage.getItem('rekaz-theme')) {
    localStorage.setItem('rekaz-theme', old);
    localStorage.removeItem('rikaz-theme');
  }
  const stored = localStorage.getItem('rekaz-theme');
  // Default theme = dark (no .light class). If stored is light -> add .light class.
  if (stored === 'light') document.documentElement.classList.add('light');
  updateThemeToggleIcon();
  btn.addEventListener('click', () => {
    document.documentElement.classList.toggle('light');
    const isLight = document.documentElement.classList.contains('light');
  localStorage.setItem('rekaz-theme', isLight ? 'light' : 'dark');
    updateThemeToggleIcon();
  });
}

function updateThemeToggleIcon() {
  const btn = $('#themeToggle');
  if (!btn) return;
  const isLight = document.documentElement.classList.contains('light');
  btn.textContent = isLight ? '☾' : '◐';
  btn.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
}

// Mobile navigation
function initNavToggle() {
  const nav = $('#mobileDrawer');
  const toggle = $('#navToggle');
  const backdrop = $('#navBackdrop');
  if (!nav || !toggle) return;
  const links = $$('.drawer-nav a', nav);
  let lastFocused = null;
  let touchStartX = null;
  function open(){
    lastFocused = document.activeElement;
  nav.classList.add('open');
    toggle.setAttribute('aria-expanded','true');
    document.body.classList.add('menu-open');
    backdrop && (backdrop.hidden = false, backdrop.classList.add('show'));
    // focus first link
    setTimeout(()=> { links[0] && links[0].focus(); }, 50);
  }
  function close(){
  nav.classList.remove('open');
    toggle.setAttribute('aria-expanded','false');
    document.body.classList.remove('menu-open');
    backdrop && backdrop.classList.remove('show');
    backdrop && setTimeout(()=> { if (!nav.classList.contains('show')) backdrop.hidden = true; }, 400);
    if (lastFocused) lastFocused.focus();
  }
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    expanded ? close() : open();
  });
  links.forEach(l => l.addEventListener('click', () => close()));
  window.addEventListener('resize', () => { if (window.innerWidth > 860) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  backdrop && backdrop.addEventListener('click', close);

  // Focus trap when menu open
  document.addEventListener('keydown', e => {
  if (nav.classList.contains('open') && e.key === 'Tab') {
      const focusable = [toggle, ...links];
      const index = focusable.indexOf(document.activeElement);
      if (e.shiftKey && (index <= 0)) { focusable[focusable.length -1].focus(); e.preventDefault(); }
      else if (!e.shiftKey && (index === focusable.length -1)) { focusable[0].focus(); e.preventDefault(); }
    }
  });

  // Swipe to close (right-to-left swipe area)
  nav.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, {passive:true});
  nav.addEventListener('touchend', e => {
    if (touchStartX !== null) {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (dx > 80) close();
    }
    touchStartX = null;
  });
}

// Internationalization
const I18N = {
  en: {
    'nav.services': 'Services',
    'nav.showcase': 'Showcase',
    'nav.contact': 'Contact',
    'hero.heading': "Building Tomorrow's Digital Pillars, Today.<br><span class=\"arabic subt\">نبني ركائز الغد الرقمية، اليوم</span>",
    'hero.sub': 'The Intelligent Architecture for AI-driven ecosystems.',
    'hero.cta1': 'Explore Blueprint',
    'hero.cta2': 'Start a Conversation',
    'services.title': 'Our AI-Powered Blueprint',
    'services.sub': 'Modular, scalable, intelligence-infused solutions.',
    'services.cards.strategy.title': 'AI Strategy',
    'services.cards.strategy.body': 'Architecting data & model pipelines that evolve.',
    'services.cards.interfaces.title': 'Intelligent Interfaces',
    'services.cards.interfaces.body': 'Conversational & adaptive UX with real-time insight.',
    'services.cards.secure.title': 'Secure Deployment',
    'services.cards.secure.body': 'Hardened MLOps & governance frameworks.',
    'showcase.title': 'Showcase',
    'showcase.sub': 'Selected architectures & cognitive modules.',
    'contact.title': 'Contact',
    'contact.sub': "Let's design the intelligent core of your platform.",
    'form.name.label': 'Name',
    'form.email.label': 'Email',
    'form.company.label': 'Company',
    'form.message.label': 'Message',
    'form.submit': 'Send Message',
    'footer.copy': `&copy; <span id="year"></span> Rekaz (ركاز). All rights reserved.`,
    required: 'Required', invalidEmail: 'Invalid email', fixFields: 'Please fix highlighted fields.', sent: 'Message sent. We will respond shortly.', sending: 'Sending...'
  },
  ar: {
    'nav.services': 'الخدمات',
    'nav.showcase': 'أعمالنا',
    'nav.contact': 'تواصل',
    'hero.heading': 'نبني ركائز الغد الرقمية، اليوم<br><span class="arabic subt">Building Tomorrow\'s Digital Pillars, Today.</span>',
    'hero.sub': 'الهندسة الذكية لمنظومات مدعومة بالذكاء الاصطناعي.',
    'hero.cta1': 'اكتشف البنية',
    'hero.cta2': 'ابدأ الحوار',
    'services.title': 'مخططنا الذكي',
    'services.sub': 'حلول معيارية قابلة للتوسع مدمجة بالذكاء.',
    'services.cards.strategy.title': 'استراتيجية الذكاء',
    'services.cards.strategy.body': 'تصميم خطوط بيانات ونماذج تتطور باستمرار.',
    'services.cards.interfaces.title': 'واجهات ذكية',
    'services.cards.interfaces.body': 'تجارب محادثة وتكيّف فوري مع السياق.',
    'services.cards.secure.title': 'نشر آمن',
    'services.cards.secure.body': 'حوكمة وعمليات تعلم آلي محصّنة.',
    'showcase.title': 'عرض المشاريع',
    'showcase.sub': 'هندسات مختارة ووحدات معرفية.',
    'contact.title': 'تواصل معنا',
    'contact.sub': 'لنبنِ معًا النواة الذكية لمنصتك.',
    'form.name.label': 'الاسم',
    'form.email.label': 'البريد',
    'form.company.label': 'الشركة',
    'form.message.label': 'رسالتك',
    'form.submit': 'إرسال',
    'footer.copy': `&copy; <span id="year"></span> Rekaz (ركاز). جميع الحقوق محفوظة.`,
    required: 'إلزامي', invalidEmail: 'بريد غير صالح', fixFields: 'صحح الحقول المظللة.', sent: 'تم الإرسال وسيتم الرد قريبًا.', sending: 'جاري الإرسال...'
  }
};

function applyTranslations(lang){
  const dict = I18N[lang] || I18N.en;
  // text nodes
  $$('[data-i18n]').forEach(el => { const key = el.getAttribute('data-i18n'); if (dict[key]) el.textContent = dict[key]; });
  // HTML (allows <br>)
  $$('[data-i18n-html]').forEach(el => { const key = el.getAttribute('data-i18n-html'); if (dict[key]) el.innerHTML = dict[key]; });
  // placeholders
  const placeholders = {
    name: { en:'Your name', ar:'اسمك' },
    email: { en:'you@example.com', ar:'you@example.com' },
    company: { en:'Organization (optional)', ar:'الشركة (اختياري)' },
    message: { en:'Tell us about your vision...', ar:'صف رؤيتك...' }
  };
  Object.entries(placeholders).forEach(([id,map])=>{ const f = document.getElementById(id); if (f) f.placeholder = map[lang] || map.en; });
  document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  // adjust body font-weight for Arabic readability if needed
}

function initLangToggle(){
  const btn = $('#langToggle');
  if(!btn) return;
  const stored = localStorage.getItem('rekaz-lang') || 'en';
  applyTranslations(stored);
  updateLangButton(stored);
  btn.addEventListener('click', () => {
    const current = localStorage.getItem('rekaz-lang') || 'en';
    const next = current === 'en' ? 'ar' : 'en';
    localStorage.setItem('rekaz-lang', next);
    applyTranslations(next);
    updateLangButton(next);
  });
}

function updateLangButton(lang){
  const btn = $('#langToggle');
  if(!btn) return;
  btn.textContent = lang === 'en' ? 'AR' : 'EN';
  btn.setAttribute('data-lang', lang);
  btn.setAttribute('aria-label', lang === 'en' ? 'التبديل إلى العربية' : 'Switch to English');
}

function initCrystal() {
  const canvas = $('#crystalCanvas');
  if (canvas) new Crystal(canvas);
}

// Tag styling injection
(function injectTagStyles(){
  const style = document.createElement('style');
  style.textContent = `.tag{display:inline-block;margin:.4rem .4rem .2rem 0;padding:.35rem .7rem .4rem;font-size:.65rem;letter-spacing:.5px;font-weight:600;text-transform:uppercase;border:1px solid rgba(255,255,255,.25);border-radius:20px;background:rgba(255,255,255,.06);backdrop-filter:blur(12px)}.tags{margin-top:1rem}`;
  document.head.appendChild(style);
})();

// Init
window.addEventListener('DOMContentLoaded', () => {
  // critical
  initCrystal();
  initThemeToggle();
  initNavToggle();
  initYear();
  initLangToggle();
  // defer non-critical to idle to improve first paint
  (window.requestIdleCallback || function(cb){setTimeout(cb,50);})(() => {
    initScrollAnimations();
    renderProjects();
    initModal();
    initContactForm();
  });
});

// Throttle resize for crystal
let resizeTO;
window.addEventListener('resize', () => {
  clearTimeout(resizeTO);
  resizeTO = setTimeout(()=>{
    const canvas = $('#crystalCanvas');
    if (canvas) { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; }
  }, 160);
}, {passive:true});
