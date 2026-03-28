const { onRequest } = require("firebase-functions/v2/https");

function applyCors(res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
}

function clean(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function buildFallback(taskText, template, localPack) {
  return {
    shortTitle: clean((localPack && localPack.shortTitle) || (template && template.name) || taskText).slice(0, 80),
    taskDesc: clean((localPack && localPack.taskDesc) || taskText),
    taskStepsText: clean(localPack && localPack.taskStepsText),
    hazardText: clean(localPack && localPack.hazardText),
    controlText: clean(localPack && localPack.controlText)
  };
}

function buildPrompt(payload) {
  const template = payload.template || {};
  const localPack = payload.localPack || {};
  const fallback = buildFallback(payload.taskText, template, localPack);
  return [
    "You generate PSI wording for airport maintenance work.",
    "Keep the work scope and safety meaning stable.",
    "Stay as close as possible to the user's typed task text. Do not invent a different job.",
    "If the user's typed task and template wording differ, prioritize the user's typed task and use the template only as a safety/style guide.",
    "Use plain professional field language, not corporate wording.",
    "Return strict JSON only with keys: shortTitle, taskDesc, taskStepsText, hazardText, controlText.",
    "",
    "Field rules:",
    "- shortTitle: 2 to 5 words max, very close to the typed task.",
    "- taskDesc: very short label, close to the saved template description if provided. Do not turn this into a sentence.",
    "- taskStepsText: concise work summary of the actual task. 1 to 3 short lines or sentences is enough.",
    "- hazardText: only hazards that actually fit the typed task.",
    "- controlText: matching controls only. Keep them practical and field-ready.",
    "- Keep equipment names, locations, and work intent from the user's text whenever possible.",
    "- Avoid generic filler like 'complete assigned work safely' unless the source text is too vague.",
    "",
    "User typed task:",
    clean(payload.taskText),
    "",
    "Template name:",
    clean(template.name),
    "",
    "Template code:",
    clean(template.code),
    "",
    "Saved template short description:",
    clean(template.taskDesc || ""),
    "",
    "Saved template task location:",
    clean(template.taskLoc || ""),
    "",
    "Current wording:",
    JSON.stringify(fallback)
  ].join("\n");
}

async function callOpenAI(payload) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
      input: buildPrompt(payload),
      text: {
        format: {
          type: "json_schema",
          name: "psi_wording",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              shortTitle: { type: "string" },
              taskDesc: { type: "string" },
              taskStepsText: { type: "string" },
              hazardText: { type: "string" },
              controlText: { type: "string" }
            },
            required: ["shortTitle", "taskDesc", "taskStepsText", "hazardText", "controlText"]
          }
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status}`);
  }

  const data = await response.json();
  const text = (((data || {}).output || [])[0] || {}).content || [];
  const jsonText = text.map(part => part.text || "").join("").trim();
  return jsonText ? JSON.parse(jsonText) : null;
}

async function callGemini(payload) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL || "gemini-3.1-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(payload) }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini request failed: ${response.status}`);
  }

  const data = await response.json();
  const text = (((data || {}).candidates || [])[0] || {}).content || {};
  const jsonText = ((text.parts || [])[0] || {}).text || "";
  return jsonText ? JSON.parse(jsonText) : null;
}

exports.generatePsiText = onRequest({ cors: false }, async (req, res) => {
  applyCors(res);
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }

  try {
    const payload = req.body || {};
    const provider = String(process.env.AI_PROVIDER || "openai").toLowerCase();
    let result = null;

    if (provider === "gemini") {
      result = await callGemini(payload);
    } else {
      result = await callOpenAI(payload);
    }

    res.json({ result: result || buildFallback(payload.taskText, payload.template, payload.localPack) });
  } catch (err) {
    const payload = req.body || {};
    res.status(200).json({
      result: buildFallback(payload.taskText, payload.template, payload.localPack),
      fallback: true,
      error: err && err.message ? err.message : "AI fallback used"
    });
  }
});
