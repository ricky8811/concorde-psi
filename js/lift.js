/* ═══════════════════════════════════════════════════════════════
   js/lift.js — Lift / MEWP pre-use inspection
═══════════════════════════════════════════════════════════════ */

// ── STATE ─────────────────────────────────────────────────────
let _liftData  = { units: {} };   // full persisted data
let _curLift   = null;            // currently selected unit key
let _defField  = null;

const LIFT_DEFICIENCY_REASONS = [
  'Not working',
  'Damaged',
  'Loose',
  'Intermittent',
  'Fault code',
  'Other'
];

function liftCheckLabel(field) {
  for (var i = 0; i < LIFT_CHECKS.length; i++) {
    for (var j = 0; j < LIFT_CHECKS[i].items.length; j++) {
      if (LIFT_CHECKS[i].items[j].field === field) return LIFT_CHECKS[i].items[j].label;
    }
  }
  return field;
}

function getLiftDeficiencies(unit) {
  if (!unit) return [];
  if (!Array.isArray(unit.deficiencies)) unit.deficiencies = [];
  return unit.deficiencies;
}

function getLiftDeficiency(unit, field) {
  return getLiftDeficiencies(unit).find(function(def) { return def.field === field; }) || null;
}

function upsertLiftDeficiency(unit, field, reason) {
  var list = getLiftDeficiencies(unit);
  var existing = getLiftDeficiency(unit, field);
  var payload = {
    field: field,
    item: liftCheckLabel(field),
    reason: reason.trim(),
    time: nowTimeHM(),
    date: todayISO()
  };
  if (existing) Object.assign(existing, payload);
  else list.push(payload);
}

function removeLiftDeficiency(unit, field) {
  if (!unit || !Array.isArray(unit.deficiencies)) return;
  unit.deficiencies = unit.deficiencies.filter(function(def) { return def.field !== field; });
}

function buildLiftBaseRemarks(unit) {
  var lines = [];
  if (unit && unit.baseRemarks) {
    unit.baseRemarks.split(/\r?\n/).forEach(function(line) {
      if (line && line.trim()) lines.push(line.trim());
    });
  }
  return lines.join('\n');
}

function buildLiftAutoRemarks(unit) {
  var lines = [];
  var base = buildLiftBaseRemarks(unit);
  if (base) lines.push(base);

  var defs = getLiftDeficiencies(unit);
  if (defs.length) {
    if (lines.length) lines.push('');
    lines.push('Deficiencies:');
    defs.forEach(function(def) {
      lines.push('* ' + def.item + ': ' + def.reason);
    });
  }
  return lines.join('\n').trim();
}

function buildLiftRemarks(unit) {
  if (!unit) return '';
  var autoText = buildLiftAutoRemarks(unit);
  var manualText = (unit.manualRemarks || '').trim();
  if (autoText && manualText) return autoText + '\n\n' + manualText;
  return autoText || manualText;
}

function parseLiftManualRemarks(rawText, autoText) {
  var raw = (rawText || '').trim();
  var auto = (autoText || '').trim();
  if (!raw) return '';
  if (!auto) return raw;
  if (raw === auto) return '';
  if (raw.indexOf(auto) === 0) return raw.slice(auto.length).trim();
  return raw;
}

function refreshLiftRemarks(unit) {
  if (!unit) return;
  unit.remarks = buildLiftRemarks(unit);
  var remEl = document.getElementById('liftRemarks');
  if (remEl) {
    var autoText = buildLiftAutoRemarks(unit);
    remEl.value = unit.remarks || '';
    remEl.dataset.autoRemarks = autoText;
  }
}

function ensureLiftPSIDeficiencySync(unit) {
  if (!unit || !unit.psiId || typeof loadPSI !== 'function') return;
  var psi = loadPSI(unit.psiId);
  if (!psi) return;

  psi.liftInspectionDeficiencies = getLiftDeficiencies(unit).slice();
  if (psi.liftInspectionDeficiencies.length) {
    var customHazards = Array.isArray(psi.customHazards) ? psi.customHazards.slice() : [];
    if (!customHazards.some(function(h) { return String(h).toLowerCase() === 'defective equipment'; })) {
      customHazards.push('Defective equipment');
    }
    psi.customHazards = customHazards;

    var controlLine = 'Remove from service and report issue';
    var controlText = String(psi.controlText || '').trim();
    if (controlText.toLowerCase().indexOf(controlLine.toLowerCase()) === -1) {
      psi.controlText = controlText ? (controlText + '\n' + controlLine) : controlLine;
    }
  }
  if (typeof writePSI === 'function') writePSI(psi);
}

function openLiftDeficiencyModal(field) {
  if (!_curLift) return;
  _defField = field;
  var unit = _liftData.units[_curLift];
  var existing = getLiftDeficiency(unit, field);
  var modal = document.getElementById('liftDefModal');
  var labelEl = document.getElementById('liftDefItem');
  var inputEl = document.getElementById('liftDefReason');
  var quickEl = document.getElementById('liftDefQuick');
  if (!modal || !labelEl || !inputEl || !quickEl) return;

  labelEl.textContent = liftCheckLabel(field);
  inputEl.value = existing ? existing.reason : '';
  inputEl.onkeydown = function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmLiftDeficiencyReason();
    }
  };
  quickEl.innerHTML = '';
  LIFT_DEFICIENCY_REASONS.forEach(function(reason) {
    var btn = document.createElement('button');
    btn.className = 'personnel-chip';
    btn.textContent = reason;
    btn.onclick = function() {
      inputEl.value = reason === 'Other' ? '' : reason;
      if (reason !== 'Other') confirmLiftDeficiencyReason();
      else inputEl.focus();
    };
    quickEl.appendChild(btn);
  });

  modal.style.display = 'flex';
  modal.classList.add('open');
  setTimeout(function() { inputEl.focus(); }, 20);
}

function closeLiftDeficiencyModal() {
  _defField = null;
  var modal = document.getElementById('liftDefModal');
  if (!modal) return;
  modal.style.display = 'none';
  modal.classList.remove('open');
}

function confirmLiftDeficiencyReason() {
  if (!_curLift || !_defField) return;
  var inputEl = document.getElementById('liftDefReason');
  var reason = inputEl ? inputEl.value.trim() : '';
  if (!reason) { toast('Add a reason for the deficiency'); return; }

  var unit = _liftData.units[_curLift];
  if (!unit) return;
  if (!unit.checks) unit.checks = {};
  unit.checks[_defField] = 'no';
  upsertLiftDeficiency(unit, _defField, reason);
  refreshLiftRemarks(unit);
  saveLift(_liftData);
  syncLinkedLiftPSI(_curLift);
  ensureLiftPSIDeficiencySync(unit);
  renderLiftChecks(!!(document.getElementById('liftRemarks') || {}).disabled);
  renderLiftActions();
  closeLiftDeficiencyModal();
  toast('Deficiency logged');
}

function syncLinkedLiftPSI(unitKey) {
  var u = unitKey && _liftData.units ? _liftData.units[unitKey] : null;
  if (!u || !u.psiId) return;
  var psi = (typeof loadPSI === 'function') ? loadPSI(u.psiId) : null;
  if (!psi) return;
  psi.liftRequired = true;
  psi.liftUnitKey = unitKey;
  psi.liftInspectionStatus = u.status || 'draft';
  psi.liftInspectionDate = u.date || '';
  psi.liftInspectionRemarks = u.remarks || '';
  psi.liftInspectionReviewNote = u.reviewNote || '';
  psi.liftInspectionReviewedBy = u.reviewedBy || '';
  psi.liftInspectionReviewedAt = u.reviewedAt || null;
  psi.liftInspectionDeficiencies = getLiftDeficiencies(u).slice();
  if (typeof writePSI === 'function') writePSI(psi);
}

function prefillLiftForPSI(unitKey) {
  if (!unitKey || !me.activePSI || !_liftData.units[unitKey]) return;
  var psi = (typeof loadPSI === 'function') ? loadPSI(me.activePSI) : null;
  var u = _liftData.units[unitKey];
  if (!psi || !u) return;

  var title = psi.jobTitle || psi.taskDesc || 'PSI Job';
  var remarkBits = ['PSI: ' + title];
  var workOrder = psi.jobNumber || ((psi.workOrders && psi.workOrders[0] && (psi.workOrders[0].number || psi.workOrders[0].id)) || '');
  if (workOrder) remarkBits.push('WO: ' + workOrder);
  var crewNames = (psi.workers || []).map(function(w) {
    return (w && w.name) ? w.name.trim() : '';
  }).filter(Boolean);
  var otherWorkers = crewNames.filter(function(name) {
    return name.toLowerCase() !== (me.name || '').trim().toLowerCase();
  });
  if (otherWorkers.length) remarkBits.push('Also using lift: ' + otherWorkers.join(', '));

  u.psiId = psi.id;
  u.operator = u.operator || me.name || '';
  u.baseRemarks = remarkBits.join('\n');
  refreshLiftRemarks(u);
  u.status = u.status || 'draft';
  saveLift(_liftData);
  syncLinkedLiftPSI(unitKey);
  ensureLiftPSIDeficiencySync(u);
}

function refreshLiftLinkForPSI(psi) {
  if (!psi || !psi.id || !psi.liftUnitKey) return;
  _liftData = loadLift();
  if (!_liftData.units || !_liftData.units[psi.liftUnitKey]) return;

  var prevActive = me.activePSI;
  me.activePSI = psi.id;
  prefillLiftForPSI(psi.liftUnitKey);
  me.activePSI = prevActive;
}

function openLiftLinkModal() {
  var modal = document.getElementById('liftLinkModal');
  var choices = document.getElementById('liftLinkChoices');
  if (!modal || !choices) return;

  var fleet = loadFleet();
  var keys = Object.keys(fleet);
  choices.innerHTML = '';

  if (!keys.length) {
    var empty = document.createElement('div');
    empty.className = 'empty-sub';
    empty.textContent = 'No saved lifts yet. Open the lift pane to add your fleet.';
    choices.appendChild(empty);
  } else {
    keys.forEach(function(key) {
      var chip = document.createElement('button');
      chip.className = 'personnel-chip';
      chip.textContent = fleet[key].unitNum || key;
      chip.onclick = function() {
        linkLiftUnitToActivePSI(key);
      };
      choices.appendChild(chip);
    });
  }

  modal.style.display = 'flex';
  modal.classList.add('open');
}

function closeLiftLinkModal() {
  var modal = document.getElementById('liftLinkModal');
  if (!modal) return;
  modal.style.display = 'none';
  modal.classList.remove('open');
}

function linkLiftUnitToActivePSI(unitKey) {
  if (!unitKey) return;
  liftStartInspection(unitKey);
  prefillLiftForPSI(unitKey);
  closeLiftLinkModal();
  if (typeof updateLiftRequirementUI === 'function' && typeof loadPSI === 'function' && me.activePSI) {
    updateLiftRequirementUI(loadPSI(me.activePSI));
  }
  toast('✓ Lift unit linked to PSI');
}

function createAdHocLiftForActivePSI() {
  if (!me.activePSI) return;
  var key = 'TEMP-' + me.activePSI.toUpperCase();
  if (!_liftData.units[key]) {
    _liftData.units[key] = {
      unitNum: '',
      make: '',
      operator: me.name || '',
      date: todayISO(),
      meter: '',
      checks: defaultChecks(),
      remarks: '',
      manualRemarks: '',
      deficiencies: [],
      status: 'draft',
      adHoc: true,
    };
    saveLift(_liftData);
  }
  _curLift = key;
  prefillLiftForPSI(key);
  closeLiftLinkModal();
  showLiftPane();
  toast('✓ Temporary lift record created');
}

function loadFleet() {
  try { return JSON.parse(localStorage.getItem(LIFT_FLEET_KEY)) || {}; } catch(e) { return {}; }
}
function saveFleet(fleet) {
  localStorage.setItem(LIFT_FLEET_KEY, JSON.stringify(fleet));
  if (typeof firebaseSaveFleet === 'function') firebaseSaveFleet(fleet);
}

// Build a default checks object with every field set to 'ok'
function defaultChecks() {
  var checks = {};
  LIFT_CHECKS.forEach(function(section) {
    section.items.forEach(function(item) {
      checks[item.field] = 'ok';
    });
  });
  return checks;
}


// ── TAB SWITCHING ─────────────────────────────────────────────

function showLiftTab(tab) {
  var inspectEl = document.getElementById('liftTabInspect');
  var histEl    = document.getElementById('liftTabHistory');
  var btn1      = document.getElementById('liftTabBtn1');
  var btn2      = document.getElementById('liftTabBtn2');

  if (inspectEl) inspectEl.style.display = tab === 'inspect' ? '' : 'none';
  if (histEl)    histEl.style.display    = tab === 'history' ? '' : 'none';
  if (btn1) btn1.classList.toggle('active', tab === 'inspect');
  if (btn2) btn2.classList.toggle('active', tab === 'history');

  if (tab === 'history') {
    // Pull latest history from Firestore on demand (not a continuous listener)
    if (typeof firebaseLoadLiftHistory === 'function') firebaseLoadLiftHistory();
    else renderLiftHistory();
  }
}


// ── SHOW / HIDE PANE ──────────────────────────────────────────

function showLiftPane() {
  var dash = document.getElementById('dashboard');
  var editor = document.getElementById('editor');
  var openedFromDashboard = dash && dash.style.display !== 'none' &&
    (!editor || editor.style.display === 'none');
  if (openedFromDashboard) {
    me.activePSI = null;
    _curLift = null;
  }

  hide('dashboard');
  hide('editor');

  const pane = document.getElementById('liftPane');
  if (pane) pane.style.display = 'flex';

  liftInit();
  showLiftTab('inspect');
}

function showLiftPaneForUnit(unitKey) {
  showLiftPane();
  if (!unitKey) return;
  _liftData = loadLift();
  if (_liftData.units && _liftData.units[unitKey]) {
    loadLiftUnit(unitKey);
  }
}

function hideLiftPane() {
  const pane = document.getElementById('liftPane');
  if (pane) pane.style.display = 'none';

  show('dashboard');
  refreshDash();
}


// ── INIT ──────────────────────────────────────────────────────

function liftInit() {
  _liftData = loadLift();
  if (!_liftData.units) _liftData.units = {};

  renderLiftBar();

  // If a specific unit is active, load it. Otherwise leave the pane blank so
  // "Lift Inspection" behaves like starting a new inspection flow.
  const keys = Object.keys(_liftData.units);
  if (_curLift && _liftData.units[_curLift]) {
    loadLiftUnit(_curLift);
  } else {
    _curLift = null;
    const opEl    = document.getElementById('liftOperator');
    const dateEl  = document.getElementById('liftDate');
    const makeEl  = document.getElementById('liftMake');
    const unitEl  = document.getElementById('liftUnit');
    const meterEl = document.getElementById('liftMeter');
    const remEl   = document.getElementById('liftRemarks');
    if (opEl)    { opEl.disabled = false; opEl.value = me.name || ''; }
    if (dateEl)  { dateEl.disabled = false; dateEl.value = todayISO(); }
    if (makeEl)  { makeEl.disabled = false; makeEl.value = ''; }
    if (unitEl)  { unitEl.disabled = false; unitEl.value = ''; }
    if (meterEl) { meterEl.disabled = false; meterEl.value = ''; }
    if (remEl)   { remEl.disabled = false; remEl.value = ''; }
    renderLiftChecks();
    renderLiftActions();
  }
}


// ── UNIT BAR — fleet chips + active inspection indicator ──────

function renderLiftBar() {
  const bar = document.getElementById('liftUnitBar');
  if (!bar) return;
  bar.innerHTML = '';

  const fleet = loadFleet();
  const keys  = Object.keys(fleet);

  if (keys.length === 0) {
    const hint = document.createElement('span');
    hint.className   = 'unit-bar-hint';
    hint.textContent = 'No lifts saved yet — add your fleet below';
    bar.appendChild(hint);
  }

  keys.forEach(function(key) {
    const f = fleet[key];
    const insp = _liftData.units[key];

    var label = f.unitNum || key;
    if (insp && insp.status === 'submitted') label += ' ⏳';
    else if (insp && insp.status === 'returned') label += ' ↩';
    else if (insp && insp.status === 'approved') label += ' ✓';
    else if (insp) label += ' •';

    // Wrapper holds the chip + edit + delete buttons
    const wrap = document.createElement('div');
    wrap.className = 'unit-chip-wrap';

    const chip = document.createElement('button');
    chip.className   = 'unit-chip' + (_curLift === key ? ' active' : '');
    chip.textContent = label;
    chip.title       = f.make || '';
    chip.onclick     = (function(k) { return function() { liftStartInspection(k); }; })(key);

    const editBtn = document.createElement('button');
    editBtn.className   = 'unit-chip-icon';
    editBtn.textContent = '✏';
    editBtn.title       = 'Edit lift';
    editBtn.onclick     = (function(k) { return function() { openEditLiftModal(k); }; })(key);

    const delBtn = document.createElement('button');
    delBtn.className   = 'unit-chip-icon unit-chip-del';
    delBtn.textContent = '×';
    delBtn.title       = 'Remove from fleet';
    delBtn.onclick     = (function(k) { return function() { liftRemoveFromFleet(k); }; })(key);

    wrap.appendChild(chip);
    wrap.appendChild(editBtn);
    wrap.appendChild(delBtn);
    bar.appendChild(wrap);
  });

  if (_curLift && _liftData.units[_curLift] && !_liftData.units[_curLift].deleted && !fleet[_curLift]) {
    var adHoc = _liftData.units[_curLift];
    var tempChip = document.createElement('button');
    tempChip.className = 'unit-chip active';
    tempChip.textContent = adHoc.unitNum ? (adHoc.unitNum + ' (temp)') : 'Temporary Lift';
    tempChip.title = 'Temporary lift record not yet saved to fleet';
    tempChip.onclick = function() { loadLiftUnit(_curLift); };
    bar.appendChild(tempChip);
  }

  // ＋ Add Lift to Fleet
  const addChip = document.createElement('button');
  addChip.className   = 'unit-chip add-chip';
  addChip.textContent = '＋ Add Lift';
  addChip.onclick     = openAddLiftModal;
  bar.appendChild(addChip);
}


// ── OPEN / CLOSE ADD-LIFT MODAL ───────────────────────────────

var _editLiftKey = null;

function openAddLiftModal() {
  _editLiftKey = null;
  var titleEl = document.querySelector('#addLiftModal .modal-title');
  if (titleEl) titleEl.textContent = 'Add Lift to Fleet';
  var confirmBtn = document.querySelector('#addLiftModal .btn-accent');
  if (confirmBtn) { confirmBtn.textContent = 'Add to Fleet'; confirmBtn.onclick = confirmAddLift; }
  var el = document.getElementById('addLiftModal');
  if (el) { el.style.display = 'flex'; }
  var inp = document.getElementById('addLiftUnit');
  if (inp) { inp.value = ''; inp.focus(); }
  var mk = document.getElementById('addLiftMake');
  if (mk) mk.value = '';
}

function closeAddLiftModal() {
  var el = document.getElementById('addLiftModal');
  if (el) el.style.display = 'none';
}

function confirmAddLift() {
  var unitNum = (document.getElementById('addLiftUnit') || {}).value || '';
  var make    = (document.getElementById('addLiftMake')  || {}).value || '';
  unitNum = unitNum.trim();
  if (!unitNum) { toast('Enter a unit number'); return; }

  var key   = unitNum.replace(/\s+/g, '-').toUpperCase();
  var fleet = loadFleet();
  fleet[key] = { unitNum: unitNum, make: make.trim() };
  saveFleet(fleet);

  closeAddLiftModal();
  renderLiftBar();
  liftStartInspection(key);
  toast('✓ ' + unitNum + ' added to fleet');
}

function openEditLiftModal(key) {
  var fleet = loadFleet();
  var f = fleet[key] || {};
  _editLiftKey = key;
  var titleEl = document.querySelector('#addLiftModal .modal-title');
  if (titleEl) titleEl.textContent = 'Edit Lift';
  var confirmBtn = document.querySelector('#addLiftModal .btn-accent');
  if (confirmBtn) { confirmBtn.textContent = 'Save Changes'; confirmBtn.onclick = confirmEditLift; }
  var el = document.getElementById('addLiftModal');
  if (el) el.style.display = 'flex';
  var inp = document.getElementById('addLiftUnit');
  if (inp) { inp.value = f.unitNum || ''; inp.focus(); }
  var mk = document.getElementById('addLiftMake');
  if (mk) mk.value = f.make || '';
}

function confirmEditLift() {
  if (!_editLiftKey) return;
  var unitNum = (document.getElementById('addLiftUnit') || {}).value || '';
  var make    = (document.getElementById('addLiftMake')  || {}).value || '';
  unitNum = unitNum.trim();
  if (!unitNum) { toast('Enter a unit number'); return; }
  var fleet = loadFleet();
  fleet[_editLiftKey] = { unitNum: unitNum, make: make.trim() };
  // Also update the active inspection record if it exists
  if (_liftData.units[_editLiftKey]) {
    _liftData.units[_editLiftKey].unitNum = unitNum;
    _liftData.units[_editLiftKey].make    = make.trim();
    saveLift(_liftData);
  }
  saveFleet(fleet);
  _editLiftKey = null;
  closeAddLiftModal();
  renderLiftBar();
  toast('✓ Lift updated');
}

function liftRemoveFromFleet(key) {
  if (!confirm('Remove this lift from the fleet? Inspection records are kept.')) return;
  var fleet = loadFleet();
  delete fleet[key];
  saveFleet(fleet);
  if (_curLift === key) _curLift = null;
  renderLiftBar();
  toast('Lift removed from fleet');
}


// ── START / RESUME INSPECTION ─────────────────────────────────

function liftStartInspection(key) {
  var fleet = loadFleet();
  if (!fleet[key]) return;
  const f = fleet[key];

  // Create a fresh inspection record for today if none exists or if date differs
  const existing = _liftData.units[key];
  const today    = todayISO();

  if (!existing || existing.date !== today) {
    // Archive the previous inspection before starting a new one
    if (existing && existing.date && existing.status !== 'draft') {
      archiveLiftInspection(Object.assign({}, existing, { unitKey: key }));
    }

    // New day → fresh inspection with all checks defaulting to OK
    _liftData.units[key] = {
      unitNum:  f.unitNum,
      make:     f.make,
      operator: me.name || '',
      date:     today,
      meter:    '',
      checks:   defaultChecks(),
      remarks:  '',
      manualRemarks: '',
      deficiencies: [],
      status:   'draft',
    };
    saveLift(_liftData);
  } else if ((existing.status === 'draft' || existing.status === 'returned') && me.name) {
    existing.operator = me.name;
    saveLift(_liftData);
  }

  loadLiftUnit(key);
  if (me.activePSI) prefillLiftForPSI(key);
}


// ── LOAD UNIT ─────────────────────────────────────────────────

function loadLiftUnit(key) {
  _curLift = key;
  const u  = _liftData.units[key];
  if (!u) return;

  // Ensure status field exists on older records
  if (!u.status) u.status = 'draft';
  if (!u.checks) u.checks = defaultChecks();
  if (!Array.isArray(u.deficiencies)) u.deficiencies = [];
  if (typeof u.manualRemarks !== 'string') u.manualRemarks = '';
  if (typeof u.baseRemarks !== 'string') u.baseRemarks = '';
  if (!u.baseRemarks && u.psiId) {
    var psi = (typeof loadPSI === 'function') ? loadPSI(u.psiId) : null;
    if (psi) {
      var parts = ['PSI: ' + (psi.jobTitle || psi.taskDesc || 'PSI Job')];
      var workOrder = psi.jobNumber || ((psi.workOrders && psi.workOrders[0] && (psi.workOrders[0].number || psi.workOrders[0].id)) || '');
      if (workOrder) parts.push('WO: ' + workOrder);
      u.baseRemarks = parts.join('\n');
    }
  }
  if (!u.manualRemarks && u.remarks) {
    u.manualRemarks = parseLiftManualRemarks(u.remarks, buildLiftAutoRemarks(u));
  }
  refreshLiftRemarks(u);

  const isApproved  = u.status === 'approved';
  const isWorker    = me.role !== 'supervisor';

  // Fill form fields
  const opEl    = document.getElementById('liftOperator');
  const dateEl  = document.getElementById('liftDate');
  const makeEl  = document.getElementById('liftMake');
  const unitEl  = document.getElementById('liftUnit');
  const meterEl = document.getElementById('liftMeter');
  const remEl   = document.getElementById('liftRemarks');

  if (opEl)    opEl.value    = u.operator || me.name || '';
  if (dateEl)  dateEl.value  = u.date     || todayISO();
  if (makeEl)  makeEl.value  = u.make     || '';
  if (unitEl)  unitEl.value  = u.unitNum  || '';
  if (meterEl) meterEl.value = u.meter    || '';
  if (remEl)   remEl.value   = u.remarks  || '';

  // Workers can keep editing while an item is in review; only approved items lock.
  const lockFields = isWorker && isApproved;
  [opEl, dateEl, makeEl, unitEl, meterEl, remEl].forEach(function(el) {
    if (el) el.disabled = lockFields;
  });

  // Re-render checks and bar
  renderLiftChecks(lockFields);
  renderLiftBar();
  renderLiftActions();

}


// ── RENDER CHECK SECTIONS ─────────────────────────────────────

function renderLiftChecks(locked) {
  const container = document.getElementById('liftChecks');
  if (!container) return;
  container.innerHTML = '';

  const unit = (_curLift && _liftData.units[_curLift]) ? _liftData.units[_curLift] : null;
  const checks = unit ? (unit.checks || {}) : {};
  const deficiencies = unit ? getLiftDeficiencies(unit) : [];

  if (deficiencies.length) {
    const warn = document.createElement('div');
    warn.className = 'lift-deficiency-box';
    warn.innerHTML = '<strong>Lift has deficiencies - review before use</strong>';
    deficiencies.forEach(function(def) {
      const line = document.createElement('div');
      line.className = 'lift-deficiency-item';
      line.textContent = def.item + ': ' + def.reason;
      warn.appendChild(line);
    });
    container.appendChild(warn);
  }

  LIFT_CHECKS.forEach(function(section) {
    const wrap = document.createElement('div');
    wrap.className = 'lift-check-section';

    const head = document.createElement('div');
    head.className   = 'lift-check-head';
    head.textContent = section.section;
    wrap.appendChild(head);

    section.items.forEach(function(item) {
      const row = document.createElement('div');
      const deficiency = unit ? getLiftDeficiency(unit, item.field) : null;
      row.className = 'lift-check-row' + (deficiency ? ' deficiency' : '');

      const lbl = document.createElement('div');
      lbl.className = 'lift-check-label';
      lbl.textContent = item.label;
      if (deficiency) {
        const note = document.createElement('div');
        note.className = 'lift-check-note';
        note.textContent = deficiency.reason;
        lbl.appendChild(note);
      }

      const tri = document.createElement('div');
      tri.className = 'lift-tri';

      const curVal = checks[item.field] || 'ok';

      ['ok', 'no', 'na'].forEach(function(val) {
        const btn = document.createElement('button');
        btn.className   = 'tri-btn' + (curVal === val ? ' ' + val : '');
        btn.textContent = val.toUpperCase();
        btn.disabled    = !!locked;

        if (!locked) {
          btn.onclick = (function(field, v) {
            return function() {
              liftSetCheck(field, v);
            };
          })(item.field, val);
        }

        tri.appendChild(btn);
      });

      row.appendChild(lbl);
      row.appendChild(tri);
      wrap.appendChild(row);
    });

    container.appendChild(wrap);
  });
}


// ── RENDER ACTION BUTTONS ──────────────────────────────────────

function renderLiftActions() {
  const el = document.getElementById('liftActions');
  if (!el) return;
  el.innerHTML = '';

  const u = _curLift ? _liftData.units[_curLift] : null;
  const status = u ? (u.status || 'draft') : 'draft';
  const deficiencies = u ? getLiftDeficiencies(u) : [];

  if (u && u.reviewNote) {
    const noteBox = document.createElement('div');
    noteBox.className = status === 'returned' ? 'pending-banner' : 'lift-deficiency-box';
    noteBox.innerHTML = '<strong>Review Note' +
      (u.reviewAssignedTo ? ' for ' + u.reviewAssignedTo : '') +
      '</strong><div>' + u.reviewNote + '</div>';
    el.appendChild(noteBox);
  }

  if (deficiencies.length) {
    const warnBox = document.createElement('div');
    warnBox.className = 'lift-deficiency-box';
    warnBox.innerHTML = '<strong>Lift has deficiencies - review before use</strong>';
    deficiencies.forEach(function(def) {
      const row = document.createElement('div');
      row.className = 'lift-deficiency-item';
      row.textContent = def.item + ': ' + def.reason;
      warnBox.appendChild(row);
    });
    el.appendChild(warnBox);
  }

  if (userHasFullAccess()) {
    if (u && u.checks) {
      const analysis = SafetyEngine.analyseChecks(u.checks);
      if (!deficiencies.length && status !== 'approved') {
        const allOk = document.createElement('div');
        allOk.className = 'lift-all-ok';
        allOk.textContent = 'All ' + analysis.okCount + ' items OK';
        el.appendChild(allOk);
      }
    }

    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn btn-accent btn-full';
    submitBtn.textContent = status === 'submitted'
      ? 'Update Review Copy'
      : (status === 'returned' ? 'Send Back to Review' : 'Submit for Review');
    submitBtn.onclick = liftSubmit;
    el.appendChild(submitBtn);

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-secondary btn-full';
    saveBtn.textContent = 'Save Changes';
    saveBtn.onclick = liftSaveOnly;
    el.appendChild(saveBtn);

    renderAttachLiftPSIAction(el, u);

    if (status === 'submitted' || status === 'returned' || status === 'approved') {
      const previewBtn = document.createElement('button');
      previewBtn.className = 'btn btn-secondary btn-full';
      previewBtn.textContent = 'Preview PDF';
      previewBtn.onclick = function() {
        buildMEWPPDF(u, u.opStrokes || [], u.supStrokes || [], { preview: true });
      };
      if (typeof attachPDFHoverPreview === 'function') {
        attachPDFHoverPreview(previewBtn, function(onReady) {
          buildMEWPPDF(u, u.opStrokes || [], u.supStrokes || [], { onReady: onReady });
        });
      }
      el.appendChild(previewBtn);

      const approveBtn = document.createElement('button');
      approveBtn.className = 'btn btn-accent btn-full';
      approveBtn.textContent = status === 'approved' ? 'Re-download PDF' : 'Approve & Download PDF';
      approveBtn.onclick = liftApprovePDF;
      el.appendChild(approveBtn);
    }

    if (status === 'submitted' || status === 'returned') {
      const returnBtn = document.createElement('button');
      returnBtn.className = 'btn btn-secondary btn-full';
      returnBtn.textContent = 'Send Back';
      returnBtn.onclick = liftReturnForChanges;
      el.appendChild(returnBtn);
    }

  } else {
    if (!userRequiresSupervisorReview()) {
      if (status === 'approved') {
        const banner = document.createElement('div');
        banner.className = 'approved-banner';
        banner.innerHTML = 'Completed';
        el.appendChild(banner);
      }

      const submitBtn = document.createElement('button');
      submitBtn.className = 'btn btn-accent btn-full';
      submitBtn.textContent = status === 'approved' ? 'Re-download PDF' : 'Complete & Download PDF';
      submitBtn.onclick = liftSubmit;
      el.appendChild(submitBtn);
    } else if (status === 'submitted') {
      const banner = document.createElement('div');
      banner.className = 'pending-banner';
      banner.innerHTML = 'In Supervisor Review';
      el.appendChild(banner);

      const submitBtn = document.createElement('button');
      submitBtn.className = 'btn btn-accent btn-full';
      submitBtn.textContent = 'Update Review Copy';
      submitBtn.onclick = liftSubmit;
      el.appendChild(submitBtn);
    } else if (status === 'approved') {
      const banner = document.createElement('div');
      banner.className = 'approved-banner';
      banner.innerHTML = 'Approved';
      el.appendChild(banner);
    } else {
      const submitBtn = document.createElement('button');
      submitBtn.className = 'btn btn-accent btn-full';
      submitBtn.textContent = status === 'returned' ? 'Send Back to Supervisor' : 'Submit for Review';
      submitBtn.onclick = liftSubmit;
      el.appendChild(submitBtn);
    }

    renderAttachLiftPSIAction(el, u);
  }
}

function renderAttachLiftPSIAction(container, unit) {
  if (!container) return;

  var row = document.createElement('div');
  row.className = 'pending-banner';

  if (!unit || !_curLift) {
    row.textContent = hasAttachablePSIs()
      ? 'Attach to PSI: select a lift unit first.'
      : 'Attach to PSI: no open PSI available.';
    container.appendChild(row);
    return;
  }

  if (unit.psiId) {
    var psi = (typeof loadPSI === 'function') ? loadPSI(unit.psiId) : null;
    row.textContent = 'Attached to PSI: ' + ((psi && (psi.taskDesc || psi.jobTitle)) || unit.psiId);
    container.appendChild(row);
    return;
  }

  if (!hasAttachablePSIs()) {
    row.textContent = 'Attach to PSI: no open PSI available.';
    container.appendChild(row);
    return;
  }

  var attachBtn = document.createElement('button');
  attachBtn.className = 'btn btn-secondary btn-full';
  attachBtn.textContent = 'Attach to PSI';
  attachBtn.onclick = attachCurrentLiftToPSI;
  container.appendChild(attachBtn);
}


// ── SET CHECK VALUE ───────────────────────────────────────────

function liftSetCheck(field, val) {
  if (!_curLift) return;
  var unit = _liftData.units[_curLift];
  if (!unit) return;
  if (!unit.checks) unit.checks = {};

  if (val === 'no') {
    openLiftDeficiencyModal(field);
    return;
  }

  unit.checks[field] = val;
  if (getLiftDeficiency(unit, field)) {
    removeLiftDeficiency(unit, field);
    refreshLiftRemarks(unit);
  }
  liftSave();
  ensureLiftPSIDeficiencySync(unit);
  renderLiftChecks(document.getElementById('liftRemarks') && document.getElementById('liftRemarks').disabled);
  renderLiftActions();
}


// ── SAVE ──────────────────────────────────────────────────────

function liftSave() {
  if (!_curLift) return;

  const u = _liftData.units[_curLift];
  if (!u) return;

  const opEl    = document.getElementById('liftOperator');
  const dateEl  = document.getElementById('liftDate');
  const makeEl  = document.getElementById('liftMake');
  const unitEl  = document.getElementById('liftUnit');
  const meterEl = document.getElementById('liftMeter');
  const remEl   = document.getElementById('liftRemarks');
  if (opEl    && !opEl.disabled)    u.operator = opEl.value;
  if (dateEl  && !dateEl.disabled)  u.date     = dateEl.value;
  if (makeEl  && !makeEl.disabled)  u.make     = makeEl.value;
  if (unitEl  && !unitEl.disabled)  u.unitNum  = unitEl.value;
  if (meterEl && !meterEl.disabled) u.meter    = meterEl.value;
  if (!Array.isArray(u.deficiencies)) u.deficiencies = [];
  if (remEl   && !remEl.disabled) {
    var autoText = buildLiftAutoRemarks(u);
    u.manualRemarks = parseLiftManualRemarks(remEl.value, autoText);
  }
  refreshLiftRemarks(u);

  saveLift(_liftData);
  syncLinkedLiftPSI(_curLift);
  ensureLiftPSIDeficiencySync(u);
}

function liftSaveOnly() {
  liftSave();
  toast('Changes saved');
}

function attachCurrentLiftToPSI() {
  if (!_curLift) { toast('Select a lift first'); return; }

  var idx = (typeof loadIndex === 'function') ? loadIndex() : [];
  var choices = idx.map(function(id) {
    return (typeof loadPSI === 'function') ? loadPSI(id) : null;
  }).filter(function(psi) {
    if (!psi || psi.deleted || psi.approved) return false;
    if ((psi.liftUnitKey || '') === _curLift) return false;
    var mine = (psi.createdBy || '').trim().toLowerCase() === (me.name || '').trim().toLowerCase();
    var onCrew = (psi.workers || []).some(function(w) {
      return w && w.name && w.name.trim().toLowerCase() === (me.name || '').trim().toLowerCase();
    });
    return mine || onCrew;
  });

  if (!choices.length) {
    toast('No active PSI available to attach');
    return;
  }

  var modal = document.getElementById('attachLiftPSIModal');
  var box = document.getElementById('attachLiftPSIChoices');
  if (!modal || !box) { toast('Attach picker unavailable'); return; }

  box.innerHTML = '';
  choices.forEach(function(psi) {
    var chip = document.createElement('button');
    chip.className = 'personnel-chip';
    chip.textContent = (psi.taskDesc || psi.jobTitle || 'Untitled PSI') +
      (psi.jobNumber ? ' · ' + psi.jobNumber : '');
    chip.onclick = function() {
      attachLiftToPSIId(psi.id);
    };
    box.appendChild(chip);
  });

  modal.style.display = 'flex';
  modal.classList.add('open');
}

function closeAttachLiftPSIModal() {
  var modal = document.getElementById('attachLiftPSIModal');
  if (!modal) return;
  modal.style.display = 'none';
  modal.classList.remove('open');
}

function attachLiftToPSIId(psiId) {
  if (!_curLift || !psiId) return;
  var psi = (typeof loadPSI === 'function') ? loadPSI(psiId) : null;
  var u = _liftData.units[_curLift];
  if (!u || !psi) return;

  u.psiId = psi.id;
  saveLift(_liftData);

  var prevActive = me.activePSI;
  me.activePSI = psi.id;
  prefillLiftForPSI(_curLift);
  me.activePSI = prevActive;

  closeAttachLiftPSIModal();
  if (typeof refreshDash === 'function') refreshDash();
  renderLiftActions();
  toast('Lift attached to PSI');
}

function getAttachablePSIs() {
  var idx = (typeof loadIndex === 'function') ? loadIndex() : [];
  return idx.map(function(id) {
    return (typeof loadPSI === 'function') ? loadPSI(id) : null;
  }).filter(function(psi) {
    if (!psi || psi.deleted || psi.approved) return false;
    var mine = (psi.createdBy || '').trim().toLowerCase() === (me.name || '').trim().toLowerCase();
    var onCrew = (psi.workers || []).some(function(w) {
      return w && w.name && w.name.trim().toLowerCase() === (me.name || '').trim().toLowerCase();
    });
    return mine || onCrew;
  });
}

function hasAttachablePSIs() {
  return getAttachablePSIs().length > 0;
}


// ── WORKER: SUBMIT FOR APPROVAL ───────────────────────────────

function liftSubmit() {
  if (!_curLift) { toast('Select or create a unit first'); return; }

  liftSave();

  const u = _liftData.units[_curLift];
  if (!u) return;

  if (!userRequiresSupervisorReview()) {
    u.status = 'approved';
    u.reviewAssignedTo = '';
    u.reviewNote = '';
    u.reviewedBy = me.name || '';
    u.reviewedAt = Date.now();
    u.approvedBy = me.name || '';
    u.approvedAt = Date.now();
    saveLift(_liftData);
    syncLinkedLiftPSI(_curLift);
    archiveLiftInspection(Object.assign({}, u, { unitKey: _curLift }));

    renderLiftBar();
    renderLiftActions();
    renderLiftChecks(false);

    buildMEWPPDF(u, u.opStrokes || [], u.supStrokes || []);
    toast('Lift inspection completed and PDF downloaded');
    if (typeof refreshDash === 'function') refreshDash();
    return;
  }

  u.status = 'submitted';
  u.reviewAssignedTo = '';
  u.reviewNote = '';
  u.reviewedBy = '';
  u.reviewedAt = null;
  saveLift(_liftData);
  syncLinkedLiftPSI(_curLift);

  renderLiftBar();
  renderLiftActions();
  renderLiftChecks(false);

  toast('Saved and sent for supervisor review');
  if (typeof updatePendingBadge === 'function') updatePendingBadge();
  if (typeof refreshDash === 'function') refreshDash();
}

function liftReturnForChanges() {
  if (!_curLift) { toast('Select or create a unit first'); return; }
  const u = _liftData.units[_curLift];
  if (!u) return;

  var note = prompt('What should be fixed before approval?', u.reviewNote || '');
  if (note === null) return;
  note = (note || '').trim();
  if (!note) { toast('Add a review note first'); return; }

  liftSave();
  u.status = 'returned';
  u.reviewNote = note;
  u.reviewedBy = me.name || '';
  u.reviewedAt = Date.now();
  saveLift(_liftData);
  syncLinkedLiftPSI(_curLift);

  renderLiftBar();
  renderLiftActions();
  renderLiftChecks(false);

  if (typeof updatePendingBadge === 'function') updatePendingBadge();
  if (typeof refreshDash === 'function') refreshDash();
  toast('Sent back to worker for changes');
}

// ── SUPERVISOR: APPROVE & DOWNLOAD PDF ───────────────────────

function liftApprovePDF() {
  if (!_curLift) { toast('Select or create a unit first'); return; }

  liftSave();

  const u = _liftData.units[_curLift];
  if (!u) return;

  u.status     = 'approved';
  u.approvedBy = me.name;
  u.approvedAt = Date.now();
  saveLift(_liftData);
  syncLinkedLiftPSI(_curLift);

  // Archive to history
  archiveLiftInspection(Object.assign({}, u, { unitKey: _curLift }));

  renderLiftBar();
  renderLiftActions();

  buildMEWPPDF(u, u.opStrokes || []);
  toast('✅ Inspection approved — PDF downloading');
}


// ── HISTORY TAB ────────────────────────────────────────────────

let _liftHistFilter = null;   // null = all units, or unitKey string

function renderLiftHistory() {
  const container = document.getElementById('liftHistList');
  if (!container) return;

  const hist = loadLiftHistory().filter(function(r) { return !r.deleted; });

  // Unit filter chips
  const filterBar = document.getElementById('liftHistFilter');
  if (filterBar) {
    filterBar.innerHTML = '';

    // "All" chip
    const allChip = document.createElement('button');
    allChip.className   = 'unit-chip' + (!_liftHistFilter ? ' active' : '');
    allChip.textContent = 'All';
    allChip.onclick     = function() { _liftHistFilter = null; renderLiftHistory(); };
    filterBar.appendChild(allChip);

    // Per-unit chips
    const fleet = loadFleet();
    Object.keys(fleet).forEach(function(key) {
      const chip = document.createElement('button');
      chip.className   = 'unit-chip' + (_liftHistFilter === key ? ' active' : '');
      chip.textContent = fleet[key].unitNum || key;
      chip.onclick     = function() { _liftHistFilter = key; renderLiftHistory(); };
      filterBar.appendChild(chip);
    });
  }

  // Filter records
  const items = _liftHistFilter
    ? hist.filter(function(r) { return r.unitKey === _liftHistFilter; })
    : hist;

  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = '<div class="empty"><div class="empty-icon">📋</div>' +
      '<div class="empty-title">No inspection history yet</div>' +
      '<div class="empty-sub">Approved inspections appear here.</div></div>';
    return;
  }

  items.forEach(function(record) {
    const card = document.createElement('div');
    card.className = 'lift-hist-card';

    // Header row: unit + date
    const head = document.createElement('div');
    head.className = 'lift-hist-head';

    const unitBadge = document.createElement('span');
    unitBadge.className   = 'lift-hist-unit';
    unitBadge.textContent = record.unitNum || record.unitKey || '—';

    const dateEl = document.createElement('span');
    dateEl.className   = 'lift-hist-date';
    dateEl.textContent = record.date || '—';

    head.appendChild(unitBadge);
    head.appendChild(dateEl);
    card.appendChild(head);

    // Inspector + make
    const sub = document.createElement('div');
    sub.className   = 'lift-hist-sub';
    const parts = [];
    if (record.operator) parts.push('🔧 ' + record.operator);
    if (record.make)     parts.push(record.make);
    sub.textContent = parts.join(' · ');
    card.appendChild(sub);

    // Status + deficiency badge
    const statusRow = document.createElement('div');
    statusRow.className = 'lift-hist-status-row';

    const statusBadge = document.createElement('span');
    statusBadge.className   = 'lift-hist-badge ' + (record.status || 'draft');
    statusBadge.textContent = record.status === 'approved' ? 'Approved' :
                              record.status === 'submitted' ? 'In Review' :
                              record.status === 'returned' ? 'Returned' : 'Draft';

    if (record.checks) {
      const analysis = SafetyEngine.analyseChecks(record.checks);
      if (analysis.noCount > 0) {
        const defBadge = document.createElement('span');
        defBadge.className   = 'lift-hist-badge deficiency';
        defBadge.textContent = '⚠️ ' + analysis.noCount + ' defect' + (analysis.noCount !== 1 ? 's' : '');
        statusRow.appendChild(defBadge);
      }
    }

    if (record.approvedBy) {
      const approvedEl = document.createElement('span');
      approvedEl.className   = 'lift-hist-approved-by';
      approvedEl.textContent = 'by ' + record.approvedBy;
      statusRow.appendChild(approvedEl);
    }

    card.appendChild(statusRow);

    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'lift-hist-actions';

    // Re-download PDF (everyone)
    const dlBtn = document.createElement('button');
    dlBtn.className   = 'btn btn-secondary btn-sm';
    dlBtn.textContent = 'Preview PDF';
    dlBtn.onclick     = (function(rec) {
      return function() { buildMEWPPDF(rec, rec.opStrokes || [], rec.supStrokes || [], { preview: true }); };
    })(record);
    if (typeof attachPDFHoverPreview === 'function') {
      attachPDFHoverPreview(dlBtn, function(onReady) {
        buildMEWPPDF(record, record.opStrokes || [], record.supStrokes || [], { onReady: onReady });
      });
    }
    actions.appendChild(dlBtn);

    // Delete — available to all
    const delBtn = document.createElement('button');
    delBtn.className   = 'btn btn-secondary btn-sm';
    delBtn.style.color = 'var(--accent)';
    delBtn.textContent = 'Delete';
    delBtn.onclick     = (function(rec) {
      return function() {
        if (!confirm('Remove this inspection record?')) return;
        var hist = loadLiftHistory();
        var idx  = hist.findIndex(function(r) {
          return r.unitKey === rec.unitKey && r.date === rec.date;
        });
        if (idx !== -1) {
          hist[idx].deleted   = true;
          hist[idx].deletedAt = Date.now();
          hist[idx].deletedBy = me.name;
          saveLiftHistory(hist);
        }
        renderLiftHistory();
        toast('Record removed');
      };
    })(record);
    actions.appendChild(delBtn);

    card.appendChild(actions);
    container.appendChild(card);
  });
}




