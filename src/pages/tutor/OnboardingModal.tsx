import React, { useState } from "react";
import { 
  Check, 
  Sparkles, 
  Target, 
  Globe, 
  ChevronRight, 
  ArrowLeft,
  X
} from "lucide-react";
import { 
  getStoredProfile, 
  saveStoredProfile, 
  TargetLanguage, 
  UserLevel, 
  UserGoal, 
  UserLearningProfile 
} from "@/lib/tutor-api";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: UserLearningProfile) => void;
}

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const existing = getStoredProfile();
  const [step, setStep] = useState<number>(1);
  const [targetLang, setTargetLang] = useState<TargetLanguage>(existing.target_language || "english");
  const [level, setLevel] = useState<UserLevel>(existing.level || "beginner");
  const [goal, setGoal] = useState<UserGoal>(existing.goal || "daily_conversation");

  if (!isOpen) return null;

  const handleFinish = () => {
    const updatedProfile: UserLearningProfile = {
      ...existing,
      target_language: targetLang,
      level,
      goal
    };
    saveStoredProfile(updatedProfile);
    onComplete(updatedProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[92vh] sm:max-h-[85vh] flex flex-col rounded-t-[2.2rem] sm:rounded-[2.2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))]/60 p-4 sm:p-5 bg-[hsl(var(--card))] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex size-9 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--border))]"
              >
                <ArrowLeft className="size-4.5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🗣️</span>
                <h2 className="text-lg sm:text-xl font-black text-[hsl(var(--foreground))] tracking-tight">
                  Maatlaadu AI
                </h2>
              </div>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                తెలుగులో నేర్చుకోండి — English & Hindi మాట్లాడండి
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* STEP 1: LANGUAGE SELECTION */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1 text-center sm:text-left">
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                  దశ 1 / 3
                </span>
                <h3 className="text-xl font-black text-[hsl(var(--foreground))]">
                  మీరు ఏమి నేర్చుకోవాలనుకుంటున్నారు?
                </h3>
                <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                  మీకు అనుకూలమైన భాషను ఎంచుకోండి. AI మీకు తెలుగులో వివరిస్తుంది.
                </p>
              </div>

              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => setTargetLang("english")}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between text-left ${
                    targetLang === "english"
                      ? "border-blue-600 bg-blue-500/10 shadow-md ring-2 ring-blue-600/30"
                      : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">🇬🇧</span>
                    <div>
                      <h4 className="text-base font-extrabold text-[hsl(var(--foreground))]">
                        🇬🇧 Spoken English (ఇంగ్లీష్)
                      </h4>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        ఆఫీస్, ఇంటర్వ్యూలు & రోజువారీ సంభాషణల కోసం
                      </p>
                    </div>
                  </div>
                  {targetLang === "english" && <Check className="size-5 text-blue-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => setTargetLang("hindi")}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between text-left ${
                    targetLang === "hindi"
                      ? "border-orange-600 bg-orange-500/10 shadow-md ring-2 ring-orange-600/30"
                      : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">🇮🇳</span>
                    <div>
                      <h4 className="text-base font-extrabold text-[hsl(var(--foreground))]">
                        🇮🇳 Spoken Hindi (హిందీ)
                      </h4>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        ప్రయాణాలు, వ్యాపారం & నిత్య జీవితం కోసం
                      </p>
                    </div>
                  </div>
                  {targetLang === "hindi" && <Check className="size-5 text-orange-600" />}
                </button>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-full bg-blue-600 text-white font-black text-xs shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <span>తరువాతి దశకు వెళ్లండి (Next)</span>
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}

          {/* STEP 2: CURRENT LEVEL */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1 text-center sm:text-left">
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                  దశ 2 / 3
                </span>
                <h3 className="text-xl font-black text-[hsl(var(--foreground))]">
                  మీ ప్రస్తుత స్థాయి (Current Level)?
                </h3>
                <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                  మీ స్థాయికి అనుగుణంగా AI పాఠాలను రూపొందిస్తుంది.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { id: "beginner", label: "🟢 నాకు అసలు తెలియదు (Beginner)", desc: "అక్షరాలు, ప్రాథమిక పదాల నుండి ప్రారంభించాలి" },
                  { id: "elementary", label: "🟡 కొంచెం తెలుసు (Elementary)", desc: "సాధారణ పదాలు అర్థమవుతాయి కానీ వాక్యాలు రావు" },
                  { id: "intermediate", label: "🔵 మాట్లాడగలను కానీ తప్పులు వస్తాయి (Intermediate)", desc: "మాట్లాడగలను కానీ వ్యాకరణంలో తప్పులు పడతాయి" },
                  { id: "advanced", label: "🟣 బాగా తెలుసు — Fluency కావాలి (Advanced)", desc: "వేగంగా, నాచురల్‌గా సంభాషించే నైపుణ్యం కావాలి" }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLevel(item.id as UserLevel)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      level === item.id
                        ? "border-blue-600 bg-blue-500/10 ring-2 ring-blue-600/30"
                        : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))]"
                    }`}
                  >
                    <div>
                      <h4 className="text-sm font-extrabold text-[hsl(var(--foreground))]">{item.label}</h4>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.desc}</p>
                    </div>
                    {level === item.id && <Check className="size-4.5 text-blue-600 shrink-0" />}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(3)}
                className="w-full py-3.5 rounded-full bg-blue-600 text-white font-black text-xs shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <span>తరువాతి దశకు వెళ్లండి (Next)</span>
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}

          {/* STEP 3: GOAL SELECTION */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1 text-center sm:text-left">
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                  దశ 3 / 3
                </span>
                <h3 className="text-xl font-black text-[hsl(var(--foreground))]">
                  మీ ప్రధాన లక్ష్యం (Your Goal)?
                </h3>
                <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                  ఏ సందర్భంలో మాట్లాడటానికి సిద్ధమవ్వాలనుకుంటున్నారు?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: "daily_conversation", label: "💬 Daily Conversation", icon: "💬" },
                  { id: "office", label: "💼 Office English/Hindi", icon: "💼" },
                  { id: "interview", label: "🎤 Interview", icon: "🎤" },
                  { id: "travel", label: "✈️ Travel", icon: "✈️" },
                  { id: "study", label: "📚 Study", icon: "📚" },
                  { id: "shopping", label: "🛍️ Shopping", icon: "🛍️" },
                  { id: "hospital", label: "🏥 Hospital", icon: "🏥" },
                  { id: "fluency", label: "🔥 Fluency", icon: "🔥" }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGoal(item.id as UserGoal)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-20 ${
                      goal === item.id
                        ? "border-blue-600 bg-blue-500/10 ring-2 ring-blue-600/30 font-bold"
                        : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))]"
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-xs font-bold text-[hsl(var(--foreground))] line-clamp-1">{item.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleFinish}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-xs shadow-xl hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="size-4" />
                <span>మాట్లాడటం ప్రారంభించండి (Start Learning Now)</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
