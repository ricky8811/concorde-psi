/* ═══════════════════════════════════════════════════════════════
   js/rules.js — job type matching + condition rules engine
   Safety logic only. No AI involved.
═══════════════════════════════════════════════════════════════ */

// ── UNIVERSAL CONDITION RULES ─────────────────────────────────
// Applied to ALL job types when the matching condition toggle is ON.
// Template-specific conditionRules in config.js layer on top of these.

const UNIVERSAL_CONDITION_RULES = {
  outside: {
    addHazards: ['env_weather_conditions', 'env_heat_stress_cold_exposure'],
    addPPE: [],
  },
  night: {
    addHazards: ['env_lighting_levels_too_low'],
    addPPE: [],
  },
  ladder: {
    addHazards: ['wah_ladders'],
    addPPE: ['Fall Arrest'],
  },
  lift: {
    addHazards: ['wah_powered_platforms', 'wah_fall arrest systems'],
    addPPE: ['Fall Arrest'],
  },
  energized: {
    addHazards: [
      'act_working_on_near_energized_equipment',
      'act_electrica_cords_tools_condition',
      'act_equipment_tools_inspected',
    ],
    addPPE: ['Gloves', 'Safety Glasses'],
  },
  isolated: {
    addHazards: ['act_energy_Isolation'],
    addPPE: [],
  },
  publicPresent: {
    addHazards: ['acc_walkways_roadways', 'per_distractions_in_work_area'],
    addPPE: ['Safety Vest'],
  },
  vehicleTraffic: {
    addHazards: ['act_mobile_equipment_vehicle', 'acc_walkways_roadways'],
    addPPE: ['Safety Vest'],
  },
  confinedSpace: {
    addHazards: ['act_confined_space', 'env_ventilation_required', 'acc_required_permits_in_place'],
    addPPE: [],
  },
  overheadWork: {
    addHazards: ['eng_working_above_your_head', 'wah_protect_from_falling_items'],
    addPPE: [],
  },
  hotWork: {
    addHazards: ['act_welding_grinding', 'act_burn_heat_sources'],
    addPPE: ['Face Shield', 'Coveralls'],
  },
  chemicals: {
    addHazards: [
      'env_spill_potential_containment',
      'env_msds_reviewed_for_hazardous_materials',
    ],
    addPPE: [],
  },
  heavyLift: {
    addHazards: ['per_lift_too_heavy_awkward_position'],
    addPPE: [],
  },
  noisyArea: {
    addHazards: ['per_external_noise levels'],
    addPPE: ['Ear Protection'],
  },
  dustAirborne: {
    addHazards: ['act_airborne_particles'],
    addPPE: ['Respirator'],
  },
  permitRequired: {
    addHazards: ['acc_required_permits_in_place'],
    addPPE: [],
  },
  workingAlone: {
    addHazards: ['per_working_alone_communication'],
    addPPE: [],
  },
  weatherExp: {
    addHazards: ['env_weather_conditions', 'env_heat_stress_cold_exposure'],
    addPPE: [],
  },
};

// Always present regardless of job or conditions
const ALWAYS_HAZARDS = [
  'per_clear_instructions_provided',
  'per_trained_to_use_tool_and_perform_task',
];
const ALWAYS_PPE = ['Safety Boots'];


// ── JOB TYPE MATCHING ─────────────────────────────────────────
// Returns top 3 matching templates sorted by trigger-word score.
// Multi-word triggers score higher than single words.

function matchJobType(text) {
  if (!text || !text.trim()) return [];
  const lower  = text.toLowerCase();
  const scores = {};

  Object.values(BUILTIN_TEMPLATES).forEach(function(t) {
    if (!t.triggerWords || !t.triggerWords.length) return;
    let score = 0;
    t.triggerWords.forEach(function(word) {
      if (lower.includes(word.toLowerCase())) {
        score += word.split(' ').length; // multi-word = higher score
      }
    });
    if (score > 0) scores[t.code] = score;
  });

  return Object.entries(scores)
    .sort(function(a, b) { return b[1] - a[1]; })
    .slice(0, 3)
    .map(function(entry) { return BUILTIN_TEMPLATES[entry[0]]; })
    .filter(Boolean);
}


// ── CONDITION RULES ENGINE ────────────────────────────────────
// Merges template base hazards/PPE + universal condition rules
// + any template-specific overrides.
// Returns { hazards: [], ppe: [], autoAdded: [] }
// autoAdded = hazard field names that were added by conditions (for UI highlight)

function applyConditions(template, conditions) {
  const hazards  = new Set(template.selectedHazards || []);
  const ppe      = new Set(template.ppeSelected     || []);
  const autoAdded = new Set();

  // Always-on base items
  ALWAYS_HAZARDS.forEach(function(h) { hazards.add(h); });
  ALWAYS_PPE.forEach(function(p) { ppe.add(p); });

  Object.entries(conditions || {}).forEach(function(pair) {
    const condition = pair[0];
    const isActive  = pair[1];
    if (!isActive) return;

    // Universal rule
    var universal = UNIVERSAL_CONDITION_RULES[condition];
    if (universal) {
      (universal.addHazards || []).forEach(function(h) {
        if (!hazards.has(h)) autoAdded.add(h);
        hazards.add(h);
      });
      (universal.addPPE || []).forEach(function(p) { ppe.add(p); });
    }

    // Template-specific override (adds on top of universal)
    var specific = (template.conditionRules || {})[condition];
    if (specific) {
      (specific.addHazards || []).forEach(function(h) {
        if (!hazards.has(h)) autoAdded.add(h);
        hazards.add(h);
      });
      (specific.addPPE || []).forEach(function(p) { ppe.add(p); });
    }
  });

  return {
    hazards:    Array.from(hazards),
    ppe:        Array.from(ppe),
    autoAdded:  Array.from(autoAdded),
  };
}
