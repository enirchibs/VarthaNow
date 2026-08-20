import React, { useState } from "react";
import { 
  Zap, 
  BookOpen, 
  Volume2, 
  Mic, 
  Check, 
  ArrowLeft, 
  Flame, 
  Sparkles,
  HelpCircle,
  Award
} from "lucide-react";
import { TargetLanguage, UserLearningProfile, getDailyFiveMinuteContent, updateStreakAndXP } from "@/lib/tutor-api";
import { speechService } from "@/lib/speech-service";

interface DailyFiveMinViewProps {
  language: TargetLanguage;
  profile: UserLearningProfile;
  onBack: () => void;
}

export function DailyFiveMinView({ language, profile, onBack }: DailyFiveMinViewProps) {
  const content = getDailyFiveMinuteContent(1, language);
  const [activeTab, setActiveTab] = useState<"words" | "conversation" | "speak" | "quiz">("words");
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);

  const handlePlay = (text: string) => {
    speechService.speak(text, language === "english" ? "en-US" : "hi-IN");
  };

  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    setSelectedQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    setCompleted(true);
    updateStreakAndXP(25);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-xs font-bold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
        >
          <ArrowLeft className="size-4" />
          <span>వెనుకకు (Dashboard)</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="text-sm font-black text-[hsl(var(--foreground))]">
            Daily 5 Minutes ({language === "english" ? "English" : "Hindi"})
          </span>
        </div>
      </div>

      {/* Micro-learning Navigation Tabs */}
      <div className="flex items-center justify-between gap-2 bg-[hsl(var(--card))] p-1.5 rounded-2xl border border-[hsl(var(--border))]">
        {[
          { id: "words", label: "1. 5 పదాలు", icon: "📚" },
          { id: "conversation", label: "2. సంభాషణ", icon: "💬" },
          { id: "speak", label: "3. 1-Min Speak", icon: "🎤" },
          { id: "quiz", label: "4. క్విజ్", icon: "❓" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === tab.id
                ? "bg-purple-600 text-white shadow-md"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* COMPLETED BANNER */}
      {completed && (
        <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-center font-black text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2 animate-in zoom-in-95">
          <Award className="size-5 text-emerald-500" />
          <span>అభినందనలు! ఈరోజు 5 నిమిషాల సాధన పూర్తయింది. (+25 XP పొందారు) 🔥</span>
        </div>
      )}

      {/* TAB 1: 5 WORDS */}
      {activeTab === "words" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-[hsl(var(--foreground))] flex items-center gap-2">
              <BookOpen className="size-5 text-purple-600" />
              ఈరోజు 5 ముఖ్యమైన పదాలు (Today's 5 Words)
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {content.words.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-extrabold text-purple-600 dark:text-purple-400">
                    {idx + 1}. {item.word}
                  </h4>
                  <button
                    onClick={() => handlePlay(item.word)}
                    className="size-8 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center hover:scale-105 transition"
                  >
                    <Volume2 className="size-4" />
                  </button>
                </div>
                <p className="text-xs font-bold text-[hsl(var(--foreground))]">
                  అర్థం: <span className="text-emerald-600 dark:text-emerald-400">{item.meaning_te}</span>
                </p>
                <div className="p-2.5 rounded-xl bg-[hsl(var(--muted))]/50 text-[11px] font-semibold text-[hsl(var(--muted-foreground))] space-y-0.5">
                  <p className="font-bold text-[hsl(var(--foreground))]">"{item.example_target}"</p>
                  <p className="italic">తెలుగు: {item.example_te}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CONVERSATION */}
      {activeTab === "conversation" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-[hsl(var(--foreground))] flex items-center gap-2">
              <Zap className="size-5 text-purple-600" />
              ఈరోజు సంభాషణ పాఠం (Today's Dialogue)
            </h3>
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-4 shadow-sm">
            {content.conversation.map((dialogue, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border space-y-1.5 ${
                  dialogue.speaker === "AI"
                    ? "bg-blue-500/10 border-blue-500/20 text-blue-900 dark:text-blue-200"
                    : "bg-purple-500/10 border-purple-500/20 text-purple-900 dark:text-purple-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs uppercase">{dialogue.speaker}:</span>
                  <button onClick={() => handlePlay(dialogue.text_target)} className="text-xs font-bold text-blue-600 hover:underline">
                    <Volume2 className="size-4 inline mr-1" />
                    వినండి
                  </button>
                </div>
                <p className="text-sm font-extrabold">"{dialogue.text_target}"</p>
                <p className="text-xs italic text-[hsl(var(--muted-foreground))]">తెలుగు: {dialogue.text_te}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: 1-MIN SPEAK */}
      {activeTab === "speak" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-[hsl(var(--foreground))] flex items-center gap-2">
              <Mic className="size-5 text-purple-600" />
              1 నిమిషం బిగ్గరగా మాట్లాడే సవాలు (1-Min Speaking Challenge)
            </h3>
          </div>

          <div className="rounded-2xl border border-dashed border-purple-500/40 bg-purple-500/5 p-6 text-center space-y-4">
            <h4 className="text-lg font-black text-[hsl(var(--foreground))]">
              "{content.speak_topic.title_te}"
            </h4>
            <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              {content.speak_topic.prompt_te}
            </p>

            <button
              onClick={() => handlePlay(content.speak_topic.prompt_target)}
              className="py-3 px-6 rounded-full bg-purple-600 text-white font-black text-xs shadow-md hover:bg-purple-700 transition inline-flex items-center gap-2"
            >
              <Mic className="size-4" />
              <span>బిగ్గరగా చెప్పండి (Speak Now)</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: QUIZ */}
      {activeTab === "quiz" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-[hsl(var(--foreground))] flex items-center gap-2">
              <HelpCircle className="size-5 text-purple-600" />
              త్వరిత మూల్యాంకన క్విజ్ (Quick Quiz)
            </h3>
          </div>

          <div className="space-y-4">
            {content.quiz.map((q, qIdx) => (
              <div key={qIdx} className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm space-y-3">
                <h4 className="text-sm font-extrabold text-[hsl(var(--foreground))]">
                  {qIdx + 1}. {q.question_te}
                </h4>

                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedQuizAnswers[qIdx] === optIdx;
                    const isCorrect = optIdx === q.correct_index;
                    let btnClass = "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))]";
                    if (quizSubmitted) {
                      if (isCorrect) btnClass = "border-emerald-600 bg-emerald-500/15 text-emerald-700 font-black";
                      else if (isSelected) btnClass = "border-red-600 bg-red-500/15 text-red-700 font-bold";
                    } else if (isSelected) {
                      btnClass = "border-purple-600 bg-purple-500/10 font-bold";
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={quizSubmitted}
                        onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                        className={`w-full p-3 rounded-xl border text-left text-xs transition flex items-center justify-between ${btnClass}`}
                      >
                        <span>{opt}</span>
                        {quizSubmitted && isCorrect && <Check className="size-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 italic pt-1">
                    💡 వివరణ: {q.explanation_te}
                  </p>
                )}
              </div>
            ))}

            {!quizSubmitted && (
              <button
                onClick={handleSubmitQuiz}
                className="w-full py-3.5 rounded-full bg-purple-600 text-white font-black text-xs shadow-lg hover:bg-purple-700 transition"
              >
                సమాధానాలు సమర్పించండి (Submit Quiz)
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
