/* ═══════════════════════════════════════════════════════════════
   js/firebase.js — real-time Firestore sync layer
   Hybrid approach: localStorage = primary working copy
                    Firestore    = shared cloud mirror
═══════════════════════════════════════════════════════════════ */

// ─── FIREBASE CONFIG ──────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyAvbZEIWWnjuG8sl5Lt6SB4vpohCFXJUEQ",
  authDomain:        "concorde-psi-490ed.firebaseapp.com",
  databaseURL:       "https://concorde-psi-490ed-default-rtdb.firebaseio.com",
  projectId:         "concorde-psi-490ed",
  storageBucket:     "concorde-psi-490ed.firebasestorage.app",
  messagingSenderId: "847750079349",
  appId:             "1:847750079349:web:073cfff3863b6ed18ee93c"
};

var db = null;

if (firebaseConfig.apiKey) {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    db.enablePersistence({ synchronizeTabs: true }).catch(function() {});
  } catch (e) {
    db = null;
  }
}


// ─── ANONYMOUS AUTH ───────────────────────────────────────────
function ensureFirebaseAuth(callback) {
  if (!firebase.apps.length || !db) { if (callback) callback(); return; }
  var auth = firebase.auth();
  auth.onAuthStateChanged(function(user) {
    if (user) {
      if (callback) callback();
    } else {
      auth.signInAnonymously().catch(function() {
        if (callback) callback();
      });
    }
  });
}


// ─── MIRROR WRITES (fire-and-forget) ─────────────────────────

function firebaseWritePSI(record) {
  if (!db || !record || !record.id) return;
  try {
    var clean = JSON.parse(JSON.stringify(record));
    // Signature drawings live in sigs/{psiId} collection — never inside the PSI document.
    // This keeps PSI documents small and prevents size-limit failures.
    delete clean.sigs;
    delete clean.supSigStrokes;
    delete clean.supSigPng;
    // Strip strokes from initials — keep only metadata for display
    if (Array.isArray(clean.initials)) {
      clean.initials = clean.initials.map(function(e) {
        return { name: e.name, time: e.time, date: e.date, breakType: e.breakType };
      });
    }
    // Store who has signed (names) so other devices can show "2/3 signed" status
    var workers = record.workers || [];
    clean.sigWorkers = Object.keys(record.sigs || {}).map(function(k) {
      return (workers[parseInt(k)] || {}).name || '';
    }).filter(Boolean);
    db.collection('psis').doc(clean.id).set(clean).catch(function() {});
  } catch(e) {}
}

function firebaseDeletePSI(id) {
  if (!db || !id) return;
  db.collection('psis').doc(id).set(
    { id: id, deleted: true, deletedAt: Date.now() },
    { merge: true }
  ).catch(function() {});
}

function firebaseSaveLift(data) {
  if (!db || !data) return;
  try {
    var clean = JSON.parse(JSON.stringify(data));
    db.collection('lift').doc('current').set(clean).catch(function() {});
  } catch(e) {}
}

function firebaseArchiveLift(record) {
  if (!db || !record) return;
  var docId = (record.unitKey || 'unit') + '_' + (record.date || Date.now());
  try {
    var clean = JSON.parse(JSON.stringify(record));
    db.collection('lift_hist').doc(docId).set(clean).catch(function() {});
  } catch(e) {}
}

function firebaseSavePersonnel(list) {
  if (!db) return;
  db.collection('config').doc('personnel').set({ list: list }).catch(function() {});
}

function firebaseSaveSupervisor(cfg) {
  if (!db) return;
  try {
    var clean = JSON.parse(JSON.stringify(cfg));
    db.collection('config').doc('supervisor').set(clean).catch(function() {});
  } catch(e) {}
}

function firebaseSaveTemplateOverrides(obj) {
  if (!db) return;
  try {
    var clean = JSON.parse(JSON.stringify(obj));
    db.collection('config').doc('templateOverrides').set({ data: clean }).catch(function() {});
  } catch(e) {}
}

function firebaseSaveTriggerOverrides(obj) {
  if (!db) return;
  try {
    var clean = JSON.parse(JSON.stringify(obj));
    db.collection('config').doc('triggerOverrides').set({ data: clean }).catch(function() {});
  } catch(e) {}
}

function firebaseSaveLearned(obj) {
  if (!db) return;
  try {
    var clean = JSON.parse(JSON.stringify(obj));
    db.collection('config').doc('learned').set({ data: clean }).catch(function() {});
  } catch(e) {}
}

function firebaseSaveFleet(fleet) {
  if (!db) return;
  try {
    var clean = JSON.parse(JSON.stringify(fleet));
    db.collection('config').doc('liftFleet').set({ data: clean }).catch(function() {});
  } catch(e) {}
}

function firebaseSaveCrew(crew) {
  if (!db) return;
  try {
    var clean = JSON.parse(JSON.stringify(crew));
    db.collection('config').doc('crew').set({ data: clean }).catch(function() {});
  } catch(e) {}
}

// ─── PSI SIGNATURES COLLECTION ────────────────────────────────
// Strokes for every signer live here, keyed by PSI ID.
// Structure: { workers: { "0": {name, strokes}, "1": ... },
//              supervisor: { name, strokes },
//              initials: [{ name, breakType, date, time, strokes }] }

function firebaseSavePSISigs(psiId, data) {
  if (!db || !psiId || !data) return;
  try {
    var clean = JSON.parse(JSON.stringify(data));
    if (clean.initials && clean.initials.length) {
      // Use arrayUnion so each device's initials accumulate — never overwrite others
      var update = {};
      if (clean.workers)    update.workers    = clean.workers;
      if (clean.supervisor) update.supervisor = clean.supervisor;
      update.initials = firebase.firestore.FieldValue.arrayUnion.apply(
        firebase.firestore.FieldValue, clean.initials
      );
      db.collection('sigs').doc(psiId).set(update, { merge: true }).catch(function() {});
    } else {
      // No initials — plain merge is fine
      db.collection('sigs').doc(psiId).set(clean, { merge: true }).catch(function() {});
    }
  } catch(e) {}
}

function firebaseLoadPSISigs(psiId) {
  if (!db || !psiId) return Promise.resolve(null);
  return db.collection('sigs').doc(psiId).get().then(function(doc) {
    return doc.exists ? doc.data() : null;
  }).catch(function() { return null; });
}

// Fetch sigs/{psiId} and merge strokes into the localStorage copy of the PSI.
// Called whenever a PSI changes so every device automatically gets all sig drawings.
function syncSigsForPSI(psiId) {
  if (!db || !psiId) return;
  firebaseLoadPSISigs(psiId).then(function(remote) {
    if (!remote) return;
    var local = lsGetJSON(psiKey(psiId), null);
    if (!local) return;
    var changed = false;

    // Worker sigs — fill in any slots the local device is missing
    if (remote.workers) {
      if (!local.sigs) local.sigs = {};
      Object.keys(remote.workers).forEach(function(k) {
        var r = remote.workers[k];
        var l = local.sigs[k];
        if (r && r.strokes && r.strokes.length && !(l && l.strokes && l.strokes.length)) {
          local.sigs[k] = r;
          changed = true;
        }
      });
    }

    // Supervisor sig
    if (remote.supervisor && remote.supervisor.strokes && remote.supervisor.strokes.length) {
      if (!local.supSigStrokes || !local.supSigStrokes.length) {
        local.supSigStrokes = remote.supervisor.strokes;
        changed = true;
      }
    }

    // Break initials — remote first so strokes version wins over metadata-only local entry
    if (remote.initials && remote.initials.length) {
      var seen = {};
      var combined = [];
      (remote.initials.concat(local.initials || [])).forEach(function(e) {
        var key = (e.name||'')+'|'+(e.breakType||'')+'|'+(e.date||'');
        if (!seen[key]) { seen[key] = true; combined.push(e); }
      });
      if (combined.length > (local.initials || []).length) {
        local.initials = combined;
        changed = true;
      }
    }

    if (changed) {
      lsSetJSON(psiKey(psiId), local);
      if (typeof renderDashboard === 'function') renderDashboard();
      else if (typeof refreshDash === 'function') refreshDash();
    }
  });
}

// ─── PDF WITH REMOTE SIGS ─────────────────────────────────────
// Fetches strokes from sigs/{psiId}, merges with any local sigs,
// then calls buildPDF so the PDF has every signer's drawing
// regardless of which device is generating it.

function buildPDFWithSigs(psi, opts) {
  if (!psi) return;
  opts = opts || {};
  firebaseLoadPSISigs(psi.id).then(function(remote) {
    var merged = Object.assign({}, psi);
    if (remote) {
      // Worker sigs — fill in any slots missing from local
      if (remote.workers) {
        if (!merged.sigs) merged.sigs = {};
        Object.keys(remote.workers).forEach(function(k) {
          var r = remote.workers[k];
          var l = (psi.sigs || {})[k];
          if (!(l && l.strokes && l.strokes.length) && r && r.strokes && r.strokes.length) {
            merged.sigs[k] = r;
          }
        });
      }
      // Supervisor sig
      if (remote.supervisor && remote.supervisor.strokes && remote.supervisor.strokes.length) {
        if (!opts.supStrokes || !opts.supStrokes.length) {
          opts.supStrokes = remote.supervisor.strokes;
        }
        if (!merged.supSigStrokes || !merged.supSigStrokes.length) {
          merged.supSigStrokes = remote.supervisor.strokes;
        }
      }
      // Break initials — remote first so stroke-bearing entries win
      if (remote.initials && remote.initials.length) {
        var seen = {};
        var combined = [];
        (remote.initials.concat(psi.initials || [])).forEach(function(e) {
          var key = (e.name||'')+'|'+(e.breakType||'')+'|'+(e.date||'');
          if (!seen[key]) { seen[key] = true; combined.push(e); }
        });
        merged.initials = combined;
      }
    }
    buildPDF(merged, opts);
  });
}


function firebaseSaveSignature(name, strokes, png) {
  if (!db || !name) return;
  try {
    var docId = name.trim().toLowerCase().replace(/\s+/g, '_');
    // Store strokes only — PNG is too large for Firestore and is regenerated locally
    db.collection('signatures').doc(docId).set({
      name: name.trim(),
      strokes: JSON.stringify(strokes || []),
      updatedAt: Date.now()
    }).catch(function() {});
  } catch(e) {}
}


// ─── PSI MERGE HELPER ─────────────────────────────────────────
// Merges an incoming Firestore PSI with whatever is stored locally.
// Job data (hazards, PPE, status, approval) always comes from Firestore.
// Signature strokes are merged PER-WORKER so PDFs work on any device:
//   - Local sig wins if it has strokes (it also has the PNG for on-screen display)
//   - Firestore sig fills in any workers that signed on a different device
// PNG fields are local-only and never stored in Firestore.

function mergePSI(remote, local) {
  // Firestore is authoritative for all job data and status flags.
  // Sig drawings are NOT in Firestore (they live in sigs/{psiId}).
  // Preserve any local sig drawings so on-screen display stays correct.
  var merged = Object.assign({}, remote);
  if (local) {
    if (local.sigs && Object.keys(local.sigs).length)     merged.sigs          = local.sigs;
    if (local.supSigStrokes && local.supSigStrokes.length) merged.supSigStrokes = local.supSigStrokes;
    if (local.supSigPng)                                   merged.supSigPng     = local.supSigPng;
    // Merge initials from both sources — never replace one side entirely
    if (local.initials && local.initials.length) {
      var seen = {};
      var combined = [];
      // Remote first so strokes are preserved when both sides have the same entry
      ((remote.initials || []).concat(local.initials)).forEach(function(e) {
        var key = (e.name||'')+'|'+(e.breakType||'')+'|'+(e.date||'');
        if (!seen[key]) { seen[key] = true; combined.push(e); }
      });
      merged.initials = combined;
    }
  }
  return merged;
}


// ─── WRITE DEBOUNCE ───────────────────────────────────────────
// Firestore writes are debounced per PSI — max 1 write per 5 seconds.
// localStorage always saves immediately (no change to UX).
var _fbWriteTimers = {};

function firebaseWritePSIDebounced(record) {
  if (!record || !record.id) return;
  clearTimeout(_fbWriteTimers[record.id]);
  var snap = JSON.parse(JSON.stringify(record)); // capture current state
  _fbWriteTimers[record.id] = setTimeout(function() {
    firebaseWritePSI(snap);
  }, 5000);
}

// ─── SYNC LISTENERS (Firestore → localStorage → UI) ──────────
// Only PSIs and current lift use real-time onSnapshot listeners.
// Everything else (config, signatures, lift history) uses one-time
// get() calls on startup to avoid burning through daily read quota.

var _syncStarted = false;

function startFirebaseSync() {
  if (!db || _syncStarted) return;
  _syncStarted = true;

  // PSI sync — real-time so all devices see new/changed PSIs instantly
  db.collection('psis').onSnapshot(function(snapshot) {
    var changed = false;
    snapshot.docChanges().forEach(function(change) {
      var data = change.doc.data();
      if (!data || !data.id) return;
      if (change.type === 'added' || change.type === 'modified') {
        if (data.deleted) {
          lsDel(psiKey(data.id));
          removeFromIndex(data.id);
        } else {
          lsSetJSON(psiKey(data.id), mergePSI(data, lsGetJSON(psiKey(data.id), null)));
          addToIndex(data.id);
          syncSigsForPSI(data.id);
        }
        changed = true;
      }
      if (change.type === 'removed') {
        lsDel(psiKey(data.id));
        removeFromIndex(data.id);
        changed = true;
      }
    });
    if (changed) {
      if (typeof refreshDash === 'function') refreshDash();
      if (typeof updatePendingBadge === 'function') updatePendingBadge();
    }
  }, function() {});

  // Lift current data — real-time so inspection progress syncs instantly
  db.collection('lift').doc('current').onSnapshot(function(doc) {
    if (!doc.exists) return;
    var data = doc.data();
    if (!data) return;
    lsSetJSON(LIFT_KEY, data);
    var liftPane = document.getElementById('liftPane');
    if (liftPane && liftPane.style.display !== 'none') {
      if (typeof liftInit === 'function') liftInit();
    }
    if (typeof updatePendingBadge === 'function') updatePendingBadge();
  }, function() {});

  // All other data (config, signatures, lift history) is loaded once at
  // startup via get() in _startSyncAfterAuth — no continuous listeners needed.
}

// Load lift history from Firestore on demand (called when lift history tab opens)
function firebaseLoadLiftHistory() {
  if (!db) return;
  db.collection('lift_hist').get().then(function(snapshot) {
    var remoteHist = [];
    snapshot.forEach(function(doc) {
      var d = doc.data();
      if (d && !d.deleted) remoteHist.push(d);
    });
    remoteHist.sort(function(a, b) { return (b.archivedAt || 0) - (a.archivedAt || 0); });
    lsSetJSON(LIFT_HIST_KEY, remoteHist);
    if (typeof renderLiftHistory === 'function') renderLiftHistory();
  }).catch(function() {});
}


// ─── INITIAL LOAD + START SYNC ────────────────────────────────

function initFirebaseSync() {
  if (!db) return;
  ensureFirebaseAuth(function() {
    _startSyncAfterAuth();
  });
}

function _startSyncAfterAuth() {
  db.collection('psis').get().then(function(snapshot) {
    snapshot.forEach(function(doc) {
      var data = doc.data();
      if (!data || !data.id) return;
      if (data.deleted) {
        lsDel(psiKey(data.id));
        removeFromIndex(data.id);
      } else {
        lsSetJSON(psiKey(data.id), mergePSI(data, lsGetJSON(psiKey(data.id), null)));
        addToIndex(data.id);
        syncSigsForPSI(data.id);
      }
    });
    if (typeof refreshDash === 'function') refreshDash();
  }).catch(function() {});

  db.collection('config').doc('personnel').get().then(function(doc) {
    if (doc.exists && doc.data().list) lsSetJSON(PERSONNEL_KEY, doc.data().list);
  }).catch(function() {});

  db.collection('config').doc('supervisor').get().then(function(doc) {
    if (doc.exists && doc.data()) lsSetJSON(SUPERVISOR_CFG_KEY, doc.data());
  }).catch(function() {});

  db.collection('config').doc('templateOverrides').get().then(function(doc) {
    if (doc.exists && doc.data() && doc.data().data) {
      localStorage.setItem('psi_template_full_overrides', JSON.stringify(doc.data().data));
      if (typeof applyTriggerOverrides === 'function') applyTriggerOverrides();
    }
  }).catch(function() {});

  db.collection('config').doc('triggerOverrides').get().then(function(doc) {
    if (doc.exists && doc.data() && doc.data().data) {
      localStorage.setItem('psi_trigger_overrides', JSON.stringify(doc.data().data));
      if (typeof applyTriggerOverrides === 'function') applyTriggerOverrides();
    }
  }).catch(function() {});

  db.collection('config').doc('learned').get().then(function(doc) {
    if (doc.exists && doc.data() && doc.data().data) {
      lsSetJSON(LEARN_KEY, doc.data().data);
      if (typeof applyTriggerOverrides === 'function') applyTriggerOverrides();
    }
  }).catch(function() {});

  db.collection('config').doc('liftFleet').get().then(function(doc) {
    if (doc.exists && doc.data() && doc.data().data) {
      localStorage.setItem(LIFT_FLEET_KEY, JSON.stringify(doc.data().data));
    }
  }).catch(function() {});

  db.collection('config').doc('crew').get().then(function(doc) {
    if (doc.exists && doc.data() && doc.data().data) {
      lsSetJSON(CREW_KEY, doc.data().data);
    }
  }).catch(function() {});

  startFirebaseSync();
}
