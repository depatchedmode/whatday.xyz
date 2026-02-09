import { DAYS, RECKONING_END_DATE } from './reckoning-config.js';

function fmt(n) {
  return n.toLocaleString('en-US');
}

function pct(burned, total) {
  if (!total) return '—';
  return (burned / total * 100).toFixed(2) + '%';
}

// Find the leading day (most burned)
function getLeader() {
  return DAYS.reduce((a, b) => b.burned > a.burned ? b : a);
}

function renderBurnLeaderboard() {
  const tbody = document.getElementById('burnTable');
  const leader = getLeader();
  const sorted = [...DAYS].sort((a, b) => b.burned - a.burned);

  tbody.innerHTML = sorted.map(d => {
    const isLeader = d === leader && d.burned > 0;
    const bar = d.burned / leader.burned * 100;
    return `<tr class="${isLeader ? 'winner-row' : ''}">
      <td><span class="ticker">${d.ticker}</span> <span class="name">${d.name}</span></td>
      <td class="burn-cell">
        <div class="burn-bar-wrap"><div class="burn-bar" style="width:${bar}%"></div></div>
        <span>${d.burned ? fmt(d.burned) : '—'}</span>
      </td>
      <td>${pct(d.burned, d.totalSupply)}</td>
      <td>${d.kingBurner}</td>
      <td>${d.uniqueBurners || '—'}</td>
      <td>${isLeader ? '👑' : ''}</td>
    </tr>`;
  }).join('');
}

function renderHoldStandings() {
  const tbody = document.getElementById('holdTable');
  const sorted = [...DAYS].sort((a, b) => b.holders - a.holders);

  tbody.innerHTML = sorted.map(d => `<tr>
    <td><span class="ticker">${d.ticker}</span> <span class="name">${d.name}</span></td>
    <td>${d.holders ? fmt(d.holders) : '—'}</td>
    <td>${d.topHolder}</td>
  </tr>`).join('');
}

function renderWinningDay() {
  const leader = getLeader();
  document.getElementById('winningDay').textContent = leader.burned > 0 ? leader.name.toUpperCase() : '—';
  document.getElementById('winningTicker').textContent = leader.burned > 0 ? `$${leader.ticker} LEADING WITH ${fmt(leader.burned)} BURNED` : 'NO BURNS YET';
}

function updateCountdown() {
  const end = new Date(RECKONING_END_DATE).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) {
    document.getElementById('countdown').textContent = 'THE RECKONING HAS ENDED';
    return;
  }

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  document.getElementById('countdown').textContent =
    `${String(d).padStart(2,'0')}D ${String(h).padStart(2,'0')}H ${String(m).padStart(2,'0')}M ${String(s).padStart(2,'0')}S`;
}

function updateClock() {
  const now = new Date();
  const ts = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  const el = document.getElementById('clock');
  if (el) el.textContent = ts;
  const st = document.getElementById('statusTime');
  if (st) st.textContent = ts;
}

// Init
renderBurnLeaderboard();
renderHoldStandings();
renderWinningDay();
updateCountdown();
updateClock();
setInterval(updateCountdown, 1000);
setInterval(updateClock, 1000);
