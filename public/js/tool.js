// ---------- Tab Navigation System ----------
(function initTabs(){
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');

      if (targetId === 'directory-tab' && !window.hasLoadedDirectory) {
        loadDirectory();
      }
      if (targetId === 'quiz-tab' && !window.hasLoadedQuiz) {
        loadQuiz();
      }
    });
  });
})();

// ---------- Bin Visual Styling Map ----------
const BIN_STYLES = {
  wet: { color: 'var(--wet)', bg: 'var(--wet)', label: 'Wet / Organic' },
  dry: { color: 'var(--dry)', bg: 'var(--dry)', label: 'Dry / Recyclable' },
  hazardous: { color: 'var(--hazard)', bg: 'var(--hazard)', label: 'Hazardous' },
  ewaste: { color: 'var(--ewaste)', bg: 'var(--ewaste)', label: 'E-Waste' },
};

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function createResultCard(query, data){
  const style = BIN_STYLES[data.category] || BIN_STYLES.dry;
  const card = document.createElement('div');
  card.className = 'result-card reveal-zoom-in is-visible card-tilt';
  card.innerHTML = `
    <div class="query">Item analyzed: <b>${escapeHtml(query)}</b></div>
    <div class="bin-row">
      <span class="bin-dot" style="background:${style.color}; color:${style.color}"></span>
      <span class="bin-name">${escapeHtml(data.bin_name || style.label)}</span>
      <span class="bin-tag" style="background:${style.bg}">${style.label}</span>
    </div>
    <p class="reason">${escapeHtml(data.reasoning)}</p>
    <p class="tip"><b>💡 Habit Tip:</b> ${escapeHtml(data.tip)}</p>
    <button class="copy-advice-btn" type="button">📋 Copy Advice</button>
  `;

  const copyBtn = card.querySelector('.copy-advice-btn');
  copyBtn.addEventListener('click', () => {
    const textToCopy = `EcoSort AI Result:\nItem: ${query}\nBin: ${data.bin_name || style.label}\nReasoning: ${data.reasoning}\nTip: ${data.tip}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      window.showToast?.('Copied advice to clipboard!', '📋');
      window.playChime?.('click');
    });
  });

  window.playChime?.('success');
  return card;
}

// ---------- Tab 1: Text Advisor ----------
(function initTextAdvisor(){
  const form = document.getElementById('sortForm');
  const input = document.getElementById('itemInput');
  const submitBtn = document.getElementById('submitBtn');
  const loadingState = document.getElementById('loadingState');
  const errorBox = document.getElementById('errorBox');
  const resultsEl = document.getElementById('results');
  const chips = document.getElementById('chips');

  if(!form) return;

  function autoResize(){
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 140) + 'px';
  }
  input.addEventListener('input', autoResize);

  if (chips) {
    chips.addEventListener('click', (e) => {
      if(e.target.classList.contains('chip')){
        input.value = e.target.textContent;
        autoResize();
        input.focus();
      }
    });
  }

  function setLoading(isLoading){
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? 'Analyzing…' : 'Sort it →';
    loadingState.classList.toggle('active', isLoading);
  }

  function showError(msg){
    errorBox.textContent = msg;
    errorBox.classList.add('active');
  }
  function clearError(){
    errorBox.classList.remove('active');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if(!text) return;

    clearError();
    setLoading(true);

    try{
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: text }),
      });

      const data = await response.json();
      if(!response.ok) throw new Error(data.error || 'Server error');
      
      const card = createResultCard(text, data.result);
      resultsEl.prepend(card);
      input.value = '';
      autoResize();
    }catch(err){
      showError("Couldn't sort that one — " + err.message);
    }finally{
      setLoading(false);
    }
  });
})();

// ---------- Tab 2: Camera & Photo Scanner ----------
(function initCameraScanner(){
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const uploadBtn = document.getElementById('uploadBtn');
  const webcamBtn = document.getElementById('webcamBtn');
  const videoWrapper = document.getElementById('videoWrapper');
  const webcamVideo = document.getElementById('webcamVideo');
  const snapBtn = document.getElementById('snapBtn');
  const closeCameraBtn = document.getElementById('closeCameraBtn');
  const previewBox = document.getElementById('previewBox');
  const previewImg = document.getElementById('previewImg');
  const imageDetectionText = document.getElementById('imageDetectionText');
  const clearImageBtn = document.getElementById('clearImageBtn');
  const scannerResults = document.getElementById('scannerResults');

  let mediaStream = null;

  if(!dropzone) return;

  uploadBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(file) processImageFile(file);
  });

  // Drag & drop handlers
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if(e.dataTransfer.files && e.dataTransfer.files[0]){
      processImageFile(e.dataTransfer.files[0]);
    }
  });

  // Live Camera
  webcamBtn.addEventListener('click', async () => {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      webcamVideo.srcObject = mediaStream;
      videoWrapper.classList.add('active');
      dropzone.style.display = 'none';
    } catch(err) {
      alert("Could not access camera: " + err.message);
    }
  });

  function stopCamera(){
    if(mediaStream){
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
    videoWrapper.classList.remove('active');
    dropzone.style.display = 'block';
  }

  closeCameraBtn.addEventListener('click', stopCamera);

  snapBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = webcamVideo.videoWidth || 640;
    canvas.height = webcamVideo.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(webcamVideo, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    
    stopCamera();
    displayAndClassifyImage(dataUrl, "Camera Photo (Smart Packaging / Item Scan)");
  });

  function processImageFile(file){
    const reader = new FileReader();
    reader.onload = (e) => {
      // Guess label from filename or default
      let label = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      if (!label || label.length < 3 || /^\d+$/.test(label)) {
        label = "Scanned packaging or household item";
      }
      displayAndClassifyImage(e.target.result, label);
    };
    reader.readAsDataURL(file);
  }

  async function displayAndClassifyImage(imgSrc, queryLabel){
    previewImg.src = imgSrc;
    previewBox.classList.add('active');
    imageDetectionText.textContent = `🔍 Analyzing: "${queryLabel}"...`;

    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: queryLabel }),
      });
      const data = await response.json();
      if(!response.ok) throw new Error(data.error || 'Classification failed');

      imageDetectionText.textContent = `✅ Classification Complete for "${queryLabel}"`;
      const card = createResultCard(queryLabel, data.result);
      scannerResults.prepend(card);
    } catch(err) {
      imageDetectionText.textContent = `⚠️ Error: ${err.message}`;
    }
  }

  clearImageBtn.addEventListener('click', () => {
    previewBox.classList.remove('active');
    previewImg.src = '';
    fileInput.value = '';
  });
})();

// ---------- Tab 3: Waste Directory ----------
window.hasLoadedDirectory = false;
async function loadDirectory(){
  window.hasLoadedDirectory = true;
  const grid = document.getElementById('directoryGrid');
  const searchInput = document.getElementById('dirSearchInput');
  const filterPills = document.getElementById('filterPills');

  let currentCategory = 'all';
  let currentSearch = '';

  async function fetchAndRender(){
    try {
      grid.innerHTML = '<div style="color:var(--muted); padding:20px;">Loading directory items...</div>';
      const res = await fetch(`/api/rules?category=${encodeURIComponent(currentCategory)}&search=${encodeURIComponent(currentSearch)}`);
      const data = await res.json();
      const rules = data.rules || [];

      if(rules.length === 0){
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color:var(--muted); padding:30px;">No items match your search.</div>';
        return;
      }

      grid.innerHTML = rules.map((rule, idx) => {
        const style = BIN_STYLES[rule.category] || BIN_STYLES.dry;
        const staggerClass = `stagger-${(idx % 6) + 1}`;
        return `
          <div class="directory-card card-tilt reveal-fly-up is-visible ${staggerClass}">
            <div class="card-head">
              <span class="bin-tag" style="background:${style.bg}">${style.label}</span>
            </div>
            <h4>${escapeHtml(rule.bin_name)}</h4>
            <p class="guidance-text">${escapeHtml(rule.guidance)}</p>
            <div class="keywords-list">
              ${rule.keywords.slice(0, 5).map(k => `<span class="keyword-badge">${escapeHtml(k)}</span>`).join('')}
            </div>
          </div>
        `;
      }).join('');
    } catch(err) {
      grid.innerHTML = `<div style="color:var(--hazard);">Failed to load directory: ${err.message}</div>`;
    }
  }

  filterPills.addEventListener('click', (e) => {
    if(e.target.classList.contains('pill-btn')){
      filterPills.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.getAttribute('data-category');
      fetchAndRender();
    }
  });

  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    fetchAndRender();
  });

  fetchAndRender();
}

// ---------- Tab 4: Eco-Quiz & Badges ----------
window.hasLoadedQuiz = false;
async function loadQuiz(){
  window.hasLoadedQuiz = true;
  const questionText = document.getElementById('quizQuestionText');
  const optionsContainer = document.getElementById('quizOptionsContainer');
  const explanationBox = document.getElementById('quizExplanation');
  const nextBtn = document.getElementById('nextQuestionBtn');
  const progressFill = document.getElementById('quizProgressFill');
  const roundIndicator = document.getElementById('quizRoundIndicator');
  const scoreCounter = document.getElementById('quizScoreCounter');

  let questions = [];
  let currentIndex = 0;
  let score = 0;

  try {
    const res = await fetch('/api/quiz');
    const data = await res.json();
    questions = data.questions || [];
  } catch(e) {
    questions = [
      {
        question: "Where should a greasy pizza box base go?",
        options: [
          { text: "Dry / Blue Recycling Bin", isCorrect: false },
          { text: "Wet / Organic Bin (Greasy part cannot be recycled)", isCorrect: true },
          { text: "Hazardous Waste", isCorrect: false }
        ],
        explanation: "Food oil and grease ruin cardboard recycling fibers. Tear off the clean lid for recycling, and compost the greasy base!"
      }
    ];
  }

  function renderCurrentQuestion(){
    if (currentIndex >= questions.length) {
      // Quiz Complete
      questionText.textContent = `🎉 Quiz Completed! You scored ${score} out of ${questions.length}!`;
      optionsContainer.innerHTML = '';
      explanationBox.className = 'quiz-explanation active';
      explanationBox.innerHTML = `Awesome job taking responsibility for our planet (SDG 12)! Share your score and keep your daily sorting streak going!`;
      nextBtn.style.display = 'block';
      nextBtn.textContent = '🔄 Retake Quiz';
      nextBtn.onclick = () => {
        currentIndex = 0;
        score = 0;
        nextBtn.textContent = 'Next Question →';
        renderCurrentQuestion();
      };

      // Unlock badges based on score
      if (score >= 3) document.getElementById('badgeCompost')?.classList.add('unlocked');
      if (score >= 4) document.getElementById('badgeHazard')?.classList.add('unlocked');
      if (score === questions.length) document.getElementById('badgeZeroWaste')?.classList.add('unlocked');
      return;
    }

    const q = questions[currentIndex];
    roundIndicator.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
    scoreCounter.textContent = `Score: ${score} / ${questions.length}`;
    progressFill.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;

    questionText.textContent = q.question;
    explanationBox.className = 'quiz-explanation';
    explanationBox.innerHTML = '';
    nextBtn.style.display = 'none';

    optionsContainer.innerHTML = q.options.map((opt, idx) => `
      <button class="quiz-option-btn" data-correct="${opt.isCorrect}" data-index="${idx}">
        ${escapeHtml(opt.text)}
      </button>
    `).join('');

    optionsContainer.querySelectorAll('.quiz-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.getAttribute('data-correct') === 'true';
        optionsContainer.querySelectorAll('.quiz-option-btn').forEach(b => {
          b.disabled = true;
          if(b.getAttribute('data-correct') === 'true'){
            b.classList.add('correct');
          }
        });

        if (isCorrect) {
          score++;
          scoreCounter.textContent = `Score: ${score} / ${questions.length}`;
          window.playChime?.('success');
          window.fireConfetti?.();
        } else {
          btn.classList.add('incorrect');
          window.playChime?.('error');
        }

        explanationBox.innerHTML = `<b>${isCorrect ? '✅ Correct!' : '❌ Not quite.'}</b> ${escapeHtml(q.explanation)}`;
        explanationBox.classList.add('active');
        nextBtn.style.display = 'block';
      });
    });
  }

  nextBtn.onclick = () => {
    currentIndex++;
    renderCurrentQuestion();
  };

  renderCurrentQuestion();
}
