/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   js/app.js â€” utility functions + app init
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

// â”€â”€ SHOW / HIDE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Always use inline styles â€” never rely on CSS class alone

function show(id) {
  const el = document.getElementById(id);
  if (el) { el.style.display = ''; el.classList.remove('hidden'); }
}

function hide(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function showBlock(id) {
  const el = document.getElementById(id);
  if (el) { el.style.display = 'block'; el.classList.remove('hidden'); }
}

function showFlex(id) {
  const el = document.getElementById(id);
  if (el) { el.style.display = 'flex'; el.classList.remove('hidden'); }
}

function getShortPSIPDFLabel(psi, maxLen, trimPrefix) {
  var shouldTrimPrefix = trimPrefix !== false;
  if (!psi) return 'PSI';

  var label = String(
    psi.jobTitle ||
    psi.shortTitle ||
    psi.aiTitle ||
    psi.templateName ||
    psi.taskDesc ||
    psi.jobCode ||
    'PSI'
  ).replace(/\s+/g, ' ').trim();

  if (shouldTrimPrefix) {
    label = label
      .replace(/^perform work to\s+/i, '')
      .replace(/^complete work to\s+/i, '')
      .replace(/^carry out\s+/i, '')
      .replace(/^conduct\s+/i, '')
      .replace(/\sand confirm normal operation\.?$/i, '')
      .replace(/\sin a controlled manner\.?$/i, '')
      .trim();
  }

  var words = label.split(/\s+/).filter(Boolean);
  if (words.length <= 3) return label;
  return words.slice(0, 3).join(' ');
}


// â”€â”€ TOAST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function toast(msg, dur) {
  dur = dur || 2800;
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(function() { t.classList.remove('show'); }, dur);
}

function supportsDesktopHoverPreview() {
  try {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  } catch (e) {
    return false;
  }
}

function ensurePDFHoverShell() {
  var shell = document.getElementById('pdfHoverPreview');
  if (shell) return shell;

  shell = document.createElement('div');
  shell.id = 'pdfHoverPreview';
  shell.className = 'pdf-hover-preview';
  shell.innerHTML =
    '<div class="pdf-hover-head">' +
      '<span class="pdf-hover-title">PDF Preview</span>' +
      '<span id="pdfHoverStatus" class="pdf-hover-status">Loading...</span>' +
    '</div>' +
    '<iframe id="pdfHoverFrame" class="pdf-hover-frame" title="PDF quick preview"></iframe>';
  shell.addEventListener('mouseleave', hidePDFHoverPreview);
  document.body.appendChild(shell);
  return shell;
}

function hidePDFHoverPreview() {
  var shell = document.getElementById('pdfHoverPreview');
  var frame = document.getElementById('pdfHoverFrame');
  if (!shell) return;
  shell.classList.remove('show');
  if (frame) frame.removeAttribute('src');
  if (hidePDFHoverPreview._revokeUrl) {
    try { URL.revokeObjectURL(hidePDFHoverPreview._revokeUrl); } catch (e) {}
    hidePDFHoverPreview._revokeUrl = '';
  }
}

function attachPDFHoverPreview(button, buildPreview) {
  if (!button || typeof buildPreview !== 'function' || !supportsDesktopHoverPreview()) return;

  button.addEventListener('mouseenter', function() {
    var shell = ensurePDFHoverShell();
    var rect = button.getBoundingClientRect();
    var frame = document.getElementById('pdfHoverFrame');
    var status = document.getElementById('pdfHoverStatus');
    var shellWidth = 360;
    var shellHeight = 490;
    var gap = 12;
    var left = rect.right + gap;
    var top = rect.top - 8;

    if (left + shellWidth > window.innerWidth - 12) {
      left = rect.left - shellWidth - gap;
    }
    if (left < 12) {
      left = Math.max(12, window.innerWidth - shellWidth - 12);
    }

    if (top + shellHeight > window.innerHeight - 12) {
      top = window.innerHeight - shellHeight - 12;
    }
    if (top < 12) top = 12;

    shell.style.top = top + 'px';
    shell.style.left = left + 'px';
    shell.classList.add('show');
    if (status) status.textContent = 'Loading...';
    if (frame) frame.removeAttribute('src');

    buildPreview(function(url) {
      if (!shell.classList.contains('show')) {
        try { URL.revokeObjectURL(url); } catch (e) {}
        return;
      }
      if (hidePDFHoverPreview._revokeUrl) {
        try { URL.revokeObjectURL(hidePDFHoverPreview._revokeUrl); } catch (e) {}
      }
      hidePDFHoverPreview._revokeUrl = url;
      if (frame) frame.src = url;
      if (status) status.textContent = 'Quick preview';
    });
  });

  button.addEventListener('mouseleave', function() {
    setTimeout(function() {
      var shell = document.getElementById('pdfHoverPreview');
      if (!shell) return;
      if (!shell.matches(':hover')) hidePDFHoverPreview();
    }, 120);
  });
}


// â”€â”€ DATE / TIME FORMATTING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function fmtDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return d.getDate() + ' ' + months[d.getMonth()] + ' Â· ' + d.toTimeString().slice(0, 5);
}

function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + mm + '-' + dd;
}

function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

function nowDateTimeLocal() {
  const d = new Date();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  const hh   = String(d.getHours()).padStart(2, '0');
  const min  = String(d.getMinutes()).padStart(2, '0');
  return d.getFullYear() + '-' + mm + '-' + dd + 'T' + hh + ':' + min;
}

function fmtDisplayDate(isoDate) {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length < 3) return isoDate;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return parseInt(parts[2]) + ' ' + months[parseInt(parts[1]) - 1] + ' ' + parts[0];
}


// â”€â”€ ID GENERATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}


// â”€â”€ INITIALS from name â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function initials(name) {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}


// â”€â”€ ONLINE / OFFLINE BAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function updateOnline() {
  const bar = document.getElementById('offlineBar');
  if (!bar) return;
  bar.style.display = navigator.onLine ? 'none' : 'block';
}

window.addEventListener('online',  updateOnline);
window.addEventListener('offline', updateOnline);


// â”€â”€ GLOBAL ERROR CATCHING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

window.addEventListener('error', function(e) {
  console.error('[PSI error]', e.message, e.filename, e.lineno);
});

window.addEventListener('unhandledrejection', function(e) {
  console.error('[PSI promise]', e.reason);
});


// â”€â”€ HEADER DATELINE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function updateDateline() {
  const hdDate  = document.getElementById('hdDate');
  const hdShift = document.getElementById('hdShift');

  if (hdDate) {
    const d = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    hdDate.textContent = days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  if (hdShift) {
    hdShift.textContent = (typeof formatShiftStatus === 'function')
      ? formatShiftStatus()
      : (lsGet(SHIFT_KEY) ? 'Shift Â· ' + lsGet(SHIFT_KEY) : '');
  }
}


// â”€â”€ BACKGROUND POLL (refresh dash every 8s when idle) â”€â”€â”€â”€â”€â”€â”€â”€â”€

let _pollTimer = null;

function startPoll() {
  if (_pollTimer) return;
  _pollTimer = setInterval(function() {
    if (me && !me.activePSI) {
      updateDateline();
    }
  }, 8000);
}

function stopPoll() {
  if (!_pollTimer) return;
  clearInterval(_pollTimer);
  _pollTimer = null;
}

function normalizePersonName(name) {
  return String(name || '').trim().toLowerCase();
}

function uniquePeople(list) {
  var seen = {};
  return (list || []).filter(function(name) {
    var raw = String(name || '').trim();
    var key = normalizePersonName(raw);
    if (!raw || seen[key]) return false;
    seen[key] = true;
    return true;
  });
}

function chooseReturnRecipient(label, names, currentName) {
  var people = uniquePeople(names);
  if (!people.length) return '';
  if (people.length === 1) return people[0];

  var lines = ['Send this ' + label + ' back to which person?'];
  people.forEach(function(name, idx) {
    lines.push((idx + 1) + '. ' + name);
  });

  var hint = currentName ? '\n\nCurrent: ' + currentName : '';
  var choice = prompt(lines.join('\n') + hint, currentName || '1');
  if (choice === null) return null;
  choice = String(choice || '').trim();
  if (!choice) return '';

  var asNum = parseInt(choice, 10);
  if (!isNaN(asNum) && people[asNum - 1]) return people[asNum - 1];

  var matched = people.find(function(name) {
    return normalizePersonName(name) === normalizePersonName(choice);
  });
  return matched || '';
}

var _returnReviewState = null;

function closeReturnReviewModal() {
  var modal = document.getElementById('returnReviewModal');
  if (!modal) return;
  modal.style.display = 'none';
  _returnReviewState = null;
}

function openReturnReviewModal(opts) {
  var modal = document.getElementById('returnReviewModal');
  var info = document.getElementById('returnReviewInfo');
  var choices = document.getElementById('returnReviewChoices');
  var note = document.getElementById('returnReviewNote');
  if (!modal || !choices || !note) return;

  var people = uniquePeople((opts && opts.names) || []);
  _returnReviewState = {
    target: (opts && opts.currentName) || '',
    onConfirm: opts && opts.onConfirm
  };

  if (info) info.textContent = (opts && opts.info) || 'Choose who this should go back to and add the note.';
  choices.innerHTML = '';
  people.forEach(function(name) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'person-chip return-choice' + (normalizePersonName(name) === normalizePersonName(_returnReviewState.target) ? ' active' : '');
    btn.textContent = name;
    btn.onclick = function() {
      _returnReviewState.target = name;
      Array.prototype.forEach.call(choices.querySelectorAll('.return-choice'), function(node) {
        node.classList.toggle('active', node === btn);
      });
    };
    choices.appendChild(btn);
  });

  note.value = (opts && opts.currentNote) || '';
  modal.style.display = 'flex';
  setTimeout(function() { note.focus(); }, 30);
}

function confirmReturnReviewModal() {
  if (!_returnReviewState || typeof _returnReviewState.onConfirm !== 'function') return;
  var note = document.getElementById('returnReviewNote');
  var text = ((note && note.value) || '').trim();
  var target = (_returnReviewState.target || '').trim();
  if (!target) { toast('Select who this should go back to'); return; }
  if (!text) { toast('Add a review note first'); return; }
  var fn = _returnReviewState.onConfirm;
  closeReturnReviewModal();
  fn(target, text);
}

function isReturnAssignedToMe(record) {
  if (!record || !me || !me.name || userHasFullAccess()) return false;
  var assigned = normalizePersonName(record.reviewAssignedTo);
  if (assigned) return assigned === normalizePersonName(me.name);
  return false;
}

function getPSIReturnCandidates(psi) {
  var names = [];
  if (psi && psi.createdBy) names.push(psi.createdBy);
  (psi && psi.workers || []).forEach(function(w) {
    if (w && w.name) names.push(w.name);
  });
  return uniquePeople(names);
}

function getLiftReturnCandidates(unit) {
  var names = [];
  if (unit && unit.operator) names.push(unit.operator);
  if (unit && unit.psiId && typeof loadPSI === 'function') {
    var linked = loadPSI(unit.psiId);
    if (linked && linked.createdBy) names.push(linked.createdBy);
    (linked && linked.workers || []).forEach(function(w) {
      if (w && w.name) names.push(w.name);
    });
  }
  return uniquePeople(names);
}

function hasWorkerInitialedPSI(psi, workerName) {
  return !!((psi && psi.initials) || []).some(function(entry) {
    return normalizePersonName(entry && entry.name) === normalizePersonName(workerName);
  });
}

function hasWorkerSignedPSI(psi, worker, idx) {
  if (!psi || !worker || !worker.name) return false;
  return !!(
    (psi.sigs && psi.sigs[idx]) ||
    (psi.sigWorkers && psi.sigWorkers.indexOf(worker.name) !== -1)
  );
}

function canSendPSIForReview(psi) {
  if (!psi || psi.approved || psi.submittedForApproval) return false;
  if (userHasFullAccess()) return true;
  return normalizePersonName(psi.createdBy) === normalizePersonName(me.name) || isReturnAssignedToMe(psi);
}

function getPSISubmissionCheck(psi) {
  psi = psi || {};
  var workers = (psi.workers || []).filter(function(w) { return w && String(w.name || '').trim(); });
  var selectedHazards = (psi.hazards || []).length + (psi.customHazards || []).length;
  var blocking = [];
  var warnings = [];

  if (!String(psi.taskDesc || '').trim()) blocking.push('Add a task description');
  if (!String(psi.taskStepsText || '').trim()) blocking.push('Add the task details');
  if (!selectedHazards && !String(psi.hazardText || '').trim()) blocking.push('Add hazards');
  if (!String(psi.controlText || '').trim()) blocking.push('Add controls');
  if (!workers.length) blocking.push('Add at least one worker');
  if (typeof psiNeedsLift === 'function' && psiNeedsLift(psi) && !psi.liftUnitKey) {
    blocking.push('Select a lift unit');
  }

  if (!String(psi.jobNumber || '').trim()) warnings.push('No work order number added');
  if (!String(psi.taskLoc || '').trim()) warnings.push('No location added');
  if (!String(psi.musterPoint || '').trim()) warnings.push('No muster point added');

  return { blocking: blocking, warnings: warnings };
}

function confirmPSISubmissionCheck(psi) {
  var check = getPSISubmissionCheck(psi);
  if (check.blocking.length) {
    alert('Finish these before sending:\n\n- ' + check.blocking.join('\n- '));
    return false;
  }
  if (check.warnings.length) {
    return confirm(
      'This PSI can be sent, but it still has:\n\n- ' + check.warnings.join('\n- ') + '\n\nSend it anyway?'
    );
  }
  return true;
}

function submitPSIForReview(psiId, opts) {
  var psi = typeof loadPSI === 'function' ? loadPSI(psiId) : null;
  if (!psi) { toast('PSI not found'); return false; }

  if (!confirmPSISubmissionCheck(psi)) return false;

  if (typeof psiNeedsLift === 'function' && psiNeedsLift(psi) && !psi.liftUnitKey) {
    toast('Select a lift unit before sending for review');
    if (typeof openPSI === 'function') openPSI(psi.id);
    setTimeout(function() {
      if (typeof openLiftLinkModal === 'function') openLiftLinkModal();
    }, 220);
    return false;
  }

  if (!userRequiresSupervisorReview()) {
    psi.submittedForApproval = false;
    psi.reviewStatus = '';
    psi.reviewAssignedTo = '';
    psi.reviewNote = '';
    psi.reviewedBy = me.name || '';
    psi.reviewedAt = Date.now();
    psi.approved = true;
    psi.approvedBy = me.name || '';
    psi.approvedAt = Date.now();
    psi.updatedAt = Date.now();

    if (typeof writePSI === 'function') writePSI(psi);
    if (typeof refreshDash === 'function') refreshDash();
    if (typeof buildPDFWithSigs === 'function') buildPDFWithSigs(psi, { isFinal: true });
    else if (typeof buildPDF === 'function') buildPDF(psi);
    if (!opts || !opts.silent) {
      toast((opts && opts.toast) || 'PSI completed and PDF downloaded');
    }
    return true;
  }

  psi.submittedForApproval = true;
  psi.reviewStatus = 'submitted';
  psi.reviewAssignedTo = '';
  psi.reviewNote = '';
  psi.reviewedBy = '';
  psi.reviewedAt = null;
  psi.updatedAt = Date.now();

  if (typeof writePSI === 'function') writePSI(psi);
  if (typeof updatePendingBadge === 'function') updatePendingBadge();
  if (typeof renderPendingTab === 'function') renderPendingTab();
  if (typeof refreshDash === 'function') refreshDash();

  if (!opts || !opts.silent) {
    toast((opts && opts.toast) || 'Saved and sent for supervisor review');
  }
  return true;
}

function maybeAutoSendPSIForReview(psi) {
  if (!psi || psi.approved || psi.submittedForApproval) return false;
  var workers = (psi.workers || []).filter(function(w) { return w && w.name; });
  if (!workers.length) return false;
  var allInitialed = workers.every(function(w) {
    return hasWorkerInitialedPSI(psi, w.name);
  });
  if (!allInitialed) return false;
  return submitPSIForReview(psi.id, { silent: true }) || false;
}

function getWorkerBreakMap(psi, workerName) {
  var map = { '1st': false, lunch: false, '2nd': false };
  ((psi && psi.initials) || []).forEach(function(entry) {
    if (normalizePersonName(entry && entry.name) !== normalizePersonName(workerName)) return;
    if (entry.breakType && Object.prototype.hasOwnProperty.call(map, entry.breakType)) {
      map[entry.breakType] = true;
    }
  });
  return map;
}

function hasAnyInitialsPSI(psi, workerName) {
  var breaks = getWorkerBreakMap(psi, workerName);
  return !!(breaks['1st'] || breaks.lunch || breaks['2nd']);
}

function workerBadgeText(name) {
  var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

var _baseMaybePromptReturnedItems = typeof maybePromptReturnedItems === 'function' ? maybePromptReturnedItems : null;
maybePromptReturnedItems = function() {
  if (!me || !me.name || userHasFullAccess()) return;

  var myReturnedPSIs = _allPSIs.filter(function(p) {
    return p && p.reviewStatus === 'returned' && !p.approved && (
      isReturnAssignedToMe(p) ||
      (!p.reviewAssignedTo && (
        normalizePersonName(p.createdBy) === normalizePersonName(me.name) ||
        (p.workers || []).some(function(w) { return normalizePersonName(w && w.name) === normalizePersonName(me.name); })
      ))
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
      isReturnAssignedToMe(u) ||
      (!u.reviewAssignedTo && normalizePersonName(u.operator) === normalizePersonName(me.name))
    );
  });

  var key = [myReturnedPSIs.map(function(p) { return p.id; }).join(','), myReturnedLifts.map(function(u) { return u.unitKey || u.unitNum; }).join(',')].join('|');
  if (!key || key === '|' || key === _returnedPromptKey) return;
  _returnedPromptKey = key;

  var total = myReturnedPSIs.length + myReturnedLifts.length;
  var assignedNames = uniquePeople(
    myReturnedPSIs.map(function(p) { return p.reviewAssignedTo; })
      .concat(myReturnedLifts.map(function(u) { return u.reviewAssignedTo; }))
  );
  var msg = 'You have ' + total + ' item' + (total !== 1 ? 's' : '') + ' returned for changes';
  if (assignedNames.length) msg += ' for ' + assignedNames.join(', ');
  msg += '.';

  toast(msg, 4500);
  if (myReturnedPSIs.length && confirm(msg + ' Open the first returned PSI now?')) {
    openPSI(myReturnedPSIs[0].id);
    return;
  }
  if (myReturnedLifts.length && confirm(msg + ' Open the first returned lift now?')) {
    if (typeof showLiftPaneForUnit === 'function') showLiftPaneForUnit(myReturnedLifts[0].unitKey || myReturnedLifts[0].unitNum);
  }
};

var _baseRefreshDash = typeof refreshDash === 'function' ? refreshDash : null;
if (_baseRefreshDash) {
  refreshDash = function() {
    _baseRefreshDash();
    if (!me || !me.name || userHasFullAccess()) return;
    Array.prototype.forEach.call(document.querySelectorAll('.psi-card, .pending-banner, .lift-deficiency-box'), function(node) {
      var text = (node.textContent || '').toLowerCase();
      if (text.indexOf('review note:') !== -1 || text.indexOf('returned for changes') !== -1 || text.indexOf('sent back to') !== -1) {
        if (text.indexOf(normalizePersonName(me.name)) !== -1) {
          node.classList.add('needs-attention');
        }
      }
    });
  };
}

var _baseRenderPSICard = typeof renderPSICard === 'function' ? renderPSICard : null;
if (_baseRenderPSICard) {
  renderPSICard = function(psi, isHist) {
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
    if ((psi.workers || []).some(function(w, i) {
      if (!w || !w.name) return false;
      var signed = hasWorkerSignedPSI(psi, w, i);
      var anyInitialed = hasAnyInitialsPSI(psi, w.name);
      return anyInitialed && !signed;
    })) {
      const crewPill = document.createElement('div');
      crewPill.className = 'psi-status-pill crew-partial';
      crewPill.textContent = 'Crew Partial';
      statusRow.appendChild(crewPill);
    }
    meta.appendChild(statusRow);

    const title = document.createElement('div');
    title.className = 'psi-title';
    title.textContent = psi.taskDesc || psi.jobTitle || 'Untitled PSI';
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

    const workers = (psi.workers || []).filter(function(w) { return w && w.name; });
    if (workers.length) {
      const crewStatus = document.createElement('div');
      crewStatus.className = 'psi-crew-status';

      workers.forEach(function(w, i) {
        var signed = hasWorkerSignedPSI(psi, w, i);
        var breaks = getWorkerBreakMap(psi, w.name);
        var anyInitialed = breaks['1st'] || breaks.lunch || breaks['2nd'];

        var row = document.createElement('div');
        row.className = 'psi-worker-status';

        var badge = document.createElement('div');
        badge.className = 'psi-worker-badge' + (signed ? ' done' : (anyInitialed ? ' partial' : ''));
        badge.textContent = workerBadgeText(w.name);
        badge.title = w.name + (signed ? ' signed' : (anyInitialed ? ' initialed' : ' not signed or initialed'));
        row.appendChild(badge);

        var initialsRow = document.createElement('div');
        initialsRow.className = 'psi-worker-initials';

        [
          ['1st', '1st break'],
          ['lunch', 'lunch'],
          ['2nd', '2nd break']
        ].forEach(function(item) {
          var dot = document.createElement('span');
          dot.className = 'psi-initial-dot' + (breaks[item[0]] ? ' done' : '');
          dot.title = item[1] + (breaks[item[0]] ? ' initialed' : ' not initialed');
          initialsRow.appendChild(dot);
        });

        row.appendChild(initialsRow);

        var name = document.createElement('div');
        name.className = 'psi-worker-name';
        name.textContent = w.name;
        row.appendChild(name);
        crewStatus.appendChild(row);
      });

      meta.appendChild(crewStatus);
    }

    if (psi.reviewNote) {
      const note = document.createElement('div');
      note.className = 'psi-pending-label';
      note.textContent = 'Review note' + (psi.reviewAssignedTo ? ' for ' + psi.reviewAssignedTo : '') + ': ' + psi.reviewNote;
      meta.appendChild(note);
    }

    const right = document.createElement('div');
    right.className = 'psi-right';

    const workerCount = workers.length;
    const sigCount = Object.keys(psi.sigs || {}).length || (psi.sigWorkers ? psi.sigWorkers.length : 0);
    const initNames = uniquePeople((psi.initials || []).map(function(i) { return i && i.name; }));
    const count = document.createElement('div');
    count.className = 'psi-count';
    count.textContent = sigCount + '/' + workerCount + ' signed - ' + initNames.length + '/' + workerCount + ' initialed';
    meta.appendChild(count);

    const actions = document.createElement('div');
    actions.className = 'psi-card-actions';

    const isSup = userHasFullAccess();
    const isApproved = !!psi.approved || !!isHist;
    const workerFieldsOpen = psi.worker_fields_open !== false;
    const isOwner = normalizePersonName(psi.createdBy) === normalizePersonName(me.name);

    if (isApproved) {
      const dl = document.createElement('button');
      dl.className = 'psi-draft-btn';
      dl.textContent = 'Preview PDF';
      dl.onclick = function(e) { e.stopPropagation(); redownload(psi.id); };
      attachPDFHoverPreview(dl, function(onReady) {
        buildPDFWithSigs(loadPSI(psi.id), { isFinal: true, onReady: onReady });
      });
      actions.appendChild(dl);

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

      if (canSendPSIForReview(psi)) {
        const sendBtn = document.createElement('button');
        sendBtn.className = 'psi-approve-btn';
        sendBtn.textContent = userRequiresSupervisorReview() ? 'Send for Review' : 'Complete & Download PDF';
        sendBtn.onclick = function(e) {
          e.stopPropagation();
          submitPSIForReview(psi.id);
        };
        actions.appendChild(sendBtn);
      }

      const draftBtn = document.createElement('button');
      draftBtn.className = 'psi-draft-btn';
      draftBtn.textContent = 'Preview PDF';
      draftBtn.onclick = function(e) { e.stopPropagation(); buildPDFWithSigs(loadPSI(psi.id), { isFinal: false, preview: true }); };
      attachPDFHoverPreview(draftBtn, function(onReady) {
        buildPDFWithSigs(loadPSI(psi.id), { isFinal: false, onReady: onReady });
      });
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

    card.appendChild(badge);
    card.appendChild(meta);
    right.appendChild(actions);
    card.appendChild(right);
    return card;
  };
}

var _baseReturnPSIFromDash = typeof returnPSIFromDash === 'function' ? returnPSIFromDash : null;
if (_baseReturnPSIFromDash) {
  returnPSIFromDash = function(psiId) {
    if (!psiId) return;
    var psi = typeof loadPSI === 'function' ? loadPSI(psiId) : null;
    if (!psi) { toast('PSI not found'); return; }
    openReturnReviewModal({
      info: 'Choose who this PSI should go back to and add the note.',
      names: getPSIReturnCandidates(psi),
      currentName: psi.reviewAssignedTo || psi.createdBy || '',
      currentNote: psi.reviewNote || '',
      onConfirm: function(target, note) {
        psi.submittedForApproval = false;
        psi.reviewStatus = 'returned';
        psi.reviewAssignedTo = target;
        psi.reviewNote = note;
        psi.reviewedBy = me.name || '';
        psi.reviewedAt = Date.now();

        if (typeof writePSI === 'function') writePSI(psi);
        refreshDash();
        if (typeof updatePendingBadge === 'function') updatePendingBadge();
        if (typeof renderPendingTab === 'function') renderPendingTab();
        toast('PSI sent back to ' + target);
      }
    });
  };
}

var _baseReturnLiftFromDash = typeof returnLiftFromDash === 'function' ? returnLiftFromDash : null;
if (_baseReturnLiftFromDash) {
  returnLiftFromDash = function(unitKey) {
    if (!unitKey) return;
    var liftData = (typeof loadLift === 'function') ? loadLift() : { units: {} };
    var u = liftData.units[unitKey];
    if (!u) { toast('Unit not found'); return; }
    openReturnReviewModal({
      info: 'Choose who this lift inspection should go back to and add the note.',
      names: getLiftReturnCandidates(u),
      currentName: u.reviewAssignedTo || u.operator || '',
      currentNote: u.reviewNote || '',
      onConfirm: function(target, note) {
        u.status = 'returned';
        u.reviewAssignedTo = target;
        u.reviewNote = note;
        u.reviewedBy = me.name || '';
        u.reviewedAt = Date.now();

        if (typeof saveLift === 'function') saveLift(liftData);
        if (typeof syncLinkedLiftPSI === 'function') syncLinkedLiftPSI(unitKey);
        if (typeof updatePendingBadge === 'function') updatePendingBadge();
        if (typeof renderPendingTab === 'function') renderPendingTab();
        refreshDash();
        toast('Lift sent back to ' + target);
      }
    });
  };
}

var _baseLiftReturnForChanges = typeof liftReturnForChanges === 'function' ? liftReturnForChanges : null;
if (_baseLiftReturnForChanges) {
  liftReturnForChanges = function() {
    if (!_curLift) { toast('Select or create a unit first'); return; }
    const u = _liftData.units[_curLift];
    if (!u) return;
    openReturnReviewModal({
      info: 'Choose who this lift inspection should go back to and add the note.',
      names: getLiftReturnCandidates(u),
      currentName: u.reviewAssignedTo || u.operator || '',
      currentNote: u.reviewNote || '',
      onConfirm: function(target, note) {
        liftSave();
        u.status = 'returned';
        u.reviewAssignedTo = target;
        u.reviewNote = note;
        u.reviewedBy = me.name || '';
        u.reviewedAt = Date.now();
        saveLift(_liftData);
        syncLinkedLiftPSI(_curLift);

        renderLiftBar();
        renderLiftActions();
        renderLiftChecks(false);

        if (typeof updatePendingBadge === 'function') updatePendingBadge();
        refreshDash();
        toast('Lift sent back to ' + target);
      }
    });
  };
}

renderPendLiftCard = function(unit) {
  var card = document.createElement('div');
  card.className = 'psi-card status-review';
  card.style.borderLeft = '3px solid var(--accent)';
  card.style.padding = '12px 18px';

  card.onclick = function(e) {
    if (e.target.classList.contains('psi-approve-btn') ||
        e.target.classList.contains('psi-del') ||
        e.target.classList.contains('psi-draft-btn')) return;
    if (typeof showLiftPaneForUnit === 'function') showLiftPaneForUnit(unit.unitKey || unit.unitNum);
    else if (typeof showLiftPane === 'function') showLiftPane();
  };

  var meta = document.createElement('div');
  meta.className = 'psi-meta';

  var title = document.createElement('div');
  title.className = 'psi-title';
  title.textContent = 'Lift Inspection - ' + (unit.unitNum || unit.unitKey || '--');
  meta.appendChild(title);

  var sub = document.createElement('div');
  sub.className = 'psi-sub';
  var subParts = [];
  if (unit.date) subParts.push(unit.date);
  if (unit.operator) subParts.push(unit.operator);
  if (unit.make) subParts.push(unit.make);
  sub.textContent = subParts.join(' - ');
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

  var approveBtn = document.createElement('button');
  approveBtn.className = 'psi-approve-btn';
  approveBtn.textContent = 'Approve';
  approveBtn.onclick = function(e) {
    e.stopPropagation();
    approveLiftFromDash(unit.unitKey || unit.unitNum);
  };
  right.appendChild(approveBtn);

  var sendBackBtn = document.createElement('button');
  sendBackBtn.className = 'psi-draft-btn';
  sendBackBtn.textContent = 'Send Back';
  sendBackBtn.onclick = function(e) {
    e.stopPropagation();
    returnLiftFromDash(unit.unitKey || unit.unitNum);
  };
  right.appendChild(sendBackBtn);

  var previewBtn = document.createElement('button');
  previewBtn.className = 'psi-draft-btn';
  previewBtn.textContent = 'Preview PDF';
  previewBtn.onclick = function(e) {
    e.stopPropagation();
    if (typeof buildMEWPPDF === 'function') buildMEWPPDF(unit, unit.opStrokes || [], unit.supStrokes || [], { preview: true });
  };
  if (typeof attachPDFHoverPreview === 'function') {
    attachPDFHoverPreview(previewBtn, function(onReady) {
      if (typeof buildMEWPPDF === 'function') buildMEWPPDF(unit, unit.opStrokes || [], unit.supStrokes || [], { onReady: onReady });
    });
  }
  right.appendChild(previewBtn);

  card.appendChild(meta);
  card.appendChild(right);
  return card;
};

renderPendCard = function(psi, liftData) {
  var card = document.createElement('div');
  card.className = 'psi-card status-review';
  card.style.borderLeft = '3px solid var(--accent)';
  card.style.padding = '12px 18px';

  card.onclick = function(e) {
    if (e.target.classList.contains('psi-approve-btn') ||
        e.target.classList.contains('psi-del') ||
        e.target.classList.contains('psi-draft-btn')) return;
    openPSI(psi.id);
  };

  var meta = document.createElement('div');
  meta.className = 'psi-meta';

  var title = document.createElement('div');
  title.className = 'psi-title';
  title.textContent = psi.taskDesc || psi.jobTitle || 'Untitled PSI';
  meta.appendChild(title);

  var parts = [];
  if (psi.createdBy) parts.push('Owner: ' + psi.createdBy);
  if (psi.taskLoc) parts.push(psi.taskLoc);
  if (psi.jobNumber) parts.push('WO ' + psi.jobNumber);
  var sub = document.createElement('div');
  sub.className = 'psi-sub';
  sub.textContent = parts.join(' - ');
  meta.appendChild(sub);

  liftData = liftData || (typeof loadLift === 'function' ? loadLift() : { units: {} });
  var linkedLift = null;
  if (psi.liftUnitKey && liftData && liftData.units && liftData.units[psi.liftUnitKey]) {
    linkedLift = liftData.units[psi.liftUnitKey];
    var liftRow = document.createElement('div');
    liftRow.className = 'psi-pending-label';
    liftRow.textContent = 'Lift ' + (linkedLift.unitNum || psi.liftUnitKey) + ' - ' + (linkedLift.status || 'draft');
    meta.appendChild(liftRow);
  }

  if (psi.reviewNote) {
    var note = document.createElement('div');
    note.className = 'psi-pending-label';
    note.textContent = 'Review note: ' + psi.reviewNote;
    meta.appendChild(note);
  }

  var right = document.createElement('div');
  right.className = 'psi-right';
  right.style.gap = '6px';

  var approveBtn = document.createElement('button');
  approveBtn.className = 'psi-approve-btn';
  approveBtn.textContent = 'Approve';
  approveBtn.onclick = function(e) {
    e.stopPropagation();
    openApproveModal(psi.id);
  };
  right.appendChild(approveBtn);

  var sendBackBtn = document.createElement('button');
  sendBackBtn.className = 'psi-draft-btn';
  sendBackBtn.textContent = 'Send Back';
  sendBackBtn.onclick = function(e) {
    e.stopPropagation();
    returnPSIFromDash(psi.id);
  };
  right.appendChild(sendBackBtn);

  var previewBtn = document.createElement('button');
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
    var openLiftBtn = document.createElement('button');
    openLiftBtn.className = 'psi-draft-btn';
    openLiftBtn.textContent = 'Open Lift';
    openLiftBtn.onclick = function(e) {
      e.stopPropagation();
      if (typeof showLiftPaneForUnit === 'function') showLiftPaneForUnit(psi.liftUnitKey);
      else if (typeof showLiftPane === 'function') showLiftPane();
    };
    right.appendChild(openLiftBtn);
  }

  card.appendChild(meta);
  card.appendChild(right);
  return card;
};

renderPendingTab = function() {
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
};


// â”€â”€ INIT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

document.addEventListener('DOMContentLoaded', function() {

  updateOnline();

  // Apply any saved trigger word overrides to built-in templates
  if (typeof applyTriggerOverrides === 'function') applyTriggerOverrides();

  // Prime worker name cache from Google Sheets (fire-and-forget)
  if (typeof sheetsFetchWorkers === 'function') sheetsFetchWorkers();

  function showLoginScreen() {
    const ls = document.getElementById('loginScreen');
    if (ls) { ls.style.display = 'flex'; ls.style.opacity = '1'; }
    setRole('worker');
    if (typeof setLoginMode === 'function') setLoginMode('signin');
  }

  // Try to restore session
  const sess = loadSession();
  if (sess && sess.authType === 'firebase' && typeof restoreSignedInAccount === 'function') {
    restoreSignedInAccount(sess).then(function(ok) {
      if (ok) {
        openDash();
        return;
      }
      clearSession();
      showLoginScreen();
    });
  } else if (sess) {
    me.name = sess.name;
    me.role = sess.role;
    me.trade = sess.trade || 'electrician';
    me.workflowType = sess.workflowType || (me.trade === 'electrician' ? 'full_review' : 'teams_export');
    me.requiresSupervisorReview = typeof sess.requiresSupervisorReview === 'boolean'
      ? sess.requiresSupervisorReview
      : (me.trade === 'electrician' || userHasFullAccess());
    me.uid = sess.uid || '';
    me.email = sess.email || '';
    me.authType = sess.authType || 'legacy';
    openDash();
  } else if (typeof restoreSignedInAccount === 'function') {
    restoreSignedInAccount(null).then(function(ok) {
      if (ok) {
        openDash();
        return;
      }
      showLoginScreen();
    });
  } else {
    showLoginScreen();
  }

  // Wire Enter key on crew inputs
  const elecIn = document.getElementById('elecIn');
  if (elecIn) {
    elecIn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') crewAdd('elec');
    });
  }

  const millIn = document.getElementById('millIn');
  if (millIn) {
    millIn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') crewAdd('mill');
    });
  }

  // Wire Enter key on name input in login
  const nameInput = document.getElementById('nameInput');
  if (nameInput) {
    nameInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') lsConfirm();
    });
  }

});
