/* ═══════════════════════════════════════════════════════════════
   js/personnel.js — Personnel registry (supervisor managed)
   Workers pick their name at login instead of typing it.
═══════════════════════════════════════════════════════════════ */


// ── SUPERVISOR: RENDER LIST IN PANE ───────────────────────────

function renderPersonnelList() {
  const list = document.getElementById('personnelList');
  if (!list) return;

  const people = loadPersonnel();
  list.innerHTML = '';

  if (people.length === 0) {
    list.innerHTML =
      '<div class="empty">' +
        '<div class="empty-icon">👷</div>' +
        '<div class="empty-title">No workers added yet</div>' +
        '<div class="empty-sub">Add names below so workers can tap to sign in.</div>' +
      '</div>';
    return;
  }

  people.forEach(function(name, i) {
    const row = document.createElement('div');
    row.className = 'crew-worker';

    const nameEl = document.createElement('div');
    nameEl.className   = 'crew-name';
    nameEl.textContent = name;

    const del = document.createElement('button');
    del.className   = 'crew-del-btn';
    del.textContent = '×';
    del.title       = 'Remove';
    del.onclick     = (function(idx) {
      return function(e) {
        e.stopPropagation();
        const p = loadPersonnel();
        if (!confirm('Remove ' + p[idx] + '?')) return;
        p.splice(idx, 1);
        savePersonnel(p);
        renderPersonnelList();
      };
    })(i);

    row.appendChild(nameEl);
    row.appendChild(del);
    list.appendChild(row);
  });
}

function personnelAdd() {
  const inp = document.getElementById('personnelInput');
  if (!inp) return;

  const name = inp.value.trim();
  if (!name) { inp.focus(); return; }

  const people = loadPersonnel();
  const exists = people.some(function(p) {
    return p.toLowerCase() === name.toLowerCase();
  });
  if (exists) { toast(name + ' is already in the list'); return; }

  people.push(name);
  people.sort();            // keep alphabetical
  savePersonnel(people);
  inp.value = '';
  inp.focus();

  renderPersonnelList();
  if (typeof toast === 'function') toast('✓ ' + name + ' added');
}


// ── LOGIN: NAME PICKER CHIPS ───────────────────────────────────

function renderPersonnelPicker() {
  const picker = document.getElementById('personnelPicker');
  const orLine = document.getElementById('personnelOrLine');
  if (!picker) return;

  const people = loadPersonnel();
  picker.innerHTML = '';

  if (people.length === 0) {
    picker.style.display = 'none';
    if (orLine) orLine.style.display = 'none';
    return;
  }

  picker.style.display = '';
  if (orLine) orLine.style.display = '';

  people.forEach(function(name) {
    const chip = document.createElement('button');
    chip.className   = 'personnel-chip';
    chip.textContent = name;
    chip.type        = 'button';
    chip.onclick     = function() {
      const ni = document.getElementById('nameInput');
      if (ni) ni.value = name;
      if (typeof lsConfirm === 'function') lsConfirm();
    };
    picker.appendChild(chip);
  });
}


// ── SUPERVISOR NAME / PIN MANAGEMENT ──────────────────────────

function renderSupervisorSettings() {
  const cfg = loadSupervisorConfig();

  const nameEl = document.getElementById('supSettingName');
  const pinEl  = document.getElementById('supSettingPin');
  if (nameEl) nameEl.value = cfg.name || DEFAULT_SUPERVISOR_NAME;
  if (pinEl)  pinEl.value  = '';    // never pre-fill PIN for security
}

function saveSupervisorSettings() {
  const nameEl    = document.getElementById('supSettingName');
  const pinEl     = document.getElementById('supSettingPin');
  const pin2El    = document.getElementById('supSettingPin2');

  const name = nameEl ? nameEl.value.trim() : '';
  const pin  = pinEl  ? pinEl.value.trim()  : '';
  const pin2 = pin2El ? pin2El.value.trim() : '';

  if (!name) { toast('Supervisor name cannot be empty'); return; }

  const cfg = loadSupervisorConfig();
  cfg.name = name;

  if (pin) {
    // Validate PIN
    if (!/^\d{4}$/.test(pin)) { toast('PIN must be exactly 4 digits'); return; }
    if (pin !== pin2) { toast('PINs do not match'); return; }
    cfg.pin = pin;
    if (pinEl)  pinEl.value  = '';
    if (pin2El) pin2El.value = '';
  }

  saveSupervisorConfig(cfg);
  toast('✓ Supervisor settings saved');
}


// ── SUPERVISOR PANE TABS ───────────────────────────────────────

function showSupervisorTab(tab) {
  const templatesEl = document.getElementById('spTemplates');
  const personnelEl = document.getElementById('spPersonnel');
  const tab1        = document.getElementById('spTabTemplates');
  const tab2        = document.getElementById('spTabPersonnel');
  const newBtn      = document.getElementById('presetNewBtn');

  if (tab === 'templates') {
    if (templatesEl) templatesEl.style.display = '';
    if (personnelEl) personnelEl.style.display = 'none';
    if (tab1) tab1.classList.add('active');
    if (tab2) tab2.classList.remove('active');
    if (newBtn) newBtn.style.display = '';
  } else {
    if (templatesEl) templatesEl.style.display = 'none';
    if (personnelEl) personnelEl.style.display = '';
    if (tab1) tab1.classList.remove('active');
    if (tab2) tab2.classList.add('active');
    if (newBtn) newBtn.style.display = 'none';
    renderPersonnelList();
    renderSupervisorSettings();
  }
}
