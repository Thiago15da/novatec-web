// Solicitud de propuestas B2B — sin cotizaciones automáticas engañosas.
const PROJECT_TYPES = {
  landing:   { label: 'Landing / presentación', web: true },
  corporate: { label: 'Sitio web corporativo', web: true },
  ecommerce: { label: 'Tienda online', web: false },
  webapp:    { label: 'Plataforma web', web: false },
  mobile:    { label: 'Aplicación móvil', web: false },
  custom:    { label: 'Sistema de gestión / CRM / ERP', web: false }
};
const FEATURES = [
  ['portfolio', 'Portafolio de trabajos'], ['contact', 'Contacto y WhatsApp'],
  ['admin', 'Panel de administración'], ['payments', 'Pagos online'],
  ['integrations', 'Integraciones'], ['seo', 'Posicionamiento en Google']
];
const TIMELINES = [
  ['pronto', 'Quiero comenzar pronto'],
  ['uno-tres-meses', 'En 1 a 3 meses'],
  ['explorando', 'Estoy evaluando opciones']
];
let quoteState = { step: 1, type: null, timeline: 'explorando', features: [] };
// When visitors arrive from a sector page, start with the relevant service selected.
const requestParams = new URLSearchParams(window.location.search);
if (requestParams.get('servicio') === 'web') quoteState.type = 'corporate';
const requestSector = requestParams.get('sector') === 'construccion' ? 'Construcción y arquitectura' : '';
const byId = id => document.getElementById(id);

function renderStep1() {
  byId('quoter-body').innerHTML = `
    <p class="text-[12px] text-[#888] mb-5">¿Qué necesita tu empresa?</p>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
      ${Object.entries(PROJECT_TYPES).map(([key, value]) => `
        <label class="opt">
          <input type="radio" name="sw-type" value="${key}" ${quoteState.type === key ? 'checked' : ''} onchange="setSWType('${key}')">
          <span class="opt-label text-[12px] font-medium text-center">${value.label}</span>
        </label>`).join('')}
    </div>
    <p class="text-[11px] text-[#555] leading-relaxed mt-5">Si todavía no definiste todos los detalles, te ayudamos a delimitar el alcance.</p>`;
}
function renderStep2() {
  byId('quoter-body').innerHTML = `
    <p class="text-[12px] text-[#888] mb-4">¿Cuándo te gustaría comenzar?</p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-6">
      ${TIMELINES.map(([key, value]) => `
        <label class="opt">
          <input type="radio" name="timeline" value="${key}" ${quoteState.timeline === key ? 'checked' : ''} onchange="setTimeline('${key}')">
          <span class="opt-label text-[12px] text-center">${value}</span>
        </label>`).join('')}
    </div>
    <p class="text-[12px] text-[#888] mb-3">¿Qué funciones te interesan? <span class="text-[#555]">(opcional)</span></p>
    <div class="grid grid-cols-2 gap-2">
      ${FEATURES.map(([key, value]) => `
        <label class="opt">
          <input type="checkbox" value="${key}" ${quoteState.features.includes(key) ? 'checked' : ''} onchange="toggleFeature('${key}')">
          <span class="opt-label text-[12px]">${value}</span>
        </label>`).join('')}
    </div>`;
}
function renderStep3() {
  const project = PROJECT_TYPES[quoteState.type];
  const timeline = TIMELINES.find(([key]) => key === quoteState.timeline)?.[1] || 'A definir';
  const note = project.web
    ? 'Proyectos web de entrada desde G. 1.250.000, según alcance. La propuesta final se confirma luego de conocer tus necesidades.'
    : 'Los sistemas, plataformas y proyectos especiales se presupuestan según sus funciones y alcance.';
  byId('quoter-body').innerHTML = `
    <div class="estimate-box mb-5">
      <p class="text-[10px] uppercase tracking-[0.15em] text-[#666] mb-2">Tu solicitud</p>
      <p class="text-[19px] font-semibold tracking-tight">${project.label}</p>
      <p class="text-[12px] text-[#888] mt-2">${timeline}</p>
      <p class="text-[12px] text-[#bbb] leading-relaxed mt-4">${note}</p>
    </div>
    <form id="quoter-form" action="https://formspree.io/f/xeeqrdlp" method="POST" class="space-y-3">
      <input type="hidden" name="proyecto_tipo" value="${project.label}">
      ${requestSector ? `<input type="hidden" name="sector_de_consulta" value="${requestSector}">` : ''}
      <input type="hidden" name="proyecto_plazo" value="${timeline}">
      <input type="hidden" name="proyecto_funciones" value="${quoteState.features.map(f => FEATURES.find(([key]) => key === f)?.[1]).filter(Boolean).join(', ') || 'Por definir'}">
      <div class="grid md:grid-cols-2 gap-3">
        <div><label class="sr-only" for="lead-name">Nombre y apellido</label><input id="lead-name" type="text" name="nombre" required autocomplete="name" placeholder="Nombre y apellido *" class="field"></div>
        <div><label class="sr-only" for="lead-phone">WhatsApp</label><input id="lead-phone" type="tel" name="whatsapp" required autocomplete="tel" placeholder="WhatsApp *" class="field"></div>
      </div>
      <label class="sr-only" for="lead-company">Empresa o emprendimiento</label>
      <input id="lead-company" type="text" name="empresa" required autocomplete="organization" placeholder="Empresa o emprendimiento *" class="field">
      <label class="sr-only" for="lead-budget">Presupuesto estimado</label>
      <select id="lead-budget" name="presupuesto_previsto" class="field">
        <option value="">Presupuesto estimado (opcional)</option>
        <option value="Hasta G. 2.350.000">Hasta G. 2.350.000</option>
        <option value="G. 2.350.001 a G. 5.000.000">G. 2.350.001 a G. 5.000.000</option>
        <option value="Más de G. 5.000.000">Más de G. 5.000.000</option>
        <option value="Necesito orientación">Necesito orientación</option>
      </select>
      <label class="sr-only" for="lead-description">Qué necesitás resolver</label>
      <textarea id="lead-description" name="necesidad" rows="3" required placeholder="Contanos qué necesitás resolver *" class="field resize-none"></textarea>
      <label class="sr-only" for="lead-discovery">Cómo nos conociste</label>
      <select id="lead-discovery" name="origen_declarado" class="field">
        <option value="">¿Cómo conociste NovaTec? (opcional)</option>
        <option>Google</option><option>Instagram</option><option>TikTok</option>
        <option>Recomendación</option><option>Contacto directo de NovaTec</option><option>Otro</option>
      </select>
      <p class="text-[11px] text-[#666] leading-relaxed">Usaremos estos datos para responder a tu solicitud. El envío se procesa mediante Formspree.</p>
      <button type="submit" id="quoter-submit" class="w-full bg-white text-black text-[13px] font-semibold py-3 rounded-full hover:bg-white/90 transition-colors">Solicitar propuesta personalizada →</button>
      <p id="quoter-status" role="status" aria-live="polite" class="text-[12px] text-center hidden"></p>
    </form>`;
  const form = byId('quoter-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = byId('quoter-submit');
    const status = byId('quoter-status');
    button.disabled = true;
    button.textContent = 'Enviando solicitud…';
    if (typeof window.NovaTecLeadAttribution === 'function') window.NovaTecLeadAttribution(form);
    try {
      const response = await fetch(form.action, {method: 'POST', body: new FormData(form), headers: {Accept: 'application/json'}});
      if (!response.ok) throw new Error('Formspree submission failed');
      status.textContent = 'Recibimos tu solicitud. Nos comunicaremos por WhatsApp.';
      status.className = 'text-center text-[12px] text-green-300 mt-2';
      form.reset();
      button.textContent = 'Solicitud enviada';
    } catch {
      status.textContent = 'No pudimos enviar la solicitud. Escribinos por WhatsApp al +595 992 056 945.';
      status.className = 'text-center text-[12px] text-red-400 mt-2';
      button.disabled = false;
      button.textContent = 'Reintentar envío';
    }
  });
}
function setSWType(type) {
  if (Object.prototype.hasOwnProperty.call(PROJECT_TYPES, type)) quoteState.type = type;
}
function setTimeline(timeline) {
  if (TIMELINES.some(([key]) => key === timeline)) quoteState.timeline = timeline;
}
function toggleFeature(feature) {
  const index = quoteState.features.indexOf(feature);
  if (index === -1) quoteState.features.push(feature);
  else quoteState.features.splice(index, 1);
}
function nextStep() {
  if (quoteState.step === 1 && !quoteState.type) {
    alert('Elegí un tipo de proyecto para continuar.');
    return;
  }
  if (quoteState.step >= 3) return;
  quoteState.step++;
  updateUI();
}
function prevStep() {
  if (quoteState.step > 1) {quoteState.step--; updateUI();}
}
function resetQuoter() {
  quoteState = {step: 1, type: null, timeline: 'explorando', features: []};
  updateUI();
}
function updateUI() {
  [1, 2, 3].forEach(n => {
    const dot = byId('step-' + n);
    const line = byId('line-' + n);
    if (dot) {
      dot.className = 's-dot';
      if (n < quoteState.step) dot.classList.add('done');
      if (n === quoteState.step) dot.classList.add('active');
    }
    if (line) line.className = 's-line' + (n < quoteState.step ? ' done' : '');
  });
  if (quoteState.step === 1) renderStep1();
  else if (quoteState.step === 2) renderStep2();
  else if (quoteState.step === 3) renderStep3();
  const previous = byId('btn-prev');
  const next = byId('btn-next');
  if (previous) previous.classList.toggle('invisible', quoteState.step === 1);
  if (next) {
    next.classList.toggle('hidden', quoteState.step === 3);
    next.textContent = quoteState.step === 2 ? 'Completar solicitud →' : 'Siguiente →';
  }
}
document.addEventListener('DOMContentLoaded', () => {
  if (byId('quoter-body')) updateUI();
});
