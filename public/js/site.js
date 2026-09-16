// ---------- Web Audio API Sound Chime FX ----------
window.playChime = function(type = 'success'){
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if(!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if(type === 'success'){
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if(type === 'click'){
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch(e){}
};

// ---------- Toast Notification System ----------
(function initToast(){
  const toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);

  window.showToast = function(msg, icon = '✨'){
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
    toastContainer.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  };
})();

// ---------- Dark / Light Mode Theme Controller ----------
(function initTheme(){
  const savedTheme = localStorage.getItem('ecosort-theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  document.documentElement.setAttribute('data-theme', savedTheme);

  window.toggleTheme = function(){
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ecosort-theme', next);
    updateThemeButtons(next);
    window.playChime('click');
    window.showToast(`Switched to ${next === 'dark' ? 'Dark Mode' : 'Light Mode'}`, next === 'dark' ? '🌙' : '☀️');
  };

  function updateThemeButtons(theme){
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      const isDark = theme === 'dark';
      btn.innerHTML = `<span class="icon">${isDark ? '☀️' : '🌙'}</span> <span>${isDark ? 'Light Mode' : 'Dark Mode'}</span>`;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateThemeButtons(document.documentElement.getAttribute('data-theme') || 'light');
    
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.addEventListener('click', window.toggleTheme);
    });
  });
})();

// ---------- User Eco-Streak Tracker ----------
(function initStreak(){
  const STREAK_KEY = 'ecosort_streak_data';
  const today = new Date().toISOString().split('T')[0];

  let streakData = { count: 1, lastActive: today };
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) streakData = JSON.parse(raw);
  } catch(e){}

  if (streakData.lastActive !== today) {
    const last = new Date(streakData.lastActive);
    const curr = new Date(today);
    const diffDays = Math.round((curr - last) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streakData.count += 1;
    } else if (diffDays > 1) {
      streakData.count = 1;
    }
    streakData.lastActive = today;
    localStorage.setItem(STREAK_KEY, JSON.stringify(streakData));
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.streak-count-val').forEach(el => {
      el.textContent = `${streakData.count} Day${streakData.count > 1 ? 's' : ''}`;
    });
  });
})();

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
  if(overlay) overlay.addEventListener('click', close);
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

  const interactiveSelector = 'a, button, .chip, .cursor-pointer, input, textarea, .tab-btn, .pill-btn, .quiz-option-btn';
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
  }, { threshold: 0.12 });
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

// ---------- Homepage Hero Quick Sorter ----------
(function initHeroQuickSorter(){
  const form = document.getElementById('heroQuickForm');
  const input = document.getElementById('heroQuickInput');
  const resultBox = document.getElementById('heroQuickResult');
  if(!form || !input || !resultBox) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if(!query) return;

    resultBox.style.display = 'block';
    resultBox.innerHTML = '<em>Analyzing item...</em>';

    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: query })
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || 'Sorting failed');

      const resObj = data.result || {};
      resultBox.innerHTML = `
        <div style="font-weight:700; color:var(--forest); margin-bottom:4px;">
          🏷️ ${resObj.bin_name || 'Classified'}
        </div>
        <div>${resObj.reasoning}</div>
        <div style="margin-top:6px; font-size:12px; color:var(--muted);">💡 <b>Tip:</b> ${resObj.tip}</div>
      `;
      window.playChime?.('success');
      window.showToast?.(`Sorted: ${resObj.bin_name}`, '🎯');
    } catch(err) {
      resultBox.innerHTML = `<span style="color:var(--hazard);">Error: ${err.message}</span>`;
    }
  });
})();

