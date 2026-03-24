/* ═══════════════════════════════════════════════════════════════
   js/wording.js — pre-written wording library + apply logic
   3 variants per job code. Regenerate ↺ cycles through them.
   AI is NOT used here — these are fixed trade-language phrases.
═══════════════════════════════════════════════════════════════ */

const JOB_WORDING = {

  'BRG-DAILY': {
    task: [
      'Daily bridge operational inspection and safety check',
      'Daily walk-around — bridge functions and safety devices',
      'Bridge daily check: structure, operation, safety systems',
    ],
    steps: [
      ['Access bridge safely', 'Inspect structure and deck', 'Test all bridge functions', 'Check safety devices and limits', 'Document and report findings'],
      ['Walk approach and bridge deck', 'Check structural condition visually', 'Operate and test all controls', 'Inspect sensors and stops', 'Log results and report defects'],
    ],
    hazards: [
      ['Slip/trip on wet or uneven deck', 'Pinch points on moving parts', 'Cold or heat stress'],
      ['Slippery deck or approach', 'Moving bridge parts / pinch hazard', 'Weather exposure'],
    ],
    controls: [
      ['PPE on, watch footing at all times', 'Keep clear of moving parts', 'Dress for current conditions'],
      ['Wear grip boots, slow pace on wet deck', 'Hands clear before operating', 'Layer up / cool down as needed'],
    ],
  },

  'BRG-CALL': {
    task: [
      'Emergency bridge call-out — assess and repair fault',
      'Bridge fault response: identify issue and restore service',
      'Call-out bridge repair — diagnose, isolate, fix',
    ],
    steps: [
      ['Assess bridge fault on arrival', 'Identify affected system', 'Isolate power if required', 'Repair or replace component', 'Test and return to service'],
      ['Report in with operations on arrival', 'Diagnose fault — mechanical or electrical', 'Isolate and LOTO if energized work', 'Complete repair', 'Function test and sign off'],
    ],
    hazards: [
      ['Energized components if LOTO not applied', 'Unexpected bridge movement', 'Slip/trip around equipment'],
      ['Shock risk from energized parts', 'Bridge moving unexpectedly', 'Trip hazard in work area'],
    ],
    controls: [
      ['LOTO before touching electrical parts', 'Verify bridge is stopped and locked', 'Clear area, watch footing'],
      ['Isolate circuit, test zero energy', 'Chock / lock bridge before work', 'Keep area tidy, boots on'],
    ],
  },

  'BRG-WKLY': {
    task: [
      'Weekly comprehensive bridge structural and mechanical inspection',
      'Weekly bridge inspection — structure, mechanicals, safety systems',
      'Full weekly bridge check: structural, mechanical, electrical',
    ],
    steps: [
      ['Walk full bridge structure', 'Inspect mechanical components', 'Test all operational functions', 'Check safety devices', 'Complete inspection report'],
      ['Structural visual inspection', 'Check lubrication and wear points', 'Operate all functions and test limits', 'Inspect emergency stop systems', 'Document findings and sign off'],
    ],
    hazards: [
      ['Slip/trip on bridge deck', 'Pinch points on mechanical parts', 'Cold/heat exposure during inspection'],
      ['Slippery surfaces on deck', 'Moving mechanical components', 'Weather conditions during outdoor work'],
    ],
    controls: [
      ['Grip boots, careful footing', 'Keep hands clear before operating', 'Dress for weather'],
      ['Watch step on wet deck', 'Never reach into moving parts', 'Check forecast before starting'],
    ],
  },

  'BRG-SEMI': {
    task: [
      'Semi-annual comprehensive bridge inspection — structure and all systems',
      'Semi-annual bridge inspection: mechanical, electrical, structural, safety',
      'Biannual bridge full inspection and condition assessment',
    ],
    steps: [
      ['Access all bridge sections', 'Inspect structural steel and connections', 'Test all mechanical systems', 'Inspect all electrical systems', 'Document condition and schedule deficiencies'],
      ['Full structural walk-down', 'Mechanical wear and lubrication check', 'Electrical panel and controls inspection', 'Safety device and emergency stop test', 'Complete and submit inspection report'],
    ],
    hazards: [
      ['Slip/trip — extensive time on bridge', 'Working at height on bridge structure', 'Cold or heat stress during extended inspection'],
      ['Wet or slippery deck during inspection', 'Height exposure on bridge components', 'Fatigue from extended inspection work'],
    ],
    controls: [
      ['Grip boots, spotter if on structure above deck', 'Harness if accessing elevated sections', 'Take breaks, monitor weather'],
      ['Non-slip footwear, slow pace', 'Fall protection for any elevated access', 'Hydrate, dress for conditions'],
    ],
  },

  'BRG-REPAIR': {
    task: [
      'Bridge mechanical or electrical component repair',
      'Bridge repair — isolate, remove defective part, install, test',
      'Repair bridge component fault: LOTO, replace, restore service',
    ],
    steps: [
      ['Isolate bridge from service', 'Apply LOTO to affected system', 'Remove defective component', 'Install replacement part', 'Test operation before returning to service'],
      ['Lock bridge out of service', 'De-energize and tag out', 'Remove and replace faulty part', 'Functional test all repaired systems', 'Clear LOTO and return to ops'],
    ],
    hazards: [
      ['Energized components — shock/arc flash risk', 'Pinch points during mechanical work', 'Working at height on bridge'],
      ['Live electrical exposure if LOTO missed', 'Mechanical pinch hazard', 'Height exposure on bridge structure'],
    ],
    controls: [
      ['LOTO all energy sources before work', 'Keep hands clear of moving parts', 'Harness or spotter for elevated access'],
      ['Verify zero energy before touching', 'Lock out mechanicals before disassembly', 'Fall protection for above-deck work'],
    ],
  },

  'BRG-HYD': {
    task: [
      'Bridge hydraulic system service and component repair',
      'Hydraulic system maintenance — depressurise, service, restore',
      'Bridge hydraulics: inspect, service, replace, test',
    ],
    steps: [
      ['Depressurise hydraulic system fully', 'Block bridge to prevent movement', 'Inspect or replace hydraulic components', 'Clean up spills with containment', 'Restore pressure and function test'],
      ['Release system pressure before opening any lines', 'Physically block bridge from moving', 'Remove and replace hydraulic parts', 'Contain and clean any fluid spill', 'Re-pressurize and test function'],
    ],
    hazards: [
      ['Stored hydraulic pressure — injection hazard', 'Bridge movement if not blocked', 'Hydraulic fluid spill'],
      ['Pressurized line — fluid injection risk', 'Unexpected bridge movement during work', 'Spill on floor — slip hazard'],
    ],
    controls: [
      ['Fully bleed pressure before opening any line', 'Chock bridge on all sides', 'Drip tray in place, clean up immediately'],
      ['Confirm zero pressure before disconnecting', 'Block and lock bridge position', 'Absorbent ready, no fluid on walking surfaces'],
    ],
  },

  'GPU-REPAIR': {
    task: [
      'Ground power unit repair or cable/plug replacement',
      'GPU maintenance — inspect, repair, and test 28V unit',
      'GPU / 28V ground power cable or unit repair',
    ],
    steps: [
      ['Verify GPU is powered off', 'Inspect cable, plug, and unit for damage', 'Replace defective components', 'Test output before return to service', 'Stow cable and document'],
      ['Confirm power off at GPU panel', 'Visual inspection of cable and connectors', 'Remove and replace damaged parts', 'Check output voltage before use', 'Clean up area and sign off'],
    ],
    hazards: [
      ['Electrical shock from energized GPU', 'Heavy cable — manual handling injury', 'Vehicle traffic in apron / ramp area'],
      ['Shock risk if GPU not de-energized', 'Awkward cable lifting and handling', 'Moving vehicles near work area'],
    ],
    controls: [
      ['Power off GPU before any work', 'Proper lifting technique / team lift if heavy', 'Spotter for vehicle traffic, wear vest'],
      ['Confirm power off before touching', 'Two-person lift on heavy cables', 'Hi-vis vest, watch for ramp traffic'],
    ],
  },

  'LGT-IN-MIX': {
    task: [
      'Interior lighting fixture replacement — mixed access methods',
      'Relamping and fixture replacement — ladder and lift as required',
      'Interior light maintenance: isolate, access, replace, restore',
    ],
    steps: [
      ['Isolate circuit per LOTO procedure', 'Test for zero energy', 'Set up access (ladder or lift)', 'Replace lamp or fixture', 'Restore power and test'],
      ['Lock out panel circuit, tag out', 'Confirm zero energy with meter', 'Position ladder or MEWP safely', 'Swap lamp or fixture', 'Power up and verify function'],
    ],
    hazards: [
      ['Energized circuit if LOTO not completed', 'Fall from ladder or platform', 'Dropped tools or fixtures below'],
      ['Overhead energized circuit exposure', 'Height work — ladder or MEWP', 'Falling objects to area below'],
    ],
    controls: [
      ['LOTO complete before any access', 'Secure ladder, maintain 3-point contact', 'Area below cleared and barricaded'],
      ['Verify zero energy before touching', 'Lock ladder feet, close MEWP gate', 'Keep people out from below work area'],
    ],
  },

  'LGT-IN-LAD': {
    task: [
      'Interior lighting work from a ladder — isolate and replace',
      'Ladder-based interior relamping and fixture replacement',
      'Interior light fixture swap using ladder — LOTO and access',
    ],
    steps: [
      ['Set up ladder safely at work location', 'Isolate circuit per LOTO', 'Verify zero energy', 'Replace lamp or fixture from ladder', 'Restore and test'],
      ['Inspect and position ladder securely', 'Lock out circuit, confirm de-energized', 'Access fixture from ladder', 'Install replacement', 'Restore power and confirm working'],
    ],
    hazards: [
      ['Fall from ladder', 'Energized circuit if not isolated', 'Dropped tools below'],
      ['Ladder tip or slide', 'Shock risk from overhead circuit', 'Falling materials below'],
    ],
    controls: [
      ['Ladder footed, 3-point contact, spotter if needed', 'LOTO before any work', 'Clear below, tools in pouch'],
      ['Check ladder stability before climbing', 'Circuit isolated and confirmed', 'No one below work area'],
    ],
  },

  'LGT-EX-LFT': {
    task: [
      'Exterior lighting maintenance using MEWP — lamp or fixture replacement',
      'Exterior light work from aerial lift: inspect, replace, test',
      'MEWP-based exterior lighting maintenance and lamp swap',
    ],
    steps: [
      ['Complete MEWP pre-use inspection', 'Position and outrig unit', 'Don harness and clip lanyard', 'Perform lighting work from basket', 'Lower, stow, and test lights'],
      ['Pre-use MEWP checklist', 'Set up exclusion zone', 'Harness on before entering basket', 'Replace lamp or fixture', 'Lower platform, test lights, move on'],
    ],
    hazards: [
      ['Fall from MEWP basket', 'Equipment failure — mechanical or hydraulic', 'Vehicle or aircraft traffic below'],
      ['Fall from aerial work platform', 'MEWP tip or mechanical fault', 'Moving vehicles in exclusion zone'],
    ],
    controls: [
      ['Harness clipped at all times in basket', 'Pre-use inspection complete — no defects', 'Exclusion zone set and maintained'],
      ['Harness on before platform moves', 'Do not use if defect found on inspection', 'Spotter at ground, hi-vis worn'],
    ],
  },

  'LGT-EX-LAD': {
    task: [
      'Exterior lighting maintenance from a ladder',
      'Ladder-based exterior light fixture replacement',
      'Exterior relamp or fixture swap using ladder — outdoor conditions',
    ],
    steps: [
      ['Inspect and set up ladder at work site', 'Isolate circuit before climbing', 'Access fixture from ladder', 'Replace lamp or fixture', 'Restore and test'],
      ['Set ladder on firm ground, secure it', 'LOTO circuit at panel', 'Climb and access light head', 'Install replacement components', 'Test and restore power'],
    ],
    hazards: [
      ['Fall from ladder — outdoor conditions', 'Energized fixture if LOTO missed', 'Weather / wind exposure at height'],
      ['Ladder slip on uneven ground', 'Shock risk from circuit', 'Wind affecting ladder stability'],
    ],
    controls: [
      ['Firm ladder base, 3-point contact, spotter', 'Circuit isolated and verified', 'Avoid work in high wind'],
      ['Ground must be firm and level', 'LOTO and test zero energy', 'Check wind speed before setting up'],
    ],
  },

  'LGT-STA-LFT': {
    task: [
      'Static lighting replacement using lift platform',
      'Lift-based static lighting maintenance and lamp swap',
      'Static light fixture replacement from aerial work platform',
    ],
    steps: [
      ['Inspect lift before use', 'Elevate to work height', 'Isolate circuit', 'Replace static fixture', 'Lower, restore power, test'],
      ['Pre-use lift inspection', 'Position and raise platform', 'LOTO circuit at panel', 'Swap lamp or fixture', 'Descend, clear LOTO, function test'],
    ],
    hazards: [
      ['Fall from elevated platform', 'Energized circuit if LOTO not completed', 'Overhead obstructions at height'],
      ['Platform fall hazard', 'Circuit shock risk', 'Hitting structure or equipment at elevation'],
    ],
    controls: [
      ['Harness on, platform gates closed', 'LOTO before touching fixture', 'Survey overhead before raising'],
      ['Clip harness before elevating', 'Verify zero energy before work', 'Check clearance before raising'],
    ],
  },

  'LGT-HM': {
    task: [
      'High mast light head maintenance — lamp replacement or repair',
      'High mast lighting: lower, service, raise, and test',
      'High mast light maintenance using bucket truck or lowering system',
    ],
    steps: [
      ['Lower mast head using raising system (if motorized)', 'Inspect raising mechanism', 'Replace lamps or damaged components', 'Raise head to operating position', 'Test from ground — confirm function'],
      ['Deploy bucket truck or lower mast ring', 'Inspect wire rope and raising gear', 'Service lamps and head components', 'Return to position', 'Verify lights on from ground'],
    ],
    hazards: [
      ['Extreme height — fall hazard in bucket or on mast', 'Wire rope or raising mechanism failure', 'Wind exposure at height'],
      ['Fall from extreme height', 'Mechanical failure of raising system', 'High wind at mast elevation'],
    ],
    controls: [
      ['Harness required in bucket or at height', 'Inspect raising system before lowering', 'Do not work in high winds'],
      ['Harness clipped at all times', 'Check wire rope condition before operating', 'Check wind speed — abort if excessive'],
    ],
  },

  'GEN-RUN': {
    task: [
      'Scheduled generator operational run and load test',
      'Generator run-up and load test — check, start, monitor, shut down',
      'Generator run and functional test with load bank',
    ],
    steps: [
      ['Check fuel, coolant, and oil levels', 'Inspect for leaks and damage', 'Start generator per procedure', 'Monitor under load', 'Shut down and document readings'],
      ['Pre-start fluid and condition check', 'Clear area around exhaust', 'Start and run up to operating temp', 'Load test and record meter readings', 'Cool down, shut down, log results'],
    ],
    hazards: [
      ['Electrical shock from energized panels', 'Hot exhaust and moving parts', 'Carbon monoxide in enclosed space'],
      ['Energized terminals during run', 'Burns from hot surfaces', 'CO buildup if poorly ventilated'],
    ],
    controls: [
      ['Keep clear of live terminals, no probing while running', 'Stay back from exhaust, no loose clothing', 'Ensure adequate ventilation before starting'],
      ['No contact with energized parts', 'Burns hazard — keep clear of exhaust stack', 'Ventilate room, CO monitor if enclosed'],
    ],
  },

  'FIR-ENBL': {
    task: [
      'Fire alarm panel zone disable or enable for maintenance',
      'Fire alarm system enable / disable — coordinate with ops, document, restore',
      'Fire panel bypass for maintenance: notify, disable zone, work, restore',
    ],
    steps: [
      ['Notify airport operations of planned disable', 'Document zone to be disabled', 'Disable zone at panel per procedure', 'Complete maintenance work', 'Re-enable zone, test, and confirm with ops'],
      ['Call ops — confirm they acknowledge', 'Record zone number and time of disable', 'Disable at fire panel per SOP', 'Perform maintenance in disabled zone', 'Re-enable, test alarm function, confirm clear with ops'],
    ],
    hazards: [
      ['False alarm trigger during work', 'System failure if procedure not followed', 'Regulatory non-compliance'],
      ['Unintended alarm if wrong zone touched', 'Panel damage if not handled correctly', 'Non-compliance if not documented'],
    ],
    controls: [
      ['Follow exact procedure — no shortcuts', 'Confirm with ops before and after', 'Document everything'],
      ['Reference procedure card at all times', 'Verbal confirmation with ops each step', 'Written log of disable/enable time'],
    ],
  },

  'FIR-BYP': {
    task: [
      'Fire alarm system zone bypass for maintenance work',
      'Fire alarm bypass — permit, notify ops, bypass, work, restore',
      'Zone bypass of fire alarm system: coordinate, document, restore',
    ],
    steps: [
      ['Obtain bypass permit if required', 'Notify airport operations', 'Apply bypass at fire panel', 'Complete maintenance', 'Remove bypass and test — confirm clear'],
      ['Complete permit paperwork', 'Call ops for acknowledgment', 'Bypass designated zone only', 'Finish work in zone', 'Remove bypass, verify normal operation with ops'],
    ],
    hazards: [
      ['False alarm or missed real alarm during bypass', 'Wrong zone bypassed — safety risk', 'Non-compliance if not documented'],
      ['Compromised fire detection during bypass period', 'Incorrect zone isolation', 'No paper trail — audit risk'],
    ],
    controls: [
      ['Reference exact zone diagram, confirm zone number', 'Ops notified and acknowledged', 'Document start/end time of bypass'],
      ['Verify zone ID before bypass', 'Confirm verbally with ops before activating bypass', 'Fill out bypass log completely'],
    ],
  },

  'FIR-PULL': {
    task: [
      'Fire alarm pull station reset after activation',
      'Reset pull station — confirm clear, reset, test, restore',
      'Pull station reset following activation or false alarm',
    ],
    steps: [
      ['Confirm with operations — all clear to reset', 'Identify activated pull station', 'Reset station using key', 'Restore panel to normal', 'Confirm clear with ops and document'],
      ['Get clearance from ops before approaching', 'Locate activated station', 'Reset and re-arm station', 'Verify panel restores to normal', 'Log reset time and confirm with ops'],
    ],
    hazards: [
      ['Re-trigger of alarm if reset incorrectly', 'Energized panel components', 'Slip/trip around emergency response area'],
      ['Alarm re-activation during reset', 'Panel shock risk', 'Busy area during response'],
    ],
    controls: [
      ['Confirm clear before starting, follow reset procedure', 'No contact with panel internals', 'Watch surroundings, stay aware of personnel'],
      ['Ops approval before any reset', 'Reset only the station — no panel work', 'Stay alert during busy emergency response'],
    ],
  },

  'HAND-DRY': {
    task: [
      'Hand dryer unit repair or replacement',
      'Hand dryer fault repair — isolate, inspect, fix, test',
      'Washroom hand dryer repair or swap-out',
    ],
    steps: [
      ['Isolate circuit at panel', 'Remove unit from wall', 'Inspect and repair or replace', 'Reinstall and secure', 'Restore power and test operation'],
      ['LOTO at breaker', 'Remove mounting screws and disconnect', 'Repair or swap unit', 'Mount and reconnect', 'Power on and function test'],
    ],
    hazards: [
      ['Electrical shock if not isolated', 'Working in tight washroom space', 'Overhead reach for mounted unit'],
      ['Energized circuit exposure', 'Confined washroom area', 'Overhead installation awkward position'],
    ],
    controls: [
      ['LOTO circuit before removal', 'Work carefully in tight space', 'Step stool if needed, maintain stable footing'],
      ['Verify zero energy before touching', 'Clear counter space for tools', 'Good footing — no standing on toilet or counter'],
    ],
  },

  'PLC-CTRL': {
    task: [
      'PLC, VFD, contactor, or control panel repair and configuration',
      'Controls/PLC repair — LOTO, replace component, configure, test',
      'VFD / PLC / contactor repair: isolate, replace, program, verify',
    ],
    steps: [
      ['Isolate all energy sources to panel', 'Apply full LOTO', 'Replace or configure faulty component', 'Verify configuration settings before power-up', 'Restore power and test full function'],
      ['LOTO all feeds to panel', 'Verify zero energy — check all terminals', 'Swap or configure PLC / VFD / contactor', 'Confirm settings match documentation', 'Energize and test — document results'],
    ],
    hazards: [
      ['Arc flash from energized panel', 'Incorrect configuration — equipment damage or failure', 'Multiple energy sources if not all isolated'],
      ['Shock / arc flash if LOTO incomplete', 'Wrong parameter setting — motor damage', 'Missed isolation point'],
    ],
    controls: [
      ['Full LOTO all energy feeds before opening panel', 'Test before touch — verify zero energy', 'Confirm all settings against documentation before energizing'],
      ['Verify every feed isolated', 'Read parameters before changing anything', 'Documentation sign-off before power restore'],
    ],
  },

  'SUMP-PIT': {
    task: [
      'Sump pit or pull pit pump service and repair',
      'Pull pit / sump pump maintenance — access, service, restore',
      'Sump or pull pit work: assess, service pump, test',
    ],
    steps: [
      ['Assess pit conditions from above — no entry if atmosphere unknown', 'Ventilate pit if entry required', 'Service or replace pump components', 'Test pump operation', 'Restore and clean up'],
      ['Check for water level and hazards before entry', 'Set up ventilation before entering', 'Complete pump maintenance or replacement', 'Run pump and confirm operation', 'Exit, clean up, restore covers'],
    ],
    hazards: [
      ['Wet, slippery pit surfaces', 'Gas accumulation if poorly ventilated', 'Confined space entry risk'],
      ['Slip/fall into pit', 'Oxygen-deficient or toxic atmosphere', 'Confined space — limited exit'],
    ],
    controls: [
      ['Inspect pit before entering, ventilate, use confined space permit if required', 'Non-slip footwear, stay aware of edge', 'Test atmosphere before entry if enclosed pit'],
      ['Never enter without ventilation check', 'Atmospheric test if covered or enclosed', 'Confined space permit if entry required'],
    ],
  },

  'BUCK-TRK': {
    task: [
      'Aerial work using bucket truck — pre-use inspection and operation',
      'Bucket truck deployment: inspect, position, outrig, work at height',
      'Bucket truck work — pre-use check, set up, perform task, stow',
    ],
    steps: [
      ['Complete bucket truck pre-use inspection', 'Position vehicle and set outriggers', 'Don harness before entering bucket', 'Perform work from bucket', 'Lower, stow outriggers, post-use check'],
      ['Walk-around inspection of truck and boom', 'Drive to position, block wheels, outrig', 'Harness and lanyard in bucket', 'Complete work task', 'Lower platform, stow, drive off'],
    ],
    hazards: [
      ['Fall from bucket at height', 'Truck tip if outriggers not set correctly', 'Overhead power lines or obstructions'],
      ['Fall from aerial basket', 'Equipment tip-over', 'Contact with overhead hazards'],
    ],
    controls: [
      ['Harness clipped before bucket moves', 'Outriggers fully deployed on firm ground', 'Survey overhead hazards before raising'],
      ['Harness on — clip before elevation', 'All outriggers down and load-bearing', 'Spotter identifies overhead hazards before raising'],
    ],
  },

  'CONF-SPC': {
    task: [
      'Confined space entry — complete permit, test atmosphere, enter, work, exit',
      'Confined space entry for inspection or maintenance',
      'Confined space: entry permit, atmosphere test, attendant, work, clear',
    ],
    steps: [
      ['Complete confined space entry permit', 'Test atmosphere (O2, CO, LEL)', 'Set up continuous ventilation', 'Assign attendant — no entry without attendant', 'Enter, complete work, exit, clear permit'],
      ['Fill out entry permit completely', 'Multi-gas test before and during entry', 'Run ventilation fan before entering', 'Attendant in position at entry point', 'Perform work, exit, close and sign permit'],
    ],
    hazards: [
      ['Oxygen-deficient or toxic atmosphere', 'Entrant unable to self-rescue', 'Limited access for emergency response'],
      ['Deadly atmosphere — no warning', 'Entrapment — too small to self-rescue', 'Slow emergency response to confined space'],
    ],
    controls: [
      ['Never enter without atmosphere test and permit', 'Attendant must be at entry at all times', 'Rescue plan in place before entry'],
      ['Atmospheric test mandatory — no exceptions', 'Attendant stationed at all times — no entry alone', 'Emergency plan reviewed before any entry'],
    ],
  },

  'LIVE-ELEC': {
    task: [
      'Energized electrical troubleshooting below 600V',
      'Live electrical fault-finding — rated PPE, tested tools, controlled area',
      'Live electrical work <600V: don PPE, test, identify fault, make safe',
    ],
    steps: [
      ['Verify task requires energized work — no isolation option', 'Don rated PPE for energized work', 'Inspect panel or equipment visually', 'Test circuits using rated meter and probes', 'Identify fault, document, make safe'],
      ['Confirm energized work is necessary', 'Full arc flash PPE on before approaching panel', 'Visual inspection with no contact', 'Use rated CAT-rated meter for all tests', 'Identify fault, record findings, isolate if possible'],
    ],
    hazards: [
      ['Electrical shock', 'Arc flash — burns and blast', 'Line of fire from exposed conductors'],
      ['Shock from accidental contact', 'Arc fault — thermal burn and pressure', 'Body position in line of exposed conductors'],
    ],
    controls: [
      ['Rated gloves and face shield on before approaching', 'Test before touch — every time', 'Keep body out of line of fire from panels and conductors'],
      ['Full arc PPE before any panel work', 'Rated meter and probes only', 'One hand rule, keep clear of panels while energized'],
    ],
  },

  'JANIT-EQ': {
    task: [
      'Janitorial or floor cleaning equipment repair',
      'Floor machine or janitorial equipment maintenance and repair',
      'Cleaning equipment repair — inspect, fix, test',
    ],
    steps: [
      ['Confirm equipment is powered off', 'Inspect for damage and fault', 'Remove and replace defective components', 'Reassemble and test', 'Return to service'],
      ['Power off and unplug equipment', 'Identify fault — mechanical or electrical', 'Service or replace parts', 'Function test before return', 'Clean up work area'],
    ],
    hazards: [
      ['Moving parts if powered on during work', 'Chemical residue on equipment surfaces', 'Slip/trip around equipment'],
      ['Entanglement in rotating parts', 'Skin contact with cleaning chemicals', 'Wet floors around equipment'],
    ],
    controls: [
      ['Power off and unplug before any work', 'Wear gloves — chemical residue present', 'Watch footing around equipment'],
      ['Disconnect power source before touching', 'Rinse gloves and clean surfaces before handling', 'Dry floor and wear grip boots'],
    ],
  },

  'LIFT-INSP': {
    task: [
      'Pre-use lift and MEWP inspection per checklist',
      'MEWP pre-use inspection — power off, power on, function checks',
      'Lift pre-use inspection before any elevated work',
    ],
    steps: [
      ['Complete power-off visual inspection', 'Check fluid levels and physical condition', 'Power on and check battery or fuel', 'Test all controls and safety devices', 'Document and sign inspection record'],
      ['Walk around inspection — tires, structure, basket', 'Fluid and charge level check', 'Energize and test function controls', 'Test emergency stop and lowering', 'Complete checklist and sign off'],
    ],
    hazards: [
      ['Hidden defect missed in inspection', 'Equipment failure at height if defect not caught', 'Slip/trip during walk-around inspection'],
      ['Defect missed — failure risk during use', 'Untested safety system failure at height', 'Wet or uneven surface during walk-around'],
    ],
    controls: [
      ['Follow checklist in order — no skipping', 'Do not use if any defect found — tag out', 'Watch footing on walk-around'],
      ['Use checklist every time — no memory-only checks', 'Out-of-service tag if defect found', 'Steady footing during inspection'],
    ],
  },

  'HI-DUST': {
    task: [
      'High dusting of structural surfaces, fixtures, and overhead equipment',
      'High dusting task — access at height, dust from top down, clear area',
      'Overhead high dusting: lift or ladder, respirator, control dust fall',
    ],
    steps: [
      ['Set up access — lift or ladder', 'Confirm overhead clearances', 'Begin dusting from highest point down', 'Control falling dust and debris', 'Clear work area — bag and remove debris'],
      ['Position lift or ladder at start point', 'Check for obstructions above work area', 'High-to-low dusting sequence', 'Barricade below to catch falling debris', 'Remove debris, clean up, restore area'],
    ],
    hazards: [
      ['Fall from height', 'Airborne dust and debris — respiratory hazard', 'Falling debris to area below'],
      ['Fall from ladder or lift', 'Inhaled dust particles', 'Dropped materials onto people below'],
    ],
    controls: [
      ['Harness if on lift or above 10ft', '3-point contact on ladder', 'Respirator on, clear area below'],
      ['Fall protection for any elevated work', 'Dust mask / respirator at all times', 'Barricade work area below before starting'],
    ],
  },

  'SAPH-SYS': {
    task: [
      'Sapphire fire suppression system inspection or maintenance',
      'Sapphire system work — notify ops, follow SOP, restore and verify',
      'Sapphire fire suppression: coordinate with ops, complete work, restore',
    ],
    steps: [
      ['Notify airport operations of planned work', 'Follow Sapphire system SOP exactly', 'Complete inspection or maintenance task', 'Restore system to active status', 'Verify function and document with ops'],
      ['Call ops — verbal and written acknowledgment', 'Reference Sapphire procedure for every step', 'Perform maintenance per procedure', 'Restore system and test function', 'Written confirmation of system restored with ops'],
    ],
    hazards: [
      ['Accidental Sapphire agent discharge', 'Pressurized system components', 'Oxygen displacement if agent released'],
      ['Unintended suppression system activation', 'High-pressure cylinder hazard', 'Agent discharge in enclosed space'],
    ],
    controls: [
      ['Follow SOP exactly — no improvising', 'Ops notified and standing by during work', 'Know discharge risk — clear area if needed'],
      ['Procedure card in hand at all times', 'Verbal ops confirmation before each step', 'Know emergency evacuation if accidental discharge'],
    ],
  },

  'BWAY-WORK': {
    task: [
      'Maintenance work in breezeway area',
      'Breezeway maintenance task — assess conditions, complete work, clear area',
      'Work in breezeway: weather exposure, traffic awareness, barricade if needed',
    ],
    steps: [
      ['Assess breezeway conditions — weather and traffic', 'Set up work area and barricade if needed', 'Complete maintenance task', 'Clean up and restore area', 'Clear barricades and confirm clear with ops if required'],
      ['Walk the breezeway before starting', 'Barricade if work area creates hazard', 'Perform task safely', 'Clean up tools and materials', 'Remove barricades, confirm area is clear'],
    ],
    hazards: [
      ['Weather exposure in open breezeway', 'Vehicle or equipment traffic', 'Wind in open corridor area'],
      ['Exposed to elements — cold, rain, wind', 'Moving vehicles or equipment', 'Wind gusts in corridor'],
    ],
    controls: [
      ['Dress for weather conditions', 'Hi-vis vest, watch for vehicles', 'Secure tools and materials against wind'],
      ['Check forecast before starting', 'Reflective vest on at all times', 'Tie down materials — wind can carry items'],
    ],
  },

  'VEH-BACK': {
    task: [
      'Safe vehicle backing procedure',
      'Backing vehicle safely — walk the path, assign spotter, back slow',
      'Vehicle backing: check blind spots, spotter in position, clear comm',
    ],
    steps: [
      ['Walk backing path before moving vehicle', 'Assign and position spotter in clear view', 'Establish hand signal or radio communication', 'Back slowly, watching spotter at all times', 'Stop immediately if spotter signal is lost'],
      ['Check backing area on foot first', 'Position spotter where driver can see them', 'Confirm comm method before moving', 'Reverse slowly, continuous mirror checks', 'Stop and exit if any doubt about clearance'],
    ],
    hazards: [
      ['Struck-by — pedestrian or object in blind spot', 'Loss of spotter contact', 'Collision with vehicle or structure'],
      ['Person in blind spot during backing', 'Spotter not visible — driver continues', 'Backing into fixed structure or vehicle'],
    ],
    controls: [
      ['Always walk the path before backing', 'Spotter in direct line of sight at all times', 'Stop if spotter contact is lost — do not continue'],
      ['Pre-check backing area on foot', 'Spotter positioned in mirror view', 'Any loss of spotter = stop immediately'],
    ],
  },

  'ELC-RM': {
    task: [
      'Electrical room maintenance, fault-finding, and repair',
      'Electrical room work — LOTO, diagnose, repair, restore, test',
      'Electrical room maintenance: review drawings, isolate, work, restore',
    ],
    steps: [
      ['Review single-line diagram before starting', 'Apply full LOTO to circuit being worked', 'Verify zero energy at all terminals', 'Complete repair or maintenance', 'Restore power, test, and document'],
      ['Confirm circuit on drawing', 'LOTO at breaker and verify', 'Test all terminals — confirm dead', 'Repair, replace, or adjust', 'Remove LOTO, energize, confirm function'],
    ],
    hazards: [
      ['Electrical shock if wrong circuit isolated', 'Arc flash from live panels adjacent to work', 'Backfeed from unseen sources'],
      ['Shock from incorrect isolation', 'Adjacent live panels — arc flash risk', 'Undetected backfeed source'],
    ],
    controls: [
      ['Verify correct circuit on drawing before LOTO', 'Test before touch at every terminal', 'Check for backfeed — multiple sources'],
      ['Cross-reference drawing before isolating', 'Rated PPE for proximity to live panels', 'Multi-lock LOTO if multiple energy sources'],
    ],
  },

};


// ── VARIANT INDEX TRACKING ────────────────────────────────────
// Tracks which variant was last used per job code (cycles on regenerate)
var _wordingIdx = {};


// ── GET WORDING ───────────────────────────────────────────────
// Returns the wording object for a job code, or null if not found

function getWording(jobCode) {
  return JOB_WORDING[jobCode] || null;
}


// ── APPLY WORDING ─────────────────────────────────────────────
// Applies next wording variant to the current PSI state (st).
// Returns { task, taskStepsText, hazardText, controlText, variantNum, totalVariants } or null.

function applyWording(jobCode) {
  var w = JOB_WORDING[jobCode];
  if (!w) return null;

  var total  = Math.max(
    (w.task     || []).length,
    (w.steps    || []).length,
    (w.hazards  || []).length,
    (w.controls || []).length
  );
  var idx = (_wordingIdx[jobCode] || 0) % total;

  var task     = (w.task    || [])[idx % (w.task    || [['']]).length] || '';
  var steps    = (w.steps   || [])[idx % (w.steps   || [[]]).length]   || [];
  var hazards  = (w.hazards || [])[idx % (w.hazards || [[]]).length]   || [];
  var controls = (w.controls|| [])[idx % (w.controls|| [[]]).length]   || [];

  // Convert arrays to multi-line text for the 3 separate text areas
  var taskStepsText = steps.join('\n');
  var hazardText    = hazards.join('\n');
  var controlText   = controls.join('\n');

  // Advance index for next call
  _wordingIdx[jobCode] = (idx + 1) % total;

  return {
    task:          task,
    taskStepsText: taskStepsText,
    hazardText:    hazardText,
    controlText:   controlText,
    variantNum:    idx + 1,
    totalVariants: total,
  };
}
