/* ═══════════════════════════════════════════════════════════════
   js/lift.js — Lift / MEWP pre-use inspection
═══════════════════════════════════════════════════════════════ */

// ── STATE ─────────────────────────────────────────────────────
let _liftData  = { units: {} };   // full persisted data
let _curLift   = null;            // currently selected unit key

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
  hide('dashboard');
  hide('editor');

  const pane = document.getElementById('liftPane');
  if (pane) pane.style.display = 'flex';

  liftInit();
  showLiftTab('inspect');
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

  // If units exist, load the first one
  const keys = Object.keys(_liftData.units);
  if (keys.length > 0) {
    loadLiftUnit(_curLift && _liftData.units[_curLift] ? _curLift : keys[0]);
  } else {
    _curLift = null;
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
      status:   'draft',
    };
    saveLift(_liftData);
  }

  loadLiftUnit(key);
}


// ── LOAD UNIT ─────────────────────────────────────────────────

function loadLiftUnit(key) {
  _curLift = key;
  const u  = _liftData.units[key];
  if (!u) return;

  // Ensure status field exists on older records
  if (!u.status) u.status = 'draft';

  const isSubmitted = u.status === 'submitted' || u.status === 'approved';
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

  // Lock form fields for workers once submitted
  const lockFields = isWorker && isSubmitted;
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

  const checks = (_curLift && _liftData.units[_curLift])
    ? (_liftData.units[_curLift].checks || {})
    : {};

  LIFT_CHECKS.forEach(function(section) {
    const wrap = document.createElement('div');
    wrap.className = 'lift-check-section';

    const head = document.createElement('div');
    head.className   = 'lift-check-head';
    head.textContent = section.section;
    wrap.appendChild(head);

    section.items.forEach(function(item) {
      const row = document.createElement('div');
      row.className = 'lift-check-row';

      const lbl = document.createElement('div');
      lbl.className   = 'lift-check-label';
      lbl.textContent = item.label;

      const tri = document.createElement('div');
      tri.className = 'lift-tri';

      const curVal = checks[item.field] || 'ok';

      ['ok', 'no', 'na'].forEach(function(val) {
        const btn = document.createElement('button');
        btn.className   = 'tri-btn' + (curVal === val ? ' ' + val : '');
        btn.textContent = val.toUpperCase();
        btn.disabled    = !!locked;

        if (!locked) {
          btn.onclick = (function(field, v, triEl) {
            return function() {
              liftSetCheck(field, v);
              triEl.querySelectorAll('.tri-btn').forEach(function(b) {
                b.classList.remove('ok', 'no', 'na');
              });
              this.classList.add(v);
            };
          })(item.field, val, tri);
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

  if (me.role === 'supervisor') {
    // Deficiency summary (show before approve button)
    if (u && u.checks) {
      const analysis = SafetyEngine.analyseChecks(u.checks);
      if (analysis.noCount > 0) {
        const defBox = document.createElement('div');
        defBox.className = 'lift-deficiency-box';
        defBox.innerHTML = '<strong>⚠️ ' + analysis.noCount +
          ' Deficiencie' + (analysis.noCount !== 1 ? 's' : '') + ' found</strong>';
        analysis.noItems.forEach(function(item) {
          const row = document.createElement('div');
          row.className   = 'lift-deficiency-item';
          row.textContent = '• ' + item.label;
          defBox.appendChild(row);
        });
        el.appendChild(defBox);
      } else if (status !== 'approved') {
        const allOk = document.createElement('div');
        allOk.className   = 'lift-all-ok';
        allOk.textContent = '✅ All ' + analysis.okCount + ' items OK';
        el.appendChild(allOk);
      }
    }

    // Save + Approve/Download
    const saveBtn = document.createElement('button');
    saveBtn.className   = 'btn btn-secondary btn-full';
    saveBtn.textContent = 'Save';
    saveBtn.onclick     = liftSaveOnly;
    el.appendChild(saveBtn);

    const approveBtn = document.createElement('button');
    approveBtn.className   = 'btn btn-accent btn-full';
    approveBtn.textContent = status === 'approved' ? '↓ Re-download PDF' :
                             status === 'submitted' ? '✅ Approve & Download PDF' : 'Download PDF';
    approveBtn.onclick     = liftApprovePDF;
    el.appendChild(approveBtn);

  } else {
    // Worker
    if (status === 'submitted') {
      // Read-only — show pending banner
      const banner = document.createElement('div');
      banner.className = 'pending-banner';
      banner.innerHTML = '⏳ Awaiting Supervisor Approval';
      el.appendChild(banner);
    } else if (status === 'approved') {
      const banner = document.createElement('div');
      banner.className = 'approved-banner';
      banner.innerHTML = '✓ Approved';
      el.appendChild(banner);
    } else {
      // Draft — save + submit
      const saveBtn = document.createElement('button');
      saveBtn.className   = 'btn btn-secondary btn-full';
      saveBtn.textContent = 'Save';
      saveBtn.onclick     = liftSaveOnly;
      el.appendChild(saveBtn);

      const submitBtn = document.createElement('button');
      submitBtn.className   = 'btn btn-accent btn-full';
      submitBtn.textContent = 'Submit for Approval';
      submitBtn.onclick     = liftSubmit;
      el.appendChild(submitBtn);
    }
  }
}


// ── SET CHECK VALUE ───────────────────────────────────────────

function liftSetCheck(field, val) {
  if (!_curLift) return;
  if (!_liftData.units[_curLift].checks) {
    _liftData.units[_curLift].checks = {};
  }
  _liftData.units[_curLift].checks[field] = val;
  liftSave();
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
  if (remEl   && !remEl.disabled)   u.remarks  = remEl.value;

  saveLift(_liftData);
}

function liftSaveOnly() {
  liftSave();
  toast('✓ Inspection saved');
}


// ── WORKER: SUBMIT FOR APPROVAL ───────────────────────────────

function liftSubmit() {
  if (!_curLift) { toast('Select or create a unit first'); return; }

  liftSave();

  const u = _liftData.units[_curLift];
  u.status = 'submitted';
  saveLift(_liftData);

  renderLiftBar();
  renderLiftActions();
  renderLiftChecks(true);

  // Lock form fields
  ['liftOperator','liftDate','liftMake','liftUnit','liftMeter','liftRemarks'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) el.disabled = true;
  });

  toast('✓ Submitted for supervisor approval');
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
    statusBadge.textContent = record.status === 'approved' ? '✅ Approved' :
                              record.status === 'submitted' ? '⏳ Submitted' : 'Draft';
    statusRow.appendChild(statusBadge);

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
    dlBtn.textContent = '↓ PDF';
    dlBtn.onclick     = (function(rec) {
      return function() { buildMEWPPDF(rec, rec.opStrokes || []); };
    })(record);
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
