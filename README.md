# Expense & Budget Visualizer

A mobile-friendly web app to track daily spending — built with plain HTML, CSS, and Vanilla JavaScript.

## Features

### Required (MVP)
- **Input Form** — Item Name, Amount, Category (Food, Transport, Fun) with full validation
- **Transaction List** — scrollable list with name, amount, category, and delete button
- **Total Balance** — auto-updates on every add/delete
- **Pie Chart** — spending distribution by category (Chart.js), updates automatically

### Optional Challenges (5/5 implemented)
1. ✅ **Custom Categories** — add your own categories beyond Food/Transport/Fun
2. ✅ **Monthly Summary View** — totals, transaction count, average, and top category per month
3. ✅ **Sort Transactions** — sort by latest, amount (high→low / low→high), or category A–Z
4. ✅ **Highlight Over Limit** — flag transactions that exceed a custom spending limit
5. ✅ **Dark / Light Mode Toggle** — persisted across sessions

## Tech Stack
- HTML5
- CSS3 (CSS Variables, responsive grid)
- Vanilla JavaScript (ES6+)
- [Chart.js 4](https://www.chartjs.org/) for the pie chart
- Browser `localStorage` for persistence

## Project Structure
```
website/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
└── README.md
```

## Running Locally
Open `index.html` directly in any modern browser — no server needed.

## Deployment
Published via GitHub Pages.
