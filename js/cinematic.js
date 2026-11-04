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

/* Horizontal carousels — one engine for hero and case studies.
   Controls: arrows, dots, keyboard, touch swipe; hero rotates automatically until interacted with.
   Degrades to the first visible project and normal links without motion. */
(() => {
  'use strict';
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  for (const carousel of document.querySelectorAll('[data-carousel]')) {
    const viewport = carousel.querySelector('.carousel-viewport');
    const track = carousel.querySelector('.carousel-track');
    const slides = [...carousel.querySelectorAll('.carousel-slide')];
    const dots = [...carousel.querySelectorAll('.carousel-dot')];
    const position = carousel.querySelector('.carousel-position');
    const prev = carousel.querySelector('[data-prev]');
    const next = carousel.querySelector('[data-next]');
    if (!viewport || !track || slides.length < 2 || !prev || !next) continue;

    let index = 0;
    let timer = null;
    let interacted = false;
    let hovered = false;
    let visible = true;
    let pointerStartX = null;
    let pointerStartY = null;
    const duration = Math.max(0, Number(carousel.dataset.autoplay) || 0);
    const format = i => String(i + 1).padStart(2,'0');
    const render = () => {
      track.style.transform = 'translate3d(-' + (index * 100) + '%, 0, 0)';
      if (position) position.textContent = format(index) + ' / ' + String(slides.length).padStart(2,'0');
      slides.forEach((slide,i) => {
        const active = i === index;
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
        // Prevent invisible slides' links from appearing in the tab order.
        if ('inert' in slide) slide.inert = !active;
        else slide.querySelectorAll('a,button').forEach(el => { el.tabIndex = active ? 0 : -1; });
      });
      dots.forEach((dot,i) => {
        if(i===index)dot.setAttribute('aria-current','true');
        else dot.removeAttribute('aria-current');
      });
    };
    const go = (nextIndex, manual=false) => {
      index = (nextIndex + slides.length) % slides.length;
      if(manual){interacted = true; stop();}
      render();
    };
    const stop = () => { if(timer!==null){window.clearInterval(timer);timer=null;} };
    const play = () => {
      stop();
      if(duration < 2000 || motion.matches || interacted || hovered || !visible || document.hidden) return;
      timer=window.setInterval(()=>{
        if(!document.hidden && !motion.matches && !hovered && visible)go(index+1);
      },duration);
    };
    prev.addEventListener('click',()=>go(index-1,true));
    next.addEventListener('click',()=>go(index+1,true));
    dots.forEach((dot,i)=>dot.addEventListener('click',()=>go(i,true)));
    viewport.addEventListener('keydown',(e)=>{
      if(e.key === 'ArrowRight'){e.preventDefault();go(index+1,true);}
      if(e.key === 'ArrowLeft'){e.preventDefault();go(index-1,true);}
    });
    viewport.style.touchAction='pan-y';
    viewport.addEventListener('pointerdown',(e)=>{
      if(e.pointerType!=='touch'&&e.pointerType!=='pen')return;
      pointerStartX=e.clientX;pointerStartY=e.clientY;
    },{passive:true});
    viewport.addEventListener('pointerup',(e)=>{
      if(pointerStartX===null)return;
      const dx=e.clientX-pointerStartX,dy=e.clientY-pointerStartY;
      pointerStartX=null;pointerStartY=null;
      if(Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*1.2)go(index+(dx<0?1:-1),true);
    },{passive:true});
    viewport.addEventListener('pointercancel',()=>{pointerStartX=null;pointerStartY=null;});
    carousel.addEventListener('mouseenter',()=>{hovered=true;stop();});
    carousel.addEventListener('mouseleave',()=>{hovered=false;play();});
    carousel.addEventListener('focusin',()=>{hovered=true;stop();});
    carousel.addEventListener('focusout',(e)=>{if(!carousel.contains(e.relatedTarget)){hovered=false;play();}});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else play();});
    if(motion.addEventListener)motion.addEventListener('change',play);
    if('IntersectionObserver' in window){
      const watch=new IntersectionObserver(entries=>{
        visible=entries[0]?.isIntersecting ?? true;
        if(!visible)stop();else play();
      },{threshold:.25});
      watch.observe(carousel);
    }
    render();
    play();
  }
})();