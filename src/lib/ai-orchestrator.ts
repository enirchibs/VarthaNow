// MAATLAADU AI ORCHESTRATOR & MODEL ROUTER
// Manages 5 Specialized Agents: Tutor, Speaking Coach, Lesson, Learning Memory, Roleplay.
// Provider Cascade: Gemini API ➔ OpenRouter API ➔ Emergency Local Engine.

import { supabase } from "./supabase";
import { UserLearningProfile, TargetLanguage } from "./tutor-api";

export type AgentType = "tutor" | "speaking_coach" | "lesson" | "learning_memory" | "roleplay";

export interface AIRequestPayload {
  agent: AgentType;
  task: string;
  userText?: string;
  contextHistory?: { role: "user" | "model"; text: string }[];
  profile?: UserLearningProfile;
  targetLanguage?: TargetLanguage;
}

export interface AIOrchestratorResult {
  text: string;
  json?: any;
  provider: "gemini" | "openrouter" | "local_fallback";
  modelUsed: string;
}

// 🧠 LOCAL DICTIONARY & STATIC RULE ENGINE (Prevents unnecessary LLM calls for basic trivia)
const LOCAL_DICTIONARY: Record<string, { te: string; en_ex: string; hi_ex: string }> = {
  office: { te: "కార్యాలయం / ఆఫీస్", en_ex: "I am going to the office.", hi_ex: "मैं दफ़्तर जा रहा हूँ।" },
  meeting: { te: "సమావేశం / మీటింగ్", en_ex: "When is the meeting?", hi_ex: "बैठक कब है?" },
  work: { te: "పని", en_ex: "I have finished my work.", hi_ex: "मैंने अपना काम पूरा कर लिया।" },
  schedule: { te: "సమయ పట్టిక / షెడ్యూల్", en_ex: "Check your schedule.", hi_ex: "अपना शेड्यूल देखें।" },
  complete: { te: "పూర్తి చేయడం", en_ex: "I will complete this task.", hi_ex: "मैं यह काम पूरा करूँगा।" }
};

export class AIOrchestrator {

  public async askAI(payload: AIRequestPayload): Promise<AIOrchestratorResult> {
    const { agent, task, userText = "", profile, targetLanguage = "english" } = payload;

    // 1. FAST LOCAL RULE LOOKUP (Optimization: don't call AI for simple dictionary words)
    if (task === "lookup_word" && userText.trim()) {
      const key = userText.trim().toLowerCase();
      if (LOCAL_DICTIONARY[key]) {
        const item = LOCAL_DICTIONARY[key];
        return {
          text: `అర్థం: ${item.te}\nఉదాహరణ: ${targetLanguage === "english" ? item.en_ex : item.hi_ex}`,
          provider: "local_fallback",
          modelUsed: "local_dictionary"
        };
      }
    }

    // Build Master Agent Prompt
    const systemInstruction = this.getAgentSystemInstruction(agent, targetLanguage, profile);

    // 2. TRY PRIMARY & SECONDARY API VIA SUPABASE EDGE PROXY
    if (supabase) {
      try {
        const { data, error } = await supabase.functions.invoke("gemini-proxy", {
          body: {
            action: "ai_orchestrator",
            agent,
            prompt: `Task: ${task}\nUser Input: "${userText}"`,
            systemInstruction,
            preferredModel: agent === "lesson" ? "gemini-3.5-flash-lite" : "gemini-3.5-flash"
          }
        });

        if (!error && data?.text) {
          return {
            text: data.text,
            json: this.extractJSON(data.text),
            provider: data.provider || "gemini",
            modelUsed: data.model || "gemini-3.5-flash"
          };
        }
      } catch (proxyErr) {
        console.warn("Orchestrator Proxy fallback triggered:", proxyErr);
      }
    }

    // 3. DIRECT OPENROUTER FREE API FALLBACK
    try {
      const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "HTTP-Referer": "https://varthanow.com",
          "X-Title": "Maatlaadu AI"
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: `Task: ${task}\nUser Input: "${userText}"` }
          ],
          temperature: 0.7
        })
      });

      if (orRes.ok) {
        const orData = await orRes.json();
        const text = orData?.choices?.[0]?.message?.content;
        if (text) {
          return {
            text,
            json: this.extractJSON(text),
            provider: "openrouter",
            modelUsed: "openrouter/free"
          };
        }
      }
    } catch (orErr) {
      console.warn("OpenRouter fallback triggered:", orErr);
    }

    // 4. EMERGENCY LOCAL ENGINE FALLBACK
    return this.getEmergencyFallback(agent, task, userText, targetLanguage);
  }

  private getAgentSystemInstruction(
    agent: AgentType,
    lang: TargetLanguage,
    profile?: UserLearningProfile
  ): string {
    const targetLangStr = lang === "english" ? "English" : "Hindi";
    const levelStr = profile?.level || "beginner";

    switch (agent) {
      case "speaking_coach":
        return `
You are the Speaking Coach Agent for Maatlaadu AI.
Learner Target Language: ${targetLangStr}.
Level: ${levelStr}.
Your job is to analyze the learner's spoken sentence and evaluate grammar, vocabulary, fluency, and pronunciation.
RULES:
1. DO NOT OVER-CORRECT. Correct only 1-2 key errors.
2. Provide feedback strictly in polite, simple Telugu.
3. If an error exists, show:
   Wrong Attempt
   Better Sentence
   Telugu explanation of WHY.
4. Output structured JSON.
`;

      case "tutor":
        return `
You are the Tutor Agent for Maatlaadu AI.
Target Language: ${targetLangStr}.
Learner Level: ${levelStr}.
Your job is to teach English/Hindi using clear Telugu explanations.
Answer questions, explain grammar rules simply, and provide conversational practice.
`;

      case "lesson":
        return `
You are the Lesson Agent for Maatlaadu AI.
Target Language: ${targetLangStr}.
Your job is to generate structured Daily 5-minute micro-lessons with 5 words, a conversation script, a 1-minute speak topic, and a 3-question quiz.
Explanations must be in simple Telugu.
`;

      case "learning_memory":
        return `
You are the Learning Memory Agent for Maatlaadu AI.
Your job is to analyze mistake logs, identify recurring grammar weaknesses (e.g. Present continuous, past tense, articles), and generate custom practice recommendations in Telugu.
`;

      case "roleplay":
        return `
You are the Roleplay Agent for Maatlaadu AI.
Target Language: ${targetLangStr}.
Stay strictly in your assigned character (e.g., Interviewer, Restaurant Waiter, Hotel Receptionist, Auto Driver).
Keep responses concise and ask one natural question at a time.
`;
    }
  }

  private extractJSON(text: string): any | null {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch {}
    return null;
  }

  private getEmergencyFallback(
    agent: AgentType,
    task: string,
    userText: string,
    lang: TargetLanguage
  ): AIOrchestratorResult {
    const isEn = lang === "english";

    if (agent === "speaking_coach") {
      const fallbackJSON = {
        has_error: userText.toLowerCase().includes("go to"),
        wrong: userText.toLowerCase().includes("go to") ? userText : undefined,
        correct: isEn ? `I am going to ${userText.replace(/.*go to\s*/i, "") || "the office"}.` : `मैं काम पर जा रहा हूँ।`,
        telugu_explanation: isEn
          ? "ప్రస్తుతం జరుగుతున్న పని కాబట్టి 'going' ఉపయోగించాలి."
          : "వర్తమాన కాలంలో 'जा रहा हूँ' వాడాలి.",
        encouragement: "చాలా బాగుంది! 👍 శ్రమించి ప్రయత్నించారు.",
        next_question: isEn ? "What do you usually do in the morning?" : "आप सुबह आमतौर पर क्या करते हैं?",
        score: { grammar: 78, vocabulary: 82, fluency: 72, pronunciation: 75, overall: 77 }
      };

      return {
        text: JSON.stringify(fallbackJSON),
        json: fallbackJSON,
        provider: "local_fallback",
        modelUsed: "emergency_local_engine"
      };
    }

    return {
      text: isEn
        ? "Good effort! Let's practice another sentence."
        : "बहुत बढ़िया! आइए एक और वाक्य का अभ्यास करें।",
      provider: "local_fallback",
      modelUsed: "emergency_local_engine"
    };
  }
}

export const aiOrchestrator = new AIOrchestrator();
