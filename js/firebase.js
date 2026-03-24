/* ═══════════════════════════════════════════════════════════════
   js/firebase.js — real-time Firestore sync layer
   Hybrid approach: localStorage = primary working copy
                    Firestore    = shared cloud mirror
═══════════════════════════════════════════════════════════════ */

// ─── FIREBASE CONFIG ──────────────────────────────────────────
// SETUP: console.firebase.google.com → Project Settings → Your apps → </> Web
// Paste your firebaseConfig object here:
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

// ── Temporary on-screen debug log (remove after sync confirmed) ──
function fbLog(msg) {
  console.log('[FB]', msg);
  var el = document.getElementById('fbDebug');
  if (!el) {
    el = document.createElement('div');
    el.id = 'fbDebug';
    el.style.cssText = 'position:fixed;bottom:60px;left:0;right:0;background:#000;color:#0f0;font-size:11px;padding:6px 10px;z-index:9999;max-height:160px;overflow-y:auto;font-family:monospace';
    document.body.appendChild(el);
  }
  el.innerHTML += '<div>' + new Date().toTimeString().slice(0,8) + ' ' + msg + '</div>';
  el.scrollTop = el.scrollHeight;
}

// Initialize only if config has been filled in
if (firebaseConfig.apiKey) {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    fbLog('Firebase init OK');
    // Enable offline persistence (works offline, syncs when reconnected)
    db.enablePersistence({ synchronizeTabs: true }).catch(function(err) {
      fbLog('Persistence: ' + err.code);
    });
  } catch (e) {
    fbLog('Init ERROR: ' + e.message);
    db = null;
  }
} else {
  fbLog('No API key — Firebase disabled');
}

// ─── ANONYMOUS AUTH ───────────────────────────────────────────
// Signs each device in silently — required for secure Firestore rules.
// Workers see no login prompt; Firebase just verifies the request
// comes from a real app session (not an external API call).
function ensureFirebaseAuth(callback) {
  if (!firebase.apps.length || !db) {
    fbLog('Auth skip — no Firebase');
    if (callback) callback();
    return;
  }
  var auth = firebase.auth();
  auth.onAuthStateChanged(function(user) {
    if (user) {
      fbLog('Auth OK uid=' + user.uid.slice(0,8));
      if (callback) callback();
    } else {
      fbLog('Signing in anonymously...');
      auth.signInAnonymously().catch(function(e) {
        fbLog('Auth FAILED: ' + e.message);
        if (callback) callback();
      });
    }
  });
}


// ─── MIRROR WRITES (fire-and-forget) ─────────────────────────
// Called after every localStorage write — silently syncs to Firestore

function firebaseWritePSI(record) {
  if (!db || !record || !record.id) return;
  try {
    // Serialize through JSON to strip Sets, undefined values, and other
    // non-Firestore-compatible types before writing
    var clean = JSON.parse(JSON.stringify(record));
    db.collection('psis').doc(clean.id).set(clean).then(function() {
      fbLog('PSI saved: ' + clean.id.slice(0,8));
    }).catch(function(e) {
      fbLog('PSI write ERR: ' + e.message);
    });
  } catch(e) {
    fbLog('PSI serialize ERR: ' + e.message);
  }
}

function firebaseDeletePSI(id) {
  if (!db || !id) return;
  // Soft-delete in Firestore so other devices sync the removal
  db.collection('psis').doc(id).set({ id: id, deleted: true, deletedAt: Date.now() }, { merge: true }).catch(function() {});
}

function firebaseSaveLift(data) {
  if (!db || !data) return;
  try {
    var clean = JSON.parse(JSON.stringify(data));
    db.collection('lift').doc('current').set(clean).catch(function(e) {
      fbLog('Lift write ERR: ' + e.message);
    });
  } catch(e) {
    fbLog('Lift serialize ERR: ' + e.message);
  }
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

  // Sign in anonymously first, then start sync
  ensureFirebaseAuth(function() {
    _startSyncAfterAuth();
  });
}

function _startSyncAfterAuth() {
  fbLog('Starting sync...');
  // Pull all PSIs from Firestore → populate localStorage first
  db.collection('psis').get().then(function(snapshot) {
    fbLog('PSIs loaded: ' + snapshot.size);
    snapshot.forEach(function(doc) {
      var data = doc.data();
      if (data && data.id) {
        lsSetJSON(psiKey(data.id), data);
        addToIndex(data.id);
      }
    });
    if (typeof refreshDash === 'function') refreshDash();
  }).catch(function(err) {
    fbLog('PSI load ERROR: ' + err.message);
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
