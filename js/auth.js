/* ═══════════════════════════════════════════════════════════════
   js/auth.js — login, PIN pad, session, sign out
═══════════════════════════════════════════════════════════════ */

// ── APP STATE ─────────────────────────────────────────────────
const me = {
  name:      '',
  role:      'worker',
  activePSI: null,
};

// ── PIN STATE ─────────────────────────────────────────────────
let _pinBuffer  = '';
let _pinRole    = 'worker';
let _pinAttempts = 0;
let _pinLocked  = false;
let _pinLockTimer = null;


// ── STEP 1: ROLE SELECTION ────────────────────────────────────

function setRole(r) {
  _pinRole = r;

  const wBtn = document.getElementById('roleWorkerBtn');
  const sBtn = document.getElementById('roleSupervisorBtn');

  if (wBtn) wBtn.classList.toggle('active', r === 'worker');
  if (sBtn) sBtn.classList.toggle('active', r === 'supervisor');
}

function lsNext() {
  // Step 1 → Step 2
  _pinBuffer   = '';
  _pinAttempts = 0;
  _pinLocked   = false;
  buildDots();
  updateDots();

  hide('pinError');
  hide('pinLockMsg');

  hide('ls1');
  const ls2 = document.getElementById('ls2');
  if (ls2) ls2.style.display = 'block';
}

function lsBack() {
  // Could be Step 2 → Step 1, or Step 3 → Step 2
  const ls2 = document.getElementById('ls2');
  const ls3 = document.getElementById('ls3');

  if (ls3 && ls3.style.display !== 'none' && ls3.style.display !== '') {
    ls3.style.display = 'none';
    ls2.style.display = 'block';
  } else {
    hide('ls2');
    show('ls1');
  }

  _pinBuffer = '';
  updateDots();
}


// ── STEP 2: PIN PAD ───────────────────────────────────────────

function buildDots() {
  const container = document.getElementById('pinDots');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const dot = document.createElement('span');
    dot.className = 'pin-dot';
    container.appendChild(dot);
  }
}

function updateDots() {
  const container = document.getElementById('pinDots');
  if (!container) return;
  const dots = container.querySelectorAll('.pin-dot');
  dots.forEach(function(dot, i) {
    dot.classList.toggle('filled', i < _pinBuffer.length);
    dot.classList.remove('error');
  });
}

function pp(digit) {
  if (_pinLocked) return;
  if (_pinBuffer.length >= 4) return;

  _pinBuffer += digit;
  updateDots();

  if (_pinBuffer.length === 4) {
    // Small delay so user sees 4th dot fill before check
    setTimeout(checkPin, 120);
  }
}

function pdel() {
  if (_pinLocked) return;
  _pinBuffer = _pinBuffer.slice(0, -1);
  updateDots();
}

function checkPin() {
  // Supervisor PIN can be changed via Personnel settings; fall back to config default
  const supCfg  = (typeof loadSupervisorConfig === 'function') ? loadSupervisorConfig() : {};
  const correct = _pinRole === 'supervisor'
    ? (supCfg.pin || SUPERVISOR_PIN)
    : WORKER_PIN;

  if (_pinBuffer === correct) {
    // Success — go to step 3
    _pinAttempts = 0;
    hide('pinError');
    hide('pinLockMsg');

    const ls2 = document.getElementById('ls2');
    const ls3 = document.getElementById('ls3');
    if (ls2) ls2.style.display = 'none';
    if (ls3) ls3.style.display = 'block';

    // Populate name picker / pre-fill then focus
    setTimeout(function() {
      if (typeof renderPersonnelPicker === 'function') renderPersonnelPicker();
      const ni = document.getElementById('nameInput');
      if (ni) {
        // Pre-fill supervisor name so they don't have to type it
        if (_pinRole === 'supervisor') {
          const cfg = (typeof loadSupervisorConfig === 'function') ? loadSupervisorConfig() : {};
          ni.value = cfg.name || DEFAULT_SUPERVISOR_NAME;
        }
        ni.focus();
      }
    }, 100);

  } else {
    // Wrong PIN
    _pinAttempts++;
    _pinBuffer = '';
    updateDots();

    // Shake the dots
    const container = document.getElementById('pinDots');
    if (container) {
      container.querySelectorAll('.pin-dot').forEach(function(d) {
        d.classList.add('error');
      });
      container.classList.remove('shake');
      void container.offsetWidth; // reflow to restart animation
      container.classList.add('shake');
      setTimeout(function() {
        container.classList.remove('shake');
        container.querySelectorAll('.pin-dot').forEach(function(d) {
          d.classList.remove('error');
        });
      }, 500);
    }

    const remaining = 3 - _pinAttempts;
    const errEl = document.getElementById('pinError');

    if (_pinAttempts >= 3) {
      // Lock for 60 seconds
      _pinLocked = true;
      if (errEl) errEl.style.display = 'none';
      startLockout(60);
    } else {
      if (errEl) {
        errEl.textContent = 'Incorrect PIN — ' + remaining + ' attempt' + (remaining !== 1 ? 's' : '') + ' remaining';
        errEl.style.display = 'block';
      }
    }
  }
}

function startLockout(seconds) {
  const lockEl = document.getElementById('pinLockMsg');
  if (!lockEl) return;
  lockEl.style.display = 'block';

  let remaining = seconds;

  function tick() {
    lockEl.textContent = '🔒 Too many attempts — try again in ' + remaining + 's';
    if (remaining <= 0) {
      _pinLocked   = false;
      _pinAttempts = 0;
      lockEl.style.display = 'none';
      return;
    }
    remaining--;
    _pinLockTimer = setTimeout(tick, 1000);
  }

  tick();
}


// ── STEP 3: NAME ENTRY ────────────────────────────────────────

function lsConfirm() {
  const ni = document.getElementById('nameInput');
  const name = ni ? ni.value.trim() : '';

  if (!name) {
    if (ni) {
      ni.style.borderColor = 'var(--accent)';
      ni.placeholder = 'Please enter your name';
      setTimeout(function() { ni.style.borderColor = ''; }, 1500);
    }
    return;
  }

  // Save to state + session
  me.name = name;
  me.role = _pinRole;
  saveSession(name, _pinRole);

  // Hide login
  const ls = document.getElementById('loginScreen');
  if (ls) ls.style.display = 'none';

  // Clear name input for next login
  if (ni) ni.value = '';

  openDash();
}


// ── OPEN DASHBOARD ────────────────────────────────────────────

function openDash() {
  // Show header
  const hdr = document.getElementById('appHeader');
  if (hdr) hdr.style.display = 'block';

  // Show/hide supervisor-only header buttons
  const btnPairUp  = document.getElementById('btnPairUp');
  const btnLift    = document.getElementById('btnLift');
  const btnPresets = document.getElementById('btnPresets');
  if (btnPairUp)  btnPairUp.style.display  = me.role === 'supervisor' ? '' : 'none';
  if (btnLift)    btnLift.style.display    = ''; // all roles can do lift inspections
  if (btnPresets) btnPresets.style.display = ''; // all roles can view templates

  // History tab visible to everyone — workers need it to sign approved PSIs
  const tabHistory = document.getElementById('tabHistory');
  if (tabHistory) tabHistory.style.display = '';

  // Show dashboard, hide everything else
  hide('loginScreen');
  hide('editor');
  hide('pairUpPane');
  hide('liftPane');
  hide('presetsPane');
  show('dashboard');

  updateDateline();
  refreshDash();
  fetchWeather();
  if (typeof fetchForecast === 'function') fetchForecast();  // pre-load 7-day forecast
  startPoll();

  // Render dots now that fonts are loaded
  buildDots();
}


// ── SIGN OUT ──────────────────────────────────────────────────

function doSignOut() {
  if (!confirm('Sign out of Concorde PSI?')) return;

  clearSession();
  me.name      = '';
  me.role      = 'worker';
  me.activePSI = null;

  // Hide app
  hide('appHeader');
  hide('dashboard');
  hide('editor');
  hide('pairUpPane');
  hide('liftPane');

  // Reset PIN state
  _pinBuffer   = '';
  _pinAttempts = 0;
  _pinLocked   = false;
  if (_pinLockTimer) { clearTimeout(_pinLockTimer); _pinLockTimer = null; }

  // Reset login to step 1
  hide('ls2');
  hide('ls3');
  show('ls1');
  setRole('worker');
  updateDots();
  hide('pinError');
  hide('pinLockMsg');

  // Show login — MUST set both display and opacity
  const ls = document.getElementById('loginScreen');
  if (ls) {
    ls.style.display = 'flex';
    ls.style.opacity = '1';
  }
}
