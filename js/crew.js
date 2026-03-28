/* ═══════════════════════════════════════════════════════════════
   js/crew.js — Pair Up crew generator
═══════════════════════════════════════════════════════════════ */

// ── STATE ─────────────────────────────────────────────────────
let _crew = { elec: [], mill: [], hist: [] };
let _crewLoaded = false;


// ── SHOW / HIDE PANE ──────────────────────────────────────────

function showCrewPane() {
  if (!userHasFullAccess()) { toast('Admin or supervisor access required'); return; }

  hide('dashboard');
  hide('editor');

  const pane = document.getElementById('pairUpPane');
  if (pane) pane.style.display = 'flex';

  // Set date in header
  const dateEl = document.getElementById('crewDate');
  if (dateEl) {
    const d = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    dateEl.textContent = d.getDate() + ' ' + months[d.getMonth()];
  }

  if (!_crewLoaded) {
    crewLoad();
    _crewLoaded = true;
  } else {
    crewRender('elec');
    crewRender('mill');
  }

  showCrewTab('crew');
}

function hideCrewPane() {
  const pane = document.getElementById('pairUpPane');
  if (pane) pane.style.display = 'none';

  show('dashboard');
  refreshDash();
}


// ── LOAD / SAVE ───────────────────────────────────────────────

function crewLoad() {
  _crew = loadCrew();
  crewRender('elec');
  crewRender('mill');
  updateCrewCounts();
}

function crewSave() {
  saveCrew(_crew);

  // Flash sync dot
  const dot = document.getElementById('crewSyncDot');
  if (dot) {
    dot.style.background = 'var(--yellow)';
    setTimeout(function() { dot.style.background = 'var(--green)'; }, 600);
  }
}


// ── RENDER WORKER LIST ────────────────────────────────────────

function crewRender(type) {
  const listId = type === 'elec' ? 'elecList' : 'millList';
  const list   = document.getElementById(listId);
  if (!list) return;

  const workers = _crew[type] || [];
  list.innerHTML = '';

  workers.forEach(function(w, i) {
    const row = document.createElement('div');
    row.className = 'crew-worker' + (w.checked ? ' on' : '');

    const check = document.createElement('div');
    check.className   = 'crew-check';
    check.textContent = w.checked ? '✓' : '';

    const name = document.createElement('div');
    name.className   = 'crew-name';
    name.textContent = w.name;

    const del = document.createElement('button');
    del.className   = 'crew-del-btn';
    del.textContent = '×';
    del.title       = 'Remove';
    del.onclick     = (function(t, idx) {
      return function(e) {
        e.stopPropagation();
        if (!confirm('Remove ' + _crew[t][idx].name + '?')) return;
        _crew[t].splice(idx, 1);
        crewRender(t);
        updateCrewCounts();
        crewSave();
      };
    })(type, i);

    row.appendChild(check);
    row.appendChild(name);
    row.appendChild(del);

    // Toggle checked on row click
    row.onclick = (function(t, idx) {
      return function(e) {
        if (e.target.classList.contains('crew-del-btn')) return;
        _crew[t][idx].checked = !_crew[t][idx].checked;
        crewRender(t);
        updateCrewCounts();
        crewSave();
      };
    })(type, i);

    list.appendChild(row);
  });

  updateCrewCounts();
}

function updateCrewCounts() {
  const elecOn = (_crew.elec || []).filter(function(w) { return w.checked; }).length;
  const millOn = (_crew.mill || []).filter(function(w) { return w.checked; }).length;

  const elecCount = document.getElementById('elecCount');
  const millCount = document.getElementById('millCount');

  if (elecCount) elecCount.textContent = elecOn + ' / ' + (_crew.elec || []).length;
  if (millCount) millCount.textContent = millOn + ' / ' + (_crew.mill || []).length;
}


// ── ADD WORKER ────────────────────────────────────────────────

function crewAdd(type) {
  const inputId = type === 'elec' ? 'elecIn' : 'millIn';
  const inp     = document.getElementById(inputId);
  if (!inp) return;

  const name = inp.value.trim();
  if (!name) return;

  // Prevent duplicates
  const exists = (_crew[type] || []).some(function(w) {
    return w.name.toLowerCase() === name.toLowerCase();
  });
  if (exists) { toast(name + ' is already in the list'); return; }

  _crew[type].push({ name: name, checked: true });
  inp.value = '';

  crewRender(type);
  crewSave();
}


// ── TABS ──────────────────────────────────────────────────────

function showCrewTab(tab) {
  ['crew', 'results', 'history', 'personnel'].forEach(function(t) {
    const content = document.getElementById('crewTab' + t.charAt(0).toUpperCase() + t.slice(1));
    const btn     = document.getElementById('crewTab' + (['crew','results','history','personnel'].indexOf(t) + 1));

    if (content) content.style.display = t === tab ? 'block' : 'none';
    if (btn)     btn.classList.toggle('active', t === tab);
  });

  // Hide the Generate/Reset bar on the Personnel tab — it doesn't apply
  const bar = document.getElementById('crewBottomBar');
  if (bar) bar.style.display = tab === 'personnel' ? 'none' : '';

  if (tab === 'history')   crewRenderHist();
  if (tab === 'personnel') {
    if (typeof renderPendingAccountsList === 'function') renderPendingAccountsList();
    if (typeof renderPersonnelList      === 'function') renderPersonnelList();
    if (typeof renderSupervisorSettings === 'function') renderSupervisorSettings();
  }
}


// ── GENERATE & ASSIGN ─────────────────────────────────────────

function crewGenerate() {
  const elecOn = (_crew.elec || []).filter(function(w) { return w.checked; });
  const millOn = (_crew.mill || []).filter(function(w) { return w.checked; });

  if (elecOn.length === 0) { toast('Select at least one electrician'); return; }
  if (millOn.length === 0) { toast('Select at least one millwright'); return; }

  // Shuffle both lists
  const elecShuf = shuffle(elecOn.slice());
  const millShuf = shuffle(millOn.slice());

  const teams    = [];
  const locations = ['ITB', 'DTB'];
  const maxPairs  = Math.min(elecShuf.length, millShuf.length);

  for (let i = 0; i < maxPairs; i++) {
    teams.push({
      elec: elecShuf[i].name,
      mill: millShuf[i].name,
      loc:  locations[i % 2],
    });
  }

  // Unassigned workers
  const unassigned = [];
  if (elecShuf.length > maxPairs) {
    elecShuf.slice(maxPairs).forEach(function(w) { unassigned.push(w.name + ' (E)'); });
  }
  if (millShuf.length > maxPairs) {
    millShuf.slice(maxPairs).forEach(function(w) { unassigned.push(w.name + ' (M)'); });
  }

  // Render results
  const resultsEl = document.getElementById('crewResults');
  if (resultsEl) {
    resultsEl.innerHTML = '';

    teams.forEach(function(team, i) {
      const card = document.createElement('div');
      card.className = 'team-card';

      const locEl = document.createElement('div');
      locEl.className   = 'team-loc';
      locEl.textContent = team.loc;

      const label = document.createElement('div');
      label.className   = 'team-label';
      label.textContent = 'Team ' + (i + 1);

      const elecRow = document.createElement('div');
      elecRow.className = 'team-member';

      const elecAv = document.createElement('div');
      elecAv.className   = 'team-av';
      elecAv.textContent = initials(team.elec);

      const elecName = document.createElement('div');
      elecName.className   = 'team-member-name';
      elecName.textContent = team.elec;

      const elecRole = document.createElement('div');
      elecRole.className   = 'team-member-role';
      elecRole.textContent = 'Electrician';

      elecRow.appendChild(elecAv);
      elecRow.appendChild(elecName);
      elecRow.appendChild(elecRole);

      const millRow = document.createElement('div');
      millRow.className = 'team-member';

      const millAv = document.createElement('div');
      millAv.className   = 'team-av mill';
      millAv.textContent = initials(team.mill);

      const millName = document.createElement('div');
      millName.className   = 'team-member-name';
      millName.textContent = team.mill;

      const millRole = document.createElement('div');
      millRole.className   = 'team-member-role';
      millRole.textContent = 'Millwright';

      millRow.appendChild(millAv);
      millRow.appendChild(millName);
      millRow.appendChild(millRole);

      card.appendChild(locEl);
      card.appendChild(label);
      card.appendChild(elecRow);
      card.appendChild(millRow);
      resultsEl.appendChild(card);
    });

    // Unassigned section
    if (unassigned.length > 0) {
      const uCard = document.createElement('div');
      uCard.className = 'team-card';
      uCard.style.borderLeftColor = 'var(--text3)';

      const uLabel = document.createElement('div');
      uLabel.className   = 'team-label';
      uLabel.textContent = 'Unassigned';

      uCard.appendChild(uLabel);

      unassigned.forEach(function(name) {
        const row = document.createElement('div');
        row.className   = 'team-member';
        row.style.color = 'var(--text3)';
        row.textContent = name;
        uCard.appendChild(row);
      });

      resultsEl.appendChild(uCard);
    }
  }

  // Store last result for saving
  _crew._lastResult = { teams: teams, unassigned: unassigned, ts: Date.now() };

  // Show save button
  const saveBtn = document.getElementById('crewSaveBtn');
  if (saveBtn) saveBtn.style.display = 'block';

  showCrewTab('results');
}


// ── SAVE SHIFT TO HISTORY ─────────────────────────────────────

function crewSaveShift() {
  if (!_crew._lastResult) return;

  if (!_crew.hist) _crew.hist = [];
  _crew.hist.unshift({
    ts:         _crew._lastResult.ts,
    teams:      _crew._lastResult.teams,
    unassigned: _crew._lastResult.unassigned,
  });

  // Keep last 20 shifts
  if (_crew.hist.length > 20) _crew.hist = _crew.hist.slice(0, 20);

  crewSave();
  toast('✓ Shift saved to history');

  // Hide save button
  const saveBtn = document.getElementById('crewSaveBtn');
  if (saveBtn) saveBtn.style.display = 'none';
}


// ── RENDER HISTORY ────────────────────────────────────────────

function crewRenderHist() {
  const list = document.getElementById('crewHistList');
  if (!list) return;

  const hist = _crew.hist || [];
  if (hist.length === 0) {
    list.innerHTML = '<div class="empty"><div class="empty-icon">🕐</div>' +
      '<div class="empty-title">No history yet</div>' +
      '<div class="empty-sub">Generate and save a shift to see it here.</div></div>';
    return;
  }

  list.innerHTML = '';

  hist.forEach(function(record, i) {
    const card = document.createElement('div');
    card.className = 'hist-card';

    const del = document.createElement('button');
    del.className   = 'hist-del';
    del.textContent = 'Delete';
    del.onclick     = (function(idx) {
      return function() {
        if (!confirm('Delete this shift record?')) return;
        _crew.hist.splice(idx, 1);
        crewSave();
        crewRenderHist();
      };
    })(i);

    const dateEl = document.createElement('div');
    dateEl.className   = 'hist-date';
    dateEl.textContent = fmtDate(record.ts);
    dateEl.appendChild(del);

    card.appendChild(dateEl);

    (record.teams || []).forEach(function(team) {
      const row = document.createElement('div');
      row.className = 'team-member';
      row.style.padding = '4px 0';

      const locBadge = document.createElement('span');
      locBadge.style.cssText = 'font-family:var(--fm);font-size:9px;color:var(--accent);' +
        'font-weight:700;margin-right:8px;letter-spacing:1px;';
      locBadge.textContent = team.loc;

      row.appendChild(locBadge);
      row.appendChild(document.createTextNode(team.elec + ' + ' + team.mill));
      card.appendChild(row);
    });

    if (record.unassigned && record.unassigned.length > 0) {
      const uRow = document.createElement('div');
      uRow.style.cssText = 'font-size:11px;color:var(--text3);margin-top:4px;';
      uRow.textContent   = 'Unassigned: ' + record.unassigned.join(', ');
      card.appendChild(uRow);
    }

    list.appendChild(card);
  });
}


// ── RESET TO DEFAULTS ─────────────────────────────────────────

function crewReset() {
  if (!confirm('Reset crew to default list? Custom names will be lost.')) return;

  _crew.elec = DEFAULT_CREW.elec.map(function(n) { return { name: n, checked: true }; });
  _crew.mill = DEFAULT_CREW.mill.map(function(n) { return { name: n, checked: true }; });

  crewRender('elec');
  crewRender('mill');
  crewSave();
  showCrewTab('crew');
  toast('Crew reset to default');
}


// ── SHUFFLE HELPER ────────────────────────────────────────────

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}
