/** Pre-built templates that ship with the app */

export interface SeedTemplate {
  id: string;
  name: string;
  description: string;
  html: string;
  data_description: string;
  created_at: string;
  version: number;
}

const weatherHtml = `<style>
.weather-card {
  font-family: var(--font-sans);
  max-width: 380px;
  border-radius: var(--border-radius-xl);
  background: var(--color-background-secondary);
  border: 0.5px solid var(--color-border-tertiary);
  padding: 24px;
}
.weather-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.weather-city { font-size: 18px; font-weight: 600; color: var(--color-text-primary); }
.weather-date { font-size: 12px; color: var(--color-text-tertiary); margin-top: 2px; }
.weather-badge {
  font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 999px;
  background: var(--color-background-info); color: var(--color-text-info);
}
.weather-temp { font-size: 48px; font-weight: 700; color: var(--color-text-primary); line-height: 1; }
.weather-desc { font-size: 14px; color: var(--color-text-secondary); margin-top: 4px; }
.weather-details {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  margin-top: 20px; padding-top: 16px;
  border-top: 0.5px solid var(--color-border-tertiary);
}
.weather-detail-label { font-size: 11px; color: var(--color-text-tertiary); }
.weather-detail-value { font-size: 14px; font-weight: 600; color: var(--color-text-primary); margin-top: 2px; }
</style>
<div class="weather-card">
  <div class="weather-header">
    <div>
      <div class="weather-city">New York, NY</div>
      <div class="weather-date">Tuesday, March 25, 2026</div>
    </div>
    <span class="weather-badge">Partly Cloudy</span>
  </div>
  <div class="weather-temp">72°F</div>
  <div class="weather-desc">Partly cloudy with a gentle breeze from the southwest</div>
  <div class="weather-details">
    <div>
      <div class="weather-detail-label">Humidity</div>
      <div class="weather-detail-value">54%</div>
    </div>
    <div>
      <div class="weather-detail-label">Wind</div>
      <div class="weather-detail-value">8 mph SW</div>
    </div>
    <div>
      <div class="weather-detail-label">UV Index</div>
      <div class="weather-detail-value">5 (Moderate)</div>
    </div>
  </div>
</div>`;

const invoiceHtml = `<style>
.invoice-card {
  font-family: var(--font-sans);
  max-width: 420px;
  border-radius: var(--border-radius-xl);
  background: var(--color-background-secondary);
  border: 0.5px solid var(--color-border-tertiary);
  padding: 24px;
}
.invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.invoice-title { font-size: 18px; font-weight: 600; color: var(--color-text-primary); }
.invoice-subtitle { font-size: 12px; color: var(--color-text-tertiary); margin-top: 2px; }
.invoice-badge {
  font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 999px;
  background: var(--color-background-warning); color: var(--color-text-warning);
}
.invoice-amount { font-size: 36px; font-weight: 700; color: var(--color-text-primary); margin: 12px 0 4px; }
.invoice-for { font-size: 13px; color: var(--color-text-secondary); }
.invoice-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  margin-top: 16px; padding-top: 16px;
  border-top: 0.5px solid var(--color-border-tertiary);
}
.invoice-label { font-size: 11px; color: var(--color-text-tertiary); }
.invoice-value { font-size: 14px; font-weight: 500; color: var(--color-text-primary); margin-top: 2px; }
.invoice-actions { display: flex; gap: 8px; margin-top: 20px; }
.invoice-actions button {
  flex: none; font-size: 13px; padding: 8px 18px;
  border-radius: var(--border-radius-md);
}
</style>
<div class="invoice-card">
  <div class="invoice-header">
    <div>
      <div class="invoice-title">Monthly invoice</div>
      <div class="invoice-subtitle">Starter card for a recurring client billing cycle</div>
    </div>
    <span class="invoice-badge">Draft</span>
  </div>
  <div class="invoice-amount">$2,500</div>
  <div class="invoice-for">For product design retainer and monthly support</div>
  <div class="invoice-grid">
    <div>
      <div class="invoice-label">Client</div>
      <div class="invoice-value">Northwind Labs</div>
    </div>
    <div>
      <div class="invoice-label">Billing month</div>
      <div class="invoice-value">March 2026</div>
    </div>
    <div>
      <div class="invoice-label">Invoice number</div>
      <div class="invoice-value">INV-3201</div>
    </div>
    <div>
      <div class="invoice-label">Due date</div>
      <div class="invoice-value">Apr 5, 2026</div>
    </div>
  </div>
  <div class="invoice-actions">
    <button onclick="sendPrompt('Send this invoice')">Send invoice</button>
    <button onclick="sendPrompt('Expand to full invoice')">Expand to full invoice ↗</button>
  </div>
</div>`;

const calculatorHtml = `<style>
.calc {
  font-family: var(--font-sans);
  max-width: 320px;
  border-radius: var(--border-radius-xl);
  background: var(--color-background-secondary);
  border: 0.5px solid var(--color-border-tertiary);
  overflow: hidden;
}
.calc-display {
  padding: 20px 24px 12px;
  text-align: right;
}
.calc-expression { font-size: 13px; color: var(--color-text-tertiary); min-height: 18px; }
.calc-result { font-size: 36px; font-weight: 700; color: var(--color-text-primary); line-height: 1.2; }
.calc-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
  background: var(--color-border-tertiary);
  border-top: 0.5px solid var(--color-border-tertiary);
}
.calc-btn {
  padding: 16px; font-size: 16px; font-weight: 500;
  border: none; border-radius: 0; cursor: pointer;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  transition: background 0.1s;
}
.calc-btn:hover { background: var(--color-background-tertiary); }
.calc-btn.op { color: var(--color-text-info); font-weight: 600; }
.calc-btn.eq {
  background: var(--color-background-info); color: var(--color-text-info); font-weight: 600;
}
.calc-btn.eq:hover { opacity: 0.85; }
.calc-btn.wide { grid-column: span 2; }
</style>
<div class="calc">
  <div class="calc-display">
    <div class="calc-expression" id="expr"></div>
    <div class="calc-result" id="result">0</div>
  </div>
  <div class="calc-grid">
    <button class="calc-btn" onclick="clearCalc()">C</button>
    <button class="calc-btn op" onclick="inputOp('(')">(</button>
    <button class="calc-btn op" onclick="inputOp(')')">)</button>
    <button class="calc-btn op" onclick="inputOp('/')">÷</button>
    <button class="calc-btn" onclick="inputNum('7')">7</button>
    <button class="calc-btn" onclick="inputNum('8')">8</button>
    <button class="calc-btn" onclick="inputNum('9')">9</button>
    <button class="calc-btn op" onclick="inputOp('*')">×</button>
    <button class="calc-btn" onclick="inputNum('4')">4</button>
    <button class="calc-btn" onclick="inputNum('5')">5</button>
    <button class="calc-btn" onclick="inputNum('6')">6</button>
    <button class="calc-btn op" onclick="inputOp('-')">−</button>
    <button class="calc-btn" onclick="inputNum('1')">1</button>
    <button class="calc-btn" onclick="inputNum('2')">2</button>
    <button class="calc-btn" onclick="inputNum('3')">3</button>
    <button class="calc-btn op" onclick="inputOp('+')">+</button>
    <button class="calc-btn wide" onclick="inputNum('0')">0</button>
    <button class="calc-btn" onclick="inputNum('.')">.</button>
    <button class="calc-btn eq" onclick="calc()">=</button>
  </div>
</div>
<script>
var expression = '';
function inputNum(n) { expression += n; update(); }
function inputOp(o) { expression += o; update(); }
function clearCalc() { expression = ''; document.getElementById('expr').textContent = ''; document.getElementById('result').textContent = '0'; }
function update() { document.getElementById('expr').textContent = expression; }
function calc() {
  try {
    var r = Function('"use strict"; return (' + expression + ')')();
    document.getElementById('result').textContent = Number.isFinite(r) ? parseFloat(r.toFixed(8)).toString() : 'Error';
  } catch(e) { document.getElementById('result').textContent = 'Error'; }
}
</script>`;

export const SEED_TEMPLATES: SeedTemplate[] = [
  {
    id: "seed-weather-001",
    name: "Weather",
    description: "Current weather conditions card with temperature, humidity, wind, and UV index",
    html: weatherHtml,
    data_description: "City name, date, temperature, condition, humidity, wind speed/direction, UV index",
    created_at: "2026-01-01T00:00:00.000Z",
    version: 1,
  },
  {
    id: "seed-invoice-001",
    name: "Invoice Card",
    description: "Compact invoice card with amount, client info, and action buttons",
    html: invoiceHtml,
    data_description: "Title, amount, description, client name, billing month, invoice number, due date",
    created_at: "2026-01-01T00:00:01.000Z",
    version: 1,
  },
  {
    id: "seed-calculator-001",
    name: "Calculator",
    description: "Interactive calculator with basic arithmetic operations",
    html: calculatorHtml,
    data_description: "N/A — interactive widget, no data substitution needed",
    created_at: "2026-01-01T00:00:02.000Z",
    version: 1,
  },
];
