// Rikaz Interactive Script
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
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
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
    const ctx = this.ctx;
    this.t += 0.0045;
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
      if (!input.value.trim()) { errorEl.textContent = 'Required'; valid = false; }
      else errorEl.textContent = '';
      if (field === 'email' && input.value) {
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.value)) { errorEl.textContent = 'Invalid email'; valid = false; }
      }
    });
    if (!valid) { status.textContent = 'Please fix highlighted fields.'; return; }
    status.textContent = 'Sending...';
    // Simulated async send
    setTimeout(() => {
      status.textContent = 'Message sent. We will respond shortly.';
      form.reset();
    }, 900);
  });
}

function initThemeToggle() {
  const btn = $('#themeToggle');
  const stored = localStorage.getItem('rikaz-theme');
  if (stored === 'dark') document.documentElement.classList.add('dark');
  btn.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('rikaz-theme', isDark ? 'dark' : 'light');
  });
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
  initCrystal();
  initScrollAnimations();
  renderProjects();
  initModal();
  initContactForm();
  initYear();
  initThemeToggle();
});
