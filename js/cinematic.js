/* NovaTec cinematic motion controller
   Progressive enhancement. Never blocks reading, navigation, contact forms or indexing. */
(() => {
  'use strict';
  const doc = document;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const safeMotion = () => !reduced.matches;
  const homepage = doc.body.classList.contains('cinema-home');
  const inner = doc.body.classList.contains('cinema-inner');

  // Discreet reading progress, not an intrusive loading bar.
  const line = doc.createElement('div');
  line.className = 'cinema-progress';
  line.setAttribute('aria-hidden', 'true');
  doc.body.appendChild(line);

  const elements = [...doc.querySelectorAll('[data-reveal]')];
  if (inner) {
    for (const s of doc.querySelectorAll('main > section')) {
      if (!s.matches(':first-of-type') && !s.hasAttribute('data-reveal')) elements.push(s);
    }
  }
  if (safeMotion() && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    elements.forEach(element => element.classList.add('reveal-shot'));
    doc.body.classList.add('cinema-motion');
    // Observe after classes have settled so near-viewport elements enter normally.
    requestAnimationFrame(() => elements.forEach(el => observer.observe(el)));
  }

  const hero = homepage ? doc.querySelector('.hero-cinema') : null;
  const heroShell = hero?.querySelector('.showcase-shell');
  const heroOffset = hero?.querySelector('.showcase-offset');
  const media = homepage ? [...doc.querySelectorAll('[data-media-depth]')] : [];
  let pending = false;
  const update = () => {
    pending = false;
    const y = Math.max(window.scrollY, 0);
    const max = Math.max(doc.documentElement.scrollHeight - window.innerHeight, 1);
    line.style.transform = 'scaleX(' + Math.min(y/max,1).toFixed(4) + ')';
    if (!safeMotion()) {
      if (heroShell) heroShell.style.setProperty('--hero-offset', '0px');
      if (heroOffset) heroOffset.style.setProperty('--hero-offset-small', '0px');
      media.forEach(el=>el.style.setProperty('--image-offset','0px'));
      return;
    }
    if (hero && heroShell && y < (hero.offsetHeight + 180)) {
      const depth = Math.max(0,Math.min(y/hero.offsetHeight,1));
      heroShell.style.setProperty('--hero-offset',(depth * 37).toFixed(1)+'px');
      if(heroOffset)heroOffset.style.setProperty('--hero-offset-small',(-depth*17).toFixed(1)+'px');
    }
    for (const img of media) {
      const container = img.closest('.case-media, .sector-shot');
      if (!container) continue;
      const rect = container.getBoundingClientRect();
      if (rect.bottom < -80 || rect.top > window.innerHeight+80) continue;
      const travel = (window.innerHeight/2 - (rect.top+rect.height/2)) / (window.innerHeight+rect.height);
      img.style.setProperty('--image-offset',Math.max(-1,Math.min(1,travel*2))*18+'px');
    }
  };
  const schedule = () => {
    if (pending) return;
    pending=true;
    window.requestAnimationFrame(update);
  };
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  if (reduced.addEventListener) reduced.addEventListener('change',schedule);
  schedule();

  // A restrained pointer-based depth effect (desktop only).
  if(hero && heroShell && window.matchMedia('(hover: hover) and (pointer: fine)').matches && safeMotion()) {
    hero.addEventListener('pointermove',(event)=>{
      if(event.pointerType === 'touch' || !safeMotion())return;
      const r=heroShell.getBoundingClientRect();
      const x=Math.max(-1,Math.min(1,(event.clientX-r.left-r.width/2)/(r.width/2)));
      const y=Math.max(-1,Math.min(1,(event.clientY-r.top-r.height/2)/(r.height/2)));
      heroShell.style.setProperty('--hero-tilt-x',(-y*1.7).toFixed(2)+'deg');
      heroShell.style.setProperty('--hero-tilt-y',(x*1.7).toFixed(2)+'deg');
    },{passive:true});
    hero.addEventListener('pointerleave',()=>{
      heroShell.style.setProperty('--hero-tilt-x','0deg');
      heroShell.style.setProperty('--hero-tilt-y','0deg');
    });
  }
})();