/* ADI GOLAN — portfolio interactions (calm, restrained) */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.addEventListener('DOMContentLoaded', () => document.body.classList.add('loaded'));
  // restore from bfcache (back/forward) so the page isn't stuck mid-transition
  window.addEventListener('pageshow', () => document.body.classList.remove('leaving'));

  /* seamless page transitions for internal navigations */
  if (!reduce) {
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || a.target === '_blank' || a.hasAttribute('download')) return;
      let url;
      try { url = new URL(a.href, location.href); } catch (_) { return; }
      if (url.origin !== location.origin || url.pathname === location.pathname) return; // external or same-page/hash → default
      e.preventDefault();
      document.body.classList.add('leaving');
      setTimeout(() => { location.href = a.href; }, 330);
    });
  }

  /* nav: white over the full-screen hero image, solid cream after */
  const nav = document.querySelector('.nav');
  const heroFull = document.querySelector('.hero-full');
  const onScroll = () => {
    if (!nav) return;
    if (heroFull) {
      const past = window.scrollY > heroFull.offsetHeight - 80;
      nav.classList.toggle('on-image', !past);
      nav.classList.toggle('solid', past);
    } else {
      nav.classList.toggle('solid', window.scrollY > 40);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (sections.length) {
    const so = new IntersectionObserver((es) => {
      es.forEach(e => {
        if (e.isIntersecting) {
          const id = '#' + e.target.id;
          navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => so.observe(s));
  }

  /* scroll reveal */
  const reveals = [...document.querySelectorAll('.reveal')];
  if (reduce) {
    reveals.forEach(el => el.classList.add('in'));
  } else {
    const ro = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    reveals.forEach(el => ro.observe(el));
  }

  /* click-to-play video */
  document.querySelectorAll('.videowrap').forEach(w => {
    const v = w.querySelector('video');
    w.querySelector('.playbtn')?.addEventListener('click', () => {
      if (!v) return;
      if (v.paused) { v.play(); w.classList.add('playing'); v.setAttribute('controls', ''); }
      else { v.pause(); }
    });
  });

  /* lightbox */
  const items = [...document.querySelectorAll('[data-lb]')];
  if (items.length) {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = `
      <div class="lb-counter"></div>
      <button class="lb-btn lb-close" aria-label="Close">Close ✕</button>
      <button class="lb-btn lb-nav lb-prev" aria-label="Previous">‹</button>
      <button class="lb-btn lb-nav lb-next" aria-label="Next">›</button>
      <img alt="">
      <div class="lb-cap"></div>`;
    document.body.append(lb);
    const img = lb.querySelector('img');
    const cap = lb.querySelector('.lb-cap');
    const counter = lb.querySelector('.lb-counter');
    const srcs = items.map(el => ({ full: el.dataset.lb || el.querySelector('img')?.src, cap: el.dataset.cap || el.querySelector('img')?.alt || '' }));
    let i = 0;
    const show = n => {
      i = (n + srcs.length) % srcs.length;
      img.src = srcs[i].full; img.alt = srcs[i].cap; cap.textContent = srcs[i].cap;
      counter.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(srcs.length).padStart(2, '0');
    };
    const open = n => { show(n); lb.classList.add('open'); document.documentElement.style.overflow = 'hidden'; };
    const close = () => { lb.classList.remove('open'); document.documentElement.style.overflow = ''; };
    items.forEach((el, n) => el.addEventListener('click', () => open(n)));
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-next').addEventListener('click', () => show(i + 1));
    lb.querySelector('.lb-prev').addEventListener('click', () => show(i - 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(i + 1);
      if (e.key === 'ArrowLeft') show(i - 1);
    });
  }
})();
