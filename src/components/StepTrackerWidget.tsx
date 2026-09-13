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
  Sparkles, 
  BarChart3, 
  Zap, 
  Activity,
  Edit3,
  Check,
  RefreshCw,
  Smartphone
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { syncGoogleFitData, getStoredGoogleFitData, GoogleFitDailyData } from "@/lib/google-fit";

export function StepTrackerWidget() {
  const { lang } = useLanguage();
  const isTe = lang === "te";

  const todayKey = `varthanow_steps_${new Date().toISOString().split("T")[0]}`;
  const goalKey = "varthanow_step_goal";
  const modeKey = "varthanow_step_mode";

  // State initialization
  const [steps, setSteps] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(todayKey);
      return saved ? parseInt(saved, 10) : 4250;
    } catch {
      return 4250;
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
  const [isGoogleFitSyncing, setIsGoogleFitSyncing] = useState<boolean>(false);
  const [googleFitStatus, setGoogleFitStatus] = useState<GoogleFitDailyData | null>(() => getStoredGoogleFitData());
  const [manualInput, setManualInput] = useState<string>("");
  const [customGoalInput, setCustomGoalInput] = useState<string>("");
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [history, setHistory] = useState<{ date: string; dayName: string; steps: number }[]>([]);

  // Sensor & timer refs
  const lastAccelRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const lastStepTimeRef = useRef<number>(0);

  // Sync steps to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(todayKey, steps.toString());
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
        
        const defaultMock = i === 0 ? steps : Math.floor(4800 + ((i * 1430) % 5500));
        const val = savedSteps ? parseInt(savedSteps, 10) : defaultMock;
        pastDays.push({ date: dateStr, dayName, steps: val });
      }
      setHistory(pastDays);
    } catch (e) {
      console.warn("History load error:", e);
    }
  }, [steps, isTe]);

  const [sensorStatus, setSensorStatus] = useState<"off" | "listening" | "step_detected" | "unsupported">("off");
  const isAboveThresholdRef = useRef<boolean>(false);

  // ⚡ HARDWARE PEDOMETER ENGINE (Peak Motion Detection only - NO fake timers!)
  useEffect(() => {
    if (!isLiveTracking) {
      setSensorStatus("off");
      return;
    }

    if (typeof window === "undefined" || !("DeviceMotionEvent" in window)) {
      setSensorStatus("unsupported");
      return;
    }

    setSensorStatus("listening");

    // Dynamic motion threshold depending on selected walk mode
    const threshold = walkMode === "run" ? 3.8 : walkMode === "brisk" ? 3.0 : 2.5;
    const minStepIntervalMs = walkMode === "run" ? 240 : walkMode === "brisk" ? 280 : 320;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const now = Date.now();
      const magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
      const deltaMag = Math.abs(magnitude - 9.81);

      // Peak Detection Filter: Count step on RISING EDGE above threshold with time debounce
      if (deltaMag >= threshold) {
        if (!isAboveThresholdRef.current && (now - lastStepTimeRef.current >= minStepIntervalMs)) {
          lastStepTimeRef.current = now;
          isAboveThresholdRef.current = true;
          setSteps((prev) => prev + 1);
          setSensorStatus("step_detected");
          setTimeout(() => setSensorStatus("listening"), 400);
        }
      } else if (deltaMag < threshold * 0.7) {
        isAboveThresholdRef.current = false;
      }
    };

    const attachListener = () => {
      window.addEventListener("devicemotion", handleMotion);
    };

    if (typeof (DeviceMotionEvent as any).requestPermission === "function") {
      (DeviceMotionEvent as any).requestPermission()
        .then((state: string) => {
          if (state === "granted") {
            attachListener();
          } else {
            setSensorStatus("unsupported");
          }
        })
        .catch(() => setSensorStatus("unsupported"));
    } else {
      attachListener();
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("devicemotion", handleMotion);
      }
    };
  }, [isLiveTracking, walkMode]);

  // 🏃‍♂️ Handle Syncing with Google Fit Activity API
  const handleGoogleFitSync = async () => {
    setIsGoogleFitSyncing(true);
    try {
      const fitData = await syncGoogleFitData();
      setSteps(fitData.steps);
      setGoogleFitStatus(fitData);
    } catch (err) {
      console.warn("Google Fit sync error:", err);
    } finally {
      setIsGoogleFitSyncing(false);
    }
  };

  // Accurate Fitness Metrics Formulas
  const calFactor = walkMode === "run" ? 0.062 : walkMode === "brisk" ? 0.048 : 0.040;
  const caloriesBurned = Math.round(steps * calFactor);
  const distanceKm = (steps * 0.000762).toFixed(2);
  const stepsPerMin = walkMode === "run" ? 160 : walkMode === "brisk" ? 130 : 105;
  const activeMinutes = Math.round(steps / stepsPerMin);

  const progressPercent = Math.min(100, Math.round((steps / goal) * 100));

  const addSteps = (num: number) => {
    setSteps((prev) => prev + num);
  };

  // Direct Manual Pedometer Input Set
  const handleSetDirectSteps = () => {
    const parsed = parseInt(manualInput, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setSteps(parsed);
      setManualInput("");
    }
  };

  // Direct Manual Pedometer Input Add
  const handleAddDirectSteps = () => {
    const parsed = parseInt(manualInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setSteps((prev) => prev + parsed);
      setManualInput("");
    }
  };

  const handleReset = () => {
    if (window.confirm(isTe ? "ఈరోజు నడక కౌంటర్ ను సున్నాకి (0) రీసెట్ చేయమంటారా?" : "Reset today's step counter to zero?")) {
      setSteps(0);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
            <div className="size-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
              <Footprints className="size-6 animate-bounce" />
            </div>
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black tracking-tight flex items-center gap-2">
              <span>{isTe ? "ఈరోజు నడక & గూగుల్ ఫిట్ ట్రాకర్" : "Daily Step & Google Fit Tracker"}</span>
              {isLiveTracking && (
                <span className="flex size-2.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </h2>
            <p className="text-xs font-bold text-emerald-200/80 flex items-center gap-1.5 mt-0.5">
              <span>{isTe ? "స్టెప్ కౌంట్, కాలరీలు & Google Fit సింక్" : "Step counter & Google Fit Activity Sync"}</span>
              {googleFitStatus?.connected && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
                  Google Fit Connected
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons: Google Fit Sync & Goal */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleGoogleFitSync}
            disabled={isGoogleFitSyncing}
            className="px-3.5 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-xs font-black text-blue-200 transition flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-70"
            title="Sync steps directly with Google Fit App"
          >
            {isGoogleFitSyncing ? (
              <>
                <RefreshCw className="size-3.5 animate-spin" />
                <span>సింక్ అవుతోంది...</span>
              </>
            ) : (
              <>
                <Smartphone className="size-3.5 text-blue-400" />
                <span>{isTe ? "🔴 Google Fit సింక్" : "Google Fit Sync"}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowGoalModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-black text-emerald-200 transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Target className="size-4 text-yellow-400" />
            <span>{goal.toLocaleString()} {isTe ? "లక్ష్యం" : "Goal"}</span>
          </button>
        </div>
      </div>

      {/* Direct Pedometer Step Count Input Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-emerald-500/30 space-y-2 relative z-10">
        <div className="flex items-center justify-between text-[11px] font-black text-emerald-300 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Edit3 className="size-3.5 text-yellow-400" />
            {isTe ? "పెడోమీటర్ లేదా స్మార్ట్‌వాచ్ అడుగుల సంఖ్య టైప్ చేయండి:" : "Type Pedometer / Smartwatch Step Count:"}
          </span>
          {googleFitStatus?.lastSynced && (
            <span className="text-[10px] text-blue-300 font-bold">
              Google Fit Sync: {googleFitStatus.lastSynced}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="number"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder={isTe ? "ఉదా: 7500 అడుగులు నమోదు చేయండి..." : "Ex: Type 7500 steps..."}
            className="flex-1 h-11 px-3.5 rounded-xl border border-white/20 bg-slate-900 text-xs font-bold text-white outline-none focus:border-emerald-500 placeholder:text-slate-400"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSetDirectSteps}
              className="h-11 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-1 cursor-pointer shrink-0 active:scale-95"
            >
              <Check className="size-4" />
              <span>{isTe ? "సమర్పించు (Set)" : "Set Steps"}</span>
            </button>

            <button
              type="button"
              onClick={handleAddDirectSteps}
              className="h-11 px-4 rounded-xl bg-white/10 hover:bg-emerald-500/20 border border-white/20 text-white font-extrabold text-xs flex items-center justify-center gap-1 cursor-pointer shrink-0 active:scale-95"
            >
              <Plus className="size-4 text-emerald-400" />
              <span>{isTe ? "+ కలుపు (Add)" : "+ Add"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode Selector (Walk 🚶‍♂️ / Brisk Walk 🏃‍♂️ / Run ⚡) */}
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
          <span>🚶‍♂️ {isTe ? "సాధారణ నడక" : "Slow Walk"}</span>
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
        
        {/* Left Column: Live Pedometer Sensor & Quick Add Buttons */}
        <div className="space-y-3 order-2 md:order-1">
          <div className="text-[11px] font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1">
            <Zap className="size-3.5 text-yellow-400" />
            <span>{isTe ? "త్వరిత అడుగుల బటన్లు" : "Quick Add Shortcuts"}</span>
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

          {/* Live Mobile Pedometer Sensor Button */}
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
                  <span>{isTe ? "⚡ లైవ్ మోషన్ సెన్సార్ ఆన్ చేయండి" : "Start Live Step Sensor"}</span>
                </>
              )}
            </button>

            {isLiveTracking && (
              <div className="text-center">
                {sensorStatus === "step_detected" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-400 animate-bounce">
                    <Footprints className="size-3" /> {isTe ? "అడుగు గుర్తించబడింది! (+1)" : "Step Detected! (+1)"}
                  </span>
                ) : sensorStatus === "listening" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-300">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                    {isTe ? "సెన్సార్ సిద్ధంగా ఉంది - నడుస్తున్నప్పుడు మాత్రమే పెరుగుతాయి" : "Sensor Active - Increments strictly when walking"}
                  </span>
                ) : sensorStatus === "unsupported" ? (
                  <span className="text-[10px] font-bold text-amber-300">
                    {isTe ? "ఈ డివైజ్‌లో మోషన్ సెన్సార్ లేదు - టైప్ లేదా Google Fit వాడండి" : "No motion sensor found - use Manual Input or Google Fit"}
                  </span>
                ) : null}
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

        {/* Right Column: Calories, Distance & Time Cards */}
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

      {/* Target Goal Customization Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-white relative">
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
