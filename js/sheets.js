/* ═══════════════════════════════════════════════════════════════
   js/sheets.js — Google Sheets sync via Apps Script web app
═══════════════════════════════════════════════════════════════ */

// ── CONFIGURATION ─────────────────────────────────────────────
// Paste your Apps Script deployment URL here before going live.
// Leave blank to run offline-only — all calls silently no-op.
const SHEETS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzECf0LyjhkDjpGWHZPr5Nfm0jfOxNzyLhlmz3FHh4QBevxc_XiGRZUaU89nR4pWBRW/exec';

// Worker name cache — populated on app load
window._knownWorkers = [];


// ── CORE FETCH WRAPPERS ───────────────────────────────────────

function sheetsGet(params) {
  if (!SHEETS_SCRIPT_URL) return Promise.resolve(null);
  const qs = Object.keys(params).map(function(k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
  }).join('&');
  return fetch(SHEETS_SCRIPT_URL + '?' + qs)
    .then(function(r) { return r.json(); })
    .catch(function() { return null; });
}

function sheetsPost(payload) {
  if (!SHEETS_SCRIPT_URL) return Promise.resolve(null);
  // Use text/plain to avoid CORS preflight (Apps Script doesn't handle OPTIONS)
  return fetch(SHEETS_SCRIPT_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'text/plain' },
    body:    JSON.stringify(payload),
  }).then(function(r) { return r.json(); })
    .catch(function() { return null; });
}


// ── WRITE FUNCTIONS (fire-and-forget) ─────────────────────────

function sheetsSaveWorker(name, role) {
  if (!name || !SHEETS_SCRIPT_URL) return;
  sheetsPost({ type: 'worker', name: name, role: role || 'worker' });
}

function sheetsSaveSignature(name, strokes) {
  if (!name || !strokes || !strokes.length || !SHEETS_SCRIPT_URL) return;
  sheetsPost({ type: 'signature', sigType: 'full', name: name, strokes: JSON.stringify(strokes) });
}

function sheetsSaveInitials(name, breakType, strokes, psiId) {
  if (!name || !strokes || !strokes.length || !SHEETS_SCRIPT_URL) return;
  sheetsPost({
    type:      'signature',
    sigType:   'initial',
    name:      name,
    breakType: breakType || '',
    psiId:     psiId     || '',
    strokes:   JSON.stringify(strokes),
  });
}

function sheetsSavePSI(psi) {
  if (!psi || !SHEETS_SCRIPT_URL) return;
  sheetsPost({
    type:       'psi',
    id:         psi.id,
    taskDesc:   psi.taskDesc  || '',
    taskLoc:    psi.taskLoc   || '',
    jobDate:    psi.jobDate   || '',
    createdBy:  psi.createdBy || '',
    approvedBy: psi.approvedBy || '',
    approvedAt: psi.approvedAt || '',
  });
}


// ── READ FUNCTIONS ────────────────────────────────────────────

function sheetsFetchWorkers() {
  if (!SHEETS_SCRIPT_URL) return Promise.resolve([]);
  return sheetsGet({ type: 'workers' }).then(function(data) {
    if (Array.isArray(data)) {
      window._knownWorkers = data;
    }
    return window._knownWorkers;
  });
}

function sheetsFetchSignature(name, sigType) {
  if (!name || !SHEETS_SCRIPT_URL) return Promise.resolve(null);
  return sheetsGet({ type: 'signature', name: name, sigType: sigType || 'full' })
    .then(function(data) {
      if (data && data.strokes) {
        try { return JSON.parse(data.strokes); } catch(e) { return null; }
      }
      return null;
    });
}


// ── AUTOCOMPLETE HELPER ───────────────────────────────────────

function filterWorkers(query) {
  if (!query) return [];
  const q = query.toLowerCase();

  // Merge sheets workers + local personnel registry
  const sheetsWorkers = (window._knownWorkers || []);
  const personnel     = (typeof loadPersonnel === 'function') ? loadPersonnel() : [];
  const personnelObjs = personnel.map(function(n) { return { name: n }; });

  // Deduplicate by name
  const seen  = {};
  const merged = [];
  sheetsWorkers.concat(personnelObjs).forEach(function(w) {
    if (w.name && !seen[w.name.toLowerCase()]) {
      seen[w.name.toLowerCase()] = true;
      merged.push(w);
    }
  });

  return merged
    .filter(function(w) { return w.name && w.name.toLowerCase().startsWith(q); })
    .slice(0, 6);
}
