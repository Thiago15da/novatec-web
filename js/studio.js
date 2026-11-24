const navToggle = document.querySelector('#nav-toggle');
const mobileNav = document.querySelector('#nav-mobile');

function setMenu(open) {
  mobileNav.hidden = !open;
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
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
matchMedia('(max-width: 64rem)').addEventListener('change', () => setMenu(false));
document.querySelector('#year').textContent = new Date().getFullYear();

const workbench = document.querySelector('.workbench');
const runButton = workbench.querySelector('.bench-run');
const runLabel = runButton.querySelector('.bench-label');
const status = workbench.querySelector('.bench-status');
const nameInput = workbench.querySelector('#demo-name');
const steps = [...workbench.querySelectorAll('.bench-steps li')];
const views = [...workbench.querySelectorAll('[data-demo-view]')];
const stageNames = ['web', 'system', 'team'];
const buttonLabels = ['Enviar consulta de prueba', 'Asignar al equipo de ventas', 'Volver a probar'];
let currentStage = 0;

runButton.hidden = false;
runButton.addEventListener('click', () => {
  const name = nameInput.value.trim() || 'Tu contacto';
  currentStage = (currentStage + 1) % stageNames.length;
  workbench.dataset.stage = stageNames[currentStage];
  views.forEach((view, index) => {
    view.hidden = index !== currentStage;
  });
  steps.forEach((step, index) => {
    step.classList.toggle('is-done', index < currentStage);
    if (index === currentStage) step.setAttribute('aria-current', 'step');
    else step.removeAttribute('aria-current');
  });
  workbench.querySelectorAll('[data-demo-person]').forEach(person => {
    person.textContent = name;
  });
  workbench.querySelector('.demo-avatar').textContent = name.slice(0, 1).toLocaleUpperCase('es');
  const messages = [
    'Podés cambiar el nombre y enviar otra consulta de prueba.',
    'La consulta de ' + name + ' se guardó en el sistema. Ahora podés asignarla.',
    'El equipo de ventas tiene la consulta de ' + name + ' y puede hacer seguimiento.'
  ];
  status.textContent = messages[currentStage];
  runLabel.textContent = buttonLabels[currentStage];
});

function openLinkedCase() {
  const linkedCase = document.getElementById(location.hash.slice(1));
  if (linkedCase?.matches('details.case')) linkedCase.open = true;
}

openLinkedCase();
window.addEventListener('hashchange', openLinkedCase);
