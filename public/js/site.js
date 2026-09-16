// ---------- Mobile sidebar toggle ----------
(function initSidebar(){
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.overlay');
  const toggleBtn = document.querySelector('.hamburger');
  if(!sidebar || !toggleBtn) return;

  function open(){ sidebar.classList.add('open'); overlay.classList.add('open'); }
  function close(){ sidebar.classList.remove('open'); overlay.classList.remove('open'); }

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.contains('open') ? close() : open();
  });
  overlay.addEventListener('click', close);
  sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
})();

// ---------- Custom cursor ----------
(function initCursor(){
  if(!window.matchMedia('(pointer: fine)').matches) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.body.classList.add('has-custom-cursor');

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let ringX = mouseX, ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
  });

  function loop(){
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  }
  loop();

  const interactiveSelector = 'a, button, .chip, .cursor-pointer, input, textarea';
  document.addEventListener('mouseover', (e) => {
    if(e.target.closest(interactiveSelector)) ring.classList.add('is-active');
  });
  document.addEventListener('mouseout', (e) => {
    if(e.target.closest(interactiveSelector)) ring.classList.remove('is-active');
  });
})();

// ---------- Scroll reveal ----------
(function initReveal(){
  const items = document.querySelectorAll('.reveal');
  if(!items.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(item => observer.observe(item));
})();

// ---------- Count-up numbers ----------
(function initCounters(){
  const counters = document.querySelectorAll('[data-count-to]');
  if(!counters.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.countTo);
      const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();

      function tick(now){
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = value.toFixed(decimals) + suffix;
        if(progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(c => observer.observe(c));
})();

// ---------- Active nav link ----------
(function markActiveNav(){
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar nav a').forEach(a => {
    const href = a.getAttribute('href');
    if(href === current) a.classList.add('active');
  });
})();
