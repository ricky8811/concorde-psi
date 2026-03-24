/* ═══════════════════════════════════════════════════════════════
   js/firebase.js — real-time Firestore sync layer
   Hybrid approach: localStorage = primary working copy
                    Firestore    = shared cloud mirror
═══════════════════════════════════════════════════════════════ */

// ─── FIREBASE CONFIG ──────────────────────────────────────────
// SETUP: console.firebase.google.com → Project Settings → Your apps → </> Web
// Paste your firebaseConfig object here:
const firebaseConfig = {
  // apiKey: "paste-your-key-here",
  // authDomain: "your-project.firebaseapp.com",
  // projectId: "your-project-id",
  // storageBucket: "your-project.appspot.com",
  // messagingSenderId: "000000000000",
  // appId: "1:000000000000:web:abc123"
};

var db = null;

// Initialize only if config has been filled in
if (firebaseConfig.apiKey) {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    // Enable offline persistence (works offline, syncs when reconnected)
    db.enablePersistence({ synchronizeTabs: true }).catch(function(err) {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open — persistence only in one tab (fine)
      } else if (err.code === 'unimplemented') {
        // Browser doesn't support persistence (fine, use online-only)
      }
    });
  } catch (e) {
    console.warn('Firebase init error:', e);
    db = null;
  }
}


// ─── MIRROR WRITES (fire-and-forget) ─────────────────────────
// Called after every localStorage write — silently syncs to Firestore

function firebaseWritePSI(record) {
  if (!db || !record || !record.id) return;
  db.collection('psis').doc(record.id).set(record).catch(function() {});
}

function firebaseDeletePSI(id) {
  if (!db || !id) return;
  // Soft-delete in Firestore so other devices sync the removal
  db.collection('psis').doc(id).set({ id: id, deleted: true, deletedAt: Date.now() }, { merge: true }).catch(function() {});
}

function firebaseSaveLift(data) {
  if (!db || !data) return;
  db.collection('lift').doc('current').set(data).catch(function() {});
}

function firebaseArchiveLift(record) {
  if (!db || !record) return;
  // Use unitKey+date as the doc ID to prevent duplicates
  var docId = (record.unitKey || 'unit') + '_' + (record.date || Date.now());
  db.collection('lift_hist').doc(docId).set(record).catch(function() {});
}

function firebaseSavePersonnel(list) {
  if (!db) return;
  db.collection('config').doc('personnel').set({ list: list }).catch(function() {});
}

function firebaseSaveSupervisor(cfg) {
  if (!db) return;
  db.collection('config').doc('supervisor').set(cfg).catch(function() {});
}

function firebaseSaveLearned(obj) {
  if (!db) return;
  db.collection('config').doc('learned').set({ data: obj }).catch(function() {});
}


// ─── SYNC LISTENERS (Firestore → localStorage → UI) ──────────

var _syncStarted = false;

function startFirebaseSync() {
  if (!db || _syncStarted) return;
  _syncStarted = true;

  // ── PSI sync ─────────────────────────────────────────────
  db.collection('psis').onSnapshot(function(snapshot) {
    var changed = false;
    snapshot.docChanges().forEach(function(change) {
      var data = change.doc.data();
      if (!data || !data.id) return;

      if (change.type === 'added' || change.type === 'modified') {
        lsSetJSON(psiKey(data.id), data);
        addToIndex(data.id);
        changed = true;
      }
      if (change.type === 'removed') {
        // Physical Firestore delete (rare) — remove locally too
        lsDel(psiKey(data.id));
        removeFromIndex(data.id);
        changed = true;
      }
    });
    if (changed) {
      if (typeof refreshDash === 'function') refreshDash();
      if (typeof updatePendingBadge === 'function') updatePendingBadge();
    }
  }, function(err) {
    console.warn('PSI sync error:', err);
  });

  // ── Lift current data ─────────────────────────────────────
  db.collection('lift').doc('current').onSnapshot(function(doc) {
    if (!doc.exists) return;
    var data = doc.data();
    if (!data) return;
    lsSetJSON(LIFT_KEY, data);
    // Only re-init lift pane if it's currently open
    var liftPane = document.getElementById('liftPane');
    if (liftPane && liftPane.style.display !== 'none') {
      if (typeof liftInit === 'function') liftInit();
    }
    // Always update pending badge (lift status may have changed)
    if (typeof updatePendingBadge === 'function') updatePendingBadge();
  }, function(err) {
    console.warn('Lift sync error:', err);
  });

  // ── Personnel ─────────────────────────────────────────────
  db.collection('config').doc('personnel').onSnapshot(function(doc) {
    if (!doc.exists) return;
    var data = doc.data();
    if (data && data.list) {
      lsSetJSON(PERSONNEL_KEY, data.list);
    }
  }, function(err) {
    console.warn('Personnel sync error:', err);
  });

  // ── Supervisor config ─────────────────────────────────────
  db.collection('config').doc('supervisor').onSnapshot(function(doc) {
    if (!doc.exists) return;
    var data = doc.data();
    if (data) lsSetJSON(SUPERVISOR_CFG_KEY, data);
  }, function(err) {
    console.warn('Supervisor config sync error:', err);
  });

  // ── Lift history ──────────────────────────────────────────
  db.collection('lift_hist').onSnapshot(function(snapshot) {
    var changed = false;
    snapshot.docChanges().forEach(function(change) {
      changed = true;
    });
    if (changed) {
      // Rebuild local lift history from Firestore
      var remoteHist = [];
      snapshot.forEach(function(doc) {
        var d = doc.data();
        if (d && !d.deleted) remoteHist.push(d);
      });
      // Sort newest first by archivedAt or date
      remoteHist.sort(function(a, b) {
        return (b.archivedAt || 0) - (a.archivedAt || 0);
      });
      lsSetJSON(LIFT_HIST_KEY, remoteHist);

      // Re-render history tab if open
      var histTab = document.getElementById('liftTabHistory');
      if (histTab && histTab.style.display !== 'none') {
        if (typeof renderLiftHistory === 'function') renderLiftHistory();
      }
    }
  }, function(err) {
    console.warn('Lift history sync error:', err);
  });
}


// ─── INITIAL LOAD + START SYNC (called from auth.js on login) ─

function initFirebaseSync() {
  if (!db) return;   // Firebase not configured yet

  // Pull all PSIs from Firestore → populate localStorage first
  db.collection('psis').get().then(function(snapshot) {
    snapshot.forEach(function(doc) {
      var data = doc.data();
      if (data && data.id) {
        lsSetJSON(psiKey(data.id), data);
        addToIndex(data.id);
      }
    });
    if (typeof refreshDash === 'function') refreshDash();
  }).catch(function(err) {
    console.warn('Initial PSI load error:', err);
  });

  // Pull personnel
  db.collection('config').doc('personnel').get().then(function(doc) {
    if (doc.exists && doc.data().list) {
      lsSetJSON(PERSONNEL_KEY, doc.data().list);
    }
  }).catch(function() {});

  // Pull supervisor config
  db.collection('config').doc('supervisor').get().then(function(doc) {
    if (doc.exists && doc.data()) {
      lsSetJSON(SUPERVISOR_CFG_KEY, doc.data());
    }
  }).catch(function() {});

  // Start live listeners
  startFirebaseSync();
}
