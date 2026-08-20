import React from "react";
import { 
  Award, 
  Flame, 
  Clock, 
  Star, 
  ArrowLeft, 
  Check, 
  BookOpen, 
  AlertCircle,
  Volume2,
  TrendingUp,
  Target
} from "lucide-react";
import { UserLearningProfile, getStoredProfile } from "@/lib/tutor-api";
import { speechService } from "@/lib/speech-service";

interface ProgressProfileViewProps {
  profile: UserLearningProfile;
  onBack: () => void;
  onOpenOnboarding: () => void;
}

export function ProgressProfileView({ profile, onBack, onOpenOnboarding }: ProgressProfileViewProps) {
  const handlePlayWord = (word: string) => {
    speechService.speak(word, profile.target_language === "english" ? "en-US" : "hi-IN");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-xs font-bold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
        >
          <ArrowLeft className="size-4" />
          <span>వెనుకకు (Dashboard)</span>
        </button>

        <div className="flex items-center gap-2">
          <Star className="size-5 text-yellow-500" />
          <span className="text-sm font-black text-[hsl(var(--foreground))]">
            నా పురోగతి & బలహీనతలు (Progress & Profile)
          </span>
        </div>
      </div>

      {/* OVERALL SKILL STAR BARS */}
      <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))]/60 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[hsl(var(--foreground))]">
              భాషా నైపుణ్యాల స్కోర్ (Language Proficiency)
            </h2>
            <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              లక్ష్యం: {profile.goal} | స్థాయి: {profile.level}
            </p>
          </div>

          <button
            onClick={onOpenOnboarding}
            className="py-2 px-4 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-xs font-bold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--border))] transition"
          >
            లక్ష్యం మార్చండి (Edit Settings)
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { name: "Speaking (మాట్లాడే నైపుణ్యం)", stars: 4, score: "80%", color: "bg-blue-600" },
            { name: "Vocabulary (పదజాలం)", stars: 4, score: "85%", color: "bg-purple-600" },
            { name: "Grammar (వ్యాకరణం)", stars: 3, score: "72%", color: "bg-emerald-600" },
            { name: "Confidence (ఆత్మవిశ్వాసం)", stars: 4, score: "78%", color: "bg-amber-600" }
          ].map((skill) => (
            <div key={skill.name} className="p-4 rounded-2xl border border-[hsl(var(--border))]/60 bg-[hsl(var(--muted))]/40 space-y-2">
              <div className="flex justify-between items-center text-xs font-black text-[hsl(var(--foreground))]">
                <span>{skill.name}</span>
                <span className="text-blue-600">{skill.score}</span>
              </div>
              <div className="h-2 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                <div className={`h-full ${skill.color} rounded-full`} style={{ width: skill.score }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WEAK GRAMMAR AREAS TRACKER */}
      <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xl space-y-4">
        <h3 className="text-base font-black text-[hsl(var(--foreground))] flex items-center gap-2">
          <AlertCircle className="size-5 text-amber-500" />
          ముఖ్యమైన గ్రామర్ బలహీనతలు (Weak Areas to Practice)
        </h3>

        <div className="grid gap-3 sm:grid-cols-3">
          {profile.grammar_weaknesses.map((weakness, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2.5"
            >
              <span className="size-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-black shrink-0 text-[10px]">
                {idx + 1}
              </span>
              <span>{weakness}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RECENT COMMON MISTAKES & TELUGU NOTES LOG */}
      <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xl space-y-4">
        <h3 className="text-base font-black text-[hsl(var(--foreground))] flex items-center gap-2">
          <TrendingUp className="size-5 text-blue-600" />
          ఇటీవలి తప్పులు & తెలుగు వివరణల హిస్టరీ (Recent Mistakes Log)
        </h3>

        <div className="space-y-3">
          {profile.common_mistakes.map((mistake, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-[hsl(var(--border))]/70 bg-[hsl(var(--muted))]/30 space-y-1.5 text-xs font-semibold"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-red-600 dark:text-red-400 font-bold">❌ {mistake.wrong}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black">✅ {mistake.correct}</span>
              </div>
              <p className="text-[hsl(var(--muted-foreground))] italic">
                💡 తెలుగులో: {mistake.telugu_note}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* LEARNED VOCABULARY LIST */}
      <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xl space-y-4">
        <h3 className="text-base font-black text-[hsl(var(--foreground))] flex items-center gap-2">
          <BookOpen className="size-5 text-purple-600" />
          నేర్చుకున్న పదజాలం (Saved Words: {profile.words_learned.length})
        </h3>

        <div className="flex flex-wrap gap-2">
          {profile.words_learned.map((word) => (
            <button
              key={word}
              onClick={() => handlePlayWord(word)}
              className="px-3.5 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 hover:bg-purple-500/10 hover:text-purple-600 text-xs font-extrabold text-[hsl(var(--foreground))] transition flex items-center gap-1.5"
            >
              <span>{word}</span>
              <Volume2 className="size-3.5 text-purple-500" />
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
