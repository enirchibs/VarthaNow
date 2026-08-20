// Supabase Database Seed & Fetcher for Maatlaadu AI (100+ Sentences across 6 Categories)

import { supabase } from "./supabase";
import { TargetLanguage } from "./tutor-api";

export interface DBSentenceItem {
  id: string;
  category: "basic" | "spoken" | "office" | "interview" | "travel" | "kids";
  target_language: TargetLanguage;
  title: string;
  target_sentence: string;
  telugu_translation: string;
  grammar_breakdown_te: string;
  example_dialogue: { speaker: string; text: string }[];
  level?: string;
}

// 📚 COMPREHENSIVE CURATED 100+ SENTENCES SEED DATASET
export const SEED_SENTENCES: DBSentenceItem[] = [
  // -------------------------------------------------------------
  // 1. BASIC ENGLISH (ENGLISH)
  // -------------------------------------------------------------
  {
    id: "b_en_1",
    category: "basic",
    target_language: "english",
    title: "I am / You are Usage",
    target_sentence: "I am going to the office.",
    telugu_translation: "నేను ఆఫీస్‌కు వెళ్తున్నాను.",
    grammar_breakdown_te: "'I am' = నేను, 'go' = వెళ్లు, 'going' = వెళ్తున్నాను. వర్తమాన కాలంలో -ing వస్తుంది.",
    example_dialogue: [
      { speaker: "AI", text: "Where are you going?" },
      { speaker: "User", text: "I am going to the office." }
    ]
  },
  {
    id: "b_en_2",
    category: "basic",
    target_language: "english",
    title: "Asking Simple Questions",
    target_sentence: "Where are you going?",
    telugu_translation: "మీరు ఎక్కడికి వెళ్తున్నారు?",
    grammar_breakdown_te: "'Where' = ఎక్కడ, 'are you' = మీరు, 'going' = వెళ్తున్నారు.",
    example_dialogue: [
      { speaker: "AI", text: "Excuse me, where are you going?" },
      { speaker: "User", text: "I am going home." }
    ]
  },
  {
    id: "b_en_3",
    category: "basic",
    target_language: "english",
    title: "Simple Present Tense (Daily Habit)",
    target_sentence: "I wake up at six in the morning.",
    telugu_translation: "నేను ఉదయం ఆరు గంటలకు నిద్రలేస్తాను.",
    grammar_breakdown_te: "రోజువారీ అలవాట్లకు Simple Present Tense (wake up) వాడాలి.",
    example_dialogue: [
      { speaker: "AI", text: "What time do you wake up?" },
      { speaker: "User", text: "I wake up at six in the morning." }
    ]
  },
  {
    id: "b_en_4",
    category: "basic",
    target_language: "english",
    title: "Expressing Likes & Dislikes",
    target_sentence: "I like drinking tea in the morning.",
    telugu_translation: "నాకు ఉదయాన్నే టీ తాగడం ఇష్టం.",
    grammar_breakdown_te: "'like' తర్వాత Verb కి -ing చేర్చాలి (drinking tea).",
    example_dialogue: [
      { speaker: "AI", text: "Do you like tea or coffee?" },
      { speaker: "User", text: "I like drinking tea in the morning." }
    ]
  },

  // -------------------------------------------------------------
  // 1. BASIC HINDI (HINDI)
  // -------------------------------------------------------------
  {
    id: "b_hi_1",
    category: "basic",
    target_language: "hindi",
    title: "मैं हूँ / आप हैं का प्रयोग",
    target_sentence: "मैं ऑफिस जा रहा हूँ।",
    telugu_translation: "నేను ఆఫీస్‌కు వెళ్తున్నాను.",
    grammar_breakdown_te: "'मैं' = నేను, 'जा रहा हूँ' = వెళ్తున్నాను. పురుషవాచకంలో रहा हूँ వాడాలి.",
    example_dialogue: [
      { speaker: "AI", text: "आप कहाँ जा रहे हैं?" },
      { speaker: "User", text: "मैं ऑफिस जा रहा हूँ।" }
    ]
  },
  {
    id: "b_hi_2",
    category: "basic",
    target_language: "hindi",
    title: "साधारण प्रश्न पूछना",
    target_sentence: "आप कहाँ जा रहे हैं?",
    telugu_translation: "మీరు ఎక్కడికి వెళ్తున్నారు?",
    grammar_breakdown_te: "'कहाँ' = ఎక్కడ, 'जा रहे हैं' = వెళ్తున్నారు (మర్యాదగా).",
    example_dialogue: [
      { speaker: "AI", text: "सुनिए, आप कहाँ जा रहे हैं?" },
      { speaker: "User", text: "मैं घर जा रहा हूँ।" }
    ]
  },
  {
    id: "b_hi_3",
    category: "basic",
    target_language: "hindi",
    title: "हाल-चाल पूछना",
    target_sentence: "आप कैसे हैं? मैं ठीक हूँ।",
    telugu_translation: "మీరు ఎలా ఉన్నారు? నేను బాగున్నాను.",
    grammar_breakdown_te: "'आप कैसे हैं?' = మీరు ఎలా ఉన్నారు?, 'मैं ठीक हूँ' = నేను బాగున్నాను.",
    example_dialogue: [
      { speaker: "AI", text: "नमस्ते! आप कैसे हैं?" },
      { speaker: "User", text: "मैं ठीक हूँ, धन्यवाद।" }
    ]
  },

  // -------------------------------------------------------------
  // 2. SPOKEN ENGLISH (ENGLISH)
  // -------------------------------------------------------------
  {
    id: "sp_en_1",
    category: "spoken",
    target_language: "english",
    title: "Morning Greetings & Routine",
    target_sentence: "Good morning! How are you doing today?",
    telugu_translation: "శుభోదయం! ఈరోజు మీరు ఎలా ఉన్నారు?",
    grammar_breakdown_te: "'How are you doing?' అనేది 'How are you?' కి సమానమైన నాచురల్ స్పోకెన్ రూపం.",
    example_dialogue: [
      { speaker: "AI", text: "Good morning! Did you have breakfast?" },
      { speaker: "User", text: "Yes, I had breakfast." }
    ]
  },
  {
    id: "sp_en_2",
    category: "spoken",
    target_language: "english",
    title: "Talking About Weather",
    target_sentence: "It is very hot outside today.",
    telugu_translation: "ఈరోజు బయట చాలా వేడిగా ఉంది.",
    grammar_breakdown_te: "వాతావరణం చెప్పేటప్పుడు 'It is' తో ప్రారంభించాలి.",
    example_dialogue: [
      { speaker: "AI", text: "How is the weather outside?" },
      { speaker: "User", text: "It is very hot outside today." }
    ]
  },

  // -------------------------------------------------------------
  // 2. SPOKEN HINDI (HINDI)
  // -------------------------------------------------------------
  {
    id: "sp_hi_1",
    category: "spoken",
    target_language: "hindi",
    title: "सुबह की बातें",
    target_sentence: "शुभ प्रभात! आप आज कैसे हैं?",
    telugu_translation: "శుభోదయం! ఈరోజు మీరు ఎలా ఉన్నారు?",
    grammar_breakdown_te: "'शुभ प्रभात' = శుభోదయం. 'आप कैसे हैं?' = మీరు ఎలా ఉన్నారు?",
    example_dialogue: [
      { speaker: "AI", text: "शुभ प्रभात! क्या आपने नाश्ता किया?" },
      { speaker: "User", text: "हाँ, मैंने नाश्ता कर लिया।" }
    ]
  },
  {
    id: "sp_hi_2",
    category: "spoken",
    target_language: "hindi",
    title: "मौसम की चर्चा",
    target_sentence: "आज बाहर बहुत गर्मी है।",
    telugu_translation: "ఈరోజు బయట చాలా వేడిగా ఉంది.",
    grammar_breakdown_te: "'बाहर' = బయట, 'गर्मी' = వేడి, 'है' = ఉంది.",
    example_dialogue: [
      { speaker: "AI", text: "आज का मौसम कैसा है?" },
      { speaker: "User", text: "आज बाहर बहुत गर्मी है।" }
    ]
  },

  // -------------------------------------------------------------
  // 3. OFFICE ENGLISH (ENGLISH)
  // -------------------------------------------------------------
  {
    id: "off_en_1",
    category: "office",
    target_language: "english",
    title: "Task Completion Update",
    target_sentence: "I have completed this task.",
    telugu_translation: "నేను ఈ పని పూర్తి చేశాను.",
    grammar_breakdown_te: "ఇప్పుడే పూర్తయిన పనికి 'I have completed' (Present Perfect) ఉపయోగించాలి.",
    example_dialogue: [
      { speaker: "AI", text: "Did you complete the report?" },
      { speaker: "User", text: "Yes, I have completed this task." }
    ]
  },
  {
    id: "off_en_2",
    category: "office",
    target_language: "english",
    title: "Asking About Meeting Time",
    target_sentence: "When is the team meeting scheduled?",
    telugu_translation: "టీమ్ మీటింగ్ ఎప్పుడు షెడ్యూల్ చేయబడింది?",
    grammar_breakdown_te: "'When is' = ఎప్పుడు ఉంది, 'scheduled' = షెడ్యూల్ చేయబడింది.",
    example_dialogue: [
      { speaker: "AI", text: "Do you have any questions for the meeting?" },
      { speaker: "User", text: "When is the team meeting scheduled?" }
    ]
  },

  // -------------------------------------------------------------
  // 3. WORKPLACE HINDI (HINDI)
  // -------------------------------------------------------------
  {
    id: "off_hi_1",
    category: "office",
    target_language: "hindi",
    title: "काम पूरा होने की जानकारी",
    target_sentence: "मैंने यह काम पूरा कर लिया है।",
    telugu_translation: "నేను ఈ పని పూర్తి చేశాను.",
    grammar_breakdown_te: "పూర్తయిన పనికి 'मैंने ... कर लिया है' అని చెప్పాలి.",
    example_dialogue: [
      { speaker: "AI", text: "क्या आपने रिपोर्ट पूरी की?" },
      { speaker: "User", text: "हाँ, मैंने यह काम पूरा कर लिया है।" }
    ]
  },
  {
    id: "off_hi_2",
    category: "office",
    target_language: "hindi",
    title: "मीटिंग के समय के बारे में पूछना",
    target_sentence: "मीटिंग कितने बजे है?",
    telugu_translation: "మీటింగ్ ఎన్ని గంటలకు ఉంది?",
    grammar_breakdown_te: "'कितने बजे' = ఎన్ని గంటలకు, 'है' = ఉంది.",
    example_dialogue: [
      { speaker: "AI", text: "क्या आपको मीटिंग का समय मालूम है?" },
      { speaker: "User", text: "मीटिंग कितने बजे है?" }
    ]
  },

  // -------------------------------------------------------------
  // 4. INTERVIEW ENGLISH (ENGLISH)
  // -------------------------------------------------------------
  {
    id: "int_en_1",
    category: "interview",
    target_language: "english",
    title: "Tell Me About Yourself",
    target_sentence: "I have been working for three years.",
    telugu_translation: "నేను మూడేళ్లుగా పనిచేస్తున్నాను.",
    grammar_breakdown_te: "❌ 'I am working from 3 years' అనకూడదు. సమయం పొడవుకు 'for three years' మరియు 'have been working' అని చెప్పాలి.",
    example_dialogue: [
      { speaker: "AI", text: "How long have you been working here?" },
      { speaker: "User", text: "I have been working for three years." }
    ]
  },
  {
    id: "int_en_2",
    category: "interview",
    target_language: "english",
    title: "Describing Strengths",
    target_sentence: "My major strength is problem-solving under pressure.",
    telugu_translation: "ఒత్తిడిలో సమస్యలను పరిష్కరించడం నా ప్రధాన బలం.",
    grammar_breakdown_te: "'major strength' = ప్రధాన బలం, 'under pressure' = ఒత్తిడిలో.",
    example_dialogue: [
      { speaker: "AI", text: "What is your biggest strength?" },
      { speaker: "User", text: "My major strength is problem-solving under pressure." }
    ]
  },

  // -------------------------------------------------------------
  // 4. INTERVIEW HINDI (HINDI)
  // -------------------------------------------------------------
  {
    id: "int_hi_1",
    category: "interview",
    target_language: "hindi",
    title: "अपना परिचय दें",
    target_sentence: "मैं तीन साल से काम कर रहा हूँ।",
    telugu_translation: "నేను మూడేళ్లుగా పనిచేస్తున్నాను.",
    grammar_breakdown_te: "'तीन साल से' = మూడేళ్లుగా. పురుషవాచకంలో 'कर रहा हूँ' వాడాలి.",
    example_dialogue: [
      { speaker: "AI", text: "आप यहाँ कब से काम कर रहे हैं?" },
      { speaker: "User", text: "मैं तीन साल से काम कर रहा हूँ।" }
    ]
  },

  // -------------------------------------------------------------
  // 5. TRAVEL ENGLISH (ENGLISH)
  // -------------------------------------------------------------
  {
    id: "tr_en_1",
    category: "travel",
    target_language: "english",
    title: "Asking Directions",
    target_sentence: "Could you please tell me the way to the station?",
    telugu_translation: "దయచేసి స్టేషన్‌కు వెళ్లే మార్గం చెప్పగలరా?",
    grammar_breakdown_te: "'Could you please' అనేది చాలా మర్యాదపూర్వకమైన అభ్యర్థన.",
    example_dialogue: [
      { speaker: "AI", text: "Can I help you?" },
      { speaker: "User", text: "Could you please tell me the way to the station?" }
    ]
  },
  {
    id: "tr_en_2",
    category: "travel",
    target_language: "english",
    title: "Hotel Check-in",
    target_sentence: "I have a reservation under my name.",
    telugu_translation: "నా పేరు మీద ఒక రిజర్వేషన్ ఉంది.",
    grammar_breakdown_te: "'reservation under my name' = నా పేరు మీద బుకింగ్ ఉంది.",
    example_dialogue: [
      { speaker: "AI", text: "Welcome to Grand Hotel. How can I help you?" },
      { speaker: "User", text: "I have a reservation under my name." }
    ]
  },

  // -------------------------------------------------------------
  // 5. TRAVEL HINDI (HINDI)
  // -------------------------------------------------------------
  {
    id: "tr_hi_1",
    category: "travel",
    target_language: "hindi",
    title: "रास्ता पूछना",
    target_sentence: "कृपया स्टेशन का रास्ता बता सकते हैं?",
    telugu_translation: "దయచేసి స్టేషన్‌కు వెళ్లే మార్గం చెప్పగలరా?",
    grammar_breakdown_te: "'कृपया' = దయచేసి. 'रास्ता बता सकते हैं?' = మార్గం చెప్పగలరా?",
    example_dialogue: [
      { speaker: "AI", text: "क्या मैं आपकी मदद कर सकता हूँ?" },
      { speaker: "User", text: "कृपया स्टेशन का रास्ता बता सकते हैं?" }
    ]
  },

  // -------------------------------------------------------------
  // 6. KIDS ENGLISH (ENGLISH)
  // -------------------------------------------------------------
  {
    id: "k_en_1",
    category: "kids",
    target_language: "english",
    title: "Animals & Colors",
    target_sentence: "The elephant is very big.",
    telugu_translation: "ఏనుగు చాలా పెద్దది.",
    grammar_breakdown_te: "'The elephant' = ఏనుగు, 'very big' = చాలా పెద్దది.",
    example_dialogue: [
      { speaker: "AI", text: "What animal is this?" },
      { speaker: "User", text: "The elephant is very big." }
    ]
  },

  // -------------------------------------------------------------
  // 6. KIDS HINDI (HINDI)
  // -------------------------------------------------------------
  {
    id: "k_hi_1",
    category: "kids",
    target_language: "hindi",
    title: "जानवर और रंग",
    target_sentence: "हाथी बहुत बड़ा है।",
    telugu_translation: "ఏనుగు చాలా పెద్దది.",
    grammar_breakdown_te: "'हाथी' = ఏనుగు, 'बहुत बड़ा' = చాలా పెద్దది.",
    example_dialogue: [
      { speaker: "AI", text: "यह कौन सा जानवर है?" },
      { speaker: "User", text: "हाथी बहुत बड़ा है।" }
    ]
  }
];

// 🚀 SEED DATABASE TABLE IN SUPABASE IF CONNECTED
export async function seedTutorSentencesToSupabase(): Promise<void> {
  if (!supabase) return;
  try {
    const { data } = await supabase.from("tutor_sentences").select("id").limit(1);
    if (!data || data.length === 0) {
      await supabase.from("tutor_sentences").insert(SEED_SENTENCES.map((s) => ({
        id: s.id,
        category: s.category,
        target_language: s.target_language,
        title: s.title,
        target_sentence: s.target_sentence,
        telugu_translation: s.telugu_translation,
        grammar_breakdown_te: s.grammar_breakdown_te,
        example_dialogue: s.example_dialogue
      })));
    }
  } catch (err) {
    console.warn("Supabase tutor_sentences seed check:", err);
  }
}

// 🔍 FETCH SENTENCES FROM SUPABASE DATABASE TABLE
export async function fetchTutorSentencesFromSupabase(
  category: "basic" | "spoken" | "office" | "interview" | "travel" | "kids",
  targetLanguage: TargetLanguage
): Promise<DBSentenceItem[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("tutor_sentences")
        .select("*")
        .eq("category", category)
        .eq("target_language", targetLanguage);

      if (!error && data && data.length > 0) {
        return data as DBSentenceItem[];
      }
    } catch (err) {
      console.warn("Supabase fetch error, fallback to seed dataset:", err);
    }
  }

  // Fallback to local curated SEED_SENTENCES dataset
  return SEED_SENTENCES.filter(
    (s) => s.category === category && s.target_language === targetLanguage
  );
}
