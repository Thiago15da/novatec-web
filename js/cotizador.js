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
    <div class="text-center mb-8">
      <h3 class="text-2xl font-bold mb-2">¿Qué tipo de solución necesitás?</h3>
      <p class="text-gray-400 text-sm">Seleccioná el área para personalizar tu cotización</p>
    </div>
    <div class="grid md:grid-cols-2 gap-5">
      <button onclick="selectService('software')"
        class="bg-card border border-white/10 rounded-2xl p-7 text-left hover:border-primary/50 transition-all group cursor-pointer">
        <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
          <i class="fas fa-code text-primary text-xl"></i>
        </div>
        <h4 class="text-lg font-bold mb-2">Software & Desarrollo</h4>
        <p class="text-gray-400 text-sm">Sitios web, apps, sistemas a medida y consultoría digital.</p>
        <span class="mt-4 inline-flex items-center gap-1 text-primary text-sm font-semibold">Seleccionar <i class="fas fa-arrow-right text-xs"></i></span>
      </button>
      <button onclick="selectService('hardware')"
        class="bg-card border border-white/10 rounded-2xl p-7 text-left hover:border-secondary/50 transition-all group cursor-pointer">
        <div class="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
          <i class="fas fa-server text-secondary text-xl"></i>
        </div>
        <h4 class="text-lg font-bold mb-2">Provisión de Hardware</h4>
        <p class="text-gray-400 text-sm">Laptops, servidores, networking y más a precio mayorista.</p>
        <span class="mt-4 inline-flex items-center gap-1 text-secondary text-sm font-semibold">Seleccionar <i class="fas fa-arrow-right text-xs"></i></span>
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
    <div class="mb-8">
      <h3 class="text-2xl font-bold mb-2">Configurá tu proyecto</h3>
      <p class="text-gray-400 text-sm">Completá los detalles para obtener un estimado preciso</p>
    </div>

    <div class="mb-7">
      <label class="block text-sm font-semibold text-gray-300 mb-3">Tipo de proyecto</label>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        ${types.map(([key, val]) => `
          <label class="option-card">
            <input type="radio" name="sw-type" value="${key}" ${state.type === key ? 'checked' : ''} onchange="setSWType('${key}')">
            <span class="option-label text-sm font-medium text-center block py-3 px-2">${val.label}</span>
          </label>`).join('')}
      </div>
    </div>

    <div class="mb-7">
      <label class="block text-sm font-semibold text-gray-300 mb-3">Nivel de complejidad</label>
      <div class="grid grid-cols-3 gap-3">
        ${[['basic','Básico','Funcional y directo'],['standard','Estándar','Balanceado y profesional'],['premium','Premium','Completo y personalizado']].map(([k,t,d]) => `
          <label class="option-card">
            <input type="radio" name="complexity" value="${k}" ${state.complexity === k ? 'checked' : ''} onchange="state.complexity='${k}'">
            <span class="option-label text-center">
              <span class="block font-bold text-sm mb-1">${t}</span>
              <span class="block text-xs text-gray-400">${d}</span>
            </span>
          </label>`).join('')}
      </div>
    </div>

    <div class="mb-7">
      <label class="block text-sm font-semibold text-gray-300 mb-3">Funcionalidades adicionales <span class="text-gray-500 font-normal">(opcional)</span></label>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        ${[['cms','Panel CMS'],['blog','Blog'],['payments','Pagos online'],['auth','Login / Usuarios'],['analytics','Analíticas'],['multilang','Multiidioma']].map(([k,t]) => `
          <label class="option-card">
            <input type="checkbox" value="${k}" ${state.features.includes(k) ? 'checked' : ''} onchange="toggleFeature('${k}')">
            <span class="option-label flex items-center gap-2 text-sm">
              <i class="fas fa-check text-primary text-xs opacity-0 check-icon"></i>${t}
            </span>
          </label>`).join('')}
      </div>
    </div>`;
}

function renderStep2Hardware() {
  el('quoter-body').innerHTML = `
    <div class="mb-8">
      <h3 class="text-2xl font-bold mb-2">Configurá tu pedido</h3>
      <p class="text-gray-400 text-sm">Seleccioná los productos que necesitás</p>
    </div>

    <div class="mb-7">
      <label class="block text-sm font-semibold text-gray-300 mb-3">Categorías de productos</label>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        ${Object.entries(PRICING.hardware).map(([k, v]) => `
          <label class="option-card">
            <input type="checkbox" value="${k}" ${state.categories.includes(k) ? 'checked' : ''} onchange="toggleCategory('${k}')">
            <span class="option-label text-sm font-medium">${v.label}</span>
          </label>`).join('')}
      </div>
    </div>

    <div class="mb-7">
      <label class="block text-sm font-semibold text-gray-300 mb-3">
        Cantidad aproximada <span class="text-primary font-bold" id="qty-display">${state.quantity} unidades</span>
      </label>
      <input type="range" min="1" max="100" value="${state.quantity}" step="1"
        class="w-full accent-primary cursor-pointer"
        oninput="setQuantity(this.value)">
      <div class="flex justify-between text-xs text-gray-500 mt-1"><span>1</span><span>25</span><span>50</span><span>100</span></div>
    </div>`;
}

function renderStep3() {
  const estimate = calcEstimate();
  const timeline = state.service === 'software' ? PRICING.timelines[state.type] : (state.quantity > 20 ? '5–10 días hábiles' : '2–5 días hábiles');
  const hasEstimate = estimate !== null;

  el('quoter-body').innerHTML = `
    <div class="mb-6">
      <h3 class="text-2xl font-bold mb-2">Tu estimado</h3>
      <p class="text-gray-400 text-sm">Completá tus datos y enviamos la cotización formal</p>
    </div>

    ${hasEstimate ? `
    <div class="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-7">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Rango estimado</p>
          <p class="text-3xl font-black text-primary">${fmt(estimate[0])} – ${fmt(estimate[1])} <span class="text-base font-normal text-gray-400">USD</span></p>
        </div>
        <div class="text-right">
          <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Plazo estimado</p>
          <p class="text-lg font-bold">${timeline}</p>
        </div>
      </div>
      <p class="text-xs text-gray-500 mt-4">* Estimado orientativo. La cotización final puede variar según requerimientos específicos.</p>
    </div>` : `
    <div class="bg-white/5 border border-white/10 rounded-2xl p-6 mb-7 text-center">
      <p class="text-gray-400 text-sm">Completá tus datos y te enviamos una cotización personalizada.</p>
    </div>`}

    <form id="quoter-form" action="https://formspree.io/f/xeeqrdlp" method="POST" class="space-y-4">
      <input type="hidden" name="cotizador_servicio" value="${state.service === 'software' ? 'Software: ' + (PRICING.software[state.type]?.label || '') : 'Hardware: ' + state.categories.join(', ')}">
      <input type="hidden" name="cotizador_estimado" value="${hasEstimate ? fmt(estimate[0]) + ' – ' + fmt(estimate[1]) + ' USD' : 'A confirmar'}">
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Nombre *</label>
          <input type="text" name="nombre" required placeholder="Tu nombre" class="form-input">
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">WhatsApp *</label>
          <input type="tel" name="whatsapp" required placeholder="Ej: 0992 000 000" class="form-input">
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Empresa <span class="text-gray-600 normal-case">(opcional)</span></label>
        <input type="text" name="empresa" placeholder="Nombre de tu empresa" class="form-input">
      </div>
      <div>
        <label class="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Detalles adicionales</label>
        <textarea name="mensaje" rows="3" placeholder="Contanos más sobre tu proyecto..." class="form-input resize-none"></textarea>
      </div>
      <button type="submit" id="quoter-submit"
        class="w-full bg-primary text-dark font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity glow-btn text-base">
        Solicitar Cotización Formal
      </button>
      <p id="quoter-status" class="text-center text-sm hidden"></p>
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
        status.textContent = '¡Cotización enviada! Te contactamos a la brevedad.';
        status.className = 'text-center text-sm text-primary font-semibold mt-2';
        status.classList.remove('hidden');
        e.target.reset();
      } else throw new Error();
    } catch {
      status.textContent = 'Error. Escribinos por WhatsApp.';
      status.className = 'text-center text-sm text-red-400 mt-2';
      status.classList.remove('hidden');
      btn.disabled = false;
      btn.textContent = 'Solicitar Cotización Formal';
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
    nextBtn.textContent = state.step === 2 ? 'Ver Estimado →' : 'Siguiente →';
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('quoter-body')) updateUI();
});
