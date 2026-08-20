import React, { useState, useEffect } from "react";
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
  RefreshCw,
  Database
} from "lucide-react";
import { TargetLanguage, UserLearningProfile, updateStreakAndXP } from "@/lib/tutor-api";
import { fetchTutorSentencesFromSupabase, DBSentenceItem, seedTutorSentencesToSupabase } from "@/lib/tutor-db-seed";
import { speechService } from "@/lib/speech-service";

interface TutorModeViewProps {
  language: TargetLanguage;
  profile: UserLearningProfile;
  onBack: () => void;
  onOpenVoicePractice: () => void;
}

export function TutorModeView({ language, profile, onBack, onOpenVoicePractice }: TutorModeViewProps) {
  const isEnglish = language === "english";
  const [activeCategory, setActiveCategory] = useState<"basic" | "spoken" | "office" | "interview" | "travel" | "kids">("basic");
  const [dbSentences, setDbSentences] = useState<DBSentenceItem[]>([]);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>(0);
  const [userSpokenText, setUserSpokenText] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; note: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Trigger Supabase Seed Check & Fetch Sentences
  useEffect(() => {
    let isMounted = true;
    seedTutorSentencesToSupabase();

    async function loadSentences() {
      setLoading(true);
      const data = await fetchTutorSentencesFromSupabase(activeCategory, language);
      if (isMounted) {
        setDbSentences(data);
        setSelectedLessonIndex(0);
        setLoading(false);
      }
    }

    loadSentences();
    return () => { isMounted = false; };
  }, [activeCategory, language]);

  const categories = [
    { id: "basic", title_te: isEnglish ? "ప్రాథమిక ఇంగ్లీష్ (Basic English)" : "ప్రాథమిక హిందీ (Basic Hindi)", title_target: isEnglish ? "Basic English" : "Basic Hindi", icon: BookOpen, badgeColor: "bg-blue-500/10 text-blue-600" },
    { id: "spoken", title_te: isEnglish ? "స్పోకెన్ ఇంగ్లీష్ (Spoken English)" : "స్పోకెన్ హిందీ (Spoken Hindi)", title_target: isEnglish ? "Spoken English" : "Spoken Hindi", icon: MessageSquare, badgeColor: "bg-emerald-500/10 text-emerald-600" },
    { id: "office", title_te: isEnglish ? "ఆఫీస్ ఇంగ్లీష్ (Office English)" : "ఆఫీస్ హిందీ (Workplace Hindi)", title_target: isEnglish ? "Office English" : "Workplace Hindi", icon: Briefcase, badgeColor: "bg-purple-500/10 text-purple-600" },
    { id: "interview", title_te: isEnglish ? "ఇంటర్వ్యూ ఇంగ్లీష్ (Interview English)" : "ఇంటర్వ్యూ హిందీ", title_target: isEnglish ? "Interview English" : "Interview Hindi", icon: Mic, badgeColor: "bg-amber-500/10 text-amber-600" },
    { id: "travel", title_te: isEnglish ? "ట్రావెల్ ఇంగ్లీష్ (Travel English)" : "ట్రావెల్ హిందీ (Travel Hindi)", title_target: isEnglish ? "Travel English" : "Travel Hindi", icon: Plane, badgeColor: "bg-sky-500/10 text-sky-600" },
    { id: "kids", title_te: isEnglish ? "కిడ్స్ ఇంగ్లీష్ (Kids English)" : "కిడ్స్ హిందీ (Kids Hindi)", title_target: isEnglish ? "Kids English" : "Kids Hindi", icon: Smile, badgeColor: "bg-pink-500/10 text-pink-600" }
  ];

  const currentCategory = categories.find((c) => c.id === activeCategory) || categories[0];
  const currentLesson = dbSentences[selectedLessonIndex] || dbSentences[0] || {
    id: "default",
    title: "Lesson",
    target_sentence: isEnglish ? "I am going to the office." : "मैं ऑफिस जा रहा हूँ।",
    telugu_translation: "నేను ఆఫీస్‌కు వెళ్తున్నాను.",
    grammar_breakdown_te: "వర్తమాన కాలంలో ప్రస్తుతం జరుగుతున్న పనిని సూచిస్తుంది.",
    example_dialogue: [
      { speaker: "AI", text: isEnglish ? "Where are you going?" : "आप कहाँ जा रहे हैं?" },
      { speaker: "User", text: isEnglish ? "I am going to the office." : "मैं ऑफिस जा रहा हूँ।" }
    ]
  };

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
          className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-xs font-bold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition cursor-pointer"
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
                setActiveCategory(cat.id as any);
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

      {/* MAIN LESSON CARD (CONNECTED TO SUPABASE DATABASE) */}
      <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-8 shadow-xl space-y-6">

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))]/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase ${currentCategory.badgeColor}`}>
                {currentCategory.title_te}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                <Database className="size-3" />
                Supabase DB Live
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[hsl(var(--foreground))] mt-2">
              {currentLesson.title}
            </h2>
          </div>

          {/* Sentence Pagination if DB returned multiple items */}
          {dbSentences.length > 1 && (
            <div className="flex items-center gap-1.5 bg-[hsl(var(--muted))] p-1 rounded-full border border-[hsl(var(--border))]">
              {dbSentences.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedLessonIndex(idx)}
                  className={`size-7 rounded-full text-xs font-black transition cursor-pointer ${
                    selectedLessonIndex === idx
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-[hsl(var(--muted-foreground))]"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
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
              className="size-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md hover:scale-105 transition cursor-pointer"
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

        {/* EXAMPLE CONVERSATION FROM DATABASE */}
        <div className="space-y-3">
          <h4 className="text-sm font-extrabold text-[hsl(var(--foreground))]">
            💬 సంభాషణ ఉదాహరణ (Database Dialogue Conversation):
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
                  className="text-[hsl(var(--muted-foreground))] hover:text-blue-600 cursor-pointer"
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
              className="py-3.5 px-6 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] font-extrabold text-xs transition flex items-center gap-2 cursor-pointer"
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
