/* ═══════════════════════════════════════════════════════════════
   js/dashboard.js — dashboard render, tabs, search, delete
═══════════════════════════════════════════════════════════════ */

// ── STATE ─────────────────────────────────────────────────────
let _dashTab   = 'active';
let _allPSIs   = [];   // active (not approved)
let _histPSIs  = [];   // approved


// ── REFRESH (reload from storage) ────────────────────────────

function refreshDash() {
  const idx = loadIndex();
  _allPSIs  = [];
  _histPSIs = [];

  idx.forEach(function(id) {
    const p = loadPSI(id);
    if (!p || p.deleted) return;   // skip soft-deleted records
    if (p.approved) {
      _histPSIs.push(p);
    } else {
      _allPSIs.push(p);
    }
  });

  updateDateline();

  // Pending tab: supervisor only
  var tabPending = document.getElementById('tabPending');
  var isSup = me && me.role === 'supervisor';
  if (tabPending) tabPending.style.display = isSup ? '' : 'none';

  updatePendingBadge();
  renderDash();
}


// ── RENDER ────────────────────────────────────────────────────

function renderDash() {
  const query = (document.getElementById('dashSearch') || {}).value || '';
  const q     = query.toLowerCase().trim();

  // ── Active list ───────────────────────────────────────────
  const activeList = document.getElementById('activeList');
  if (activeList) {
    let items = _allPSIs;   // ALL users see all active PSIs

    // Apply search filter
    if (q) {
      items = items.filter(function(p) { return matchesQuery(p, q); });
    }

    if (items.length === 0) {
      activeList.innerHTML = renderEmpty(
        q ? 'No results for "' + query + '"' : 'No active PSIs',
        q ? 'Try a different search term.' : 'Tap ＋ New PSI to get started.',
        !q
      );
    } else {
      activeList.innerHTML = '';
      items.forEach(function(p) {
        activeList.appendChild(renderPSICard(p, false));
      });
    }
  }

  // ── History list (all users can see approved PSIs) ────────
  const historyList = document.getElementById('historyList');
  if (historyList) {
    if (_dashTab !== 'history') {
      historyList.style.display = 'none';
    } else {
      historyList.style.display = 'block';

      let items = _histPSIs;
      if (q) {
        items = items.filter(function(p) { return matchesQuery(p, q); });
      }

      if (items.length === 0) {
        historyList.innerHTML = renderEmpty(
          q ? 'No results' : 'No approved PSIs yet',
          q ? 'Try a different search.' : 'Approved PSIs appear here.',
          false
        );
      } else {
        historyList.innerHTML = '';
        items.forEach(function(p) {
          historyList.appendChild(renderPSICard(p, true));
        });
      }
    }
  }
}


// ── PSI CARD ──────────────────────────────────────────────────

function renderPSICard(psi, isHist) {
  const card = document.createElement('div');
  card.className = 'psi-card';
  card.onclick   = function(e) {
    if (e.target.classList.contains('psi-del') ||
        e.target.classList.contains('psi-approve-btn') ||
        e.target.classList.contains('psi-dup-btn') ||
        e.target.classList.contains('psi-initial-btn') ||
        e.target.classList.contains('psi-draft-btn')) return;
    openPSI(psi.id);
  };

  // Badge
  const badge = document.createElement('div');
  if (isHist) {
    badge.className   = 'psi-badge green';
    badge.textContent = psi.jobCode || 'DONE';
  } else if (psi.submittedForApproval) {
    badge.className   = 'psi-badge yellow';
    badge.textContent = psi.jobCode || 'PSI';
  } else {
    badge.className   = 'psi-badge';
    badge.textContent = psi.jobCode || 'PSI';
  }

  // Meta
  const meta  = document.createElement('div');
  meta.className = 'psi-meta';

  const title = document.createElement('div');
  title.className   = 'psi-title';
  title.textContent = psi.taskDesc || 'Untitled PSI';

  const sub = document.createElement('div');
  sub.className   = 'psi-sub';
  const parts = [];
  if (psi.jobDate) parts.push(fmtDisplayDate(psi.jobDate));
  if (psi.taskLoc) parts.push(psi.taskLoc);
  if (psi.createdBy) parts.push(psi.createdBy);
  sub.textContent = parts.join(' · ');

  meta.appendChild(title);
  meta.appendChild(sub);

  // Worker pips
  if (psi.workers && psi.workers.length > 0) {
    const pips = document.createElement('div');
    pips.className = 'psi-pips';
    psi.workers.forEach(function(w, i) {
      if (!w.name) return;
      const pip = document.createElement('span');
      // sigs = local stroke data; sigWorkers = synced name list from other devices
      var hasSig = (psi.sigs && psi.sigs[i]) ||
                   (psi.sigWorkers && psi.sigWorkers.indexOf(w.name) !== -1);
      pip.className = 'pip' + (hasSig ? ' done' : '');
      pip.title     = w.name;
      pips.appendChild(pip);
    });
    meta.appendChild(pips);
  }

  // Daily initials row
  if (psi.initials && psi.initials.length > 0) {
    const initRow = document.createElement('div');
    initRow.className = 'psi-initials-row';
    const breakLabel = { '1st': '1B', 'lunch': 'LN', '2nd': '2B' };
    initRow.textContent = '✍ ' + psi.initials.map(function(i) {
      const inits = i.name.split(' ').map(function(n) { return n[0]; }).join('');
      const bl = breakLabel[i.breakType] || '';
      return inits + (bl ? '·' + bl : '') + ' ' + i.time;
    }).join('  ');
    meta.appendChild(initRow);
  }

  // Pending label for workers
  if (!isHist && psi.submittedForApproval && me.role !== 'supervisor') {
    const lbl = document.createElement('div');
    lbl.className   = 'psi-pending-label';
    lbl.textContent = '⏳ Awaiting Supervisor Approval';
    meta.appendChild(lbl);
  }

  // History: approved badge
  if (isHist && psi.approvedBy) {
    const lbl = document.createElement('div');
    lbl.className   = 'psi-pending-label';
    lbl.style.color = 'var(--green)';
    lbl.textContent = '✓ Approved by ' + psi.approvedBy;
    meta.appendChild(lbl);
  }

  // Right column — buttons vary by role + PSI state
  const right = document.createElement('div');
  right.className = 'psi-right';

  const workerCount = (psi.workers || []).filter(function(w) { return w.name; }).length;
  // Use local sigs if available; fall back to synced sigWorkers list from other devices
  const sigCount = Object.keys(psi.sigs || {}).length ||
                   (psi.sigWorkers ? psi.sigWorkers.length : 0);

  const count = document.createElement('div');
  count.className   = 'psi-count';
  count.textContent = sigCount + '/' + workerCount + ' signed';
  right.appendChild(count);

  const isSup            = me.role === 'supervisor';
  const isApproved       = !!psi.approved;
  const workerFieldsOpen = psi.worker_fields_open !== false;   // default open
  const isOwner          = psi.createdBy === me.name;

  // ── APPROVED PSI BUTTONS ──────────────────────────────────
  if (isApproved) {
    // Everyone: re-download PDF
    const dl = document.createElement('button');
    dl.className   = 'psi-del';
    dl.textContent = '↓ PDF';
    dl.onclick     = function(e) { e.stopPropagation(); redownload(psi.id); };
    right.appendChild(dl);

    // Workers: "✍ Sign" if worker fields still open
    if (!isSup && workerFieldsOpen) {
      const signBtn = document.createElement('button');
      signBtn.className   = 'psi-initial-btn';
      signBtn.textContent = '✍ Sign';
      signBtn.onclick     = function(e) { e.stopPropagation(); openPSI(psi.id); };
      right.appendChild(signBtn);
    }

    // Supervisor: re-open, edit, delete
    if (isSup) {
      const reopenBtn = document.createElement('button');
      reopenBtn.className   = 'psi-draft-btn';
      reopenBtn.textContent = '↺ Re-open';
      reopenBtn.onclick     = function(e) { e.stopPropagation(); reopenPSI(psi.id); };
      right.appendChild(reopenBtn);

      const del = document.createElement('button');
      del.className   = 'psi-del';
      del.textContent = 'Delete';
      del.onclick     = function(e) { e.stopPropagation(); deletePSIConfirm(psi.id, psi.taskDesc); };
      right.appendChild(del);
    }

  // ── ACTIVE / DRAFT PSI BUTTONS ────────────────────────────
  } else {
    // Supervisor approve button on submitted cards
    if (isSup && psi.submittedForApproval) {
      const apBtn = document.createElement('button');
      apBtn.className   = 'psi-approve-btn';
      apBtn.textContent = '✅ Approve';
      apBtn.onclick     = function(e) { e.stopPropagation(); openApproveModal(psi.id); };
      right.appendChild(apBtn);
    }

    // Quick initial — available to all on active PSIs
    const initBtn = document.createElement('button');
    initBtn.className   = 'psi-initial-btn';
    initBtn.textContent = '✍ Initial';
    initBtn.onclick     = function(e) { e.stopPropagation(); openQuickSign(psi.id); };
    right.appendChild(initBtn);

    // Draft PDF — available to all
    const draftBtn = document.createElement('button');
    draftBtn.className   = 'psi-draft-btn';
    draftBtn.textContent = '↓ PDF';
    draftBtn.title       = 'Download draft PDF';
    draftBtn.onclick     = function(e) { e.stopPropagation(); buildPDFWithSigs(loadPSI(psi.id), { isFinal: false }); };
    right.appendChild(draftBtn);

    // Duplicate — supervisor or owner
    if (isSup || isOwner) {
      const dup = document.createElement('button');
      dup.className   = 'psi-dup-btn';
      dup.textContent = '⎘ Dupe';
      dup.title       = 'Duplicate this PSI';
      dup.onclick     = function(e) { e.stopPropagation(); duplicatePSI(psi.id); };
      right.appendChild(dup);
    }

    // Delete — available to all
    if (isSup || isOwner || true) {
      const del = document.createElement('button');
      del.className   = 'psi-del';
      del.textContent = 'Delete';
      del.onclick     = function(e) { e.stopPropagation(); deletePSIConfirm(psi.id, psi.taskDesc); };
      right.appendChild(del);
    }
  }

  card.appendChild(badge);
  card.appendChild(meta);
  card.appendChild(right);
  return card;
}


// ── PENDING CARD (supervisor dashboard section) ───────────────

function renderPendCard(psi) {
  const card = document.createElement('div');
  card.className = 'psi-card';
  card.style.borderLeft = '3px solid var(--accent)';
  card.style.padding    = '12px 18px';

  card.onclick = function(e) {
    if (e.target.classList.contains('psi-approve-btn') ||
        e.target.classList.contains('psi-del')) return;
    openPSI(psi.id);
  };

  const meta  = document.createElement('div');
  meta.className = 'psi-meta';

  const title = document.createElement('div');
  title.className   = 'psi-title';
  title.textContent = psi.taskDesc || 'Untitled PSI';

  const sub = document.createElement('div');
  sub.className   = 'psi-sub';
  sub.textContent = (psi.createdBy || '') + (psi.taskLoc ? ' · ' + psi.taskLoc : '');

  meta.appendChild(title);
  meta.appendChild(sub);

  const right = document.createElement('div');
  right.className = 'psi-right';
  right.style.gap = '6px';

  const apBtn = document.createElement('button');
  apBtn.className   = 'psi-approve-btn';
  apBtn.textContent = '✅ Approve';
  apBtn.onclick = function(e) { e.stopPropagation(); openApproveModal(psi.id); };
  right.appendChild(apBtn);

  const delBtn = document.createElement('button');
  delBtn.className   = 'psi-del';
  delBtn.textContent = 'Delete';
  delBtn.onclick = function(e) { e.stopPropagation(); deletePSIConfirm(psi.id, psi.taskDesc); };
  right.appendChild(delBtn);

  card.appendChild(meta);
  card.appendChild(right);
  return card;
}


// ── PENDING TAB ───────────────────────────────────────────────

function renderPendingTab() {
  var container = document.getElementById('dashPending');
  if (!container) return;
  container.innerHTML = '';

  // Pending PSIs
  var pendingPSIs = _allPSIs.filter(function(p) {
    return p.submittedForApproval && !p.approved;
  });

  // Pending lift units (submitted but not approved)
  var pendingLifts = [];
  var liftData = (typeof loadLift === 'function') ? loadLift() : { units: {} };
  Object.keys(liftData.units || {}).forEach(function(key) {
    var u = liftData.units[key];
    if (u && u.status === 'submitted' && !u.approvedAt) {
      pendingLifts.push(u);
    }
  });

  if (pendingPSIs.length === 0 && pendingLifts.length === 0) {
    container.innerHTML = '<div class="pending-all-clear">✅ All caught up — nothing waiting for approval</div>';
    return;
  }

  if (pendingPSIs.length > 0) {
    var h1 = document.createElement('div');
    h1.className   = 'pending-section-head';
    h1.textContent = '📋 PSIs (' + pendingPSIs.length + ')';
    container.appendChild(h1);
    pendingPSIs.forEach(function(p) {
      container.appendChild(renderPendCard(p));
    });
  }

  if (pendingLifts.length > 0) {
    var h2 = document.createElement('div');
    h2.className   = 'pending-section-head';
    h2.textContent = '🔧 Lift Inspections (' + pendingLifts.length + ')';
    container.appendChild(h2);
    pendingLifts.forEach(function(u) {
      container.appendChild(renderPendLiftCard(u));
    });
  }
}

function renderPendLiftCard(unit) {
  var card = document.createElement('div');
  card.className = 'psi-card';
  card.style.borderLeft = '3px solid var(--accent)';
  card.style.padding    = '12px 18px';

  var meta = document.createElement('div');
  meta.className = 'psi-meta';

  var title = document.createElement('div');
  title.className   = 'psi-title';
  title.textContent = '🔧 Unit ' + (unit.unitNum || unit.unitKey || '—');

  var sub = document.createElement('div');
  sub.className   = 'psi-sub';
  var subParts = [];
  if (unit.date)     subParts.push(unit.date);
  if (unit.operator) subParts.push(unit.operator);
  if (unit.make)     subParts.push(unit.make);
  sub.textContent = subParts.join(' · ');

  meta.appendChild(title);
  meta.appendChild(sub);

  var right = document.createElement('div');
  right.className    = 'psi-right';
  right.style.gap    = '6px';

  var apBtn = document.createElement('button');
  apBtn.className   = 'psi-approve-btn';
  apBtn.textContent = '✅ Approve';
  apBtn.onclick = (function(u) {
    return function(e) {
      e.stopPropagation();
      approveLiftFromDash(u.unitKey || u.unitNum);
    };
  })(unit);

  var dlBtn = document.createElement('button');
  dlBtn.className   = 'psi-del';
  dlBtn.textContent = '↓ PDF';
  dlBtn.onclick = (function(u) {
    return function(e) {
      e.stopPropagation();
      if (typeof buildMEWPPDF === 'function') buildMEWPPDF(u, u.opStrokes || []);
    };
  })(unit);

  right.appendChild(apBtn);
  right.appendChild(dlBtn);
  card.appendChild(meta);
  card.appendChild(right);
  return card;
}

function approveLiftFromDash(unitKey) {
  if (!unitKey) return;
  if (!confirm('Approve lift inspection for unit ' + unitKey + '?')) return;

  var liftData = (typeof loadLift === 'function') ? loadLift() : { units: {} };
  var u = liftData.units[unitKey];
  if (!u) { toast('Unit not found'); return; }

  u.approvedBy = me.name;
  u.approvedAt = Date.now();
  u.status     = 'approved';

  if (typeof saveLift === 'function') saveLift(liftData);
  if (typeof archiveLiftInspection === 'function') archiveLiftInspection(u);

  // Generate approved PDF
  if (typeof buildMEWPPDF === 'function') buildMEWPPDF(u, u.opStrokes || []);

  toast('✅ Lift inspection approved — PDF downloading');
  updatePendingBadge();
  renderPendingTab();
}

function updatePendingBadge() {
  var badge = document.getElementById('pendingBadge');
  if (!badge) return;

  var psiCount = _allPSIs.filter(function(p) {
    return p.submittedForApproval && !p.approved;
  }).length;

  var liftCount = 0;
  var liftData = (typeof loadLift === 'function') ? loadLift() : { units: {} };
  Object.keys(liftData.units || {}).forEach(function(key) {
    var u = liftData.units[key];
    if (u && u.status === 'submitted' && !u.approvedAt) liftCount++;
  });

  var total = psiCount + liftCount;
  badge.textContent = total > 0 ? total : '';
}


// ── TABS ──────────────────────────────────────────────────────

function switchTab(tab) {

  _dashTab = tab;

  var btnActive   = document.getElementById('tabActive');
  var btnHistory  = document.getElementById('tabHistory');
  var btnPending  = document.getElementById('tabPending');
  var activeList  = document.getElementById('activeList');
  var historyList = document.getElementById('historyList');
  var dashPending = document.getElementById('dashPending');

  if (btnActive)  btnActive.classList.toggle('active',  tab === 'active');
  if (btnHistory) btnHistory.classList.toggle('active', tab === 'history');
  if (btnPending) btnPending.classList.toggle('active', tab === 'pending');

  if (activeList)  activeList.style.display  = tab === 'active'  ? 'block' : 'none';
  if (historyList) historyList.style.display = tab === 'history' ? 'block' : 'none';
  if (dashPending) dashPending.style.display = tab === 'pending' ? 'block' : 'none';

  if (tab === 'pending') {
    renderPendingTab();
  } else {
    renderDash();
  }
}


// ── DELETE ────────────────────────────────────────────────────

function deletePSIConfirm(id, desc) {
  const label = desc || 'this PSI';
  const psi   = loadPSI(id);
  if (!psi) return;

  // All users can delete PSIs

  if (!confirm('Delete "' + label + '"? This cannot be undone.')) return;

  // Soft-delete approved PSIs (keep record, mark deleted)
  if (psi.approved) {
    psi.deleted    = true;
    psi.deletedAt  = Date.now();
    psi.deletedBy  = me.name;
    writePSI(psi);
    toast('PSI removed from view');
  } else {
    deletePSI(id);
    toast('PSI deleted');
  }
  refreshDash();
}


// ── RE-OPEN APPROVED PSI (supervisor only) ────────────────────

function reopenPSI(id) {
  if (me.role !== 'supervisor') { toast('Supervisor access required'); return; }
  const psi = loadPSI(id);
  if (!psi) return;

  if (!confirm('Re-open this approved PSI for editing?')) return;

  psi.approved          = false;
  psi.approvedBy        = '';
  psi.approvedAt        = null;
  psi.submittedForApproval = false;
  psi.reopenedBy        = me.name;
  psi.reopenedAt        = Date.now();
  psi.worker_fields_open = true;
  writePSI(psi);

  refreshDash();
  toast('↺ PSI re-opened for editing');
}


// ── RE-DOWNLOAD approved PDF ──────────────────────────────────

function redownload(id) {
  const psi = loadPSI(id);
  if (!psi) { toast('PSI not found'); return; }
  buildPDFWithSigs(psi, { isFinal: true });
}


// ── APPROVE MODAL ─────────────────────────────────────────────

let _approvingId = null;

function openApproveModal(id) {
  _approvingId = id;
  const psi = loadPSI(id);
  if (!psi) return;

  const infoEl = document.getElementById('approveInfo');
  if (infoEl) {
    infoEl.textContent = (psi.taskDesc || 'PSI') +
      (psi.taskLoc ? ' · ' + psi.taskLoc : '') +
      (psi.createdBy ? ' — ' + psi.createdBy : '');
  }

  // Pre-fill supervisor name
  const nameEl = document.getElementById('approveSupName');
  if (nameEl) nameEl.value = me.name || '';

  // Show modal
  const modal = document.getElementById('approveModal');
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('open');
  }

  // Init signature canvas
  setTimeout(function() {
    clearSig('approveCanvas');
    initSigPad('approveCanvas');

    // Try to load saved sig
    const saved = loadSignatureFromMem(me.name);
    if (saved && saved.strokes) {
      redrawStrokes('approveCanvas', saved.strokes);
    }
  }, 100);
}

function closeApproveModal() {
  _approvingId = null;
  const modal = document.getElementById('approveModal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('open');
  }
  clearSig('approveCanvas');
}

function doApprove() {
  if (!_approvingId) return;

  const nameEl = document.getElementById('approveSupName');
  const name   = nameEl ? nameEl.value.trim() : '';

  if (!name) { toast('Enter supervisor name'); return; }

  const canvas = document.getElementById('approveCanvas');
  if (!canvas || !canvas.classList.contains('signed')) {
    toast('Please sign before approving');
    return;
  }

  const strokes = (_sigStrokes['approveCanvas'] || []).slice();
  const png     = canvasToPNG('approveCanvas');

  // Save supervisor sig to memory
  saveSignatureToMem(name, strokes, png);

  // Read worker_fields_open toggle
  const wfoEl = document.getElementById('approveWorkerFieldsOpen');
  const workerFieldsOpen = wfoEl ? wfoEl.checked : true;

  // Update PSI record
  const psi = loadPSI(_approvingId);
  if (!psi) { closeApproveModal(); return; }

  psi.approved           = true;
  psi.approvedBy         = name;
  psi.approvedAt         = Date.now();
  psi.supName            = name;
  psi.supSigStrokes      = strokes;
  psi.supSigPng          = png;
  psi.worker_fields_open = workerFieldsOpen;

  writePSI(psi);
  saveLearnedTemplate(psi);
  sheetsSavePSI(psi);

  // Learn hazard selections for this job type
  if (psi.jobCode && typeof recordHazardHistory === 'function') {
    recordHazardHistory(psi.jobCode, psi.hazards || [], psi.customHazards || []);
  }

  // Push supervisor strokes to sigs/{psiId} for cross-device PDF
  if (typeof firebaseSavePSISigs === 'function') {
    firebaseSavePSISigs(psi.id, { supervisor: { name: name, strokes: strokes } });
  }

  closeApproveModal();
  refreshDash();

  // Generate PDF — fetches all signers' strokes from Firestore first
  buildPDFWithSigs(psi, { isFinal: true, supStrokes: strokes, supPng: png });
  toast('✅ PSI approved');
}


// ── DUPLICATE PSI ─────────────────────────────────────────────

function duplicatePSI(id) {
  const src = loadPSI(id);
  if (!src) { toast('PSI not found'); return; }

  const newId  = genId();
  const newRec = Object.assign({}, src, {
    id:          newId,
    createdAt:   Date.now(),
    updatedAt:   Date.now(),
    jobDate:     todayISO(),
    jobTime:     nowTime(),
    sigs:        {},
    initials:    [],
    approved:    false,
    approvedBy:  '',
    approvedAt:  null,
    supName:     '',
    supSigStrokes: [],
    supSigPng:   '',
    submittedForApproval: false,
    taskDesc:    (src.taskDesc || '') + ' (copy)',
  });

  writePSI(newRec);
  refreshDash();
  toast('✓ PSI duplicated — tap to open');
}


// ── SEARCH HELPER ─────────────────────────────────────────────

function matchesQuery(psi, q) {
  const fields = [
    psi.taskDesc  || '',
    psi.taskLoc   || '',
    psi.jobCode   || '',
    psi.createdBy || '',
    psi.jobDate   || '',
  ];
  return fields.some(function(f) { return f.toLowerCase().includes(q); });
}


// ── EMPTY STATE HTML ──────────────────────────────────────────

function renderEmpty(title, sub, showBtn) {
  return '<div class="empty">' +
    '<div class="empty-icon">📋</div>' +
    '<div class="empty-title">' + title + '</div>' +
    '<div class="empty-sub">' + sub + '</div>' +
    (showBtn ? '<button class="btn btn-primary" onclick="newPSI()">＋ New PSI</button>' : '') +
    '</div>';
}
