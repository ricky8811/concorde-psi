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
    // Signature drawings are NEVER stored in Firestore — they live only on the
    // device where they were drawn. Firestore stores job data + who-signed metadata.
    // This avoids document size limits and sync overwrites destroying local drawings.
    delete clean.sigs;
    delete clean.supSigPng;
    delete clean.supSigStrokes;
    if (Array.isArray(clean.initials)) {
      // Keep initials metadata (name, time, breakType) but strip drawing data
      clean.initials = clean.initials.map(function(e) {
        return { name: e.name, time: e.time, date: e.date, breakType: e.breakType };
      });
    }
    // Track who has signed as a simple name list (for status badges on other devices)
    if (record.sigs && typeof record.sigs === 'object') {
      var workers = record.workers || [];
      clean.sigWorkers = Object.keys(record.sigs).map(function(k) {
        return (workers[parseInt(k)] || {}).name || '';
      }).filter(Boolean);
    }
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


// ─── SYNC LISTENERS (Firestore → localStorage → UI) ──────────

var _syncStarted = false;

function startFirebaseSync() {
  if (!db || _syncStarted) return;
  _syncStarted = true;

  // PSI sync
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
          // Merge: keep any local signature drawings — Firestore doesn't store them.
          // Everything else (job data, status, approval) comes from Firestore.
          var local = lsGetJSON(psiKey(data.id), null);
          var merged = Object.assign({}, data);
          if (local) {
            if (local.sigs         && Object.keys(local.sigs).length)  merged.sigs         = local.sigs;
            if (local.supSigStrokes && local.supSigStrokes.length)      merged.supSigStrokes = local.supSigStrokes;
            if (local.supSigPng)                                        merged.supSigPng    = local.supSigPng;
            if (local.initials     && local.initials.length)           merged.initials     = local.initials;
          }
          lsSetJSON(psiKey(data.id), merged);
          addToIndex(data.id);
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

  // Lift current data
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

  // Personnel
  db.collection('config').doc('personnel').onSnapshot(function(doc) {
    if (!doc.exists) return;
    var data = doc.data();
    if (data && data.list) lsSetJSON(PERSONNEL_KEY, data.list);
  }, function() {});

  // Supervisor config
  db.collection('config').doc('supervisor').onSnapshot(function(doc) {
    if (!doc.exists) return;
    var data = doc.data();
    if (data) lsSetJSON(SUPERVISOR_CFG_KEY, data);
  }, function() {});

  // Learned templates
  db.collection('config').doc('learned').onSnapshot(function(doc) {
    if (!doc.exists) return;
    var data = doc.data();
    if (data && data.data) {
      lsSetJSON(LEARN_KEY, data.data);
      if (typeof applyTriggerOverrides === 'function') applyTriggerOverrides();
    }
  }, function() {});

  // Template overrides
  db.collection('config').doc('templateOverrides').onSnapshot(function(doc) {
    if (!doc.exists) return;
    var data = doc.data();
    if (data && data.data) {
      localStorage.setItem('psi_template_full_overrides', JSON.stringify(data.data));
      if (typeof applyTriggerOverrides === 'function') applyTriggerOverrides();
    }
  }, function() {});

  db.collection('config').doc('triggerOverrides').onSnapshot(function(doc) {
    if (!doc.exists) return;
    var data = doc.data();
    if (data && data.data) {
      localStorage.setItem('psi_trigger_overrides', JSON.stringify(data.data));
      if (typeof applyTriggerOverrides === 'function') applyTriggerOverrides();
    }
  }, function() {});

  // Lift fleet — unit numbers added on any device appear on all devices
  db.collection('config').doc('liftFleet').onSnapshot(function(doc) {
    if (!doc.exists) return;
    var data = doc.data();
    if (data && data.data) {
      localStorage.setItem(LIFT_FLEET_KEY, JSON.stringify(data.data));
      // Re-render the lift unit bar if the pane is currently open
      var liftPane = document.getElementById('liftPane');
      if (liftPane && liftPane.style.display !== 'none') {
        if (typeof renderLiftBar === 'function') renderLiftBar();
      }
    }
  }, function() {});

  // Crew roster — additions/changes appear on all devices
  db.collection('config').doc('crew').onSnapshot(function(doc) {
    if (!doc.exists) return;
    var data = doc.data();
    if (data && data.data) lsSetJSON(CREW_KEY, data.data);
  }, function() {});

  // Signatures — sync crew signatures to all devices
  db.collection('signatures').onSnapshot(function(snapshot) {
    snapshot.docChanges().forEach(function(change) {
      var data = change.doc.data();
      if (!data || !data.name) return;
      if (change.type === 'added' || change.type === 'modified') {
        try {
          var strokes = JSON.parse(data.strokes || '[]');
          if (typeof saveSignatureToMem === 'function') {
            // Pass skipFirebase=true to avoid circular write loop
            saveSignatureToMem(data.name, strokes, data.png || '', true);
          }
        } catch(e) {}
      }
    });
  }, function() {});

  // Lift history
  db.collection('lift_hist').onSnapshot(function(snapshot) {
    var remoteHist = [];
    snapshot.forEach(function(doc) {
      var d = doc.data();
      if (d && !d.deleted) remoteHist.push(d);
    });
    remoteHist.sort(function(a, b) {
      return (b.archivedAt || 0) - (a.archivedAt || 0);
    });
    lsSetJSON(LIFT_HIST_KEY, remoteHist);
    var histTab = document.getElementById('liftTabHistory');
    if (histTab && histTab.style.display !== 'none') {
      if (typeof renderLiftHistory === 'function') renderLiftHistory();
    }
  }, function() {});
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
        // Merge: preserve any local signature drawings
        var local = lsGetJSON(psiKey(data.id), null);
        var merged = Object.assign({}, data);
        if (local) {
          if (local.sigs         && Object.keys(local.sigs).length)  merged.sigs         = local.sigs;
          if (local.supSigStrokes && local.supSigStrokes.length)      merged.supSigStrokes = local.supSigStrokes;
          if (local.supSigPng)                                        merged.supSigPng    = local.supSigPng;
          if (local.initials     && local.initials.length)           merged.initials     = local.initials;
        }
        lsSetJSON(psiKey(data.id), merged);
        addToIndex(data.id);
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
