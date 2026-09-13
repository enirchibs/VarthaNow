import React, { useState, useEffect, useRef } from "react";
import { 
  Footprints, 
  Flame, 
  Compass, 
  Clock, 
  Target, 
  Trophy, 
  Plus, 
  RotateCcw, 
  Play, 
  Pause, 
  BarChart3, 
  Zap,
  Cpu
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { AdaptiveStepEngine } from "@/lib/pedometer/adaptive-step-engine";
import { StepEngineDiagnostics } from "./StepEngineDiagnostics";
import { WalkingState } from "@/lib/pedometer/types";

export function StepTrackerWidget() {
  const { lang } = useLanguage();
  const isTe = lang === "te";

  const todayKey = `varthanow_steps_${new Date().toISOString().split("T")[0]}`;
  const goalKey = "varthanow_step_goal";
  const modeKey = "varthanow_step_mode";

  // Persistent Adaptive Step Engine Ref
  const engineRef = useRef<AdaptiveStepEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new AdaptiveStepEngine();
  }

  // State initialization
  const [steps, setSteps] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(todayKey);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [goal, setGoal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(goalKey);
      return saved ? parseInt(saved, 10) : 10000;
    } catch {
      return 10000;
    }
  });

  // Walking mode: 'normal' (Slow Walk), 'brisk' (Brisk Walk), 'run' (Jog/Run)
  const [walkMode, setWalkMode] = useState<"normal" | "brisk" | "run">(() => {
    try {
      const saved = localStorage.getItem(modeKey);
      return (saved as any) || "normal";
    } catch {
      return "normal";
    }
  });

  const [isLiveTracking, setIsLiveTracking] = useState<boolean>(false);
  const [walkingState, setWalkingState] = useState<WalkingState>("STATIONARY");
  const [cadenceSPM, setCadenceSPM] = useState<number>(0);
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [customGoalInput, setCustomGoalInput] = useState<string>("");
  const [showDeveloperDebug, setShowDeveloperDebug] = useState<boolean>(false);
  const [history, setHistory] = useState<{ date: string; dayName: string; steps: number }[]>([]);

  // Sync steps to localStorage and engine
  useEffect(() => {
    try {
      localStorage.setItem(todayKey, steps.toString());
      if (engineRef.current) {
        engineRef.current.setSteps(steps);
      }
    } catch (e) {
      console.warn("LocalStorage error:", e);
    }
  }, [steps, todayKey]);

  // Sync goal to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(goalKey, goal.toString());
    } catch (e) {
      console.warn("LocalStorage error:", e);
    }
  }, [goal]);

  // Sync mode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(modeKey, walkMode);
    } catch (e) {
      console.warn("LocalStorage error:", e);
    }
  }, [walkMode]);

  // Load 7-Day History
  useEffect(() => {
    try {
      const pastDays: { date: string; dayName: string; steps: number }[] = [];
      const dayNames = isTe 
        ? ["ఆది", "సోమ", "మంగళ", "బుధ", "గురు", "శుక్ర", "శని"] 
        : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const dayName = dayNames[d.getDay()];
        const key = `varthanow_steps_${dateStr}`;
        const savedSteps = localStorage.getItem(key);
        
        const val = savedSteps ? parseInt(savedSteps, 10) : (i === 0 ? steps : 0);
        pastDays.push({ date: dateStr, dayName, steps: val });
      }
      setHistory(pastDays);
    } catch (e) {
      console.warn("History load error:", e);
    }
  }, [steps, isTe]);

  // ⚡ ADAPTIVE PEDOMETER ENGINE SENSOR BINDING
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    if (isLiveTracking) {
      engine.start();

      // Subscribe to confirmed step events
      const unsubscribeStep = engine.onStep((evt) => {
        setSteps((prev) => prev + 1);
        setCadenceSPM(evt.cadenceSPM);
      });

      // Subscribe to walking state changes
      const unsubscribeState = engine.onStateChange((state) => {
        setWalkingState(state);
      });

      // Bind raw browser DeviceMotionEvent to step engine pipeline
      const handleMotionEvent = (evt: DeviceMotionEvent) => {
        engine.processDeviceMotionEvent(evt);
      };

      if (typeof window !== "undefined" && "DeviceMotionEvent" in window) {
        if (typeof (DeviceMotionEvent as any).requestPermission === "function") {
          (DeviceMotionEvent as any).requestPermission()
            .then((res: string) => {
              if (res === "granted") {
                window.addEventListener("devicemotion", handleMotionEvent);
              }
            })
            .catch(() => {});
        } else {
          window.addEventListener("devicemotion", handleMotionEvent);
        }
      }

      return () => {
        unsubscribeStep();
        unsubscribeState();
        if (typeof window !== "undefined") {
          window.removeEventListener("devicemotion", handleMotionEvent);
        }
        engine.stop();
      };
    } else {
      engine.stop();
      setWalkingState("STATIONARY");
    }
  }, [isLiveTracking]);

  // Metrics Calculations
  const calFactor = walkMode === "run" ? 0.062 : walkMode === "brisk" ? 0.048 : 0.040;
  const caloriesBurned = Math.round(steps * calFactor);
  const distanceKm = (steps * 0.000762).toFixed(2);
  const stepsPerMin = cadenceSPM > 0 ? cadenceSPM : (walkMode === "run" ? 160 : walkMode === "brisk" ? 130 : 105);
  const activeMinutes = Math.round(steps / Math.max(60, stepsPerMin));

  const progressPercent = Math.min(100, Math.round((steps / goal) * 100));

  const addSteps = (num: number) => {
    setSteps((prev) => prev + num);
  };

  const handleReset = () => {
    if (window.confirm(isTe ? "ఈరోజు నడక కౌంటర్ ను సున్నాకి (0) రీసెట్ చేయమంటారా?" : "Reset today's step counter to zero?")) {
      setSteps(0);
      if (engineRef.current) {
        engineRef.current.setSteps(0);
      }
    }
  };

  const handleSaveGoal = () => {
    const parsed = parseInt(customGoalInput, 10);
    if (!isNaN(parsed) && parsed >= 1000) {
      setGoal(parsed);
      setShowGoalModal(false);
      setCustomGoalInput("");
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-emerald-500/30 space-y-6 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute -right-16 -top-16 size-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 size-48 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
            <div className="size-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
              <Footprints className="size-6 animate-bounce" />
            </div>
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black tracking-tight flex items-center gap-2">
              <span>{isTe ? "అడాప్టివ్ మానవ నడక స్టెప్ ట్రాకర్" : "Adaptive Human-Walk Step Pedometer"}</span>
              {isLiveTracking && (
                <span className="flex size-2.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </h2>
            <p className="text-xs font-bold text-emerald-200/80 mt-0.5">
              {isTe ? "మల్టీ-ఫ్యాక్టర్ సిగ్నల్ ప్రాసెసింగ్ గైట్ ఇంజిన్" : "Multi-factor Signal Processing Gait Engine"}
            </p>
          </div>
        </div>

        {/* Set Goal Button */}
        <button
          type="button"
          onClick={() => setShowGoalModal(true)}
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-black text-emerald-200 transition flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Target className="size-4 text-yellow-400" />
          <span>{goal.toLocaleString()} {isTe ? "లక్ష్యం" : "Goal"}</span>
        </button>
      </div>

      {/* Pace Mode Selector */}
      <div className="p-1.5 rounded-2xl bg-slate-950/60 border border-white/10 grid grid-cols-3 gap-1 relative z-10">
        <button
          type="button"
          onClick={() => setWalkMode("normal")}
          className={`py-2 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            walkMode === "normal"
              ? "bg-emerald-500 text-slate-950 shadow-md"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <span>🚶‍♂️ {isTe ? "సాధారణ / నెమ్మది నడక" : "Slow Walk"}</span>
        </button>

        <button
          type="button"
          onClick={() => setWalkMode("brisk")}
          className={`py-2 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            walkMode === "brisk"
              ? "bg-emerald-500 text-slate-950 shadow-md"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <span>🏃‍♂️ {isTe ? "వేగవంతమైన నడక" : "Brisk Walk"}</span>
        </button>

        <button
          type="button"
          onClick={() => setWalkMode("run")}
          className={`py-2 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            walkMode === "run"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <span>⚡ {isTe ? "పరుగు / జాగింగ్" : "Jogging"}</span>
        </button>
      </div>

      {/* Center Gauge & Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative z-10">
        
        {/* Left Column: Live Motion Sensor Controls */}
        <div className="space-y-3 order-2 md:order-1">
          <div className="text-[11px] font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1">
            <Zap className="size-3.5 text-yellow-400" />
            <span>{isTe ? "త్వరిత అడుగుల మార్పు" : "Quick Step Shortcuts"}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => addSteps(500)}
              className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-emerald-500/20 border border-white/15 text-xs font-extrabold text-white flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
            >
              <Plus className="size-3.5 text-emerald-400" />
              <span>+500</span>
            </button>
            <button
              type="button"
              onClick={() => addSteps(1000)}
              className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-emerald-500/20 border border-white/15 text-xs font-extrabold text-white flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
            >
              <Plus className="size-3.5 text-emerald-400" />
              <span>+1,000</span>
            </button>
            <button
              type="button"
              onClick={() => addSteps(2000)}
              className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-emerald-500/20 border border-white/15 text-xs font-extrabold text-white flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
            >
              <Plus className="size-3.5 text-emerald-400" />
              <span>+2,000</span>
            </button>
            <button
              type="button"
              onClick={() => addSteps(5000)}
              className="py-2.5 px-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-xs font-extrabold text-emerald-300 flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
            >
              <Plus className="size-3.5 text-emerald-400" />
              <span>+5,000</span>
            </button>
          </div>

          {/* Live Mobile Motion Sensor Toggle */}
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => setIsLiveTracking(!isLiveTracking)}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs shadow-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                isLiveTracking
                  ? "bg-gradient-to-r from-amber-500 to-red-500 text-white"
                  : "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 hover:brightness-110"
              }`}
            >
              {isLiveTracking ? (
                <>
                  <Pause className="size-4 fill-current" />
                  <span>{isTe ? "మోషన్ సెన్సార్ ఆపండి (Pause)" : "Pause Step Motion Sensor"}</span>
                </>
              ) : (
                <>
                  <Play className="size-4 fill-current" />
                  <span>{isTe ? "⚡ అడాప్టివ్ మోషన్ సెన్సార్ ఆన్ చేయండి" : "Start Live Motion Sensor"}</span>
                </>
              )}
            </button>

            {isLiveTracking && (
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-300">
                  <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>
                    State: <strong className="text-white uppercase">{walkingState}</strong>
                    {cadenceSPM > 0 && ` (${cadenceSPM} SPM)`}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Center Circular Progress Ring */}
        <div className="flex flex-col items-center justify-center order-1 md:order-2">
          <div className="relative size-44 sm:size-48 flex items-center justify-center">
            {/* SVG Circular Progress Bar */}
            <svg className="size-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-emerald-400 transition-all duration-500 ease-out"
                strokeWidth="10"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Step Details */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <Footprints className="size-6 text-emerald-400 mb-1 animate-pulse" />
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
                {steps.toLocaleString()}
              </span>
              <span className="text-[11px] font-extrabold text-emerald-200 uppercase tracking-wider">
                {isTe ? "అడుగులు (Steps)" : "Steps Walked"}
              </span>
              <span className="text-[10px] font-bold text-emerald-400 mt-1 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {progressPercent}% {isTe ? "పూర్తయింది" : "Achieved"}
              </span>
            </div>
          </div>

          {progressPercent >= 100 && (
            <div className="mt-3 px-3.5 py-1.5 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black flex items-center gap-1.5 animate-bounce">
              <Trophy className="size-4 text-yellow-400" />
              <span>{isTe ? "🎉 అభినందనలు! ఈరోజు నడక లక్ష్యం పూర్తయింది!" : "Goal Smashed! 100% Achieved!"}</span>
            </div>
          )}
        </div>

        {/* Right Column: Calories, Distance & Active Time */}
        <div className="grid grid-cols-3 md:grid-cols-1 gap-2.5 order-3">
          
          {/* Calories */}
          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex flex-col sm:flex-row items-center gap-2.5">
            <div className="size-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
              <Flame className="size-5" />
            </div>
            <div>
              <div className="text-base font-black text-white">{caloriesBurned} <span className="text-xs text-orange-300 font-bold">kcal</span></div>
              <div className="text-[10px] font-extrabold text-slate-300 uppercase">{isTe ? "కాలరీల దహనం" : "Calories"}</div>
            </div>
          </div>

          {/* Distance */}
          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex flex-col sm:flex-row items-center gap-2.5">
            <div className="size-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Compass className="size-5" />
            </div>
            <div>
              <div className="text-base font-black text-white">{distanceKm} <span className="text-xs text-cyan-300 font-bold">km</span></div>
              <div className="text-[10px] font-extrabold text-slate-300 uppercase">{isTe ? "నడిచిన దూరం" : "Distance"}</div>
            </div>
          </div>

          {/* Active Time */}
          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex flex-col sm:flex-row items-center gap-2.5">
            <div className="size-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Clock className="size-5" />
            </div>
            <div>
              <div className="text-base font-black text-white">{activeMinutes} <span className="text-xs text-indigo-300 font-bold">min</span></div>
              <div className="text-[10px] font-extrabold text-slate-300 uppercase">{isTe ? "నడక సమయం" : "Active Time"}</div>
            </div>
          </div>

        </div>

      </div>

      {/* 📊 7-Day Weekly History Chart */}
      <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/10 space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="size-4 text-emerald-400" />
            <span>{isTe ? "గత 7 రోజుల నడక చార్ట్ (Weekly Step Log)" : "7-Day Step History"}</span>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] font-bold text-slate-400 hover:text-red-400 flex items-center gap-1 transition cursor-pointer"
          >
            <RotateCcw className="size-3" />
            <span>{isTe ? "రీసెట్" : "Reset Today"}</span>
          </button>
        </div>

        {/* Vertical Step Bar Chart */}
        <div className="grid grid-cols-7 gap-2 items-end h-28 pt-4 pb-1">
          {history.map((item, idx) => {
            const barHeight = Math.min(100, Math.max(12, Math.round((item.steps / goal) * 100)));
            const isToday = idx === 6;

            return (
              <div key={item.date} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="text-[9px] font-black text-emerald-300 opacity-0 group-hover:opacity-100 transition truncate">
                  {item.steps > 999 ? `${(item.steps / 1000).toFixed(1)}k` : item.steps}
                </div>
                
                <div 
                  className={`w-full rounded-t-xl transition-all duration-500 ${
                    isToday
                      ? "bg-gradient-to-t from-emerald-500 to-teal-300 shadow-lg shadow-emerald-500/30"
                      : "bg-white/20 hover:bg-emerald-500/40"
                  }`}
                  style={{ height: `${barHeight}%` }}
                />

                <span className={`text-[10px] font-extrabold truncate ${isToday ? "text-emerald-400 font-black" : "text-slate-400"}`}>
                  {item.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Developer Debug Toggle Button & Diagnostics Screen */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowDeveloperDebug(!showDeveloperDebug)}
          className="text-xs font-bold text-emerald-400/80 hover:text-emerald-300 flex items-center gap-1.5 transition cursor-pointer"
        >
          <Cpu className="size-3.5" />
          <span>{showDeveloperDebug ? "Hide Developer Diagnostics" : "🛠️ Developer / Signal Processing Diagnostics"}</span>
        </button>

        {showDeveloperDebug && (
          <div className="mt-3">
            <StepEngineDiagnostics engine={engineRef.current} isExpanded={true} />
          </div>
        )}
      </div>

      {/* Target Goal Customization Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-white relative font-sans">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                <Target className="size-4 text-yellow-400" />
                <span>{isTe ? "రోజువారీ నడక లక్ష్యం ఎంచుకోండి" : "Set Daily Step Target Goal"}</span>
              </h3>
            </div>

            <p className="text-xs font-semibold text-slate-300">
              {isTe ? "ఆరోగ్యవంతులు ప్రతిరోజూ 8,000 నుండి 10,000 అడుగులు నడవాలని వైద్యులు సూచిస్తున్నారు." : "Health experts recommend 8,000 to 10,000 steps daily."}
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[6000, 8000, 10000, 12000, 15000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setGoal(preset);
                    setShowGoalModal(false);
                  }}
                  className={`py-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                    goal === preset
                      ? "bg-emerald-500 text-slate-950 border-emerald-400"
                      : "bg-white/10 border-white/15 text-white hover:bg-white/20"
                  }`}
                >
                  {preset.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                {isTe ? "సొంత లక్ష్యం నమోదు చేయండి" : "Or enter custom step goal"}
              </label>
              <input
                type="number"
                value={customGoalInput}
                onChange={(e) => setCustomGoalInput(e.target.value)}
                placeholder="Ex: 10000"
                className="w-full h-11 px-3.5 rounded-xl border border-white/20 bg-slate-800 text-xs font-bold text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/20 text-xs font-bold hover:bg-white/10 cursor-pointer"
              >
                {isTe ? "రద్దు చేయి" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleSaveGoal}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-md hover:brightness-110 cursor-pointer"
              >
                {isTe ? "సేవ్ చేయి" : "Save Goal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
