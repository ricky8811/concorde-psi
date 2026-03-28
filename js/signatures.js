/* ═══════════════════════════════════════════════════════════════
   js/signatures.js — canvas drawing, save/load signatures
═══════════════════════════════════════════════════════════════ */

// ── STATE ─────────────────────────────────────────────────────
const _sigStrokes = {};   // canvasId → [ { points: [[x,y], ...] } ]
let _activeSigIdx = null; // worker index currently being signed


// ── CANVAS SETUP ──────────────────────────────────────────────

function initSigPad(canvasId) {
  const orig = document.getElementById(canvasId);
  if (!orig) return;

  // Clone first to shed old event listeners, then do all setup on the clone
  const c = orig.cloneNode(false);
  orig.parentNode.replaceChild(c, orig);

  const dpr  = window.devicePixelRatio || 1;
  const rect = c.getBoundingClientRect();
  c.width    = (rect.width  || 300) * dpr;
  c.height   = (rect.height || 120) * dpr;

  const ctx = c.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth   = 2;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';

  if (!_sigStrokes[canvasId]) _sigStrokes[canvasId] = [];

  let drawing   = false;
  let curStroke = null;

  // getPos uses c (the DOM element), never the detached orig
  function getPos(e) {
    const r   = c.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return [src.clientX - r.left, src.clientY - r.top];
  }

  function start(e) {
    e.preventDefault();
    drawing = true;
    const pos = getPos(e);
    curStroke = { points: [pos] };
    ctx.beginPath();
    ctx.moveTo(pos[0], pos[1]);
    c.classList.add('signed');
  }

  function move(e) {
    e.preventDefault();
    if (!drawing || !curStroke) return;
    const pos = getPos(e);
    curStroke.points.push(pos);
    ctx.lineTo(pos[0], pos[1]);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos[0], pos[1]);
  }

  function end(e) {
    e.preventDefault();
    if (!drawing || !curStroke) return;
    drawing = false;
    if (curStroke.points.length > 0) _sigStrokes[canvasId].push(curStroke);
    curStroke = null;
  }

  c.addEventListener('touchstart', start, { passive: false });
  c.addEventListener('touchmove',  move,  { passive: false });
  c.addEventListener('touchend',   end,   { passive: false });

  c.addEventListener('mousedown',  start);
  c.addEventListener('mousemove',  function(e) { if (drawing) move(e); });
  c.addEventListener('mouseup',    end);
  c.addEventListener('mouseleave', function(e) { if (drawing) end(e); });
}


// ── CLEAR ─────────────────────────────────────────────────────

function clearSig(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

  _sigStrokes[canvasId] = [];
  canvas.classList.remove('signed');
}


// ── REDRAW STROKES onto a canvas ──────────────────────────────

function redrawStrokes(canvasId, strokes) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !strokes || !strokes.length) return;

  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth   = 2;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';

  strokes.forEach(function(stroke) {
    if (!stroke.points || stroke.points.length < 1) return;
    ctx.beginPath();
    ctx.moveTo(stroke.points[0][0], stroke.points[0][1]);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i][0], stroke.points[i][1]);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(stroke.points[i][0], stroke.points[i][1]);
    }
  });

  _sigStrokes[canvasId] = strokes.slice();
  canvas.classList.add('signed');
}


// ── EXPORT CANVAS TO PNG (base64) ─────────────────────────────

function canvasToPNG(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  if (!_sigStrokes[canvasId] || _sigStrokes[canvasId].length === 0) return null;
  return canvas.toDataURL('image/png');
}


// ── WORKER SIGNATURE PANEL (Step 5) ───────────────────────────

function renderSigPanel() {
  const picker   = document.getElementById('workerPicker');
  const statusEl = document.getElementById('sigStatus');
  if (!picker || !statusEl) return;

  const workers = st.workers.filter(function(w) { return w.name && w.name.trim(); });
  const signed  = workers.filter(function(w, i) { return st.sigs[i]; }).length;

  statusEl.textContent = signed + ' of ' + workers.length + ' worker' +
    (workers.length !== 1 ? 's' : '') + ' signed';

  picker.innerHTML = '';

  workers.forEach(function(w, i) {
    const btn = document.createElement('button');
    btn.className = 'picker-btn' + (st.sigs[i] ? ' signed' : '');
    btn.textContent = w.name;
    if (_activeSigIdx === i) btn.classList.add('active-pick');
    btn.onclick = function() { openSigPanel(i); };
    picker.appendChild(btn);
  });

  // Supervisor button
  const btnSupSign = document.getElementById('btnSupSign');
  if (btnSupSign) {
    btnSupSign.style.display = me.role === 'supervisor' ? '' : 'none';
  }
}

function openSigPanel(idx) {
  _activeSigIdx = idx;
  const workers = st.workers.filter(function(w) { return w.name && w.name.trim(); });
  const worker  = workers[idx];
  if (!worker) return;

  const nameEl  = document.getElementById('sigWorkerName');
  const panel   = document.getElementById('activeSigPanel');
  if (nameEl) nameEl.textContent = worker.name;
  if (panel)  panel.style.display = 'block';

  setTimeout(function() {
    initSigPad('sigCanvas');
    _sigStrokes['sigCanvas'] = [];

    const saved = loadSignatureFromMem(worker.name);
    if (saved && saved.strokes) {
      redrawStrokes('sigCanvas', saved.strokes);
    }

    renderSigPanel();
  }, 50);
}

function confirmSig() {
  const canvas = document.getElementById('sigCanvas');
  if (!canvas || !canvas.classList.contains('signed')) {
    toast('Please draw a signature first');
    return;
  }

  const strokes = (_sigStrokes['sigCanvas'] || []).slice();
  const png     = canvasToPNG('sigCanvas');
  const workers = st.workers.filter(function(w) { return w.name && w.name.trim(); });
  const worker  = workers[_activeSigIdx];

  st.sigs[_activeSigIdx] = { name: worker ? worker.name : '', strokes: strokes, png: png };

  if (worker) {
    saveSignatureToMem(worker.name, strokes, png);
    sheetsSaveWorker(worker.name, worker.role);
    sheetsSaveSignature(worker.name, strokes);
  }

  cancelSig();
  renderSigPanel();
  schedSave();

  // Push strokes to sigs/{psiId} so any device can generate a complete PDF
  if (me.activePSI && typeof firebaseSavePSISigs === 'function') {
    var _sigWorker = worker ? worker.name : '';
    var _sigEntry  = {};
    _sigEntry[String(_activeSigIdx !== null ? _activeSigIdx : 0)] = {
      name: _sigWorker, strokes: strokes
    };
    firebaseSavePSISigs(me.activePSI, { workers: _sigEntry });
  }

  toast('✓ Signature saved');
}

function cancelSig() {
  _activeSigIdx = null;
  const panel = document.getElementById('activeSigPanel');
  if (panel) panel.style.display = 'none';
  clearSig('sigCanvas');
  renderSigPanel();
}


// ── SUPERVISOR SAVED SIG (Step 6) ─────────────────────────────

function loadSavedSig() {
  const nameEl = document.getElementById('supName');
  const name   = nameEl ? nameEl.value.trim() : me.name;
  if (!name) { toast('Enter supervisor name first'); return; }

  const saved = loadSignatureFromMem(name);
  if (!saved || !saved.strokes) {
    toast('No saved signature for ' + name);
    return;
  }

  clearSig('supSigCanvas');
  setTimeout(function() {
    initSigPad('supSigCanvas');
    redrawStrokes('supSigCanvas', saved.strokes);
    toast('Signature loaded');
  }, 50);
}

function loadApprovalSig() {
  const nameEl = document.getElementById('approveSupName');
  const name   = nameEl ? nameEl.value.trim() : me.name;
  if (!name) { toast('Enter supervisor name first'); return; }

  const saved = loadSignatureFromMem(name);
  if (!saved || !saved.strokes) {
    toast('No saved signature for ' + name);
    return;
  }

  clearSig('approveCanvas');
  setTimeout(function() {
    initSigPad('approveCanvas');
    redrawStrokes('approveCanvas', saved.strokes);
    toast('Signature loaded');
  }, 50);
}


// ── RENDER STROKES onto an offscreen canvas → PNG ─────────────
// Used by pdf.js to get a PNG from stored stroke data

function strokesToPNG(strokes, w, h) {
  if (!strokes || !strokes.length) return null;

  const canvas = document.createElement('canvas');
  canvas.width  = w || 400;
  canvas.height = h || 120;

  const ctx = canvas.getContext('2d');

  // White background so signature is solid black on PDF
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth   = 2.5;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';

  // Scale strokes to fill target dimensions
  let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
  strokes.forEach(function(stroke) {
    stroke.points.forEach(function(p) {
      if (p[0] < minX) minX = p[0];
      if (p[1] < minY) minY = p[1];
      if (p[0] > maxX) maxX = p[0];
      if (p[1] > maxY) maxY = p[1];
    });
  });

  const srcW  = maxX - minX || 1;
  const srcH  = maxY - minY || 1;
  // No cap at 1 — allow scale-up so strokes fill the target box
  const scale = Math.min((canvas.width - 8) / srcW, (canvas.height - 8) / srcH);
  const offX  = (canvas.width  - srcW * scale) / 2 - minX * scale;
  const offY  = (canvas.height - srcH * scale) / 2 - minY * scale;

  strokes.forEach(function(stroke) {
    if (!stroke.points || stroke.points.length < 1) return;
    ctx.beginPath();
    const p0 = stroke.points[0];
    ctx.moveTo(p0[0] * scale + offX, p0[1] * scale + offY);
    for (let i = 1; i < stroke.points.length; i++) {
      const p = stroke.points[i];
      ctx.lineTo(p[0] * scale + offX, p[1] * scale + offY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p[0] * scale + offX, p[1] * scale + offY);
    }
  });

  return canvas.toDataURL('image/png');
}


// ── QUICK INITIAL (dashboard shortcut) ────────────────────────

let _quickSignPSIId  = null;
let _quickSignBreak  = '1st'; // '1st' | 'lunch' | '2nd'
let _signAllBreaks   = false; // when true, initial is saved for all 3 breaks at once

function selectBreak(btn, breakType) {
  // If all-breaks mode is active, deactivate it first
  if (_signAllBreaks) {
    _signAllBreaks = false;
    const allBtn = document.getElementById('allBreaksBtn');
    if (allBtn) allBtn.classList.remove('active');
  }
  _quickSignBreak = breakType;
  document.querySelectorAll('.break-btn[data-break]').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
}

function toggleAllBreaks(btn) {
  _signAllBreaks = !_signAllBreaks;
  btn.classList.toggle('active', _signAllBreaks);
  if (_signAllBreaks) {
    // Deactivate individual break buttons
    document.querySelectorAll('.break-btn[data-break]').forEach(function(b) { b.classList.remove('active'); });
  } else {
    // Re-activate current break button
    document.querySelectorAll('.break-btn[data-break="' + _quickSignBreak + '"]').forEach(function(b) { b.classList.add('active'); });
  }
}

function _renderPsiWorkerChips(psi) {
  const container = document.getElementById('psiWorkerChips');
  if (!container) return;
  container.innerHTML = '';

  const workers = (psi && psi.workers) ? psi.workers.filter(function(w) { return w && w.name; }) : [];
  if (!workers.length) return;

  workers.forEach(function(w) {
    const chip = document.createElement('button');
    chip.className   = 'psi-worker-chip';
    chip.textContent = w.name;
    chip.onclick     = function() {
      // Select this chip
      container.querySelectorAll('.psi-worker-chip').forEach(function(c) { c.classList.remove('active'); });
      chip.classList.add('active');

      const nameEl = document.getElementById('quickSignName');
      if (nameEl) nameEl.value = w.name;

      // Pre-load saved initials for this person
      sheetsFetchSignature(w.name, 'initial').then(function(strokes) {
        if (strokes && strokes.length) {
          clearSig('quickSignCanvas');
          setTimeout(function() {
            initSigPad('quickSignCanvas');
            redrawStrokes('quickSignCanvas', strokes);
            toast(w.name + ' — initials pre-loaded');
          }, 50);
        } else {
          const saved = loadSignatureFromMem(w.name);
          if (saved && saved.strokes) {
            clearSig('quickSignCanvas');
            setTimeout(function() {
              initSigPad('quickSignCanvas');
              redrawStrokes('quickSignCanvas', saved.strokes);
            }, 50);
          }
        }
      });
    };
    container.appendChild(chip);
  });

  // Auto-select if only 1 worker on the PSI
  if (workers.length === 1) {
    container.querySelector('.psi-worker-chip').click();
  }
}

function openQuickSign(psiId) {
  _quickSignPSIId = psiId;
  _signAllBreaks  = false;

  const modal  = document.getElementById('quickSignModal');
  const nameEl = document.getElementById('quickSignName');
  if (!modal) return;

  // Load PSI workers and render name chips
  const psi = (typeof loadPSI === 'function') ? loadPSI(psiId) : null;
  _renderPsiWorkerChips(psi);

  // If no PSI workers, fall back to logged-in user name
  const hasPsiWorkers = psi && psi.workers && psi.workers.some(function(w) { return w && w.name; });
  if (!hasPsiWorkers && nameEl) nameEl.value = me.name || '';

  // Reset break type to 1st
  _quickSignBreak = '1st';
  document.querySelectorAll('.break-btn[data-break]').forEach(function(b) {
    b.classList.toggle('active', b.dataset.break === '1st');
  });
  const allBtn = document.getElementById('allBreaksBtn');
  if (allBtn) allBtn.classList.remove('active');

  modal.style.display = 'flex';

  setTimeout(function() {
    initSigPad('quickSignCanvas');
    _sigStrokes['quickSignCanvas'] = [];

    // Only pre-load sig if no PSI workers (chips will handle pre-load for PSI workers)
    if (!hasPsiWorkers && me.name) {
      const saved = loadSignatureFromMem(me.name);
      if (saved && saved.strokes) redrawStrokes('quickSignCanvas', saved.strokes);
    }
  }, 50);

  hideQuickSignAuto();
}

// ── QUICK SIGN AUTOCOMPLETE ───────────────────────────────────

function onQuickSignNameInput(inp) {
  const list = document.getElementById('quickSignAutoList');
  if (!list) return;

  const query   = inp.value || '';
  const matches = filterWorkers(query);

  if (!matches.length) { list.style.display = 'none'; return; }

  list.innerHTML = '';
  matches.forEach(function(w) {
    const item = document.createElement('div');
    item.className   = 'autocomplete-item';
    item.textContent = w.name;
    item.onmousedown = function(e) {
      e.preventDefault();
      inp.value = w.name;
      hideQuickSignAuto();
      // Try to pre-load initials from sheets
      sheetsFetchSignature(w.name, 'initial').then(function(strokes) {
        if (strokes && strokes.length) {
          clearSig('quickSignCanvas');
          setTimeout(function() {
            initSigPad('quickSignCanvas');
            redrawStrokes('quickSignCanvas', strokes);
            toast(w.name + ' — initials pre-loaded');
          }, 50);
        } else {
          // Fall back to full sig if no initials saved
          const saved = loadSignatureFromMem(w.name);
          if (saved && saved.strokes) {
            clearSig('quickSignCanvas');
            setTimeout(function() {
              initSigPad('quickSignCanvas');
              redrawStrokes('quickSignCanvas', saved.strokes);
            }, 50);
          }
        }
      });
    };
    list.appendChild(item);
  });
  list.style.display = 'block';
}

function hideQuickSignAuto() {
  const list = document.getElementById('quickSignAutoList');
  if (list) list.style.display = 'none';
}

function confirmQuickSign() {
  if (!_quickSignPSIId) return;

  const nameEl = document.getElementById('quickSignName');
  const name   = nameEl ? nameEl.value.trim() : me.name;
  if (!name) { toast('Enter your name first'); return; }

  const canvas = document.getElementById('quickSignCanvas');
  if (!canvas || !canvas.classList.contains('signed')) {
    toast('Please draw your signature first');
    return;
  }

  const strokes = (_sigStrokes['quickSignCanvas'] || []).slice();
  const png     = canvasToPNG('quickSignCanvas');

  // Save sig to memory for reuse
  saveSignatureToMem(name, strokes, png);

  // Determine which break types to save
  const breakTypes = _signAllBreaks ? ['1st', 'lunch', '2nd'] : [_quickSignBreak];

  // Sync to sheets (one call per break type)
  breakTypes.forEach(function(bt) {
    sheetsSaveInitials(name, bt, strokes, _quickSignPSIId);
  });

  // Load PSI and append initials
  const psi = loadPSI(_quickSignPSIId);
  if (psi) {
    if (!psi.initials) psi.initials = [];
    breakTypes.forEach(function(bt) {
      psi.initials.push({
        name:      name,
        time:      nowTime(),
        date:      todayISO(),
        breakType: bt,
        strokes:   strokes,
        png:       png,
      });
    });
    writePSI(psi);

    if (typeof maybeAutoSendPSIForReview === 'function' && maybeAutoSendPSIForReview(psi)) {
      cancelQuickSign();
      refreshDash();
      toast(userRequiresSupervisorReview()
        ? 'All workers initialed - sent for supervisor review'
        : 'All workers initialed - PSI completed');
      return;
    }

    // Push only the newly added initials to sigs/{psiId}
    // (arrayUnion in firebaseSavePSISigs accumulates entries from all devices)
    if (typeof firebaseSavePSISigs === 'function') {
      var _newInitials = breakTypes.map(function(bt) {
        return { name: name, breakType: bt, date: todayISO(),
                 time: nowTime(), strokes: strokes };
      });
      firebaseSavePSISigs(psi.id, { initials: _newInitials });
    }
  }

  cancelQuickSign();
  refreshDash();
  if (_signAllBreaks || breakTypes.length > 1) {
    toast('✓ ' + name + ' — all 3 breaks initialled');
  } else {
    const breakLabel = _quickSignBreak === '1st' ? '1st Break' : _quickSignBreak === 'lunch' ? 'Lunch' : '2nd Break';
    toast('✓ Initialled ' + breakLabel + ' — ' + name);
  }
}

function cancelQuickSign() {
  _quickSignPSIId = null;
  const modal = document.getElementById('quickSignModal');
  if (modal) modal.style.display = 'none';
  clearSig('quickSignCanvas');
}


// ── QUICK WORKER SIGN ─────────────────────────────────────────
// Fast "✍ Sign" button on dashboard cards — same idea as Quick Initial
// but saves a full worker signature to the PSI sigs collection.

let _quickWorkerSignPSIId = null;

function openQuickWorkerSign(psiId) {
  _quickWorkerSignPSIId = psiId;
  const psi    = loadPSI(psiId);
  const modal  = document.getElementById('quickWorkerSignModal');
  const nameEl = document.getElementById('quickWorkerSignName');
  if (!modal || !psi) return;

  // Show PSI worker name chips for fast selection
  const chipsEl = document.getElementById('quickWorkerChips');
  if (chipsEl) {
    chipsEl.innerHTML = '';
    const workers = (psi.workers || []).filter(function(w) { return w.name && w.name.trim(); });
    workers.forEach(function(w) {
      const chip = document.createElement('button');
      chip.className   = 'psi-worker-chip';
      chip.textContent = w.name;
      chip.onclick     = function() {
        chipsEl.querySelectorAll('.psi-worker-chip').forEach(function(c) { c.classList.remove('active'); });
        chip.classList.add('active');
        if (nameEl) nameEl.value = w.name;
        // Pre-load saved signature for this person
        const saved = loadSignatureFromMem(w.name);
        if (saved && saved.strokes && saved.strokes.length) {
          clearSig('quickWorkerSignCanvas');
          setTimeout(function() {
            initSigPad('quickWorkerSignCanvas');
            redrawStrokes('quickWorkerSignCanvas', saved.strokes);
          }, 50);
        }
      };
      chipsEl.appendChild(chip);
    });
  }

  // Pre-fill with logged-in user's name
  if (nameEl) nameEl.value = me.name || '';

  modal.style.display = 'flex';
  setTimeout(function() {
    initSigPad('quickWorkerSignCanvas');
    _sigStrokes['quickWorkerSignCanvas'] = [];
    // Pre-load saved signature for current user
    const saved = loadSignatureFromMem(me.name);
    if (saved && saved.strokes && saved.strokes.length) {
      redrawStrokes('quickWorkerSignCanvas', saved.strokes);
    }
  }, 50);
}

function confirmQuickWorkerSign() {
  if (!_quickWorkerSignPSIId) return;

  const nameEl = document.getElementById('quickWorkerSignName');
  const name   = nameEl ? nameEl.value.trim() : (me.name || '');
  if (!name) { toast('Enter your name first'); return; }

  const canvas = document.getElementById('quickWorkerSignCanvas');
  if (!canvas || !canvas.classList.contains('signed')) {
    toast('Please draw your signature first');
    return;
  }

  const strokes = (_sigStrokes['quickWorkerSignCanvas'] || []).slice();
  const png     = canvasToPNG('quickWorkerSignCanvas');

  const psi = loadPSI(_quickWorkerSignPSIId);
  if (!psi) return;

  if (!Array.isArray(psi.workers)) psi.workers = [];

  // Keep signature indices aligned to the actual PSI worker row.
  var idx = psi.workers.findIndex(function(w) {
    return w && w.name && w.name.trim().toLowerCase() === name.toLowerCase();
  });
  if (idx < 0) {
    psi.workers.push({ name: name, role: 'Worker' });
    idx = psi.workers.length - 1;
  }

  if (!psi.sigs) psi.sigs = {};
  psi.sigs[idx] = { name: name, strokes: strokes, png: png };

  saveSignatureToMem(name, strokes, png);
  writePSI(psi);

  // Push to sigs/{psiId} so all devices get it
  if (typeof firebaseSavePSISigs === 'function') {
    var entry = {};
    entry[String(idx)] = { name: name, strokes: strokes };
    firebaseSavePSISigs(psi.id, { workers: entry });
  }

  cancelQuickWorkerSign();
  if (typeof refreshDash === 'function') refreshDash();
  toast('✓ Signed — ' + name);
}

function cancelQuickWorkerSign() {
  _quickWorkerSignPSIId = null;
  const modal = document.getElementById('quickWorkerSignModal');
  if (modal) modal.style.display = 'none';
  clearSig('quickWorkerSignCanvas');
}
