/* ═══════════════════════════════════════════════════════════════
   js/storage.js — all localStorage read/write in one place
═══════════════════════════════════════════════════════════════ */

// ── RAW HELPERS ───────────────────────────────────────────────

function lsGet(key) {
  try { return localStorage.getItem(key); } catch(e) { return null; }
}

function lsSet(key, val) {
  try { localStorage.setItem(key, val); } catch(e) { console.warn('lsSet failed', key, e); }
}

function lsDel(key) {
  try { localStorage.removeItem(key); } catch(e) {}
}

function lsGetJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch(e) { return fallback; }
}

function lsSetJSON(key, val) {
  lsSet(key, JSON.stringify(val));
}

function loadAICfg() {
  return lsGetJSON(AI_CFG_KEY, {
    endpointUrl: AI_ENDPOINT_URL || '',
    enabled: !!AI_ENDPOINT_URL
  });
}

function saveAICfg(cfg) {
  cfg = cfg || {};
  var endpointUrl = String(cfg.endpointUrl || AI_ENDPOINT_URL || '').trim();
  lsSetJSON(AI_CFG_KEY, {
    endpointUrl: endpointUrl,
    enabled: cfg.enabled !== false && !!endpointUrl
  });
}

// ── PSI KEY ───────────────────────────────────────────────────

function psiKey(id) { return 'psi_' + id; }

// ── PSI INDEX ─────────────────────────────────────────────────

function loadIndex() {
  return lsGetJSON(IDX_KEY, []);
}

function saveIndex(arr) {
  lsSetJSON(IDX_KEY, arr);
}

function addToIndex(id) {
  const idx = loadIndex();
  if (!idx.includes(id)) {
    idx.unshift(id);
    saveIndex(idx);
  }
}

function removeFromIndex(id) {
  const idx = loadIndex().filter(i => i !== id);
  saveIndex(idx);
}

// ── PSI RECORDS ───────────────────────────────────────────────

function loadPSI(id) {
  return lsGetJSON(psiKey(id), null);
}

function writePSI(record) {
  if (!record || !record.id) return;
  lsSetJSON(psiKey(record.id), record);
  addToIndex(record.id);
  // Debounced: max 1 Firestore write per PSI per 5 seconds (saves daily write quota)
  if (typeof firebaseWritePSIDebounced === 'function') firebaseWritePSIDebounced(record);
  else if (typeof firebaseWritePSI === 'function') firebaseWritePSI(record);
}

function deletePSI(id) {
  lsDel(psiKey(id));
  removeFromIndex(id);
  if (typeof firebaseDeletePSI === 'function') firebaseDeletePSI(id);
}

// ── MEMORY (saved sigs, usage counts, known locations) ────────

function loadMem() {
  return lsGetJSON(MEM_KEY, {
    savedSigs: {},
    usage: {},
    knownLocations: [],
  });
}

function saveMem(m) {
  lsSetJSON(MEM_KEY, m);
}

function bumpUsage(code) {
  const m = loadMem();
  if (!m.usage) m.usage = {};
  m.usage[code] = (m.usage[code] || 0) + 1;
  saveMem(m);
}

function _sigKey(name) {
  return 'psi_sig_' + name.trim().toLowerCase().replace(/\s+/g, '_');
}

// skipFirebase = true when called from Firebase sync listener (avoids circular writes)
function saveSignatureToMem(name, strokes, png, skipFirebase) {
  if (!name || !strokes) return;
  // Store in dedicated per-person key so signatures survive unrelated MEM_KEY writes
  lsSetJSON(_sigKey(name), { strokes: strokes, png: png || '' });
  // Also keep MEM_KEY copy for any legacy reads
  const m = loadMem();
  if (!m.savedSigs) m.savedSigs = {};
  m.savedSigs[name.trim()] = { strokes: strokes, png: png || '' };
  saveMem(m);
  if (!skipFirebase && typeof firebaseSaveSignature === 'function') {
    firebaseSaveSignature(name, strokes, png);
  }
}

function loadSignatureFromMem(name) {
  if (!name) return null;
  // Check dedicated key first (most reliable)
  const direct = lsGetJSON(_sigKey(name), null);
  if (direct && direct.strokes && direct.strokes.length) return direct;
  // Fall back to MEM_KEY for backward compat
  const m = loadMem();
  return (m.savedSigs && m.savedSigs[name.trim()]) || null;
}

// ── SESSION ───────────────────────────────────────────────────

function saveSession(name, role, extra) {
  extra = extra || {};
  lsSetJSON(SESS_KEY, {
    name: name || '',
    role: role || 'worker',
    uid: extra.uid || '',
    email: extra.email || '',
    authType: extra.authType || 'legacy',
    trade: extra.trade || '',
    workflowType: extra.workflowType || '',
    requiresSupervisorReview: !!extra.requiresSupervisorReview,
    exp: Date.now() + 12 * 3600 * 1000,
  });
  // Record shift start if not already set
  if (!lsGet(SHIFT_KEY)) {
    lsSet(SHIFT_KEY, new Date().toTimeString().slice(0, 5));
  }
}

function loadSession() {
  const s = lsGetJSON(SESS_KEY, null);
  if (s && s.exp > Date.now() && s.name) return s;
  return null;
}

function clearSession() {
  lsDel(SESS_KEY);
  lsDel(SHIFT_KEY);
}

// ── LEARNED TEMPLATES ─────────────────────────────────────────

function loadLearned() {
  return lsGetJSON(LEARN_KEY, {});
}

function saveLearned(templates) {
  lsSetJSON(LEARN_KEY, templates);
  if (typeof firebaseSaveLearned === 'function') firebaseSaveLearned(templates);
}

function saveLearnedTemplate(psi) {
  if (!psi || !psi.taskDesc) return;

  // Don't overwrite built-in templates
  const key = psi.taskDesc.trim().toUpperCase().replace(/\s+/g, '_').slice(0, 30);
  if (BUILTIN_TEMPLATES[psi.jobCode]) return;

  const learned = loadLearned();
  // Don't duplicate if already saved under same key
  if (learned[key]) return;

  learned[key] = {
    code: key,
    name: psi.taskDesc.trim(),
    desc: 'Learned from approved job',
    taskDesc:       psi.taskDesc   || '',
    taskLoc:        psi.taskLoc    || '',
    jobNumber:      psi.jobNumber  || '',
    musterPoint:    psi.musterPoint || '',
    selectedHazards: psi.hazards   || [],
    taskRows:       psi.tasks      || [],
    ppeSelected:    psi.ppe        || [],
  };

  saveLearned(learned);
}

// ── CREW ──────────────────────────────────────────────────────

function loadCrew() {
  const c = lsGetJSON(CREW_KEY, null);
  if (!c) {
    return {
      elec: DEFAULT_CREW.elec.map(n => ({ name: n, checked: true })),
      mill: DEFAULT_CREW.mill.map(n => ({ name: n, checked: true })),
      hist: [],
    };
  }
  return c;
}

function saveCrew(crew) {
  lsSetJSON(CREW_KEY, crew);
  if (typeof firebaseSaveCrew === 'function') firebaseSaveCrew(crew);
}

// ── SUPERVISOR CONFIG ──────────────────────────────────────────

function loadSupervisorConfig() {
  return lsGetJSON(SUPERVISOR_CFG_KEY, {
    name: DEFAULT_SUPERVISOR_NAME,
    pin:  SUPERVISOR_PIN,
  });
}

function saveSupervisorConfig(cfg) {
  lsSetJSON(SUPERVISOR_CFG_KEY, cfg);
  if (typeof firebaseSaveSupervisor === 'function') firebaseSaveSupervisor(cfg);
}

// ── PERSONNEL ─────────────────────────────────────────────────

function loadPersonnel() {
  return lsGetJSON(PERSONNEL_KEY, []);
}

function savePersonnel(list) {
  lsSetJSON(PERSONNEL_KEY, list);
  if (typeof firebaseSavePersonnel === 'function') firebaseSavePersonnel(list);
}

// ── LIFT ──────────────────────────────────────────────────────

function loadLift() {
  return lsGetJSON(LIFT_KEY, { units: {} });
}

function saveLift(data) {
  lsSetJSON(LIFT_KEY, data);
  if (typeof firebaseSaveLift === 'function') firebaseSaveLift(data);
}

// ── LIFT INSPECTION HISTORY ───────────────────────────────────

function loadLiftHistory() {
  return lsGetJSON(LIFT_HIST_KEY, []);
}

function saveLiftHistory(records) {
  lsSetJSON(LIFT_HIST_KEY, records);
}

// Archive a completed inspection into the history log
function archiveLiftInspection(record) {
  if (!record || !record.unitNum) return;
  var hist = loadLiftHistory();
  // Avoid duplicate: if same unit + date already archived, skip
  var exists = hist.some(function(r) {
    return r.unitKey === record.unitKey && r.date === record.date;
  });
  if (exists) return;
  var entry = Object.assign({}, record, { archivedAt: Date.now() });
  hist.unshift(entry);          // newest first
  if (hist.length > 200) hist = hist.slice(0, 200);   // keep last 200
  saveLiftHistory(hist);
  if (typeof firebaseArchiveLift === 'function') firebaseArchiveLift(entry);
}
