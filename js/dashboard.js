/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
   js/dashboard.js Ã¢â‚¬â€ dashboard render, tabs, search, delete
Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */

// Ã¢â€â‚¬Ã¢â€â‚¬ STATE Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
let _dashTab   = 'active';
let _allPSIs   = [];   // active (not approved)
let _histPSIs  = [];   // approved
let _statsFilters = {
  month: String(new Date().getMonth() + 1),
  year: String(new Date().getFullYear()),
  worker: 'all',
  jobType: 'all',
  status: 'all'
};

function canCurrentUserSeePSI(psi) {
  return !!psi && !psi.unpublished;
}

function isDashInitialPSILoadPending() {
  return !!(
    typeof firebaseIsInitialPSISyncPending === 'function' &&
    firebaseIsInitialPSISyncPending() &&
    !_allPSIs.length &&
    !_histPSIs.length
  );
}


// Ã¢â€â‚¬Ã¢â€â‚¬ REFRESH (reload from storage) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function refreshDash() {
  // Do NOT reset _dashTab here — tab state is owned by openDash()/switchTab() only.
  // Do NOT force the tab here — that causes double-render and fights user tab choice.
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
  if (!isSup && _dashTab === 'pending') _dashTab = 'active';
  updatePendingBadge();
  if (_dashTab === 'pending') renderPendingTab();
  else if (_dashTab === 'stats') renderStatsTab();
  else renderDash();
}


// Ã¢â€â‚¬Ã¢â€â‚¬ RENDER Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬




// Ã¢â€â‚¬Ã¢â€â‚¬ PSI CARD Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬




// Ã¢â€â‚¬Ã¢â€â‚¬ PENDING CARD (supervisor dashboard section) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬




// Ã¢â€â‚¬Ã¢â€â‚¬ PENDING TAB Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬




// Ã¢â€â‚¬Ã¢â€â‚¬ TABS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function switchTab(tab) {

  _dashTab = tab;
  if (typeof setSessionActivePane === 'function') setSessionActivePane('dashboard');
  if (typeof setSessionActiveDashTab === 'function') setSessionActiveDashTab(tab);

  var btnActive   = document.getElementById('tabActive');
  var btnHistory  = document.getElementById('tabHistory');
  var btnPending  = document.getElementById('tabPending');
  var btnStats    = document.getElementById('tabStats');
  var activeList  = document.getElementById('activeList');
  var historyList = document.getElementById('historyList');
  var dashPending = document.getElementById('dashPending');
  var dashStats   = document.getElementById('dashStats');
  var searchWrap  = document.getElementById('dashSearchWrap');

  if (btnActive)  btnActive.classList.toggle('active',  tab === 'active');
  if (btnHistory) btnHistory.classList.toggle('active', tab === 'history');
  if (btnPending) btnPending.classList.toggle('active', tab === 'pending');
  if (btnStats)   btnStats.classList.toggle('active',   tab === 'stats');

  if (activeList)  activeList.style.display  = tab === 'active'  ? 'block' : 'none';
  if (historyList) historyList.style.display = tab === 'history' ? 'block' : 'none';
  if (dashPending) dashPending.style.display = tab === 'pending' ? 'block' : 'none';
  if (dashStats)   dashStats.style.display   = tab === 'stats'   ? 'block' : 'none';
  if (searchWrap)  searchWrap.style.display  = tab === 'stats'   ? 'none' : '';

  if (tab === 'pending') {
    renderPendingTab();
  } else if (tab === 'stats') {
    renderStatsTab();
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
  toast('PSI re-opened for editing');
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
      (psi.taskLoc ? ' - ' + psi.taskLoc : '') +
      (psi.createdBy ? ' - ' + psi.createdBy : '');
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
  if (typeof refreshAfterPSIWorkflowAction === 'function') refreshAfterPSIWorkflowAction();
  else refreshDash();

    // Download the approved PDF immediately from the supervisor's local PSI copy.
    // This keeps approval feeling instant and avoids mobile/browser download loss
    // when the cloud signature refresh takes too long after the click.
    psi.supSigStrokes = strokes.slice();
    psi.supSigPng = png;
    buildPDF(psi, { isFinal: true });
    toast('PSI approved \u2014 tap Download PDF');
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
  toast('PSI duplicated - tap to open');
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
    '<div class="empty-icon">Work</div>' +
    '<div class="empty-title">' + title + '</div>' +
    '<div class="empty-sub">' + sub + '</div>' +
    (showBtn ? '<button class="btn btn-primary" onclick="newPSI()">+ New PSI</button>' : '') +
    '</div>';
}

function renderDashLoadingSection(title, note) {
  return '<section class="dash-section dash-section-loading">' +
    '<div class="dash-section-head">' +
      '<div class="dash-section-title">' + title + '</div>' +
      '<div class="dash-section-note">' + note + '</div>' +
    '</div>' +
    '<div class="dash-loading-cards">' +
      '<div class="dash-loading-card"></div>' +
      '<div class="dash-loading-card"></div>' +
    '</div>' +
  '</section>';
}


function getPSIStatusMeta(psi, isHist) {
  if (isHist || psi.approved) return { label: 'Approved', card: 'status-approved', pill: 'ready' };
  if (psi.reviewStatus === 'returned') return { label: 'Needs Changes', card: 'status-returned', pill: 'returned' };
  if (psi.submittedForApproval) return { label: 'In Review', card: 'status-review', pill: 'review' };
  return { label: 'Active', card: '', pill: '' };
}

function renderDashSummaryCard(label, value, note, onClick) {
  var card = document.createElement('div');
  card.className = 'dash-summary-card';
  if (typeof onClick === 'function') {
    card.classList.add('is-clickable');
    card.tabIndex = 0;
    card.onclick = onClick;
    card.onkeydown = function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    };
  }
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
  var signedInStrip = document.getElementById('signedInStrip');
  var signedInName = document.getElementById('signedInName');
  var summary = document.getElementById('dashSummary');
  if (!summary) return;

  var activeField = _allPSIs.filter(function(p) { return !p.submittedForApproval && p.reviewStatus !== 'returned'; }).length;
  var openPSIs = _allPSIs.length;
  var returned = _allPSIs.filter(function(p) { return p.reviewStatus === 'returned'; }).length;
  var review = _allPSIs.filter(function(p) { return p.submittedForApproval && !p.approved; }).length;
  var openLifts = 0;
  if (typeof loadLift === 'function') {
    var liftData = loadLift();
    openLifts = Object.keys((liftData && liftData.units) || {}).filter(function(key) {
      var u = liftData.units[key];
      return u && u.status !== 'approved' && u.isPublished !== false;
    }).length;
  }

  if (me && userHasFullAccess()) {
    if (eyebrow) eyebrow.textContent = 'Supervisor View';
    if (title) title.textContent = '';
    if (subtitle) subtitle.textContent = '';
  } else {
    if (eyebrow) eyebrow.textContent = 'Field Work';
    if (title) title.textContent = '';
    if (subtitle) subtitle.textContent = '';
  }
  var trade = String((me && me.trade) || '').trim();
  var tradeLabel = trade ? (trade.charAt(0).toUpperCase() + trade.slice(1)) : '';
  if (signedInStrip) signedInStrip.style.display = me && me.name ? '' : 'none';
  if (signedInName) signedInName.textContent = me && me.name
    ? (((me.role === 'admin' ? 'Admin' : (me.role === 'supervisor' ? 'Supervisor' : 'Technician'))) + ' - ' + me.name + (tradeLabel ? ' - ' + tradeLabel : ''))
    : '';

  summary.innerHTML = '';
  var loadingPSIs = isDashInitialPSILoadPending();
  var reviewValue = loadingPSIs ? '...' : review;
  var returnedValue = loadingPSIs ? '...' : returned;
  var openPSIValue = loadingPSIs ? '...' : openPSIs;
  if (me && userHasFullAccess()) {
    summary.appendChild(renderDashSummaryCard('Review Queue', reviewValue, loadingPSIs ? 'Loading live PSI data...' : (review ? 'Items waiting for review' : 'Nothing waiting right now'), function() {
      openSummaryReviewQueue();
    }));
    summary.appendChild(renderDashSummaryCard('Returned', returnedValue, loadingPSIs ? 'Checking returned paperwork...' : (returned ? 'Work sent back for fixes' : 'No returned paperwork'), function() {
      openSummaryReturned();
    }));
    summary.appendChild(renderDashSummaryCard('Open PSIs', openPSIValue, loadingPSIs ? 'Loading live open work...' : (openPSIs ? ('Includes ' + activeField + ' field work item' + (activeField === 1 ? '' : 's')) : 'No open PSI work'), function() {
      openSummaryOpenWork();
    }));
    summary.appendChild(renderDashSummaryCard('Open Lifts', openLifts, openLifts ? 'Lift inspections still editable' : 'No open lift forms', function() {
      openSummaryOpenLifts();
    }));
  } else {
    summary.appendChild(renderDashSummaryCard('Review Queue', reviewValue, loadingPSIs ? 'Loading live PSI data...' : (review ? 'Paperwork waiting on review' : 'Nothing waiting right now'), function() {
      openSummaryReviewQueue();
    }));
    summary.appendChild(renderDashSummaryCard('Returned', returnedValue, loadingPSIs ? 'Checking returned paperwork...' : (returned ? 'Fix these before starting fresh work' : 'No returned paperwork'), function() {
      openSummaryReturned();
    }));
    summary.appendChild(renderDashSummaryCard('Open PSIs', openPSIValue, loadingPSIs ? 'Loading live open work...' : (openPSIs ? ('Includes ' + activeField + ' field work item' + (activeField === 1 ? '' : 's')) : 'No open PSI work'), function() {
      openSummaryOpenWork();
    }));
    summary.appendChild(renderDashSummaryCard('Open Lifts', openLifts, openLifts ? 'Lift forms still in progress' : 'No open lift forms', function() {
      openSummaryOpenLifts();
    }));
  }
}

function renderDashSection(title, note, items, renderItem) {
  var section = document.createElement('section');
  section.className = 'dash-section';
  var safeTitle = (typeof cleanDisplayValue === 'function') ? cleanDisplayValue(title) : String(title == null ? '' : title).trim();
  var safeNote = (typeof cleanDisplayValue === 'function') ? cleanDisplayValue(note) : String(note == null ? '' : note).trim();

  var head = document.createElement('div');
  head.className = 'dash-section-head';
  head.innerHTML =
    '<div class="dash-section-title">' + safeTitle + '</div>' +
    '<div class="dash-section-note">' + safeNote + '</div>';
  section.appendChild(head);

  items.forEach(function(item) {
    section.appendChild(renderItem(item));
  });
  return section;
}

function getPSIDashSortAt(psi) {
  if (!psi) return 0;
  var dateText = String(psi.jobDate || '').trim();
  var timeText = String(psi.jobTime || '').trim();
  if (dateText && /^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    var stamp = Date.parse(dateText + 'T' + (timeText || '00:00') + ':00');
    if (!isNaN(stamp)) return stamp;
  }
  return Number(psi.updatedAt || psi.createdAt || 0);
}

function psiIncludesCurrentUserForDash(psi) {
  if (!psi || !me || !me.name) return false;
  var myName = normalizePersonName(me.name);
  if (!myName) return false;
  if (normalizePersonName(psi.createdBy) === myName) return true;
  if (typeof isReturnAssignedToMe === 'function' && isReturnAssignedToMe(psi)) return true;
  return (psi.workers || []).some(function(worker) {
    var workerName = String((worker && worker.name) || '').trim();
    if (!workerName) return false;
    if (normalizePersonName(workerName) === myName) return true;
    return typeof psiWorkerNameMatches === 'function'
      ? psiWorkerNameMatches(psi, workerName, me.name)
      : false;
  });
}

function sortPSIsForDash(items, timeSelector) {
  return (items || []).slice().sort(function(a, b) {
    var aMine = psiIncludesCurrentUserForDash(a) ? 1 : 0;
    var bMine = psiIncludesCurrentUserForDash(b) ? 1 : 0;
    if (aMine !== bMine) return bMine - aMine;
    return (timeSelector ? timeSelector(b) : 0) - (timeSelector ? timeSelector(a) : 0);
  });
}

function getStatsMonthLabel(month) {
  var idx = Number(month || 0) - 1;
  if (idx < 0 || idx > 11) return 'All Months';
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx];
}

function getStatsLongMonthLabel(month) {
  var idx = Number(month || 0) - 1;
  if (idx < 0 || idx > 11) return 'All Months';
  return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][idx];
}

function getStatsMonthYearLabel(month, year) {
  var y = String(year || '').trim();
  if (!month || month === 'all') return y || 'All Time';
  return getStatsLongMonthLabel(month) + (y ? (' ' + y) : '');
}

function parseStatsDateParts(source) {
  if (!source) return null;
  if (typeof source === 'string' && /^\d{4}-\d{2}-\d{2}/.test(source)) {
    return {
      year: source.slice(0, 4),
      month: String(Number(source.slice(5, 7))),
      date: source
    };
  }
  var stamp = Number(source || 0);
  if (!stamp) return null;
  var d = new Date(stamp);
  if (isNaN(d.getTime())) return null;
  return {
    year: String(d.getFullYear()),
    month: String(d.getMonth() + 1),
    date: d.toISOString().slice(0, 10)
  };
}

function getStatsPSIStatus(psi) {
  if (!psi) return 'active';
  if (psi.approved) return 'approved';
  if (psi.unpublished) return 'draft';
  if (psi.reviewStatus === 'returned') return 'returned';
  if (psi.submittedForApproval || psi.reviewStatus === 'submitted') return 'review';
  return 'active';
}

function getStatsLiftStatus(unit) {
  var raw = String((unit && unit.status) || 'draft').toLowerCase();
  if (raw === 'submitted') return 'review';
  if (raw === 'approved') return 'approved';
  if (raw === 'returned') return 'returned';
  if (raw === 'draft') return 'draft';
  return raw || 'draft';
}

function getStatsPSIWorkerName(psi) {
  if (!psi) return '';
  var by = String(psi.createdBy || '').trim();
  if (by) return by;
  var firstWorker = ((psi.workers || []).find(function(w) {
    return w && String(w.name || '').trim();
  }) || {}).name;
  return String(firstWorker || '').trim();
}

function getStatsCrewMembers(psi) {
  return (psi && psi.workers || []).map(function(w) {
    return String((w && w.name) || '').trim();
  }).filter(Boolean);
}

function getStatsPSIJobType(psi) {
  return String(
    (psi && (
      psi.jobCode ||
      psi.templateName ||
      psi.jobTitle ||
      psi.shortTitle ||
      psi.taskDesc
    )) || 'General'
  ).replace(/\s+/g, ' ').trim();
}

function getStatsLiftType(psi) {
  if (!psi || !psi.liftUnitKey) return '';
  var liveLift = (typeof loadLift === 'function') ? loadLift() : { units: {} };
  var liveUnit = liveLift && liveLift.units ? liveLift.units[psi.liftUnitKey] : null;
  var fleet = (typeof loadFleet === 'function') ? loadFleet() : {};
  var fleetUnit = fleet && psi.liftUnitKey ? fleet[psi.liftUnitKey] : null;
  return String(
    (liveUnit && (liveUnit.powerType || liveUnit.make)) ||
    (fleetUnit && (fleetUnit.powerType || fleetUnit.make)) ||
    ''
  ).trim();
}

function normalizePSIStatsRecord(psi) {
  if (!psi || psi.deleted || !canCurrentUserSeePSI(psi)) return null;
  var createdParts = parseStatsDateParts(psi.jobDate || psi.createdAt || psi.updatedAt || Date.now()) || {};
  var submittedAt = Number(psi.submittedAt || psi.createdAt || psi.updatedAt || 0);
  return {
    id: psi.id,
    recordType: 'psi',
    raw: psi,
    psiId: psi.id,
    dateCreated: createdParts.date || '',
    month: createdParts.month || '',
    year: createdParts.year || '',
    workerName: getStatsPSIWorkerName(psi),
    crewMembers: getStatsCrewMembers(psi),
    jobType: getStatsPSIJobType(psi),
    status: getStatsPSIStatus(psi),
    approved: !!psi.approved,
    liftInspection: !!(psi.liftRequired || psi.liftUnitKey),
    liftType: getStatsLiftType(psi),
    assetLocation: String(psi.taskLoc || '').trim(),
    timeSubmitted: submittedAt || 0,
    createdAt: Number(psi.createdAt || 0),
    completedAt: Number(psi.approvedAt || 0)
  };
}

function normalizeLiftStatsRecord(unit, unitKey, fromHistory) {
  if (!unit || unit.deleted) return null;
  if (!fromHistory && unit.isPublished === false) return null;
  var parts = parseStatsDateParts(unit.date || unit.approvedAt || unit.updatedAt || unit.createdAt || Date.now()) || {};
  return {
    id: (unitKey || unit.unitKey || unit.unitNum || 'lift') + '|' + (unit.date || parts.date || ''),
    recordType: 'lift',
    raw: unit,
    unitKey: unitKey || unit.unitKey || '',
    dateCreated: parts.date || '',
    month: parts.month || '',
    year: parts.year || '',
    workerName: String(unit.operator || '').trim(),
    crewMembers: [],
    jobType: 'Lift Inspection',
    status: getStatsLiftStatus(unit),
    approved: !!unit.approvedAt || String(unit.status || '').toLowerCase() === 'approved',
    liftInspection: true,
    liftType: String(unit.powerType || unit.make || '').trim(),
    assetLocation: String(unit.assetLocation || unit.location || unit.unitNum || '').trim(),
    timeSubmitted: Number(unit.reviewedAt || unit.updatedAt || unit.createdAt || 0),
    createdAt: Number(unit.createdAt || unit.updatedAt || 0),
    completedAt: Number(unit.approvedAt || 0)
  };
}

function getStatsPSIRecords() {
  if (typeof loadIndex !== 'function' || typeof loadPSI !== 'function') return [];
  return loadIndex().map(function(id) {
    return normalizePSIStatsRecord(loadPSI(id));
  }).filter(Boolean);
}

function getStatsLiftRecords() {
  var records = [];
  var seen = {};
  var history = (typeof loadLiftHistory === 'function') ? loadLiftHistory() : [];
  history.forEach(function(record) {
    if (!record || record.deleted) return;
    var key = (record.unitKey || record.unitNum || '') + '|' + (record.date || '');
    if (seen[key]) return;
    seen[key] = true;
    var normalized = normalizeLiftStatsRecord(record, record.unitKey || '', true);
    if (normalized) records.push(normalized);
  });
  var liveLift = (typeof loadLift === 'function') ? loadLift() : { units: {} };
  Object.keys((liveLift && liveLift.units) || {}).forEach(function(key) {
    var unit = liveLift.units[key];
    if (!unit || unit.deleted || unit.isPublished === false) return;
    var dedupeKey = key + '|' + (unit.date || '');
    if (seen[dedupeKey]) return;
    seen[dedupeKey] = true;
    var normalized = normalizeLiftStatsRecord(unit, key, false);
    if (normalized) records.push(normalized);
  });
  return records;
}

function getStatsAvailableYears(psiRecords, liftRecords) {
  var years = {};
  psiRecords.concat(liftRecords).forEach(function(record) {
    if (record && record.year) years[record.year] = true;
  });
  years[String(new Date().getFullYear())] = true;
  return Object.keys(years).sort(function(a, b) { return Number(b) - Number(a); });
}

function matchesStatsFilters(record, filters) {
  if (!record) return false;
  if (filters.year && filters.year !== 'all' && String(record.year || '') !== String(filters.year)) return false;
  if (filters.month && filters.month !== 'all' && String(record.month || '') !== String(filters.month)) return false;
  if (filters.worker && filters.worker !== 'all' && String(record.workerName || '').toLowerCase() !== String(filters.worker || '').toLowerCase()) return false;
  if (filters.jobType && filters.jobType !== 'all' && String(record.jobType || '') !== String(filters.jobType || '')) return false;
  if (filters.status && filters.status !== 'all' && String(record.status || '') !== String(filters.status || '')) return false;
  return true;
}

function getStatsWorkerCounts(records) {
  var totals = {};
  records.forEach(function(record) {
    var name = String(record.workerName || '').trim() || 'Unassigned';
    totals[name] = (totals[name] || 0) + 1;
  });
  return Object.keys(totals).map(function(name) {
    return { label: name, value: totals[name] };
  }).sort(function(a, b) {
    if (b.value !== a.value) return b.value - a.value;
    return a.label.localeCompare(b.label);
  });
}

function getStatsJobTypeCounts(records) {
  var totals = {};
  records.forEach(function(record) {
    var label = String(record.jobType || 'General').trim() || 'General';
    totals[label] = (totals[label] || 0) + 1;
  });
  return Object.keys(totals).map(function(label) {
    return { label: label, value: totals[label] };
  }).sort(function(a, b) {
    if (b.value !== a.value) return b.value - a.value;
    return a.label.localeCompare(b.label);
  });
}

function getStatsMonthlyCounts(records, year) {
  var y = String(year || new Date().getFullYear());
  var totals = [];
  for (var i = 1; i <= 12; i += 1) totals.push({ month: String(i), label: getStatsMonthLabel(i), value: 0 });
  records.forEach(function(record) {
    if (String(record.year || '') !== y) return;
    var idx = Number(record.month || 0) - 1;
    if (idx < 0 || idx > 11) return;
    totals[idx].value += 1;
  });
  return totals;
}

function formatStatsStatus(status) {
  var value = String(status || '').trim().toLowerCase();
  if (!value) return '--';
  if (value === 'review') return 'In Review';
  if (value === 'returned') return 'Returned';
  if (value === 'approved') return 'Approved';
  if (value === 'draft') return 'Draft';
  if (value === 'active') return 'Active';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function collectStatsViewData() {
  var psiRecords = getStatsPSIRecords();
  var liftRecords = getStatsLiftRecords();
  var filters = Object.assign({}, _statsFilters);
  var trendYear = (filters.year && filters.year !== 'all') ? filters.year : String(new Date().getFullYear());
  var filteredPSIs = psiRecords.filter(function(record) { return matchesStatsFilters(record, filters); });
  var filteredLifts = liftRecords.filter(function(record) { return matchesStatsFilters(record, filters); });
  var selectedMonthLabel = getStatsMonthYearLabel(filters.month, filters.year);
  var monthlyPSIs = getStatsMonthlyCounts(psiRecords.filter(function(record) {
    return (!filters.worker || filters.worker === 'all' || String(record.workerName || '').toLowerCase() === String(filters.worker).toLowerCase()) &&
      (!filters.jobType || filters.jobType === 'all' || String(record.jobType || '') === String(filters.jobType || '')) &&
      (!filters.status || filters.status === 'all' || String(record.status || '') === String(filters.status || ''));
  }), trendYear);
  var monthlyLifts = getStatsMonthlyCounts(liftRecords.filter(function(record) {
    return (!filters.worker || filters.worker === 'all' || String(record.workerName || '').toLowerCase() === String(filters.worker).toLowerCase()) &&
      (!filters.status || filters.status === 'all' || String(record.status || '') === String(filters.status || ''));
  }), trendYear);

  return {
    filters: filters,
    trendYear: trendYear,
    psiRecords: psiRecords,
    liftRecords: liftRecords,
    filteredPSIs: filteredPSIs,
    filteredLifts: filteredLifts,
    availableYears: getStatsAvailableYears(psiRecords, liftRecords),
    workers: Array.from(new Set(
      psiRecords.map(function(record) { return String(record.workerName || '').trim(); })
        .concat(liftRecords.map(function(record) { return String(record.workerName || '').trim(); }))
        .filter(Boolean)
    )).sort(),
    jobTypes: Array.from(new Set(psiRecords.map(function(record) { return String(record.jobType || '').trim(); }).filter(Boolean))).sort(),
    selectedMonthLabel: selectedMonthLabel,
    psiWorkerCounts: getStatsWorkerCounts(filteredPSIs),
    liftWorkerCounts: getStatsWorkerCounts(filteredLifts),
    jobTypeCounts: getStatsJobTypeCounts(filteredPSIs),
    monthlyPSIs: monthlyPSIs,
    monthlyLifts: monthlyLifts,
    recentPSIs: filteredPSIs.slice().sort(function(a, b) {
      return (b.timeSubmitted || b.createdAt || 0) - (a.timeSubmitted || a.createdAt || 0);
    }).slice(0, 12)
  };
}

function createStatsFilterField(labelText, control) {
  var field = document.createElement('label');
  field.className = 'stats-filter';
  var label = document.createElement('span');
  label.className = 'stats-filter-label';
  label.textContent = labelText;
  field.appendChild(label);
  field.appendChild(control);
  return field;
}

function buildStatsSelect(value, options, onChange) {
  var select = document.createElement('select');
  select.className = 'stats-select';
  options.forEach(function(option) {
    var opt = document.createElement('option');
    opt.value = option.value;
    opt.textContent = option.label;
    if (String(option.value) === String(value)) opt.selected = true;
    select.appendChild(opt);
  });
  select.onchange = function() { onChange(select.value); };
  return select;
}

function setStatsFilter(key, value) {
  _statsFilters[key] = value;
  if (key === 'year' && _statsFilters.month === '' ) _statsFilters.month = String(new Date().getMonth() + 1);
  renderStatsTab();
}

function renderStatsKPI(label, value, note, tone) {
  var card = document.createElement('div');
  card.className = 'stats-kpi' + (tone ? (' ' + tone) : '');

  var over = document.createElement('div');
  over.className = 'stats-kpi-label';
  over.textContent = label;

  var val = document.createElement('div');
  val.className = 'stats-kpi-value';
  val.textContent = value;

  var sub = document.createElement('div');
  sub.className = 'stats-kpi-note';
  sub.textContent = note;

  card.appendChild(over);
  card.appendChild(val);
  card.appendChild(sub);
  return card;
}

function openSummaryOpenWork() {
  switchTab('active');
}

function openSummaryReviewQueue() {
  if (userHasFullAccess()) switchTab('pending');
  else switchTab('active');
}

function openSummaryReturned() {
  switchTab('active');
}

function openSummaryOpenLifts() {
  if (typeof showLiftPane === 'function') showLiftPane();
  if (typeof showLiftTab === 'function') showLiftTab('history');
}

function isApprovedRecordArchived(record, days) {
  var maxAgeDays = Number(days || 7);
  var approvedAt = Number(record && record.approvedAt || 0);
  if (!approvedAt) return false;
  return (Date.now() - approvedAt) >= (maxAgeDays * 24 * 60 * 60 * 1000);
}

function renderStatsBarChart(title, subtitle, rows, opts) {
  opts = opts || {};
  var card = document.createElement('section');
  card.className = 'stats-panel';

  var head = document.createElement('div');
  head.className = 'stats-panel-head';
  head.innerHTML = '<div class="stats-panel-title">' + title + '</div><div class="stats-panel-note">' + subtitle + '</div>';
  card.appendChild(head);

  var body = document.createElement('div');
  body.className = 'stats-bars';

  if (!rows.length) {
    var empty = document.createElement('div');
    empty.className = 'stats-empty';
    empty.textContent = 'No matching records for this filter set yet.';
    body.appendChild(empty);
    card.appendChild(body);
    return card;
  }

  var max = Math.max.apply(null, rows.map(function(row) { return row.value; }).concat([1]));
  rows.slice(0, opts.limit || rows.length).forEach(function(row) {
    var item = document.createElement(opts.onClick ? 'button' : 'div');
    item.className = 'stats-bar-row' + (opts.activeValue && String(opts.activeValue) === String(row.label) ? ' active' : '');
    if (opts.onClick) {
      item.type = 'button';
      item.onclick = function() { opts.onClick(row.label); };
    }

    var top = document.createElement('div');
    top.className = 'stats-bar-top';
    top.innerHTML = '<span class="stats-bar-label">' + row.label + '</span><span class="stats-bar-value">' + row.value + '</span>';

    var track = document.createElement('div');
    track.className = 'stats-bar-track';
    var fill = document.createElement('div');
    fill.className = 'stats-bar-fill';
    fill.style.width = Math.max(8, (row.value / max) * 100) + '%';
    track.appendChild(fill);

    item.appendChild(top);
    item.appendChild(track);
    body.appendChild(item);
  });

  card.appendChild(body);
  return card;
}

function renderStatsLineChart(title, subtitle, points, activeMonth, onPointClick) {
  var card = document.createElement('section');
  card.className = 'stats-panel';

  var head = document.createElement('div');
  head.className = 'stats-panel-head';
  head.innerHTML = '<div class="stats-panel-title">' + title + '</div><div class="stats-panel-note">' + subtitle + '</div>';
  card.appendChild(head);

  if (!points.length) {
    var empty = document.createElement('div');
    empty.className = 'stats-empty';
    empty.textContent = 'No trend data yet.';
    card.appendChild(empty);
    return card;
  }

  var chart = document.createElement('div');
  chart.className = 'stats-line-chart';
  var svgNS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 420 220');
  svg.setAttribute('class', 'stats-line-svg');

  var max = Math.max.apply(null, points.map(function(point) { return point.value; }).concat([1]));
  var plotPoints = points.map(function(point, idx) {
    var x = 28 + (idx * (364 / Math.max(1, points.length - 1)));
    var y = 178 - ((point.value / max) * 132);
    return { x: x, y: y, label: point.label, month: point.month, value: point.value };
  });

  [0, 0.5, 1].forEach(function(step) {
    var line = document.createElementNS(svgNS, 'line');
    var y = 178 - (132 * step);
    line.setAttribute('x1', '28');
    line.setAttribute('x2', '392');
    line.setAttribute('y1', String(y));
    line.setAttribute('y2', String(y));
    line.setAttribute('class', 'stats-grid-line');
    svg.appendChild(line);
  });

  var polyline = document.createElementNS(svgNS, 'polyline');
  polyline.setAttribute('fill', 'none');
  polyline.setAttribute('class', 'stats-line-path');
  polyline.setAttribute('points', plotPoints.map(function(point) {
    return point.x + ',' + point.y;
  }).join(' '));
  svg.appendChild(polyline);

  plotPoints.forEach(function(point) {
    var circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', String(point.x));
    circle.setAttribute('cy', String(point.y));
    circle.setAttribute('r', activeMonth && String(activeMonth) === String(point.month) ? '6' : '5');
    circle.setAttribute('class', 'stats-line-point' + (activeMonth && String(activeMonth) === String(point.month) ? ' active' : ''));
    circle.style.cursor = 'pointer';
    circle.addEventListener('click', function() {
      if (typeof onPointClick === 'function') onPointClick(point.month);
    });
    svg.appendChild(circle);

    var lbl = document.createElementNS(svgNS, 'text');
    lbl.setAttribute('x', String(point.x));
    lbl.setAttribute('y', '204');
    lbl.setAttribute('text-anchor', 'middle');
    lbl.setAttribute('class', 'stats-axis-label' + (activeMonth && String(activeMonth) === String(point.month) ? ' active' : ''));
    lbl.textContent = point.label;
    lbl.style.cursor = 'pointer';
    lbl.addEventListener('click', function() {
      if (typeof onPointClick === 'function') onPointClick(point.month);
    });
    svg.appendChild(lbl);
  });

  chart.appendChild(svg);
  card.appendChild(chart);
  return card;
}

function renderStatsRecentTable(rows) {
  var card = document.createElement('section');
  card.className = 'stats-panel stats-panel-wide';

  var head = document.createElement('div');
  head.className = 'stats-panel-head';
  head.innerHTML = '<div class="stats-panel-title">Recent PSI Submissions</div><div class="stats-panel-note">Filtered records update when you click a chart or adjust the controls.</div>';
  card.appendChild(head);

  if (!rows.length) {
    var empty = document.createElement('div');
    empty.className = 'stats-empty';
    empty.textContent = 'No PSI records match the current filters.';
    card.appendChild(empty);
    return card;
  }

  var wrap = document.createElement('div');
  wrap.className = 'stats-table-wrap';
  var table = document.createElement('table');
  table.className = 'stats-table';
  table.innerHTML =
    '<thead><tr>' +
      '<th>PSI ID</th>' +
      '<th>Date Created</th>' +
      '<th>Month</th>' +
      '<th>Year</th>' +
      '<th>Worker</th>' +
      '<th>Crew Members</th>' +
      '<th>Job Type</th>' +
      '<th>Status</th>' +
      '<th>Approved</th>' +
      '<th>Lift</th>' +
      '<th>Lift Type</th>' +
      '<th>Asset / Location</th>' +
      '<th>Time Submitted</th>' +
    '</tr></thead>';

  var tbody = document.createElement('tbody');
  rows.forEach(function(row) {
    var tr = document.createElement('tr');
    [
      row.psiId || row.id || '--',
      row.dateCreated || '--',
      row.month ? getStatsMonthLabel(row.month) : '--',
      row.year || '--',
      row.workerName || '--',
      row.crewMembers && row.crewMembers.length ? row.crewMembers.join(', ') : '--',
      row.jobType || '--',
      formatStatsStatus(row.status),
      row.approved ? 'Yes' : 'No',
      row.liftInspection ? 'Yes' : 'No',
      row.liftType || '--',
      row.assetLocation || '--',
      row.timeSubmitted ? fmtDate(row.timeSubmitted) : '--'
    ].forEach(function(text) {
      var td = document.createElement('td');
      td.textContent = text;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  card.appendChild(wrap);
  return card;
}

function renderStatsTab() {
  renderDashboardHeader();
  var mount = document.getElementById('dashStats');
  if (!mount) return;
  mount.innerHTML = '';

  var data = collectStatsViewData();
  var filtersCard = document.createElement('section');
  filtersCard.className = 'stats-panel stats-panel-wide';

  var filtersHead = document.createElement('div');
  filtersHead.className = 'stats-panel-head';
  filtersHead.innerHTML = '<div class="stats-panel-title">Stats Dashboard</div><div class="stats-panel-note">Track PSI and lift activity by month, worker, job type, and status. Click chart points or bars to filter the records below.</div>';
  filtersCard.appendChild(filtersHead);

  var filtersGrid = document.createElement('div');
  filtersGrid.className = 'stats-filters';
  filtersGrid.appendChild(createStatsFilterField('Month', buildStatsSelect(data.filters.month, [{ value: 'all', label: 'All Months' }].concat(
    Array.from({ length: 12 }).map(function(_, idx) {
      return { value: String(idx + 1), label: getStatsLongMonthLabel(idx + 1) };
    })
  ), function(value) {
    setStatsFilter('month', value);
  })));
  filtersGrid.appendChild(createStatsFilterField('Year', buildStatsSelect(data.filters.year, [{ value: 'all', label: 'All Years' }].concat(
    data.availableYears.map(function(year) { return { value: year, label: year }; })
  ), function(value) {
    setStatsFilter('year', value);
  })));
  filtersGrid.appendChild(createStatsFilterField('Worker', buildStatsSelect(data.filters.worker, [{ value: 'all', label: 'All Workers' }].concat(
    data.workers.map(function(name) { return { value: name, label: name }; })
  ), function(value) {
    setStatsFilter('worker', value);
  })));
  filtersGrid.appendChild(createStatsFilterField('Job Type', buildStatsSelect(data.filters.jobType, [{ value: 'all', label: 'All Job Types' }].concat(
    data.jobTypes.map(function(type) { return { value: type, label: type }; })
  ), function(value) {
    setStatsFilter('jobType', value);
  })));
  filtersGrid.appendChild(createStatsFilterField('Status', buildStatsSelect(data.filters.status, [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'review', label: 'In Review' },
    { value: 'returned', label: 'Returned' },
    { value: 'approved', label: 'Approved' },
    { value: 'draft', label: 'Draft' }
  ], function(value) {
    setStatsFilter('status', value);
  })));
  filtersCard.appendChild(filtersGrid);

  var resetRow = document.createElement('div');
  resetRow.className = 'stats-filter-actions';
  var resetBtn = document.createElement('button');
  resetBtn.className = 'btn btn-secondary btn-sm';
  resetBtn.textContent = 'Reset Filters';
  resetBtn.onclick = function() {
    _statsFilters = {
      month: String(new Date().getMonth() + 1),
      year: String(new Date().getFullYear()),
      worker: 'all',
      jobType: 'all',
      status: 'all'
    };
    renderStatsTab();
  };
  resetRow.appendChild(resetBtn);
  filtersCard.appendChild(resetRow);
  mount.appendChild(filtersCard);

  var kpis = document.createElement('div');
  kpis.className = 'stats-kpis';
  var completedThisMonth = data.filteredPSIs.filter(function(record) { return record.approved; }).length;
  var liftsCompletedThisMonth = data.filteredLifts.filter(function(record) { return record.approved; }).length;
  var approvedTotal = data.filteredPSIs.filter(function(record) { return record.approved; }).length;
  var pendingTotal = data.filteredPSIs.filter(function(record) { return !record.approved; }).length;
  kpis.appendChild(renderStatsKPI('PSIs Completed', completedThisMonth, 'Completed in ' + data.selectedMonthLabel, 'tone-psi'));
  kpis.appendChild(renderStatsKPI('Lift Inspections Completed', liftsCompletedThisMonth, 'Completed in ' + data.selectedMonthLabel, 'tone-lift'));
  kpis.appendChild(renderStatsKPI('Approved PSIs', approvedTotal, 'Visible approved PSI records in this filter', 'tone-approved'));
  kpis.appendChild(renderStatsKPI('Pending / Draft PSIs', pendingTotal, 'Open, review, returned, or draft PSI records', 'tone-open'));
  mount.appendChild(kpis);

  var chartGrid = document.createElement('div');
  chartGrid.className = 'stats-chart-grid';
  chartGrid.appendChild(renderStatsBarChart(
    'PSI Count by Worker',
    'Selected month and filters',
    data.psiWorkerCounts,
    {
      activeValue: data.filters.worker !== 'all' ? data.filters.worker : '',
      onClick: function(worker) {
        setStatsFilter('worker', String(data.filters.worker) === String(worker) ? 'all' : worker);
      },
      limit: 8
    }
  ));
  chartGrid.appendChild(renderStatsBarChart(
    'Lift Inspection Count by Worker',
    'Selected month and filters',
    data.liftWorkerCounts,
    {
      activeValue: data.filters.worker !== 'all' ? data.filters.worker : '',
      onClick: function(worker) {
        setStatsFilter('worker', String(data.filters.worker) === String(worker) ? 'all' : worker);
      },
      limit: 8
    }
  ));
  chartGrid.appendChild(renderStatsLineChart(
    'Monthly PSI Totals',
    'Approved and visible PSI volume for ' + data.trendYear,
    data.monthlyPSIs,
    data.filters.month !== 'all' ? data.filters.month : '',
    function(month) {
      setStatsFilter('month', String(data.filters.month) === String(month) ? 'all' : month);
    }
  ));
  chartGrid.appendChild(renderStatsLineChart(
    'Monthly Lift Totals',
    'Lift inspection volume for ' + data.trendYear,
    data.monthlyLifts,
    data.filters.month !== 'all' ? data.filters.month : '',
    function(month) {
      setStatsFilter('month', String(data.filters.month) === String(month) ? 'all' : month);
    }
  ));
  chartGrid.appendChild(renderStatsBarChart(
    'Job Type Breakdown',
    'Filtered PSI records by job type',
    data.jobTypeCounts,
    {
      activeValue: data.filters.jobType !== 'all' ? data.filters.jobType : '',
      onClick: function(jobType) {
        setStatsFilter('jobType', String(data.filters.jobType) === String(jobType) ? 'all' : jobType);
      },
      limit: 10
    }
  ));
  mount.appendChild(chartGrid);

  mount.appendChild(renderStatsRecentTable(data.recentPSIs));
}

function renderDash() {
  renderDashboardHeader();
  var dashStats = document.getElementById('dashStats');
  if (dashStats) dashStats.style.display = 'none';

  const query = (document.getElementById('dashSearch') || {}).value || '';
  const q = query.toLowerCase().trim();
  const activeList = document.getElementById('activeList');
  if (activeList) {
    let items = _allPSIs.slice().sort(function(a, b) {
      var aReturned = a && a.reviewStatus === 'returned' ? 1 : 0;
      var bReturned = b && b.reviewStatus === 'returned' ? 1 : 0;
      if (aReturned !== bReturned) return bReturned - aReturned;
      var aMine = psiIncludesCurrentUserForDash(a) ? 1 : 0;
      var bMine = psiIncludesCurrentUserForDash(b) ? 1 : 0;
      if (aMine !== bMine) return bMine - aMine;
      return getPSIDashSortAt(b) - getPSIDashSortAt(a);
    });
    if (q) items = items.filter(function(p) { return matchesQuery(p, q); });
    var loadingPSIs = isDashInitialPSILoadPending();

    if (!items.length) {
      if (loadingPSIs && !q) {
        activeList.innerHTML = renderDashLoadingSection('Open Work', '');
      } else {
        activeList.innerHTML = renderEmpty(
          q ? 'No results for "' + query + '"' : 'No open paperwork',
          q ? 'Try a different search term.' : 'Start a new PSI or lift inspection when work begins.',
          !q
        );
      }
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
      if (active.length) {
        activeList.appendChild(renderDashSection('Open Field Work', userHasFullAccess() ? 'Editable paperwork still in progress' : 'Jobs you can keep building right now', active, function(p) {
          return renderPSICard(p, false);
        }));
      }
      if (review.length) {
        activeList.appendChild(renderDashSection('With Supervisor', 'Already sent for review', review, function(p) {
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
        return Number(b.approvedAt || getPSIDashSortAt(b) || 0) - Number(a.approvedAt || getPSIDashSortAt(a) || 0);
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
        var recentApproved = items.filter(function(p) { return !isApprovedRecordArchived(p, 7); });
        var archivedApproved = items.filter(function(p) { return isApprovedRecordArchived(p, 7); });

        if (recentApproved.length) {
          historyList.appendChild(renderDashSection('Approved Work', 'Approved in the last 7 days', recentApproved, function(p) {
            return renderPSICard(p, true);
          }));
        }

        if (archivedApproved.length) {
          historyList.appendChild(renderDashSection('Archive', 'Approved more than 7 days ago', archivedApproved, function(p) {
            return renderPSICard(p, true);
          }));
        }
      }
    }
  }
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

function renderPendingAccountReviewSection(users) {
  if (!users || !users.length) return null;

  var section = document.createElement('section');
  section.className = 'dash-section';

  var head = document.createElement('div');
  head.className = 'dash-section-head';

  var title = document.createElement('h3');
  title.textContent = 'Pending Account Requests';
  head.appendChild(title);

  var note = document.createElement('div');
  note.className = 'dash-section-note';
  note.textContent = 'Approve new users here too so they do not get missed';
  head.appendChild(note);

  section.appendChild(head);

  var body = document.createElement('div');
  body.className = 'dash-section-body';

  users.forEach(function(user) {
    var row = document.createElement('div');
    row.className = 'crew-worker';

    var info = document.createElement('div');
    info.className = 'crew-name';
    info.innerHTML =
      '<strong>' + (user.name || 'Unnamed worker') + '</strong><br>' +
      '<span style="font-size:12px;color:var(--text2)">' +
      (user.email || 'No email') + ' - ' + ((user.trade || 'worker').charAt(0).toUpperCase() + (user.trade || 'worker').slice(1)) +
      '</span>';

    var controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.gap = '8px';
    controls.style.alignItems = 'center';

    var roleSel = document.createElement('select');
    ['worker', 'supervisor'].forEach(function(role) {
      var opt = document.createElement('option');
      opt.value = role;
      opt.textContent = role.charAt(0).toUpperCase() + role.slice(1);
      if ((user.role || 'worker') === role) opt.selected = true;
      roleSel.appendChild(opt);
    });

    var tradeSel = document.createElement('select');
    ['electrician', 'millwright', 'plumber', 'carpenter'].forEach(function(trade) {
      var opt = document.createElement('option');
      opt.value = trade;
      opt.textContent = trade.charAt(0).toUpperCase() + trade.slice(1);
      if ((user.trade || '') === trade) opt.selected = true;
      tradeSel.appendChild(opt);
    });

    var approveBtn = document.createElement('button');
    approveBtn.className = 'btn btn-secondary btn-sm';
    approveBtn.textContent = 'Approve';
    approveBtn.onclick = function() {
      if (typeof firebaseApproveUserAccount !== 'function') {
        toast('Account approval is not available');
        return;
      }
      approveBtn.disabled = true;
      firebaseApproveUserAccount(user.uid, tradeSel.value, roleSel.value).then(function() {
        if (typeof ensurePersonnelName === 'function') ensurePersonnelName(user.name || '');
        if (typeof renderPersonnelList === 'function') renderPersonnelList();
        if (typeof renderPendingAccountsList === 'function') renderPendingAccountsList();
        renderPendingTab();
        toast((user.name || 'Account') + ' approved as ' + roleSel.value);
      }).catch(function(err) {
        approveBtn.disabled = false;
        toast((err && err.message) || 'Could not approve account');
      });
    };

    controls.appendChild(roleSel);
    controls.appendChild(tradeSel);
    controls.appendChild(approveBtn);
    row.appendChild(info);
    row.appendChild(controls);
    body.appendChild(row);
  });

  section.appendChild(body);
  return section;
}

function renderPendingTab() {
  renderDashboardHeader();
  var container = document.getElementById('dashPending');
  if (!container) return;
  container.innerHTML = '';

  if (userHasFullAccess() && typeof firebaseListPendingUsers === 'function') {
    var accountMount = document.createElement('div');
    accountMount.innerHTML = '<div class="pending-all-clear">Loading pending account requests...</div>';
    container.appendChild(accountMount);
    firebaseListPendingUsers().then(function(rows) {
      if (!container.contains(accountMount)) return;
      var section = renderPendingAccountReviewSection(rows || []);
      if (section) accountMount.replaceWith(section);
      else accountMount.remove();
    }).catch(function() {
      if (!container.contains(accountMount)) return;
      accountMount.remove();
    });
  }

  var pendingPSIs = _allPSIs.filter(function(p) {
    return p.submittedForApproval && !p.approved;
  });
  pendingPSIs = sortPSIsForDash(pendingPSIs, getPSIDashSortAt);

  var pendingLifts = [];
  var liftData = (typeof loadLift === 'function') ? loadLift() : { units: {} };
  Object.keys(liftData.units || {}).forEach(function(key) {
    var u = liftData.units[key];
    if (u && u.isPublished === false) return;
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
    reviewItems.push({
      type: 'psi',
      sortAt: getPSIDashSortAt(psi),
      mine: psiIncludesCurrentUserForDash(psi) ? 1 : 0,
      record: psi
    });
  });
  pendingLifts.forEach(function(unit) {
    reviewItems.push({ type: 'lift', sortAt: unit.updatedAt || unit.reviewedAt || 0, record: unit });
  });
  reviewItems.sort(function(a, b) {
    var aMine = a && a.mine ? 1 : 0;
    var bMine = b && b.mine ? 1 : 0;
    if (aMine !== bMine) return bMine - aMine;
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


