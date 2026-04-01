/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   js/editor.js â€” PSI editor, all 7 steps, state, autosave
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

// â”€â”€ EDITOR STATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
let _liftPromptShownFor = null;
let _jobCategoryOpen = {};
let _taskTextRendered = false;
let _jobWordingRequestToken = 0;
let _workImportWorkers = [];

function getAISourceLabel(pack) {
  var source = String((pack && pack._aiSource) || '').toLowerCase();
  return source === 'remote' ? 'Gemini' : 'Local fallback';
}

function toastAISource(pack, prefix) {
  var label = getAISourceLabel(pack);
  toast((prefix || 'Generated with') + ' ' + label);
}

function psiNeedsLift(psi) {
  var source = psi || {};
  var hazards = source.hazards || Array.from(st.hazards || []);
  var conditions = source.conditions || st.conditions || {};
  var code = source.jobCode || _selJob || '';
  return !!(
    conditions.lift ||
    hazards.indexOf('wah_powered_platforms') !== -1 ||
    hazards.indexOf('wah_fall arrest systems') !== -1 ||
    /(?:^|[-])(LFT|LIFT|BUCK)(?:[-]|$)/i.test(code)
  );
}

function updateLiftRequirementUI(psi) {
  var box = document.getElementById('liftRequiredBox');
  if (!box) return;
  if (!psiNeedsLift(psi)) {
    box.style.display = 'none';
    box.innerHTML = '';
    return;
  }

  var linked = psi && psi.liftUnitKey;
  var status = psi && psi.liftInspectionStatus;
  box.style.display = 'flex';
  box.innerHTML = '';

  var label = document.createElement('span');
  label.className = 'match-label';
  label.textContent = linked
    ? ('Lift: ' + linked + (status ? ' - ' + status : ''))
    : 'Lift Required';
  box.appendChild(label);

  var btn = document.createElement('button');
  btn.className = 'match-chip';
  btn.textContent = linked ? 'Open Lift Inspection' : 'Select Lift Unit';
  btn.onclick = function() {
    if (typeof openLiftLinkModal === 'function') openLiftLinkModal();
  };
  box.appendChild(btn);

  if (linked) {
    var clearBtn = document.createElement('button');
    clearBtn.className = 'match-chip';
    clearBtn.textContent = 'Clear Lift';
    clearBtn.onclick = function() {
      if (typeof unlinkLiftFromActivePSI === 'function') unlinkLiftFromActivePSI();
    };
    box.appendChild(clearBtn);

    if (typeof loadFleet === 'function') {
      var fleet = loadFleet() || {};
      var lift = fleet[linked] || {};
      var preview = document.createElement('div');
      preview.style.width = '100%';
      preview.style.marginTop = '10px';
      preview.style.padding = '10px';
      preview.style.border = '1px solid var(--line)';
      preview.style.borderRadius = '14px';
      preview.style.background = 'var(--card)';
      preview.style.display = 'grid';
      preview.style.gap = '8px';

      var title = document.createElement('div');
      title.style.fontWeight = '700';
      title.textContent = lift.unitNum || linked;
      preview.appendChild(title);

      if (lift.make) {
        var model = document.createElement('div');
        model.style.color = 'var(--text2)';
        model.style.fontSize = '13px';
        model.textContent = lift.make;
        preview.appendChild(model);
      }

      var photoUrl = '';
      if (typeof getLiftManualPhotoUrl === 'function') photoUrl = getLiftManualPhotoUrl(lift) || '';
      if (!photoUrl) photoUrl = String(lift.photoThumbDataUrl || lift.photoDataUrl || lift.photoUrl || '').trim();
      if (photoUrl) {
        var img = document.createElement('img');
        img.src = photoUrl;
        img.alt = (lift.unitNum || linked) + ' photo';
        img.style.width = '100%';
        img.style.maxHeight = '180px';
        img.style.objectFit = 'contain';
        img.style.background = '#f7f4ef';
        img.style.borderRadius = '12px';
        img.style.border = '1px solid var(--line)';
        preview.appendChild(img);
      }

      box.appendChild(preview);
    }
  }
}

function unlinkLiftFromActivePSI() {
  if (!me || !me.activePSI) return;
  var psi = (typeof loadPSI === 'function') ? loadPSI(me.activePSI) : null;
  if (!psi || !psi.liftUnitKey) return;
  if (!confirm('Remove the linked lift inspection from this PSI?')) return;

  var unitKey = psi.liftUnitKey;
  psi.liftUnitKey = '';
  psi.liftInspectionStatus = '';
  psi.liftInspectionDate = '';
  psi.liftInspectionRemarks = '';
  psi.liftInspectionReviewNote = '';
  psi.liftInspectionReviewedBy = '';
  psi.liftInspectionReviewedAt = null;
  psi.liftInspectionDeficiencies = [];

  if (typeof writePSINow === 'function') writePSINow(psi);
  else if (typeof writePSI === 'function') writePSI(psi);

  if (typeof loadLift === 'function' && typeof saveLift === 'function') {
    var liftData = loadLift();
    if (liftData && liftData.units && liftData.units[unitKey]) {
      var unit = liftData.units[unitKey];
      if ((unit.psiId || '') === psi.id) {
        unit.psiId = '';
        unit.baseRemarks = '';
        if (typeof refreshLiftRemarks === 'function') refreshLiftRemarks(unit);
        saveLift(liftData);
      }
    }
  }

  if (typeof renderSigStep === 'function' && typeof _curStep !== 'undefined' && _curStep === 5) {
    renderSigStep();
  }
  if (typeof updateLiftRequirementUI === 'function') updateLiftRequirementUI(psi);
  if (typeof refreshDash === 'function') refreshDash();
  toast('Lift removed from PSI');
}

function maybePromptLiftLink(psi) {
  if (!psi || !psi.id) return;
  if (!psiNeedsLift(psi)) return;
  if (psi.liftUnitKey) return;
  if (_liftPromptShownFor === psi.id) return;
  _liftPromptShownFor = psi.id;
  if (typeof openLiftLinkModal === 'function') openLiftLinkModal();
}


// â”€â”€ PERMISSION HELPERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Returns true if the current user can edit safety content on this PSI
function canEditSafety(psi) {
  if (!me) return true;
  if (me.role === 'supervisor') return true;
  if (!psi) return true;
  // Workers can edit any non-approved PSI so the crew can join and update work in progress.
  return !psi.approved;
}

// Returns true if current user can edit worker name/sig fields
function canEditWorkerFields(psi) {
  if (me.role === 'supervisor') return true;
  if (!psi) return true;
  if (!psi.approved) return true;
  return psi.worker_fields_open !== false;  // default open after approval
}


// â”€â”€ NEW PSI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function newPSI() {
  if (typeof stopActivePSISync === 'function') stopActivePSISync();
  _psiLocked = false;   // new PSIs are never locked
  _liftPromptShownFor = null;
  _jobCategoryOpen = {};
  _taskTextRendered = false;

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
  if (typeof setSessionActivePSI === 'function') setSessionActivePSI(id);

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
  ['taskStepsArea','hazardTextArea','controlTextArea'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  // Clear job library selection and conditions
  const jobSearch = document.getElementById('jobSearch');
  if (jobSearch) jobSearch.value = '';
  setJobLibraryCollapsed(false, null);
  st.conditions = {};
  resetConditionPanel();

  // Save initial record
  // Auto-add weather hazards based on current conditions
  autoAddWeatherHazards();

  savePSI({ unpublished: true, publishedAt: null });

  showEditor(0);
}

function isUnpublishedPSI(psi) {
  return !!(psi && psi.unpublished);
}

function publishActivePSI() {
  if (!me.activePSI || typeof loadPSI !== 'function') return null;
  var psi = loadPSI(me.activePSI);
  if (!psi) return null;
  if (!isUnpublishedPSI(psi)) return psi;
  return savePSI({
    unpublished: false,
    publishedAt: psi.publishedAt || Date.now()
  }, { immediate: true });
}

function openWorkOrderImportModal() {
  const modal = document.getElementById('workOrderImportModal');
  const textEl = document.getElementById('workOrderImportText');
  const dateEl = document.getElementById('workOrderImportDate');
  const timeEl = document.getElementById('workOrderImportTime');
  if (!modal) return;
  _workImportWorkers = [{
    name: String((me && me.name) || '').trim(),
    role: me && me.role === 'supervisor' ? 'Supervisor' : 'Worker'
  }].filter(function(w) { return w.name; });
  if (dateEl && !dateEl.value) dateEl.value = todayISO();
  if (timeEl && !timeEl.value) timeEl.value = nowTime();
    renderWorkOrderImportWorkers(true);
    if (typeof ensureApprovedWorkerDirectoryLoaded === 'function') {
      Promise.resolve(ensureApprovedWorkerDirectoryLoaded()).then(function() {
        renderWorkOrderImportWorkers();
      }).catch(function() {
        renderWorkOrderImportWorkers();
      });
    }
  modal.style.display = 'flex';
  modal.classList.add('open');
  renderWorkOrderPreview();
  setTimeout(function() {
    if (textEl) textEl.focus();
  }, 60);
}

function closeWorkOrderImportModal() {
  const modal = document.getElementById('workOrderImportModal');
  if (!modal) return;
  modal.style.display = 'none';
  modal.classList.remove('open');
  renderWorkOrderPreview('');
}

function renderWorkOrderImportWorkers(isLoading) {
    var box = document.getElementById('workOrderImportWorkers');
    var selectedBox = document.getElementById('workOrderImportSelectedWorkers');
    if (!box) return;
    var people = (typeof getWorkerDirectory === 'function') ? getWorkerDirectory() : [];
    var selected = {};
    (_workImportWorkers || []).forEach(function(worker) {
      var key = String((worker && worker.name) || '').trim().toLowerCase();
      if (key) selected[key] = worker;
    });
    box.innerHTML = '';
    if (selectedBox) {
      selectedBox.innerHTML = '';
      if (_workImportWorkers && _workImportWorkers.length) {
        _workImportWorkers.forEach(function(worker) {
          var name = String((worker && worker.name) || '').trim();
          if (!name) return;
          var pill = document.createElement('button');
          pill.type = 'button';
          pill.className = 'selected-worker-pill';
          pill.title = 'Remove ' + name;
          pill.innerHTML = '<span>' + name + '</span><strong>&times;</strong>';
          pill.onclick = function() {
            _workImportWorkers = _workImportWorkers.filter(function(entry) {
              return String((entry && entry.name) || '').trim().toLowerCase() !== name.toLowerCase();
            });
            renderWorkOrderImportWorkers();
          };
          selectedBox.appendChild(pill);
        });
      } else {
        var hint = document.createElement('div');
        hint.className = 'selected-worker-empty';
        hint.textContent = 'No crew selected yet.';
        selectedBox.appendChild(hint);
      }
    }

    if (isLoading && !people.length) {
      var loading = document.createElement('div');
      loading.className = 'form-note';
      loading.textContent = 'Loading crew names...';
      box.appendChild(loading);
      return;
    }

    if (!people.length) {
      var empty = document.createElement('div');
      empty.className = 'form-note';
      empty.textContent = 'No worker names available yet. Refresh once if names do not appear.';
      box.appendChild(empty);
      return;
    }

  people.forEach(function(person) {
    var name = String((person && person.name) || '').trim();
    if (!name) return;
    var key = name.toLowerCase();
    var chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'person-chip' + (selected[key] ? ' active' : '');
    chip.textContent = name;
    chip.onclick = function() {
      if (selected[key]) {
        _workImportWorkers = _workImportWorkers.filter(function(worker) {
          return String((worker && worker.name) || '').trim().toLowerCase() !== key;
        });
      } else {
        _workImportWorkers.push({
          name: name,
          role: person.role === 'supervisor' ? 'Supervisor' : 'Worker',
          uid: person.uid || '',
          email: person.email || ''
        });
      }
      renderWorkOrderImportWorkers();
    };
    box.appendChild(chip);
  });
}

function getWorkOrderImportSettings() {
  var dateEl = document.getElementById('workOrderImportDate');
  var timeEl = document.getElementById('workOrderImportTime');
  var spacingEl = document.getElementById('workOrderImportSpacing');
  var safeWorkers = (_workImportWorkers || []).filter(function(worker) {
    return worker && String(worker.name || '').trim();
  });
  if (!safeWorkers.length && me && me.name) {
    safeWorkers = [{ name: me.name, role: me.role === 'supervisor' ? 'Supervisor' : 'Worker' }];
  }
  return {
    jobDate: (dateEl && dateEl.value) || todayISO(),
    jobTime: (timeEl && timeEl.value) || nowTime(),
    spacingMinutes: Math.max(0, Number((spacingEl && spacingEl.value) || 0)),
    workers: safeWorkers.map(function(worker) {
      return {
        name: String(worker.name || '').trim(),
        role: String(worker.role || 'Worker').trim() || 'Worker',
        uid: String(worker.uid || '').trim(),
        email: String(worker.email || '').trim()
      };
    })
  };
}

function addMinutesToClockTime(timeText, minutesToAdd) {
  var text = String(timeText || '').trim();
  var match = text.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return nowTime();
  var hours = Number(match[1]);
  var minutes = Number(match[2]);
  var total = (hours * 60) + minutes + Math.max(0, Number(minutesToAdd || 0));
  total = ((total % 1440) + 1440) % 1440;
  var nextHours = Math.floor(total / 60);
  var nextMinutes = total % 60;
  return String(nextHours).padStart(2, '0') + ':' + String(nextMinutes).padStart(2, '0');
}

function parseWorkOrderText(text) {
  return (text || '')
    .split(/\r?\n/)
    .map(function(line) { return line.trim(); })
    .filter(Boolean)
    .map(function(line, idx) {
      if (/^add to bookmarks$/i.test(line)) return null;

      var match = line.match(/^\s*(?:(WO)\s*)?(\d{7}|[A-Za-z]{0,4}\d[\w-]*)\s*[-:]\s*(.+)\s*$/i);
      if (match) {
        var prefix = String(match[1] || '').trim().toUpperCase();
        var number = String(match[2] || '').trim();
        return {
          id: idx,
          raw: line,
          workOrder: prefix ? (prefix + ' ' + number) : number,
          taskText: match[3].trim(),
        };
      }

      var cells = line.split(/\t+/).map(function(cell) {
        return String(cell || '').replace(/\s+/g, ' ').trim();
      }).filter(Boolean);

      if (cells.length) {
        var woCell = cells.find(function(cell) {
          return /^\d{7}$/.test(cell) || /^WO\s*\d{7}$/i.test(cell);
        });

        if (woCell) {
          var cleanWO = String(woCell).replace(/^WO\s*/i, '').trim();
          var taskCell = cells.find(function(cell) {
            if (!cell || cell === woCell) return false;
            if (/^\d{7}$/.test(cell)) return false;
            if (/^(APPR|INPR|DRAFT|PM|AM)$/i.test(cell)) return false;
            if (/^\d{2}\/\d{2}\/\d{2}/.test(cell)) return false;
            if (/^\d+:\d+$/.test(cell)) return false;
            return /[A-Za-z]/.test(cell) && cell.length > 10;
          }) || cells[cells.indexOf(woCell) + 1] || '';

          return {
            id: idx,
            raw: line,
            workOrder: cleanWO,
            taskText: String(taskCell || '').trim() || line,
          };
        }
      }

      return {
        id: idx,
        raw: line,
        workOrder: '',
        taskText: line,
      };
    })
    .filter(Boolean);
}

function titleCaseWords(text) {
  return (text || '').replace(/\w\S*/g, function(word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

function normalizeTaskText(text) {
  var clean = (text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  clean = clean.replace(/\bwo[\s-]?\d+\b/ig, '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  return titleCaseWords(clean);
}

function deriveShortJobTitle(taskText, tmpl) {
  if (tmpl && tmpl.name) return tmpl.name;
  var clean = normalizeTaskText(taskText);
  if (!clean) return 'Imported Work Order';
  return clean.split(/\s+/).slice(0, 6).join(' ');
}

function getImportPreviewTaskDesc(taskText, tmpl) {
  var base = (tmpl && (tmpl.taskDesc || tmpl.name || tmpl.code)) || normalizeTaskText(taskText) || 'Custom work';
  return String(base).replace(/\s+/g, ' ').trim();
}

function describeImportMatch(item) {
  var sourceText = item.taskText || item.raw || '';
  var tmpl = matchJobType(sourceText)[0] || null;
  var importedWeather = (typeof getPSIWeatherPayload === 'function')
    ? getPSIWeatherPayload(todayISO(), {})
    : { weather: '', weatherTemp: undefined, weatherCode: undefined, weatherAdvisory: [] };

  return {
    item: item,
    template: tmpl,
    taskDesc: getImportPreviewTaskDesc(sourceText, tmpl),
    title: tmpl ? (tmpl.code || tmpl.name || 'Matched template') : 'Custom PSI',
    meta: item.workOrder ? ('WO ' + item.workOrder) : 'No work order detected',
    note: tmpl ? ('Matched to ' + (tmpl.name || tmpl.code || 'template')) : 'No template match, AI will build from your wording',
  };
}

function renderWorkOrderPreview(forcedText) {
  var box = document.getElementById('workOrderPreview');
  var textEl = document.getElementById('workOrderImportText');
  if (!box) return;

  var text = typeof forcedText === 'string' ? forcedText : (textEl ? textEl.value : '');
  var items = parseWorkOrderText(text);
  box.innerHTML = '';

  if (!items.length) {
    box.className = 'work-import-preview empty';
    box.textContent = 'Paste jobs or work orders to preview the PSIs that will be created.';
    return;
  }

  box.className = 'work-import-preview';

  items.forEach(function(item) {
    var info = describeImportMatch(item);

    var row = document.createElement('div');
    row.className = 'work-import-item';

    var top = document.createElement('div');
    top.className = 'work-import-title';

    var title = document.createElement('span');
    title.textContent = info.taskDesc;
    top.appendChild(title);

    var pill = document.createElement('span');
    pill.className = 'work-import-pill';
    pill.textContent = info.title;
    top.appendChild(pill);

    var meta = document.createElement('div');
    meta.className = 'work-import-meta';
    meta.textContent = info.meta + ' - ' + (normalizeTaskText(item.taskText || item.raw) || item.raw || '');

    var note = document.createElement('div');
    note.className = 'work-import-meta';
    note.textContent = info.note;

    row.appendChild(top);
    row.appendChild(meta);
    row.appendChild(note);
    box.appendChild(row);
  });
}

function buildImportedPSIRecord(item, tmpl, opts) {
    opts = opts || {};
    var hazards = new Set((tmpl && tmpl.selectedHazards) || []);
    var ppe = new Set((tmpl && tmpl.ppeSelected) || []);
    var importedWeather = (typeof getPSIWeatherPayload === 'function')
      ? getPSIWeatherPayload(opts.jobDate || todayISO(), {})
      : { weather: '', weatherTemp: undefined, weatherCode: undefined, weatherAdvisory: [] };
    var aiPack = opts.aiPack || ((window.AIEngine && typeof AIEngine.generateTaskPack === 'function')
      ? AIEngine.generateTaskPack(item.taskText, tmpl, { workOrder: item.workOrder || '' })
      : null);
  var taskStepsText = aiPack ? (aiPack.taskStepsText || '') : '';
  var hazardText = aiPack ? (aiPack.hazardText || '') : '';
  var controlText = aiPack ? (aiPack.controlText || '') : '';

  return {
    id: genId(),
    createdBy: me.name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    jobCode: tmpl ? tmpl.code : '',
    jobTitle: opts.jobTitle || (aiPack && aiPack.shortTitle) || deriveShortJobTitle(item.taskText, tmpl),
    jobDate: opts.jobDate || todayISO(),
    jobTime: opts.jobTime || nowTime(),
      taskDesc: (tmpl && (tmpl.taskDesc || tmpl.name)) || normalizeTaskText(item.taskText) || 'Imported work order',
    taskLoc: (tmpl && tmpl.taskLoc) || '',
    jobNumber: item.workOrder || '',
    workOrders: opts.workOrders || [{
      number: item.workOrder || '',
      description: item.taskText || '',
      raw: item.raw || '',
    }],
    musterPoint: (tmpl && tmpl.musterPoint) || '',
    hazards: Array.from(hazards),
    customHazards: [],
    taskStepsText: taskStepsText,
    hazardText: hazardText,
    controlText: controlText,
      ppe: Array.from(ppe),
      conditions: {},
      workers: (opts.workers && opts.workers.length) ? opts.workers.slice() : [{ name: me.name, role: me.role === 'supervisor' ? 'Supervisor' : 'Worker' }],
      importBatchId: String(opts.importBatchId || '').trim(),
      importBatchMode: String(opts.importBatchMode || '').trim(),
      sigs: {},
      initials: [],
    weather: importedWeather.weather,
    weatherTemp: importedWeather.weatherTemp,
    weatherCode: importedWeather.weatherCode,
    weatherAdvisory: importedWeather.weatherAdvisory,
    approved: false,
    submittedForApproval: false,
  };
}

function importWorkOrders(mode) {
  var textEl = document.getElementById('workOrderImportText');
  var items = parseWorkOrderText(textEl ? textEl.value : '');
  if (!items.length) { toast('Paste at least one work order'); return; }
  var batchSettings = getWorkOrderImportSettings();

  var created = [];
  var aiSources = [];
  toast('Building PSI drafts...');

  function finishImport() {
    if (textEl) textEl.value = '';
    renderWorkOrderPreview('');
    closeWorkOrderImportModal();
  me.activePSI = null;
  if (typeof setSessionActivePSI === 'function') setSessionActivePSI('');
  hide('editor');
  show('dashboard');
  refreshDash();
    toast('Created ' + created.length + ' PSI draft' + (created.length !== 1 ? 's' : ''));
    if (aiSources.length) {
      var usedRemote = aiSources.indexOf('remote') !== -1;
      var usedLocal = aiSources.indexOf('local') !== -1;
      if (usedRemote && usedLocal) toast('AI source: Gemini with local fallback');
      else toast('AI source: ' + (usedRemote ? 'Gemini' : 'Local fallback'));
    }
  }

    if (mode === 'group') {
    var joinedTask = items.map(function(item) {
      return normalizeTaskText(item.taskText) || item.taskText || item.raw;
    }).filter(Boolean).join(' | ');
      var groupedItem = {
        raw: items.map(function(item) { return item.raw; }).join('\n'),
        workOrder: items.map(function(item) { return item.workOrder; }).filter(Boolean).join(', '),
        taskText: joinedTask,
      };
      var groupedTemplate = matchJobType(joinedTask)[0] || null;
      var groupedBatchId = genId();
      var groupedPromise = (window.AIEngine && typeof AIEngine.generateTaskPackAsync === 'function')
        ? AIEngine.generateTaskPackAsync(joinedTask, groupedTemplate, { workOrder: groupedItem.workOrder || '' })
        : Promise.resolve(null);
      groupedPromise.then(function(aiPack) {
        aiSources.push(String((aiPack && aiPack._aiSource) || 'local').toLowerCase());
        var groupedRecord = buildImportedPSIRecord(groupedItem, groupedTemplate, {
          aiPack: aiPack,
          jobTitle: (aiPack && aiPack.shortTitle) || (groupedTemplate ? groupedTemplate.name : 'Grouped Work Orders'),
          jobDate: batchSettings.jobDate,
          jobTime: batchSettings.jobTime,
          workers: batchSettings.workers,
          importBatchId: groupedBatchId,
          importBatchMode: 'group',
          workOrders: items.map(function(item) {
            return {
              number: item.workOrder || '',
            description: item.taskText || '',
            raw: item.raw || '',
          };
        }),
      });
      writePSI(groupedRecord);
      created.push(groupedRecord);
      finishImport();
      });
      return;
    }
    var splitBatchId = genId();
    Promise.all(items.map(function(item, itemIndex) {
      var tmpl = matchJobType(item.taskText || item.raw)[0] || null;
      var aiPromise = (window.AIEngine && typeof AIEngine.generateTaskPackAsync === 'function')
        ? AIEngine.generateTaskPackAsync(item.taskText || item.raw, tmpl, { workOrder: item.workOrder || '' })
        : Promise.resolve(null);
      return aiPromise.then(function(aiPack) {
        aiSources.push(String((aiPack && aiPack._aiSource) || 'local').toLowerCase());
        var record = buildImportedPSIRecord(item, tmpl, {
          aiPack: aiPack,
          jobDate: batchSettings.jobDate,
          jobTime: addMinutesToClockTime(batchSettings.jobTime, batchSettings.spacingMinutes * itemIndex),
          workers: batchSettings.workers,
          importBatchId: splitBatchId,
          importBatchMode: 'split'
        });
        writePSI(record);
        created.push(record);
    });
  })).then(finishImport);
}


// â”€â”€ OPEN EXISTING PSI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function openPSI(id) {
  const psi = loadPSI(id);
  if (!psi) { toast('PSI not found'); return; }

  me.activePSI = id;
  if (typeof setSessionActivePSI === 'function') setSessionActivePSI(id);
  if (typeof startActivePSISync === 'function') startActivePSISync(id);
  _liftPromptShownFor = psi.liftUnitKey ? psi.id : null;
  _taskTextRendered = false;

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

  if (!psi.approved && !userHasFullAccess() && me && me.name) {
    const myName = String(me.name || '').trim().toLowerCase();
    const myUid = String(me.uid || '').trim();
    const myEmail = String(me.email || '').trim().toLowerCase();
    const alreadyListed = st.workers.some(function(w) {
      var worker = w || {};
      if (myUid && String(worker.uid || '').trim() === myUid) return true;
      if (myEmail && String(worker.email || '').trim().toLowerCase() === myEmail) return true;
      return String(worker.name || '').trim().toLowerCase() === myName;
    });
    if (!alreadyListed) {
      st.workers.push({
        name: me.name,
        role: 'Worker',
        uid: me.uid || '',
        email: me.email || ''
      });
      savePSI({}, { immediate: true });
    }
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
  updateLiftRequirementUI(psi);

  // Determine lock state
  _psiLocked = !canEditSafety(psi);

  // Workers opening approved/others' PSIs go straight to Step 5 (signatures)
  if (_psiLocked) {
    showEditor(5);
  } else {
    showEditor(0);
  }
}


// â”€â”€ SHOW EDITOR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function showEditor(stepNum) {
  hide('dashboard');
  hide('pairUpPane');
  hide('liftPane');
  show('editor');
  if (typeof setSessionActivePane === 'function') setSessionActivePane('editor');
  goStep(stepNum);
}


// â”€â”€ GO TO STEP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function goStep(n) {
  // Locked PSI: workers can only access Step 5 (signatures)
  if (_psiLocked && n !== 5) {
    toast('PSI is approved - you can only add your signature');
    return;
  }

  // Validate step 0 â†’ 1
  if (!_psiLocked && n > 0 && n > _curStep + 1 && _curStep === 0) {
    const desc = (document.getElementById('jobDesc') || {}).value || '';
    if (!_selJob && !desc.trim()) {
      toast('Select a job or enter a task description first');
      return;
    }
  }

  // Supervisor approval now happens from the Review queue only.
  if (n === 6) {
    toast('Supervisor approval happens in Review');
    return;
  }

  // Warn if going to sign step with no workers
  if (n === 5 && st.workers.filter(function(w) { return w.name; }).length === 0) {
    toast('Add at least one worker before signing');
    return;
  }

  _curStep = n;
  if (typeof setSessionActivePSIStep === 'function') setSessionActivePSIStep(n);

  // Update step tabs
  const tabs = document.querySelectorAll('.step-tab');
  tabs.forEach(function(tab, i) {
    tab.classList.toggle('active', i === n);
    tab.classList.toggle('done',   i < n);
  });

  // Update progress bar (6 visible steps, 0-5)
  const pct = Math.round((Math.min(n, 5) / 5) * 100);
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


// â”€â”€ PSI DATE CHANGE â†’ update forecast advisory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  renderWeatherAdvisory();
}


// â”€â”€ BACK TO DASHBOARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function edBack() {
  var activePsi = me.activePSI && typeof loadPSI === 'function' ? loadPSI(me.activePSI) : null;
  if (isUnpublishedPSI(activePsi)) {
    if (!confirm('This PSI has not been published yet. Discard it?')) return;
    if (typeof deletePSI === 'function') deletePSI(me.activePSI);
    if (typeof flushPendingFirebaseWrites === 'function') flushPendingFirebaseWrites();
    if (typeof stopActivePSISync === 'function') stopActivePSISync();
    me.activePSI = null;
    if (typeof setSessionActivePSI === 'function') setSessionActivePSI('');
    if (typeof setSessionActivePSIStep === 'function') setSessionActivePSIStep(0);
    if (typeof setSessionActivePane === 'function') setSessionActivePane('dashboard');
    _curStep = 0;

    hide('editor');
    show('dashboard');
    refreshDash();
    return;
  }
  onTaskTextInput();   // sync textarea â†’ state before saving
  savePSI({}, { immediate: true });         // save immediately, NOT debounced
  if (typeof flushPendingFirebaseWrites === 'function') flushPendingFirebaseWrites();
  if (typeof stopActivePSISync === 'function') stopActivePSISync();
  me.activePSI = null;
  if (typeof setSessionActivePSI === 'function') setSessionActivePSI('');
  if (typeof setSessionActivePSIStep === 'function') setSessionActivePSIStep(0);
  if (typeof setSessionActivePane === 'function') setSessionActivePane('dashboard');
  _curStep = 0;

  hide('editor');
  show('dashboard');
  refreshDash();
  if (typeof firebaseRefreshPSIsFromServer === 'function') {
    firebaseRefreshPSIsFromServer(true).catch(function() {});
  }
  setTimeout(function() {
    if (typeof refreshDash === 'function') refreshDash();
  }, 180);
}


// â”€â”€ SAVE PSI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function savePSI(extra, opts) {
  if (!me.activePSI) return;
  opts = opts || {};

  // Read existing record first (to preserve sigs already saved)
  const existing = loadPSI(me.activePSI) || {};

  // Merge existing sigs with current state (don't overwrite saved sigs)
  const mergedSigs = Object.assign({}, existing.sigs || {}, st.sigs);

  // Workers on approved PSIs can ONLY update worker/sig fields â€” never safety content
  const lockSafety = existing.approved && !userHasFullAccess();
  const editingTaskText = !lockSafety && _curStep === 2 && _taskTextRendered;

  if (editingTaskText) {
    const stepsEl   = document.getElementById('taskStepsArea');
    const hazardEl  = document.getElementById('hazardTextArea');
    const controlEl = document.getElementById('controlTextArea');
    if (stepsEl)   st.taskStepsText = stepsEl.value;
    if (hazardEl)  st.hazardText    = hazardEl.value;
    if (controlEl) st.controlText   = controlEl.value;
  }

  const currentWorkers = (typeof normalizePSIWorkers === 'function')
    ? normalizePSIWorkers(st.workers)
    : (st.workers || []).filter(function(w) {
        return w && String(w.name || '').trim();
      });
  const existingWorkers = (typeof normalizePSIWorkers === 'function')
    ? normalizePSIWorkers(existing.workers || [])
    : (existing.workers || []).filter(function(w) {
        return w && String(w.name || '').trim();
      });
  const recoveredWorkers = (!currentWorkers.length && typeof recoverPSIWorkers === 'function')
    ? normalizePSIWorkers((recoverPSIWorkers(Object.assign({}, existing)) || {}).workers || [])
    : [];
  const safeWorkers = currentWorkers.length ? currentWorkers : (existingWorkers.length ? existingWorkers : recoveredWorkers);
  const currentHazards = Array.from(st.hazards || []);
  const currentCustomHazards = Array.from(st.customHazards || []);
  const safeHazards = currentHazards.length ? currentHazards : (existing.hazards || []);
  const safeCustomHazards = currentCustomHazards.length ? currentCustomHazards : (existing.customHazards || []);
  const existingTaskStepsText = String(existing.taskStepsText || '');
  const existingHazardText = String(existing.hazardText || '');
  const existingControlText = String(existing.controlText || '');
  const currentTaskStepsText = String(st.taskStepsText || '');
  const currentHazardText = String(st.hazardText || '');
  const currentControlText = String(st.controlText || '');
  const safeTaskStepsText = (!editingTaskText && !currentTaskStepsText.trim() && existingTaskStepsText.trim())
    ? existingTaskStepsText
    : currentTaskStepsText;
  const safeHazardText = (!editingTaskText && !currentHazardText.trim() && existingHazardText.trim())
    ? existingHazardText
    : currentHazardText;
  const safeControlText = (!editingTaskText && !currentControlText.trim() && existingControlText.trim())
    ? existingControlText
    : currentControlText;
  const psiDateValue = lockSafety
    ? existing.jobDate
    : ((document.getElementById('jobDate') || {}).value || existing.jobDate || todayISO());
  const psiWeather = lockSafety
    ? {
        weather: existing.weather,
        weatherTemp: existing.weatherTemp,
        weatherCode: existing.weatherCode,
        weatherAdvisory: existing.weatherAdvisory || []
      }
    : ((typeof getPSIWeatherPayload === 'function')
      ? getPSIWeatherPayload(psiDateValue, st.conditions)
      : { weather: '', weatherTemp: undefined, weatherCode: undefined, weatherAdvisory: [] });

  const record = Object.assign({}, existing, {
    id:          me.activePSI,
    createdBy:   existing.createdBy || me.name,
    createdAt:   existing.createdAt || Date.now(),
    updatedAt:   Date.now(),

    // Safety fields: only update if user has permission
    jobCode:       lockSafety ? existing.jobCode      : (_selJob || existing.jobCode || ''),
    jobTitle:      existing.jobTitle || '',
    jobDate:       psiDateValue,
    jobTime:       lockSafety ? existing.jobTime      : ((document.getElementById('jobTime')   || {}).value || existing.jobTime   || nowTime()),
    taskDesc:      lockSafety ? existing.taskDesc     : ((document.getElementById('jobDesc')   || {}).value || existing.taskDesc   || ''),
    taskLoc:       lockSafety ? existing.taskLoc      : ((document.getElementById('jobLoc')    || {}).value || existing.taskLoc    || ''),
    jobNumber:     lockSafety ? existing.jobNumber    : ((document.getElementById('jobNumber') || {}).value || existing.jobNumber  || ''),
    workOrders:    existing.workOrders || [],
    musterPoint:   lockSafety ? existing.musterPoint  : ((document.getElementById('jobMuster') || {}).value || existing.musterPoint || ''),
    hazards:       lockSafety ? existing.hazards      : safeHazards,
    customHazards: lockSafety ? existing.customHazards: safeCustomHazards,
    taskStepsText: lockSafety ? existing.taskStepsText: safeTaskStepsText,
    hazardText:    lockSafety ? existing.hazardText   : safeHazardText,
    controlText:   lockSafety ? existing.controlText  : safeControlText,
    ppe:           lockSafety ? existing.ppe          : Array.from(st.ppe),
    conditions:    lockSafety ? existing.conditions   : st.conditions,

    // Worker fields: always allow (checked separately in renderSigStep)
    workers:     safeWorkers,
    sigs:        mergedSigs,

    // Weather: don't overwrite on locked saves
    weather:         psiWeather.weather || '',
    weatherTemp:     psiWeather.weatherTemp,
    weatherCode:     psiWeather.weatherCode,
    weatherAdvisory: psiWeather.weatherAdvisory || [],
  }, extra);

  if (!lockSafety) {
    record.liftRequired = psiNeedsLift(record);
  }

  if (opts.immediate && typeof writePSINow === 'function') writePSINow(record);
  else writePSI(record);
  if (!lockSafety && typeof refreshLiftLinkForPSI === 'function') {
    refreshLiftLinkForPSI(record);
  }
  updateLiftRequirementUI(record);
  return record;
}


// â”€â”€ AUTOSAVE (debounced) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function schedSave() {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(function() { savePSI({}); }, 1500);
}


// â”€â”€ CURRENT PSI DATA (for PDF) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function currentPSIData() {
  if (!me.activePSI) return null;
  savePSI({});
  var psi = loadPSI(me.activePSI);
  return (window.AIEngine && typeof AIEngine.normalizePSIRecord === 'function')
    ? AIEngine.normalizePSIRecord(psi)
    : psi;
}


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// STEP 0 â€” JOB LIBRARY
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function renderJobLib(query) {
  const lib = document.getElementById('jobLibrary');
  if (!lib) return;

  lib.innerHTML = '';
  const q = (query || '').toLowerCase().trim();

  const mem   = loadMem();
  const usage = mem.usage || {};

  // Built-in templates
  const builtins = Object.values(BUILTIN_TEMPLATES).filter(function(t) {
    if (typeof isTemplateHidden === 'function' && isTemplateHidden(t.code)) return false;
    if (!q) return true;
    return (t.name + ' ' + (t.displayCode || t.code) + ' ' + (t.desc || '')).toLowerCase().includes(q);
  });

  // Sort by usage descending
  builtins.sort(function(a, b) {
    return (usage[b.code] || 0) - (usage[a.code] || 0);
  });

  var groupedBuiltins = {};
  builtins.forEach(function(t) {
    var cat = jobCategoryLabel(t);
    if (!groupedBuiltins[cat]) groupedBuiltins[cat] = [];
    groupedBuiltins[cat].push(t);
  });

  Object.keys(groupedBuiltins).sort().forEach(function(cat) {
    appendJobCategory(lib, cat, groupedBuiltins[cat], usage, false);
  });

  // Approved custom templates only
  const learnedList = (typeof getApprovedLearnedTemplates === 'function')
    ? getApprovedLearnedTemplates().filter(function(t) {
        if (!q) return true;
        return (t.name + ' ' + (t.displayCode || t.code) + ' ' + (t.desc || '')).toLowerCase().includes(q);
      })
    : [];

  if (learnedList.length > 0) {
    appendJobCategory(lib, 'My Custom Templates', learnedList, usage, true);
  }

  // "New template" button at bottom of list
  const newBtn = document.createElement('button');
  newBtn.className   = 'jc-new-btn';
  newBtn.textContent = '+ New Job Template';
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

function jobCategoryLabel(t) {
  var text = ((t && (t.name + ' ' + t.code + ' ' + (t.desc || ''))) || '').toLowerCase();
  if (/light|lamp|ballast|fixture|highbay|flood/.test(text)) return 'Lighting';
  if (/bridge|pbb|gate|retract/.test(text)) return 'Bridges';
  if (/lift|mewp|bucket|platform|scissor|boom/.test(text)) return 'Lift Access';
  if (/inspect|inspection|check|audit/.test(text)) return 'Inspection';
  if (/elect|power|breaker|panel|troubleshoot|conduit|wire/.test(text)) return 'Electrical';
  if (/belt|bearing|motor|gear|pump|millwright|mechanic/.test(text)) return 'Mechanical';
  if (/door|gate|baggage|conveyor/.test(text)) return 'Systems';
  return 'General';
}

function appendJobCategory(lib, title, items, usage, isLearned) {
  if (!items || !items.length) return;

  const group = document.createElement('div');
  group.className = 'job-category-block';
  const isOpen = shouldOpenJobCategory(title);
  group.dataset.category = title;
  group.classList.toggle('open', isOpen);

  const head = document.createElement('div');
  head.className = 'job-category-head';
  head.innerHTML =
    '<div class="job-category-title">' + title + '</div>' +
    '<div class="job-category-meta">' +
      '<div class="job-category-count">' + items.length + '</div>' +
      '<div class="job-category-chevron">' + (isOpen ? 'v' : '>') + '</div>' +
    '</div>';
  head.onclick = function() {
    toggleJobCategory(title, group);
  };
  group.appendChild(head);

  const body = document.createElement('div');
  body.className = 'job-category-body';

  items.forEach(function(t) {
    body.appendChild(makeJobCard(t, usage[t.code] || 0, isLearned));
  });
  group.appendChild(body);

  lib.appendChild(group);
}

function shouldOpenJobCategory(title) {
  if (Object.prototype.hasOwnProperty.call(_jobCategoryOpen, title)) {
    return !!_jobCategoryOpen[title];
  }
  return false;
}

function toggleJobCategory(title, group) {
  const next = !group.classList.contains('open');
  _jobCategoryOpen[title] = next;
  group.classList.toggle('open', next);
  const chev = group.querySelector('.job-category-chevron');
  if (chev) chev.textContent = next ? 'v' : '>';
}

function setJobLibraryCollapsed(collapsed, tmpl) {
  const lib = document.getElementById('jobLibrary');
  const picked = document.getElementById('jobTemplatePicked');
  if (!lib || !picked) return;

  lib.style.display = collapsed ? 'none' : '';

  if (!collapsed || !tmpl) {
    picked.style.display = 'none';
    picked.innerHTML = '';
    return;
  }

  picked.style.display = 'block';
  picked.innerHTML =
    '<div class="job-template-picked-head">' +
      '<div>' +
        '<div class="job-template-picked-label">Template selected</div>' +
        '<div class="job-template-picked-name">' + (tmpl.name || tmpl.displayCode || tmpl.code || 'Job Template') + '</div>' +
        '<div class="job-template-picked-desc">' + (tmpl.desc || jobCategoryLabel(tmpl)) + '</div>' +
      '</div>' +
      '<button class="job-template-picked-btn" type="button" onclick="reopenJobLibrary()">Change Template</button>' +
    '</div>';
}

function reopenJobLibrary() {
  setJobLibraryCollapsed(false, null);
  const jobSearch = document.getElementById('jobSearch');
  if (jobSearch) jobSearch.focus();
}

function jumpToJobDetails() {
  const anchor = document.getElementById('jobDetailsAnchor');
  const descEl = document.getElementById('jobDesc');
  if (anchor && typeof anchor.scrollIntoView === 'function') {
    anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  setTimeout(function() {
    if (descEl && typeof descEl.focus === 'function') descEl.focus();
  }, 220);
}

function getTemplateTaskDesc(tmpl, code) {
  return (tmpl && (tmpl.taskDesc || tmpl.name)) || code || '';
}

function getExactTemplatePack(tmpl, code) {
  var wording = (tmpl && typeof applyWording === 'function' && getWording(code))
    ? applyWording(code)
    : null;
  return {
    taskDesc: getTemplateTaskDesc(tmpl, code),
    taskStepsText: wording && wording.taskStepsText
      ? wording.taskStepsText
      : ((tmpl && tmpl.taskStepsText != null)
        ? (tmpl.taskStepsText || '')
        : ((tmpl && tmpl.taskRows)
          ? tmpl.taskRows.map(function(r) { return r[0] || ''; }).filter(Boolean).join('\n')
          : '')),
    hazardText: wording && wording.hazardText
      ? wording.hazardText
      : ((tmpl && tmpl.hazardText != null)
        ? (tmpl.hazardText || '')
        : ((tmpl && tmpl.taskRows)
          ? tmpl.taskRows.map(function(r) { return r[1] || ''; }).filter(Boolean).join('\n')
          : '')),
    controlText: wording && wording.controlText
      ? wording.controlText
      : ((tmpl && tmpl.controlText != null)
        ? (tmpl.controlText || '')
        : ((tmpl && tmpl.taskRows)
          ? tmpl.taskRows.map(function(r) { return r[2] || ''; }).filter(Boolean).join('\n')
          : ''))
  };
}

function applyGeneratedTemplatePack(pack) {
  if (!pack) return;
  st.taskStepsText = pack.taskStepsText || '';
  st.hazardText = pack.hazardText || '';
  st.controlText = pack.controlText || '';
  renderTasks();
  schedSave();
  savePSI({});
}

function rewriteSelectedJobWording(code, tmpl, mode) {
  if (!code || !window.AIEngine) return;

  var taskText = ((document.getElementById('jobDesc') || {}).value || '').trim()
    || getTemplateTaskDesc(tmpl, code);
  var token = ++_jobWordingRequestToken;

  var localPack = mode === 'regenerate'
    ? (typeof AIEngine.regenerateForCurrentJob === 'function'
      ? AIEngine.regenerateForCurrentJob(code, taskText, tmpl)
      : null)
    : (typeof AIEngine.generateTaskPack === 'function'
      ? AIEngine.generateTaskPack(taskText, tmpl)
      : null);

  if (localPack && token === _jobWordingRequestToken && _selJob === code) {
    applyGeneratedTemplatePack(localPack);
  }

  var asyncPromise = mode === 'regenerate'
    ? (typeof AIEngine.regenerateForCurrentJobAsync === 'function'
      ? AIEngine.regenerateForCurrentJobAsync(code, taskText, tmpl)
      : null)
    : (typeof AIEngine.generateTaskPackAsync === 'function'
      ? AIEngine.generateTaskPackAsync(taskText, tmpl)
      : null);

  if (asyncPromise && typeof asyncPromise.then === 'function') {
    asyncPromise.then(function(pack) {
      if (token !== _jobWordingRequestToken) return;
      if (_selJob !== code) return;
      applyGeneratedTemplatePack(pack);
      toastAISource(pack, 'Wording rewritten with');
    }).catch(function() {});
  } else if (localPack) {
    toastAISource(localPack, 'Wording rewritten with');
  }
}

function makeJobCard(t, count, isLearned) {
  const card = document.createElement('div');
  card.className = 'job-card' + (_selJob === t.code ? ' active' : '');
  const displayCode = (t && (t.displayCode || t.code)) || '';

  const codeEl = document.createElement('div');
  codeEl.className   = 'jc-code';
  codeEl.textContent = displayCode;

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

  // âœï¸ Edit button â€” opens template editor inline without leaving the PSI
  const editBtn = document.createElement('button');
  editBtn.className   = 'jc-edit-btn';
  editBtn.textContent = 'Edit';
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
  if (descEl) {
    var currentDesc = String(descEl.value || '').trim();
    if (!currentDesc) {
      descEl.value = getTemplateTaskDesc(tmpl, code);
    }
  }
  if (locEl   && tmpl.taskLoc)     locEl.value   = tmpl.taskLoc;
  if (numEl   && tmpl.jobNumber)   numEl.value   = tmpl.jobNumber;
  if (mustEl  && tmpl.musterPoint) mustEl.value  = tmpl.musterPoint;

  // Pre-fill hazards
  st.hazards = new Set(tmpl.selectedHazards || []);

  rewriteSelectedJobWording(code, tmpl, 'generate');

  // Pre-fill PPE
  st.ppe = new Set(tmpl.ppeSelected || []);

  // Auto-add weather-relevant hazards
  autoAddWeatherHazards();

  // Bump usage counter
  bumpUsage(code);

  // Show/hide regenerate wording button
  const regenBtn = document.getElementById('regenWordingBtn');
  if (regenBtn) regenBtn.style.display = getWording(code) ? 'inline-flex' : 'none';

  var record = savePSI({});
  toast(tmpl.name + ' loaded');
  updateLiftRequirementUI({
    jobCode: code,
    hazards: Array.from(st.hazards),
    conditions: st.conditions,
  });
  maybePromptLiftLink(record);
  // Re-render library to show active state
  renderJobLib((document.getElementById('jobSearch') || {}).value || '');
  setJobLibraryCollapsed(true, tmpl);
  jumpToJobDetails();
}


// â”€â”€ WEATHER HAZARD AUTO-ADD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Silently adds weather-relevant hazards to st.hazards when conditions warrant.

function autoAddWeatherHazards() {
  if (!(st.conditions.outside || st.conditions.weatherExp)) return;
  var temp = window._wxTemp;
  var code = window._wxCode;
  if (temp === null && code === null) return;

  var added = [];

  // Cold or hot â†’ heat stress / cold exposure
  if (temp !== null && (temp <= 0 || temp >= 30)) {
    if (!st.hazards.has('env_heat_stress_cold_exposure')) {
      st.hazards.add('env_heat_stress_cold_exposure');
      added.push(temp <= 0 ? 'Cold Exposure' : 'Heat Stress');
    }
  }
  // Rain, snow, heavy showers â†’ weather conditions + slip/trip
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
  // Fog â†’ low lighting
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


// â”€â”€ JOB MATCHING â€” inline suggestions while typing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

function inferConditionsFromJobText(text) {
  var lower = String(text || '').toLowerCase();
  var next = {};

  function hasAny(words) {
    return words.some(function(word) { return lower.indexOf(word) !== -1; });
  }

  if (hasAny(['outside', 'outdoor', 'roof', 'apron', 'runway', 'airside', 'bridge', 'terminal exterior'])) next.outside = true;
  if (hasAny(['weather', 'snow', 'ice', 'rain', 'wind', 'cold', 'hot'])) next.weatherExp = true;
  if (hasAny(['night', 'overnight', 'after hours'])) next.night = true;
  if (hasAny(['ladder', 'step ladder', 'extension ladder'])) next.ladder = true;
  if (hasAny(['lift', 'mewp', 'scissor', 'boom', 'bucket truck', 'manlift'])) next.lift = true;
  if (hasAny(['energized', 'live panel', 'live circuit', 'working live'])) next.energized = true;
  if (hasAny(['loto', 'lockout', 'lock out', 'isolat', 'de-energized', 'de energized'])) next.isolated = true;
  if (hasAny(['traffic', 'vehicle', 'airside traffic', 'tug', 'equipment traffic'])) next.vehicleTraffic = true;
  if (hasAny(['public', 'passenger', 'terminal', 'occupied area'])) next.publicPresent = true;
  if (hasAny(['overhead', 'ceiling', 'above head'])) next.overheadWork = true;
  if (hasAny(['alone', 'solo'])) next.workingAlone = true;
  if (hasAny(['confined space', 'tank', 'vault'])) next.confinedSpace = true;
  if (hasAny(['hot work', 'weld', 'grind', 'torch'])) next.hotWork = true;
  if (hasAny(['chemical', 'cleaner', 'solvent', 'acid', 'glycol'])) next.chemicals = true;
  if (hasAny(['heavy lift', 'lift heavy', 'awkward lift', 'manual handling'])) next.heavyLift = true;
  if (hasAny(['noisy', 'loud area', '85db'])) next.noisyArea = true;
  if (hasAny(['dust', 'airborne', 'cutting', 'concrete dust', 'fiberglass'])) next.dustAirborne = true;
  if (hasAny(['permit', 'escort required', 'aoc permit'])) next.permitRequired = true;

  return next;
}

function getHazardLabelByField(fieldName) {
  var target = String(fieldName || '').trim();
  if (!target || typeof HAZARD_MAP === 'undefined') return '';
  var found = '';
  Object.keys(HAZARD_MAP || {}).some(function(groupKey) {
    var group = HAZARD_MAP[groupKey] || {};
    return (group.items || []).some(function(item) {
      if (Array.isArray(item) && String(item[1] || '').trim() === target) {
        found = String(item[0] || '').trim();
        return true;
      }
      if (item && typeof item === 'object' && String(item.field || '').trim() === target) {
        found = String(item.label || '').trim();
        return true;
      }
      return false;
    });
  });
  return found;
}

function buildDescriptionHazardLines() {
  var lines = [];
  Array.from(st.hazards || []).forEach(function(field) {
    var label = getHazardLabelByField(field);
    if (label && lines.indexOf(label) === -1) lines.push(label);
  });
  Array.from(st.customHazards || []).forEach(function(label) {
    label = String(label || '').trim();
    if (label && lines.indexOf(label) === -1) lines.push(label);
  });
  return lines;
}

function buildDescriptionControlLines() {
  var lines = [];
  var cond = st.conditions || {};

  function add(line) {
    line = String(line || '').trim();
    if (line && lines.indexOf(line) === -1) lines.push(line);
  }

  if (cond.isolated) add('Apply LOTO / isolation before starting work.');
  if (cond.energized) add('Verify circuit status and use electrical safe work practices.');
  if (cond.ladder) add('Inspect the ladder and maintain three points of contact.');
  if (cond.lift) add('Inspect lift equipment, wear fall protection, and maintain clear work area below.');
  if (cond.vehicleTraffic || cond.publicPresent) add('Use barricades, spotters, and maintain separation from people and traffic.');
  if (cond.outside || cond.weatherExp) add('Monitor weather and ground conditions and adjust work as needed.');
  if (cond.overheadWork) add('Barricade below and protect workers from falling objects.');
  if (cond.hotWork) add('Use hot work controls and keep fire protection ready.');
  if (cond.confinedSpace) add('Confirm permit, atmospheric checks, and communication requirements before entry.');
  if (cond.workingAlone) add('Maintain communication and check-in arrangements while working alone.');
  if (cond.chemicals) add('Review SDS requirements and use spill / containment controls.');

  var ppeLabels = Array.from(st.ppe || []);
  if (ppeLabels.length) add('Wear required PPE: ' + ppeLabels.join(', ') + '.');
  add('Follow site procedures, maintain housekeeping, and stop work if conditions change.');

  return lines;
}

function buildDescriptionFallbackPack(text) {
  var cleanText = String(text || '').trim();
  var title = deriveShortJobTitle(cleanText, null);
  return {
    shortTitle: title,
    taskDesc: cleanText || title,
    taskStepsText: cleanText,
    hazardText: buildDescriptionHazardLines().join('\n'),
    controlText: buildDescriptionControlLines().join('\n')
  };
}

function mergeGeneratedPackWithFallback(pack, fallbackPack) {
  var source = pack || {};
  var fallback = fallbackPack || {};
  return {
    shortTitle: source.shortTitle || fallback.shortTitle || '',
    taskDesc: source.taskDesc || fallback.taskDesc || '',
    taskStepsText: String(source.taskStepsText || '').trim() || String(fallback.taskStepsText || '').trim(),
    hazardText: String(source.hazardText || '').trim() || String(fallback.hazardText || '').trim(),
    controlText: String(source.controlText || '').trim() || String(fallback.controlText || '').trim(),
    _aiSource: source._aiSource || fallback._aiSource || 'local'
  };
}

function aiBuildPSIFromDescription() {
  var descEl = document.getElementById('jobDesc');
  var text = String((descEl && descEl.value) || '').trim();
  if (!text) {
    toast('Type the work description first');
    if (descEl) descEl.focus();
    return;
  }

  var tmpl = matchJobType(text)[0] || null;
  if (tmpl) {
    _selJob = tmpl.code;
    st.hazards = new Set(tmpl.selectedHazards || []);
    st.ppe = new Set(tmpl.ppeSelected || []);

    var locEl = document.getElementById('jobLoc');
    var mustEl = document.getElementById('jobMuster');
    if (locEl && !String(locEl.value || '').trim() && tmpl.taskLoc) locEl.value = tmpl.taskLoc;
    if (mustEl && !String(mustEl.value || '').trim() && tmpl.musterPoint) mustEl.value = tmpl.musterPoint;
  } else {
    _selJob = null;
    st.hazards = new Set();
    st.ppe = new Set();
  }

  st.conditions = inferConditionsFromJobText(text);
  resetConditionPanel();
  restoreConditionPanel(st.conditions);

  var baseTemplate = tmpl || {
    selectedHazards: [],
    ppeSelected: [],
    conditionRules: {}
  };
  var conditionResult = applyConditions(baseTemplate, st.conditions);
  st.hazards = new Set(conditionResult.hazards || []);
  st.ppe = new Set(conditionResult.ppe || []);
  autoAddWeatherHazards();

  renderHazards(conditionResult.autoAdded || []);
  renderPPE();
  renderJobLib((document.getElementById('jobSearch') || {}).value || '');
  updateLiftRequirementUI({
    jobCode: _selJob || '',
    hazards: Array.from(st.hazards),
    conditions: st.conditions
  });

  var taskToken = ++_jobWordingRequestToken;
  var localPack = (window.AIEngine && typeof AIEngine.generateTaskPack === 'function')
    ? AIEngine.generateTaskPack(text, tmpl)
    : null;
  if (localPack && taskToken === _jobWordingRequestToken) {
    applyGeneratedTemplatePack(localPack);
  }

  var asyncPromise = (window.AIEngine && typeof AIEngine.generateTaskPackAsync === 'function')
    ? AIEngine.generateTaskPackAsync(text, tmpl)
    : null;

  if (asyncPromise && typeof asyncPromise.then === 'function') {
    asyncPromise.then(function(pack) {
      if (taskToken !== _jobWordingRequestToken) return;
      applyGeneratedTemplatePack(pack);
      toastAISource(pack, 'PSI built with');
    }).catch(function() {});
  } else if (localPack) {
    toastAISource(localPack, 'PSI built with');
  }

  savePSI({});
  var message = tmpl
    ? ('Matched ' + (tmpl.displayCode || tmpl.code || tmpl.name) + ' and filled PSI')
    : 'Filled PSI from your description';
  toast(message);
}

function aiBuildPSIFromScratch() {
  var descEl = document.getElementById('jobDesc');
  var text = String((descEl && descEl.value) || '').trim();
  if (!text) {
    toast('Type the work description first');
    if (descEl) descEl.focus();
    return;
  }

  _selJob = null;
  st.hazards = new Set();
  st.ppe = new Set();
  st.conditions = inferConditionsFromJobText(text);

  resetConditionPanel();
  restoreConditionPanel(st.conditions);

  var baseTemplate = {
    selectedHazards: [],
    ppeSelected: [],
    conditionRules: {}
  };
  var conditionResult = applyConditions(baseTemplate, st.conditions);
  st.hazards = new Set(conditionResult.hazards || []);
  st.ppe = new Set(conditionResult.ppe || []);
  autoAddWeatherHazards();

  renderHazards(conditionResult.autoAdded || []);
  renderPPE();
  renderJobLib((document.getElementById('jobSearch') || {}).value || '');
  updateLiftRequirementUI({
    jobCode: '',
    hazards: Array.from(st.hazards),
    conditions: st.conditions
  });

  var fallbackPack = buildDescriptionFallbackPack(text);

  var taskToken = ++_jobWordingRequestToken;
  var localPack = (window.AIEngine && typeof AIEngine.generateTaskPack === 'function')
    ? AIEngine.generateTaskPack(text, null)
    : null;
  if (localPack && taskToken === _jobWordingRequestToken) {
      applyGeneratedTemplatePack(mergeGeneratedPackWithFallback(localPack, fallbackPack));
  }

  var asyncPromise = (window.AIEngine && typeof AIEngine.generateTaskPackAsync === 'function')
    ? AIEngine.generateTaskPackAsync(text, null)
    : null;

  if (asyncPromise && typeof asyncPromise.then === 'function') {
    asyncPromise.then(function(pack) {
      if (taskToken !== _jobWordingRequestToken) return;
        applyGeneratedTemplatePack(mergeGeneratedPackWithFallback(pack, fallbackPack));
        toastAISource(pack, 'PSI built from description with');
      }).catch(function() {});
  } else if (localPack) {
    toastAISource(localPack, 'PSI built from description with');
  }

  savePSI({ jobCode: '' });
  toast('AI built a PSI from your description');
}


// â”€â”€ CONDITION PANEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function toggleCondition(key, el) {
  if (st.conditions[key]) {
    delete st.conditions[key];
    el.classList.remove('active');
  } else {
    st.conditions[key] = true;
    el.classList.add('active');
  }
  if (typeof renderWeatherAdvisory === 'function') renderWeatherAdvisory();
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
  var record = savePSI({});
  const n = result.autoAdded.length;
  toast('Conditions applied' + (n > 0 ? ' - ' + n + ' hazard' + (n > 1 ? 's' : '') + ' auto-added' : ''));
  maybePromptLiftLink(record);
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


// â”€â”€ REGENERATE WORDING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function regenerateWording() {
  if (!_selJob) { toast('Select a job type first'); return; }
  var currentDesc = ((document.getElementById('jobDesc') || {}).value || '');
  var tmpl = matchJobType((_selJob || '') + ' ' + currentDesc).find(function(item) {
    return item.code === _selJob;
  }) || null;
  if (!tmpl || !window.AIEngine) { toast('No wording variants for this template'); return; }
  rewriteSelectedJobWording(_selJob, tmpl, 'regenerate');
}


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// STEP 2 â€” TASK STEPS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function renderTasks() {
  _taskTextRendered = true;

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


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// STEP 3 â€” PPE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// STEP 4 â€” WORKERS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function renderWorkers() {
  const container = document.getElementById('workerRows');
  if (!container) return;
  if (typeof ensureApprovedWorkerDirectoryLoaded === 'function') {
    ensureApprovedWorkerDirectoryLoaded().then(function() {
      const rowsEl = document.getElementById('workerRows');
      if (!rowsEl) return;
      if (rowsEl.childElementCount === 0) renderWorkers();
      else renderWorkerQuickAdd();
    }).catch(function() {});
  }
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

  const people = (typeof getWorkerDirectory === 'function')
    ? getWorkerDirectory()
    : ((typeof loadPersonnel === 'function')
      ? loadPersonnel().map(function(name) { return { name: name, role: 'worker' }; })
      : []);
  if (people.length === 0) { wrap.style.display = 'none'; return; }

  // Only show people not already on the job
  const onJob = st.workers.map(function(w) { return (w.name || '').toLowerCase(); });
  const available = people.filter(function(entry) {
    var name = String((entry && entry.name) || '').trim().toLowerCase();
    return name && !onJob.includes(name);
  });

  if (available.length === 0) { wrap.style.display = 'none'; return; }

  wrap.style.display = '';
  chips.innerHTML    = '';

  available.forEach(function(entry) {
    const chip = document.createElement('button');
    chip.className   = 'personnel-chip';
    chip.textContent = entry.name;
    chip.type        = 'button';
    chip.onclick     = function() {
      st.workers.push({
        name: entry.name,
        role: 'Worker',
        uid: entry.uid || '',
        email: entry.email || ''
      });
      savePSI({});
      if (typeof flushPendingFirebaseWrites === 'function') flushPendingFirebaseWrites();
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
      st.workers[i].uid = '';
      st.workers[i].email = '';
      avEl.textContent   = initials(this.value);
      schedSave();
      showWorkerAutocomplete(inp, i);
    };
  })(idx, av, nameIn);

  nameIn.onblur = function() {
    commitTypedWorkerEntry(idx, nameIn);
    // Delay hide so click on list item can fire first
    setTimeout(function() { hideWorkerAutocomplete(); }, 180);
  };

  nameIn.onkeydown = function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitTypedWorkerEntry(idx, nameIn);
      hideWorkerAutocomplete();
      renderWorkers();
    }
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
      savePSI({});
      if (typeof flushPendingFirebaseWrites === 'function') flushPendingFirebaseWrites();
    };
  })(idx);

  // Delete button (don't allow deleting the only row)
  const del = document.createElement('button');
  del.className   = 'worker-del-btn';
  del.innerHTML   = 'X';
  del.title       = 'Remove worker';
  del.onclick     = (function(i) {
    return function() {
      if (st.workers.length <= 1) { toast('At least one worker is required'); return; }
      st.workers.splice(i, 1);
      // Clear sig for removed worker
      delete st.sigs[i];
      savePSI({});
      if (typeof flushPendingFirebaseWrites === 'function') flushPendingFirebaseWrites();
      renderWorkers();
    };
  })(idx);

  row.appendChild(av);
  row.appendChild(nameIn);
  row.appendChild(roleEl);
  row.appendChild(del);
  return row;
}

// â”€â”€ WORKER NAME AUTOCOMPLETE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
      selectWorkerEntry(w, workerIdx);
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

function commitTypedWorkerEntry(workerIdx, inputEl) {
  if (!inputEl || st.workers[workerIdx] == null) return;
  var raw = String(inputEl.value || '').trim();
  if (!raw) return;

  var matched = (typeof resolveWorkerDirectoryEntry === 'function')
    ? resolveWorkerDirectoryEntry(raw)
    : null;

  st.workers[workerIdx].name = matched ? String(matched.name || raw).trim() : raw;
  st.workers[workerIdx].uid = matched ? (matched.uid || '') : '';
  st.workers[workerIdx].email = matched ? (matched.email || '') : '';

  if (typeof savePSI === 'function') savePSI({}, { immediate: true });
  if (typeof flushPendingFirebaseWrites === 'function') flushPendingFirebaseWrites();
}

function selectWorkerEntry(entry, workerIdx) {
  hideWorkerAutocomplete();
  var worker = entry || {};
  var name = String(worker.name || '').trim();
  if (!name) return;

  // Update state + input
  if (st.workers[workerIdx] != null) {
    st.workers[workerIdx].name = name;
    st.workers[workerIdx].uid = worker.uid || '';
    st.workers[workerIdx].email = worker.email || '';
  }
  savePSI({});
  if (typeof flushPendingFirebaseWrites === 'function') flushPendingFirebaseWrites();
  renderWorkers();

  // Try to auto-load signature from sheets
  sheetsFetchSignature(name, 'full').then(function(strokes) {
    if (strokes && strokes.length) {
      toast(name + ' - signature pre-loaded');
      // Store in local memory for sig step
      const png = strokesToPNG(strokes, 400, 120);
      saveSignatureToMem(name, strokes, png);
    }
  });
}

function addWorkerRow() {
  st.workers.push({ name: '', role: 'Worker' });
  savePSI({});
  if (typeof flushPendingFirebaseWrites === 'function') flushPendingFirebaseWrites();
  renderWorkers();

  // Focus new name input
  const rows = document.getElementById('workerRows');
  if (rows) {
    const last   = rows.lastElementChild;
    const nameIn = last && last.querySelector('input');
    if (nameIn) nameIn.focus();
  }
}


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// STEP 5 â€” WORKER SIGNATURES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function renderSigStep() {
  const psi = loadPSI(me.activePSI);
  const isApproved       = psi && psi.approved;
  const workerFieldsOpen = psi ? (psi.worker_fields_open !== false) : true;
  const workerCanSign    = !isApproved || workerFieldsOpen;
  const isFullAccessUser = typeof userHasFullAccess === 'function' ? userHasFullAccess() : false;
  const needsLift = psiNeedsLift(psi || {});
  const hasLift = !!(psi && psi.liftUnitKey);

  // â”€â”€ Approved banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const banner = document.getElementById('approvedBanner');
  if (banner) {
    if (isApproved) {
      banner.style.display = '';
      if (!workerFieldsOpen) {
        banner.className   = 'approved-banner locked';
        banner.textContent = 'PSI Approved - Signatures locked by supervisor';
      } else {
        banner.className   = 'approved-banner';
        banner.textContent = 'PSI Approved by ' + (psi.approvedBy || 'Supervisor') +
          ' - You can still add your signature below';
      }
    } else if (psi && psi.reviewStatus === 'returned') {
      banner.style.display = '';
      banner.className = 'pending-banner';
      banner.textContent = 'Returned for changes' +
        (psi.reviewAssignedTo ? ' for ' + psi.reviewAssignedTo : '') +
        ': ' + (psi.reviewNote || 'See supervisor note');
    } else {
      banner.style.display = 'none';
    }
  }

  // Filter blank workers
  st.workers = st.workers.filter(function(w) { return w.name && w.name.trim(); });

  // Auto-add logged-in user if worker fields are open and they're not listed
  if (workerCanSign && !userHasFullAccess()) {
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
  if (isApproved && !workerFieldsOpen && !userHasFullAccess()) {
    const picker = document.getElementById('workerPicker');
    if (picker) {
      picker.querySelectorAll('button').forEach(function(b) { b.disabled = true; });
    }
  }

  // Submit button â€” hide for locked PSIs, hide if already submitted
  const btnSubmit = document.getElementById('btnSubmit');
  if (btnSubmit) {
    if (isApproved) {
      btnSubmit.style.display = 'none';
    } else if (psi && psi.unpublished) {
      btnSubmit.style.display = '';
      btnSubmit.textContent   = 'Publish to Open Work';
      btnSubmit.disabled      = false;
      btnSubmit.style.opacity = '';
    } else if (psi && psi.submittedForApproval) {
      btnSubmit.style.display = '';
      btnSubmit.textContent   = 'In Supervisor Review';
      btnSubmit.disabled      = true;
      btnSubmit.style.opacity = '0.6';
    } else {
      btnSubmit.style.display = '';
      btnSubmit.textContent   = needsLift && !hasLift ? 'Select Lift Unit First' :
        (!userRequiresSupervisorReview()
          ? 'Complete & Download PDF'
          : (psi && psi.reviewStatus === 'returned' ? 'Send Back to Supervisor' : 'Save for Review'));
      btnSubmit.disabled      = !!(needsLift && !hasLift);
      btnSubmit.style.opacity = needsLift && !hasLift ? '0.6' : '';
    }
  }
  if (psi && psi.unpublished) {
    const banner = document.getElementById('approvedBanner');
    if (banner) {
      banner.style.display = '';
      banner.className = 'pending-banner';
      banner.textContent = 'Private draft - this PSI will stay off the board until you publish it';
    }
  }
  updateLiftRequirementUI(psi || {});
}

function refreshVisiblePSIViews() {
  const editor = document.getElementById('editor');
  const dashboard = document.getElementById('dashboard');

  if (editor && editor.style.display !== 'none') {
    if (_curStep === 4 && typeof renderWorkers === 'function') {
      var livePsi = me && me.activePSI && typeof loadPSI === 'function' ? loadPSI(me.activePSI) : null;
      if (livePsi) st.workers = livePsi.workers || st.workers;
      renderWorkers();
    }
    if (_curStep === 5 && typeof renderSigStep === 'function') {
      var sigPsi = me && me.activePSI && typeof loadPSI === 'function' ? loadPSI(me.activePSI) : null;
      if (sigPsi) {
        st.workers = sigPsi.workers || st.workers;
        st.sigs = sigPsi.sigs || st.sigs;
      }
      renderSigStep();
    }
  }
  if (dashboard && dashboard.style.display !== 'none' && typeof refreshDash === 'function') {
    refreshDash();
  }
}


// â”€â”€ SUBMIT FOR APPROVAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function submitForApproval() {
  const workers = st.workers.filter(function(w) { return w.name; });
  if (workers.length === 0) { toast('Add workers before submitting'); return; }
  const psi = savePSI({}) || loadPSI(me.activePSI) || {};
  if (isUnpublishedPSI(psi)) {
    publishActivePSI();
    toast('PSI published to Open Work');
    setTimeout(function() { edBack(); }, 500);
    return;
  }
  if (typeof confirmPSISubmissionCheck === 'function' && !confirmPSISubmissionCheck(psi)) {
    return;
  }
  if (psiNeedsLift(psi) && !psi.liftUnitKey) {
    toast('Select a lift unit before submitting');
    if (typeof openLiftLinkModal === 'function') openLiftLinkModal();
    return;
  }

  // Learn hazard selections for this job type
  if (_selJob && typeof recordHazardHistory === 'function') {
    recordHazardHistory(_selJob, Array.from(st.hazards), Array.from(st.customHazards));
  }

  if (!userRequiresSupervisorReview()) {
    savePSI({
      submittedForApproval: false,
      reviewStatus: '',
      reviewAssignedTo: '',
      reviewNote: '',
      reviewedBy: me.name || '',
      reviewedAt: Date.now(),
      approved: true,
      approvedBy: me.name || '',
      approvedAt: Date.now(),
    });
    var completedPsi = loadPSI(me.activePSI) || psi;
    if (typeof buildPDFWithSigs === 'function') buildPDFWithSigs(completedPsi, { isFinal: true });
    else if (typeof buildPDF === 'function') buildPDF(completedPsi);
    toast('PSI completed and PDF downloaded');
    setTimeout(function() { edBack(); }, 800);
    return;
  }

  savePSI({ submittedForApproval: true, reviewStatus: 'submitted', reviewAssignedTo: '', reviewNote: '', reviewedBy: '', reviewedAt: null });

  toast('Saved and sent for supervisor review');

  // Return to dashboard after short delay
  setTimeout(function() { edBack(); }, 800);
}


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// STEP 6 â€” SUPERVISOR SIGN-OFF
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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
    reviewStatus:  'approved',
    supSigStrokes: strokes,
    reviewNote:    '',
    reviewedBy:    '',
    reviewedAt:    null,
    supSigPng:     png,
  });

  // Push supervisor strokes to sigs/{psiId} so any device can generate a complete PDF
  if (typeof firebaseSavePSISigs === 'function') {
    firebaseSavePSISigs(me.activePSI, { supervisor: { name: name, strokes: strokes } });
  }

  const psi = loadPSI(me.activePSI);
  if (!psi) {
    toast('PSI not found');
    return;
  }
  psi.supSigStrokes = strokes.slice();
  psi.supSigPng = png;
  buildPDF(psi, { isFinal: true });
  toast('PSI approved \u2014 tap Download PDF');

  setTimeout(function() { edBack(); }, 500);
}
