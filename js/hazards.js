/* ═══════════════════════════════════════════════════════════════
   js/hazards.js — hazard chip rendering, toggle, custom hazards
═══════════════════════════════════════════════════════════════ */

const CUSTOM_HAZARDS_KEY    = 'psi_custom_hazards';   // saved label list
const HAZARD_HISTORY_KEY    = 'psi_hazard_history';   // {jobCode: {field: count}}

function loadCustomHazardLabels() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_HAZARDS_KEY)) || []; } catch(e) { return []; }
}
function saveCustomHazardLabels(arr) {
  localStorage.setItem(CUSTOM_HAZARDS_KEY, JSON.stringify(arr));
}

function loadHazardHistory() {
  try { return JSON.parse(localStorage.getItem(HAZARD_HISTORY_KEY)) || {}; } catch(e) { return {}; }
}
function saveHazardHistory(obj) {
  localStorage.setItem(HAZARD_HISTORY_KEY, JSON.stringify(obj));
}

// Call after PSI is submitted/approved to record which hazards were used for this job
function recordHazardHistory(jobCode, hazardFields, customLabels) {
  if (!jobCode) return;
  const hist = loadHazardHistory();
  if (!hist[jobCode]) hist[jobCode] = {};
  (hazardFields || []).forEach(function(f) {
    hist[jobCode][f] = (hist[jobCode][f] || 0) + 1;
  });
  (customLabels || []).forEach(function(l) {
    const key = 'custom__' + l;
    hist[jobCode][key] = (hist[jobCode][key] || 0) + 1;
  });
  saveHazardHistory(hist);
}

// Returns set of field names / custom keys used ≥1 time for this job code
function getSuggestedHazards(jobCode) {
  if (!jobCode) return new Set();
  const hist = loadHazardHistory();
  return new Set(Object.keys(hist[jobCode] || {}));
}


// ── RENDER STANDARD HAZARDS ───────────────────────────────────

// autoAdded: optional array of fieldNames added by condition rules (shown highlighted)
function renderHazards(autoAdded) {
  const area = document.getElementById('hazardArea');
  if (!area) return;
  area.innerHTML = '';

  const autoSet    = new Set(autoAdded || []);
  const suggested  = getSuggestedHazards(_selJob);

  Object.keys(HAZARD_MAP).forEach(function(key) {
    const cat = HAZARD_MAP[key];

    const section = document.createElement('div');
    section.className = 'hazard-section';

    const label = document.createElement('div');
    label.className   = 'hazard-label';
    label.textContent = cat.label;
    section.appendChild(label);

    const grid = document.createElement('div');
    grid.className = 'chip-grid';

    cat.items.forEach(function(item) {
      const displayLabel = item[0];
      const fieldName    = item[1];

      const chip = document.createElement('div');
      const isOn      = st.hazards.has(fieldName);
      const isAuto    = autoSet.has(fieldName);
      const isSuggest = !isOn && !isAuto && suggested.has(fieldName);
      chip.className   = 'chip' + (isOn ? ' on' : '') + (isAuto ? ' auto-added' : '') + (isSuggest ? ' suggested' : '');
      chip.textContent = displayLabel;
      if (isAuto)    chip.title = 'Auto-added by job conditions';
      if (isSuggest) chip.title = 'Suggested — used on a previous similar PSI';

      chip.addEventListener('click', function() {
        if (st.hazards.has(fieldName)) {
          st.hazards.delete(fieldName);
          chip.classList.remove('on', 'auto-added', 'suggested');
        } else {
          st.hazards.add(fieldName);
          chip.classList.add('on');
          chip.classList.remove('auto-added', 'suggested');
        }
        schedSave();
      });

      grid.appendChild(chip);
    });

    section.appendChild(grid);
    area.appendChild(section);
  });

  // Also render custom hazard chips in the collapsible section
  renderCustomHazardChecks();
}


// ── CUSTOM HAZARDS ────────────────────────────────────────────

function renderCustomHazardChecks() {
  const container = document.getElementById('customHazardChecks');
  if (!container) return;
  container.innerHTML = '';

  const saved      = loadCustomHazardLabels();
  const suggested  = getSuggestedHazards(_selJob);

  if (saved.length === 0) {
    const hint = document.createElement('p');
    hint.className   = 'section-hint';
    hint.style.margin = '0 0 8px';
    hint.textContent = 'No custom hazards added yet.';
    container.appendChild(hint);
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'chip-grid';

  saved.forEach(function(label) {
    const key        = 'custom__' + label;
    const isOn       = st.customHazards.has(label);
    const isSuggest  = !isOn && suggested.has(key);

    const chip = document.createElement('div');
    chip.className   = 'chip custom-hazard-chip' + (isOn ? ' on' : '') + (isSuggest ? ' suggested' : '');
    chip.textContent = label;
    if (isSuggest) chip.title = 'Suggested — used on a previous similar PSI';

    chip.addEventListener('click', function() {
      if (st.customHazards.has(label)) {
        st.customHazards.delete(label);
        chip.classList.remove('on', 'suggested');
      } else {
        st.customHazards.add(label);
        chip.classList.add('on');
        chip.classList.remove('suggested');
      }
      schedSave();
    });

    // Long-press / right-click to delete custom hazard
    chip.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      if (confirm('Remove "' + label + '" from custom hazards?')) {
        const arr = loadCustomHazardLabels().filter(function(l) { return l !== label; });
        saveCustomHazardLabels(arr);
        st.customHazards.delete(label);
        renderCustomHazardChecks();
        schedSave();
      }
    });

    grid.appendChild(chip);
  });

  container.appendChild(grid);
}

function addCustomHazard() {
  const inp = document.getElementById('customHazardInput');
  if (!inp) return;
  const label = inp.value.trim();
  if (!label) { toast('Enter a hazard name first'); return; }

  const saved = loadCustomHazardLabels();
  if (!saved.includes(label)) {
    saved.push(label);
    saveCustomHazardLabels(saved);
  }
  // Auto-check it for this PSI
  st.customHazards.add(label);
  inp.value = '';
  renderCustomHazardChecks();
  schedSave();

  // Auto-open the custom hazards section if closed
  const section = inp.closest('.custom-hazard-section');
  if (section && !section.classList.contains('open')) section.classList.add('open');
}

function onCustomHazardKey(event) {
  if (event.key === 'Enter') { event.preventDefault(); addCustomHazard(); }
}
