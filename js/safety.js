/* ═══════════════════════════════════════════════════════════════
   js/safety.js — Shared Safety Engine
   Used by both PSI and Lift Inspection modules.
   Provides: hazard lookup, PPE lookup, weather advisory,
             condition rules, deficiency detection.
═══════════════════════════════════════════════════════════════ */


// ── HAZARD LOOKUP ──────────────────────────────────────────────

function safetyGetHazardLabel(fieldName) {
  if (!window.HAZARD_MAP) return fieldName;
  for (var cat in HAZARD_MAP) {
    var items = HAZARD_MAP[cat];
    for (var i = 0; i < items.length; i++) {
      if (items[i].field === fieldName) return items[i].label;
    }
  }
  return fieldName;
}

function safetyGetPPELabel(fieldName) {
  var item = (PPE_ITEMS || []).find(function(p) { return p.field === fieldName; });
  return item ? item.label : fieldName;
}


// ── LIFT DEFICIENCY ANALYSIS ───────────────────────────────────
// Returns { noCount, noItems, naCount, okCount, total }
// Used to show a quick summary before supervisor approves.

function safetyAnalyseChecks(checks) {
  var noItems = [];
  var naCount = 0;
  var okCount = 0;

  (LIFT_CHECKS || []).forEach(function(section) {
    (section.items || []).forEach(function(item) {
      var val = checks[item.field] || 'ok';
      if (val === 'no') {
        noItems.push({ section: section.section, label: item.label, field: item.field });
      } else if (val === 'na') {
        naCount++;
      } else {
        okCount++;
      }
    });
  });

  return {
    noCount:  noItems.length,
    noItems:  noItems,
    naCount:  naCount,
    okCount:  okCount,
    total:    noItems.length + naCount + okCount,
  };
}


// ── WEATHER ADVISORY PASSTHROUGH ──────────────────────────────
// So lift.js can call SafetyEngine.getAdvisories() consistently.

var SafetyEngine = {
  getAdvisories:   function() {
    return (typeof getWeatherAdvisories === 'function') ? getWeatherAdvisories() : [];
  },
  analyseChecks:   safetyAnalyseChecks,
  hazardLabel:     safetyGetHazardLabel,
  ppeLabel:        safetyGetPPELabel,
};
