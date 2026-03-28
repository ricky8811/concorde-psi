/* ═══════════════════════════════════════════════════════════════
   js/auth.js — login, PIN pad, session, sign out
═══════════════════════════════════════════════════════════════ */

// ── APP STATE ─────────────────────────────────────────────────
const me = {
  name:      '',
  role:      'worker',
  trade:     'electrician',
  workflowType: 'full_review',
  requiresSupervisorReview: true,
  profileComplete: true,
  uid:       '',
  email:     '',
  authType:  'legacy',
  activePSI: null,
};

function isAdminUser() {
  return me.role === 'admin';
}

function userHasFullAccess() {
  return me.role === 'supervisor' || me.role === 'admin';
}

function getWorkflowSettings(role, trade) {
  var normalizedRole = (role === 'supervisor' || role === 'admin') ? role : 'worker';
  var normalizedTrade = String(trade || '').trim().toLowerCase() || 'electrician';
  if (normalizedRole === 'supervisor' || normalizedRole === 'admin') {
    return { trade: 'electrician', workflowType: 'full_review', requiresSupervisorReview: true };
  }
  if (normalizedTrade === 'electrician') {
    return { trade: 'electrician', workflowType: 'full_review', requiresSupervisorReview: true };
  }
  return { trade: normalizedTrade, workflowType: 'teams_export', requiresSupervisorReview: false };
}

function applyWorkflowSettings(role, trade) {
  var settings = getWorkflowSettings(role, trade);
  me.trade = settings.trade;
  me.workflowType = settings.workflowType;
  me.requiresSupervisorReview = settings.requiresSupervisorReview;
  return settings;
}

function userRequiresSupervisorReview() {
  return !!me.requiresSupervisorReview;
}

function refreshSignedInStrip() {
  var strip = document.getElementById('signedInStrip');
  var nameEl = document.getElementById('signedInName');
  if (!strip || !nameEl) return;
  var trade = String(me.trade || '').trim();
  var tradeLabel = trade ? (trade.charAt(0).toUpperCase() + trade.slice(1)) : '';
  var roleLabel = me.role === 'admin' ? 'Admin' : (me.role === 'supervisor' ? 'Supervisor' : 'Technician');
  if (!me.name) {
    strip.style.display = 'none';
    nameEl.textContent = '';
    return;
  }
  strip.style.display = 'block';
  nameEl.textContent = roleLabel + ' - ' + me.name + (tradeLabel ? ' - ' + tradeLabel : '');
}

function setLoginMode(mode) {
  mode = mode === 'create' ? 'create' : 'signin';
  var signBtn = document.getElementById('loginModeSignInBtn');
  var createBtn = document.getElementById('loginModeCreateBtn');
  var intro = document.getElementById('loginModeIntro');
  var nameGroup = document.getElementById('accountNameGroup');
  var tradeGroup = document.getElementById('accountTradeGroup');
  var createAction = document.getElementById('accountCreateBtn');
  var createNote = document.getElementById('accountCreateNote');
  var passwordEl = document.getElementById('accountPassword');
  if (signBtn) signBtn.classList.toggle('active', mode === 'signin');
  if (createBtn) createBtn.classList.toggle('active', mode === 'create');
  if (intro) intro.textContent = mode === 'create'
    ? 'Create a worker account, then wait for approval.'
    : 'Sign in with your email and password.';
  if (nameGroup) nameGroup.style.display = mode === 'create' ? '' : 'none';
  if (tradeGroup) tradeGroup.style.display = mode === 'create' ? '' : 'none';
  if (createAction) createAction.style.display = mode === 'create' ? '' : 'none';
  if (createNote) createNote.style.display = mode === 'create' ? '' : 'none';
  if (passwordEl) passwordEl.setAttribute('autocomplete', mode === 'create' ? 'new-password' : 'current-password');
}

function toggleLoginTesting() {
  var panel = document.getElementById('loginTestingPanel');
  var btn = document.getElementById('toggleTestingBtn');
  if (!panel || !btn) return;
  var isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'grid';
  btn.textContent = isOpen ? 'Testing Tools' : 'Hide Testing Tools';
}

function shouldPromptAccountSetup(profile) {
  if (!profile || me.authType !== 'firebase') return false;
  if (profile.profileComplete === true) return false;
  var name = String(profile.name || '').trim();
  var emailPrefix = String((me.email || '').split('@')[0] || '').trim().toLowerCase();
  if (!name) return true;
  if (emailPrefix && name.toLowerCase() === emailPrefix) return true;
  if (!profile.trade) return true;
  return profile.profileComplete !== true;
}

function openAccountSetupModal() {
  var modal = document.getElementById('accountSetupModal');
  if (!modal) return;
  var nameEl = document.getElementById('accountSetupName');
  var tradeEl = document.getElementById('accountSetupTrade');
  var passEl = document.getElementById('accountSetupPassword');
  var pass2El = document.getElementById('accountSetupPassword2');
  if (nameEl) nameEl.value = me.name || '';
  if (tradeEl) tradeEl.value = me.trade || 'electrician';
  if (passEl) passEl.value = '';
  if (pass2El) pass2El.value = '';
  modal.style.display = 'flex';
  setTimeout(function() { if (nameEl) nameEl.focus(); }, 30);
}

function closeAccountSetupModal() {
  var modal = document.getElementById('accountSetupModal');
  if (modal) modal.style.display = 'none';
}

function maybePromptAccountSetup() {
  if (me.authType !== 'firebase') return;
  if (me.profileComplete) return;
  openAccountSetupModal();
}

function saveAccountSetup() {
  var nameEl = document.getElementById('accountSetupName');
  var tradeEl = document.getElementById('accountSetupTrade');
  var passEl = document.getElementById('accountSetupPassword');
  var pass2El = document.getElementById('accountSetupPassword2');
  var name = nameEl ? nameEl.value.trim() : '';
  var trade = tradeEl ? tradeEl.value : 'electrician';
  var password = passEl ? passEl.value : '';
  var password2 = pass2El ? pass2El.value : '';

  if (!name) { toast('Enter your full name'); return; }
  if (password && password.length < 6) { toast('New password must be at least 6 characters'); return; }
  if (password !== password2) { toast('Passwords do not match'); return; }

  var defaults = getWorkflowSettings(me.role, trade);
  var patch = {
    name: name,
    trade: defaults.trade,
    workflowType: defaults.workflowType,
    requiresSupervisorReview: defaults.requiresSupervisorReview,
    profileComplete: true
  };

  firebaseUpdateUserProfile(me.uid, patch).then(function() {
    var next = password ? firebaseUpdateCurrentUserPassword(password) : Promise.resolve();
    return next.then(function() {
      me.name = name;
      applyWorkflowSettings(me.role, defaults.trade);
      me.profileComplete = true;
      saveSession(me.name, me.role, {
        uid: me.uid,
        email: me.email,
        authType: 'firebase',
        trade: me.trade,
        workflowType: me.workflowType,
        requiresSupervisorReview: me.requiresSupervisorReview
      });
      syncSignedInUserToPersonnel(name);
      closeAccountSetupModal();
      if (typeof refreshDash === 'function') refreshDash();
      toast(password ? 'Account updated and password changed' : 'Account updated');
    });
  }).catch(function(err) {
    toast((err && err.message) || 'Could not update account');
  });
}

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
    lockEl.textContent = 'Too many attempts - try again in ' + remaining + 's';
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
  applyWorkflowSettings(_pinRole, 'electrician');
  me.uid = '';
  me.email = '';
  me.authType = 'legacy';
  saveSession(name, _pinRole, {
    authType: 'legacy',
    trade: me.trade,
    workflowType: me.workflowType,
    requiresSupervisorReview: me.requiresSupervisorReview
  });

  // Hide login
  const ls = document.getElementById('loginScreen');
  if (ls) ls.style.display = 'none';
  refreshSignedInStrip();

  // Clear name input for next login
  if (ni) ni.value = '';

  openDash();
}

function syncSignedInUserToPersonnel(name) {
  name = String(name || '').trim();
  if (!name || typeof loadPersonnel !== 'function' || typeof savePersonnel !== 'function') return;
  var list = loadPersonnel() || [];
  var exists = list.some(function(person) {
    return String(person || '').trim().toLowerCase() === name.toLowerCase();
  });
  if (exists) return;
  list.push(name);
  list.sort(function(a, b) { return String(a).localeCompare(String(b)); });
  savePersonnel(list);
}

function quickTestLogin(role) {
  role = role === 'admin' ? 'admin' : (role === 'supervisor' ? 'supervisor' : 'worker');
  var name = '';

  if (role === 'supervisor' || role === 'admin') {
    var cfg = (typeof loadSupervisorConfig === 'function') ? loadSupervisorConfig() : {};
    name = cfg.name || DEFAULT_SUPERVISOR_NAME || (role === 'admin' ? 'Admin' : 'Supervisor');
  } else {
    var personnel = (typeof loadPersonnel === 'function') ? (loadPersonnel() || []) : [];
    name = personnel[0] || 'Test Worker';
  }

  me.name = name;
  me.role = role;
  applyWorkflowSettings(role, 'electrician');
  me.uid = '';
  me.email = '';
  me.authType = 'legacy';

  if (role === 'worker') syncSignedInUserToPersonnel(name);
  saveSession(name, role, {
    authType: 'legacy',
    trade: me.trade,
    workflowType: me.workflowType,
    requiresSupervisorReview: me.requiresSupervisorReview
  });
  setAccountAuthError('');
  hide('loginScreen');
  refreshSignedInStrip();
  openDash();
  toast('Signed in as ' + name);
}

function setAccountAuthError(msg) {
  var el = document.getElementById('accountAuthError');
  if (!el) return;
  if (!msg) {
    el.style.display = 'none';
    el.textContent = '';
    return;
  }
  el.textContent = msg;
  el.style.display = 'block';
}

function applyAccountSession(user, profile, fallbackEmail) {
  if (!user || !profile) return false;
  me.uid = user.uid || '';
  me.email = user.email || fallbackEmail || '';
  me.name = profile.name || user.displayName || (me.email ? me.email.split('@')[0] : '');
  me.role = profile.role === 'admin' ? 'admin' : (profile.role === 'supervisor' ? 'supervisor' : 'worker');
  applyWorkflowSettings(me.role, profile.trade || 'electrician');
  me.profileComplete = profile.profileComplete === true;
  me.authType = 'firebase';

  saveSession(me.name, me.role, {
    uid: me.uid,
    email: me.email,
    authType: 'firebase',
    trade: me.trade,
    workflowType: me.workflowType,
    requiresSupervisorReview: me.requiresSupervisorReview
  });
  refreshSignedInStrip();
  syncSignedInUserToPersonnel(me.name);
  return true;
}

function accountSignIn() {
  var emailEl = document.getElementById('accountEmail');
  var pwEl = document.getElementById('accountPassword');
  var email = emailEl ? emailEl.value.trim() : '';
  var password = pwEl ? pwEl.value : '';

  if (!email || !password) {
    setAccountAuthError('Enter your email and password.');
    return;
  }
  setAccountAuthError('');

  firebaseSignInWithEmail(email, password, null).then(function(result) {
    var user = result && result.user;
    var profile = result && result.profile;
    if (!user || !profile) {
      setAccountAuthError('Could not load your account profile.');
      return;
    }
    applyAccountSession(user, profile, email);

    if (emailEl) emailEl.value = '';
    if (pwEl) pwEl.value = '';
    var nameEl = document.getElementById('accountName');
    if (nameEl) nameEl.value = '';
    hide('loginScreen');
    openDash();
    toast('Signed in as ' + me.name);
  }).catch(function(err) {
    var msg = (err && err.message) ? err.message : 'Account sign-in failed.';
    if (/auth\/invalid-credential|auth\/wrong-password|auth\/user-not-found/i.test(msg)) {
      msg = 'Invalid email or password.';
    }
    if (/waiting for supervisor approval/i.test(msg)) {
      msg = 'Your account is waiting for supervisor approval.';
    }
    setAccountAuthError(msg);
  });
}

function accountCreate() {
  var nameEl = document.getElementById('accountName');
  var emailEl = document.getElementById('accountEmail');
  var pwEl = document.getElementById('accountPassword');
  var tradeEl = document.getElementById('accountTrade');
  var name = nameEl ? nameEl.value.trim() : '';
  var email = emailEl ? emailEl.value.trim() : '';
  var password = pwEl ? pwEl.value : '';
  var trade = tradeEl ? tradeEl.value : 'electrician';

  if (!name || !email || !password) {
    setAccountAuthError('Enter your name, email, and password to create an account.');
    return;
  }
  if (password.length < 6) {
    setAccountAuthError('Password must be at least 6 characters.');
    return;
  }

  setAccountAuthError('');

  firebaseCreateWorkerAccount(name, email, password, trade).then(function(result) {
    var user = result && result.user;
    var profile = result && result.profile;
    if (!user || !profile) {
      setAccountAuthError('Could not create your account.');
      return;
    }
    if (nameEl) nameEl.value = '';
    if (emailEl) emailEl.value = '';
    if (pwEl) pwEl.value = '';
    if (tradeEl) tradeEl.value = 'electrician';
    setAccountAuthError('');
    toast('Account request sent. Wait for supervisor approval.');
  }).catch(function(err) {
    var msg = (err && err.message) ? err.message : 'Could not create account.';
    if (/auth\/email-already-in-use/i.test(msg)) msg = 'That email is already in use. Try Account Sign In.';
    if (/auth\/invalid-email/i.test(msg)) msg = 'Enter a valid email address.';
    if (/auth\/weak-password/i.test(msg)) msg = 'Password must be at least 6 characters.';
    setAccountAuthError(msg);
  });
}

function restoreSignedInAccount(sess) {
  return firebaseRestoreAccountSession().then(function(result) {
    var user = result && result.user;
    var profile = result && result.profile;
    if (!user || !profile) return false;
    applyAccountSession(user, profile, (sess && sess.email) || '');
    return true;
  }).catch(function() {
    return false;
  });
}


// ── OPEN DASHBOARD ────────────────────────────────────────────

function openDash() {
  // Show header
  const hdr = document.getElementById('appHeader');
  if (hdr) hdr.style.display = 'block';
  refreshSignedInStrip();

  // Show/hide supervisor-only header buttons
  const btnPairUp  = document.getElementById('btnPairUp');
  const btnLift    = document.getElementById('btnLift');
  const btnPresets = document.getElementById('btnPresets');
  if (btnPairUp)  btnPairUp.style.display  = userHasFullAccess() ? '' : 'none';
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
  setTimeout(maybePromptAccountSetup, 200);
  if (typeof maybePromptReturnedItems === 'function') {
    setTimeout(maybePromptReturnedItems, 250);
  }
  fetchWeather();
  if (typeof fetchForecast === 'function') fetchForecast();  // pre-load 7-day forecast
  if (typeof initFirebaseSync === 'function') initFirebaseSync();  // start real-time sync
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
  me.trade     = 'electrician';
  me.workflowType = 'full_review';
  me.requiresSupervisorReview = true;
  me.profileComplete = true;
  me.uid       = '';
  me.email     = '';
  me.authType  = 'legacy';
  me.activePSI = null;
  if (typeof firebaseSignOutUser === 'function') firebaseSignOutUser();

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
  if (typeof stopPoll === 'function') stopPoll();

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
  refreshSignedInStrip();
  setAccountAuthError('');
  var accountName = document.getElementById('accountName');
  var accountEmail = document.getElementById('accountEmail');
  var accountPassword = document.getElementById('accountPassword');
  var accountTrade = document.getElementById('accountTrade');
  if (accountName) accountName.value = '';
  if (accountEmail) accountEmail.value = '';
  if (accountPassword) accountPassword.value = '';
  if (accountTrade) accountTrade.value = 'electrician';
}

