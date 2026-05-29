// Pricing reference data (USD) — Software only
const PRICING = {
  types: {
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
};

// State
let state = {
  step: 1,
  type: null,
  complexity: 'standard',
  features: [],
};

// Helpers
const fmt = n => '$' + Math.round(n).toLocaleString('en-US');
const el = id => document.getElementById(id);

function calcEstimate() {
  if (!state.type) return null;
  const base = PRICING.types[state.type].base;
  const mult = PRICING.complexity[state.complexity];
  const feat = state.features.reduce((s, f) => s + (PRICING.features[f] || 0), 0);
  return [
    Math.round(base[0] * mult * (1 + feat)),
    Math.round(base[1] * mult * (1 + feat)),
  ];
}

// Step rendering
function renderStep1() {
  const types = Object.entries(PRICING.types);
  el('quoter-body').innerHTML = `
    <p class="text-[12px] text-[#444] mb-5">¿Qué tipo de proyecto de software necesitás?</p>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
      ${types.map(([key, val]) => `
        <label class="opt">
          <input type="radio" name="sw-type" value="${key}" ${state.type === key ? 'checked' : ''} onchange="setSWType('${key}')">
          <span class="opt-label text-[12px] font-medium text-center">${val.label}</span>
        </label>`).join('')}
    </div>`;
}

function renderStep2() {
  el('quoter-body').innerHTML = `
    <p class="text-[12px] text-[#444] mb-5">Definí la complejidad y los extras</p>

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

function renderStep3() {
  const estimate = calcEstimate();
  const timeline = PRICING.timelines[state.type];
  const typeLabel = state.type ? PRICING.types[state.type].label : '';

  el('quoter-body').innerHTML = `
    ${estimate ? `
    <div class="estimate-box mb-5">
      <p class="text-[10px] font-medium uppercase tracking-[0.15em] text-[#444] mb-2">Estimado orientativo</p>
      <p class="text-[28px] font-black tracking-tight leading-none mb-1">${fmt(estimate[0])} – ${fmt(estimate[1])} <span class="text-[14px] font-normal text-[#555]">USD</span></p>
      <p class="text-[12px] text-[#444]">Plazo estimado: ${timeline}</p>
      <p class="text-[11px] text-[#333] mt-3">Estimado orientativo. El precio final depende del alcance detallado.</p>
    </div>` : `
    <div class="estimate-box mb-5 text-center py-5">
      <p class="text-[13px] text-[#444]">Completá tus datos y te enviamos una cotización personalizada.</p>
    </div>`}

    <form id="quoter-form" action="https://formspree.io/f/xeeqrdlp" method="POST" class="space-y-3">
      <input type="hidden" name="cotizador_tipo" value="${typeLabel}">
      <input type="hidden" name="cotizador_complejidad" value="${state.complexity}">
      <input type="hidden" name="cotizador_extras" value="${state.features.join(', ') || 'Ninguno'}">
      <input type="hidden" name="cotizador_estimado" value="${estimate ? fmt(estimate[0]) + ' – ' + fmt(estimate[1]) + ' USD' : 'A confirmar'}">
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
function setSWType(type) { state.type = type; }
function toggleFeature(f) {
  const i = state.features.indexOf(f);
  if (i > -1) state.features.splice(i, 1); else state.features.push(f);
}

// Navigation
function nextStep() {
  if (state.step === 1 && !state.type) {
    alert('Por favor, seleccioná el tipo de proyecto.');
    return;
  }
  state.step++;
  updateUI();
}
function prevStep() {
  if (state.step > 1) { state.step--; updateUI(); }
}
function resetQuoter() {
  state = { step: 1, type: null, complexity: 'standard', features: [] };
  updateUI();
}

function updateUI() {
  [1, 2, 3].forEach(n => {
    const dot = document.getElementById('step-' + n);
    if (!dot) return;
    dot.className = 'step-dot';
    if (n < state.step) dot.classList.add('done');
    else if (n === state.step) dot.classList.add('active');
    const line = document.getElementById('line-' + n);
    if (line) line.className = 'step-line' + (n < state.step ? ' done' : '');
  });

  if (state.step === 1) renderStep1();
  else if (state.step === 2) renderStep2();
  else if (state.step === 3) renderStep3();

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
