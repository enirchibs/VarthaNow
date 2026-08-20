import React, { useState, useEffect } from "react";
import { 
  Bot, 
  Flame, 
  Star, 
  Mic, 
  BookOpen, 
  Globe, 
  Sparkles, 
  Target, 
  Zap, 
  User,
  Settings
} from "lucide-react";
import { 
  getStoredProfile, 
  saveStoredProfile, 
  UserLearningProfile, 
  TargetLanguage 
} from "@/lib/tutor-api";
import { OnboardingModal } from "./OnboardingModal";
import { DashboardView } from "./DashboardView";
import { TutorModeView } from "./TutorModeView";
import { SpeakingPracticeView } from "./SpeakingPracticeView";
import { DailyFiveMinView } from "./DailyFiveMinView";
import { TranslationAndNativeView } from "./TranslationAndNativeView";
import { ProgressProfileView } from "./ProgressProfileView";

export type TutorTab = 
  | "dashboard" 
  | "english_tutor" 
  | "hindi_tutor" 
  | "speaking_practice" 
  | "daily_5min" 
  | "native_translator" 
  | "profile";

export function MaatlaaduAIPage() {
  const [profile, setProfile] = useState<UserLearningProfile>(getStoredProfile());
  const [activeTab, setActiveTab] = useState<TutorTab>("dashboard");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  // Check if first time user
  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem("maatlaadu_ai_onboarded");
      if (!hasSeen) {
        setIsOnboardingOpen(true);
      }
    } catch {}
  }, []);

  const handleCompleteOnboarding = (updatedProfile: UserLearningProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem("maatlaadu_ai_onboarded", "true");
  };

  const handleChangeLanguage = (lang: TargetLanguage) => {
    const updated = { ...profile, target_language: lang };
    setProfile(updated);
    saveStoredProfile(updated);
  };

  return (
    <main className="container-shell py-6 space-y-6">

      {/* TOP MODULE NAVIGATION BAR */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))]/60 pb-4 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
            🗣️
          </div>
          <div>
            <h1 className="text-xl font-black text-[hsl(var(--foreground))] tracking-tight flex items-center gap-2">
              Maatlaadu AI
              <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase">
                AI Language Tutor
              </span>
            </h1>
            <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              "తెలుగులో నేర్చుకోండి — English & Hindi మాట్లాడండి"
            </p>
          </div>
        </div>

        {/* Global Navigation Pills */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-3.5 py-2 rounded-full text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
            }`}
          >
            <span>🏠 హోమ్ (Home)</span>
          </button>

          <button
            onClick={() => setActiveTab("speaking_practice")}
            className={`px-3.5 py-2 rounded-full text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "speaking_practice"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
            }`}
          >
            <Mic className="size-3.5" />
            <span>🎤 వాయిస్ సాధన</span>
          </button>

          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="p-2 rounded-full border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            title="Settings & Level"
          >
            <Settings className="size-4" />
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE VIEW */}
      {activeTab === "dashboard" && (
        <DashboardView
          profile={profile}
          onSelectMode={(mode) => setActiveTab(mode)}
          onChangeLanguage={handleChangeLanguage}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
        />
      )}

      {activeTab === "english_tutor" && (
        <TutorModeView
          language="english"
          profile={profile}
          onBack={() => setActiveTab("dashboard")}
          onOpenVoicePractice={() => setActiveTab("speaking_practice")}
        />
      )}

      {activeTab === "hindi_tutor" && (
        <TutorModeView
          language="hindi"
          profile={profile}
          onBack={() => setActiveTab("dashboard")}
          onOpenVoicePractice={() => setActiveTab("speaking_practice")}
        />
      )}

      {activeTab === "speaking_practice" && (
        <SpeakingPracticeView
          language={profile.target_language}
          profile={profile}
          onBack={() => setActiveTab("dashboard")}
        />
      )}

      {activeTab === "daily_5min" && (
        <DailyFiveMinView
          language={profile.target_language}
          profile={profile}
          onBack={() => setActiveTab("dashboard")}
        />
      )}

      {activeTab === "native_translator" && (
        <TranslationAndNativeView
          language={profile.target_language}
          onBack={() => setActiveTab("dashboard")}
        />
      )}

      {activeTab === "profile" && (
        <ProgressProfileView
          profile={profile}
          onBack={() => setActiveTab("dashboard")}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
        />
      )}

      {/* ONBOARDING SETUP MODAL */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleCompleteOnboarding}
      />

    </main>
  );
}
