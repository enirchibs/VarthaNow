// 🏃‍♂️ Simple Real-Time Mobile Step Counter Widget Component
import React, { useState, useEffect } from "react";
import { SimplePedometer, PedometerMetrics } from "../lib/pedometer/simple-pedometer";
import { Footprints, Play, Pause, RotateCcw, Activity, Gauge, Flame, MapPin, Sliders } from "lucide-react";

export const StepTrackerWidget: React.FC = () => {
  const [pedometer] = useState<SimplePedometer>(() => new SimplePedometer());
  const [isListening, setIsListening] = useState<boolean>(false);
  const [steps, setSteps] = useState<number>(0);
  const [metrics, setMetrics] = useState<PedometerMetrics>(() => pedometer.getMetrics());
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to step events
    const unsubscribe = pedometer.subscribe((newSteps, newMetrics) => {
      setSteps(newSteps);
      setMetrics({ ...newMetrics });
    });

    return () => {
      unsubscribe();
      pedometer.stopSensorListener();
    };
  }, [pedometer]);

  const handleToggleSensor = async () => {
    setPermissionError(null);
    if (isListening) {
      pedometer.stopSensorListener();
      setIsListening(false);
    } else {
      const granted = await pedometer.startSensorListener();
      if (!granted) {
        setPermissionError("Motion sensor permission is required to count steps. Please allow motion sensor access in your browser settings.");
        setIsListening(false);
      } else {
        setIsListening(true);
      }
    }
  };

  const handleReset = () => {
    pedometer.reset();
    setSteps(0);
    setMetrics(pedometer.getMetrics());
  };

  // Helper for simulated walk testing on desktop browsers
  const handleSimulateWalk = (count: number) => {
    const now = Date.now();
    for (let i = 0; i < count; i++) {
      const stepTime = now + i * 550;
      pedometer.processSample({
        timestamp: stepTime,
        ax: 0.2,
        ay: 0.3,
        az: 9.81 + 2.2, // Peak crest
        accelerationIncludesGravity: true
      });
      pedometer.processSample({
        timestamp: stepTime + 275,
        ax: 0.1,
        ay: 0.1,
        az: 9.81 - 1.2, // Valley trough
        accelerationIncludesGravity: true
      });
    }
  };

  // Calculated derived statistics
  const distanceKm = parseFloat((steps * 0.000762).toFixed(2)); // ~0.762m average stride
  const caloriesBurned = Math.round(steps * 0.04);              // ~0.04 kcal per step
  const isWalking = metrics.walkingState === "WALKING";

  return (
    <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-6 max-w-md mx-auto font-sans">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
            <Footprints className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">Step Counter</h2>
            <p className="text-xs text-slate-400 font-medium">Real-Time Physical Motion Sensor</p>
          </div>
        </div>

        <button
          onClick={() => setShowDebug(!showDebug)}
          className={`p-2 rounded-xl border text-xs font-semibold transition ${
            showDebug
              ? "bg-indigo-600 border-indigo-500 text-white"
              : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
          }`}
          title="Toggle Debug View"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>

      {/* Main Large Step Display Card */}
      <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl p-8 border border-slate-800 text-center relative overflow-hidden shadow-2xl">
        {/* Ambient Glow */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-3">
          {/* Walking State Badge */}
          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border transition ${
            isWalking
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              : "bg-slate-800/80 text-slate-400 border-slate-700"
          }`}>
            <Activity className={`w-3.5 h-3.5 ${isWalking ? "animate-pulse" : ""}`} />
            <span>{isWalking ? "🚶 Walking (Active)" : "Not Walking"}</span>
          </span>

          {/* Large Step Tally */}
          <div className="flex items-baseline justify-center space-x-2">
            <span className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200 tracking-tight">
              {steps.toLocaleString()}
            </span>
            <span className="text-lg font-bold text-slate-500">STEPS</span>
          </div>
        </div>

        {/* Sub-Metrics Row: Cadence, Distance, Calories */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-1 text-slate-400">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <span>Cadence</span>
            </div>
            <p className="text-base font-extrabold text-amber-300">
              {metrics.cadenceSPM} <span className="text-[10px] font-medium text-slate-500">SPM</span>
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>Distance</span>
            </div>
            <p className="text-base font-extrabold text-blue-300">
              {distanceKm} <span className="text-[10px] font-medium text-slate-500">km</span>
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-1 text-slate-400">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>Calories</span>
            </div>
            <p className="text-base font-extrabold text-red-300">
              {caloriesBurned} <span className="text-[10px] font-medium text-slate-500">kcal</span>
            </p>
          </div>
        </div>
      </div>

      {/* Permission Error Message Banner */}
      {permissionError && (
        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs text-red-400 font-medium">
          {permissionError}
        </div>
      )}

      {/* Sensor Control Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handleToggleSensor}
          className={`flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition shadow-lg ${
            isListening
              ? "bg-red-600 hover:bg-red-500 text-white"
              : "bg-emerald-600 hover:bg-emerald-500 text-white"
          }`}
        >
          {isListening ? (
            <>
              <Pause className="w-4 h-4" />
              <span>Stop Motion Sensor</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Start Motion Sensor</span>
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition"
          title="Reset Step Count"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Simulation Toolbar for Desktop Browsers */}
      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs flex items-center justify-between text-slate-400">
        <span className="font-semibold text-slate-400">Simulate Walk:</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSimulateWalk(10)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold border border-slate-700 transition"
          >
            +10 Steps
          </button>
          <button
            onClick={() => handleSimulateWalk(50)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold border border-slate-700 transition"
          >
            +50 Steps
          </button>
        </div>
      </div>

      {/* Optional Debug Mode View */}
      {showDebug && (
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono space-y-2 text-slate-300">
          <div className="font-bold text-indigo-400 border-b border-slate-800 pb-1.5 uppercase tracking-wider text-[10px]">
            Developer Debug Telemetry
          </div>
          <div className="flex justify-between">
            <span>Walking State:</span>
            <span className="text-emerald-400">{metrics.walkingState}</span>
          </div>
          <div className="flex justify-between">
            <span>Real-time SPM:</span>
            <span className="text-amber-400">{metrics.cadenceSPM} SPM</span>
          </div>
          <div className="flex justify-between">
            <span>Last Step Timestamp:</span>
            <span className="text-slate-400">{metrics.lastStepTimestamp ? `${Date.now() - metrics.lastStepTimestamp}ms ago` : "None"}</span>
          </div>
          <div className="flex justify-between">
            <span>Sensor Listener Active:</span>
            <span className={isListening ? "text-emerald-400" : "text-red-400"}>{isListening ? "TRUE" : "FALSE"}</span>
          </div>
        </div>
      )}
    </div>
  );
};
