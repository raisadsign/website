<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Expense &amp; Budget Visualizer</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>

<!-- ── Header ── -->
<header>
  <h1>Expense &amp; Budget Visualizer</h1>
  <button id="themeToggle">🌙 Dark Mode</button>
</header>

<div class="container">

  <!-- ── Total Balance ── -->
  <div class="card balance-card">
    <div class="balance-label">Total Balance</div>
    <div class="balance-amount" id="balance">$0.00</div>
  </div>

  <!-- ── Add Transaction Form ── -->
  <div class="card">
    <h2>Add Transaction</h2>

    <div class="form-group">
      <label for="itemName">Item Name</label>
      <input id="itemName" type="text" placeholder="e.g. Cilok" maxlength="60" />
      <div class="field-error" id="errName">Please enter an item name.</div>
    </div>

    <div class="form-group">
      <label for="amount">Amount</label>
      <input id="amount" type="number" placeholder="e.g. 14.94" min="0.01" step="0.01" />
      <div class="field-error" id="errAmount">Please enter a valid amount greater than 0.</div>
    </div>

    <div class="form-group">
      <label for="category">Category</label>
      <select id="category"></select>
      <div class="field-error" id="errCat">Please select a category.</div>

      <!-- Optional Challenge 1: Custom Categories -->
      <div class="custom-cat-row">
        <input id="newCatInput" type="text" placeholder="Add custom category…" maxlength="30" />
        <button id="addCatBtn">+ Add</button>
      </div>
    </div>

    <button id="addBtn">Add Transaction</button>
  </div>

  <!-- ── Transactions + Chart ── -->
  <div class="bottom-grid">

    <!-- Transactions list -->
    <div class="card">
      <div class="tx-header">
        <h2>Transactions</h2>
        <!-- Optional Challenge 2: Sort -->
        <select class="sort-select" id="sortSelect">
          <option value="date">Latest first</option>
          <option value="amount-desc">Amount ↓</option>
          <option value="amount-asc">Amount ↑</option>
          <option value="category">Category A–Z</option>
        </select>
      </div>
      <div class="tx-list" id="txList"></div>

      <!-- Optional Challenge 4: Spending limit -->
      <div class="limit-row">
        <label for="limitInput">⚠ Highlight over $</label>
        <input id="limitInput" type="number" placeholder="e.g. 20" min="0" step="0.01" />
      </div>
    </div>

    <!-- Pie chart -->
    <div class="card chart-card">
      <h2>Spending by Category</h2>
      <div class="chart-wrapper">
        <canvas id="spendingChart"></canvas>
      </div>
    </div>

  </div>

  <!-- Optional Challenge 5: Monthly Summary -->
  <div class="card summary-card">
    <h2>Monthly Summary</h2>
    <div class="month-select-row">
      <select id="monthSelect"></select>
      <select id="yearSelect"></select>
    </div>
    <div class="summary-grid" id="summaryGrid"></div>
  </div>

</div><!-- /container -->

<!-- Toast notification -->
<div id="toast"></div>

<!-- Chart.js CDN -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<!-- App logic -->
<script src="js/app.js"></script>
</body>
</html>
