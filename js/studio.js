const navToggle = document.querySelector('#nav-toggle');
const mobileNav = document.querySelector('#nav-mobile');

function setMenu(open) {
  mobileNav.hidden = !open;
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  navToggle.textContent = open ? '×' : '☰';
}

document.documentElement.classList.add('has-nav');
setMenu(false);
navToggle.hidden = false;
navToggle.addEventListener('click', () => setMenu(mobileNav.hidden));
mobileNav.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    setMenu(false);
    navToggle.focus();
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !mobileNav.hidden) {
    setMenu(false);
    navToggle.focus();
  }
});
matchMedia('(max-width: 55rem)').addEventListener('change', () => setMenu(false));
document.querySelector('#year').textContent = new Date().getFullYear();

const runButton = document.querySelector('.bench-run');
const status = document.querySelector('.bench-status');
const steps = [...document.querySelectorAll('.bench-steps li')];
const layers = [...document.querySelectorAll('.bench-layer')].reverse();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const results = [
  'Consulta de ejemplo recibida desde la web.',
  'Oportunidad de ejemplo registrada en el sistema.',
  'Simulación completa. El equipo recibió el aviso de ejemplo.'
];

runButton.hidden = false;
runButton.addEventListener('click', async () => {
  if (runButton.getAttribute('aria-disabled') === 'true') return;
  runButton.setAttribute('aria-disabled', 'true');
  status.textContent = 'Procesando consulta de ejemplo…';
  steps.forEach((step, index) => {
    step.classList.remove('is-done');
    step.removeAttribute('aria-current');
    layers[index].classList.remove('is-active');
  });

  for (const [index, message] of results.entries()) {
    if (!reducedMotion.matches) {
      await new Promise((resolve) => setTimeout(resolve, 480));
    }
    steps[index - 1]?.removeAttribute('aria-current');
    layers[index - 1]?.classList.remove('is-active');
    steps[index].classList.add('is-done');
    steps[index].setAttribute('aria-current', 'step');
    layers[index].classList.add('is-active');
    status.textContent = message;
  }
  runButton.removeAttribute('aria-disabled');
});

function openLinkedCase() {
  const linkedCase = document.getElementById(location.hash.slice(1));
  if (linkedCase?.matches('details.case')) linkedCase.open = true;
}

openLinkedCase();
window.addEventListener('hashchange', openLinkedCase);
