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
  const link = event.target.closest('a');
  if (!link) return;
  setMenu(false);
  const target = link.hash && document.getElementById(link.hash.slice(1));
  if (target) target.focus({ preventScroll: true });
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
const runLabel = runButton.querySelector('.bench-label');
const status = document.querySelector('.bench-status');
const steps = [...document.querySelectorAll('.bench-steps li')];
const layers = [...document.querySelectorAll('.bench-layer')].reverse();
const stages = [
  {
    message: 'Ana solicita una cotización desde la web.',
    nextLabel: 'Registrar consulta'
  },
  {
    message: 'El sistema guarda la consulta de Ana como oportunidad, lista para hacer seguimiento.',
    nextLabel: 'Avisar al equipo'
  },
  {
    message: 'Ventas recibe el aviso con los datos de Ana y puede responderle.',
    nextLabel: 'Repetir ejemplo'
  }
];

let currentStage = -1;
runButton.hidden = false;
runButton.addEventListener('click', () => {
  currentStage = (currentStage + 1) % stages.length;
  steps.forEach((step, index) => {
    const current = index === currentStage;
    step.classList.toggle('is-done', index <= currentStage);
    layers[index].classList.toggle('is-active', current);
    if (current) step.setAttribute('aria-current', 'step');
    else step.removeAttribute('aria-current');
  });
  status.textContent = stages[currentStage].message;
  runLabel.textContent = stages[currentStage].nextLabel;
});

function openLinkedCase() {
  const linkedCase = document.getElementById(location.hash.slice(1));
  if (linkedCase?.matches('details.case')) linkedCase.open = true;
}

openLinkedCase();
window.addEventListener('hashchange', openLinkedCase);
