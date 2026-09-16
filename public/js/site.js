// =========================================================
// EcoSort AI — Dynamic Human-Centric Interactive Engine
// =========================================================

// ---------- 1. Web Audio API Acoustic Sound Design ----------
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
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.09); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.18); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.28); // C6
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if(type === 'pop'){
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if(type === 'error'){
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(180, now + 0.2);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if(type === 'click'){
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    }
  } catch(e){}
};

// ---------- 2. Confetti Particle Physics Cannon ----------
(function initConfetti(){
  const canvas = document.createElement('canvas');
  canvas.id = 'confettiCanvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const colors = ['#5E8B3E', '#A9CB89', '#D98F2B', '#2E7D32', '#42A5F5', '#AB47BC', '#FFD54F'];

  window.fireConfetti = function(originX = width / 2, originY = height / 2){
    for(let i = 0; i < 45; i++){
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 4;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        life: 0,
        maxLife: Math.random() * 50 + 60
      });
    }
  };

  function update(){
    ctx.clearRect(0, 0, width, height);
    for(let i = particles.length - 1; i >= 0; i--){
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // gravity
      p.vx *= 0.98; // drag
      p.rotation += p.rotationSpeed;
      p.life++;
      p.opacity = Math.max(0, 1 - p.life / p.maxLife);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();

      if(p.life >= p.maxLife || p.y > height){
        particles.splice(i, 1);
      }
    }
    requestAnimationFrame(update);
  }
  update();
})();

// ---------- 3. Ambient Background Floating Spores Canvas ----------
(function initAmbientBackground(){
  const canvas = document.createElement('canvas');
  canvas.id = 'bgCanvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const spores = Array.from({ length: 28 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 3 + 1,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4 - 0.1,
    opacity: Math.random() * 0.35 + 0.1
  }));

  let mouseX = width / 2, mouseY = height / 2;
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function render(){
    ctx.clearRect(0, 0, width, height);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = isDark ? '#88BD64' : '#5E8B3E';

    spores.forEach(s => {
      s.x += s.vx + (mouseX - width / 2) * 0.00005;
      s.y += s.vy + (mouseY - height / 2) * 0.00005;

      if(s.x < 0) s.x = width;
      if(s.x > width) s.x = 0;
      if(s.y < 0) s.y = height;
      if(s.y > height) s.y = 0;

      ctx.globalAlpha = s.opacity * (isDark ? 0.4 : 0.25);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(render);
  }
  render();
})();

// ---------- 4. 3D Card Tilt Physics ----------
(function init3DTilt(){
  const tiltElements = document.querySelectorAll('.feature-card, .stat-card, .directory-card, .value-card, .card-tilt');

  tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
})();

// ---------- 5. Toast Notification System ----------
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

// ---------- 6. Dark / Light Theme Controller ----------
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

// ---------- 7. User Eco-Streak Tracker ----------
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

// ---------- 8. Interactive Bin Toss Playground (Gamified Sorting) ----------
(function initBinPlayground(){
  const playground = document.getElementById('binPlayground');
  if(!playground) return;

  const itemPool = document.getElementById('itemPool');
  const targetBins = document.querySelectorAll('.target-bin');
  const scoreDisplay = document.getElementById('playgroundScoreVal');
  const feedbackBubble = document.getElementById('feedbackBubble');

  let score = 0;

  const INITIAL_ITEMS = [
    { name: '🍌 Banana Peel', category: 'wet', tip: 'Composts into rich soil nutrients!' },
    { name: '🍕 Greasy Pizza Box', category: 'wet', tip: 'Grease ruins paper recycling — compost the base!' },
    { name: '🥤 Crushed Soda Can', category: 'dry', tip: 'Aluminum can be recycled indefinitely.' },
    { name: '🔋 Used AA Battery', category: 'hazardous', tip: 'Keeps toxic heavy metals out of ground water.' },
    { name: '🔌 Old Phone Cable', category: 'ewaste', tip: 'E-waste centers recover copper & gold safely.' },
    { name: '🥚 Egg Shells', category: 'wet', tip: 'Adds healthy calcium to compost.' },
    { name: '🧴 Empty Shampoo Bottle', category: 'dry', tip: 'Quick water rinse makes plastic 100% recyclable.' }
  ];

  function populateItems(){
    itemPool.innerHTML = '';
    INITIAL_ITEMS.forEach(it => {
      const el = document.createElement('div');
      el.className = 'draggable-item cursor-pointer';
      el.draggable = true;
      el.dataset.category = it.category;
      el.dataset.tip = it.tip;
      el.dataset.name = it.name;
      el.textContent = it.name;

      el.addEventListener('dragstart', (e) => {
        el.classList.add('dragging');
        e.dataTransfer.setData('text/plain', JSON.stringify(it));
      });
      el.addEventListener('dragend', () => el.classList.remove('dragging'));

      // Click to sort shortcut
      el.addEventListener('click', () => {
        highlightCorrectBin(it.category);
        window.showToast?.(`Drag or drop "${it.name}" into the highlighted bin!`, '💡');
      });

      itemPool.appendChild(el);
    });
  }

  function highlightCorrectBin(category){
    targetBins.forEach(bin => {
      if(bin.dataset.bin === category){
        bin.classList.add('drag-over');
        setTimeout(() => bin.classList.remove('drag-over'), 800);
      }
    });
  }

  targetBins.forEach(bin => {
    bin.addEventListener('dragover', (e) => {
      e.preventDefault();
      bin.classList.add('drag-over');
    });
    bin.addEventListener('dragleave', () => bin.classList.remove('drag-over'));

    bin.addEventListener('drop', (e) => {
      e.preventDefault();
      bin.classList.remove('drag-over');
      try {
        const itemData = JSON.parse(e.dataTransfer.getData('text/plain'));
        const binCategory = bin.dataset.bin;

        if (itemData.category === binCategory) {
          // Success!
          score += 10;
          scoreDisplay.textContent = `${score} pts`;
          bin.classList.add('bounce-success');
          setTimeout(() => bin.classList.remove('bounce-success'), 600);

          feedbackBubble.innerHTML = `🎉 <b>Spot on!</b> ${itemData.name} sorted correctly! <em>(${itemData.tip})</em>`;
          window.playChime('success');
          
          const rect = bin.getBoundingClientRect();
          window.fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);

          // Remove sorted item from pool
          const sortedEl = Array.from(itemPool.children).find(c => c.dataset.name === itemData.name);
          if (sortedEl) sortedEl.remove();

          if (itemPool.children.length === 0) {
            setTimeout(() => {
              feedbackBubble.innerHTML = `🌟 <b>You cleared the board!</b> Resetting fresh items for more sorting fun...`;
              window.fireConfetti();
              populateItems();
            }, 1000);
          }
        } else {
          // Mistake feedback
          bin.style.transform = 'translateX(-6px)';
          setTimeout(() => bin.style.transform = 'translateX(6px)', 100);
          setTimeout(() => bin.style.transform = 'translateX(0)', 200);

          feedbackBubble.innerHTML = `❌ <b>Not quite!</b> ${itemData.name} belongs in the <u>${getCategoryName(itemData.category)}</u> bin.`;
          window.playChime('error');
        }
      } catch(err){}
    });
  });

  function getCategoryName(cat){
    const names = { wet: '🟢 Wet / Organic', dry: '🔵 Dry / Recyclable', hazardous: '🔴 Hazardous', ewaste: '🟣 E-Waste' };
    return names[cat] || cat;
  }

  populateItems();
})();

// ---------- 9. Homepage Hero Quick Sorter ----------
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
      window.playChime('success');
      window.fireConfetti();
      window.showToast(`Sorted: ${resObj.bin_name}`, '🎯');
    } catch(err) {
      resultBox.innerHTML = `<span style="color:var(--hazard);">Error: ${err.message}</span>`;
    }
  });
})();

// ---------- 10. Custom Cursor Trail ----------
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

  const interactiveSelector = 'a, button, .chip, .cursor-pointer, input, textarea, .tab-btn, .pill-btn, .quiz-option-btn, .draggable-item, .target-bin';
  document.addEventListener('mouseover', (e) => {
    if(e.target.closest(interactiveSelector)) ring.classList.add('is-active');
  });
  document.addEventListener('mouseout', (e) => {
    if(e.target.closest(interactiveSelector)) ring.classList.remove('is-active');
  });
})();

// ---------- 11. Mobile Sidebar Toggle ----------
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

// ---------- 12. Dynamic Flying Scroll Reveal Observer ----------
(function initReveal(){
  const revealSelectors = '.reveal, .reveal-fly-up, .reveal-fly-left, .reveal-fly-right, .reveal-zoom-in, .reveal-flip-3d';
  const items = document.querySelectorAll(revealSelectors);
  if(!items.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  
  items.forEach(item => observer.observe(item));
})();

// ---------- 13. Count-up Numbers Animation ----------
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

// ---------- 14. Active Navigation Marker ----------
(function markActiveNav(){
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar nav a').forEach(a => {
    const href = a.getAttribute('href');
    if(href === current) a.classList.add('active');
  });
})();

// ---------- 15. Dynamic Scroll Engine (Progress Bar, Flying Sparks & Percentage Pill) ----------
(function initScrollDynamics(){
  // Ensure top progress bar exists
  let progressBar = document.getElementById('scrollProgressBar');
  if(!progressBar){
    progressBar = document.createElement('div');
    progressBar.id = 'scrollProgressBar';
    document.body.prepend(progressBar);
  }

  // Ensure scroll percentage pill exists
  let scrollPill = document.getElementById('scrollPill');
  if(!scrollPill){
    scrollPill = document.createElement('div');
    scrollPill.className = 'scroll-pill';
    scrollPill.id = 'scrollPill';
    scrollPill.innerHTML = `<span>↑</span><span id="scrollPercent">0%</span>`;
    document.body.appendChild(scrollPill);
  }

  const percentLabel = document.getElementById('scrollPercent');

  // Smooth scroll to top on pill click
  scrollPill.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.playChime?.('click');
  });

  const heroBlobs = document.querySelectorAll('.blob');
  let ticking = false;
  let lastScrollY = window.scrollY;
  let lastSparkTime = 0;
  const sparkSymbols = ['🍃', '✨', '🌱', '♻️', '💧', '🌿', '🟢'];

  function spawnFlyingSpark(x, y, isDown){
    const now = performance.now();
    if(now - lastSparkTime < 240) return; // limit frequency
    lastSparkTime = now;

    const spark = document.createElement('div');
    spark.className = 'flying-eco-spark';
    spark.textContent = sparkSymbols[Math.floor(Math.random() * sparkSymbols.length)];
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;

    const tx = (Math.random() - 0.5) * 140;
    const ty = isDown ? -(Math.random() * 90 + 40) : (Math.random() * 90 + 40);
    const rot = (Math.random() - 0.5) * 60;

    spark.style.setProperty('--tx', `${tx}px`);
    spark.style.setProperty('--ty', `${ty}px`);
    spark.style.setProperty('--rot', `${rot}deg`);

    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 1600);
  }

  function onScroll(){
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    const delta = scrollTop - lastScrollY;

    // 1. Update top gradient progress bar
    if(progressBar){
      progressBar.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
    }

    // 2. Update floating scroll pill & visibility
    if(scrollPill){
      if(scrollTop > 200){
        scrollPill.classList.add('visible');
        if(percentLabel) percentLabel.textContent = `${Math.round(scrollPercent)}%`;
      } else {
        scrollPill.classList.remove('visible');
      }
    }

    // 3. Subtle Parallax effect on hero blobs
    if(heroBlobs.length && scrollTop < 800){
      heroBlobs.forEach((blob, idx) => {
        const factor = idx === 0 ? 0.18 : -0.14;
        blob.style.transform = `translateY(${scrollTop * factor}px)`;
      });
    }

    // 4. Dynamic Flying Eco Sparks on active slide down
    if(Math.abs(delta) > 15){
      const spawnX = Math.random() * (window.innerWidth - 120) + 60;
      const spawnY = Math.random() * (window.innerHeight * 0.6) + (window.innerHeight * 0.2);
      spawnFlyingSpark(spawnX, spawnY, delta > 0);
    }

    lastScrollY = scrollTop;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if(!ticking){
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  // Initial calculation
  onScroll();
})();


