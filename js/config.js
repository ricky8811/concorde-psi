/* ═══════════════════════════════════════════════════════════════
   js/config.js — constants, field maps, job templates
═══════════════════════════════════════════════════════════════ */

// ── PINs ──────────────────────────────────────────────────────
const WORKER_PIN     = '6789';
const SUPERVISOR_PIN = '5744';

// ── STORAGE KEYS ──────────────────────────────────────────────
const IDX_KEY   = 'concorde_psi_index';
const MEM_KEY   = 'concorde_psi_mem';
const SESS_KEY  = 'psi_session';
const SHIFT_KEY = 'psi_shift_start';
const CREW_KEY      = 'concorde_crew';
const LIFT_KEY      = 'concorde_lift';
const LIFT_HIST_KEY = 'concorde_lift_hist';
const LEARN_KEY     = 'concorde_learned';
const PERSONNEL_KEY      = 'concorde_personnel';
const SUPERVISOR_CFG_KEY = 'concorde_supervisor_cfg';

// ── DEFAULT SUPERVISOR ─────────────────────────────────────────
const DEFAULT_SUPERVISOR_NAME = 'Richard Hendrickson';

// ── PDF SIGNATURE POSITIONS (PDF points, pdf-lib native origin bottom-left) ──
const SIG_RECTS = {
  worker_1:   { x: 274.7, y: 186.2, w: 169.6, h: 13.8 },
  worker_2:   { x: 275.3, y: 174.1, w: 173.4, h: 13.3 },
  worker_3:   { x: 276.1, y: 161.9, w: 173.8, h: 13.0 },
  worker_4:   { x: 275.7, y: 149.0, w: 171.0, h: 12.9 },
  supervisor: { x: 377.7, y: 127.4, w: 150.0, h: 22.0 },
};

// ── BREAK INITIAL CELL POSITIONS (pdf-lib native bottom-left) ─
const BREAK_RECTS = {
  '1st': [
    { x: 453, y: 186.2, w: 42, h: 13.8 },
    { x: 453, y: 174.1, w: 42, h: 13.3 },
    { x: 453, y: 161.9, w: 42, h: 13.0 },
    { x: 453, y: 149.0, w: 42, h: 12.9 },
  ],
  'lunch': [
    { x: 508, y: 186.2, w: 40, h: 13.8 },
    { x: 508, y: 174.1, w: 40, h: 13.3 },
    { x: 508, y: 161.9, w: 40, h: 13.0 },
    { x: 508, y: 149.0, w: 40, h: 12.9 },
  ],
  '2nd': [
    { x: 561, y: 186.2, w: 40, h: 13.8 },
    { x: 561, y: 174.1, w: 40, h: 13.3 },
    { x: 561, y: 161.9, w: 40, h: 13.0 },
    { x: 561, y: 149.0, w: 40, h: 12.9 },
  ],
};

// ── PDF TEXT FIELD NAMES (exact match to Concorde PSI form) ───
const PDF_FIELDS = {
  date:        'date',
  time:        'time',
  jobNumber:   'job_number',
  taskDesc:    'task_description',
  taskLoc:     'task_location',
  musterPoint: 'muster_meeting_point',
  supName:     'supervisor_name',
  worker1:     'worker_print_name_1',
  worker2:     'worker_print_name_2',
  worker3:     'worker_print_name_3',
  worker4:     'worker_print_name_4',
  taskSteps:   'task_steps',
};

// ── PPE MAP (display label → PDF checkbox field name) ─────────
const PPE_ITEMS = [
  { label: 'Safety Glasses', icon: '🥽', field: 'ppe_goggles_fectoggles_spoggles' },
  { label: 'Face Shield',    icon: '🛡️', field: 'ppe_face_shield' },
  { label: 'Gloves',         icon: '🧤', field: 'ppe_gloves_kevlar_or_leather)' },
  { label: 'Coveralls',      icon: '🦺', field: 'ppe_covverall_fire_retardant' },
  { label: 'Ear Protection', icon: '🎧', field: 'ppe_hearing_protection' },
  { label: 'Respirator',     icon: '😷', field: 'ppe_respirator' },
  { label: 'Fall Arrest',    icon: '⛓️', field: 'ppe_harness_lanyard' },
  { label: 'Safety Vest',    icon: '🦺', field: 'ppe_reflective_vest' },
  { label: 'Safety Boots',   icon: '👢', field: 'ppe_footwear_condition_application' },
];

// ── HAZARD CATEGORIES ─────────────────────────────────────────
// Each entry: [display label, PDF checkbox field name]
const HAZARD_MAP = {
  env: {
    label: '🌧 Environmental',
    items: [
      ['Spill / Containment',         'env_spill_potential_containment'],
      ['HazMat / TDG Storage',        'env_hazmat_tdg_storage'],
      ['Weather Conditions',          'env_weather_conditions'],
      ['MSDS / Hazardous Materials',  'env_msds_reviewed_for_hazardous_materials'],
      ['Ventilation Required',        'env_ventilation_required'],
      ['Heat Stress / Cold Exposure', 'env_heat_stress_cold_exposure'],
      ['Low Lighting',                'env_lighting_levels_too_low'],
      ['Housekeeping',                'env_housekeeping'],
      ['Tight Work Area',             'env_working_in_a_tight_area'],
    ],
  },
  ergo: {
    label: '💪 Ergonomic',
    items: [
      ['Body in Line of Fire',  'eng_parts_of_body_in_line_of_fire'],
      ['Working Overhead',      'eng_working_above_your_head'],
      ['Pinch Points',          'eng_pinch_points_identified'],
      ['Repetitive Motion',     'eng_repetitive_motion'],
    ],
  },
  height: {
    label: '⬆️ Working at Height',
    items: [
      ['Barricades / Flagging',      'wah_barricades_flagging_and_signs_in_place'],
      ['Hole Coverings',             'wah_hole_covering_in_place'],
      ['Protect from Falling Items', 'wah_protect_from_falling_items'],
      ['Powered Platforms / MEWP',   'wah_powered_platforms'],
      ['Others Working Overhead',    'wah_others working overhead/below'],
      ['Fall Arrest Systems',        'wah_fall arrest systems'],
      ['Ladders',                    'wah_ladders'],
    ],
  },
  activity: {
    label: '⚙️ Activity',
    items: [
      ['Welding / Grinding',          'act_welding_grinding'],
      ['Burn / Heat Sources',         'act_burn_heat_sources'],
      ['Compressed Gases',            'act_compressed_gasses'],
      ['Energized Equipment',         'act_working_on_near_energized_equipment'],
      ['Electrical Cords / Tools',    'act_electrica_cords_tools_condition'],
      ['Equipment Inspected',         'act_equipment_tools_inspected'],
      ['Critical Lift Meeting',       'act_critical_lift_meeting_required'],
      ['Energy Isolation / LOTO',     'act_energy_Isolation'],
      ['Airborne Particles',          'act_airborne_particles'],
      ['Open Holes / Leading Edges',  'act_open_holes_leading_edges'],
      ['Mobile Equipment / Vehicles', 'act_mobile_equipment_vehicle'],
      ['Rigging',                     'act_rigging'],
      ['Excavation / Underground',    'act_excavation_underground_work'],
      ['Confined Space',              'act_confined_space'],
    ],
  },
  access: {
    label: '🚧 Access',
    items: [
      ['Scaffold Inspected & Tagged', 'acc_scaffold_inspected_and_tagged'],
      ['Slip / Trip Potential',       'acc_slip_trip_potential_identified'],
      ['Permits in Place',            'acc_required_permits_in_place'],
      ['Excavations',                 'acc_excavations'],
      ['Walkways / Roadways',         'acc_walkways_roadways'],
    ],
  },
  personal: {
    label: '👤 Personal Safety',
    items: [
      ['Clear Instructions Given', 'per_clear_instructions_provided'],
      ['Trained for Task',         'per_trained_to_use_tool_and_perform_task'],
      ['Distractions in Area',     'per_distractions_in_work_area'],
      ['Working Alone / Comms',    'per_working_alone_communication'],
      ['Heavy / Awkward Lift',     'per_lift_too_heavy_awkward_position'],
      ['Excessive Noise',          'per_external_noise levels'],
      ['Physical Limitations',     'per_phusical_limitations'],
      ['First Aid Requirements',   'per_first_aid_requirements'],
    ],
  },
};

// ── LIFT INSPECTION CHECKS ────────────────────────────────────
// Field names match exact PDF radio group names in MEWP_PreUse_Inspection_NAMED_v3
const LIFT_CHECKS = [
  {
    section: 'General',
    items: [
      { label: 'PPE',                                 field: 'GEN_PPE' },
      { label: 'Decals / Signs / Inspection Notices', field: 'GEN_Decals_Signs_Inspection_Notices' },
      { label: "Manufacturer's Operating Manual",     field: 'GEN_Manufacturers_Operating_Manual' },
      { label: 'Housekeeping',                        field: 'GEN_Housekeeping' },
    ],
  },
  {
    section: 'Work Site Assessment',
    items: [
      { label: 'Drop-offs / Holes',                   field: 'WS_Drop_Offs_Holes' },
      { label: 'Bumps / Ground Obstructions',         field: 'WS_Bumps_Ground_Obstructions' },
      { label: 'Debris / Slippery Ground',            field: 'WS_Debris_Slippery_Ground' },
      { label: 'Overhead Obstructions',               field: 'WS_Overhead_Obstructions' },
      { label: 'Electrical Conductors',               field: 'WS_Electrical_Conductors' },
      { label: 'Hazardous Locations',                 field: 'WS_Hazardous_Locations' },
      { label: 'Slopes',                              field: 'WS_Slopes' },
      { label: 'Ground Surface / Support Conditions', field: 'WS_Ground_Surface_Support_Conditions' },
      { label: 'Pedestrians / Vehicle Traffic',       field: 'WS_Pedestrians_Vehicle_Traffic' },
      { label: 'Weather Conditions',                  field: 'WS_Weather_Conditions' },
      { label: 'Other Possible Hazards',              field: 'WS_Other_Possible_Hazards' },
    ],
  },
  {
    section: 'Power-Off Checks',
    items: [
      { label: 'Engine / Battery',                    field: 'PO_Engine_Battery' },
      { label: 'Cover / Panel',                       field: 'PO_Cover_Panel' },
      { label: 'Debris',                              field: 'PO_Debris' },
      { label: 'Lights / Strobes',                    field: 'PO_Lights_Strobes' },
      { label: 'Mirrors / Visibility Aids',           field: 'PO_Mirrors_Visibility_Aids' },
      { label: 'Wheels / Tires',                      field: 'PO_Wheels_Tires' },
      { label: 'Belts / Hoses',                       field: 'PO_Belts_Hoses' },
      { label: 'Air Filter Indicator',                field: 'PO_Air_Filter_Indicator' },
      { label: 'Wires / Cables / Terminals',          field: 'PO_Wires_Cables_Terminals' },
      { label: 'Battery Clean / Dry / Secure',        field: 'PO_Battery_Clean_Dry_Secure' },
      { label: 'Engine Oil',                          field: 'PO_Engine_Oil' },
      { label: 'Engine Coolant',                      field: 'PO_Engine_Coolant' },
      { label: 'Hydraulic Oil',                       field: 'PO_Hydraulic_Oil' },
      { label: 'Transmission Oil',                    field: 'PO_Transmission_Oil' },
      { label: 'Fuel / Battery',                      field: 'PO_Fuel_Battery' },
      { label: 'Cylinders / Rods / Pin Locks',        field: 'PO_Cylinders_Rods_Pin_Locks' },
      { label: 'Hoses / Lines / Fittings',            field: 'PO_Hoses_Lines_Fittings' },
      { label: 'Capacity Plate / Load Charts',        field: 'PO_Capacity_Plate_Load_Charts' },
      { label: 'Counterweight / Bolts',               field: 'PO_Counterweight_Bolts' },
      { label: 'Windows / Screens / Doors',           field: 'PO_Windows_Screens_Doors' },
      { label: 'Boom / Lift Arm Structure',           field: 'PO_Boom_Lift_Arm_Structure' },
      { label: 'Work Platform / Guard Rails',         field: 'PO_Work_Platform_Guard_Rails' },
      { label: 'Safety Prop',                         field: 'PO_Safety_Prop' },
      { label: 'Power Track',                         field: 'PO_Power_Track' },
      { label: 'Fire Extinguisher',                   field: 'PO_Fire_Extinguisher' },
    ],
  },
  {
    section: 'Power-On Checks',
    items: [
      { label: 'Starts / Runs Properly',              field: 'PON_Starts_Runs_Properly' },
      { label: 'Warning Indicators',                  field: 'PON_Warning_Indicators' },
      { label: 'Fuel / Charge Level',                 field: 'PON_Fuel_Charge_Level' },
      { label: 'Horn / Visual Warning Devices',       field: 'PON_Horn_Visual_Warning_Devices' },
    ],
  },
  {
    section: 'Function Checks',
    items: [
      { label: 'Seatbelts',                           field: 'FC_Seatbelts' },
      { label: 'Emergency / Auxiliary Controls',      field: 'FC_Emergency_Auxilary_Controls' },
      { label: 'Function Enable / Deadman Devices',   field: 'FC_Function_Enable_Deadman_Devices' },
      { label: 'Drive',                               field: 'FC_Drive' },
      { label: 'Steering',                            field: 'FC_Steering' },
      { label: 'Braking',                             field: 'FC_Braking' },
      { label: 'Mast / Carriage',                     field: 'FC_Mast_Carriage' },
      { label: 'Work Platform',                       field: 'FC_Work_Platform' },
      { label: 'Slewing / Turret Rotate',             field: 'FC_Slewing_Turret_Rotate' },
      { label: 'Boom / Lift Arm',                     field: 'FC_Boom_Lift_Arm' },
      { label: 'Accessories / Optional Equipment',    field: 'FC_Accessories_Optional_Equipment' },
    ],
  },
];

// ── DEFAULT CREW ──────────────────────────────────────────────
const DEFAULT_CREW = {
  elec: ['Shane', 'Chris', 'Dave'],
  mill: ['Mike', 'Walker'],
};

// ── BUILT-IN JOB TEMPLATES ────────────────────────────────────
const BUILTIN_TEMPLATES = {
  'BRG-DAILY': {
    code: 'BRG-DAILY', name: 'Daily Bridge Inspection',
    desc: 'Daily operational check of all airport bridges',
    taskDesc: 'Daily bridge inspection and operational check',
    taskLoc: 'Airport Bridges', jobNumber: '', musterPoint: 'High Gate',
    triggerWords: ['bridge', 'pbb', 'bridge daily', 'daily bridge', 'bridge check', 'pbb check', 'walk bridge', 'bridge walk'],
    selectedHazards: ['env_weather_conditions', 'act_mobile_equipment_vehicle', 'acc_slip_trip_potential_identified'],
    taskRows: [
      ['Inspect bridge structure', 'Structural failure', 'Visual check + report defects'],
      ['Test all controls', 'Equipment failure', 'Pre-use inspection checklist'],
    ],
    ppeSelected: ['Safety Vest', 'Safety Boots'],
  },
  'BRG-CALL': {
    code: 'BRG-CALL', name: 'Bridge Call-Out',
    desc: 'Emergency response to bridge fault or failure',
    taskDesc: 'Emergency bridge call-out and repair',
    taskLoc: 'Airport Bridges', jobNumber: '', musterPoint: 'High Gate',
    triggerWords: ['bridge', 'pbb', 'bridge call', 'bridge fault', 'bridge callout', 'bridge emergency', 'pbb fault', 'pbb call'],
    selectedHazards: ['env_weather_conditions', 'act_working_on_near_energized_equipment', 'act_energy_Isolation'],
    taskRows: [
      ['Assess bridge fault on arrival', 'Energized components', 'Isolate power before work'],
      ['Repair or replace component', 'Pinch points', 'LOTO applied, area clear'],
    ],
    ppeSelected: ['Safety Vest', 'Safety Boots', 'Gloves'],
  },
  'BRG-WKLY': {
    code: 'BRG-WKLY', name: 'Weekly Bridge Inspection',
    desc: 'Comprehensive weekly structural and mechanical inspection',
    taskDesc: 'Weekly comprehensive bridge inspection',
    taskLoc: 'Airport Bridges', jobNumber: '', musterPoint: 'High Gate',
    triggerWords: ['bridge', 'pbb', 'weekly bridge', 'bridge weekly', 'bridge inspection', 'pbb inspection', 'bridge insp'],
    selectedHazards: ['env_weather_conditions', 'act_mobile_equipment_vehicle', 'eng_repetitive_motion', 'acc_slip_trip_potential_identified'],
    taskRows: [
      ['Full structural inspection', 'Trip hazards', 'Maintain 3-point contact'],
      ['Lubrication check', 'Pinch points', 'Lock out before servicing'],
    ],
    ppeSelected: ['Safety Vest', 'Safety Boots'],
  },
  'BRG-SEMI': {
    code: 'BRG-SEMI', name: 'Semi-Annual Bridge Inspection',
    desc: 'Comprehensive semi-annual bridge structural, mechanical, and electrical inspection',
    taskDesc: 'Semi-annual bridge inspection — full structural, mechanical, and electrical assessment',
    taskLoc: 'Airport Bridges', jobNumber: '', musterPoint: 'High Gate',
    triggerWords: ['bridge', 'pbb', 'semi annual bridge', 'semi-annual bridge', 'biannual bridge', 'annual bridge', '6 month bridge', 'bridge semi'],
    selectedHazards: ['env_weather_conditions', 'act_mobile_equipment_vehicle', 'eng_repetitive_motion', 'acc_slip_trip_potential_identified', 'eng_working_above_your_head'],
    taskRows: [
      ['Walk full bridge structure', 'Slip/trip', '3-point contact, slow pace'],
      ['Inspect mechanical components', 'Pinch points', 'Hands clear before operating'],
      ['Inspect electrical systems', 'Electrical exposure', 'LOTO if work required'],
      ['Test all safety devices', 'System failure', 'Document all findings'],
    ],
    ppeSelected: ['Safety Vest', 'Safety Boots', 'Safety Glasses'],
  },
  'BRG-REPAIR': {
    code: 'BRG-REPAIR', name: 'Bridge Repair',
    desc: 'Bridge mechanical or electrical component repair',
    taskDesc: 'Bridge component repair — isolate, remove, replace, test',
    taskLoc: 'Airport Bridges', jobNumber: '', musterPoint: 'High Gate',
    triggerWords: ['bridge', 'pbb', 'bridge repair', 'fix bridge', 'bridge fix', 'pbb repair', 'bridge component', 'bridge mechanical'],
    selectedHazards: ['act_working_on_near_energized_equipment', 'act_energy_Isolation', 'eng_pinch_points_identified', 'eng_working_above_your_head', 'acc_slip_trip_potential_identified'],
    taskRows: [
      ['Isolate bridge from service', 'Energized components', 'LOTO all energy sources'],
      ['Remove and replace defective part', 'Pinch points / height', 'Area blocked, harness if elevated'],
      ['Test operation before return to service', 'Equipment failure', 'Function test all systems'],
    ],
    ppeSelected: ['Safety Vest', 'Safety Boots', 'Gloves', 'Safety Glasses'],
  },
  'BRG-HYD': {
    code: 'BRG-HYD', name: 'Bridge Hydraulics',
    desc: 'Bridge hydraulic system service and repair',
    taskDesc: 'Bridge hydraulic system service and repair',
    taskLoc: 'Airport Bridges', jobNumber: '', musterPoint: 'High Gate',
    triggerWords: ['bridge', 'pbb', 'bridge hydraulic', 'hydraulic bridge', 'pbb hydraulic', 'bridge hydro', 'bridge hyd', 'hydraulic system bridge'],
    selectedHazards: ['act_working_on_near_energized_equipment', 'act_energy_Isolation', 'eng_pinch_points_identified', 'env_spill_potential_containment'],
    taskRows: [
      ['Depressurise hydraulic system', 'Stored pressure', 'Bleed before opening any lines'],
      ['Inspect / replace components', 'Crush injury', 'Block bridge before work'],
      ['Clean up and test', 'Spill hazard', 'Containment tray in place'],
    ],
    ppeSelected: ['Safety Vest', 'Safety Boots', 'Gloves', 'Safety Glasses'],
  },
  'GPU-REPAIR': {
    code: 'GPU-REPAIR', name: 'GPU / Ground Power Repair',
    desc: 'Ground power unit repair or cable and plug replacement',
    taskDesc: 'GPU repair or cable/plug replacement',
    taskLoc: 'Apron / Gate', jobNumber: '', musterPoint: 'High Gate',
    triggerWords: ['gpu', '28v', 'ground power', 'gpu repair', 'gpu cable', 'power cable', 'gpu plug', 'ground power unit'],
    selectedHazards: ['act_working_on_near_energized_equipment', 'act_mobile_equipment_vehicle', 'per_lift_too_heavy_awkward_position'],
    taskRows: [
      ['Verify GPU is powered off', 'Electrical shock', 'Confirm power off before touching'],
      ['Inspect and replace damaged components', 'Heavy cable — manual handling', 'Team lift on heavy cables'],
      ['Test output voltage before use', 'Incorrect output — damage to aircraft', 'Verify voltage spec before connecting'],
    ],
    ppeSelected: ['Safety Vest', 'Safety Boots', 'Gloves'],
  },
  'LGT-IN-MIX': {
    code: 'LGT-IN-MIX', name: 'Interior Lighting - Mixed',
    desc: 'Interior fixture replacement using mixed methods',
    taskDesc: 'Interior lighting replacement and maintenance',
    taskLoc: 'Terminal / ITB', jobNumber: '', musterPoint: 'Electrical Room',
    triggerWords: ['light', 'lighting', 'lamp', 'interior light', 'interior lighting', 'relamp', 'lamp replacement', 'fixture replacement', 'light fixture', 'interior fixture', 'inside light'],
    selectedHazards: ['act_working_on_near_energized_equipment', 'act_energy_Isolation', 'eng_working_above_your_head'],
    taskRows: [
      ['Isolate power circuit', 'Electrical shock', 'LOTO procedure'],
      ['Replace lighting fixture', 'Working at height', 'Approved ladder or lift'],
    ],
    ppeSelected: ['Safety Glasses', 'Safety Vest', 'Safety Boots', 'Gloves'],
  },
  'LGT-IN-LAD': {
    code: 'LGT-IN-LAD', name: 'Interior Lighting - Ladder',
    desc: 'Interior lighting work from a ladder',
    taskDesc: 'Interior lighting work using ladder',
    taskLoc: 'Terminal / ITB', jobNumber: '', musterPoint: 'Electrical Room',
    triggerWords: ['light', 'lighting', 'lamp', 'interior light ladder', 'light ladder', 'lamp ladder', 'relamp ladder', 'fixture ladder', 'ladder light'],
    selectedHazards: ['act_working_on_near_energized_equipment', 'wah_ladders', 'eng_working_above_your_head'],
    taskRows: [
      ['Set up ladder safely', 'Fall from height', '3-point contact, spotter in place'],
      ['Replace fixture', 'Electrical shock', 'Power isolated before work'],
    ],
    ppeSelected: ['Safety Glasses', 'Safety Vest', 'Safety Boots'],
  },
  'LGT-EX-LFT': {
    code: 'LGT-EX-LFT', name: 'Exterior Lighting - Lift',
    desc: 'Exterior lighting maintenance using MEWP',
    taskDesc: 'Exterior lighting maintenance using MEWP',
    taskLoc: 'Apron / Exterior', jobNumber: '', musterPoint: 'High Gate',
    triggerWords: ['light', 'lighting', 'lamp', 'exterior light lift', 'outside light lift', 'exterior lighting mewp', 'apron light', 'roadway light lift', 'pole light lift', 'parking lot light'],
    selectedHazards: ['env_weather_conditions', 'wah_powered_platforms', 'wah_fall arrest systems', 'act_mobile_equipment_vehicle'],
    taskRows: [
      ['MEWP pre-use inspection', 'Equipment failure', 'Check before use — do not use if defect found'],
      ['Position MEWP at worksite', 'Vehicle strike', 'Spotter + exclusion zone established'],
      ['Replace exterior light', 'Fall from height', 'Harness attached and clipped at all times'],
    ],
    ppeSelected: ['Safety Glasses', 'Safety Vest', 'Safety Boots', 'Fall Arrest'],
  },
  'LGT-EX-LAD': {
    code: 'LGT-EX-LAD', name: 'Exterior Lighting - Ladder',
    desc: 'Exterior lighting maintenance from a ladder',
    taskDesc: 'Exterior lighting maintenance using ladder',
    taskLoc: 'Apron / Exterior', jobNumber: '', musterPoint: 'High Gate',
    triggerWords: ['light', 'lighting', 'lamp', 'exterior light ladder', 'outside light ladder', 'roadway light ladder', 'pole light ladder'],
    selectedHazards: ['env_weather_conditions', 'wah_ladders', 'act_working_on_near_energized_equipment'],
    taskRows: [
      ['Inspect and set up ladder', 'Fall or tip', 'Secure base, maintain 3-point contact'],
      ['Replace exterior fixture', 'Energized parts', 'Isolate circuit first'],
    ],
    ppeSelected: ['Safety Glasses', 'Safety Vest', 'Safety Boots'],
  },
  'LGT-STA-LFT': {
    code: 'LGT-STA-LFT', name: 'Static Lighting - Lift',
    desc: 'Static lighting replacement using a lift platform',
    taskDesc: 'Static lighting replacement using lift',
    taskLoc: 'Terminal / DTB', jobNumber: '', musterPoint: 'Electrical Room',
    triggerWords: ['light', 'lighting', 'lamp', 'static light', 'static lighting', 'static fixture', 'static lamp'],
    selectedHazards: ['wah_powered_platforms', 'act_working_on_near_energized_equipment', 'act_energy_Isolation'],
    taskRows: [
      ['Lift pre-use check', 'Equipment failure', 'Inspect before use'],
      ['Elevate to work height', 'Fall from platform', 'Harness on, gates closed'],
      ['Replace static fixture', 'Electrical shock', 'Circuit isolated, LOTO applied'],
    ],
    ppeSelected: ['Safety Vest', 'Safety Boots', 'Fall Arrest', 'Gloves'],
  },
  'LGT-HM': {
    code: 'LGT-HM', name: 'High Mast Lighting',
    desc: 'High mast light head maintenance, lamp replacement, or repair',
    taskDesc: 'High mast lighting maintenance and lamp replacement',
    taskLoc: 'Apron / Roadway', jobNumber: '', musterPoint: 'High Gate',
    triggerWords: ['high mast', 'mast light', 'mast lamp', 'apron light', 'high mast lighting', 'tall pole light', 'mast lighting'],
    selectedHazards: ['eng_working_above_your_head', 'wah_powered_platforms', 'wah_fall arrest systems', 'act_mobile_equipment_vehicle', 'env_weather_conditions'],
    taskRows: [
      ['Lower mast head or deploy bucket truck', 'Equipment failure', 'Inspect raising system before use'],
      ['Replace lamps or components at head', 'Fall from extreme height', 'Harness on and clipped at all times'],
      ['Raise head and test from ground', 'Wind exposure at height', 'Check wind speed before raising'],
    ],
    ppeSelected: ['Safety Vest', 'Safety Boots', 'Fall Arrest', 'Safety Glasses'],
  },
  'GEN-RUN': {
    code: 'GEN-RUN', name: 'Generator Run / Test',
    desc: 'Scheduled generator operational run and test',
    taskDesc: 'Generator operational run and functional test',
    taskLoc: 'Generator Room', jobNumber: '', musterPoint: 'Generator Room Door',
    triggerWords: ['generator', 'gen run', 'generator run', 'load test', 'load bank', 'gen test', 'generator test', 'run up generator'],
    selectedHazards: ['act_working_on_near_energized_equipment', 'env_ventilation_required', 'act_burn_heat_sources', 'per_external_noise levels'],
    taskRows: [
      ['Check fuel and fluid levels', 'Spill', 'Use drip tray'],
      ['Start generator', 'Electrical hazard', 'Keep clear of terminals'],
      ['Monitor under load', 'Overheating', 'Check gauges every 10 min'],
    ],
    ppeSelected: ['Safety Vest', 'Safety Boots', 'Ear Protection', 'Safety Glasses'],
  },
  'FIR-ENBL': {
    code: 'FIR-ENBL', name: 'Fire Panel - Enable/Disable',
    desc: 'Fire alarm panel enable or disable for maintenance',
    taskDesc: 'Fire alarm panel enable or disable for maintenance',
    taskLoc: 'Fire Panel Room', jobNumber: '', musterPoint: 'Main Entrance',
    triggerWords: ['fire', 'fire alarm', 'fire alarm disable', 'fire alarm enable', 'disable fire', 'enable fire', 'fire panel disable', 'fire panel enable', 'disable alarm'],
    selectedHazards: ['act_working_on_near_energized_equipment', 'per_clear_instructions_provided', 'acc_required_permits_in_place'],
    taskRows: [
      ['Notify airport operations', 'Miscommunication', 'Confirm notification in writing'],
      ['Disable / enable zone', 'False alarm trigger', 'Follow procedure exactly'],
      ['Test and confirm restore', 'System failure', 'Test all zones after work'],
    ],
    ppeSelected: ['Safety Vest', 'Safety Boots'],
  },
  'FIR-BYP': {
    code: 'FIR-BYP', name: 'Fire Alarm Bypass',
    desc: 'Fire alarm system zone bypass for maintenance work',
    taskDesc: 'Fire alarm zone bypass for maintenance',
    taskLoc: 'Fire Panel Room', jobNumber: '', musterPoint: 'Main Entrance',
    triggerWords: ['fire', 'fire alarm', 'fire bypass', 'bypass fire', 'bypass alarm', 'fire alarm bypass', 'zone bypass', 'alarm bypass'],
    selectedHazards: ['per_clear_instructions_provided', 'acc_required_permits_in_place'],
    taskRows: [
      ['Obtain bypass permit and notify ops', 'Non-compliance', 'Permit signed before bypass'],
      ['Apply bypass at fire panel', 'Wrong zone bypassed', 'Confirm zone ID before bypass'],
      ['Complete maintenance and remove bypass', 'System not restored', 'Verify normal operation with ops'],
    ],
    ppeSelected: ['Safety Vest', 'Safety Boots'],
  },
  'FIR-PULL': {
    code: 'FIR-PULL', name: 'Reset Pull Station',
    desc: 'Fire alarm pull station reset after activation',
    taskDesc: 'Fire alarm pull station reset following activation',
    taskLoc: 'Terminal', jobNumber: '', musterPoint: 'Main Entrance',
    triggerWords: ['fire', 'pull station', 'reset pull', 'pull station reset', 'reset station', 'fire pull', 'station reset'],
    selectedHazards: ['per_clear_instructions_provided', 'per_distractions_in_work_area'],
    taskRows: [
      ['Confirm clear with ops before approaching', 'Re-trigger of alarm', 'Ops approval required first'],
      ['Reset pull station using key', 'Incorrect reset', 'Follow reset procedure exactly'],
      ['Verify panel restores to normal', 'System failure', 'Confirm clear with ops and document'],
    ],
    ppeSelected: ['Safety Vest', 'Safety Boots'],
  },
  'HAND-DRY': {
    code: 'HAND-DRY', name: 'Hand Dryer Repair',
    desc: 'Washroom hand dryer repair or unit replacement',
    taskDesc: 'Hand dryer repair or replacement',
    taskLoc: 'Terminal Washroom', jobNumber: '', musterPoint: 'Electrical Room',
    triggerWords: ['hand dryer', 'hand drier', 'dryer repair', 'washroom dryer', 'bathroom dryer', 'hand dryer repair'],
    selectedHazards: ['act_working_on_near_energized_equipment', 'act_energy_Isolation', 'eng_working_in_a_tight_area'],
    taskRows: [
      ['Isolate circuit at panel', 'Electrical shock', 'LOTO before removal'],
      ['Remove, repair or replace unit', 'Tight space', 'Work carefully in confined washroom'],
      ['Reinstall and test', 'Unit not secured', 'Verify mounting secure before restoring power'],
    ],
    ppeSelected: ['Safety Boots', 'Gloves'],
  },
  'PLC-CTRL': {
    code: 'PLC-CTRL', name: 'PLC / Controls / VFD',
    desc: 'PLC, VFD, contactor, or control panel repair and configuration',
    taskDesc: 'PLC, VFD, contactor, or control panel repair',
    taskLoc: 'Electrical Room', jobNumber: '', musterPoint: 'Electrical Room Door',
    triggerWords: ['plc', 'vfd', 'contactor', 'controls repair', 'control panel', 'plc repair', 'vfd repair', 'contactor replace', 'power supply', 'drive repair'],
    selectedHazards: ['act_working_on_near_energized_equipment', 'act_energy_Isolation', 'act_electrica_cords_tools_condition', 'act_equipment_tools_inspected'],
    taskRows: [
      ['LOTO all energy feeds to panel', 'Arc flash / shock', 'Full LOTO before opening panel'],
      ['Replace or configure component', 'Incorrect settings — equipment damage', 'Confirm settings against documentation'],
      ['Restore power and test function', 'Backfeed hazard', 'Verify all LOTO removed before energizing'],
    ],
    ppeSelected: ['Safety Glasses', 'Safety Boots', 'Gloves'],
  },
  'SUMP-PIT': {
    code: 'SUMP-PIT', name: 'Pull Pit / Sump',
    desc: 'Sump pit or pull pit pump service and repair',
    taskDesc: 'Sump or pull pit pump service',
    taskLoc: 'Mechanical Room / Pit', jobNumber: '', musterPoint: 'Nearest Exit',
    triggerWords: ['sump', 'pull pit', 'sump pit', 'pit pump', 'sump pump', 'pull pit pump', 'sump repair'],
    selectedHazards: ['acc_slip_trip_potential_identified', 'env_ventilation_required', 'act_confined_space'],
    taskRows: [
      ['Assess pit conditions before entering', 'Atmosphere hazard', 'Test atmosphere if enclosed — no entry without ventilation'],
      ['Service or replace pump components', 'Wet, slippery surfaces', 'Non-slip footwear, careful footing'],
      ['Test pump and restore covers', 'Confined space risk', 'Confined space permit if entry required'],
    ],
    ppeSelected: ['Safety Boots', 'Gloves'],
  },
  'BUCK-TRK': {
    code: 'BUCK-TRK', name: 'Bucket Truck Work',
    desc: 'Aerial work using bucket truck or aerial lift',
    taskDesc: 'Bucket truck work — pre-use inspection and aerial task',
    taskLoc: 'Apron / Roadway', jobNumber: '', musterPoint: 'High Gate',
    triggerWords: ['bucket truck', 'boom truck', 'aerial truck', 'bucket work', 'aerial lift truck', 'boom lift truck'],
    selectedHazards: ['wah_powered_platforms', 'wah_fall arrest systems', 'act_mobile_equipment_vehicle', 'env_weather_conditions'],
    taskRows: [
      ['Complete bucket truck pre-use inspection', 'Equipment failure', 'Do not use if defect found'],
      ['Position vehicle and set outriggers', 'Tip-over', 'Outriggers fully deployed on firm ground'],
      ['Don harness and perform aerial work', 'Fall from bucket', 'Harness clipped before bucket moves'],
    ],
    ppeSelected: ['Safety Vest', 'Safety Boots', 'Fall Arrest'],
  },
  'CONF-SPC': {
    code: 'CONF-SPC', name: 'Confined Space Entry',
    desc: 'Confined space entry for inspection or maintenance',
    taskDesc: 'Confined space entry — permit, atmosphere test, work, exit',
    taskLoc: 'As Specified', jobNumber: '', musterPoint: 'Confined Space Entry Point',
    triggerWords: ['confined space', 'confined entry', 'space entry', 'manhole', 'vault entry', 'tank entry', 'pit entry'],
    selectedHazards: ['act_confined_space', 'env_ventilation_required', 'acc_required_permits_in_place', 'per_working_alone_communication'],
    taskRows: [
      ['Complete confined space entry permit', 'Non-compliance / undetected hazard', 'Permit required — no exceptions'],
      ['Test atmosphere before entry', 'O2 deficiency or toxic gas', 'Multi-gas test before and during entry'],
      ['Enter with attendant in position', 'Entrapment — unable to self-rescue', 'Attendant at entry point at all times'],
    ],
    ppeSelected: ['Safety Boots', 'Gloves', 'Safety Glasses'],
  },
  'LIVE-ELEC': {
    code: 'LIVE-ELEC', name: 'Live Electrical Troubleshoot (<600V)',
    desc: 'Energized electrical troubleshooting below 600V',
    taskDesc: 'Live electrical troubleshooting below 600V',
    taskLoc: 'Electrical Room', jobNumber: '', musterPoint: 'Electrical Room Door',
    triggerWords: ['live electrical', 'energized troubleshoot', 'live troubleshoot', 'live wire', 'energized work', 'test live', 'hot work electrical', 'live fault'],
    selectedHazards: ['act_working_on_near_energized_equipment', 'act_electrica_cords_tools_condition', 'act_equipment_tools_inspected', 'eng_parts_of_body_in_line_of_fire', 'per_first_aid_requirements'],
    taskRows: [
      ['Don rated arc flash PPE before approaching', 'Arc flash — burns and blast', 'Full PPE on before entering panel area'],
      ['Test circuits using rated meter', 'Electrical shock', 'Test before touch — every time'],
      ['Identify fault and make safe', 'Line of fire from conductors', 'Keep body out of line of fire from panels'],
    ],
    ppeSelected: ['Safety Glasses', 'Safety Boots', 'Gloves', 'Face Shield', 'Coveralls'],
  },
  'JANIT-EQ': {
    code: 'JANIT-EQ', name: 'Janitorial Equipment Repair',
    desc: 'Janitorial or floor cleaning equipment repair',
    taskDesc: 'Janitorial or floor cleaning equipment repair',
    taskLoc: 'Terminal', jobNumber: '', musterPoint: 'Electrical Room',
    triggerWords: ['janitorial', 'floor machine', 'cleaning equipment', 'floor scrubber', 'sweeper repair', 'floor cleaner', 'burnisher', 'carpet cleaner repair'],
    selectedHazards: ['act_working_on_near_energized_equipment', 'act_energy_Isolation', 'acc_slip_trip_potential_identified'],
    taskRows: [
      ['Power off and unplug equipment', 'Moving parts if energized', 'Power off before any work'],
      ['Inspect and repair fault', 'Chemical residue on surfaces', 'Gloves on — chemical residue present'],
      ['Test function before return', 'Equipment not properly repaired', 'Function test before returning to service'],
    ],
    ppeSelected: ['Safety Boots', 'Gloves'],
  },
  'LIFT-INSP': {
    code: 'LIFT-INSP', name: 'Lift / MEWP Inspection',
    desc: 'Pre-use inspection of lift or mobile elevated work platform',
    taskDesc: 'Pre-use lift and MEWP inspection',
    taskLoc: 'Apron / Terminal', jobNumber: '', musterPoint: 'Equipment Staging',
    triggerWords: ['lift inspection', 'mewp inspection', 'lift inspect', 'mewp inspect', 'pre use inspection', 'pre-use lift', 'platform inspection', 'scissor lift inspection'],
    selectedHazards: ['wah_powered_platforms', 'wah_fall arrest systems', 'act_mobile_equipment_vehicle', 'env_weather_conditions'],
    taskRows: [
      ['Complete pre-use checklist', 'Equipment failure', 'Do not use if defect found'],
      ['Confirm operator is trained', 'Untrained use', 'Check operator certification'],
      ['Inspect work area', 'Overhead hazards', 'Scan for hazards before elevating'],
    ],
    ppeSelected: ['Safety Vest', 'Safety Boots', 'Fall Arrest'],
  },
  'HI-DUST': {
    code: 'HI-DUST', name: 'High Dusting',
    desc: 'High dusting of structural surfaces, fixtures, and overhead equipment',
    taskDesc: 'High dusting of overhead surfaces and fixtures',
    taskLoc: 'Terminal', jobNumber: '', musterPoint: 'Electrical Room',
    triggerWords: ['high dusting', 'dusting', 'overhead dusting', 'dust removal', 'high dust', 'structural dusting'],
    selectedHazards: ['eng_working_above_your_head', 'wah_protect_from_falling_items', 'act_airborne_particles'],
    taskRows: [
      ['Set up access — lift or ladder', 'Fall from height', 'Harness if on lift, 3-point on ladder'],
      ['Dust from high to low', 'Airborne dust — respiratory hazard', 'Respirator on during dusting'],
      ['Bag and remove debris', 'Falling debris to area below', 'Area barricaded below work zone'],
    ],
    ppeSelected: ['Safety Boots', 'Safety Glasses', 'Respirator'],
  },
  'SAPH-SYS': {
    code: 'SAPH-SYS', name: 'Sapphire System Work',
    desc: 'Sapphire fire suppression system inspection or maintenance',
    taskDesc: 'Sapphire fire suppression system maintenance',
    taskLoc: 'Data / Server Room', jobNumber: '', musterPoint: 'Nearest Exit',
    triggerWords: ['sapphire', 'sapphire system', 'suppression system', 'fire suppression', 'sapphire maintenance'],
    selectedHazards: ['per_clear_instructions_provided', 'acc_required_permits_in_place'],
    taskRows: [
      ['Notify ops and obtain work clearance', 'Accidental discharge', 'Ops notified and standing by'],
      ['Follow Sapphire SOP for maintenance', 'Pressurized system hazard', 'Reference procedure at every step'],
      ['Restore system and confirm with ops', 'System not restored properly', 'Written confirmation of restore with ops'],
    ],
    ppeSelected: ['Safety Boots'],
  },
  'BWAY-WORK': {
    code: 'BWAY-WORK', name: 'Breezeway Work',
    desc: 'Maintenance work in airport breezeway area',
    taskDesc: 'Maintenance work in breezeway area',
    taskLoc: 'Breezeway', jobNumber: '', musterPoint: 'Nearest Exit',
    triggerWords: ['breezeway', 'breezeway work', 'breezeway maintenance', 'corridor work', 'open corridor'],
    selectedHazards: ['env_weather_conditions', 'env_heat_stress_cold_exposure', 'act_mobile_equipment_vehicle'],
    taskRows: [
      ['Assess breezeway conditions — weather and traffic', 'Vehicle / equipment traffic', 'Hi-vis vest, watch for vehicles'],
      ['Set up work area, barricade if needed', 'Weather exposure', 'Dress for conditions'],
      ['Complete task and restore area', 'Wind / loose materials', 'Secure materials against wind'],
    ],
    ppeSelected: ['Safety Vest', 'Safety Boots'],
  },
  'VEH-BACK': {
    code: 'VEH-BACK', name: 'Vehicle Backing',
    desc: 'Safe vehicle backing procedure',
    taskDesc: 'Safe vehicle backing — walk path, spotter, back slow',
    taskLoc: 'Apron / Roadway', jobNumber: '', musterPoint: 'High Gate',
    triggerWords: ['vehicle backing', 'backing vehicle', 'safe backing', 'back vehicle', 'reverse vehicle', 'back truck'],
    selectedHazards: ['act_mobile_equipment_vehicle', 'per_distractions_in_work_area'],
    taskRows: [
      ['Walk backing path before moving vehicle', 'Struck-by — person in blind spot', 'Pre-check path on foot every time'],
      ['Assign spotter in direct line of sight', 'Loss of spotter contact', 'Stop if spotter contact is lost'],
      ['Back slowly, watching spotter at all times', 'Collision with structure or vehicle', 'Slow speed only — stop immediately if unclear'],
    ],
    ppeSelected: ['Safety Vest', 'Safety Boots'],
  },
  'ELC-RM': {
    code: 'ELC-RM', name: 'Electrical Room Work',
    desc: 'Electrical room maintenance, fault-finding and repair',
    taskDesc: 'Electrical room maintenance and repair',
    taskLoc: 'Electrical Room', jobNumber: '', musterPoint: 'Electrical Room Door',
    triggerWords: ['electrical room', 'elec room', 'panel work', 'breaker panel', 'switchgear', 'mcc', 'motor control', 'panel repair', 'electrical maintenance'],
    selectedHazards: ['act_working_on_near_energized_equipment', 'act_energy_Isolation', 'act_electrica_cords_tools_condition', 'per_trained_to_use_tool_and_perform_task'],
    taskRows: [
      ['Review single-line diagram', 'Wrong circuit isolated', 'Verify with multimeter'],
      ['Apply LOTO', 'Electrical shock', 'Test before touch'],
      ['Complete work and restore', 'Backfeed hazard', 'Confirm isolation removed safely'],
    ],
    ppeSelected: ['Safety Glasses', 'Safety Boots', 'Gloves'],
  },
};
