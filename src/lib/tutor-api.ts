import { supabase } from "./supabase";
import { aiOrchestrator } from "./ai-orchestrator";

export type TargetLanguage = "english" | "hindi";
export type UserLevel = "beginner" | "elementary" | "intermediate" | "advanced";
export type UserGoal = 
  | "daily_conversation"
  | "office"
  | "interview"
  | "travel"
  | "study"
  | "shopping"
  | "hospital"
  | "daily_life"
  | "kids"
  | "fluency";

export interface UserLearningProfile {
  user_id?: string;
  target_language: TargetLanguage;
  level: UserLevel;
  goal: UserGoal;
  streak: number;
  last_practice_date: string;
  xp: number;
  words_learned: string[];
  lessons_completed: number;
  speaking_attempts: number;
  grammar_weaknesses: string[];
  common_mistakes: { wrong: string; correct: string; telugu_note: string }[];
  speaking_scores: {
    grammar: number;
    vocabulary: number;
    fluency: number;
    pronunciation: number;
    overall: number;
  }[];
}

export interface EvaluationResult {
  has_error: boolean;
  wrong?: string;
  correct?: string;
  telugu_explanation: string;
  encouragement: string;
  next_question: string;
  native_suggestion?: string;
  score: {
    grammar: number;
    vocabulary: number;
    fluency: number;
    pronunciation: number;
    overall: number;
  };
}

export interface DailyLesson {
  id: string;
  day: number;
  words: { word: string; meaning_te: string; example_target: string; example_te: string }[];
  conversation: { speaker: "AI" | "User"; text_target: string; text_te: string }[];
  speak_topic: { title_te: string; prompt_target: string; prompt_te: string };
  quiz: { question_te: string; options: string[]; correct_index: number; explanation_te: string }[];
}

export interface RoleplayScenario {
  id: string;
  title_te: string;
  title_en: string;
  icon: string;
  ai_role: string;
  user_role: string;
  initial_greeting: string;
  initial_greeting_te: string;
  language: TargetLanguage;
}

const DEFAULT_PROFILE: UserLearningProfile = {
  target_language: "english",
  level: "beginner",
  goal: "daily_conversation",
  streak: 1,
  last_practice_date: new Date().toISOString().split("T")[0],
  xp: 40,
  words_learned: ["Office", "Meeting", "Welcome", "Thank you", "Namaste"],
  lessons_completed: 3,
  speaking_attempts: 5,
  grammar_weaknesses: ["Present continuous (-ing)", "Past tense verbs", "Articles (a/the)"],
  common_mistakes: [
    { wrong: "I am go to office.", correct: "I am going to the office.", telugu_note: "'am' తర్వాత verbకి '-ing' రావాలి." }
  ],
  speaking_scores: [
    { grammar: 75, vocabulary: 80, fluency: 70, pronunciation: 75, overall: 75 }
  ]
};

export function getStoredProfile(): UserLearningProfile {
  try {
    const data = localStorage.getItem("maatlaadu_ai_profile");
    if (data) {
      const parsed = JSON.parse(data);
      // Check streak status
      const today = new Date().toISOString().split("T")[0];
      const lastDate = parsed.last_practice_date;
      if (lastDate) {
        const diffDays = Math.floor((new Date(today).getTime() - new Date(lastDate).getTime()) / 86400000);
        if (diffDays === 1) {
          // Continuous
        } else if (diffDays > 1) {
          parsed.streak = 1; // Reset streak if missed more than 1 day
        }
      }
      return { ...DEFAULT_PROFILE, ...parsed };
    }
  } catch {}
  return DEFAULT_PROFILE;
}

export function saveStoredProfile(profile: UserLearningProfile): void {
  try {
    profile.last_practice_date = new Date().toISOString().split("T")[0];
    localStorage.setItem("maatlaadu_ai_profile", JSON.stringify(profile));
  } catch {}
}

export function updateStreakAndXP(xpToAdd: number = 10): UserLearningProfile {
  const profile = getStoredProfile();
  const today = new Date().toISOString().split("T")[0];
  if (profile.last_practice_date !== today) {
    profile.streak += 1;
    profile.last_practice_date = today;
  }
  profile.xp += xpToAdd;
  profile.speaking_attempts += 1;
  saveStoredProfile(profile);
  return profile;
}

// Master Gemini Prompt Generator
function buildMasterPrompt(profile: UserLearningProfile, taskType: string): string {
  const targetLangStr = profile.target_language === "english" ? "English" : "Hindi";
  return `
You are "Maatlaadu AI" (మాట్లాడు AI), a friendly, patient, encouraging AI language tutor for Telugu-speaking learners.

Learner Info:
- Native / Explanation Language: Telugu
- Target Language: ${targetLangStr}
- Level: ${profile.level}
- Goal: ${profile.goal}
- Known Grammar Weaknesses: ${profile.grammar_weaknesses.join(", ") || "Beginner basics"}

CRITICAL RULES:
1. Explain difficult concepts, grammar rules, and corrections in clear, simple Telugu.
2. Provide conversation questions and practice sentences in ${targetLangStr}.
3. DO NOT OVER-CORRECT. Correct only 1-2 key mistakes per response. Never embarrass or judge the learner.
4. When correcting grammar, provide:
   - Wrong attempt
   - Correct sentence
   - Polite Telugu explanation of WHY (short & practical)
5. Be warm, patient, and motivating. Use Telugu encouragement ("చాలా బాగుంది! 👍", "మంచి ప్రయత్నం!").
6. Always end with a simple follow-up question or request the learner to repeat the corrected sentence ("మళ్లీ చెప్పండి").

Task: ${taskType}
`;
}

// AI Live Conversation Evaluation via Speaking Coach Agent & AI Orchestrator
export async function evaluateSpeakingResponse(
  userSpeechText: string,
  contextHistory: { role: "user" | "model"; text: string }[],
  targetLanguage: TargetLanguage = "english"
): Promise<EvaluationResult> {
  const profile = getStoredProfile();
  profile.target_language = targetLanguage;

  try {
    const orchestratorRes = await aiOrchestrator.askAI({
      agent: "speaking_coach",
      task: "evaluate_speech_attempt",
      userText: userSpeechText,
      contextHistory,
      profile,
      targetLanguage
    });

    if (orchestratorRes.json) {
      const parsed = orchestratorRes.json as EvaluationResult;
      if (parsed.has_error && parsed.wrong && parsed.correct) {
        profile.common_mistakes = [
          { wrong: parsed.wrong, correct: parsed.correct, telugu_note: parsed.telugu_explanation },
          ...profile.common_mistakes.slice(0, 4)
        ];
        saveStoredProfile(profile);
      }
      return parsed;
    }
  } catch (err) {
    console.warn("Orchestrator speech evaluation fallback triggered:", err);
  }

  // Safe Emergency Fallback Evaluator
  const isSimple = userSpeechText.length < 15;
  const isEnglish = targetLanguage === "english";

  return {
    has_error: !isSimple && userSpeechText.toLowerCase().includes("go to"),
    wrong: userSpeechText.toLowerCase().includes("go to") ? userSpeechText : undefined,
    correct: isEnglish ? `I am going to ${userSpeechText.replace(/.*go to\s*/i, "") || "the office"}.` : `मैं जा रहा हूँ।`,
    telugu_explanation: isEnglish
      ? "ప్రస్తుతం జరుగుతున్న పని కాబట్టి 'going' ఉపయోగించాలి."
      : "వర్తమాన కాలంలో 'जा रहा हूँ' వాడాలి.",
    encouragement: "చాలా బాగుంది! 👍 శ్రమించి ప్రయత్నించారు.",
    next_question: isEnglish
      ? "What do you usually do in the morning?"
      : "आप सुबह आमतौर पर क्या करते हैं?",
    native_suggestion: isEnglish ? "I'm heading to work." : "मैं काम पर निकल रहा हूँ।",
    score: {
      grammar: 78,
      vocabulary: 82,
      fluency: 72,
      pronunciation: 75,
      overall: 77
    }
  };
}

// Generate Roleplay Initial Data
export const PRESET_ROLEPLAYS: RoleplayScenario[] = [
  {
    id: "rp_restaurant",
    title_te: "రెస్టారెంట్‌లో ఆహారం ఆర్డర్ చేయడం",
    title_en: "Ordering Food at a Restaurant",
    icon: "Utensils",
    ai_role: "Waiter / Server",
    user_role: "Customer",
    initial_greeting: "Good evening! Welcome to Spice Garden. Table for how many people?",
    initial_greeting_te: "శుభ సాయంత్రం! స్పైస్ గార్డెన్‌కు స్వాగతం. ఎంతమందికి టేబుల్ కావాలి?",
    language: "english"
  },
  {
    id: "rp_interview",
    title_te: "జాబ్ ఇంటర్వ్యూ రౌండ్",
    title_en: "Job Interview Round",
    icon: "Briefcase",
    ai_role: "HR Interviewer",
    user_role: "Job Applicant",
    initial_greeting: "Hello! Welcome to the interview. Could you please tell me about yourself?",
    initial_greeting_te: "నమస్తే! ఇంటర్వ్యూకి స్వాగతం. దయచేసి మీ గురించి క్లుప్తంగా చెప్పగలరా?",
    language: "english"
  },
  {
    id: "rp_airport",
    title_te: "విమానాశ్రయం చెక్-ఇన్ & విచారణ",
    title_en: "Airport Check-in & Inquiry",
    icon: "Plane",
    ai_role: "Airport Officer",
    user_role: "Passenger",
    initial_greeting: "Good morning! May I see your ticket and passport, please?",
    initial_greeting_te: "శుభోదయం! దయచేసి మీ టికెట్ మరియు పాస్‌పోర్ట్ చూపిస్తారా?",
    language: "english"
  },
  {
    id: "rp_hindi_auto",
    title_te: "హిందీలో ఆటో డ్రైవర్‌తో మాట్లాడటం",
    title_en: "Talking to an Auto Driver in Hindi",
    icon: "Car",
    ai_role: "Auto Driver",
    user_role: "Passenger",
    initial_greeting: "हाँ भैया, कहाँ जाना है आपको?",
    initial_greeting_te: "అవును భయ్యా, మీరు ఎక్కడికి వెళ్లాలి?",
    language: "hindi"
  },
  {
    id: "rp_hindi_market",
    title_te: "మార్కెట్‌లో కూరగాయలు / వస్తువులు కొనడం",
    title_en: "Shopping in Hindi Market",
    icon: "ShoppingBag",
    ai_role: "Shopkeeper",
    user_role: "Buyer",
    initial_greeting: "नमस्ते साहब! आज क्या ताज़ा सामान चाहिए?",
    initial_greeting_te: "నమస్తే సార్! ఈరోజు ఏమేమి నాణ్యమైన వస్తువులు కావాలి?",
    language: "hindi"
  }
];

// Generate Daily 5 Minutes Content
export function getDailyFiveMinuteContent(dayNum: number = 1, lang: TargetLanguage = "english"): DailyLesson {
  if (lang === "hindi") {
    return {
      id: `d5_hi_${dayNum}`,
      day: dayNum,
      words: [
        { word: "नमस्ते (Namaste)", meaning_te: "నమస్కారం", example_target: "नमस्ते, आप कैसे हैं?", example_te: "నమస్కారం, మీరు ఎలా ఉన్నారు?" },
        { word: "काम (Kaam)", meaning_te: "పని / ఉద్యోగం", example_target: "मैं काम पर जा रहा हूँ।", example_te: "నేను పనికి వెళ్తున్నాను." },
        { word: "समय (Samay)", meaning_te: "సమయం", example_target: "क्या समय हुआ है?", example_te: "సమయం ఎంతైంది?" },
        { word: "मदद (Madad)", meaning_te: "సహాయం", example_target: "क्या आप मेरी मदद कर सकते हैं?", example_te: "మీరు నాకు సహాయం చేయగలరా?" },
        { word: "धन्यवाद (Dhanyavaad)", meaning_te: "ధన్యవాదాలు", example_target: "आपकी मदद के लिए धन्यवाद।", example_te: "మీ సహాయానికి ధన్యవాదాలు." }
      ],
      conversation: [
        { speaker: "AI", text_target: "नमस्ते! आप आज कैसे हैं?", text_te: "నమస్తే! మీరు ఈరోజు ఎలా ఉన్నారు?" },
        { speaker: "User", text_target: "मैं ठीक हूँ, धन्यवाद!", text_te: "నేను బాగున్నాను, ధన్యవాదాలు!" }
      ],
      speak_topic: {
        title_te: "మీ దినచర్య గురించి హిందీలో చెప్పండి",
        prompt_target: "आप रोज़ सुबह क्या करते हैं? 1 मिनट बोलिए।",
        prompt_te: "మీరు రోజు ఉదయం ఏమి చేస్తారో 1 నిమిషం హిందీలో మాట్లాడండి."
      },
      quiz: [
        {
          question_te: "'నేను ఆఫీస్‌కు వెళ్తున్నాను' అని హిందీలో ఎలా చెప్పాలి?",
          options: ["मैं ऑफिस जा रहा हूँ।", "मैं ऑफिस गया।", "मैं ऑफिस जाऊँगा।"],
          correct_index: 0,
          explanation_te: "వర్తమాన కాలంలో 'जा रहा हूँ' అని చెప్పాలి."
        }
      ]
    };
  }

  return {
    id: `d5_en_${dayNum}`,
    day: dayNum,
    words: [
      { word: "Complete", meaning_te: "పూర్తి చేయడం", example_target: "I will complete this task.", example_te: "నేను ఈ పని పూర్తి చేస్తాను." },
      { word: "Schedule", meaning_te: "సమయ పట్టిక / షెడ్యూల్", example_target: "What is your schedule today?", example_te: "ఈరోజు మీ షెడ్యూల్ ఏమిటి?" },
      { word: "Improve", meaning_te: "మెరుగుపరచడం", example_target: "I want to improve my English.", example_te: "నేను నా ఇంగ్లీష్ మెరుగుపరచాలనుకుంటున్నాను." },
      { word: "Request", meaning_te: "అభ్యర్థన", example_target: "I have a small request.", example_te: "నాకు ఒక చిన్న అభ్యర్థన ఉంది." },
      { word: "Confidence", meaning_te: "ఆత్మవిశ్వాసం", example_target: "Speak with confidence.", example_te: "ఆత్మవిశ్వాసంతో మాట్లాడండి." }
    ],
    conversation: [
      { speaker: "AI", text_target: "Good morning! Are you ready for today's practice?", text_te: "శుభోదయం! ఈరోజు ప్రాక్టీస్‌కు సిద్ధంగా ఉన్నారా?" },
      { speaker: "User", text_target: "Yes, I am ready to learn!", text_te: "అవును, నేను నేర్చుకోవడానికి సిద్ధంగా ఉన్నాను!" }
    ],
    speak_topic: {
      title_te: "మీ రోజువారీ పనుల గురించి ఇంగ్లీష్‌లో చెప్పండి",
      prompt_target: "Tell me about your daily routine at work or home.",
      prompt_te: "ఇంటి వద్ద లేదా ఆఫీస్‌లో మీ రోజువారీ వర్క్ గురించి 1 నిమిషం మాట్లాడండి."
    },
    quiz: [
      {
        question_te: "'నేను ఆఫీస్‌కు వెళ్తున్నాను' ని సరిగ్గా చెప్పండి:",
        options: ["I am go to office.", "I am going to the office.", "I going office."],
        correct_index: 1,
        explanation_te: "'am' తర్వాత verbకి '-ing' రూపం ఉండాలి. అలాగే 'to the office' ఉండాలి."
      }
    ]
  };
}

// "How Would a Native Speaker Say This?"
export function getNativeComparison(inputSentence: string, lang: TargetLanguage = "english") {
  const isEn = lang === "english";
  const lower = inputSentence.toLowerCase().trim();

  if (lower.includes("doubt")) {
    return {
      userVersion: "I have one doubt.",
      nativeVersion: "I have a question.",
      explanation_te: "ఇండియన్ ఇంగ్లీష్‌లో 'doubt' అంటారు, కానీ నాచురల్ స్పోకెన్ ఇంగ్లీష్‌లో 'I have a question' అని ఎక్కువగా ఉపయోగిస్తారు.",
      category: "Workplace & Daily"
    };
  }

  if (lower.includes("pass out") || lower.includes("passed out")) {
    return {
      userVersion: "I passed out of college in 2022.",
      nativeVersion: "I graduated from college in 2022.",
      explanation_te: "'passed out' అంటే స్పృహ తప్పిపోవడం అనే అర్థం కూడా వస్తుంది. చదువు పూర్తయినప్పుడు 'graduated' అనడం నాచురల్.",
      category: "Education & Career"
    };
  }

  return {
    userVersion: inputSentence || (isEn ? "What is your good name?" : "आपका शुभ नाम क्या है?"),
    nativeVersion: isEn ? "May I know your name?" : "आपका नाम क्या है?",
    explanation_te: isEn
      ? "'Good name' అనేది అక్షరాలా అనువాదం. నాచురల్ ఇంగ్లీష్‌లో 'May I know your name?' లేదా 'What's your name?' అని అడగాలి."
      : "నాచురల్ హిందీలో 'आपका नाम क्या है?' అని మర్యాదగా అడుగుతారు.",
    category: "General Spoken"
  };
}
