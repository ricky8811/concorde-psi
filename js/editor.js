/* ═══════════════════════════════════════════════════════════════
   js/editor.js — PSI editor, all 7 steps, state, autosave
═══════════════════════════════════════════════════════════════ */

// ── EDITOR STATE ──────────────────────────────────────────────
const st = {
  hazards:       new Set(),  // Set of PDF field name strings
  customHazards: new Set(),  // Set of custom hazard label strings
  taskStepsText: '',         // Free-text: task steps
  hazardText:    '',         // Free-text: potential hazards description
  controlText:   '',         // Free-text: control measures description
  ppe:           new Set(),  // Set of PPE label strings
  workers:       [],         // [{name, role}]
  sigs:          {},         // { workerIndex: {strokes, png} }
  conditions:    {},         // { outside:true, ladder:true, ... }
};

let _selJob         = null;   // currently selected job code
let _saveTimer      = null;   // debounce timer
let _curStep        = 0;
let _matchDebounce  = null;   // debounce for job matching
let _psiLocked      = false;  // true when worker opens an approved PSI (safety content locked)


// ── PERMISSION HELPERS ────────────────────────────────────────

// Returns true if the current user can edit safety content on this PSI
function canEditSafety(psi) {
  if (me.role === 'supervisor') return true;
  if (!psi) return true;
  // Workers can edit safety content only on their own non-approved drafts
  return !psi.approved && psi.createdBy === me.name;
}

// Returns true if current user can edit worker name/sig fields
function canEditWorkerFields(psi) {
  if (me.role === 'supervisor') return true;
  if (!psi) return true;
  if (!psi.approved) return true;
  return psi.worker_fields_open !== false;  // default open after approval
}


// ── NEW PSI ───────────────────────────────────────────────────

function newPSI() {
  _psiLocked = false;   // new PSIs are never locked

  // Reset state
  st.hazards       = new Set();
  st.customHazards = new Set();
  st.taskStepsText = '';
  st.hazardText    = '';
  st.controlText   = '';
  st.ppe           = new Set();
  st.workers       = [{ name: me.name, role: me.role === 'supervisor' ? 'Supervisor' : 'Worker' }];
  st.sigs          = {};
  _selJob          = null;

  // Generate ID and set active
  const id = genId();
  me.activePSI = id;

  // Default date/time
  const dateEl = document.getElementById('jobDate');
  const timeEl = document.getElementById('jobTime');
  if (dateEl) dateEl.value = todayISO();
  if (timeEl) timeEl.value = nowTime();

  // Clear job fields
  ['jobDesc','jobLoc','jobNumber','jobMuster'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  // Clear job library selection and conditions
  const jobSearch = document.getElementById('jobSearch');
  if (jobSearch) jobSearch.value = '';
  st.conditions = {};
  resetConditionPanel();

  // Save initial record
  // Auto-add weather hazards based on current conditions
  autoAddWeatherHazards();

  savePSI({});

  showEditor(0);
}


// ── OPEN EXISTING PSI ────────────────────────────────────────

function openPSI(id) {
  const psi = loadPSI(id);
  if (!psi) { toast('PSI not found'); return; }

  me.activePSI = id;

  // Restore state
  st.hazards       = new Set(psi.hazards       || []);
  st.customHazards = new Set(psi.customHazards  || []);
  st.ppe           = new Set(psi.ppe            || []);
  st.workers       = psi.workers || [{ name: me.name, role: 'Worker' }];
  st.sigs          = psi.sigs    || {};
  st.conditions    = psi.conditions || {};
  _selJob          = psi.jobCode || null;

  // Restore task / hazard / control text.
  // Backward compat: if old PSI stored tasks as array of rows, convert to text.
  if (psi.taskStepsText != null || psi.hazardText != null || psi.controlText != null) {
    st.taskStepsText = psi.taskStepsText || '';
    st.hazardText    = psi.hazardText    || '';
    st.controlText   = psi.controlText   || '';
  } else if (psi.tasks && psi.tasks.length) {
    // Old format: [['task','hazard','control'], ...]
    st.taskStepsText = psi.tasks.map(function(r) { return r[0] || ''; }).filter(Boolean).join('\n');
    st.hazardText    = psi.tasks.map(function(r) { return r[1] || ''; }).filter(Boolean).join('\n');
    st.controlText   = psi.tasks.map(function(r) { return r[2] || ''; }).filter(Boolean).join('\n');
  } else {
    st.taskStepsText = '';
    st.hazardText    = '';
    st.controlText   = '';
  }

  setTimeout(function() { restoreConditionPanel(st.conditions); }, 50);

  // Restore form fields
  const dateEl = document.getElementById('jobDate');
  const timeEl = document.getElementById('jobTime');
  if (dateEl) dateEl.value = psi.jobDate   || todayISO();
  if (timeEl) timeEl.value = psi.jobTime   || nowTime();

  const descEl   = document.getElementById('jobDesc');
  const locEl    = document.getElementById('jobLoc');
  const numEl    = document.getElementById('jobNumber');
  const mustEl   = document.getElementById('jobMuster');
  if (descEl)  descEl.value  = psi.taskDesc   || '';
  if (locEl)   locEl.value   = psi.taskLoc    || '';
  if (numEl)   numEl.value   = psi.jobNumber  || '';
  if (mustEl)  mustEl.value  = psi.musterPoint || '';

  // Determine lock state
  _psiLocked = !canEditSafety(psi);

  // Workers opening approved/others' PSIs go straight to Step 5 (signatures)
  if (_psiLocked) {
    showEditor(5);
  } else {
    showEditor(0);
  }
}


// ── SHOW EDITOR ───────────────────────────────────────────────

function showEditor(stepNum) {
  hide('dashboard');
  hide('pairUpPane');
  hide('liftPane');
  show('editor');
  goStep(stepNum);
}


// ── GO TO STEP ────────────────────────────────────────────────

function goStep(n) {
  // Locked PSI: workers can only access Step 5 (signatures)
  if (_psiLocked && n !== 5) {
    toast('PSI is approved — you can only add your signature');
    return;
  }

  // Validate step 0 → 1
  if (!_psiLocked && n > 0 && n > _curStep + 1 && _curStep === 0) {
    const desc = (document.getElementById('jobDesc') || {}).value || '';
    if (!_selJob && !desc.trim()) {
      toast('Select a job or enter a task description first');
      return;
    }
  }

  // Step 6 is supervisor-only
  if (n === 6 && me.role !== 'supervisor') {
    toast('Supervisor access required');
    return;
  }

  // Warn if going to sign step with no workers
  if (n === 5 && st.workers.filter(function(w) { return w.name; }).length === 0) {
    toast('Add at least one worker before signing');
    return;
  }

  _curStep = n;

  // Update step tabs
  const tabs = document.querySelectorAll('.step-tab');
  tabs.forEach(function(tab, i) {
    tab.classList.toggle('active', i === n);
    tab.classList.toggle('done',   i < n);
  });

  // Update progress bar (7 steps, 0–6)
  const pct = Math.round((n / 6) * 100);
  const bar = document.getElementById('stepBar');
  if (bar) bar.style.width = pct + '%';

  // Show/hide sections
  for (let i = 0; i <= 6; i++) {
    const sec = document.getElementById('step' + i);
    if (sec) sec.style.display = i === n ? 'block' : 'none';
  }

  // Render step content
  if (n === 0) { renderJobLib(''); renderWeatherAdvisory(); }
  if (n === 1) { renderHazards(); }
  if (n === 2) { renderTasks(); }
  if (n === 3) { renderPPE(); }
  if (n === 4) { renderWorkers(); }
  if (n === 5) { renderSigStep(); }
  if (n === 6) { renderApproveStep(); }

  // Scroll editor to top
  const editor = document.getElementById('editor');
  if (editor) editor.scrollTop = 0;
  window.scrollTo(0, 0);
}


// ── PSI DATE CHANGE → update forecast advisory ────────────────

function onPSIDateChange(dateStr) {
  if (typeof updateWeatherForPSIDate === 'function') {
    updateWeatherForPSIDate(dateStr);
  }
  // Also kick off forecast fetch if not loaded yet
  if (!window._wxForecastHourly && typeof fetchForecast === 'function') {
    fetchForecast().then(function() {
      updateWeatherForPSIDate(dateStr);
    });
  }
}


// ── BACK TO DASHBOARD ─────────────────────────────────────────

function edBack() {
  onTaskTextInput();   // sync textarea → state before saving
  savePSI({});         // save immediately, NOT debounced
  me.activePSI = null;
  _curStep = 0;

  hide('editor');
  show('dashboard');
  refreshDash();
}


// ── SAVE PSI ──────────────────────────────────────────────────

function savePSI(extra) {
  if (!me.activePSI) return;

  // Read existing record first (to preserve sigs already saved)
  const existing = loadPSI(me.activePSI) || {};

  // Merge existing sigs with current state (don't overwrite saved sigs)
  const mergedSigs = Object.assign({}, existing.sigs || {}, st.sigs);

  // Workers on approved PSIs can ONLY update worker/sig fields — never safety content
  const lockSafety = existing.approved && me.role !== 'supervisor';

  const record = Object.assign({}, existing, {
    id:          me.activePSI,
    createdBy:   existing.createdBy || me.name,
    createdAt:   existing.createdAt || Date.now(),
    updatedAt:   Date.now(),

    // Safety fields: only update if user has permission
    jobCode:       lockSafety ? existing.jobCode      : (_selJob || existing.jobCode || ''),
    jobDate:       lockSafety ? existing.jobDate      : ((document.getElementById('jobDate')   || {}).value || existing.jobDate   || todayISO()),
    jobTime:       lockSafety ? existing.jobTime      : ((document.getElementById('jobTime')   || {}).value || existing.jobTime   || nowTime()),
    taskDesc:      lockSafety ? existing.taskDesc     : ((document.getElementById('jobDesc')   || {}).value || existing.taskDesc   || ''),
    taskLoc:       lockSafety ? existing.taskLoc      : ((document.getElementById('jobLoc')    || {}).value || existing.taskLoc    || ''),
    jobNumber:     lockSafety ? existing.jobNumber    : ((document.getElementById('jobNumber') || {}).value || existing.jobNumber  || ''),
    musterPoint:   lockSafety ? existing.musterPoint  : ((document.getElementById('jobMuster') || {}).value || existing.musterPoint || ''),
    hazards:       lockSafety ? existing.hazards      : Array.from(st.hazards),
    customHazards: lockSafety ? existing.customHazards: Array.from(st.customHazards),
    taskStepsText: lockSafety ? existing.taskStepsText: st.taskStepsText,
    hazardText:    lockSafety ? existing.hazardText   : st.hazardText,
    controlText:   lockSafety ? existing.controlText  : st.controlText,
    ppe:           lockSafety ? existing.ppe          : Array.from(st.ppe),
    conditions:    lockSafety ? existing.conditions   : st.conditions,

    // Worker fields: always allow (checked separately in renderSigStep)
    workers:     st.workers,
    sigs:        mergedSigs,

    // Weather: don't overwrite on locked saves
    weather:         lockSafety ? existing.weather         : (window._wx || ''),
    weatherTemp:     lockSafety ? existing.weatherTemp     : (window._wxTemp != null ? window._wxTemp : undefined),
    weatherCode:     lockSafety ? existing.weatherCode     : (window._wxCode != null ? window._wxCode : undefined),
    weatherAdvisory: lockSafety ? existing.weatherAdvisory : (
      (typeof getWeatherAdvisories === 'function')
        ? getWeatherAdvisories().map(function(tip) { return tip.text; })
        : []
    ),
  }, extra);

  writePSI(record);
}


// ── AUTOSAVE (debounced) ──────────────────────────────────────

function schedSave() {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(function() { savePSI({}); }, 1500);
}


// ── CURRENT PSI DATA (for PDF) ────────────────────────────────

function currentPSIData() {
  if (!me.activePSI) return null;
  savePSI({});
  return loadPSI(me.activePSI);
}


// ═══════════════════════════════════════════════════
// STEP 0 — JOB LIBRARY
// ═══════════════════════════════════════════════════

function renderJobLib(query) {
  const lib = document.getElementById('jobLibrary');
  if (!lib) return;

  lib.innerHTML = '';
  const q = (query || '').toLowerCase().trim();

  const mem   = loadMem();
  const usage = mem.usage || {};

  // Built-in templates
  const builtins = Object.values(BUILTIN_TEMPLATES).filter(function(t) {
    if (!q) return true;
    return (t.name + ' ' + t.code + ' ' + (t.desc || '')).toLowerCase().includes(q);
  });

  // Sort by usage descending
  builtins.sort(function(a, b) {
    return (usage[b.code] || 0) - (usage[a.code] || 0);
  });

  builtins.forEach(function(t) {
    lib.appendChild(makeJobCard(t, usage[t.code] || 0));
  });

  // Learned / custom templates
  const learned = loadLearned();
  const learnedList = Object.values(learned).filter(function(t) {
    if (!q) return true;
    return (t.name + ' ' + t.code).toLowerCase().includes(q);
  });

  if (learnedList.length > 0) {
    const divider = document.createElement('div');
    divider.className   = 'jc-divider';
    divider.textContent = 'My Custom Templates';
    lib.appendChild(divider);

    learnedList.forEach(function(t) {
      lib.appendChild(makeJobCard(t, usage[t.code] || 0, true));
    });
  }

  // "＋ New template" button at bottom of list
  const newBtn = document.createElement('button');
  newBtn.className   = 'jc-new-btn';
  newBtn.textContent = '＋ New Job Template';
  newBtn.onclick     = function() {
    if (typeof openNewTemplateModal === 'function') openNewTemplateModal(true);
  };
  lib.appendChild(newBtn);

  if (lib.children.length === 1) {
    // only the new-btn, no templates matched
    const empty = document.createElement('div');
    empty.style.cssText = 'font-size:12px;color:var(--text3);padding:12px 0';
    empty.textContent   = 'No templates match "' + query + '"';
    lib.insertBefore(empty, newBtn);
  }
}

function makeJobCard(t, count, isLearned) {
  const card = document.createElement('div');
  card.className = 'job-card' + (_selJob === t.code ? ' active' : '');

  const codeEl = document.createElement('div');
  codeEl.className   = 'jc-code';
  codeEl.textContent = t.code;

  const nameWrap = document.createElement('div');
  nameWrap.style.flex = '1';

  const nameEl = document.createElement('div');
  nameEl.className   = 'jc-name';
  nameEl.textContent = t.name;

  const descEl = document.createElement('div');
  descEl.className   = 'jc-desc';
  descEl.textContent = t.desc || '';

  nameWrap.appendChild(nameEl);
  nameWrap.appendChild(descEl);

  // ✏️ Edit button — opens template editor inline without leaving the PSI
  const editBtn = document.createElement('button');
  editBtn.className   = 'jc-edit-btn';
  editBtn.textContent = '✏️';
  editBtn.title       = 'Edit this template';
  editBtn.onclick     = function(e) {
    e.stopPropagation();
    if (typeof openPresetModal === 'function') openPresetModal(t, !!isLearned, true);
  };

  const countEl = document.createElement('div');
  countEl.className   = 'jc-count';
  countEl.textContent = count > 0 ? count + 'x' : '';

  card.appendChild(codeEl);
  card.appendChild(nameWrap);
  card.appendChild(editBtn);
  card.appendChild(countEl);

  card.onclick = function() { selectJob(t.code, t); };
  return card;
}

function selectJob(code, tmpl) {
  _selJob = code;

  // Highlight selected card
  document.querySelectorAll('.job-card').forEach(function(c) {
    c.classList.remove('active');
  });
  event && event.currentTarget && event.currentTarget.classList.add('active');

  // Pre-fill fields
  const descEl  = document.getElementById('jobDesc');
  const locEl   = document.getElementById('jobLoc');
  const numEl   = document.getElementById('jobNumber');
  const mustEl  = document.getElementById('jobMuster');

  if (descEl  && tmpl.taskDesc)    descEl.value  = tmpl.taskDesc;
  if (locEl   && tmpl.taskLoc)     locEl.value   = tmpl.taskLoc;
  if (numEl   && tmpl.jobNumber)   numEl.value   = tmpl.jobNumber;
  if (mustEl  && tmpl.musterPoint) mustEl.value  = tmpl.musterPoint;

  // Pre-fill hazards
  st.hazards = new Set(tmpl.selectedHazards || []);

  // Pre-fill task / hazard / control text
  // New format: template stores text directly (set via template editor)
  // Old format: template stores taskRows array (built-in templates)
  if (tmpl.taskStepsText != null || tmpl.hazardText != null || tmpl.controlText != null) {
    st.taskStepsText = tmpl.taskStepsText || '';
    st.hazardText    = tmpl.hazardText    || '';
    st.controlText   = tmpl.controlText   || '';
  } else if (tmpl.taskRows && tmpl.taskRows.length > 0) {
    st.taskStepsText = tmpl.taskRows.map(function(r) { return r[0] || ''; }).filter(Boolean).join('\n');
    st.hazardText    = tmpl.taskRows.map(function(r) { return r[1] || ''; }).filter(Boolean).join('\n');
    st.controlText   = tmpl.taskRows.map(function(r) { return r[2] || ''; }).filter(Boolean).join('\n');
  } else {
    st.taskStepsText = '';
    st.hazardText    = '';
    st.controlText   = '';
  }

  // Pre-fill PPE
  st.ppe = new Set(tmpl.ppeSelected || []);

  // Auto-add weather-relevant hazards
  autoAddWeatherHazards();

  // Bump usage counter
  bumpUsage(code);

  // Show/hide regenerate wording button
  const regenBtn = document.getElementById('regenWordingBtn');
  if (regenBtn) regenBtn.style.display = getWording(code) ? 'inline-flex' : 'none';

  schedSave();
  toast('✓ ' + tmpl.name + ' loaded');

  // Re-render library to show active state
  renderJobLib((document.getElementById('jobSearch') || {}).value || '');
}


// ── WEATHER HAZARD AUTO-ADD ───────────────────────────────────
// Silently adds weather-relevant hazards to st.hazards when conditions warrant.

function autoAddWeatherHazards() {
  var temp = window._wxTemp;
  var code = window._wxCode;
  if (temp === null && code === null) return;

  var added = [];

  // Cold or hot → heat stress / cold exposure
  if (temp !== null && (temp <= 0 || temp >= 30)) {
    if (!st.hazards.has('env_heat_stress_cold_exposure')) {
      st.hazards.add('env_heat_stress_cold_exposure');
      added.push(temp <= 0 ? 'Cold Exposure' : 'Heat Stress');
    }
  }
  // Rain, snow, heavy showers → weather conditions + slip/trip
  if (code !== null && code >= 51) {
    if (!st.hazards.has('env_weather_conditions')) {
      st.hazards.add('env_weather_conditions');
      added.push('Weather Conditions');
    }
    if ((code >= 61 || code >= 71 || code >= 80) && !st.hazards.has('acc_slip_trip_potential_identified')) {
      st.hazards.add('acc_slip_trip_potential_identified');
      added.push('Slip / Trip');
    }
  }
  // Fog → low lighting
  if (code !== null && (code === 45 || code === 48)) {
    if (!st.hazards.has('env_lighting_levels_too_low')) {
      st.hazards.add('env_lighting_levels_too_low');
      added.push('Low Lighting (Fog)');
    }
  }

  if (added.length > 0) {
    toast('Weather: added ' + added.join(', ') + ' to hazards');
  }
}


// ── JOB MATCHING — inline suggestions while typing ────────────

function onJobDescInput() {
  const desc = (document.getElementById('jobDesc') || {}).value || '';
  clearTimeout(_matchDebounce);
  _matchDebounce = setTimeout(function() {
    showJobMatches(desc);
  }, 350);
}

function showJobMatches(text) {
  const row = document.getElementById('jobMatchRow');
  if (!row) return;
  const matches = matchJobType(text);
  if (!matches.length || !text.trim()) {
    row.style.display = 'none';
    row.innerHTML = '';
    return;
  }
  row.style.display = 'flex';
  row.innerHTML = '<span class="match-label">Looks like:</span>';
  matches.forEach(function(t) {
    const chip = document.createElement('button');
    chip.className   = 'match-chip';
    chip.textContent = t.name;
    chip.onclick     = function() {
      selectJob(t.code, t);
      row.style.display = 'none';
    };
    row.appendChild(chip);
  });
}


// ── CONDITION PANEL ────────────────────────────────────────────

function toggleCondition(key, el) {
  if (st.conditions[key]) {
    delete st.conditions[key];
    el.classList.remove('active');
  } else {
    st.conditions[key] = true;
    el.classList.add('active');
  }
}

function applyConditionPanel() {
  const tmpl = _selJob ? (BUILTIN_TEMPLATES[_selJob] || null) : null;
  if (!tmpl) {
    toast('Select a job type first to apply condition rules');
    return;
  }
  const result = applyConditions(tmpl, st.conditions);
  st.hazards = new Set(result.hazards);
  st.ppe     = new Set(result.ppe);
  renderHazards(result.autoAdded);
  renderPPE();
  schedSave();
  const n = result.autoAdded.length;
  toast('✓ Conditions applied' + (n > 0 ? ' — ' + n + ' hazard' + (n > 1 ? 's' : '') + ' auto-added' : ''));
}

function resetConditionPanel() {
  document.querySelectorAll('.cond-chip').forEach(function(el) {
    el.classList.remove('active');
  });
}

function restoreConditionPanel(conditions) {
  if (!conditions) return;
  document.querySelectorAll('.cond-chip').forEach(function(el) {
    const key = el.dataset.cond;
    if (key && conditions[key]) el.classList.add('active');
  });
}


// ── REGENERATE WORDING ─────────────────────────────────────────

function regenerateWording() {
  if (!_selJob) { toast('Select a job type first'); return; }
  const result = applyWording(_selJob);
  if (!result) { toast('No wording variants for this template'); return; }

  if (result.task) {
    const descEl = document.getElementById('jobDesc');
    if (descEl) descEl.value = result.task;
  }

  // Populate the 3 text areas from wording variant
  st.taskStepsText = result.taskStepsText || '';
  st.hazardText    = result.hazardText    || '';
  st.controlText   = result.controlText   || '';
  renderTasks();
  schedSave();
  toast('↺ Wording variant ' + result.variantNum + ' of ' + result.totalVariants);
}


// ═══════════════════════════════════════════════════
// STEP 2 — TASK STEPS
// ═══════════════════════════════════════════════════

function renderTasks() {
  // Populate the 3 separate text areas from state
  const stepsEl   = document.getElementById('taskStepsArea');
  const hazardEl  = document.getElementById('hazardTextArea');
  const controlEl = document.getElementById('controlTextArea');
  if (stepsEl)   stepsEl.value   = st.taskStepsText || '';
  if (hazardEl)  hazardEl.value  = st.hazardText    || '';
  if (controlEl) controlEl.value = st.controlText   || '';

  // Show regen button only if current job has wording variants
  const regenBtn = document.getElementById('regenWordingBtn');
  if (regenBtn) regenBtn.style.display = (_selJob && getWording(_selJob)) ? 'inline-flex' : 'none';
}

function onTaskTextInput() {
  // Sync textarea values back to state on every keystroke
  const stepsEl   = document.getElementById('taskStepsArea');
  const hazardEl  = document.getElementById('hazardTextArea');
  const controlEl = document.getElementById('controlTextArea');
  if (stepsEl)   st.taskStepsText = stepsEl.value;
  if (hazardEl)  st.hazardText    = hazardEl.value;
  if (controlEl) st.controlText   = controlEl.value;
  schedSave();
}


// ═══════════════════════════════════════════════════
// STEP 3 — PPE
// ═══════════════════════════════════════════════════

function renderPPE() {
  const grid = document.getElementById('ppeGrid');
  if (!grid) return;
  grid.innerHTML = '';

  PPE_ITEMS.forEach(function(item) {
    const div = document.createElement('div');
    div.className = 'ppe-item' + (st.ppe.has(item.label) ? ' on' : '');

    const icon = document.createElement('span');
    icon.className   = 'pi';
    icon.textContent = item.icon;

    const lbl = document.createElement('span');
    lbl.className   = 'pl';
    lbl.textContent = item.label;

    div.appendChild(icon);
    div.appendChild(lbl);

    div.onclick = function() {
      if (st.ppe.has(item.label)) {
        st.ppe.delete(item.label);
        div.classList.remove('on');
      } else {
        st.ppe.add(item.label);
        div.classList.add('on');
      }
      schedSave();
    };

    grid.appendChild(div);
  });
}


// ═══════════════════════════════════════════════════
// STEP 4 — WORKERS
// ═══════════════════════════════════════════════════

function renderWorkers() {
  const container = document.getElementById('workerRows');
  if (!container) return;
  container.innerHTML = '';

  st.workers.forEach(function(w, i) {
    container.appendChild(makeWorkerRow(w, i));
  });

  renderWorkerQuickAdd();
}

function renderWorkerQuickAdd() {
  const wrap  = document.getElementById('workerQuickAdd');
  const chips = document.getElementById('workerQuickChips');
  if (!wrap || !chips) return;

  const people = (typeof loadPersonnel === 'function') ? loadPersonnel() : [];
  if (people.length === 0) { wrap.style.display = 'none'; return; }

  // Only show people not already on the job
  const onJob = st.workers.map(function(w) { return (w.name || '').toLowerCase(); });
  const available = people.filter(function(n) { return !onJob.includes(n.toLowerCase()); });

  if (available.length === 0) { wrap.style.display = 'none'; return; }

  wrap.style.display = '';
  chips.innerHTML    = '';

  available.forEach(function(name) {
    const chip = document.createElement('button');
    chip.className   = 'personnel-chip';
    chip.textContent = name;
    chip.type        = 'button';
    chip.onclick     = function() {
      st.workers.push({ name: name, role: 'Worker' });
      schedSave();
      renderWorkers();   // refreshes list + removes chip
    };
    chips.appendChild(chip);
  });
}

function makeWorkerRow(worker, idx) {
  const row = document.createElement('div');
  row.className = 'worker-row';

  // Avatar
  const av = document.createElement('div');
  av.className   = 'worker-av';
  av.textContent = initials(worker.name);

  // Name input
  const nameIn = document.createElement('input');
  nameIn.type        = 'text';
  nameIn.className   = 'worker-name-in';
  nameIn.placeholder = 'Worker name';
  nameIn.value       = worker.name || '';
  nameIn.autocapitalize = 'words';

  nameIn.oninput = (function(i, avEl, inp) {
    return function() {
      st.workers[i].name = this.value;
      avEl.textContent   = initials(this.value);
      schedSave();
      showWorkerAutocomplete(inp, i);
    };
  })(idx, av, nameIn);

  nameIn.onblur = function() {
    // Delay hide so click on list item can fire first
    setTimeout(function() { hideWorkerAutocomplete(); }, 180);
  };

  // Role select
  const roleEl = document.createElement('select');
  roleEl.className = 'worker-role-sel';
  ['Worker', 'Lead', 'Supervisor'].forEach(function(r) {
    const opt = document.createElement('option');
    opt.value       = r;
    opt.textContent = r;
    opt.selected    = (worker.role === r);
    roleEl.appendChild(opt);
  });

  roleEl.onchange = (function(i) {
    return function() {
      st.workers[i].role = this.value;
      schedSave();
    };
  })(idx);

  // Delete button (don't allow deleting the only row)
  const del = document.createElement('button');
  del.className   = 'worker-del-btn';
  del.innerHTML   = '×';
  del.title       = 'Remove worker';
  del.onclick     = (function(i) {
    return function() {
      if (st.workers.length <= 1) { toast('At least one worker is required'); return; }
      st.workers.splice(i, 1);
      // Clear sig for removed worker
      delete st.sigs[i];
      renderWorkers();
      schedSave();
    };
  })(idx);

  row.appendChild(av);
  row.appendChild(nameIn);
  row.appendChild(roleEl);
  row.appendChild(del);
  return row;
}

// ── WORKER NAME AUTOCOMPLETE ──────────────────────────────────

let _workerAutoTarget = null; // {input, workerIdx}

function showWorkerAutocomplete(inp, workerIdx) {
  const list = document.getElementById('workerAutoList');
  if (!list) return;

  const query   = inp.value || '';
  const matches = filterWorkers(query);

  if (!matches.length) { hideWorkerAutocomplete(); return; }

  _workerAutoTarget = { input: inp, workerIdx: workerIdx };
  list.innerHTML    = '';
  matches.forEach(function(w) {
    const item = document.createElement('div');
    item.className   = 'autocomplete-item';
    item.textContent = w.name;
    item.onmousedown = function(e) {
      e.preventDefault(); // prevent blur firing before click
      selectWorkerName(w.name, workerIdx);
    };
    list.appendChild(item);
  });

  // Position below the input
  const rect = inp.getBoundingClientRect();
  const wrapRect = (document.getElementById('workerRows') || inp).getBoundingClientRect();
  list.style.top  = (rect.bottom - wrapRect.top) + 'px';
  list.style.left = (rect.left   - wrapRect.left) + 'px';
  list.style.width = rect.width + 'px';
  list.style.display = 'block';
}

function hideWorkerAutocomplete() {
  const list = document.getElementById('workerAutoList');
  if (list) list.style.display = 'none';
  _workerAutoTarget = null;
}

function selectWorkerName(name, workerIdx) {
  hideWorkerAutocomplete();

  // Update state + input
  if (st.workers[workerIdx] != null) {
    st.workers[workerIdx].name = name;
  }
  renderWorkers();
  schedSave();

  // Save to sheets
  sheetsSaveWorker(name, st.workers[workerIdx] ? st.workers[workerIdx].role : 'Worker');

  // Try to auto-load signature from sheets
  sheetsFetchSignature(name, 'full').then(function(strokes) {
    if (strokes && strokes.length) {
      toast(name + ' — signature pre-loaded');
      // Store in local memory for sig step
      const png = strokesToPNG(strokes, 400, 120);
      saveSignatureToMem(name, strokes, png);
    }
  });
}

function addWorkerRow() {
  st.workers.push({ name: '', role: 'Worker' });
  renderWorkers();
  schedSave();

  // Focus new name input
  const rows = document.getElementById('workerRows');
  if (rows) {
    const last   = rows.lastElementChild;
    const nameIn = last && last.querySelector('input');
    if (nameIn) nameIn.focus();
  }
}


// ═══════════════════════════════════════════════════
// STEP 5 — WORKER SIGNATURES
// ═══════════════════════════════════════════════════

function renderSigStep() {
  const psi = loadPSI(me.activePSI);
  const isApproved       = psi && psi.approved;
  const workerFieldsOpen = psi ? (psi.worker_fields_open !== false) : true;
  const workerCanSign    = !isApproved || workerFieldsOpen;

  // ── Approved banner ──────────────────────────────────────
  const banner = document.getElementById('approvedBanner');
  if (banner) {
    if (isApproved) {
      banner.style.display = '';
      if (!workerFieldsOpen) {
        banner.className   = 'approved-banner locked';
        banner.textContent = '🔒 PSI Approved — Signatures locked by supervisor';
      } else {
        banner.className   = 'approved-banner';
        banner.textContent = '✅ PSI Approved by ' + (psi.approvedBy || 'Supervisor') +
          ' — You can still add your signature below';
      }
    } else {
      banner.style.display = 'none';
    }
  }

  // Filter blank workers
  st.workers = st.workers.filter(function(w) { return w.name && w.name.trim(); });

  // Auto-add logged-in user if worker fields are open and they're not listed
  if (workerCanSign && me.role !== 'supervisor') {
    const alreadyListed = st.workers.some(function(w) {
      return w.name && w.name.trim().toLowerCase() === (me.name || '').trim().toLowerCase();
    });
    if (!alreadyListed && me.name) {
      st.workers.push({ name: me.name, role: 'Worker' });
      savePSI({});
    }
  }

  renderSigPanel();

  // Disable signature panel if worker fields are locked
  if (isApproved && !workerFieldsOpen && me.role !== 'supervisor') {
    const picker = document.getElementById('workerPicker');
    if (picker) {
      picker.querySelectorAll('button').forEach(function(b) { b.disabled = true; });
    }
  }

  // Supervisor sign-off button
  const btnSupSign = document.getElementById('btnSupSign');
  if (btnSupSign) {
    btnSupSign.style.display = me.role === 'supervisor' ? '' : 'none';
  }

  // Submit button — hide for locked PSIs, hide if already submitted
  const btnSubmit = document.getElementById('btnSubmit');
  if (btnSubmit) {
    if (isApproved) {
      btnSubmit.style.display = 'none';
    } else if (psi && psi.submittedForApproval) {
      btnSubmit.style.display = '';
      btnSubmit.textContent   = '⏳ Submitted — Awaiting Approval';
      btnSubmit.disabled      = true;
      btnSubmit.style.opacity = '0.6';
    } else {
      btnSubmit.style.display = '';
      btnSubmit.textContent   = 'Submit for Approval';
      btnSubmit.disabled      = false;
      btnSubmit.style.opacity = '';
    }
  }
}


// ── SUBMIT FOR APPROVAL ───────────────────────────────────────

function submitForApproval() {
  const workers = st.workers.filter(function(w) { return w.name; });
  if (workers.length === 0) { toast('Add workers before submitting'); return; }

  savePSI({ submittedForApproval: true });

  // Learn hazard selections for this job type
  if (_selJob && typeof recordHazardHistory === 'function') {
    recordHazardHistory(_selJob, Array.from(st.hazards), Array.from(st.customHazards));
  }

  toast('✓ Submitted for supervisor approval');

  // Return to dashboard after short delay
  setTimeout(function() { edBack(); }, 800);
}


// ═══════════════════════════════════════════════════
// STEP 6 — SUPERVISOR SIGN-OFF
// ═══════════════════════════════════════════════════

function renderApproveStep() {
  const workers = st.workers.filter(function(w) { return w.name; });
  const sigCount = Object.keys(st.sigs).length;

  const summaryEl = document.getElementById('supSigSummary');
  if (summaryEl) {
    summaryEl.textContent = sigCount + ' of ' + workers.length +
      ' worker' + (workers.length !== 1 ? 's' : '') + ' signed';
  }

  // Default supervisor name
  const nameEl = document.getElementById('supName');
  if (nameEl && !nameEl.value) nameEl.value = me.name || '';

  // Default datetime
  const dtEl = document.getElementById('supDateTime');
  if (dtEl && !dtEl.value) dtEl.value = nowDateTimeLocal();

  // Init supervisor sig canvas
  setTimeout(function() {
    initSigPad('supSigCanvas');

    // Load saved sig if available
    const name  = (document.getElementById('supName') || {}).value || me.name;
    const saved = loadSignatureFromMem(name);
    if (saved && saved.strokes && (!_sigStrokes['supSigCanvas'] || _sigStrokes['supSigCanvas'].length === 0)) {
      redrawStrokes('supSigCanvas', saved.strokes);
    }
  }, 50);
}


function approvePSI() {
  const nameEl  = document.getElementById('supName');
  const name    = nameEl ? nameEl.value.trim() : '';

  if (!name) { toast('Enter supervisor name'); return; }

  const canvas  = document.getElementById('supSigCanvas');
  if (!canvas || !canvas.classList.contains('signed')) {
    toast('Please sign before approving');
    return;
  }

  const strokes = (_sigStrokes['supSigCanvas'] || []).slice();
  const png     = canvasToPNG('supSigCanvas');

  // Save sup sig to memory
  saveSignatureToMem(name, strokes, png);

  savePSI({
    approved:      true,
    approvedBy:    name,
    approvedAt:    Date.now(),
    supName:       name,
    supSigStrokes: strokes,
    supSigPng:     png,
  });

  // Push supervisor strokes to sigs/{psiId} so any device can generate a complete PDF
  if (typeof firebaseSavePSISigs === 'function') {
    firebaseSavePSISigs(me.activePSI, { supervisor: { name: name, strokes: strokes } });
  }

  const psi = loadPSI(me.activePSI);
  saveLearnedTemplate(psi);
  buildPDFWithSigs(psi, { isFinal: true, supStrokes: strokes, supPng: png });
  toast('✅ PSI approved and PDF downloaded');

  setTimeout(function() { edBack(); }, 500);
}
