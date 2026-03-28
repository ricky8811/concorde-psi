/* local ai-like generation layer: varies wording without changing job intent */
(function() {
  var _variantSeed = {};
  var _aiRemoteState = {
    endpointUrl: '',
    enabled: false,
    lastMode: 'local'
  };

  function clean(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function splitLines(text) {
    return String(text || '')
      .split(/\r?\n/)
      .map(function(line) { return clean(line); })
      .filter(Boolean);
  }

  function uniqueLines(lines) {
    var seen = {};
    return (lines || []).filter(function(line) {
      var key = clean(line).toLowerCase();
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function pick(list, idx) {
    if (!list || !list.length) return '';
    return list[idx % list.length];
  }

  function nextSeed(key) {
    key = key || 'default';
    _variantSeed[key] = ((_variantSeed[key] || 0) + 1);
    return _variantSeed[key] - 1;
  }

  function sentenceCase(text) {
    var out = clean(text);
    if (!out) return '';
    return out.charAt(0).toUpperCase() + out.slice(1);
  }

  function titleCase(text) {
    return clean(text).replace(/\w\S*/g, function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
  }

  function fromRows(rows, idx) {
    return ((rows || []).map(function(row) {
      return clean(row && row[idx]);
    }).filter(Boolean)).join('\n');
  }

  function getTemplateBase(tmpl) {
    if (!tmpl) {
      return {
        taskDesc: '',
        steps: '',
        hazards: '',
        controls: ''
      };
    }
    return {
      taskDesc: clean(tmpl.taskDesc || ''),
      steps: clean(tmpl.taskStepsText || '') || fromRows(tmpl.taskRows, 0),
      hazards: clean(tmpl.hazardText || '') || fromRows(tmpl.taskRows, 1),
      controls: clean(tmpl.controlText || '') || fromRows(tmpl.taskRows, 2)
    };
  }

  function varyTask(task, idx) {
    task = clean(task);
    if (!task) return '';
    var starters = [
      '',
      'Complete work to ',
      'Carry out work to ',
      'Perform work to ',
      'Proceed to '
    ];
    var endings = [
      '',
      ' safely.',
      ' in a controlled manner.',
      ' following site safety requirements.',
      ' and confirm normal operation.'
    ];
    var starter = pick(starters, idx);
    var ending = pick(endings, idx + 1);
    var out = starter ? starter + task.toLowerCase() : sentenceCase(task);
    out = clean(out.replace(/\.$/, '')) + ending;
    return sentenceCase(out);
  }

  function varyShortTitle(task, tmpl, idx) {
    if (tmpl && tmpl.name) {
      var base = clean(tmpl.name);
      var suffixes = ['', ' - Field Work', ' - Daily Work', ' - Airside'];
      return clean(base + pick(suffixes, idx));
    }
    var short = titleCase(task).split(/\s+/).slice(0, 6).join(' ');
    return short || 'PSI Work';
  }

  function varyLines(text, idx, mode) {
    var lines = uniqueLines(splitLines(text));
    if (!lines.length) return '';

    var prefixes = mode === 'control'
      ? ['Use ', 'Ensure ', 'Maintain ', 'Confirm ']
      : ['Watch for ', 'Be aware of ', 'Potential for ', 'Risk of '];

    return lines.map(function(line, lineIdx) {
      var base = clean(line).replace(/^[\-\u2022]\s*/, '');
      if (!base) return '';
      if (base.length > 80) return sentenceCase(base);
      if (/^(use|ensure|maintain|confirm|watch for|be aware of|potential for|risk of)\b/i.test(base)) {
        return sentenceCase(base);
      }
      var prefix = pick(prefixes, idx + lineIdx);
      if (!prefix) return sentenceCase(base);
      if (mode === 'control') return sentenceCase(prefix + base.toLowerCase());
      return sentenceCase(prefix + base.toLowerCase());
    }).filter(Boolean).join('\n');
  }

  function buildFromTemplate(taskText, tmpl, seed) {
    var base = getTemplateBase(tmpl);
    var wording = (tmpl && typeof applyWording === 'function' && getWording(tmpl.code))
      ? applyWording(tmpl.code)
      : null;
    var anchoredTask = clean(taskText || base.taskDesc || (tmpl && tmpl.name) || 'complete assigned work');

    var longTaskText = varyTask(
      anchoredTask,
      seed
    );

    var shortTitle = varyShortTitle(anchoredTask || longTaskText, tmpl, seed);
    var taskStepsText = longTaskText || (wording && wording.taskStepsText) || varyLines(base.steps || anchoredTask, seed, 'step');
    var hazardText = (wording && wording.hazardText) || varyLines(base.hazards, seed, 'hazard');
    var controlText = (wording && wording.controlText) || varyLines(base.controls, seed, 'control');

    return {
      shortTitle: shortTitle,
      taskDesc: clean(base.taskDesc || (tmpl && tmpl.taskDesc) || shortTitle),
      taskStepsText: taskStepsText,
      hazardText: hazardText,
      controlText: controlText,
      variantNum: seed + 1,
      _aiSource: 'local'
    };
  }

  function normalizePack(pack, fallbackTask, tmpl) {
    if (!pack) return null;
    var base = getTemplateBase(tmpl);
    var anchoredTask = clean(fallbackTask || base.taskDesc || (tmpl && tmpl.name) || '');
    var shortTitle = clean(pack.shortTitle || pack.jobTitle || varyShortTitle(anchoredTask, tmpl, 0));
    return {
      shortTitle: shortTitle,
      taskDesc: clean(base.taskDesc || (tmpl && tmpl.taskDesc) || pack.taskDesc || pack.task || shortTitle),
      taskStepsText: clean(pack.taskStepsText || pack.steps || pack.task || pack.taskDesc || anchoredTask || base.steps),
      hazardText: clean(pack.hazardText || pack.hazards || base.hazards),
      controlText: clean(pack.controlText || pack.controls || base.controls),
      variantNum: pack.variantNum || 1,
      _aiSource: clean(pack._aiSource || pack.source || 'remote').toLowerCase()
    };
  }

  function refreshRemoteConfig() {
    var cfg = (typeof loadAICfg === 'function') ? loadAICfg() : {
      endpointUrl: (typeof AI_ENDPOINT_URL !== 'undefined' ? AI_ENDPOINT_URL : ''),
      enabled: !!(typeof AI_ENDPOINT_URL !== 'undefined' ? AI_ENDPOINT_URL : '')
    };
    _aiRemoteState.endpointUrl = String((cfg && cfg.endpointUrl) || '').trim();
    _aiRemoteState.enabled = !!(cfg && cfg.enabled && _aiRemoteState.endpointUrl);
    return _aiRemoteState;
  }

  function callRemoteAI(payload) {
    var cfg = refreshRemoteConfig();
    if (!cfg.enabled || !cfg.endpointUrl || typeof fetch !== 'function') {
      return Promise.resolve(null);
    }
    return fetch(cfg.endpointUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {})
    }).then(function(res) {
      if (!res.ok) throw new Error('AI request failed');
      return res.json();
    }).then(function(data) {
      _aiRemoteState.lastMode = 'remote';
      var result = data && (data.result || data);
      if (result && typeof result === 'object' && !result._aiSource) {
        result._aiSource = 'remote';
      }
      return result;
    }).catch(function() {
      _aiRemoteState.lastMode = 'local';
      return null;
    });
  }

  window.AIEngine = {
    getMode: function() {
      refreshRemoteConfig();
      return _aiRemoteState.enabled ? _aiRemoteState.lastMode : 'local';
    },
    isRemoteEnabled: function() {
      refreshRemoteConfig();
      return _aiRemoteState.enabled;
    },
    generateTaskPack: function(taskText, tmpl, opts) {
      opts = opts || {};
      var key = (tmpl && tmpl.code) || clean(taskText) || 'manual';
      var seed = typeof opts.seed === 'number' ? opts.seed : nextSeed(key);
      return buildFromTemplate(taskText, tmpl, seed);
    },
    generateTaskPackAsync: function(taskText, tmpl, opts) {
      opts = opts || {};
      var localPack = this.generateTaskPack(taskText, tmpl, opts);
      return callRemoteAI({
        mode: 'generate',
        taskText: clean(taskText),
        template: tmpl || null,
        localPack: localPack,
        context: {
          weather: (typeof window !== 'undefined' ? (window._wx || '') : ''),
          weatherTemp: (typeof window !== 'undefined' ? window._wxTemp : null),
          weatherCode: (typeof window !== 'undefined' ? window._wxCode : null)
        }
      }).then(function(remotePack) {
        return normalizePack(remotePack, taskText, tmpl) || localPack;
      });
    },
    regenerateForCurrentJob: function(jobCode, taskText, tmpl) {
      var key = jobCode || clean(taskText) || 'manual';
      return buildFromTemplate(taskText, tmpl, nextSeed(key));
    },
    regenerateForCurrentJobAsync: function(jobCode, taskText, tmpl) {
      var localPack = this.regenerateForCurrentJob(jobCode, taskText, tmpl);
      return callRemoteAI({
        mode: 'regenerate',
        jobCode: jobCode || '',
        taskText: clean(taskText),
        template: tmpl || null,
        localPack: localPack,
        context: {
          weather: (typeof window !== 'undefined' ? (window._wx || '') : ''),
          weatherTemp: (typeof window !== 'undefined' ? window._wxTemp : null),
          weatherCode: (typeof window !== 'undefined' ? window._wxCode : null)
        }
      }).then(function(remotePack) {
        return normalizePack(remotePack, taskText, tmpl) || localPack;
      });
    }
  };
})();
