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

function firebaseGetAuth() {
  if (!firebase.apps.length) return null;
  try { return firebase.auth(); } catch (e) { return null; }
}

function firebaseLoadUserProfile(uid) {
  if (!db || !uid) return Promise.resolve(null);
  return db.collection('users').doc(uid).get().then(function(doc) {
    return doc.exists ? (doc.data() || null) : null;
  }).catch(function() { return null; });
}

function firebaseWorkflowDefaults(roleHint, tradeHint) {
  var role = (roleHint === 'supervisor' || roleHint === 'admin') ? roleHint : 'worker';
  var trade = String(tradeHint || '').trim().toLowerCase() || 'electrician';
  if (role === 'supervisor' || role === 'admin') {
    return { trade: 'electrician', workflowType: 'full_review', requiresSupervisorReview: true };
  }
  if (trade === 'electrician') {
    return { trade: 'electrician', workflowType: 'full_review', requiresSupervisorReview: true };
  }
  return { trade: trade, workflowType: 'teams_export', requiresSupervisorReview: false };
}

function firebaseCanUseApp(profile) {
  if (!profile) return false;
  return profile.active !== false && profile.approvalStatus !== 'pending';
}

function firebaseEnsureUserProfile(user, roleHint, nameHint, tradeHint) {
  if (!db || !user || !user.uid) return Promise.resolve(null);
  var docRef = db.collection('users').doc(user.uid);
  return docRef.get().then(function(doc) {
    var defaults = firebaseWorkflowDefaults(roleHint, tradeHint);
    if (doc.exists && doc.data()) {
      var existing = doc.data() || {};
      var patch = {};
      if (!existing.trade) patch.trade = defaults.trade;
      if (!existing.workflowType) patch.workflowType = defaults.workflowType;
      if (typeof existing.requiresSupervisorReview !== 'boolean') patch.requiresSupervisorReview = defaults.requiresSupervisorReview;
      if (!existing.approvalStatus) patch.approvalStatus = existing.active === false ? 'pending' : 'approved';
      if (!existing.role) patch.role = (roleHint === 'supervisor' || roleHint === 'admin') ? roleHint : 'worker';
      if (!existing.name) patch.name = nameHint || user.displayName || (user.email ? user.email.split('@')[0] : 'Worker');
      if (Object.keys(patch).length) {
        patch.updatedAt = Date.now();
        return docRef.set(patch, { merge: true }).then(function() {
          return Object.assign({}, existing, patch);
        });
      }
      return existing;
    }
    var fallbackName = nameHint || user.displayName || (user.email ? user.email.split('@')[0] : 'Worker');
    var profile = {
      uid: user.uid,
      email: user.email || '',
      name: fallbackName,
      role: (roleHint === 'supervisor' || roleHint === 'admin') ? roleHint : 'worker',
      trade: defaults.trade,
      workflowType: defaults.workflowType,
      requiresSupervisorReview: defaults.requiresSupervisorReview,
      active: true,
      approvalStatus: 'approved',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    return docRef.set(profile, { merge: true }).then(function() {
      return profile;
    });
  }).catch(function() { return null; });
}

function firebaseSignInWithEmail(email, password, roleHint) {
  var auth = firebaseGetAuth();
  if (!auth) return Promise.reject(new Error('Firebase auth is not available.'));
  return auth.signInWithEmailAndPassword(email, password).then(function(cred) {
    return firebaseEnsureUserProfile(cred.user, roleHint || 'worker').then(function(profile) {
      if (!firebaseCanUseApp(profile)) {
        return auth.signOut().catch(function() {}).then(function() {
          throw new Error('Your account is waiting for supervisor approval.');
        });
      }
      return {
        user: cred.user,
        profile: profile
      };
    });
  });
}

function firebaseCreateWorkerAccount(name, email, password, trade) {
  var auth = firebaseGetAuth();
  if (!auth) return Promise.reject(new Error('Firebase auth is not available.'));
  return auth.createUserWithEmailAndPassword(email, password).then(function(cred) {
    return firebaseEnsureUserProfile(cred.user, 'worker', name || '', trade || 'electrician').then(function(profile) {
      var pendingPatch = {
        active: false,
        approvalStatus: 'pending',
        updatedAt: Date.now()
      };
      return db.collection('users').doc(cred.user.uid).set(pendingPatch, { merge: true }).then(function() {
        return auth.signOut().catch(function() {}).then(function() {
          return {
            user: cred.user,
            profile: Object.assign({}, profile, pendingPatch)
          };
        });
      });
    });
  });
}

function firebaseRestoreAccountSession() {
  var auth = firebaseGetAuth();
  if (!auth) return Promise.resolve(null);

  function loadUser(user) {
    if (!user || !user.uid || user.isAnonymous) return Promise.resolve(null);
    return firebaseEnsureUserProfile(user).then(function(profile) {
      if (!firebaseCanUseApp(profile)) {
        return auth.signOut().catch(function() {}).then(function() { return null; });
      }
      return {
        user: user,
        profile: profile
      };
    }).catch(function() {
      return null;
    });
  }

  if (auth.currentUser && !auth.currentUser.isAnonymous) {
    return loadUser(auth.currentUser);
  }

  return new Promise(function(resolve) {
    var settled = false;
    var timeout = setTimeout(function() {
      if (settled) return;
      settled = true;
      try { unsub(); } catch (e) {}
      resolve(null);
    }, 1500);

    var unsub = auth.onAuthStateChanged(function(user) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      try { unsub(); } catch (e) {}
      loadUser(user).then(resolve);
    }, function() {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      try { unsub(); } catch (e) {}
      resolve(null);
    });
  });
}

function firebaseSignOutUser() {
  var auth = firebaseGetAuth();
  if (!auth) return Promise.resolve();
  return auth.signOut().catch(function() {});
}

function firebaseListPendingUsers() {
  if (!db) return Promise.resolve([]);
  return db.collection('users')
    .where('approvalStatus', '==', 'pending')
    .get()
    .then(function(snapshot) {
      var rows = [];
      snapshot.forEach(function(doc) {
        var data = doc.data() || {};
        rows.push(Object.assign({ uid: doc.id }, data));
      });
      rows.sort(function(a, b) {
        return (a.createdAt || 0) - (b.createdAt || 0);
      });
      return rows;
    })
    .catch(function() { return []; });
}

function firebaseApproveUserAccount(uid, trade) {
  if (!db || !uid) return Promise.reject(new Error('Account approval is not available.'));
  var defaults = firebaseWorkflowDefaults('worker', trade || 'electrician');
  return db.collection('users').doc(uid).set({
    trade: defaults.trade,
    workflowType: defaults.workflowType,
    requiresSupervisorReview: defaults.requiresSupervisorReview,
    active: true,
    approvalStatus: 'approved',
    updatedAt: Date.now()
  }, { merge: true });
}

function firebaseUpdateUserProfile(uid, patch) {
  if (!db || !uid) return Promise.reject(new Error('Profile update is not available.'));
  patch = Object.assign({}, patch || {}, { updatedAt: Date.now() });
  return db.collection('users').doc(uid).set(patch, { merge: true });
}

function firebaseUpdateCurrentUserPassword(password) {
  var auth = firebaseGetAuth();
  if (!auth || !auth.currentUser) return Promise.reject(new Error('No signed-in user.'));
  return auth.currentUser.updatePassword(password);
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

// Firestore does not support arrays-of-arrays (points: [[x,y],[x,y]...]).
// Strokes are JSON-stringified before saving and parsed back on load.
function _encodeStrokesForFirestore(entry) {
  if (!entry) return entry;
  var out = Object.assign({}, entry);
  if (Array.isArray(out.strokes)) out.strokes = JSON.stringify(out.strokes);
  return out;
}
function _decodeStrokesFromFirestore(entry) {
  if (!entry) return entry;
  var out = Object.assign({}, entry);
  if (typeof out.strokes === 'string') {
    try { out.strokes = JSON.parse(out.strokes); } catch(e) { out.strokes = []; }
  }
  return out;
}

function firebaseSavePSISigs(psiId, data) {
  if (!db || !psiId || !data) return;
  try {
    var clean = JSON.parse(JSON.stringify(data));

    // Encode strokes as JSON strings so Firestore doesn't mangle nested arrays
    if (clean.workers) {
      Object.keys(clean.workers).forEach(function(k) {
        clean.workers[k] = _encodeStrokesForFirestore(clean.workers[k]);
      });
    }
    if (clean.supervisor) {
      clean.supervisor = _encodeStrokesForFirestore(clean.supervisor);
    }
    if (clean.initials) {
      clean.initials = clean.initials.map(_encodeStrokesForFirestore);
    }

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
      db.collection('sigs').doc(psiId).set(clean, { merge: true }).catch(function() {});
    }
  } catch(e) {}
}

function firebaseLoadPSISigs(psiId) {
  if (!db || !psiId) return Promise.resolve(null);
  return db.collection('sigs').doc(psiId).get().then(function(doc) {
    if (!doc.exists) return null;
    var data = doc.data();
    if (!data) return null;
    // Decode strokes back from JSON strings to arrays
    if (data.workers) {
      Object.keys(data.workers).forEach(function(k) {
        data.workers[k] = _decodeStrokesFromFirestore(data.workers[k]);
      });
    }
    if (data.supervisor) {
      data.supervisor = _decodeStrokesFromFirestore(data.supervisor);
    }
    if (Array.isArray(data.initials)) {
      data.initials = data.initials.map(_decodeStrokesFromFirestore);
    }
    return data;
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
  if (!psi || !psi.id) return;
  opts = opts || {};

  // Fetch BOTH the full PSI from Firestore AND the sigs collection in parallel.
  // Fetching the PSI ensures tasks/hazards/workers/PPE are always current on any
  // device — localStorage alone can be stale or incomplete on a second device.
  var sigsPromise = firebaseLoadPSISigs(psi.id);
  var psiPromise  = db
    ? db.collection('psis').doc(psi.id).get().catch(function() { return null; })
    : Promise.resolve(null);

  Promise.all([sigsPromise, psiPromise]).then(function(results) {
    var remoteSigs = results[0];
    var psiSnap    = results[1];

    // Start with local PSI (may have strokes from this device)
    var merged = Object.assign({}, psi);

    // Overlay all content fields from Firestore PSI doc (authoritative source)
    // This fixes tasks/hazards/workers/PPE missing on a second device
    if (psiSnap && psiSnap.exists) {
      var d = psiSnap.data() || {};
      ['taskDesc','taskLoc','jobDate','jobTime','jobNumber','musterPoint',
       'hazards','ppe','conditions','workers','taskStepsText','hazardText',
       'controlText','tasks','weather','weatherTemp','weatherCode','weatherAdvisory',
       'supName','approvedBy','createdBy','jobCode','approved','submittedForApproval'
      ].forEach(function(f) {
        if (d[f] !== undefined) merged[f] = d[f];
      });
    }

    // Layer in sigs from sigs/{psiId} — these have the actual stroke drawings
    if (remoteSigs) {
      if (remoteSigs.workers) {
        if (!merged.sigs) merged.sigs = {};
        Object.keys(remoteSigs.workers).forEach(function(k) {
          var r = remoteSigs.workers[k];
          var l = (psi.sigs || {})[k];
          if (r && r.strokes && r.strokes.length && !(l && l.strokes && l.strokes.length)) {
            merged.sigs[k] = r;
          }
        });
      }
      if (remoteSigs.supervisor && remoteSigs.supervisor.strokes && remoteSigs.supervisor.strokes.length) {
        if (!opts.supStrokes || !opts.supStrokes.length) opts.supStrokes = remoteSigs.supervisor.strokes;
        if (!merged.supSigStrokes || !merged.supSigStrokes.length) merged.supSigStrokes = remoteSigs.supervisor.strokes;
      }
      if (remoteSigs.initials && remoteSigs.initials.length) {
        var seen = {}, combined = [];
        remoteSigs.initials.concat(psi.initials || []).forEach(function(e) {
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
