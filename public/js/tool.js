const form = document.getElementById('sortForm');
const input = document.getElementById('itemInput');
const submitBtn = document.getElementById('submitBtn');
const loadingState = document.getElementById('loadingState');
const errorBox = document.getElementById('errorBox');
const resultsEl = document.getElementById('results');
const chips = document.getElementById('chips');

const BIN_STYLES = {
  wet: { color: '#4C7A3D', label: 'Wet / Organic' },
  dry: { color: '#2E5C8A', label: 'Dry / Recyclable' },
  hazardous: { color: '#A5462C', label: 'Hazardous' },
  ewaste: { color: '#55507A', label: 'E-Waste' },
};

function autoResize(){
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 140) + 'px';
}
input.addEventListener('input', autoResize);

chips.addEventListener('click', (e) => {
  if(e.target.classList.contains('chip')){
    input.value = e.target.textContent;
    autoResize();
    input.focus();
  }
});

function setLoading(isLoading){
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? 'Sorting…' : 'Sort it';
  loadingState.classList.toggle('active', isLoading);
}

function showError(msg){
  errorBox.textContent = msg;
  errorBox.classList.add('active');
}
function clearError(){
  errorBox.classList.remove('active');
}

function renderResult(query, data){
  const style = BIN_STYLES[data.category] || BIN_STYLES.dry;
  const card = document.createElement('div');
  card.className = 'result-card';
  card.innerHTML = `
    <div class="query">You asked about: <b>${escapeHtml(query)}</b></div>
    <div class="bin-row">
      <span class="bin-dot" style="background:${style.color}"></span>
      <span class="bin-name">${escapeHtml(data.bin_name || style.label)}</span>
      <span class="bin-tag">${style.label}</span>
    </div>
    <p class="reason">${escapeHtml(data.reasoning)}</p>
    <p class="tip"><b>Habit:</b> ${escapeHtml(data.tip)}</p>
  `;
  resultsEl.prepend(card);
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

async function classifyItem(text){
  const response = await fetch('/api/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item: text }),
  });

  // Guard against non-JSON responses (e.g. a 404/500 HTML page from a host
  // with no backend running, or a proxy error page). Without this check,
  // calling response.json() on an HTML body throws a confusing
  // "Unexpected token '<'..." style error instead of a clear message.
  const contentType = response.headers.get('content-type') || '';
  if(!contentType.includes('application/json')){
    const bodyPreview = (await response.text()).slice(0, 60);
    throw new Error(
      `The server didn't return JSON (got: "${bodyPreview}..."). ` +
      `This usually means the Express backend isn't running behind this page — ` +
      `run "npm start" and open it via http://localhost:3000, or check your deployment's server logs.`
    );
  }

  const data = await response.json();
  if(!response.ok){
    throw new Error(data.error || `Server error (${response.status})`);
  }
  return data.result;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if(!text) return;

  clearError();
  setLoading(true);

  try{
    const result = await classifyItem(text);
    renderResult(text, result);
    input.value = '';
    autoResize();
  }catch(err){
    showError("Couldn't sort that one — " + err.message);
  }finally{
    setLoading(false);
  }
});
