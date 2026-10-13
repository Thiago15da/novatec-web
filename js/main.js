// Attribution is carried between site pages and included only when a visitor submits a form.
// No external analytics scripts or third-party cookies are loaded here.
(function initializeLeadAttribution() {
  const params = new URLSearchParams(window.location.search);
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  let details = {};
  try {
    details = JSON.parse(sessionStorage.getItem('novatec_lead_origin') || '{}') || {};
  } catch { details = {}; }

  const incoming = {};
  for (const key of keys) {
    const value = params.get(key);
    if (value) incoming[key] = value.slice(0, 140);
  }
  if (Object.keys(incoming).length > 0) details = {...details, ...incoming};
  if (!details.referrer_host && document.referrer) {
    try {
      const host = new URL(document.referrer).hostname;
      if (host !== window.location.hostname) details.referrer_host = host;
    } catch { /* invalid referrer is ignored */ }
  }
  if (!details.entry_path) details.entry_path = window.location.pathname;
  try { sessionStorage.setItem('novatec_lead_origin', JSON.stringify(details)); }
  catch { /* private browsing may block storage */ }

  window.NovaTecLeadAttribution = function attachAttribution(form) {
    if (!form) return;
    const fields = {origen_pagina: details.entry_path, ...details};
    for (const [key, value] of Object.entries(fields)) {
      const inputName = 'atribucion_' + key;
      let field = Array.from(form.elements).find(el => el.name === inputName);
      if (!field) {
        field = document.createElement('input');
        field.type = 'hidden';
        field.name = inputName;
        form.appendChild(field);
      }
      field.value = String(value).slice(0, 180);
    }
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const bar1 = document.getElementById('bar1');
  const bar2 = document.getElementById('bar2');
  const bar3 = document.getElementById('bar3');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isOpen = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden');
      if (!isOpen) {
        bar1.style.transform = 'translateY(8px) rotate(45deg)';
        bar2.style.opacity = '0';
        bar3.style.transform = 'translateY(-8px) rotate(-45deg)';
      } else {
        bar1.style.transform = '';
        bar2.style.opacity = '1';
        bar3.style.transform = '';
      }
    });
  }

  // Highlight active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a[data-page]').forEach(link => {
    if (link.dataset.page === currentPage) {
      link.classList.add('text-primary');
      link.classList.remove('text-gray-300');
    }
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.add('hidden');
          bar1.style.transform = '';
          bar2.style.opacity = '1';
          bar3.style.transform = '';
        }
      }
    });
  });

  // Contact form AJAX submission
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('[type="submit"]');
      const statusEl = document.getElementById('form-status');
      const originalText = btn.textContent;
      if (typeof window.NovaTecLeadAttribution === 'function') window.NovaTecLeadAttribution(contactForm);

      btn.disabled = true;
      btn.textContent = 'Enviando...';

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          statusEl.textContent = '¡Mensaje enviado! Te contactamos en menos de 24hs.';
          statusEl.className = 'mt-4 text-sm font-semibold text-primary';
          contactForm.reset();
        } else {
          throw new Error();
        }
      } catch {
        statusEl.textContent = 'Error al enviar. Escribinos directamente por WhatsApp.';
        statusEl.className = 'mt-4 text-sm font-semibold text-red-400';
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });
  }

  // Scroll fade-in for .will-fade elements
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('did-fade');
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
  );
  document.querySelectorAll('.will-fade').forEach(el => observer.observe(el));
});
