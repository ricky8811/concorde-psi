/* ═══════════════════════════════════════════════════════════════
   js/app.js — utility functions + app init
═══════════════════════════════════════════════════════════════ */

// ── SHOW / HIDE ───────────────────────────────────────────────
// Always use inline styles — never rely on CSS class alone

function show(id) {
  const el = document.getElementById(id);
  if (el) { el.style.display = ''; el.classList.remove('hidden'); }
}

function hide(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function showBlock(id) {
  const el = document.getElementById(id);
  if (el) { el.style.display = 'block'; el.classList.remove('hidden'); }
}

function showFlex(id) {
  const el = document.getElementById(id);
  if (el) { el.style.display = 'flex'; el.classList.remove('hidden'); }
}


// ── TOAST ─────────────────────────────────────────────────────

function toast(msg, dur) {
  dur = dur || 2800;
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(function() { t.classList.remove('show'); }, dur);
}


// ── DATE / TIME FORMATTING ────────────────────────────────────

function fmtDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return d.getDate() + ' ' + months[d.getMonth()] + ' · ' + d.toTimeString().slice(0, 5);
}

function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + mm + '-' + dd;
}

function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

function nowDateTimeLocal() {
  const d = new Date();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  const hh   = String(d.getHours()).padStart(2, '0');
  const min  = String(d.getMinutes()).padStart(2, '0');
  return d.getFullYear() + '-' + mm + '-' + dd + 'T' + hh + ':' + min;
}

function fmtDisplayDate(isoDate) {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length < 3) return isoDate;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return parseInt(parts[2]) + ' ' + months[parseInt(parts[1]) - 1] + ' ' + parts[0];
}


// ── ID GENERATION ─────────────────────────────────────────────

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}


// ── INITIALS from name ─────────────────────────────────────────

function initials(name) {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}


// ── ONLINE / OFFLINE BAR ──────────────────────────────────────

function updateOnline() {
  const bar = document.getElementById('offlineBar');
  if (!bar) return;
  bar.style.display = navigator.onLine ? 'none' : 'block';
}

window.addEventListener('online',  updateOnline);
window.addEventListener('offline', updateOnline);


// ── GLOBAL ERROR CATCHING ─────────────────────────────────────

window.addEventListener('error', function(e) {
  console.error('[PSI error]', e.message, e.filename, e.lineno);
});

window.addEventListener('unhandledrejection', function(e) {
  console.error('[PSI promise]', e.reason);
});


// ── HEADER DATELINE ───────────────────────────────────────────

function updateDateline() {
  const hdDate  = document.getElementById('hdDate');
  const hdShift = document.getElementById('hdShift');

  if (hdDate) {
    const d = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    hdDate.textContent = days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  if (hdShift) {
    hdShift.textContent = (typeof formatShiftStatus === 'function')
      ? formatShiftStatus()
      : (lsGet(SHIFT_KEY) ? 'Shift · ' + lsGet(SHIFT_KEY) : '');
  }
}


// ── BACKGROUND POLL (refresh dash every 8s when idle) ─────────

function startPoll() {
  setInterval(function() {
    if (me && !me.activePSI) {
      updateDateline();
    }
  }, 8000);
}


// ── INIT ──────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {

  updateOnline();

  // Apply any saved trigger word overrides to built-in templates
  if (typeof applyTriggerOverrides === 'function') applyTriggerOverrides();

  // Prime worker name cache from Google Sheets (fire-and-forget)
  if (typeof sheetsFetchWorkers === 'function') sheetsFetchWorkers();

  // Try to restore session
  const sess = loadSession();
  if (sess) {
    me.name = sess.name;
    me.role = sess.role;
    openDash();
  } else {
    // Ensure login is visible with full opacity
    const ls = document.getElementById('loginScreen');
    if (ls) { ls.style.display = 'flex'; ls.style.opacity = '1'; }
    setRole('worker');
  }

  // Wire Enter key on crew inputs
  const elecIn = document.getElementById('elecIn');
  if (elecIn) {
    elecIn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') crewAdd('elec');
    });
  }

  const millIn = document.getElementById('millIn');
  if (millIn) {
    millIn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') crewAdd('mill');
    });
  }

  // Wire Enter key on name input in login
  const nameInput = document.getElementById('nameInput');
  if (nameInput) {
    nameInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') lsConfirm();
    });
  }

});
