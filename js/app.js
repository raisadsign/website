/* ═══════════════════════════════════════════════════════════
   Expense & Budget Visualizer — app.js
   Optional challenges implemented:
     ✅ 1. Custom categories
     ✅ 2. Sort transactions (amount / category)
     ✅ 3. Dark / light mode toggle
     ✅ 4. Highlight spending over limit
     ✅ 5. Monthly summary view
   ═══════════════════════════════════════════════════════════ */

/* ── Storage keys ──────────────────────────────────────────── */
const TX_KEY      = 'ebv_transactions';
const CAT_KEY     = 'ebv_categories';
const THEME_KEY   = 'ebv_theme';
const LIMIT_KEY   = 'ebv_limit';

/* ── State ─────────────────────────────────────────────────── */
let transactions = JSON.parse(localStorage.getItem(TX_KEY)  || '[]');
let categories   = JSON.parse(localStorage.getItem(CAT_KEY) || '["Food","Transport","Fun"]');
let spendingLimit = parseFloat(localStorage.getItem(LIMIT_KEY)) || 0;
let sortMode     = 'date';   // 'date' | 'amount-desc' | 'amount-asc' | 'category'
let chartInstance = null;

/* ── Category colours map ──────────────────────────────────── */
const BASE_COLOURS = {
  Food:      '#2ecc71',
  Transport: '#3498db',
  Fun:       '#e67e22',
};
const PALETTE = [
  '#9b59b6','#1abc9c','#e74c3c','#f39c12','#34495e',
  '#16a085','#8e44ad','#d35400','#2980b9','#27ae60',
];

function getCatColour(cat) {
  if (BASE_COLOURS[cat]) return BASE_COLOURS[cat];
  const idx = categories.indexOf(cat);
  return PALETTE[idx % PALETTE.length];
}

/* ── Save helpers ──────────────────────────────────────────── */
function saveTx()   { localStorage.setItem(TX_KEY,    JSON.stringify(transactions)); }
function saveCats() { localStorage.setItem(CAT_KEY,   JSON.stringify(categories));  }

/* ── DOM refs ──────────────────────────────────────────────── */
const itemNameInput    = document.getElementById('itemName');
const amountInput      = document.getElementById('amount');
const categorySelect   = document.getElementById('category');
const newCatInput      = document.getElementById('newCatInput');
const addCatBtn        = document.getElementById('addCatBtn');
const addBtn           = document.getElementById('addBtn');
const txList           = document.getElementById('txList');
const balanceEl        = document.getElementById('balance');
const themeToggle      = document.getElementById('themeToggle');
const sortSelect       = document.getElementById('sortSelect');
const limitInput       = document.getElementById('limitInput');
const monthSelect      = document.getElementById('monthSelect');
const yearSelect       = document.getElementById('yearSelect');
const summaryGrid      = document.getElementById('summaryGrid');

/* ── Validation error refs ─────────────────────────────────── */
const errName   = document.getElementById('errName');
const errAmount = document.getElementById('errAmount');
const errCat    = document.getElementById('errCat');

/* ══════════════════════════════════════════════════════════════
   THEME
══════════════════════════════════════════════════════════════ */
function applyTheme(dark) {
  document.body.classList.toggle('dark', dark);
  themeToggle.textContent = dark ? '☀️ Light Mode' : '🌙 Dark Mode';
  localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
}

themeToggle.addEventListener('click', () => {
  applyTheme(!document.body.classList.contains('dark'));
});

/* ══════════════════════════════════════════════════════════════
   CATEGORIES
══════════════════════════════════════════════════════════════ */
function buildCategoryOptions() {
  categorySelect.innerHTML = '';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
}

addCatBtn.addEventListener('click', () => {
  const name = newCatInput.value.trim();
  if (!name) return;
  if (categories.map(c => c.toLowerCase()).includes(name.toLowerCase())) {
    toast('Category already exists', '⚠️');
    return;
  }
  categories.push(name);
  saveCats();
  buildCategoryOptions();
  categorySelect.value = name;
  newCatInput.value = '';
  toast(`Category "${name}" added`, '✅');
  updateChart();
});

/* ══════════════════════════════════════════════════════════════
   ADD TRANSACTION
══════════════════════════════════════════════════════════════ */
addBtn.addEventListener('click', addTransaction);
[itemNameInput, amountInput, categorySelect].forEach(el => {
  el.addEventListener('keydown', e => { if (e.key === 'Enter') addTransaction(); });
});

function addTransaction() {
  const name   = itemNameInput.value.trim();
  const amt    = parseFloat(amountInput.value);
  const cat    = categorySelect.value;
  let valid    = true;

  // validation
  errName.classList.toggle('show', !name);
  errAmount.classList.toggle('show', !amountInput.value || isNaN(amt) || amt <= 0);
  errCat.classList.toggle('show', !cat);
  if (!name || isNaN(amt) || amt <= 0 || !cat) return;

  const tx = {
    id:   Date.now(),
    name,
    amount: amt,
    category: cat,
    date: new Date().toISOString(),
  };

  transactions.unshift(tx);
  saveTx();

  itemNameInput.value = '';
  amountInput.value   = '';
  categorySelect.selectedIndex = 0;

  renderAll();
  toast('Transaction added!', '🧾');
}

/* ══════════════════════════════════════════════════════════════
   DELETE TRANSACTION
══════════════════════════════════════════════════════════════ */
function deleteTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  saveTx();
  renderAll();
  toast('Transaction deleted', '🗑️');
}

/* ══════════════════════════════════════════════════════════════
   SORT
══════════════════════════════════════════════════════════════ */
sortSelect.addEventListener('change', () => {
  sortMode = sortSelect.value;
  renderTxList();
});

function getSorted(list) {
  const copy = [...list];
  if (sortMode === 'amount-desc') return copy.sort((a, b) => b.amount - a.amount);
  if (sortMode === 'amount-asc')  return copy.sort((a, b) => a.amount - b.amount);
  if (sortMode === 'category')    return copy.sort((a, b) => a.category.localeCompare(b.category));
  return copy; // 'date' — already newest first
}

/* ══════════════════════════════════════════════════════════════
   SPENDING LIMIT
══════════════════════════════════════════════════════════════ */
limitInput.addEventListener('change', () => {
  spendingLimit = parseFloat(limitInput.value) || 0;
  localStorage.setItem(LIMIT_KEY, spendingLimit);
  renderTxList();
});

/* ══════════════════════════════════════════════════════════════
   BALANCE
══════════════════════════════════════════════════════════════ */
function updateBalance() {
  const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  balanceEl.textContent = `$${total.toFixed(2)}`;
  balanceEl.classList.toggle('negative', total < 0);
}

/* ══════════════════════════════════════════════════════════════
   TRANSACTION LIST
══════════════════════════════════════════════════════════════ */
function renderTxList() {
  if (transactions.length === 0) {
    txList.innerHTML = '<div class="tx-empty">No transactions yet.<br>Add one above!</div>';
    return;
  }

  const sorted = getSorted(transactions);
  txList.innerHTML = sorted.map(tx => {
    const colour   = getCatColour(tx.category);
    const overLimit = spendingLimit > 0 && tx.amount > spendingLimit;
    return `
    <div class="tx-item ${overLimit ? 'over-limit' : ''}">
      <div class="cat-dot" style="background:${colour}"></div>
      <div class="tx-info">
        <div class="tx-name">${escHtml(tx.name)}</div>
        <div class="tx-meta">
          <span class="tx-amount">$${tx.amount.toFixed(2)}</span>
          <span class="tx-cat">${escHtml(tx.category)}</span>
          ${overLimit ? '<span class="limit-warn">⚠ over limit</span>' : ''}
        </div>
      </div>
      <button class="delete-btn" onclick="deleteTransaction(${tx.id})">Delete</button>
    </div>`;
  }).join('');
}

/* ══════════════════════════════════════════════════════════════
   PIE CHART
══════════════════════════════════════════════════════════════ */
function updateChart() {
  const totals = {};
  transactions.forEach(tx => {
    totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
  });

  const labels = Object.keys(totals);
  const data   = Object.values(totals);
  const colours = labels.map(l => getCatColour(l));

  const ctx = document.getElementById('spendingChart').getContext('2d');

  if (chartInstance) chartInstance.destroy();

  if (labels.length === 0) {
    // show placeholder
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    chartInstance = null;
    return;
  }

  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{ data, backgroundColor: colours, borderWidth: 2, borderColor: 'transparent' }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: getComputedStyle(document.body).getPropertyValue('--text').trim() || '#1a1e2e',
            font: { size: 12, weight: '600' },
            padding: 14,
          },
        },
        tooltip: {
          callbacks: {
            label: ctx => ` $${ctx.parsed.toFixed(2)} (${Math.round(ctx.parsed / ctx.dataset.data.reduce((a, b) => a + b, 0) * 100)}%)`,
          },
        },
      },
    },
  });
}

/* ══════════════════════════════════════════════════════════════
   MONTHLY SUMMARY
══════════════════════════════════════════════════════════════ */
function buildMonthYearOptions() {
  const now = new Date();
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];

  monthSelect.innerHTML = months.map((m, i) =>
    `<option value="${i}" ${i === now.getMonth() ? 'selected' : ''}>${m}</option>`
  ).join('');

  // populate years from transactions + current year
  const years = new Set([now.getFullYear()]);
  transactions.forEach(tx => years.add(new Date(tx.date).getFullYear()));
  const sortedYears = [...years].sort((a, b) => b - a);
  yearSelect.innerHTML = sortedYears.map(y =>
    `<option value="${y}" ${y === now.getFullYear() ? 'selected' : ''}>${y}</option>`
  ).join('');
}

function renderMonthlySummary() {
  const month = parseInt(monthSelect.value);
  const year  = parseInt(yearSelect.value);

  const filtered = transactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const total = filtered.reduce((s, t) => s + t.amount, 0);
  const count = filtered.length;

  // per-category
  const catTotals = {};
  filtered.forEach(tx => {
    catTotals[tx.category] = (catTotals[tx.category] || 0) + tx.amount;
  });

  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

  summaryGrid.innerHTML = `
    <div class="summary-item">
      <div class="s-num">$${total.toFixed(2)}</div>
      <div class="s-lbl">Total Spent</div>
    </div>
    <div class="summary-item">
      <div class="s-num">${count}</div>
      <div class="s-lbl">Transactions</div>
    </div>
    <div class="summary-item">
      <div class="s-num">${count > 0 ? '$' + (total / count).toFixed(2) : '—'}</div>
      <div class="s-lbl">Avg / Item</div>
    </div>
    <div class="summary-item">
      <div class="s-num" style="font-size:1rem">${topCat ? escHtml(topCat[0]) : '—'}</div>
      <div class="s-lbl">Top Category</div>
    </div>
    ${Object.entries(catTotals).map(([cat, amt]) => `
    <div class="summary-item">
      <div class="s-num" style="color:${getCatColour(cat)}">$${amt.toFixed(2)}</div>
      <div class="s-lbl">${escHtml(cat)}</div>
    </div>`).join('')}
  `;
}

monthSelect.addEventListener('change', renderMonthlySummary);
yearSelect.addEventListener('change',  renderMonthlySummary);

/* ══════════════════════════════════════════════════════════════
   RENDER ALL
══════════════════════════════════════════════════════════════ */
function renderAll() {
  updateBalance();
  renderTxList();
  updateChart();
  buildMonthYearOptions();
  renderMonthlySummary();
}

/* ══════════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════════ */
let toastTimer;
function toast(msg, icon = '✅') {
  const el = document.getElementById('toast');
  el.textContent = `${icon}  ${msg}`;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

/* ══════════════════════════════════════════════════════════════
   ESCAPE HELPERS
══════════════════════════════════════════════════════════════ */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ══════════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════════ */
(function init() {
  // restore theme
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved === 'dark');

  // restore limit
  if (spendingLimit > 0) limitInput.value = spendingLimit;

  // populate categories
  buildCategoryOptions();

  // initial render
  renderAll();
})();
