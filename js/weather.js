/* ═══════════════════════════════════════════════════════════════
   js/weather.js — Calgary weather via Open-Meteo (no API key)
   Fallback: wttr.in · Final fallback: current time
═══════════════════════════════════════════════════════════════ */

// WMO weather code → short description
const WX_CODES = {
  0:  'Clear',
  1:  'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Icy Fog',
  51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
  61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain',
  71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow',
  77: 'Snow Grains',
  80: 'Light Showers', 81: 'Showers', 82: 'Heavy Showers',
  85: 'Snow Showers', 86: 'Heavy Snow Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm + Hail', 99: 'Severe Thunderstorm',
};

// Exposed globals for advisory logic
window._wxTemp = null;   // number (°C) or null
window._wxCode = null;   // WMO code or null

async function fetchWeather() {
  const tempEl = document.getElementById('wxTemp');
  const descEl = document.getElementById('wxDesc');
  if (!tempEl || !descEl) return;

  // ── PRIMARY: Open-Meteo (no key, CORS-enabled) ────────────
  try {
    const url = 'https://api.open-meteo.com/v1/forecast' +
      '?latitude=51.0447&longitude=-114.0719' +
      '&current=temperature_2m,weather_code' +
      '&temperature_unit=celsius' +
      '&timezone=America%2FEdmonton';

    const res  = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();

    if (data && data.current) {
      const temp = Math.round(data.current.temperature_2m);
      const code = data.current.weather_code;
      const desc = WX_CODES[code] || 'YYC';

      tempEl.textContent = temp + '°';
      descEl.textContent = desc + ' · YYC';

      window._wx     = temp + '° ' + desc;
      window._wxTemp = temp;
      window._wxCode = code;

      renderWeatherAdvisory();
      return;
    }
  } catch(e) { /* fall through */ }

  // ── FALLBACK: wttr.in ─────────────────────────────────────
  try {
    const res  = await fetch('https://wttr.in/Calgary?format=j1', {
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();

    if (data && data.current_condition && data.current_condition[0]) {
      const cc   = data.current_condition[0];
      const temp = parseInt(cc.temp_C, 10);
      const desc = (cc.weatherDesc && cc.weatherDesc[0] && cc.weatherDesc[0].value) || 'YYC';
      const short = desc.split(' ').slice(0, 2).join(' ');

      tempEl.textContent = temp + '°';
      descEl.textContent = short + ' · YYC';

      window._wx     = temp + '° ' + short;
      window._wxTemp = isNaN(temp) ? null : temp;
      window._wxCode = null;

      renderWeatherAdvisory();
      return;
    }
  } catch(e) { /* fall through */ }

  // ── FINAL FALLBACK: current time ──────────────────────────
  const now = new Date();
  tempEl.textContent = now.toTimeString().slice(0, 5);
  descEl.textContent = 'YYC';
  window._wx     = '';
  window._wxTemp = null;
  window._wxCode = null;
}

// Auto-refresh every 10 minutes; re-render advisory on refresh
setInterval(function() { fetchWeather().then(renderWeatherAdvisory); }, 10 * 60 * 1000);


// ── 7-DAY FORECAST ─────────────────────────────────────────────
// Stores raw hourly arrays from Open-Meteo
window._wxForecastHourly = null;   // { times[], temps[], codes[], precip[], wind[] }

async function fetchForecast() {
  try {
    const url = 'https://api.open-meteo.com/v1/forecast' +
      '?latitude=51.0447&longitude=-114.0719' +
      '&hourly=temperature_2m,weather_code,precipitation_probability,wind_speed_10m' +
      '&temperature_unit=celsius' +
      '&timezone=America%2FEdmonton' +
      '&forecast_days=8';

    const res  = await fetch(url, { signal: AbortSignal.timeout(6000) });
    const data = await res.json();

    if (data && data.hourly) {
      window._wxForecastHourly = {
        times:  data.hourly.time,
        temps:  data.hourly.temperature_2m,
        codes:  data.hourly.weather_code,
        precip: data.hourly.precipitation_probability,
        wind:   data.hourly.wind_speed_10m,
      };
      return true;
    }
  } catch(e) {}
  return false;
}


// Returns aggregated weather for a given date + hour window
// e.g. getForecastBlock('2026-03-24', 6, 18)  → day shift
//      getForecastBlock('2026-03-24', 18, 30)  → night shift (30 = next-day 6am)
function getForecastBlock(dateStr, startHour, endHour) {
  const h = window._wxForecastHourly;
  if (!h) return null;

  const times  = h.times;
  const temps  = h.temps;
  const codes  = h.codes;
  const precip = h.precip;
  const wind   = h.wind;

  // Collect all hourly entries that fall within this window
  const rows = [];
  for (let i = 0; i < times.length; i++) {
    const t    = times[i];
    const date = t.slice(0, 10);
    const hour = parseInt(t.slice(11, 13), 10);

    // For night shifts that cross midnight, endHour > 24
    // We match the base date for hours startHour..23, and next date for 0..(endHour-24)
    if (endHour <= 24) {
      if (date === dateStr && hour >= startHour && hour < endHour) {
        rows.push(i);
      }
    } else {
      // Night shift: startHour..23 on dateStr, 0..(endHour-24) on next day
      const nextDate = new Date(dateStr + 'T00:00:00');
      nextDate.setDate(nextDate.getDate() + 1);
      const nextStr  = nextDate.toISOString().slice(0, 10);

      if (date === dateStr && hour >= startHour) rows.push(i);
      if (date === nextStr  && hour < (endHour - 24)) rows.push(i);
    }
  }

  if (rows.length === 0) return null;

  const blockTemps  = rows.map(function(i) { return temps[i];  });
  const blockCodes  = rows.map(function(i) { return codes[i];  });
  const blockPrecip = rows.map(function(i) { return precip[i] || 0; });
  const blockWind   = rows.map(function(i) { return wind[i]   || 0; });

  // Dominant weather code (most frequent)
  const codeCounts = {};
  blockCodes.forEach(function(c) { codeCounts[c] = (codeCounts[c] || 0) + 1; });
  const domCode = parseInt(Object.keys(codeCounts).sort(function(a, b) {
    return codeCounts[b] - codeCounts[a];
  })[0], 10);

  return {
    tempMin:   Math.round(Math.min.apply(null, blockTemps)),
    tempMax:   Math.round(Math.max.apply(null, blockTemps)),
    tempAvg:   Math.round(blockTemps.reduce(function(s, v) { return s + v; }, 0) / blockTemps.length),
    domCode:   domCode,
    desc:      WX_CODES[domCode] || 'Variable',
    precipMax: Math.round(Math.max.apply(null, blockPrecip)),
    windMax:   Math.round(Math.max.apply(null, blockWind)),
  };
}


// Returns hazard flags for a forecast block
function forecastHazards(block) {
  if (!block) return [];
  const flags = [];
  const t = block.tempAvg;
  const c = block.domCode;

  if (t <= -20)             flags.push({ icon: '🥶', label: 'Extreme Cold', color: '#1565c0' });
  else if (t <= -10)        flags.push({ icon: '🧥', label: 'Very Cold',    color: '#1976d2' });
  else if (t <= 0)          flags.push({ icon: '🌡️', label: 'Cold',         color: '#0288d1' });
  else if (t >= 35)         flags.push({ icon: '🌡️', label: 'Extreme Heat', color: '#b71c1c' });
  else if (t >= 30)         flags.push({ icon: '☀️', label: 'Hot',          color: '#e53935' });

  if (c >= 95)              flags.push({ icon: '⛈️', label: 'Thunderstorm', color: '#6a1b9a' });
  else if (c >= 71 && c <= 77 || c >= 85 && c <= 86)
                            flags.push({ icon: '❄️', label: 'Snow',         color: '#1565c0' });
  else if (c >= 61 && c <= 67)
                            flags.push({ icon: '🌧️', label: 'Rain',         color: '#37474f' });
  else if (c >= 51 && c <= 55)
                            flags.push({ icon: '🌦️', label: 'Drizzle',      color: '#546e7a' });
  if (c === 45 || c === 48) flags.push({ icon: '🌫️', label: 'Fog',          color: '#546e7a' });

  if (block.windMax >= 50)  flags.push({ icon: '💨', label: 'High Wind',    color: '#ff6f00' });
  if (block.precipMax >= 70)flags.push({ icon: '☂️', label: 'High Precip',  color: '#37474f' });

  return flags;
}


// ── FORECAST MODAL ─────────────────────────────────────────────

function openForecastModal() {
  const modal = document.getElementById('forecastModal');
  if (!modal) return;
  modal.style.display = 'flex';
  renderForecastModal();

  // Kick off fetch if not already loaded
  if (!window._wxForecastHourly) {
    fetchForecast().then(function(ok) {
      if (ok) renderForecastModal();
    });
  }
}

function closeForecastModal() {
  const modal = document.getElementById('forecastModal');
  if (modal) modal.style.display = 'none';
}

function renderForecastModal() {
  const body = document.getElementById('forecastBody');
  if (!body) return;

  if (!window._wxForecastHourly) {
    body.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text3)">Loading forecast…</div>';
    return;
  }

  body.innerHTML = '';

  // Build 7 days of shift blocks
  for (let d = 0; d < 7; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d);
    const dateStr  = date.toISOString().slice(0, 10);
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const dayLabel = (d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : dayNames[date.getDay()]) +
                     ' ' + date.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][date.getMonth()];

    // Shift info from shift calculator
    var shiftDay  = (typeof getShiftInfo === 'function') ? getShiftInfo(dateStr + 'T06:00') : null;
    var shiftNight= (typeof getShiftInfo === 'function') ? getShiftInfo(dateStr + 'T18:00') : null;

    const dayBlock   = getForecastBlock(dateStr, 6, 18);
    const nightBlock = getForecastBlock(dateStr, 18, 30);

    // Day card section
    const section = document.createElement('div');
    section.className = 'fc-day-section';

    const heading = document.createElement('div');
    heading.className   = 'fc-day-heading';
    heading.textContent = dayLabel;
    section.appendChild(heading);

    // Day shift
    if (dayBlock) {
      section.appendChild(makeForecastShiftCard(dayBlock, 'Day Shift', '☀️ 06:00–18:00', shiftDay));
    }
    // Night shift
    if (nightBlock) {
      section.appendChild(makeForecastShiftCard(nightBlock, 'Night Shift', '🌙 18:00–06:00', shiftNight));
    }

    body.appendChild(section);
  }
}

function makeForecastShiftCard(block, shiftLabel, timeLabel, shiftInfo) {
  const card = document.createElement('div');
  card.className = 'fc-shift-card';

  // Highlight SHIFT 1 working shifts
  const isOurShift = shiftInfo && shiftInfo.type !== 'off';
  if (isOurShift) card.classList.add('our-shift');

  // Top row: time label + shift badge
  const top = document.createElement('div');
  top.className = 'fc-shift-top';

  const labelEl = document.createElement('div');
  labelEl.className   = 'fc-shift-label';
  labelEl.textContent = timeLabel;

  if (isOurShift) {
    const badge = document.createElement('span');
    badge.className   = 'fc-shift-badge';
    badge.textContent = 'SHIFT 1 · ' + (shiftInfo.label || shiftLabel);
    labelEl.appendChild(badge);
  }

  const tempEl = document.createElement('div');
  tempEl.className   = 'fc-shift-temp';
  tempEl.textContent = block.tempMin + '°→' + block.tempMax + '°C';

  top.appendChild(labelEl);
  top.appendChild(tempEl);
  card.appendChild(top);

  // Condition + wind/precip line
  const descEl = document.createElement('div');
  descEl.className   = 'fc-shift-desc';
  descEl.textContent = block.desc +
    (block.windMax > 20 ? ' · 💨 ' + block.windMax + ' km/h' : '') +
    (block.precipMax > 20 ? ' · ☂️ ' + block.precipMax + '%' : '');
  card.appendChild(descEl);

  // Hazard flags
  const hazards = forecastHazards(block);
  if (hazards.length > 0) {
    const flags = document.createElement('div');
    flags.className = 'fc-hazard-flags';
    hazards.forEach(function(h) {
      const chip = document.createElement('span');
      chip.className = 'fc-hazard-chip';
      chip.style.borderColor = h.color;
      chip.style.color       = h.color;
      chip.textContent       = h.icon + ' ' + h.label;
      flags.appendChild(chip);
    });
    card.appendChild(flags);
  }

  return card;
}


// ── FORECAST FOR PSI DATE ──────────────────────────────────────
// Called when the user changes the PSI date — updates advisories to match that day

function updateWeatherForPSIDate(dateStr) {
  if (!dateStr || !window._wxForecastHourly) return;

  const today = new Date().toISOString().slice(0, 10);
  if (dateStr === today) {
    // Use live current weather
    renderWeatherAdvisory();
    return;
  }

  // Future date: use forecasted conditions for the day shift window (default)
  const block = getForecastBlock(dateStr, 6, 18);
  if (!block) { renderWeatherAdvisory(); return; }

  // Temporarily use forecasted values for advisory render
  const savedTemp = window._wxTemp;
  const savedCode = window._wxCode;

  window._wxTemp = block.tempAvg;
  window._wxCode = block.domCode;
  renderWeatherAdvisory();

  // Restore actuals
  window._wxTemp = savedTemp;
  window._wxCode = savedCode;
}


// ── WEATHER ADVISORY ──────────────────────────────────────────
// Returns array of {icon, text, color} tip objects based on conditions.

function getWeatherAdvisories() {
  const temp = window._wxTemp;
  const code = window._wxCode;
  var tips = [];

  if (temp === null) return tips;

  // Cold
  if (temp <= -20) {
    tips.push({ icon: '🥶', color: '#1565c0', text: 'Extreme cold (' + temp + '°C) — mandatory thermal layers, limit exposure time to 20 min, buddy system in effect.' });
    tips.push({ icon: '🧣', color: '#1565c0', text: 'Cover all exposed skin. Frostbite can set in within minutes at this temperature.' });
    tips.push({ icon: '☕', color: '#1565c0', text: 'Warm-up breaks every 20 minutes minimum. Hot drinks available — stay fuelled.' });
  } else if (temp <= -10) {
    tips.push({ icon: '🧥', color: '#1976d2', text: 'Very cold (' + temp + '°C) — dress in thermal layers, keep core warm, take a 5-min warm-up break every 45 min.' });
    tips.push({ icon: '🧤', color: '#1976d2', text: 'Wear insulated gloves — cold hands reduce grip strength and dexterity. Swap gloves if wet.' });
    tips.push({ icon: '🧊', color: '#1976d2', text: 'Watch for ice on all surfaces — metal walkways, ladders, and ramps will be slippery.' });
  } else if (temp <= 0) {
    tips.push({ icon: '🌡️', color: '#0288d1', text: 'Cold conditions (' + temp + '°C) — layer up, stay dry, take regular warm-up breaks.' });
    tips.push({ icon: '🧊', color: '#0288d1', text: 'Check for frost and ice on walking surfaces before each step.' });
  } else if (temp <= 5) {
    tips.push({ icon: '🌬️', color: '#0288d1', text: 'Chilly out there (' + temp + '°C) — wind chill may make it feel colder. Wear a windproof outer layer.' });
  }

  // Heat
  if (temp >= 35) {
    tips.push({ icon: '🌡️', color: '#b71c1c', text: 'Extreme heat (' + temp + '°C) — mandatory cooling breaks every 30 min in shade or AC.' });
    tips.push({ icon: '💧', color: '#b71c1c', text: 'Drink 250 mL of water every 15–20 minutes — do NOT wait until you feel thirsty.' });
    tips.push({ icon: '🫀', color: '#b71c1c', text: 'Know the signs of heat stroke: confusion, no sweating, red skin. Call for help immediately if you see this.' });
  } else if (temp >= 30) {
    tips.push({ icon: '☀️', color: '#e53935', text: 'Hot conditions (' + temp + '°C) — drink water every 20 min, take a 10-min shade break every hour.' });
    tips.push({ icon: '😰', color: '#e53935', text: 'Buddy-check each other for heat exhaustion: heavy sweating, weakness, dizziness. Rest and hydrate.' });
  } else if (temp >= 25) {
    tips.push({ icon: '🌞', color: '#f57c00', text: 'Warm day (' + temp + '°C) — keep drinking water and take breaks in shade when you can.' });
  }

  // Weather code based
  if (code !== null) {
    // Rain / drizzle
    if (code >= 51 && code <= 67) {
      tips.push({ icon: '🌧️', color: '#37474f', text: 'Wet conditions — all surfaces will be slippery. Take small careful steps, especially on metal grates and stairs.' });
      tips.push({ icon: '⚡', color: '#37474f', text: 'Keep electrical tools and equipment covered and away from standing water.' });
    }
    // Snow / showers
    if (code >= 71 && code <= 77 || code >= 85 && code <= 86) {
      tips.push({ icon: '❄️', color: '#1565c0', text: 'Snow on the ground — sweep and salt your work area before starting. Check for packed ice under fresh snow.' });
      tips.push({ icon: '👀', color: '#1565c0', text: 'Snow can hide trip hazards and ground markings — scan the ground before every step.' });
    }
    // Wind / showers / heavy
    if (code >= 80 && code <= 82) {
      tips.push({ icon: '🌧️', color: '#37474f', text: 'Heavy showers — wet surfaces everywhere. Waterproof PPE recommended. Protect all documents and equipment.' });
    }
    // Fog
    if (code === 45 || code === 48) {
      tips.push({ icon: '🌫️', color: '#546e7a', text: 'Low visibility fog — high-vis vest mandatory. Maintain extra distance from moving equipment and vehicles.' });
      tips.push({ icon: '📢', color: '#546e7a', text: 'Use radio/verbal communication more frequently — do not assume you can be seen.' });
    }
    // Thunderstorm
    if (code >= 95) {
      tips.push({ icon: '⛈️', color: '#6a1b9a', text: 'Thunderstorm risk — avoid open elevated areas and lone tall structures. Suspend work at height immediately.' });
      tips.push({ icon: '🏚️', color: '#6a1b9a', text: 'Shelter in a hard-sided vehicle or building. Stay away from trees, fences, and poles.' });
    }
    // Windy conditions — check for any heavy weather code as proxy (no wind speed from this API)
    if (code >= 80 || (temp !== null && temp < 5)) {
      // Only add wind tip if not already lots of tips
    }
  }

  return tips;
}


function renderWeatherAdvisory() {
  const box = document.getElementById('wxAdvisory');
  if (!box) return;

  const tips = getWeatherAdvisories();
  if (!tips.length) {
    box.innerHTML = '';
    box.style.display = 'none';
    return;
  }

  const temp = window._wxTemp;
  const desc = (window._wx || '').replace(/^\d+°\s*/, '') || 'Current conditions';
  const label = temp !== null ? temp + '°C · ' + desc : desc;

  box.innerHTML = '';
  box.style.display = 'block';

  const heading = document.createElement('div');
  heading.className = 'wx-advisory-head';
  heading.innerHTML = '<span>⚠️ Weather Advisory</span><span class="wx-advisory-temp">' + label + '</span>';
  box.appendChild(heading);

  tips.forEach(function(tip) {
    const row = document.createElement('div');
    row.className = 'wx-advisory-tip';
    row.style.borderLeftColor = tip.color;
    row.innerHTML = '<span class="wx-tip-icon">' + tip.icon + '</span>'
                  + '<span class="wx-tip-text">' + tip.text + '</span>';
    box.appendChild(row);
  });
}
