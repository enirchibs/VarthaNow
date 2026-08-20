import React, { useState } from "react";
import { 
  BookOpen, 
  Briefcase, 
  Mic, 
  Plane, 
  Smile, 
  MessageSquare, 
  Check, 
  Volume2, 
  ArrowLeft,
  Sparkles,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { TargetLanguage, UserLearningProfile, updateStreakAndXP } from "@/lib/tutor-api";
import { speechService } from "@/lib/speech-service";

interface TutorModeViewProps {
  language: TargetLanguage;
  profile: UserLearningProfile;
  onBack: () => void;
  onOpenVoicePractice: () => void;
}

interface CategoryItem {
  id: string;
  title_te: string;
  title_target: string;
  desc_te: string;
  icon: React.ElementType;
  badgeColor: string;
  lessons: {
    id: string;
    title: string;
    target_sentence: string;
    telugu_translation: string;
    grammar_breakdown_te: string;
    example_dialogue: { speaker: string; text: string }[];
  }[];
}

export function TutorModeView({ language, profile, onBack, onOpenVoicePractice }: TutorModeViewProps) {
  const isEnglish = language === "english";
  const [activeCategory, setActiveCategory] = useState<string>("basic");
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>(0);
  const [userSpokenText, setUserSpokenText] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; note: string } | null>(null);

  const categories: CategoryItem[] = [
    {
      id: "basic",
      title_te: isEnglish ? "ప్రాథమిక ఇంగ్లీష్ (Basic English)" : "ప్రాథమిక హిందీ (Basic Hindi)",
      title_target: isEnglish ? "Basic English" : "Basic Hindi",
      desc_te: "అక్షరాలు, సాధారణ పదాలు, వర్తమాన కాలం & చిన్న వాక్యాలు",
      icon: BookOpen,
      badgeColor: "bg-blue-500/10 text-blue-600",
      lessons: [
        {
          id: "b1",
          title: isEnglish ? "I am / You are Usage" : "मैं हूँ / आप हैं का प्रयोग",
          target_sentence: isEnglish ? "I am going to the office." : "मैं ऑफिस जा रहा हूँ।",
          telugu_translation: "నేను ఆఫీస్‌కు వెళ్తున్నాను.",
          grammar_breakdown_te: isEnglish
            ? "'I am' = నేను, 'go' = వెళ్లు, 'going' = వెళ్తున్నాను. వర్తమాన కాలంలో -ing వస్తుంది."
            : "'मैं' = నేను, 'जा रहा हूँ' = వెళ్తున్నాను. పురుషవాచకంలో रहा हूँ వాడాలి.",
          example_dialogue: [
            { speaker: "AI", text: isEnglish ? "Where are you going?" : "आप कहाँ जा रहे हैं?" },
            { speaker: "User", text: isEnglish ? "I am going to the office." : "मैं ऑफिस जा रहा हूँ।" }
          ]
        },
        {
          id: "b2",
          title: isEnglish ? "Asking Simple Questions" : "साधारण प्रश्न पूछना",
          target_sentence: isEnglish ? "Where are you going?" : "आप कहाँ जा रहे हैं?",
          telugu_translation: "మీరు ఎక్కడికి వెళ్తున్నారు?",
          grammar_breakdown_te: isEnglish
            ? "'Where' = ఎక్కడ, 'are you' = మీరు, 'going' = వెళ్తున్నారు."
            : "'कहाँ' = ఎక్కడ, 'जा रहे हैं' = వెళ్తున్నారు (మర్యాదగా).",
          example_dialogue: [
            { speaker: "AI", text: isEnglish ? "Excuse me, where are you going?" : "सुनिए, आप कहाँ जा रहे हैं?" },
            { speaker: "User", text: isEnglish ? "I am going home." : "मैं घर जा रहा हूँ।" }
          ]
        }
      ]
    },
    {
      id: "spoken",
      title_te: isEnglish ? "స్పోకెన్ ఇంగ్లీష్ (Spoken English)" : "స్పోకెన్ హిందీ (Spoken Hindi)",
      title_target: isEnglish ? "Spoken English" : "Spoken Hindi",
      desc_te: "ఇల్లు, మార్కెట్, బస్సు, స్నేహితులతో నిత్య జీవిత సంభాషణలు",
      icon: MessageSquare,
      badgeColor: "bg-emerald-500/10 text-emerald-600",
      lessons: [
        {
          id: "sp1",
          title: isEnglish ? "Morning Greetings & Routine" : "सुबह की बातें",
          target_sentence: isEnglish ? "Good morning! How are you doing today?" : "शुभ प्रभात! आप आज कैसे हैं?",
          telugu_translation: "శుభోదయం! ఈరోజు మీరు ఎలా ఉన్నారు?",
          grammar_breakdown_te: isEnglish
            ? "'How are you doing?' అనేది 'How are you?' కి సమానమైన నాచురల్ స్పోకెన్ రూపం."
            : "'शुभ प्रभात' = శుభోదయం. 'आप कैसे हैं?' = మీరు ఎలా ఉన్నారు?",
          example_dialogue: [
            { speaker: "AI", text: isEnglish ? "Good morning! Did you have breakfast?" : "शुभ प्रभात! क्या आपने नाश्ता किया?" },
            { speaker: "User", text: isEnglish ? "Yes, I had breakfast." : "हाँ, मैंने नाश्ता कर लिया।" }
          ]
        }
      ]
    },
    {
      id: "office",
      title_te: isEnglish ? "ఆఫీస్ ఇంగ్లీష్ (Office English)" : "ఆఫీస్ హిందీ (Workplace Hindi)",
      title_target: isEnglish ? "Office English" : "Workplace Hindi",
      desc_te: "మీటింగ్‌లు, ఇమెయిల్‌లు, ప్రాజెక్ట్ అప్‌డేట్‌లు & మేనేజర్ చర్చలు",
      icon: Briefcase,
      badgeColor: "bg-purple-500/10 text-purple-600",
      lessons: [
        {
          id: "off1",
          title: isEnglish ? "Task Completion Update" : "काम पूरा होने की जानकारी",
          target_sentence: isEnglish ? "I have completed this task." : "मैंने यह काम पूरा कर लिया है।",
          telugu_translation: "నేను ఈ పని పూర్తి చేశాను.",
          grammar_breakdown_te: isEnglish
            ? "ఇప్పుడే పూర్తయిన పనికి 'I have completed' (Present Perfect) ఉపయోగించాలి."
            : "పూర్తయిన పనికి 'मैंने ... कर लिया है' అని చెప్పాలి.",
          example_dialogue: [
            { speaker: "AI", text: isEnglish ? "Did you complete the report?" : "क्या आपने रिपोर्ट पूरी की?" },
            { speaker: "User", text: isEnglish ? "Yes, I have completed this task." : "हाँ, मैंने यह काम पूरा कर लिया है।" }
          ]
        }
      ]
    },
    {
      id: "interview",
      title_te: isEnglish ? "ఇంటర్వ్యూ ఇంగ్లీష్ (Interview English)" : "ఇంటర్వ్యూ హిందీ",
      title_target: isEnglish ? "Interview English" : "Interview Hindi",
      desc_te: "HR ప్రశ్నలు, 'Tell me about yourself' & అనుభవం వివరించడం",
      icon: Mic,
      badgeColor: "bg-amber-500/10 text-amber-600",
      lessons: [
        {
          id: "int1",
          title: isEnglish ? "Tell Me About Yourself" : "अपना परिचय दें",
          target_sentence: isEnglish ? "I have been working for three years." : "मैं तीन साल से काम कर रहा हूँ।",
          telugu_translation: "నేను మూడేళ్లుగా పనిచేస్తున్నాను.",
          grammar_breakdown_te: isEnglish
            ? "❌ 'I am working from 3 years' అనకూడదు. సమయం పొడవుకు 'for three years' మరియు 'have been working' అని చెప్పాలి."
            : "'तीन साल से' = మూడేళ్లుగా.",
          example_dialogue: [
            { speaker: "AI", text: isEnglish ? "How long have you been working here?" : "आप यहाँ कब से काम कर रहे हैं?" },
            { speaker: "User", text: isEnglish ? "I have been working for three years." : "मैं तीन साल से काम कर रहा हूँ।" }
          ]
        }
      ]
    },
    {
      id: "travel",
      title_te: isEnglish ? "ట్రావెల్ ఇంగ్లీష్ (Travel English)" : "ట్రావెల్ హిందీ (Travel Hindi)",
      title_target: isEnglish ? "Travel English" : "Travel Hindi",
      desc_te: "ఎయిర్‌పోర్ట్, హోటల్, టాక్సీ & దిశలు అడగడం",
      icon: Plane,
      badgeColor: "bg-sky-500/10 text-sky-600",
      lessons: [
        {
          id: "tr1",
          title: isEnglish ? "Asking Directions" : "रास्ता पूछना",
          target_sentence: isEnglish ? "Could you please tell me the way to the station?" : "कृपया स्टेशन का रास्ता बता सकते हैं?",
          telugu_translation: "దయచేసి స్టేషన్‌కు వెళ్లే మార్గం చెప్పగలరా?",
          grammar_breakdown_te: isEnglish
            ? "'Could you please' అనేది చాలా మర్యాదపూర్వకమైన అభ్యర్థన."
            : "'कृपया' = దయచేసి. 'रास्ता बता सकते हैं?' = మార్గం చెప్పగలరా?",
          example_dialogue: [
            { speaker: "AI", text: isEnglish ? "Can I help you?" : "क्या मैं आपकी मदद कर सकता हूँ?" },
            { speaker: "User", text: isEnglish ? "Could you please tell me the way to the station?" : "कृपया स्टेशन का रास्ता बता सकते हैं?" }
          ]
        }
      ]
    },
    {
      id: "kids",
      title_te: isEnglish ? "కిడ్స్ ఇంగ్లీష్ (Kids English)" : "కిడ్స్ హిందీ (Kids Hindi)",
      title_target: isEnglish ? "Kids English" : "Kids Hindi",
      desc_te: "పిల్లల కోసం సులువైన పదాలు, రంగులు, జంతువులు & చిన్న వాక్యాలు",
      icon: Smile,
      badgeColor: "bg-pink-500/10 text-pink-600",
      lessons: [
        {
          id: "k1",
          title: isEnglish ? "Animals & Colors" : "जानवर और रंग",
          target_sentence: isEnglish ? "The elephant is very big." : "हाथी बहुत बड़ा है।",
          telugu_translation: "ఏనుగు చాలా పెద్దది.",
          grammar_breakdown_te: isEnglish
            ? "'The elephant' = ఏనుగు, 'very big' = చాలా పెద్దది."
            : "'हाथी' = ఏనుగు, 'बहुत बड़ा' = చాలా పెద్దది.",
          example_dialogue: [
            { speaker: "AI", text: isEnglish ? "What animal is this?" : "यह कौन सा जानवर है?" },
            { speaker: "User", text: isEnglish ? "The elephant is very big." : "हाथी बहुत बड़ा है।" }
          ]
        }
      ]
    }
  ];

  const currentCategory = categories.find((c) => c.id === activeCategory) || categories[0];
  const currentLesson = currentCategory.lessons[selectedLessonIndex] || currentCategory.lessons[0];

  const handlePlayAudio = (text: string) => {
    speechService.speak(text, isEnglish ? "en-US" : "hi-IN");
  };

  const handleStartSpeech = () => {
    setIsRecording(true);
    setUserSpokenText("");
    setFeedback(null);

    speechService.startListening(
      isEnglish ? "en-US" : "hi-IN",
      (res) => {
        setUserSpokenText(res.transcript);
        if (res.isFinal) {
          setIsRecording(false);
          // Evaluate
          const matches = res.transcript.toLowerCase().includes(currentLesson.target_sentence.toLowerCase().slice(0, 10));
          if (matches || res.transcript.length > 5) {
            setFeedback({
              isCorrect: true,
              note: "చాలా బాగుంది! 👍 శ్రద్ధగా మాట్లాడారు."
            });
            updateStreakAndXP(15);
          } else {
            setFeedback({
              isCorrect: false,
              note: "మళ్లీ స్పష్టంగా చెప్పండి. (Try again speaking clearly)"
            });
          }
        }
      },
      (err) => {
        setIsRecording(false);
        setFeedback({ isCorrect: false, note: "మైక్రోఫోన్ స్పందించలేదు. దయచేసి టైప్ చేసి ప్రయత్నించండి." });
      },
      () => setIsRecording(false)
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-xs font-bold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition"
        >
          <ArrowLeft className="size-4" />
          <span>వెనుకకు (Dashboard)</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xl">{isEnglish ? "🇬🇧" : "🇮🇳"}</span>
          <span className="text-sm font-black text-[hsl(var(--foreground))]">
            {isEnglish ? "English Tutor" : "Hindi Tutor"}
          </span>
        </div>
      </div>

      {/* Category Pills Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const IconComp = cat.icon;
          const isActive = cat.id === activeCategory;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setSelectedLessonIndex(0);
                setFeedback(null);
                setUserSpokenText("");
              }}
              className={`rounded-full px-4 py-2 text-xs font-black whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
                isActive
                  ? isEnglish ? "bg-blue-600 text-white shadow-sm" : "bg-orange-600 text-white shadow-sm"
                  : "bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))]"
              }`}
            >
              <IconComp className="size-3.5" />
              <span>{cat.title_target}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN LESSON CARD */}
      <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-8 shadow-xl space-y-6">

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))]/60 pb-4">
          <div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase ${currentCategory.badgeColor}`}>
              {currentCategory.title_te}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[hsl(var(--foreground))] mt-2">
              {currentLesson.title}
            </h2>
          </div>

          <button
            onClick={() => handlePlayAudio(currentLesson.target_sentence)}
            className="flex items-center gap-2 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 px-4 py-2 text-xs font-black transition cursor-pointer"
          >
            <Volume2 className="size-4" />
            <span>వినండి (Listen)</span>
          </button>
        </div>

        {/* TARGET SENTENCE DISPLAY & TELUGU BREAKDOWN */}
        <div className="rounded-2xl bg-[hsl(var(--muted))]/50 p-5 space-y-3 border border-[hsl(var(--border))]/50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                {isEnglish ? "Target Sentence (ఇంగ్లీష్)" : "Target Sentence (హిందీ)"}
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                "{currentLesson.target_sentence}"
              </h3>
            </div>
            <button
              onClick={() => handlePlayAudio(currentLesson.target_sentence)}
              className="size-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md hover:scale-105 transition"
            >
              <Volume2 className="size-5" />
            </button>
          </div>

          <div className="border-t border-[hsl(var(--border))]/60 pt-3 space-y-1.5">
            <p className="text-xs font-bold text-[hsl(var(--foreground))] flex items-center gap-1.5">
              <span>అర్థం (Telugu Translation):</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{currentLesson.telugu_translation}</span>
            </p>
            <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] leading-relaxed">
              💡 <span className="font-bold text-[hsl(var(--foreground))]">గ్రామర్ వివరణ:</span> {currentLesson.grammar_breakdown_te}
            </p>
          </div>
        </div>

        {/* EXAMPLE CONVERSATION */}
        <div className="space-y-3">
          <h4 className="text-sm font-extrabold text-[hsl(var(--foreground))]">
            💬 నిత్య జీవిత సంభాషణ ఉదాహరణ (Real Conversation):
          </h4>
          <div className="space-y-2">
            {currentLesson.example_dialogue.map((dialogue, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold ${
                  dialogue.speaker === "AI"
                    ? "bg-blue-500/10 text-blue-900 dark:text-blue-200 border border-blue-500/20"
                    : "bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 border border-emerald-500/20"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-black">{dialogue.speaker}:</span>
                  <span className="text-sm">{dialogue.text}</span>
                </div>
                <button
                  onClick={() => handlePlayAudio(dialogue.text)}
                  className="text-[hsl(var(--muted-foreground))] hover:text-blue-600"
                >
                  <Volume2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SPEAKING PRACTICE TRIGGER SECTION */}
        <div className="rounded-2xl border border-dashed border-blue-500/40 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 p-5 text-center space-y-4">
          <div className="space-y-1">
            <h4 className="text-base font-black text-[hsl(var(--foreground))]">
              🎤 ఇప్పుడు మీ వంతు! గొంతు విప్పి మాట్లాడండి (Speak Out Loud)
            </h4>
            <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              పై వాక్యాన్ని మైక్రోఫోన్‌లో బిగ్గరగా చెప్పండి. AI వింటుంది.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleStartSpeech}
              className={`py-3.5 px-6 rounded-full font-black text-xs shadow-lg transition flex items-center gap-2.5 cursor-pointer ${
                isRecording
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95"
              }`}
            >
              <Mic className="size-4.5" />
              <span>{isRecording ? "వింటున్నాము... (Listening...)" : "🎤 నొక్కి మాట్లాడండి (Tap & Speak)"}</span>
            </button>

            <button
              onClick={onOpenVoicePractice}
              className="py-3.5 px-6 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] font-extrabold text-xs transition flex items-center gap-2"
            >
              <Sparkles className="size-4 text-purple-500" />
              <span>పూర్తి AI వాయిస్ చాట్</span>
            </button>
          </div>

          {userSpokenText && (
            <div className="p-3 rounded-xl bg-[hsl(var(--muted))] text-xs font-bold text-[hsl(var(--foreground))]">
              మీరు చెప్పినది: "{userSpokenText}"
            </div>
          )}

          {feedback && (
            <div className={`p-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 ${
              feedback.isCorrect ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
            }`}>
              <Check className="size-4" />
              <span>{feedback.note}</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
