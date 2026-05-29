// Pricing reference data (USD)
const PRICING = {
  software: {
    landing:   { label: 'Landing Page',        base: [300,  600] },
    corporate: { label: 'Sitio Corporativo',   base: [700,  1400] },
    ecommerce: { label: 'E-commerce',           base: [1200, 2800] },
    webapp:    { label: 'Aplicación Web',       base: [2500, 6000] },
    mobile:    { label: 'App Móvil',            base: [3500, 8000] },
    custom:    { label: 'Sistema a Medida',     base: [4000, 12000] },
  },
  complexity: { basic: 1.0, standard: 1.5, premium: 2.2 },
  features: {
    cms: 0.10, blog: 0.08, payments: 0.20,
    auth: 0.15, analytics: 0.05, multilang: 0.12,
  },
  timelines: {
    landing: '1–2 semanas', corporate: '3–5 semanas',
    ecommerce: '4–7 semanas', webapp: '8–14 semanas',
    mobile: '10–18 semanas', custom: '10–24 semanas',
  },
  hardware: {
    laptops:     { label: 'Laptops',                unit: [400, 1800] },
    desktops:    { label: 'PCs de Escritorio',      unit: [300, 1500] },
    servers:     { label: 'Servidores',             unit: [1200, 15000] },
    networking:  { label: 'Equipos de Networking',  unit: [150, 5000] },
    storage:     { label: 'Almacenamiento NAS/SAN', unit: [400, 8000] },
    monitors:    { label: 'Monitores',              unit: [150, 900] },
    peripherals: { label: 'Periféricos',            unit: [50, 400] },
  },
};

// State
let state = {
  step: 1,
  service: null,
  type: null,
  complexity: 'standard',
  features: [],
  categories: [],
  quantity: 5,
};

// Helpers
const fmt = n => '$' + Math.round(n).toLocaleString('en-US');
const el = id => document.getElementById(id);

function calcEstimate() {
  if (state.service === 'software' && state.type) {
    const base = PRICING.software[state.type].base;
    const mult = PRICING.complexity[state.complexity];
    const feat = state.features.reduce((s, f) => s + (PRICING.features[f] || 0), 0);
    return [
      Math.round(base[0] * mult * (1 + feat)),
      Math.round(base[1] * mult * (1 + feat)),
    ];
  }
  if (state.service === 'hardware' && state.categories.length > 0) {
    let lo = 0, hi = 0;
    state.categories.forEach(c => {
      lo += PRICING.hardware[c].unit[0] * state.quantity;
      hi += PRICING.hardware[c].unit[1] * state.quantity;
    });
    return [lo, hi];
  }
  return null;
}

// Step rendering
function renderStep1() {
  el('quoter-body').innerHTML = `
    <p class="text-[12px] text-[#444] mb-5">¿Qué tipo de solución necesitás?</p>
    <div class="grid md:grid-cols-2 gap-3">
      <button onclick="selectService('software')"
        class="border border-white/[0.08] bg-[#111] rounded-xl p-5 text-left hover:border-white/[0.2] transition-all cursor-pointer group">
        <div class="w-7 h-7 border border-white/[0.08] rounded-lg flex items-center justify-center mb-4">
          <i class="fas fa-terminal text-[#555] text-[11px]"></i>
        </div>
        <p class="text-[14px] font-semibold mb-1.5">Software & Desarrollo</p>
        <p class="text-[#555] text-[12px] leading-[1.5]">Sitios web, apps, sistemas a medida.</p>
        <span class="mt-4 inline-flex items-center gap-1 text-[12px] text-[#555] group-hover:text-white transition-colors">Seleccionar →</span>
      </button>
      <button onclick="selectService('hardware')"
        class="border border-white/[0.08] bg-[#111] rounded-xl p-5 text-left hover:border-white/[0.2] transition-all cursor-pointer group">
        <div class="w-7 h-7 border border-white/[0.08] rounded-lg flex items-center justify-center mb-4">
          <i class="fas fa-server text-[#555] text-[11px]"></i>
        </div>
        <p class="text-[14px] font-semibold mb-1.5">Provisión de Hardware</p>
        <p class="text-[#555] text-[12px] leading-[1.5]">Laptops, servidores, networking a precio mayorista.</p>
        <span class="mt-4 inline-flex items-center gap-1 text-[12px] text-[#555] group-hover:text-white transition-colors">Seleccionar →</span>
      </button>
    </div>`;
}

function renderStep2() {
  if (state.service === 'software') {
    renderStep2Software();
  } else {
    renderStep2Hardware();
  }
}

function renderStep2Software() {
  const types = Object.entries(PRICING.software);
  el('quoter-body').innerHTML = `
    <p class="text-[12px] text-[#444] mb-5">Configurá tu proyecto de software</p>

    <div class="mb-6">
      <p class="text-[12px] font-medium text-[#888] mb-3">Tipo de proyecto</p>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
        ${types.map(([key, val]) => `
          <label class="opt">
            <input type="radio" name="sw-type" value="${key}" ${state.type === key ? 'checked' : ''} onchange="setSWType('${key}')">
            <span class="opt-label text-[12px] font-medium text-center">${val.label}</span>
          </label>`).join('')}
      </div>
    </div>

    <div class="mb-6">
      <p class="text-[12px] font-medium text-[#888] mb-3">Complejidad</p>
      <div class="grid grid-cols-3 gap-2">
        ${[['basic','Básico'],['standard','Estándar'],['premium','Premium']].map(([k,t]) => `
          <label class="opt">
            <input type="radio" name="complexity" value="${k}" ${state.complexity === k ? 'checked' : ''} onchange="state.complexity='${k}'">
            <span class="opt-label text-[12px] font-medium text-center">${t}</span>
          </label>`).join('')}
      </div>
    </div>

    <div class="mb-2">
      <p class="text-[12px] font-medium text-[#888] mb-3">Extras <span class="text-[#333] font-normal">(opcional)</span></p>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
        ${[['cms','Panel CMS'],['blog','Blog'],['payments','Pagos online'],['auth','Login / Usuarios'],['analytics','Analíticas'],['multilang','Multiidioma']].map(([k,t]) => `
          <label class="opt">
            <input type="checkbox" value="${k}" ${state.features.includes(k) ? 'checked' : ''} onchange="toggleFeature('${k}')">
            <span class="opt-label text-[12px]">${t}</span>
          </label>`).join('')}
      </div>
    </div>`;
}

function renderStep2Hardware() {
  el('quoter-body').innerHTML = `
    <p class="text-[12px] text-[#444] mb-5">Configurá tu pedido de hardware</p>

    <div class="mb-6">
      <p class="text-[12px] font-medium text-[#888] mb-3">Categorías</p>
      <div class="grid grid-cols-2 gap-2">
        ${Object.entries(PRICING.hardware).map(([k, v]) => `
          <label class="opt">
            <input type="checkbox" value="${k}" ${state.categories.includes(k) ? 'checked' : ''} onchange="toggleCategory('${k}')">
            <span class="opt-label text-[12px]">${v.label}</span>
          </label>`).join('')}
      </div>
    </div>

    <div class="mb-2">
      <p class="text-[12px] font-medium text-[#888] mb-3">
        Cantidad aproximada — <span id="qty-display" class="text-white">${state.quantity} unidades</span>
      </p>
      <input type="range" min="1" max="100" value="${state.quantity}" step="1"
        class="w-full cursor-pointer mb-1"
        oninput="setQuantity(this.value)">
      <div class="flex justify-between text-[10px] text-[#333]"><span>1</span><span>25</span><span>50</span><span>100</span></div>
    </div>`;
}

function renderStep3() {
  const estimate = calcEstimate();
  const timeline = state.service === 'software' ? PRICING.timelines[state.type] : (state.quantity > 20 ? '5–10 días hábiles' : '2–5 días hábiles');
  const hasEstimate = estimate !== null;

  el('quoter-body').innerHTML = `
    ${hasEstimate ? `
    <div class="estimate-box mb-5">
      <p class="text-[10px] font-medium uppercase tracking-[0.15em] text-[#444] mb-2">Estimado orientativo</p>
      <p class="text-[28px] font-black tracking-tight leading-none mb-1">${fmt(estimate[0])} – ${fmt(estimate[1])} <span class="text-[14px] font-normal text-[#555]">USD</span></p>
      <p class="text-[12px] text-[#444]">Plazo: ${timeline}</p>
      <p class="text-[11px] text-[#333] mt-3">Estimado orientativo. El precio final depende del alcance detallado.</p>
    </div>` : `
    <div class="estimate-box mb-5 text-center py-5">
      <p class="text-[13px] text-[#444]">Completá tus datos y te enviamos una cotización personalizada.</p>
    </div>`}

    <form id="quoter-form" action="https://formspree.io/f/xeeqrdlp" method="POST" class="space-y-3">
      <input type="hidden" name="cotizador_servicio" value="${state.service === 'software' ? 'Software: ' + (PRICING.software[state.type]?.label || '') : 'Hardware: ' + state.categories.join(', ')}">
      <input type="hidden" name="cotizador_estimado" value="${hasEstimate ? fmt(estimate[0]) + ' – ' + fmt(estimate[1]) + ' USD' : 'A confirmar'}">
      <div class="grid md:grid-cols-2 gap-3">
        <input type="text" name="nombre" required placeholder="Nombre *" class="field">
        <input type="tel" name="whatsapp" required placeholder="WhatsApp *" class="field">
      </div>
      <input type="text" name="empresa" placeholder="Empresa (opcional)" class="field">
      <textarea name="mensaje" rows="3" placeholder="Detalles adicionales..." class="field resize-none"></textarea>
      <button type="submit" id="quoter-submit"
        class="w-full bg-white text-black text-[13px] font-semibold py-3 rounded-full hover:bg-white/90 transition-colors">
        Solicitar cotización formal
      </button>
      <p id="quoter-status" class="text-[12px] text-center hidden"></p>
    </form>`;

  // Bind form submit
  document.getElementById('quoter-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('quoter-submit');
    const status = document.getElementById('quoter-status');
    btn.disabled = true;
    btn.textContent = 'Enviando...';
    try {
      const res = await fetch(e.target.action, {
        method: 'POST', body: new FormData(e.target), headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        status.textContent = 'Cotización enviada. Te contactamos a la brevedad.';
        status.className = 'text-center text-[12px] text-white/60 mt-1';
        status.classList.remove('hidden');
        e.target.reset();
      } else throw new Error();
    } catch {
      status.textContent = 'Error al enviar. Escribinos por WhatsApp.';
      status.className = 'text-center text-[12px] text-red-400 mt-1';
      status.classList.remove('hidden');
      btn.disabled = false;
      btn.textContent = 'Solicitar cotización formal';
    }
  });
}

// State mutators
function selectService(service) {
  state.service = service;
  state.step = 2;
  updateUI();
}
function setSWType(type) { state.type = type; }
function toggleFeature(f) {
  const i = state.features.indexOf(f);
  if (i > -1) state.features.splice(i, 1); else state.features.push(f);
}
function toggleCategory(c) {
  const i = state.categories.indexOf(c);
  if (i > -1) state.categories.splice(i, 1); else state.categories.push(c);
}
function setQuantity(v) {
  state.quantity = parseInt(v);
  const d = document.getElementById('qty-display');
  if (d) d.textContent = state.quantity + ' unidades';
}

// Navigation
function nextStep() {
  if (state.step === 1 && !state.service) return;
  if (state.step === 2 && state.service === 'software' && !state.type) {
    alert('Por favor, seleccioná el tipo de proyecto.');
    return;
  }
  if (state.step === 2 && state.service === 'hardware' && state.categories.length === 0) {
    alert('Por favor, seleccioná al menos una categoría de producto.');
    return;
  }
  state.step++;
  updateUI();
}
function prevStep() {
  if (state.step > 1) { state.step--; updateUI(); }
}
function resetQuoter() {
  state = { step: 1, service: null, type: null, complexity: 'standard', features: [], categories: [], quantity: 5 };
  updateUI();
}

function updateUI() {
  // Steps
  [1, 2, 3].forEach(n => {
    const dot = document.getElementById('step-' + n);
    if (!dot) return;
    dot.className = 'step-dot';
    if (n < state.step) dot.classList.add('done');
    else if (n === state.step) dot.classList.add('active');
    const line = document.getElementById('line-' + n);
    if (line) line.className = 'step-line' + (n < state.step ? ' done' : '');
  });

  // Body
  if (state.step === 1) renderStep1();
  else if (state.step === 2) renderStep2();
  else if (state.step === 3) renderStep3();

  // Nav buttons
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');
  if (prevBtn) prevBtn.classList.toggle('invisible', state.step === 1);
  if (nextBtn) {
    nextBtn.classList.toggle('hidden', state.step === 3);
    nextBtn.textContent = state.step === 2 ? 'Ver estimado →' : 'Siguiente →';
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('quoter-body')) updateUI();
});
