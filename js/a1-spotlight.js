/* NovaTec / A1 Maquetas spotlight
   Real client photography, keyboard-friendly selectors and an accessible native lightbox.
   No tracking dependencies or heavy animation libraries. */
(() => {
  'use strict';
  const root = document.querySelector('[data-a1-gallery]');
  if (!root) return;

  const image = root.querySelector('[data-a1-image]');
  const caption = root.querySelector('[data-a1-caption]');
  const controls = [...root.querySelectorAll('[data-a1-choice]')];
  const expand = root.querySelector('[data-a1-expand]');
  const dialog = document.querySelector('[data-a1-dialog]');
  const dialogImage = dialog?.querySelector('[data-a1-dialog-image]');
  const dialogCaption = dialog?.querySelector('[data-a1-dialog-caption]');
  const closeButton = dialog?.querySelector('[data-a1-close]');
  if (!image || !caption || controls.length === 0 || !expand) return;

  let current = 0;
  let pending = 0;

  function syncDialog() {
    if (!dialogImage || !dialogCaption) return;
    dialogImage.src = image.currentSrc || image.src;
    dialogImage.alt = image.alt;
    dialogCaption.textContent = caption.textContent;
  }

  function activate(index) {
    const next = (index + controls.length) % controls.length;
    if (next === current) return;

    const button = controls[next];
    const src = button.dataset.a1Photo;
    const alt = button.dataset.a1Alt || 'Maqueta arquitectónica de A1 Maquetas';
    const label = button.dataset.a1Caption || 'Proyecto de A1 Maquetas';
    if (!src) return;

    const request = ++pending;
    image.classList.add('is-changing');
    const preload = new Image();
    preload.onload = () => {
      if (request !== pending) return;
      image.src = src;
      image.alt = alt;
      caption.textContent = label;
      current = next;
      controls.forEach((control, i) => {
        control.setAttribute('aria-pressed', String(i === current));
      });
      if (dialog?.open) syncDialog();
      requestAnimationFrame(() => image.classList.remove('is-changing'));
    };
    preload.onerror = () => {
      if (request === pending) image.classList.remove('is-changing');
    };
    preload.src = src;
  }

  controls.forEach((button, index) => {
    button.addEventListener('click', () => activate(index));
    button.addEventListener('keydown', event => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + controls.length) % controls.length;
      controls[next].focus();
      activate(next);
    });
  });

  expand.addEventListener('click', () => {
    if (!dialog || typeof dialog.showModal !== 'function') return;
    syncDialog();
    dialog.showModal();
    closeButton?.focus();
  });
  closeButton?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog?.addEventListener('close', () => expand.focus());
})();
