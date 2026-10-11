// gemini-proxy for aapstack.tech (Node 22 function: (req) => { status, body }).
// Keeps the Gemini / OpenRouter keys server-side. Secrets come from req.env:
//   GEMINI_API_KEY (required), OPENROUTER_API_KEY (optional fallback), YOUTUBE_API_KEY (reported only), GEMINI_MODEL (optional)
// Actions: validate_secrets · health_check · ai_orchestrator · chat · symptom_check
// Deploy: node scripts/deploy-aapstack-function.mjs gemini-proxy

const GEMINI = "https://generativelanguage.googleapis.com/v1beta/models";

async function gemini(env, model, contents, opts = {}) {
  const res = await fetch(`${GEMINI}/${model}:generateContent?key=${env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      ...(opts.system ? { systemInstruction: { parts: [{ text: opts.system }] } } : {}),
      generationConfig: { temperature: opts.temperature ?? 0.7, maxOutputTokens: opts.maxTokens ?? 8192 },
    }),
    signal: AbortSignal.timeout(50_000),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error?.message || `Gemini HTTP ${res.status}`);
  const text = (json?.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("");
  if (!text) throw new Error(json?.promptFeedback?.blockReason ? `blocked: ${json.promptFeedback.blockReason}` : "Gemini returned no text");
  return text;
}

async function openrouter(env, model, system, prompt) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "HTTP-Referer": "https://vaartanow.com",
      "X-Title": "VaartaNow",
      ...(env.OPENROUTER_API_KEY ? { Authorization: `Bearer ${env.OPENROUTER_API_KEY}` } : {}),
    },
    body: JSON.stringify({ model, messages: [{ role: "system", content: system }, { role: "user", content: prompt }], temperature: 0.7 }),
    signal: AbortSignal.timeout(50_000),
  });
  const json = await res.json().catch(() => ({}));
  const text = json?.choices?.[0]?.message?.content;
  if (!res.ok || !text) throw new Error(json?.error?.message || `OpenRouter HTTP ${res.status}`);
  return text;
}

const ok = (body) => ({ status: 200, headers: { "Content-Type": "application/json" }, body });
const fail = (status, error) => ({ status, headers: { "Content-Type": "application/json" }, body: { error } });

export default async function (req) {
  const env = req.env ?? {};
  const body = (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body) ?? {};
  const { action, prompt, systemInstruction, preferredModel, agent, userMsg, chatHistory, symptomsText, lang } = body;
  const defaultModel = env.GEMINI_MODEL || "gemini-3.5-flash-lite";

  try {
    if (action === "validate_secrets") {
      return ok({ status: "success", gemini: !!env.GEMINI_API_KEY, openrouter: !!env.OPENROUTER_API_KEY, youtube: !!env.YOUTUBE_API_KEY });
    }

    if (!env.GEMINI_API_KEY && action !== "ai_orchestrator") return fail(503, "GEMINI_API_KEY is not set for this project");

    if (action === "health_check") {
      const headline = (await gemini(env, defaultModel, [{ role: "user", parts: [{ text: "Write one short, neutral Telugu news headline about weather in Visakhapatnam. Reply with the headline only." }] }], { maxTokens: 200 })).trim();
      return ok({ status: "success", headline, model: defaultModel });
    }

    if (action === "ai_orchestrator") {
      const model = preferredModel || (agent === "lesson" ? "gemini-3.5-flash-lite" : defaultModel);
      const errors = [];
      if (env.GEMINI_API_KEY) {
        try {
          const text = await gemini(env, model, [{ role: "user", parts: [{ text: prompt || "" }] }], { system: systemInstruction });
          return ok({ text, provider: "gemini", model });
        } catch (e) {
          errors.push(`gemini: ${e.message}`);
          // an unknown/retired model id: retry once with the project's default model
          if (model !== defaultModel && /not found|not supported|invalid model/i.test(e.message)) {
            try {
              const text = await gemini(env, defaultModel, [{ role: "user", parts: [{ text: prompt || "" }] }], { system: systemInstruction });
              return ok({ text, provider: "gemini", model: defaultModel });
            } catch (e2) { errors.push(`gemini ${defaultModel}: ${e2.message}`); }
          }
        }
      }
      try {
        const orModel = "openrouter/free";
        const text = await openrouter(env, orModel, systemInstruction || "You are a helpful assistant for Telugu readers.", prompt || "");
        return ok({ text, provider: "openrouter", model: orModel });
      } catch (e) {
        errors.push(`openrouter: ${e.message}`);
      }
      return fail(503, `All AI providers unavailable (${errors.join("; ")})`);
    }

    if (action === "chat") {
      const history = (Array.isArray(chatHistory) ? chatHistory : [])
        .filter((c) => c && c.text)
        .map((c) => ({ role: c.role === "model" || c.role === "assistant" ? "model" : "user", parts: [{ text: String(c.text) }] }));
      const system = lang === "te"
        ? "మీరు VaartaNow ఆరోగ్య సహాయకుడు. సరళమైన తెలుగులో సాధారణ ఆరోగ్య సమాచారం ఇవ్వండి. రోగనిర్ధారణ లేదా మందుల మోతాదు చెప్పవద్దు; అవసరమైతే వైద్యుడిని సంప్రదించమని చెప్పండి."
        : "You are the VaartaNow health assistant. Give general health information in simple language. Do not diagnose or give medicine doses; advise seeing a doctor when needed.";
      const text = await gemini(env, defaultModel, [...history, { role: "user", parts: [{ text: String(userMsg || prompt || "") }] }], { system });
      return ok({ text });
    }

    if (action === "symptom_check") {
      const te = lang === "te";
      const labels = te
        ? ["లక్షణాలు", "సాధ్యమయ్యే కారణాలు", "స్వీయ సంరక్షణ", "వైద్యుడిని సంప్రదించాలి", "అత్యవసర హెచ్చరిక"]
        : ["Symptoms", "Possible Causes", "Self-Care", "See Doctor If", "Emergency Warning"];
      const instruction = `${te ? "తెలుగులో" : "In English"}, give general (not diagnostic) guidance for these symptoms: "${String(symptomsText || "").slice(0, 1000)}".
Use exactly these five headings, each followed by a colon and short points:
${labels.map((l) => `${l}:`).join("\n")}
Do not name medicines or doses. Always say to see a doctor if symptoms are severe or last more than a few days.`;
      const text = await gemini(env, defaultModel, [{ role: "user", parts: [{ text: instruction }] }], { temperature: 0.3, maxTokens: 1500 });
      return ok({ text });
    }

    return fail(400, "Invalid action");
  } catch (e) {
    return fail(500, e?.message || String(e));
  }
}
