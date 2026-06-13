import { supabase } from "./supabase";

// Interfaces
export interface MedicineInfo {
  id: string;
  name: string;
  common_uses: string;
  typical_dosage: string;
  side_effects: string;
  warnings: string;
  drug_interactions: string;
}

export interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: string;
  tip_type: "daily" | "weekly" | "seasonal";
  language: "te" | "en";
}

export interface SymptomAnalysisResult {
  symptoms: string;
  possibleCauses: string;
  selfCare: string;
  seeDoctorIf: string;
  emergencyWarning: string;
}

// 🛡️ Input Sanitization & Anti-Injection Filter
function sanitizeInput(text: string): string {
  if (!text) return "";
  // Strip HTML tags and basic injection patterns
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/(drop|delete|insert|update|select)\s+table/gi, "")
    .trim();
}

// 🏥 AI Symptom Checker
export async function analyzeSymptoms(
  symptomsText: string,
  lang: "te" | "en" = "te"
): Promise<SymptomAnalysisResult> {
  const sanitized = sanitizeInput(symptomsText);
  if (!sanitized) {
    throw new Error(lang === "te" ? "దయచేసి మీ లక్షణాలను నమోదు చేయండి." : "Please enter symptoms.");
  }

  // Rate Limiting (Simple localStorage throttling: max 5 requests per minute)
  const now = Date.now();
  const logs = JSON.parse(localStorage.getItem("health_limit_log") || "[]") as number[];
  const recent = logs.filter((t) => now - t < 60000);
  if (recent.length >= 5) {
    throw new Error(
      lang === "te"
        ? "చాలా అభ్యర్థనలు పంపబడ్డాయి. దయచేసి ఒక నిమిషం వేచి ఉండండి."
        : "Too many requests. Please wait a minute."
    );
  }
  localStorage.setItem("health_limit_log", JSON.stringify([...recent, now]));

  // Log symptom query for analytics
  logAnalytics("symptom", sanitized);

  if (!supabase) {
    throw new Error(
      lang === "te"
        ? "డేటాబేస్ సేవ అందుబాటులో లేదు."
        : "Database service is currently unavailable."
    );
  }

  try {
    const { data, error } = await supabase.functions.invoke("gemini-proxy", {
      body: { action: "symptom_check", symptomsText: sanitized, lang }
    });

    if (error || !data?.text) {
      throw new Error(error?.message || "Invalid response from Gemini Proxy");
    }

    return parseSymptomResponse(data.text, sanitized);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(
      lang === "te"
        ? "AI ఆరోగ్య విశ్లేషణ విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి."
        : "AI Symptom analysis failed. Please try again."
    );
  }
}

function parseSymptomResponse(text: string, originalSymptoms: string): SymptomAnalysisResult {
  const result: SymptomAnalysisResult = {
    symptoms: originalSymptoms,
    possibleCauses: "",
    selfCare: "",
    seeDoctorIf: "",
    emergencyWarning: ""
  };

  const sections = [
    { key: "symptoms", regex: /(?:Symptoms|లక్షణాలు):\s*([\s\S]*?)(?=(?:Possible Causes|సాధ్యమయ్యే కారణాలు|Self-Care|స్వీయ సంరక్షణ|See Doctor If|వైద్యుడిని సంప్రదించాలి|Emergency Warning|అత్యవసర హెచ్చరిక|$))/i },
    { key: "possibleCauses", regex: /(?:Possible Causes|సాధ్యమయ్యే కారణాలు):\s*([\s\S]*?)(?=(?:Self-Care|స్వీయ సంరక్షణ|See Doctor If|వైద్యుడిని సంప్రదించాలి|Emergency Warning|అత్యవసర హెచ్చరిక|$))/i },
    { key: "selfCare", regex: /(?:Self-Care|స్వీయ సంరక్షణ):\s*([\s\S]*?)(?=(?:See Doctor If|వైద్యుడిని సంప్రదించాలి|Emergency Warning|అత్యవసర హెచ్చరిక|$))/i },
    { key: "seeDoctorIf", regex: /(?:See Doctor If|వైద్యుడిని సంప్రదించాలి|వైద్యుడిని ఎప్పుడు సంప్రదించాలి):\s*([\s\S]*?)(?=(?:Emergency Warning|అత్యవసర హెచ్చరిక|$))/i },
    { key: "emergencyWarning", regex: /(?:Emergency Warning|అత్యవసర హెచ్చరిక):\s*([\s\S]*?)$/i }
  ];

  sections.forEach((sec) => {
    const match = text.match(sec.regex);
    if (match && match[1]) {
      (result as any)[sec.key] = match[1].trim();
    }
  });

  // Fallback if formatting was not perfect
  if (!result.possibleCauses) {
    result.possibleCauses = text;
  }

  return result;
}

// 💬 AI Conversational Chat Assistant
export async function sendChatMessage(
  sessionId: string,
  userMsg: string,
  chatHistory: { role: "user" | "model"; text: string }[],
  lang: "te" | "en" = "te"
): Promise<string> {
  const sanitized = sanitizeInput(userMsg);
  if (!sanitized) return "";

  // Rate Limiting Check
  const now = Date.now();
  const limitLogs = JSON.parse(localStorage.getItem("health_chat_limit_log") || "[]") as number[];
  const recent = limitLogs.filter((t) => now - t < 60000);
  if (recent.length >= 8) {
    throw new Error(
      lang === "te"
        ? "చాలా సందేశాలు పంపబడ్డాయి. దయచేసి కొద్దిసేపు వేచి ఉండండి."
        : "Too many chat messages. Please wait a minute."
    );
  }
  localStorage.setItem("health_chat_limit_log", JSON.stringify([...recent, now]));

  logAnalytics("chat_query", sanitized);

  if (!supabase) {
    throw new Error(
      lang === "te" ? "డేటాబేస్ సేవ అందుబాటులో లేదు." : "Database service is currently unavailable."
    );
  }

  try {
    const { data, error } = await supabase.functions.invoke("gemini-proxy", {
      body: { action: "chat", userMsg: sanitized, chatHistory, lang }
    });

    if (error || !data?.text) {
      throw new Error(error?.message || "Invalid response from Gemini Proxy");
    }

    const aiResponseText = data.text;

    // Log chat history asynchronously to Supabase
    supabase
      .from("health_chat_history")
      .insert({
        session_id: sessionId,
        user_message: sanitized,
        ai_response: aiResponseText,
        language: lang
      })
      .then(({ error }) => {
        if (error) console.error("Error saving chat log to Supabase:", error.message);
      });

    return aiResponseText;
  } catch (error) {
    console.error("AI Chat Error:", error);
    throw new Error(
      lang === "te"
        ? "AI చాట్ లోపం తలెత్తింది. మళ్ళీ ప్రయత్నించండి."
        : "AI Chat error occurred. Please try again."
    );
  }
}

// 💊 Medicine Lookup
export async function lookupMedicine(name: string): Promise<MedicineInfo | null> {
  if (!supabase || !name.trim()) return null;
  logAnalytics("medicine", name);
  
  try {
    const { data, error } = await supabase
      .from("medicine_information")
      .select("*")
      .ilike("name", `%${name.trim()}%`)
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error("Error looking up medicine:", err);
    return null;
  }
}

// 🍎 Fetch Health Tips (Daily/Weekly/Seasonal)
export async function getHealthTips(lang: "te" | "en" = "te"): Promise<HealthTip[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("health_tips")
      .select("*")
      .eq("language", lang)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error loading health tips:", err);
    return [];
  }
}

// 🧠 Log Health FAQs & Popular topics (Analytics)
export async function getPopularQuestions(category?: string): Promise<any[]> {
  if (!supabase) return [];
  try {
    let query = supabase.from("health_questions").select("*").order("view_count", { ascending: false }).limit(6);
    if (category) {
      query = query.eq("category", category);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error loading FAQs:", err);
    return [];
  }
}

export async function incrementQuestionCount(id: string): Promise<void> {
  const client = supabase;
  if (!client) return;
  try {
    await client.rpc("increment_question_views", { question_id: id });
  } catch {
    // If RPC isn't loaded, fallback update:
    try {
      const { data } = await client.from("health_questions").select("view_count").eq("id", id).single();
      if (data) {
        await client
          .from("health_questions")
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq("id", id);
      }
    } catch {}
  }
}

// 📊 Simple Analytics Logger (localStorage/Supabase wrapper)
export function logAnalytics(topic: "symptom" | "medicine" | "chat_query" | "view", value: string) {
  // Save locally
  const stats = JSON.parse(localStorage.getItem("health_stats") || "{}");
  if (!stats[topic]) stats[topic] = {};
  stats[topic][value] = (stats[topic][value] || 0) + 1;
  localStorage.setItem("health_stats", JSON.stringify(stats));

  const client = supabase;
  // Insert standard question/symptom into FAQ suggestions
  if (topic === "symptom" && client) {
    client
      .from("health_questions")
      .select("id, view_count")
      .eq("question", value)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          client
            .from("health_questions")
            .update({ view_count: (data[0].view_count || 0) + 1 })
            .eq("id", data[0].id)
            .then(() => {});
        } else {
          client
            .from("health_questions")
            .insert({ question: value, view_count: 1, category: "Symptom" })
            .then(() => {});
        }
      });
  }
}
