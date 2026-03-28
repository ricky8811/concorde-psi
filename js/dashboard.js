/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
   js/dashboard.js Ã¢â‚¬â€ dashboard render, tabs, search, delete
Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */

// Ã¢â€â‚¬Ã¢â€â‚¬ STATE Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
let _dashTab   = 'active';
let _allPSIs   = [];   // active (not approved)
let _histPSIs  = [];   // approved

function canCurrentUserSeePSI(psi) {
  if (!psi) return false;
  if (me && userHasFullAccess()) return true;
  var myName = String((me && me.name) || '').trim().toLowerCase();
  if (!myName) return false;
  if (String(psi.createdBy || '').trim().toLowerCase() === myName) return true;
  return (psi.workers || []).some(function(w) {
    return String((w && w.name) || '').trim().toLowerCase() === myName;
  });
}


// Ã¢â€â‚¬Ã¢â€â‚¬ REFRESH (reload from storage) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function refreshDash() {
  const idx = loadIndex();
  _allPSIs  = [];
  _histPSIs = [];

  idx.forEach(function(id) {
    const p = loadPSI(id);
    if (!p || p.deleted) return;   // skip soft-deleted records
    if (!canCurrentUserSeePSI(p)) return;
    if (p.approved) {
      _histPSIs.push(p);
    } else {
      _allPSIs.push(p);
    }
  });

  updateDateline();

  // Pending tab: supervisor only
  var tabPending = document.getElementById('tabPending');
  var isSup = me && userHasFullAccess();
  if (tabPending) tabPending.style.display = isSup ? '' : 'none';

  updatePendingBadge();
  renderDash();
}


// Ã¢â€â‚¬Ã¢â€â‚¬ RENDER Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function renderDash() {
  const query = (document.getElementById('dashSearch') || {}).value || '';
  const q     = query.toLowerCase().trim();

  // Ã¢â€â‚¬Ã¢â€â‚¬ Active list Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const activeList = document.getElementById('activeList');
  if (activeList) {
    let items = _allPSIs;   // ALL users see all active PSIs

    items = items.slice().sort(function(a, b) {
      var aReturned = a && a.reviewStatus === 'returned' ? 1 : 0;
      var bReturned = b && b.reviewStatus === 'returned' ? 1 : 0;
      if (aReturned !== bReturned) return bReturned - aReturned;
      return (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0);
    });

    // Apply search filter
    if (q) {
      items = items.filter(function(p) { return matchesQuery(p, q); });
    }

    if (items.length === 0) {
      activeList.innerHTML = renderEmpty(
        q ? 'No results for "' + query + '"' : 'No active PSIs',
        q ? 'Try a different search term.' : 'Tap + New PSI to get started.',
        !q
      );
    } else {
      activeList.innerHTML = '';
      items.forEach(function(p) {
        activeList.appendChild(renderPSICard(p, false));
      });
    }
  }

  // Ã¢â€â‚¬Ã¢â€â‚¬ History list (all users can see approved PSIs) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
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


// Ã¢â€â‚¬Ã¢â€â‚¬ PSI CARD Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

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
  if (psi.jobNumber) parts.push(psi.jobNumber);
  if (psi.taskLoc) parts.push(psi.taskLoc);
  if (psi.createdBy) parts.push(psi.createdBy);
  sub.textContent = parts.join(' - ');

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
    initRow.textContent = psi.initials.map(function(i) {
      const inits = i.name.split(' ').map(function(n) { return n[0]; }).join('');
      const bl = breakLabel[i.breakType] || '';
      return inits + (bl ? '-' + bl : '') + ' ' + i.time;
    }).join('  ');
    meta.appendChild(initRow);
  }

  // Pending label for workers
  if (!isHist && psi.submittedForApproval && !userHasFullAccess()) {
    const lbl = document.createElement('div');
    lbl.className   = 'psi-pending-label';
    lbl.textContent = 'In Supervisor Review';
    meta.appendChild(lbl);
  }
  if (!isHist && psi.reviewStatus === 'returned' && !userHasFullAccess()) {
    const lbl = document.createElement('div');
    lbl.className   = 'psi-pending-label';
    lbl.textContent = 'Returned for changes';
    meta.appendChild(lbl);
    if (psi.reviewNote) {
      const note = document.createElement('div');
      note.className = 'psi-pending-label';
      note.textContent = 'Review note: ' + psi.reviewNote;
      meta.appendChild(note);
    }
  }

  // History: approved badge
  if (isHist && psi.approvedBy) {
    const lbl = document.createElement('div');
    lbl.className   = 'psi-pending-label';
    lbl.style.color = 'var(--green)';
    lbl.textContent = 'Approved by ' + psi.approvedBy;
    meta.appendChild(lbl);
  }

  // Right column Ã¢â‚¬â€ buttons vary by role + PSI state
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

  const isSup            = userHasFullAccess();
  const isApproved       = !!psi.approved;
  const workerFieldsOpen = psi.worker_fields_open !== false;   // default open
  const isOwner          = psi.createdBy === me.name;

  // Ã¢â€â‚¬Ã¢â€â‚¬ APPROVED PSI BUTTONS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  if (isApproved) {
    // Everyone: re-download PDF
    const dl = document.createElement('button');
    dl.className   = 'psi-del';
    dl.textContent = 'Preview PDF';
    dl.onclick     = function(e) { e.stopPropagation(); redownload(psi.id); };
    if (typeof attachPDFHoverPreview === 'function') {
      attachPDFHoverPreview(dl, function(onReady) {
        buildPDFWithSigs(loadPSI(psi.id), { isFinal: true, onReady: onReady });
      });
    }
    right.appendChild(dl);

    // Workers: quick Sign on approved cards
    if (!isSup && workerFieldsOpen) {
      const signBtn = document.createElement('button');
      signBtn.className   = 'psi-initial-btn';
      signBtn.textContent = 'Sign';
      signBtn.onclick     = function(e) { e.stopPropagation(); openQuickWorkerSign(psi.id); };
      right.appendChild(signBtn);
    }

    // Supervisor: re-open, edit, delete
    if (isSup) {
      const reopenBtn = document.createElement('button');
      reopenBtn.className   = 'psi-draft-btn';
      reopenBtn.textContent = 'Ã¢â€ Âº Re-open';
      reopenBtn.onclick     = function(e) { e.stopPropagation(); reopenPSI(psi.id); };
      right.appendChild(reopenBtn);

      const del = document.createElement('button');
      del.className   = 'psi-del';
      del.textContent = 'Delete';
      del.onclick     = function(e) { e.stopPropagation(); deletePSIConfirm(psi.id, psi.taskDesc); };
      right.appendChild(del);
    }

  // Ã¢â€â‚¬Ã¢â€â‚¬ ACTIVE / DRAFT PSI BUTTONS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  } else {
    // Supervisor approve button on submitted cards
    if (isSup && psi.submittedForApproval) {
      const apBtn = document.createElement('button');
      apBtn.className   = 'psi-approve-btn';
      apBtn.textContent = 'Approve';
      apBtn.onclick     = function(e) { e.stopPropagation(); openApproveModal(psi.id); };
      right.appendChild(apBtn);
    }

    // Quick sign available to all on active PSIs
    const signBtn2 = document.createElement('button');
    signBtn2.className   = 'psi-initial-btn';
    signBtn2.textContent = 'Sign';
    signBtn2.onclick     = function(e) { e.stopPropagation(); openQuickWorkerSign(psi.id); };
    right.appendChild(signBtn2);

    // Quick initial Ã¢â‚¬â€ available to all on active PSIs
    const initBtn = document.createElement('button');
    initBtn.className   = 'psi-initial-btn';
    initBtn.textContent = 'Ã¢Å“Â Initial';
    initBtn.onclick     = function(e) { e.stopPropagation(); openQuickSign(psi.id); };
    right.appendChild(initBtn);

    // Draft PDF Ã¢â‚¬â€ available to all
    const draftBtn = document.createElement('button');
    draftBtn.className   = 'psi-draft-btn';
    draftBtn.textContent = 'Preview PDF';
    draftBtn.title       = 'Preview draft PDF';
    draftBtn.onclick     = function(e) { e.stopPropagation(); buildPDFWithSigs(loadPSI(psi.id), { isFinal: false, preview: true }); };
    if (typeof attachPDFHoverPreview === 'function') {
      attachPDFHoverPreview(draftBtn, function(onReady) {
        buildPDFWithSigs(loadPSI(psi.id), { isFinal: false, onReady: onReady });
      });
    }
    right.appendChild(draftBtn);

    // Duplicate Ã¢â‚¬â€ supervisor or owner
    if (isSup || isOwner) {
      const dup = document.createElement('button');
      dup.className   = 'psi-dup-btn';
      dup.textContent = 'Ã¢Å½Ëœ Dupe';
      dup.title       = 'Duplicate this PSI';
      dup.onclick     = function(e) { e.stopPropagation(); duplicatePSI(psi.id); };
      right.appendChild(dup);
    }

    // Delete Ã¢â‚¬â€ supervisor or owner only
    if (isSup || isOwner) {
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


// Ã¢â€â‚¬Ã¢â€â‚¬ PENDING CARD (supervisor dashboard section) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function renderPendCard(psi, liftData) {
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
  sub.textContent = (psi.createdBy || '') + (psi.taskLoc ? ' Ã‚Â· ' + psi.taskLoc : '');

  meta.appendChild(title);
  meta.appendChild(sub);

  var linkedLift = null;
  if (psi.liftUnitKey && liftData && liftData.units && liftData.units[psi.liftUnitKey]) {
    linkedLift = liftData.units[psi.liftUnitKey];
  }
  if (linkedLift) {
    const liftLbl = document.createElement('div');
    liftLbl.className = 'psi-pending-label';
    liftLbl.textContent = 'Lift ' + (linkedLift.unitNum || psi.liftUnitKey) +
      ' Ã‚Â· ' + (linkedLift.status || 'draft');
    meta.appendChild(liftLbl);
  }

  const right = document.createElement('div');
  right.className = 'psi-right';
  right.style.gap = '6px';

  const apBtn = document.createElement('button');
  apBtn.className   = 'psi-approve-btn';
  apBtn.textContent = 'Approve';
  apBtn.onclick = function(e) { e.stopPropagation(); openApproveModal(psi.id); };
  right.appendChild(apBtn);

  if (linkedLift) {
    const liftBtn = document.createElement('button');
    liftBtn.className = 'psi-draft-btn';
    liftBtn.textContent = 'Lift';
    liftBtn.onclick = function(e) {
      e.stopPropagation();
      if (typeof showLiftPaneForUnit === 'function') showLiftPaneForUnit(psi.liftUnitKey);
      else if (typeof showLiftPane === 'function') showLiftPane();
    };
    right.appendChild(liftBtn);
  }

  const delBtn = document.createElement('button');
  delBtn.className   = 'psi-del';
  delBtn.textContent = 'Delete';
  delBtn.onclick = function(e) { e.stopPropagation(); deletePSIConfirm(psi.id, psi.taskDesc); };
  right.appendChild(delBtn);

  card.appendChild(meta);
  card.appendChild(right);
  return card;
}


// Ã¢â€â‚¬Ã¢â€â‚¬ PENDING TAB Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

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
    var linkedPendingPSI = u && u.psiId && _allPSIs.some(function(p) {
      return p.id === u.psiId && p.submittedForApproval && !p.approved;
    });
    if (u && u.status === 'submitted' && !u.approvedAt && !linkedPendingPSI) {
      pendingLifts.push(u);
    }
  });

  if (pendingPSIs.length === 0 && pendingLifts.length === 0) {
    container.innerHTML = '<div class="pending-all-clear">All caught up - nothing waiting for approval</div>';
    return;
  }

  if (pendingPSIs.length > 0) {
    var h1 = document.createElement('div');
    h1.className   = 'pending-section-head';
    h1.textContent = 'PSIs (' + pendingPSIs.length + ')';
    container.appendChild(h1);
    pendingPSIs.forEach(function(p) {
      container.appendChild(renderPendCard(p, liftData));
    });
  }

  if (pendingLifts.length > 0) {
    var h2 = document.createElement('div');
    h2.className   = 'pending-section-head';
    h2.textContent = 'Lift Inspections (' + pendingLifts.length + ')';
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
  title.textContent = 'Unit ' + (unit.unitNum || unit.unitKey || '-');

  var sub = document.createElement('div');
  sub.className   = 'psi-sub';
  var subParts = [];
  if (unit.date)     subParts.push(unit.date);
  if (unit.operator) subParts.push(unit.operator);
  if (unit.make)     subParts.push(unit.make);
  sub.textContent = subParts.join(' Ã‚Â· ');

  meta.appendChild(title);
  meta.appendChild(sub);

  var right = document.createElement('div');
  right.className    = 'psi-right';
  right.style.gap    = '6px';

  var apBtn = document.createElement('button');
  apBtn.className   = 'psi-approve-btn';
  apBtn.textContent = 'Approve';
  apBtn.onclick = (function(u) {
    return function(e) {
      e.stopPropagation();
      approveLiftFromDash(u.unitKey || u.unitNum);
    };
  })(unit);

  var dlBtn = document.createElement('button');
  dlBtn.className   = 'psi-del';
  dlBtn.textContent = 'Ã¢â€ â€œ PDF';
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

  toast('Lift inspection approved - PDF downloading');
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


// Ã¢â€â‚¬Ã¢â€â‚¬ TABS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

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


// Ã¢â€â‚¬Ã¢â€â‚¬ DELETE Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

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


// Ã¢â€â‚¬Ã¢â€â‚¬ RE-OPEN APPROVED PSI (supervisor only) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function reopenPSI(id) {
  if (!userHasFullAccess()) { toast('Admin or supervisor access required'); return; }
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
  toast('Ã¢â€ Âº PSI re-opened for editing');
}


// Ã¢â€â‚¬Ã¢â€â‚¬ RE-DOWNLOAD approved PDF Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function redownload(id) {
  const psi = loadPSI(id);
  if (!psi) { toast('PSI not found'); return; }
  buildPDFWithSigs(psi, { isFinal: true, preview: true });
}


// Ã¢â€â‚¬Ã¢â€â‚¬ APPROVE MODAL Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

let _approvingId = null;

function openApproveModal(id) {
  _approvingId = id;
  const psi = loadPSI(id);
  if (!psi) return;

  const infoEl = document.getElementById('approveInfo');
  if (infoEl) {
    infoEl.textContent = (psi.taskDesc || 'PSI') +
      (psi.taskLoc ? ' Ã‚Â· ' + psi.taskLoc : '') +
      (psi.createdBy ? ' Ã¢â‚¬â€ ' + psi.createdBy : '');
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

  // Generate PDF Ã¢â‚¬â€ fetches all signers' strokes from Firestore first
  buildPDFWithSigs(psi, { isFinal: true, supStrokes: strokes, supPng: png });
  toast('Ã¢Å“â€¦ PSI approved');
}


// Ã¢â€â‚¬Ã¢â€â‚¬ DUPLICATE PSI Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

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
  toast('Ã¢Å“â€œ PSI duplicated Ã¢â‚¬â€ tap to open');
}


// Ã¢â€â‚¬Ã¢â€â‚¬ SEARCH HELPER Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function matchesQuery(psi, q) {
  var workOrderText = '';
  if (Array.isArray(psi.workOrders) && psi.workOrders.length) {
    workOrderText = psi.workOrders.map(function(wo) {
      return [wo.number || '', wo.description || ''].join(' ');
    }).join(' ');
  }
  const fields = [
    psi.jobTitle  || '',
    psi.taskDesc  || '',
    psi.taskLoc   || '',
    psi.jobCode   || '',
    psi.jobNumber || '',
    psi.createdBy || '',
    psi.jobDate   || '',
    workOrderText,
  ];
  return fields.some(function(f) { return f.toLowerCase().includes(q); });
}


// Ã¢â€â‚¬Ã¢â€â‚¬ EMPTY STATE HTML Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function renderEmpty(title, sub, showBtn) {
  return '<div class="empty">' +
    '<div class="empty-icon">PSI</div>' +
    '<div class="empty-title">' + title + '</div>' +
    '<div class="empty-sub">' + sub + '</div>' +
    (showBtn ? '<button class="btn btn-primary" onclick="newPSI()">+ New PSI</button>' : '') +
    '</div>';
}

// Override pending rendering so standalone lift inspections appear in the same
// supervisor queue as submitted PSIs.
function renderPendingTab() {
  var container = document.getElementById('dashPending');
  if (!container) return;
  container.innerHTML = '';

  var pendingPSIs = _allPSIs.filter(function(p) {
    return p.submittedForApproval && !p.approved;
  });

  var pendingLifts = [];
  var liftData = (typeof loadLift === 'function') ? loadLift() : { units: {} };
  Object.keys(liftData.units || {}).forEach(function(key) {
    var u = liftData.units[key];
    var linkedPendingPSI = u && u.psiId && _allPSIs.some(function(p) {
      return p.id === u.psiId && p.submittedForApproval && !p.approved;
    });
    if (u && u.status === 'submitted' && !u.approvedAt && !linkedPendingPSI) {
      pendingLifts.push(u);
    }
  });

  if (pendingPSIs.length === 0 && pendingLifts.length === 0) {
    container.innerHTML = '<div class="pending-all-clear">All caught up - nothing waiting for review</div>';
    return;
  }

  var h1 = document.createElement('div');
  h1.className = 'pending-section-head';
  h1.textContent = 'Review Queue (' + (pendingPSIs.length + pendingLifts.length) + ')';
  container.appendChild(h1);

  pendingPSIs.forEach(function(p) {
    container.appendChild(renderPendCard(p, liftData));
  });

  pendingLifts.forEach(function(u) {
    container.appendChild(renderPendLiftCard(u));
  });
}

function renderPendLiftCard(unit) {
  var card = document.createElement('div');
  card.className = 'psi-card';
  card.style.borderLeft = '3px solid var(--accent)';
  card.style.padding = '12px 18px';

  card.onclick = (function(u) {
    return function(e) {
      if (e.target.classList.contains('psi-approve-btn') ||
          e.target.classList.contains('psi-del') ||
          e.target.classList.contains('psi-draft-btn')) return;
      if (typeof showLiftPaneForUnit === 'function') showLiftPaneForUnit(u.unitKey || u.unitNum);
      else if (typeof showLiftPane === 'function') showLiftPane();
    };
  })(unit);

  var meta = document.createElement('div');
  meta.className = 'psi-meta';

  var title = document.createElement('div');
  title.className = 'psi-title';
  title.textContent = 'Lift Inspection - ' + (unit.unitNum || unit.unitKey || '--');

  var sub = document.createElement('div');
  sub.className = 'psi-sub';
  var subParts = [];
  if (unit.date) subParts.push(unit.date);
  if (unit.operator) subParts.push(unit.operator);
  if (unit.make) subParts.push(unit.make);
  sub.textContent = subParts.join(' - ');

  meta.appendChild(title);
  meta.appendChild(sub);

  var right = document.createElement('div');
  right.className = 'psi-right';
  right.style.gap = '6px';

  var apBtn = document.createElement('button');
  apBtn.className = 'psi-approve-btn';
  apBtn.textContent = 'Approve';
  apBtn.onclick = (function(u) {
    return function(e) {
      e.stopPropagation();
      approveLiftFromDash(u.unitKey || u.unitNum);
    };
  })(unit);

  var dlBtn = document.createElement('button');
  dlBtn.className = 'psi-draft-btn';
  dlBtn.textContent = 'Preview PDF';
  dlBtn.onclick = (function(u) {
    return function(e) {
      e.stopPropagation();
      if (typeof buildMEWPPDF === 'function') buildMEWPPDF(u, u.opStrokes || [], u.supStrokes || [], { preview: true });
    };
  })(unit);
  if (typeof attachPDFHoverPreview === 'function') {
    attachPDFHoverPreview(dlBtn, function(onReady) {
      if (typeof buildMEWPPDF === 'function') buildMEWPPDF(unit, unit.opStrokes || [], unit.supStrokes || [], { onReady: onReady });
    });
  }

  right.appendChild(apBtn);
  right.appendChild(dlBtn);
  card.appendChild(meta);
  card.appendChild(right);
  return card;
}

// Override review cards so supervisors can approve or send back directly from the queue.
function renderPendCard(psi, liftData) {
  const card = document.createElement('div');
  card.className = 'psi-card';
  card.style.borderLeft = '3px solid var(--accent)';
  card.style.padding = '12px 18px';

  card.onclick = function(e) {
    if (e.target.classList.contains('psi-approve-btn') ||
        e.target.classList.contains('psi-del') ||
        e.target.classList.contains('psi-draft-btn')) return;
    openPSI(psi.id);
  };

  const meta = document.createElement('div');
  meta.className = 'psi-meta';
  liftData = liftData || (typeof loadLift === 'function' ? loadLift() : { units: {} });

  const title = document.createElement('div');
  title.className = 'psi-title';
  title.textContent = psi.taskDesc || 'Untitled PSI';

  const sub = document.createElement('div');
  sub.className = 'psi-sub';
  sub.textContent = (psi.createdBy || '') + (psi.taskLoc ? ' - ' + psi.taskLoc : '');

  meta.appendChild(title);
  meta.appendChild(sub);

  var linkedLift = null;
  if (psi.liftUnitKey && liftData && liftData.units && liftData.units[psi.liftUnitKey]) {
    linkedLift = liftData.units[psi.liftUnitKey];
  }
  if (linkedLift) {
    const liftLbl = document.createElement('div');
    liftLbl.className = 'psi-pending-label';
    liftLbl.textContent = 'Lift ' + (linkedLift.unitNum || psi.liftUnitKey) + ' - ' + (linkedLift.status || 'draft');
    meta.appendChild(liftLbl);

    if (linkedLift.reviewNote) {
      const note = document.createElement('div');
      note.className = 'psi-pending-label';
      note.textContent = 'Review note: ' + linkedLift.reviewNote;
      meta.appendChild(note);
    }
  }

  const right = document.createElement('div');
  right.className = 'psi-right';
  right.style.gap = '6px';

  const apBtn = document.createElement('button');
  apBtn.className = 'psi-approve-btn';
  apBtn.textContent = 'Approve';
  apBtn.onclick = function(e) { e.stopPropagation(); openApproveModal(psi.id); };
  right.appendChild(apBtn);

  if (linkedLift) {
    const liftBtn = document.createElement('button');
    liftBtn.className = 'psi-draft-btn';
    liftBtn.textContent = linkedLift.status === 'returned' ? 'Open Return' : 'Open Lift';
    liftBtn.onclick = function(e) {
      e.stopPropagation();
      if (typeof showLiftPaneForUnit === 'function') showLiftPaneForUnit(psi.liftUnitKey);
      else if (typeof showLiftPane === 'function') showLiftPane();
    };
    right.appendChild(liftBtn);
  }

  card.appendChild(meta);
  card.appendChild(right);
  return card;
}

function renderPendLiftCard(unit) {
  var card = document.createElement('div');
  card.className = 'psi-card';
  card.style.borderLeft = '3px solid var(--accent)';
  card.style.padding = '12px 18px';

  card.onclick = (function(u) {
    return function(e) {
      if (e.target.classList.contains('psi-approve-btn') ||
          e.target.classList.contains('psi-del') ||
          e.target.classList.contains('psi-draft-btn')) return;
      if (typeof showLiftPaneForUnit === 'function') showLiftPaneForUnit(u.unitKey || u.unitNum);
      else if (typeof showLiftPane === 'function') showLiftPane();
    };
  })(unit);

  var meta = document.createElement('div');
  meta.className = 'psi-meta';

  var title = document.createElement('div');
  title.className = 'psi-title';
  title.textContent = 'Lift Inspection - ' + (unit.unitNum || unit.unitKey || '--');

  var sub = document.createElement('div');
  sub.className = 'psi-sub';
  var subParts = [];
  if (unit.date) subParts.push(unit.date);
  if (unit.operator) subParts.push(unit.operator);
  if (unit.make) subParts.push(unit.make);
  sub.textContent = subParts.join(' - ');

  meta.appendChild(title);
  meta.appendChild(sub);

  if (unit.reviewNote) {
    var note = document.createElement('div');
    note.className = 'psi-pending-label';
    note.textContent = 'Review note: ' + unit.reviewNote;
    meta.appendChild(note);
  }

  var right = document.createElement('div');
  right.className = 'psi-right';
  right.style.gap = '6px';

  var apBtn = document.createElement('button');
  apBtn.className = 'psi-approve-btn';
  apBtn.textContent = 'Approve';
  apBtn.onclick = (function(u) {
    return function(e) {
      e.stopPropagation();
      approveLiftFromDash(u.unitKey || u.unitNum);
    };
  })(unit);

  var backBtn = document.createElement('button');
  backBtn.className = 'psi-draft-btn';
  backBtn.textContent = 'Send Back';
  backBtn.onclick = (function(u) {
    return function(e) {
      e.stopPropagation();
      returnLiftFromDash(u.unitKey || u.unitNum);
    };
  })(unit);

  var previewBtn = document.createElement('button');
  previewBtn.className = 'psi-draft-btn';
  previewBtn.textContent = 'Preview PDF';
  previewBtn.onclick = (function(u) {
    return function(e) {
      e.stopPropagation();
      if (typeof buildMEWPPDF === 'function') buildMEWPPDF(u, u.opStrokes || [], u.supStrokes || [], { preview: true });
    };
  })(unit);
  if (typeof attachPDFHoverPreview === 'function') {
    attachPDFHoverPreview(previewBtn, function(onReady) {
      if (typeof buildMEWPPDF === 'function') buildMEWPPDF(unit, unit.opStrokes || [], unit.supStrokes || [], { onReady: onReady });
    });
  }

  var openBtn = document.createElement('button');
  openBtn.className = 'psi-draft-btn';
  openBtn.textContent = 'Open';
  openBtn.onclick = (function(u) {
    return function(e) {
      e.stopPropagation();
      if (typeof showLiftPaneForUnit === 'function') showLiftPaneForUnit(u.unitKey || u.unitNum);
      else if (typeof showLiftPane === 'function') showLiftPane();
    };
  })(unit);

  right.appendChild(apBtn);
  right.appendChild(backBtn);
  right.appendChild(previewBtn);
  right.appendChild(openBtn);
  card.appendChild(meta);
  card.appendChild(right);
  return card;
}

function returnLiftFromDash(unitKey) {
  if (!unitKey) return;
  var liftData = (typeof loadLift === 'function') ? loadLift() : { units: {} };
  var u = liftData.units[unitKey];
  if (!u) { toast('Unit not found'); return; }

  var note = prompt('What should be fixed before approval?', u.reviewNote || '');
  if (note === null) return;
  note = (note || '').trim();
  if (!note) { toast('Add a review note first'); return; }

  u.status = 'returned';
  u.reviewNote = note;
  u.reviewedBy = me.name || '';
  u.reviewedAt = Date.now();

  if (typeof saveLift === 'function') saveLift(liftData);
  if (typeof syncLinkedLiftPSI === 'function') syncLinkedLiftPSI(unitKey);

  updatePendingBadge();
  renderPendingTab();
  toast('Sent back to worker for changes');
}

// Override PSI review cards with send-back support.
function renderPendCard(psi, liftData) {
  const card = document.createElement('div');
  card.className = 'psi-card';
  card.style.borderLeft = '3px solid var(--accent)';
  card.style.padding = '12px 18px';

  card.onclick = function(e) {
    if (e.target.classList.contains('psi-approve-btn') ||
        e.target.classList.contains('psi-del') ||
        e.target.classList.contains('psi-draft-btn')) return;
    openPSI(psi.id);
  };

  const meta = document.createElement('div');
  meta.className = 'psi-meta';

  const title = document.createElement('div');
  title.className = 'psi-title';
  title.textContent = psi.taskDesc || 'Untitled PSI';

  const sub = document.createElement('div');
  sub.className = 'psi-sub';
  sub.textContent = (psi.createdBy || '') + (psi.taskLoc ? ' - ' + psi.taskLoc : '');

  meta.appendChild(title);
  meta.appendChild(sub);

  if (linkedLift) {
    const liftRow = document.createElement('div');
    liftRow.className = 'psi-sub';
    liftRow.textContent = 'Lift: ' + (linkedLift.unitNum || psi.liftUnitKey) + ' - ' + (linkedLift.status || psi.liftInspectionStatus || 'linked');
    meta.appendChild(liftRow);

    if (linkedLift.reviewNote) {
      const liftNote = document.createElement('div');
      liftNote.className = 'psi-pending-label';
      liftNote.textContent = 'Lift note: ' + linkedLift.reviewNote;
      meta.appendChild(liftNote);
    }
  }

  if (psi.reviewNote) {
    const note = document.createElement('div');
    note.className = 'psi-pending-label';
    note.textContent = 'Review note: ' + psi.reviewNote;
    meta.appendChild(note);
  }

  var linkedLift = null;
  if (psi.liftUnitKey && liftData && liftData.units && liftData.units[psi.liftUnitKey]) {
    linkedLift = liftData.units[psi.liftUnitKey];
  }
  if (linkedLift) {
    const liftLbl = document.createElement('div');
    liftLbl.className = 'psi-pending-label';
    liftLbl.textContent = 'Lift ' + (linkedLift.unitNum || psi.liftUnitKey) + ' - ' + (linkedLift.status || 'draft');
    meta.appendChild(liftLbl);
  }

  const right = document.createElement('div');
  right.className = 'psi-right';
  right.style.gap = '6px';

  const apBtn = document.createElement('button');
  apBtn.className = 'psi-approve-btn';
  apBtn.textContent = 'Approve';
  apBtn.onclick = function(e) { e.stopPropagation(); openApproveModal(psi.id); };
  right.appendChild(apBtn);

  const backBtn = document.createElement('button');
  backBtn.className = 'psi-draft-btn';
  backBtn.textContent = 'Send Back';
  backBtn.onclick = function(e) { e.stopPropagation(); returnPSIFromDash(psi.id); };
  right.appendChild(backBtn);

  const previewBtn = document.createElement('button');
  previewBtn.className = 'psi-draft-btn';
  previewBtn.textContent = 'Preview PDF';
  previewBtn.onclick = function(e) {
    e.stopPropagation();
    redownload(psi.id);
  };
  if (typeof attachPDFHoverPreview === 'function') {
    attachPDFHoverPreview(previewBtn, function(onReady) {
      buildPDFWithSigs(loadPSI(psi.id), { isFinal: true, onReady: onReady });
    });
  }
  right.appendChild(previewBtn);

  if (linkedLift) {
    const liftBtn = document.createElement('button');
    liftBtn.className = 'psi-draft-btn';
    liftBtn.textContent = linkedLift.status === 'returned' ? 'Open Return' : 'Open Lift';
    liftBtn.onclick = function(e) {
      e.stopPropagation();
      if (typeof showLiftPaneForUnit === 'function') showLiftPaneForUnit(psi.liftUnitKey);
      else if (typeof showLiftPane === 'function') showLiftPane();
    };
    right.appendChild(liftBtn);
  }

  card.appendChild(meta);
  card.appendChild(right);
  return card;
}

function returnPSIFromDash(psiId) {
  if (!psiId) return;
  var psi = typeof loadPSI === 'function' ? loadPSI(psiId) : null;
  if (!psi) { toast('PSI not found'); return; }

  var note = prompt('What should be fixed before approval?', psi.reviewNote || '');
  if (note === null) return;
  note = (note || '').trim();
  if (!note) { toast('Add a review note first'); return; }

  psi.submittedForApproval = false;
  psi.reviewStatus = 'returned';
  psi.reviewNote = note;
  psi.reviewedBy = me.name || '';
  psi.reviewedAt = Date.now();

  if (typeof writePSI === 'function') writePSI(psi);
  refreshDash();
  updatePendingBadge();
  renderPendingTab();
  toast('PSI sent back for changes');
}

let _returnedPromptKey = null;

function maybePromptReturnedItems() {
  if (!me || !me.name || userHasFullAccess()) return;

  var myReturnedPSIs = _allPSIs.filter(function(p) {
    return p && p.reviewStatus === 'returned' && !p.approved && (
      (p.createdBy || '').trim().toLowerCase() === (me.name || '').trim().toLowerCase() ||
      (p.workers || []).some(function(w) {
        return w && w.name && w.name.trim().toLowerCase() === (me.name || '').trim().toLowerCase();
      })
    );
  });

  var liftData = (typeof loadLift === 'function') ? loadLift() : { units: {} };
  var myReturnedLifts = Object.keys(liftData.units || {}).map(function(key) {
    var u = liftData.units[key];
    if (!u) return null;
    u.unitKey = u.unitKey || key;
    return u;
  }).filter(function(u) {
    return u && u.status === 'returned' && (
      (u.operator || '').trim().toLowerCase() === (me.name || '').trim().toLowerCase()
    );
  });

  var key = [myReturnedPSIs.map(function(p) { return p.id; }).join(','), myReturnedLifts.map(function(u) { return u.unitKey || u.unitNum; }).join(',')].join('|');
  if (!key || key === '|' || key === _returnedPromptKey) return;
  _returnedPromptKey = key;

  var total = myReturnedPSIs.length + myReturnedLifts.length;
  var msg = 'You have ' + total + ' item' + (total !== 1 ? 's' : '') + ' returned for changes.';
  if (myReturnedPSIs.length && confirm(msg + ' Open the first returned PSI now?')) {
    openPSI(myReturnedPSIs[0].id);
    return;
  }
  if (myReturnedLifts.length && confirm(msg + ' Open the first returned lift now?')) {
    if (typeof showLiftPaneForUnit === 'function') showLiftPaneForUnit(myReturnedLifts[0].unitKey || myReturnedLifts[0].unitNum);
  } else {
    toast(msg);
  }
}

function getPSIStatusMeta(psi, isHist) {
  if (isHist || psi.approved) return { label: 'Approved', card: 'status-approved', pill: 'ready' };
  if (psi.reviewStatus === 'returned') return { label: 'Needs Changes', card: 'status-returned', pill: 'returned' };
  if (psi.submittedForApproval) return { label: 'In Review', card: 'status-review', pill: 'review' };
  return { label: 'Active', card: '', pill: '' };
}

function renderDashSummaryCard(label, value, note) {
  var card = document.createElement('div');
  card.className = 'dash-summary-card';
  card.innerHTML =
    '<div class="dash-summary-label">' + label + '</div>' +
    '<div class="dash-summary-value">' + value + '</div>' +
    '<div class="dash-summary-note">' + note + '</div>';
  return card;
}

function renderDashboardHeader() {
  var eyebrow = document.getElementById('dashEyebrow');
  var title = document.getElementById('dashTitle');
  var subtitle = document.getElementById('dashSubtitle');
  var identityLabel = document.getElementById('dashIdentityLabel');
  var welcome = document.getElementById('dashWelcome');
  var signedInStrip = document.getElementById('signedInStrip');
  var signedInName = document.getElementById('signedInName');
  var summary = document.getElementById('dashSummary');
  if (!summary) return;

  var active = _allPSIs.filter(function(p) { return !p.submittedForApproval && p.reviewStatus !== 'returned'; }).length;
  var returned = _allPSIs.filter(function(p) { return p.reviewStatus === 'returned'; }).length;
  var review = _allPSIs.filter(function(p) { return p.submittedForApproval && !p.approved; }).length;
  var openLifts = 0;
  if (typeof loadLift === 'function') {
    var liftData = loadLift();
    openLifts = Object.keys((liftData && liftData.units) || {}).filter(function(key) {
      var u = liftData.units[key];
      return u && u.status !== 'approved';
    }).length;
  }

  if (me && userHasFullAccess()) {
    if (eyebrow) eyebrow.textContent = 'Supervisor View';
    if (title) title.textContent = 'Review and Field Work';
    if (subtitle) subtitle.textContent = 'Review queue first, then monitor open jobs and attached lift inspections.';
  } else {
    if (eyebrow) eyebrow.textContent = 'Worker View';
    if (title) title.textContent = "Today's Open Work";
    if (subtitle) subtitle.textContent = 'Start new paperwork fast, track what is in review, and fix returned items first.';
  }
  if (welcome) {
    var trade = String((me && me.trade) || '').trim();
    var tradeLabel = trade ? (trade.charAt(0).toUpperCase() + trade.slice(1)) : '';
    if (identityLabel) identityLabel.textContent = me && me.role === 'admin' ? 'Admin' : (me && me.role === 'supervisor' ? 'Supervisor' : 'Technician');
    welcome.textContent = me && me.name
      ? (me.name + (tradeLabel ? ' - ' + tradeLabel : ''))
      : '';
    if (signedInStrip) signedInStrip.style.display = me && me.name ? '' : 'none';
    if (signedInName) signedInName.textContent = me && me.name
      ? (((me.role === 'admin' ? 'Admin' : (me.role === 'supervisor' ? 'Supervisor' : 'Technician'))) + ' - ' + me.name + (tradeLabel ? ' - ' + tradeLabel : ''))
      : '';
  }

  summary.innerHTML = '';
  if (me && userHasFullAccess()) {
    summary.appendChild(renderDashSummaryCard('Review Queue', review, review ? 'Items waiting for supervisor action' : 'Nothing waiting right now'));
    summary.appendChild(renderDashSummaryCard('Returned', returned, returned ? 'Work sent back for fixes' : 'No returned paperwork'));
    summary.appendChild(renderDashSummaryCard('Open PSIs', _allPSIs.length, active ? 'Field work still in progress' : 'No active PSI work'));
    summary.appendChild(renderDashSummaryCard('Open Lifts', openLifts, openLifts ? 'Lift inspections still editable' : 'No open lift forms'));
  } else {
    summary.appendChild(renderDashSummaryCard('Returned to You', returned, returned ? 'Fix these before starting fresh work' : 'Nothing has been sent back'));
    summary.appendChild(renderDashSummaryCard('In Review', review, review ? 'Paperwork waiting on supervisor' : 'Nothing waiting on review'));
    summary.appendChild(renderDashSummaryCard('Open PSIs', active, active ? 'Draft or active jobs still open' : 'No open PSI work'));
    summary.appendChild(renderDashSummaryCard('Open Lifts', openLifts, openLifts ? 'Lift forms still in progress' : 'No open lift forms'));
  }
}

function renderDashSection(title, note, items, renderItem) {
  var section = document.createElement('section');
  section.className = 'dash-section';

  var head = document.createElement('div');
  head.className = 'dash-section-head';
  head.innerHTML =
    '<div class="dash-section-title">' + title + '</div>' +
    '<div class="dash-section-note">' + note + '</div>';
  section.appendChild(head);

  items.forEach(function(item) {
    section.appendChild(renderItem(item));
  });
  return section;
}

function renderDash() {
  renderDashboardHeader();

  const query = (document.getElementById('dashSearch') || {}).value || '';
  const q = query.toLowerCase().trim();
  const activeList = document.getElementById('activeList');
  if (activeList) {
    let items = _allPSIs.slice().sort(function(a, b) {
      var aReturned = a && a.reviewStatus === 'returned' ? 1 : 0;
      var bReturned = b && b.reviewStatus === 'returned' ? 1 : 0;
      if (aReturned !== bReturned) return bReturned - aReturned;
      return (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0);
    });
    if (q) items = items.filter(function(p) { return matchesQuery(p, q); });

    if (!items.length) {
      activeList.innerHTML = renderEmpty(
        q ? 'No results for "' + query + '"' : 'No open paperwork',
        q ? 'Try a different search term.' : 'Start a new PSI or lift inspection when work begins.',
        !q
      );
    } else {
      activeList.innerHTML = '';
      var returned = items.filter(function(p) { return p.reviewStatus === 'returned'; });
      var review = items.filter(function(p) { return p.submittedForApproval && p.reviewStatus !== 'returned'; });
      var active = items.filter(function(p) { return !p.submittedForApproval && p.reviewStatus !== 'returned'; });

      if (returned.length) {
        activeList.appendChild(renderDashSection('Needs Changes', 'Returned paperwork should be handled first', returned, function(p) {
          return renderPSICard(p, false);
        }));
      }
      if (review.length) {
        activeList.appendChild(renderDashSection('With Supervisor', 'Already sent for review', review, function(p) {
          return renderPSICard(p, false);
        }));
      }
      if (active.length) {
        activeList.appendChild(renderDashSection(userHasFullAccess() ? 'Open Field Work' : 'Active Drafts', userHasFullAccess() ? 'Editable paperwork still in progress' : 'Jobs you can keep building right now', active, function(p) {
          return renderPSICard(p, false);
        }));
      }
    }
  }

  const historyList = document.getElementById('historyList');
  if (historyList) {
    if (_dashTab !== 'history') {
      historyList.style.display = 'none';
    } else {
      historyList.style.display = 'block';
      let items = _histPSIs.slice().sort(function(a, b) {
        return (b.approvedAt || b.updatedAt || 0) - (a.approvedAt || a.updatedAt || 0);
      });
      if (q) items = items.filter(function(p) { return matchesQuery(p, q); });
      if (!items.length) {
        historyList.innerHTML = renderEmpty(
          q ? 'No approved paperwork found' : 'No approved paperwork yet',
          q ? 'Try a different search.' : 'Approved PSIs appear here.',
          false
        );
      } else {
        historyList.innerHTML = '';
        historyList.appendChild(renderDashSection('Approved Work', 'Finished paperwork archive', items, function(p) {
          return renderPSICard(p, true);
        }));
      }
    }
  }
}

function renderPSICard(psi, isHist) {
  const status = getPSIStatusMeta(psi, isHist);
  const card = document.createElement('div');
  card.className = 'psi-card ' + (status.card || '');
  card.onclick = function(e) {
    if (e.target.classList.contains('psi-del') ||
        e.target.classList.contains('psi-approve-btn') ||
        e.target.classList.contains('psi-dup-btn') ||
        e.target.classList.contains('psi-initial-btn') ||
        e.target.classList.contains('psi-draft-btn')) return;
    openPSI(psi.id);
  };

  const badge = document.createElement('div');
  if (isHist) {
    badge.className = 'psi-badge green';
    badge.textContent = psi.jobCode || 'DONE';
  } else if (psi.submittedForApproval) {
    badge.className = 'psi-badge yellow';
    badge.textContent = psi.jobCode || 'PSI';
  } else {
    badge.className = 'psi-badge';
    badge.textContent = psi.jobCode || 'PSI';
  }

  const meta = document.createElement('div');
  meta.className = 'psi-meta';

  const statusRow = document.createElement('div');
  statusRow.className = 'psi-status-row';
  const statusPill = document.createElement('div');
  statusPill.className = 'psi-status-pill ' + (status.pill || '');
  statusPill.textContent = status.label;
  statusRow.appendChild(statusPill);
  if (psi.liftRequired || psi.liftUnitKey) {
    const liftPill = document.createElement('div');
    liftPill.className = 'psi-status-pill lift';
    liftPill.textContent = psi.liftInspectionDeficiencies && psi.liftInspectionDeficiencies.length
      ? 'Lift Deficiency'
      : (psi.liftInspectionStatus ? 'Lift ' + psi.liftInspectionStatus : 'Lift Linked');
    statusRow.appendChild(liftPill);
  }
  meta.appendChild(statusRow);

  const title = document.createElement('div');
  title.className = 'psi-title';
  title.textContent = getShortPSILabel(psi);
  meta.appendChild(title);

  const parts = [];
  if (psi.jobNumber) parts.push('WO ' + psi.jobNumber);
  if (psi.taskLoc) parts.push(psi.taskLoc);
  if (psi.createdBy) parts.push('Owner: ' + psi.createdBy);
  if (psi.jobDate) parts.push(fmtDisplayDate(psi.jobDate));
  const sub = document.createElement('div');
  sub.className = 'psi-sub';
  sub.textContent = parts.join(' - ');
  meta.appendChild(sub);

  if (psi.workers && psi.workers.length) {
    const crew = document.createElement('div');
    crew.className = 'psi-sub';
    crew.textContent = 'Crew: ' + psi.workers.map(function(w) { return w && w.name ? w.name : ''; }).filter(Boolean).join(', ');
    meta.appendChild(crew);
  }

  const liftData = typeof loadLift === 'function' ? loadLift() : { units: {} };
  const linkedLift = (psi.liftUnitKey && liftData && liftData.units && liftData.units[psi.liftUnitKey])
    ? liftData.units[psi.liftUnitKey]
    : null;

  if (linkedLift) {
    const liftRow = document.createElement('div');
    liftRow.className = 'psi-sub';
    liftRow.textContent = 'Lift: ' + (linkedLift.unitNum || psi.liftUnitKey) + ' - ' + (linkedLift.status || psi.liftInspectionStatus || 'linked');
    meta.appendChild(liftRow);
  }

  if (psi.reviewNote) {
    const note = document.createElement('div');
    note.className = 'psi-pending-label';
    note.textContent = 'Review note: ' + psi.reviewNote;
    meta.appendChild(note);
  }

  const right = document.createElement('div');
  right.className = 'psi-right';

  const workerCount = (psi.workers || []).filter(function(w) { return w.name; }).length;
  const sigCount = Object.keys(psi.sigs || {}).length || (psi.sigWorkers ? psi.sigWorkers.length : 0);
  const count = document.createElement('div');
  count.className = 'psi-count';
  count.textContent = sigCount + '/' + workerCount + ' signed';
  right.appendChild(count);

  const actions = document.createElement('div');
  actions.className = 'psi-card-actions';

  const isSup = userHasFullAccess();
  const isApproved = !!psi.approved || !!isHist;
  const workerFieldsOpen = psi.worker_fields_open !== false;
  const isOwner = psi.createdBy === me.name;

  if (isApproved) {
    const dl = document.createElement('button');
    dl.className = 'psi-draft-btn';
    dl.textContent = 'Preview PDF';
    dl.onclick = function(e) { e.stopPropagation(); redownload(psi.id); };
    if (typeof attachPDFHoverPreview === 'function') {
      attachPDFHoverPreview(dl, function(onReady) {
        buildPDFWithSigs(loadPSI(psi.id), { isFinal: true, onReady: onReady });
      });
    }
    actions.appendChild(dl);

    if (linkedLift) {
      const liftPreviewBtn = document.createElement('button');
      liftPreviewBtn.className = 'psi-draft-btn';
      liftPreviewBtn.textContent = 'Preview Lift PDF';
      liftPreviewBtn.onclick = function(e) {
        e.stopPropagation();
        if (typeof buildMEWPPDF === 'function') buildMEWPPDF(linkedLift, linkedLift.opStrokes || [], linkedLift.supStrokes || [], { preview: true });
      };
      if (typeof attachPDFHoverPreview === 'function') {
        attachPDFHoverPreview(liftPreviewBtn, function(onReady) {
          if (typeof buildMEWPPDF === 'function') buildMEWPPDF(linkedLift, linkedLift.opStrokes || [], linkedLift.supStrokes || [], { onReady: onReady });
        });
      }
      actions.appendChild(liftPreviewBtn);

      const openLiftBtn = document.createElement('button');
      openLiftBtn.className = 'psi-draft-btn';
      openLiftBtn.textContent = 'Open Lift';
      openLiftBtn.onclick = function(e) {
        e.stopPropagation();
        if (typeof showLiftPaneForUnit === 'function') showLiftPaneForUnit(psi.liftUnitKey);
        else if (typeof showLiftPane === 'function') showLiftPane();
      };
      actions.appendChild(openLiftBtn);
    }

    if (!isSup && workerFieldsOpen) {
      const signBtn = document.createElement('button');
      signBtn.className = 'psi-initial-btn';
      signBtn.textContent = 'Sign';
      signBtn.onclick = function(e) { e.stopPropagation(); openQuickWorkerSign(psi.id); };
      actions.appendChild(signBtn);
    }

    if (isSup) {
      const reopenBtn = document.createElement('button');
      reopenBtn.className = 'psi-draft-btn';
      reopenBtn.textContent = 'Re-open';
      reopenBtn.onclick = function(e) { e.stopPropagation(); reopenPSI(psi.id); };
      actions.appendChild(reopenBtn);

      const delBtn = document.createElement('button');
      delBtn.className = 'psi-del';
      delBtn.textContent = 'Delete';
      delBtn.onclick = function(e) { e.stopPropagation(); deletePSIConfirm(psi.id, psi.taskDesc); };
      actions.appendChild(delBtn);
    }
  } else {
    if (isSup && psi.submittedForApproval) {
      const apBtn = document.createElement('button');
      apBtn.className = 'psi-approve-btn';
      apBtn.textContent = 'Approve';
      apBtn.onclick = function(e) { e.stopPropagation(); openApproveModal(psi.id); };
      actions.appendChild(apBtn);
    }

    const signBtn2 = document.createElement('button');
    signBtn2.className = 'psi-initial-btn';
    signBtn2.textContent = 'Sign';
    signBtn2.onclick = function(e) { e.stopPropagation(); openQuickWorkerSign(psi.id); };
    actions.appendChild(signBtn2);

    const initBtn = document.createElement('button');
    initBtn.className = 'psi-initial-btn';
    initBtn.textContent = 'Initial';
    initBtn.onclick = function(e) { e.stopPropagation(); openQuickSign(psi.id); };
    actions.appendChild(initBtn);

      const draftBtn = document.createElement('button');
      draftBtn.className = 'psi-draft-btn';
      draftBtn.textContent = 'Preview PDF';
      draftBtn.onclick = function(e) { e.stopPropagation(); buildPDFWithSigs(loadPSI(psi.id), { isFinal: false, preview: true }); };
      if (typeof attachPDFHoverPreview === 'function') {
        attachPDFHoverPreview(draftBtn, function(onReady) {
          buildPDFWithSigs(loadPSI(psi.id), { isFinal: false, onReady: onReady });
        });
      }
      actions.appendChild(draftBtn);

    if (isSup || isOwner) {
      const dupBtn = document.createElement('button');
      dupBtn.className = 'psi-dup-btn';
      dupBtn.textContent = 'Duplicate';
      dupBtn.onclick = function(e) { e.stopPropagation(); duplicatePSI(psi.id); };
      actions.appendChild(dupBtn);

      const delBtn2 = document.createElement('button');
      delBtn2.className = 'psi-del';
      delBtn2.textContent = 'Delete';
      delBtn2.onclick = function(e) { e.stopPropagation(); deletePSIConfirm(psi.id, psi.taskDesc); };
      actions.appendChild(delBtn2);
    }
  }

  right.appendChild(actions);
  card.appendChild(badge);
  card.appendChild(meta);
  card.appendChild(right);
  return card;
}

function getShortPSILabel(psi) {
  if (!psi) return 'Untitled PSI';
  var raw = String(
    psi.jobTitle ||
    psi.shortTitle ||
    psi.aiTitle ||
    psi.templateName ||
    psi.taskDesc ||
    psi.jobCode ||
    'Untitled PSI'
  ).replace(/\s+/g, ' ').trim();

  if (raw.length <= 68) return raw;

  var shortened = raw
    .replace(/^perform work to\s+/i, '')
    .replace(/^complete work to\s+/i, '')
    .replace(/^carry out\s+/i, '')
    .replace(/^conduct\s+/i, '')
      .replace(/\sand confirm normal operation\.?$/i, '')
      .replace(/\sin a controlled manner\.?$/i, '')
      .trim();

  var words = shortened.split(/\s+/).filter(Boolean);
  if (words.length <= 3) return shortened;
  return words.slice(0, 3).join(' ');
}

function renderPendingTab() {
  renderDashboardHeader();
  var container = document.getElementById('dashPending');
  if (!container) return;
  container.innerHTML = '';

  var pendingPSIs = _allPSIs.filter(function(p) {
    return p.submittedForApproval && !p.approved;
  }).sort(function(a, b) {
    return (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0);
  });

  var pendingLifts = [];
  var liftData = (typeof loadLift === 'function') ? loadLift() : { units: {} };
  Object.keys(liftData.units || {}).forEach(function(key) {
    var u = liftData.units[key];
    var linkedPendingPSI = u && u.psiId && _allPSIs.some(function(p) {
      return p.id === u.psiId && p.submittedForApproval && !p.approved;
    });
    if (u && u.status === 'submitted' && !u.approvedAt && !linkedPendingPSI) {
      pendingLifts.push(u);
    }
  });
  pendingLifts.sort(function(a, b) {
    return (b.updatedAt || b.reviewedAt || 0) - (a.updatedAt || a.reviewedAt || 0);
  });

  var reviewItems = [];
  pendingPSIs.forEach(function(psi) {
    reviewItems.push({ type: 'psi', sortAt: psi.updatedAt || psi.createdAt || 0, record: psi });
  });
  pendingLifts.forEach(function(unit) {
    reviewItems.push({ type: 'lift', sortAt: unit.updatedAt || unit.reviewedAt || 0, record: unit });
  });
  reviewItems.sort(function(a, b) {
    return (b.sortAt || 0) - (a.sortAt || 0);
  });

  if (!reviewItems.length) {
    container.innerHTML = '<div class="pending-all-clear">All caught up - nothing waiting for review</div>';
    return;
  }

  container.appendChild(renderDashSection('Review Queue', 'All paperwork waiting for supervisor action', reviewItems, function(item) {
    if (item.type === 'lift') return renderPendLiftCard(item.record);
    return renderPendCard(item.record, liftData);
  }));
}


