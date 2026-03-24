/* ═══════════════════════════════════════════════════════════════
   js/shifts.js — SHIFT 1 rotation schedule
   Pattern : 2 Day → 2 Night → 4 Off  (8-day cycle)
   Hours   : Day  = 06:00–18:00
             Night = 18:00–06:00
   Anchor  : 2026-03-20 = first Day-1 of this cycle
═══════════════════════════════════════════════════════════════ */

const SHIFT_CYCLE = [
  { type: 'day',   label: 'Day 1',   startH: 6,  endH: 18 },
  { type: 'day',   label: 'Day 2',   startH: 6,  endH: 18 },
  { type: 'night', label: 'Night 1', startH: 18, endH: 6  },
  { type: 'night', label: 'Night 2', startH: 18, endH: 6  },
  { type: 'off',   label: 'Day Off', startH: 0,  endH: 0  },
  { type: 'off',   label: 'Day Off', startH: 0,  endH: 0  },
  { type: 'off',   label: 'Day Off', startH: 0,  endH: 0  },
  { type: 'off',   label: 'Day Off', startH: 0,  endH: 0  },
];

// The calendar date of position 0 (Day 1) in the known cycle
const SHIFT_ANCHOR = '2026-03-20';
const SHIFT_GROUP  = 'SHIFT 1';


// ── CORE: get shift info for any JS Date ──────────────────────

function getShiftInfo(date) {
  var now = date || new Date();
  var h   = now.getHours();

  // Night shifts cross midnight — hours 00:00–05:59 belong to
  // the PREVIOUS calendar day's night shift slot.
  var calDay = new Date(now);
  if (h < 6) calDay.setDate(calDay.getDate() - 1);
  calDay.setHours(0, 0, 0, 0);

  // How many calendar days since the anchor?
  var anchor   = new Date(SHIFT_ANCHOR + 'T00:00:00');
  var diffDays = Math.round((calDay - anchor) / 86400000);
  var cycleLen = SHIFT_CYCLE.length;
  var pos      = ((diffDays % cycleLen) + cycleLen) % cycleLen;
  var entry    = SHIFT_CYCLE[pos];

  // Build precise start / end Date objects
  var shiftStart = null;
  var shiftEnd   = null;

  if (entry.type === 'day') {
    shiftStart = new Date(calDay); shiftStart.setHours(entry.startH, 0, 0, 0);
    shiftEnd   = new Date(calDay); shiftEnd.setHours(entry.endH,   0, 0, 0);
  } else if (entry.type === 'night') {
    shiftStart = new Date(calDay); shiftStart.setHours(entry.startH, 0, 0, 0);
    shiftEnd   = new Date(calDay);
    shiftEnd.setDate(shiftEnd.getDate() + 1);
    shiftEnd.setHours(entry.endH, 0, 0, 0);
  }

  // Is the current moment actually within this shift window?
  var active = false;
  if (entry.type === 'day'   && h >= 6  && h < 18) active = true;
  if (entry.type === 'night' && (h >= 18 || h < 6)) active = true;

  return {
    groupName:  SHIFT_GROUP,
    type:       entry.type,
    label:      entry.label,
    start:      shiftStart,
    end:        shiftEnd,
    active:     active,
    pos:        pos,
  };
}


// ── NEXT SHIFT (for "next shift" display on days off) ─────────

function getNextShift(fromDate) {
  var d = new Date(fromDate || new Date());
  // Walk forward up to 10 days to find next working shift
  for (var i = 1; i <= 10; i++) {
    d.setDate(d.getDate() + 1);
    var info = getShiftInfo(d);
    if (info.type !== 'off') return info;
  }
  return null;
}


// ── FORMATTED HEADER STRING ───────────────────────────────────

function formatShiftStatus() {
  var info = getShiftInfo();

  if (info.type === 'off') {
    var next = getNextShift();
    if (next && next.start) {
      var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var d = next.start;
      var dateStr = days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()];
      return SHIFT_GROUP + ' · Off · Next: ' + next.label + ' ' + dateStr;
    }
    return SHIFT_GROUP + ' · Day Off';
  }

  var s = info.start ? _fmt(info.start) : '';
  var e = info.end   ? _fmt(info.end)   : '';
  return SHIFT_GROUP + ' · ' + info.label + ' · ' + s + '–' + e;
}

function _fmt(d) {
  return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
}


// ── AUTO DETECT shift type when starting a PSI ────────────────
// Returns 'day', 'night', or 'off'
function currentShiftType() {
  return getShiftInfo().type;
}
