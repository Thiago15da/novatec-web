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

  // Intersection Observer for fade-in animations
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-up');
        entry.target.style.opacity = '1';
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('[data-animate]').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
});
