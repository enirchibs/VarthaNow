import React from "react";
import { 
  Flame, 
  Clock, 
  Star, 
  Mic, 
  BookOpen, 
  Sparkles, 
  MessageSquare, 
  Globe, 
  ArrowRight,
  Zap,
  Target,
  Bot
} from "lucide-react";
import { UserLearningProfile, TargetLanguage } from "@/lib/tutor-api";

interface DashboardViewProps {
  profile: UserLearningProfile;
  onSelectMode: (mode: "english_tutor" | "hindi_tutor" | "speaking_practice" | "daily_5min" | "native_translator" | "profile") => void;
  onChangeLanguage: (lang: TargetLanguage) => void;
  onOpenOnboarding: () => void;
}

export function DashboardView({ profile, onSelectMode, onChangeLanguage, onOpenOnboarding }: DashboardViewProps) {
  const isEnglish = profile.target_language === "english";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header Greeting & Language Switcher */}
      <div className="rounded-[2rem] bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-2 max-w-xl z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-black backdrop-blur-md text-white">
              <Bot className="size-3.5" />
              AI నేర్చుకునే భాగస్వామి
            </span>
            <button
              onClick={onOpenOnboarding}
              className="text-[11px] font-extrabold text-blue-200 underline hover:text-white transition"
            >
              లక్ష్యం మార్చండి (Level: {profile.level})
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight">
            ఈరోజు మాట్లాడటానికి సిద్ధమేనా? 🗣️
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-blue-100 leading-relaxed">
            "తెలుగులో మాట్లాడండి — AIతో English & Hindi ధారాళంగా నేర్చుకోండి."
          </p>
        </div>

        {/* Language Switcher Pills */}
        <div className="z-10 flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl backdrop-blur-md border border-white/10">
          <button
            onClick={() => onChangeLanguage("english")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              profile.target_language === "english"
                ? "bg-white text-blue-900 shadow-md scale-105"
                : "text-white/80 hover:text-white"
            }`}
          >
            <span>🇬🇧</span>
            <span>English</span>
          </button>

          <button
            onClick={() => onChangeLanguage("hindi")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              profile.target_language === "hindi"
                ? "bg-white text-orange-900 shadow-md scale-105"
                : "text-white/80 hover:text-white"
            }`}
          >
            <span>🇮🇳</span>
            <span>Hindi</span>
          </button>
        </div>
      </div>

      {/* Today's Progress Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 flex items-center gap-3.5 shadow-xs">
          <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 font-black">
            <Flame className="size-6 animate-pulse" />
          </div>
          <div>
            <div className="text-lg font-black text-[hsl(var(--foreground))]">
              {profile.streak} రోజులు
            </div>
            <p className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
              🔥 Daily Streak
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 flex items-center gap-3.5 shadow-xs">
          <div className="size-11 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 font-black">
            <Clock className="size-6" />
          </div>
          <div>
            <div className="text-lg font-black text-[hsl(var(--foreground))]">
              {profile.speaking_attempts * 2 + 5} నిమిషాలు
            </div>
            <p className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
              ⏱️ సాధన సమయం
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 flex items-center gap-3.5 shadow-xs">
          <div className="size-11 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center shrink-0 font-black">
            <Star className="size-6" />
          </div>
          <div>
            <div className="text-lg font-black text-[hsl(var(--foreground))]">
              {profile.words_learned.length} పదాలు
            </div>
            <p className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
              ⭐ నేర్చుకున్నవి
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 flex items-center gap-3.5 shadow-xs">
          <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 font-black">
            <Mic className="size-6" />
          </div>
          <div>
            <div className="text-lg font-black text-[hsl(var(--foreground))]">
              {profile.speaking_attempts} ప్రయత్నాలు
            </div>
            <p className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
              🎤 మాట్లాడిన శ్రమ
            </p>
          </div>
        </div>
      </div>

      {/* TODAY'S LESSON PREVIEW CARD */}
      <div className="rounded-[1.8rem] border border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1.5 max-w-xl">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 text-white px-2.5 py-0.5 text-[10px] font-black uppercase">
            ⚡ ఈరోజు 5 నిమిషాల పాఠం
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold text-[hsl(var(--foreground))]">
            {isEnglish ? "Today's Lesson: Daily Routine & Work" : "आज का पाठ: बातचीत और काम"}
          </h3>
          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] leading-relaxed">
            5 కొత్త పదాలు, ఆఫీస్ సంభాషణ మరియు 1 నిమిషం మాట్లాడే ప్రాక్టీస్.
          </p>
        </div>

        <button
          onClick={() => onSelectMode("daily_5min")}
          className="py-3 px-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs shadow-md hover:opacity-95 transition flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <span>పాఠం ప్రారంభించండి</span>
          <ArrowRight className="size-4" />
        </button>
      </div>

      {/* 4 CORE MODES GRID */}
      <div className="space-y-3">
        <h2 className="text-lg font-black text-[hsl(var(--foreground))] flex items-center gap-2">
          <Target className="size-5 text-blue-600" />
          ముఖ్యమైన సాధన రకాలు (Core Modes)
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Mode 1: English Tutor */}
          <div
            onClick={() => {
              onChangeLanguage("english");
              onSelectMode("english_tutor");
            }}
            className="p-5 rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-blue-500/10 hover:border-blue-500/40 transition-all cursor-pointer space-y-3 group shadow-xs hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-2xl font-black">
                🇬🇧
              </div>
              <span className="text-[10px] font-black bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded-full">
                6 విభాగములు
              </span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[hsl(var(--foreground))] group-hover:text-blue-600 transition-colors">
                🇬🇧 English Tutor
              </h3>
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mt-1 leading-relaxed">
                Basic, Spoken, Office, Interview, Travel & Kids English.
              </p>
            </div>
          </div>

          {/* Mode 2: Hindi Tutor */}
          <div
            onClick={() => {
              onChangeLanguage("hindi");
              onSelectMode("hindi_tutor");
            }}
            className="p-5 rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-orange-500/10 hover:border-orange-500/40 transition-all cursor-pointer space-y-3 group shadow-xs hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="size-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center text-2xl font-black">
                🇮🇳
              </div>
              <span className="text-[10px] font-black bg-orange-600/10 text-orange-600 px-2 py-0.5 rounded-full">
                సరళమైన హిందీ
              </span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[hsl(var(--foreground))] group-hover:text-orange-600 transition-colors">
                🇮🇳 Hindi Tutor
              </h3>
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mt-1 leading-relaxed">
                హిందీ సంభాషణలు, ప్రయాణాలు, మార్కెట్ & ఆఫీస్ హిందీ.
              </p>
            </div>
          </div>

          {/* Mode 3: Speaking Practice */}
          <div
            onClick={() => onSelectMode("speaking_practice")}
            className="p-5 rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all cursor-pointer space-y-3 group shadow-xs hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
                <Mic className="size-6" />
              </div>
              <span className="text-[10px] font-black bg-emerald-600/10 text-emerald-600 px-2 py-0.5 rounded-full">
                AI Voice Chat
              </span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[hsl(var(--foreground))] group-hover:text-emerald-600 transition-colors">
                🎤 Speaking Practice
              </h3>
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mt-1 leading-relaxed">
                మైక్రోఫోన్‌తో AIతో మాట్లాడండి. తప్పులు తెలుగులో తెలుసుకోండి.
              </p>
            </div>
          </div>

          {/* Mode 4: Daily 5 Minutes */}
          <div
            onClick={() => onSelectMode("daily_5min")}
            className="p-5 rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-purple-500/10 hover:border-purple-500/40 transition-all cursor-pointer space-y-3 group shadow-xs hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="size-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-black">
                <Zap className="size-6" />
              </div>
              <span className="text-[10px] font-black bg-purple-600/10 text-purple-600 px-2 py-0.5 rounded-full">
                రోజువారీ 5 నిమిషాలు
              </span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[hsl(var(--foreground))] group-hover:text-purple-600 transition-colors">
                📝 Daily 5 Minutes
              </h3>
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mt-1 leading-relaxed">
                5 పదాలు, సంభాషణ, మాట్లాడే ప్రాక్టీస్ మరియు క్విజ్.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ADDITIONAL FEATURE CARDS: Native Speaker Translator & Progress */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div
          onClick={() => onSelectMode("native_translator")}
          className="p-5 rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-indigo-500/40 transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-xs"
        >
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
              <Globe className="size-5.5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[hsl(var(--foreground))] group-hover:text-indigo-600 transition">
                💡 Native Speaker Style
              </h4>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                "I have one doubt" ని నాచురల్‌గా ఎలా చెప్పాలి?
              </p>
            </div>
          </div>
          <ArrowRight className="size-4 text-[hsl(var(--muted-foreground))] group-hover:translate-x-1 transition-transform shrink-0" />
        </div>

        <div
          onClick={() => onSelectMode("profile")}
          className="p-5 rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-teal-500/40 transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-xs"
        >
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
              <Star className="size-5.5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[hsl(var(--foreground))] group-hover:text-teal-600 transition">
                📊 నా పురోగతి & బలహీనతలు
              </h4>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                మీ గ్రామర్ తప్పుల విశ్లేషణ మరియు స్కోర్ కార్డ్.
              </p>
            </div>
          </div>
          <ArrowRight className="size-4 text-[hsl(var(--muted-foreground))] group-hover:translate-x-1 transition-transform shrink-0" />
        </div>
      </div>

    </div>
  );
}
