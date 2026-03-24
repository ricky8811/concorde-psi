/* ═══════════════════════════════════════════════════════════════
   js/presets.js — Template / Preset Manager UI
═══════════════════════════════════════════════════════════════ */

// ── STORAGE KEYS ──────────────────────────────────────────────
const TRIGGER_OVERRIDES_KEY  = 'psi_trigger_overrides';
const TEMPLATE_FULL_KEY      = 'psi_template_full_overrides';

function loadTriggerOverrides() {
  try { return JSON.parse(localStorage.getItem(TRIGGER_OVERRIDES_KEY)) || {}; } catch(e) { return {}; }
}
function saveTriggerOverrides(obj) {
  localStorage.setItem(TRIGGER_OVERRIDES_KEY, JSON.stringify(obj));
}

function loadFullOverrides() {
  try { return JSON.parse(localStorage.getItem(TEMPLATE_FULL_KEY)) || {}; } catch(e) { return {}; }
}
function saveFullOverrides(obj) {
  localStorage.setItem(TEMPLATE_FULL_KEY, JSON.stringify(obj));
}


// ── SHOW / HIDE ────────────────────────────────────────────────

function showPresetsPane() {
  hide('dashboard');
  hide('editor');
  show('presetsPane');
  renderPresetsList('');
}

function hidePresetsPane() {
  hide('presetsPane');
  // Return to the editor if a PSI is in progress, otherwise the dashboard
  if (typeof me !== 'undefined' && me.activePSI && typeof showEditor === 'function') {
    showEditor(0);
  } else {
    show('dashboard');
    if (typeof refreshDash === 'function') refreshDash();
  }
}


// ── RENDER LIST ────────────────────────────────────────────────

function renderPresetsList(query) {
  const container = document.getElementById('presetsList');
  if (!container) return;
  container.innerHTML = '';

  const q         = (query || '').toLowerCase().trim();
  const overrides = loadTriggerOverrides();

  // Built-in templates
  const builtins = Object.values(BUILTIN_TEMPLATES).filter(function(t) {
    if (!q) return true;
    return (t.name + ' ' + t.code + ' ' + (t.desc || '')).toLowerCase().includes(q);
  });

  if (builtins.length > 0) {
    const head = document.createElement('div');
    head.className   = 'preset-section-head';
    head.textContent = 'Built-in Templates (' + builtins.length + ')';
    container.appendChild(head);
    builtins.forEach(function(t) {
      container.appendChild(makePresetCard(t, false, overrides));
    });
  }

  // Learned templates
  const learned    = loadLearned();
  const learnedArr = Object.values(learned).filter(function(t) {
    if (!q) return true;
    return (t.name + ' ' + t.code).toLowerCase().includes(q);
  });

  if (learnedArr.length > 0) {
    const head2 = document.createElement('div');
    head2.className   = 'preset-section-head';
    head2.textContent = 'Learned Templates (' + learnedArr.length + ')';
    container.appendChild(head2);
    learnedArr.forEach(function(t) {
      container.appendChild(makePresetCard(t, true, overrides));
    });
  }

  if (container.children.length === 0) {
    container.innerHTML = '<div style="font-size:12px;color:var(--text3);padding:16px 0">No templates match your search.</div>';
  }
}

function makePresetCard(t, isLearned, overrides) {
  const card = document.createElement('div');
  card.className = 'preset-card';

  const codeEl = document.createElement('div');
  codeEl.className   = 'preset-card-code';
  codeEl.textContent = t.code;

  const nameEl = document.createElement('div');
  nameEl.className   = 'preset-card-name';
  nameEl.textContent = t.name;

  const editBtn = document.createElement('button');
  editBtn.className   = 'preset-card-edit';
  editBtn.textContent = 'Edit';
  editBtn.onclick     = function() { openPresetModal(t, isLearned); };

  card.appendChild(codeEl);
  card.appendChild(nameEl);
  card.appendChild(editBtn);
  return card;
}


// ── MODAL STATE ────────────────────────────────────────────────

let _editingCode    = null;
let _editingLearned = false;
let _editTriggers   = [];
let _isNewTemplate  = false;  // true when creating a brand-new template
let _fromEditor     = false;  // true when modal opened from the editor job library


// ── HELPERS ────────────────────────────────────────────────────

// Convert old taskRows [['task','hazard','control'], ...] to plain text for one column
function _rowsToText(rows, col) {
  return (rows || []).map(function(r) { return (r && r[col]) || ''; }).filter(Boolean).join('\n');
}


// ── OPEN MODAL ─────────────────────────────────────────────────

function openPresetModal(t, isLearned, fromEditor) {
  _editingCode    = t.code;
  _editingLearned = isLearned;
  _fromEditor     = !!fromEditor;

  // Load full overrides if available, else fall back to template defaults
  const fullOvr  = loadFullOverrides();
  const saved    = fullOvr[t.code] || {};

  // Trigger words: use separate override store (backward compat)
  const trigOvr  = loadTriggerOverrides();
  _editTriggers  = (trigOvr[t.code] != null)
    ? trigOvr[t.code].slice()
    : (t.triggerWords || []).slice();

  // Populate basic fields
  const titleEl = document.getElementById('presetModalTitle');
  if (titleEl) titleEl.textContent = 'Edit: ' + t.name;

  _setVal('pmName',     saved.name       != null ? saved.name       : t.name);
  _setVal('pmDesc',     saved.desc       != null ? saved.desc       : (t.desc       || ''));
  _setVal('pmTaskDesc', saved.taskDesc   != null ? saved.taskDesc   : (t.taskDesc   || ''));
  _setVal('pmLoc',      saved.taskLoc    != null ? saved.taskLoc    : (t.taskLoc    || ''));
  _setVal('pmMuster',   saved.musterPoint != null ? saved.musterPoint : (t.musterPoint || t.muster || ''));

  renderTriggerChips();
  renderHazardCheckboxes(saved.selectedHazards != null ? saved.selectedHazards : (t.selectedHazards || []));
  renderPPECheckboxes(saved.ppeSelected       != null ? saved.ppeSelected       : (t.ppeSelected    || []));

  // Populate 3 task textareas — prefer saved text, fall back to converting taskRows
  _setVal('pmTaskStepsText', saved.taskStepsText != null ? saved.taskStepsText : _rowsToText(t.taskRows, 0));
  _setVal('pmHazardText',    saved.hazardText    != null ? saved.hazardText    : _rowsToText(t.taskRows, 1));
  _setVal('pmControlText',   saved.controlText   != null ? saved.controlText   : _rowsToText(t.taskRows, 2));

  // Show/hide delete button (learned only)
  const delBtn = document.getElementById('pmDeleteBtn');
  if (delBtn) delBtn.style.display = isLearned ? 'block' : 'none';

  showFlex('presetModal');
}

function _setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}

function closePresetModal() {
  hide('presetModal');
  _editingCode    = null;
  _editTriggers   = [];
  _isNewTemplate  = false;
  _fromEditor     = false;
}


// ── CREATE NEW TEMPLATE ────────────────────────────────────────

function openNewTemplateModal(fromEditor) {
  // Generate a unique code for the new template
  const newCode = 'CUSTOM-' + Date.now().toString(36).toUpperCase().slice(-5);

  _editingCode    = newCode;
  _editingLearned = true;
  _isNewTemplate  = true;
  _fromEditor     = !!fromEditor;
  _editTriggers   = [];

  // Populate title and clear all fields
  const titleEl = document.getElementById('presetModalTitle');
  if (titleEl) titleEl.textContent = 'New Template';

  _setVal('pmName',     '');
  _setVal('pmDesc',     '');
  _setVal('pmTaskDesc', '');
  _setVal('pmLoc',      '');
  _setVal('pmMuster',   '');

  renderTriggerChips();
  renderHazardCheckboxes([]);
  renderPPECheckboxes([]);
  _setVal('pmTaskStepsText', '');
  _setVal('pmHazardText',    '');
  _setVal('pmControlText',   '');

  // Show delete button as hidden (it's new, nothing to delete yet)
  const delBtn = document.getElementById('pmDeleteBtn');
  if (delBtn) delBtn.style.display = 'none';

  showFlex('presetModal');
}


// ── TRIGGER WORD CHIPS ─────────────────────────────────────────

function renderTriggerChips() {
  const container = document.getElementById('pmTriggerChips');
  if (!container) return;
  container.innerHTML = '';

  _editTriggers.forEach(function(word, i) {
    const chip = document.createElement('span');
    chip.className = 'trigger-chip';

    const text = document.createElement('span');
    text.textContent = word;

    const del = document.createElement('button');
    del.className   = 'trigger-chip-del';
    del.textContent = '×';
    del.title       = 'Remove';
    del.onclick     = (function(idx) {
      return function() {
        _editTriggers.splice(idx, 1);
        renderTriggerChips();
      };
    })(i);

    chip.appendChild(text);
    chip.appendChild(del);
    container.appendChild(chip);
  });
}

function presetAddTrigger(event) {
  if (event.key !== 'Enter') return;
  const inp = document.getElementById('pmTriggerInput');
  if (!inp) return;
  const val = inp.value.trim().toLowerCase();
  if (!val) return;
  if (!_editTriggers.includes(val)) {
    _editTriggers.push(val);
    renderTriggerChips();
  }
  inp.value = '';
}


// ── HAZARD CHIPS ──────────────────────────────────────────────
// Tap-to-toggle chip style — matches the PSI editor Step 1 look

function renderHazardCheckboxes(selected) {
  const container = document.getElementById('pmHazardChecks');
  if (!container) return;
  container.innerHTML = '';

  const selSet = new Set(selected || []);

  Object.keys(HAZARD_MAP).forEach(function(catKey) {
    const cat = HAZARD_MAP[catKey];

    const group = document.createElement('div');
    group.className = 'pm-chip-group';

    const lbl = document.createElement('div');
    lbl.className   = 'pm-chip-group-label';
    lbl.textContent = cat.label;
    group.appendChild(lbl);

    const row = document.createElement('div');
    row.className = 'pm-chip-row';

    cat.items.forEach(function(item) {
      const field = item[1];
      const label = item[0];

      const chip = document.createElement('button');
      chip.type        = 'button';
      chip.className   = 'pm-toggle-chip' + (selSet.has(field) ? ' active' : '');
      chip.textContent = label;
      chip.dataset.field = field;
      chip.onclick = function() { chip.classList.toggle('active'); };

      row.appendChild(chip);
    });

    group.appendChild(row);
    container.appendChild(group);
  });
}


// ── PPE CHIPS ─────────────────────────────────────────────────

function renderPPECheckboxes(selected) {
  const container = document.getElementById('pmPPEChecks');
  if (!container) return;
  container.innerHTML = '';

  const selSet = new Set(selected || []);

  const row = document.createElement('div');
  row.className = 'pm-chip-row';

  PPE_ITEMS.forEach(function(item) {
    const chip = document.createElement('button');
    chip.type        = 'button';
    chip.className   = 'pm-toggle-chip' + (selSet.has(item.label) ? ' active' : '');
    chip.textContent = (item.icon ? item.icon + ' ' : '') + item.label;
    chip.dataset.value = item.label;
    chip.onclick = function() { chip.classList.toggle('active'); };

    row.appendChild(chip);
  });

  container.appendChild(row);
}


// ── SAVE EDITS ─────────────────────────────────────────────────

function savePresetEdits() {
  if (!_editingCode) return;

  // Collect basic fields
  const name     = (_getVal('pmName')     || '').trim();
  const desc     = (_getVal('pmDesc')     || '').trim();
  const taskDesc = (_getVal('pmTaskDesc') || '').trim();
  const taskLoc  = (_getVal('pmLoc')      || '').trim();
  const muster   = (_getVal('pmMuster')   || '').trim();

  // Collect hazards from active chips
  const selectedHazards = [];
  document.querySelectorAll('#pmHazardChecks .pm-toggle-chip.active').forEach(function(chip) {
    selectedHazards.push(chip.dataset.field);
  });

  // Collect PPE from active chips
  const ppeSelected = [];
  document.querySelectorAll('#pmPPEChecks .pm-toggle-chip.active').forEach(function(chip) {
    ppeSelected.push(chip.dataset.value);
  });

  // Collect task / hazard / control text (matches PSI editor layout)
  const taskStepsText = (_getVal('pmTaskStepsText') || '').trim();
  const taskHazardText  = (_getVal('pmHazardText')    || '').trim();
  const taskControlText = (_getVal('pmControlText')   || '').trim();

  // Save trigger words (backward compat store)
  const trigOvr = loadTriggerOverrides();
  trigOvr[_editingCode] = _editTriggers.slice();
  saveTriggerOverrides(trigOvr);

  // Save full overrides
  const fullOvr = loadFullOverrides();
  fullOvr[_editingCode] = {
    name:             name,
    desc:             desc,
    taskDesc:         taskDesc,
    taskLoc:          taskLoc,
    musterPoint:      muster,
    selectedHazards:  selectedHazards,
    ppeSelected:      ppeSelected,
    taskStepsText:    taskStepsText,
    hazardText:       taskHazardText,
    controlText:      taskControlText,
  };
  saveFullOverrides(fullOvr);

  if (_editingLearned) {
    const learned = loadLearned ? loadLearned() : {};

    if (_isNewTemplate) {
      // ── CREATE brand-new template ──
      if (!name) { toast('Enter a template name first'); return; }
      learned[_editingCode] = {
        code:            _editingCode,
        name:            name,
        desc:            desc,
        taskDesc:        taskDesc,
        taskLoc:         taskLoc,
        musterPoint:     muster,
        triggerWords:    _editTriggers.slice(),
        selectedHazards: selectedHazards,
        ppeSelected:     ppeSelected,
        taskStepsText:   taskStepsText,
        hazardText:      taskHazardText,
        controlText:     taskControlText,
        usageCount:      0,
      };
    } else {
      // ── UPDATE existing learned template ──
      if (learned[_editingCode]) {
        Object.assign(learned[_editingCode], {
          name:            name     || learned[_editingCode].name,
          desc:            desc,
          taskDesc:        taskDesc,
          taskLoc:         taskLoc,
          musterPoint:     muster,
          selectedHazards: selectedHazards,
          ppeSelected:     ppeSelected,
          taskStepsText:   taskStepsText,
          hazardText:      taskHazardText,
          controlText:     taskControlText,
          triggerWords:    _editTriggers.slice(),
        });
      }
    }

    saveLearned(learned);

  } else {
    // ── UPDATE built-in template (live merge + full overrides store) ──
    const t = BUILTIN_TEMPLATES[_editingCode];
    if (t) {
      if (name)             t.name            = name;
      if (desc)             t.desc            = desc;
      if (taskDesc)         t.taskDesc        = taskDesc;
      if (taskLoc)          t.taskLoc         = taskLoc;
      if (muster)           t.musterPoint     = muster;
      t.triggerWords        = _editTriggers.slice();
      t.selectedHazards     = selectedHazards;
      t.ppeSelected         = ppeSelected;
      t.taskStepsText       = taskStepsText;
      t.hazardText          = taskHazardText;
      t.controlText         = taskControlText;
    }
  }

  const wasNew      = _isNewTemplate;
  const savedCode   = _editingCode;

  closePresetModal();

  // Always refresh both the templates pane list AND the editor job library
  if (typeof renderPresetsList === 'function') {
    renderPresetsList((document.getElementById('presetsSearch') || {}).value || '');
  }
  if (typeof renderJobLib === 'function') {
    renderJobLib((document.getElementById('jobSearch') || {}).value || '');
  }

  // If the edited template is the one currently selected in the editor, re-apply it
  // so the Step 2 textareas reflect the new defaults immediately
  if (!wasNew && savedCode && typeof _selJob !== 'undefined' && _selJob === savedCode) {
    var tmpl = (typeof BUILTIN_TEMPLATES !== 'undefined' && BUILTIN_TEMPLATES[savedCode])
      || (typeof loadLearned === 'function' ? loadLearned()[savedCode] : null);
    if (tmpl && typeof selectJob === 'function') selectJob(savedCode, tmpl);
  }

  toast(wasNew ? '✓ New template created — it\'s in My Custom Templates' : '✓ Template saved');
}

function _getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}


// ── DELETE LEARNED TEMPLATE ───────────────────────────────────

function deleteLearnedTemplate() {
  if (!_editingCode || !_editingLearned) return;
  if (!confirm('Delete this template? It cannot be recovered.')) return;

  const learned = loadLearned();
  delete learned[_editingCode];
  saveLearned(learned);

  // Also remove full overrides for this code
  const fullOvr = loadFullOverrides();
  delete fullOvr[_editingCode];
  saveFullOverrides(fullOvr);

  closePresetModal();
  renderPresetsList('');
  toast('Template deleted');
}


// ── INIT: apply saved overrides on startup ─────────────────────

function applyTriggerOverrides() {
  // Apply trigger word overrides (backward compat)
  const trigOvr = loadTriggerOverrides();
  Object.keys(trigOvr).forEach(function(code) {
    if (BUILTIN_TEMPLATES[code]) {
      BUILTIN_TEMPLATES[code].triggerWords = trigOvr[code];
    }
  });

  // Apply full field overrides
  const fullOvr = loadFullOverrides();
  Object.keys(fullOvr).forEach(function(code) {
    const t   = BUILTIN_TEMPLATES[code];
    const ovr = fullOvr[code];
    if (!t || !ovr) return;
    if (ovr.name)             t.name            = ovr.name;
    if (ovr.desc)             t.desc            = ovr.desc;
    if (ovr.taskDesc)         t.taskDesc        = ovr.taskDesc;
    if (ovr.taskLoc)          t.taskLoc         = ovr.taskLoc;
    if (ovr.musterPoint)      t.musterPoint     = ovr.musterPoint;
    if (ovr.selectedHazards)  t.selectedHazards = ovr.selectedHazards;
    if (ovr.ppeSelected)      t.ppeSelected     = ovr.ppeSelected;
    // New text-field overrides (replaces old taskRows approach)
    if (ovr.taskStepsText != null) t.taskStepsText = ovr.taskStepsText;
    if (ovr.hazardText    != null) t.hazardText    = ovr.hazardText;
    if (ovr.controlText   != null) t.controlText   = ovr.controlText;
    // Backward compat: still apply taskRows if that's all we have
    if (!ovr.taskStepsText && ovr.taskRows && ovr.taskRows.length) t.taskRows = ovr.taskRows;
  });
}
