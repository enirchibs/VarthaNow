// 🏃‍♂️ Physical Step-Synchronized Pedometer Main Widget Component
import React, { useState, useEffect, useRef } from "react";
import { AdaptiveStepEngine } from "../lib/pedometer/adaptive-step-engine";
import { StepEvent, DiagnosticsPayload, EngineMetrics } from "../lib/pedometer/types";
import { StepEngineDiagnostics } from "./StepEngineDiagnostics";
import { PedometerValidationTool } from "./PedometerValidationTool";
import { Footprints, Play, Pause, RotateCcw, Activity, Gauge, Flame, MapPin, Sliders, CheckCircle2 } from "lucide-react";

export const StepTrackerWidget: React.FC = () => {
  const [engine] = useState<AdaptiveStepEngine>(() => new AdaptiveStepEngine());
  const [activeTab, setActiveTab] = useState<"COUNTER" | "DIAGNOSTICS" | "VALIDATION">("COUNTER");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [steps, setSteps] = useState<number>(0);
  const [lastStepEvent, setLastStepEvent] = useState<StepEvent | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsPayload | null>(null);
  const [metrics, setMetrics] = useState<EngineMetrics | null>(null);
  const [sensorPermissionGranted, setSensorPermissionGranted] = useState<boolean | null>(null);

  useEffect(() => {
    // Subscribe to engine events
    const unsubStep = engine.onStep((evt) => {
      setSteps(evt.stepNumber);
      setLastStepEvent(evt);
    });

    const unsubDiag = engine.onDiagnostics((diag) => {
      setDiagnostics(diag);
    });

    const unsubMetrics = engine.onMetricsUpdate((m) => {
      setMetrics(m);
    });

    return () => {
      unsubStep();
      unsubDiag();
      unsubMetrics();
      engine.stopSensorListener();
    };
  }, [engine]);

  const handleToggleSensor = async () => {
    if (isListening) {
      engine.stopSensorListener();
      setIsListening(false);
    } else {
      const granted = await engine.startSensorListener();
      setSensorPermissionGranted(granted);
      setIsListening(granted);
    }
  };

  const handleResetEngine = () => {
    engine.reset();
    setSteps(0);
    setLastStepEvent(null);
    setMetrics(engine.getMetrics());
  };

  // Helper function for simulated physical walk (useful on desktop testing without active phone accelerometer)
  const handleSimulatePhysicalWalk = (count: number) => {
    const now = Date.now();
    for (let i = 0; i < count; i++) {
      // Feed a synthetic walking sample pair (peak + trough) into the engine
      const stepTime = now + i * 550;
      engine.processSample({
        timestamp: stepTime,
        ax: 0.2,
        ay: 0.3,
        az: 9.81 + 2.2, // Crest
        accelerationIncludesGravity: true
      });
      engine.processSample({
        timestamp: stepTime + 275,
        ax: 0.1,
        ay: 0.1,
        az: 9.81 - 1.2, // Trough
        accelerationIncludesGravity: true
      });
    }
  };

  // Derived metrics
  const distanceKm = parseFloat(((steps * 0.000762)).toFixed(2)); // ~0.762m per step
  const caloriesBurned = Math.round(steps * 0.04); // ~0.04 kcal per step
  const currentSPM = metrics?.cadenceSPM || 0;
  const stateBadgeColor = 
    metrics?.currentState === "WALKING" || metrics?.currentState === "FAST_WALKING"
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
      : metrics?.currentState === "CANDIDATE_WALKING" || metrics?.currentState === "MOTION_DETECTED"
      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
      : "bg-slate-800 text-slate-400 border-slate-700";

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-2xl border border-slate-800 space-y-6 max-w-4xl mx-auto">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl shadow-lg">
            <Footprints className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Physical Step Counter</h2>
            <p className="text-xs text-slate-400">Real-time Physical Step-Synchronized Engine</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("COUNTER")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "COUNTER"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Step Counter
          </button>
          <button
            onClick={() => setActiveTab("DIAGNOSTICS")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "DIAGNOSTICS"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Live Diagnostics
          </button>
          <button
            onClick={() => setActiveTab("VALIDATION")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "VALIDATION"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Benchmark Tool
          </button>
        </div>
      </div>

      {/* TAB 1: Main Step Counter UI */}
      {activeTab === "COUNTER" && (
        <div className="space-y-6">
          {/* Main Large Step Display */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl p-8 border border-slate-800 text-center relative overflow-hidden shadow-2xl">
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-2">
              <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${stateBadgeColor}`}>
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>State: {metrics?.currentState || "STATIONARY"}</span>
              </span>

              <div className="flex items-center justify-center space-x-3">
                <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200 tracking-tight">
                  {steps.toLocaleString()}
                </span>
                <span className="text-xl font-bold text-slate-500 self-end mb-2">steps</span>
              </div>
            </div>

            {/* Sub-Metrics Row (Cadence, Distance, Calories) */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-center space-x-1 text-slate-400">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cadence</span>
                </div>
                <p className="text-lg font-extrabold text-amber-300">{currentSPM} <span className="text-xs font-medium text-slate-500">SPM</span></p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center space-x-1 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>Distance</span>
                </div>
                <p className="text-lg font-extrabold text-blue-300">{distanceKm} <span className="text-xs font-medium text-slate-500">km</span></p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center space-x-1 text-slate-400">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  <span>Burned</span>
                </div>
                <p className="text-lg font-extrabold text-red-300">{caloriesBurned} <span className="text-xs font-medium text-slate-500">kcal</span></p>
              </div>
            </div>
          </div>

          {/* Sensor Controls & Simulation Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            {/* Start/Stop Real Motion Sensor */}
            <button
              onClick={handleToggleSensor}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition shadow-lg ${
                isListening
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              {isListening ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Motion Sensor</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Start Live Motion Sensor</span>
                </>
              )}
            </button>

            {/* Desktop Simulation Quick-Test Buttons */}
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end text-xs">
              <button
                onClick={() => handleSimulatePhysicalWalk(10)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 font-semibold transition"
              >
                +10 Sim Steps
              </button>
              <button
                onClick={() => handleSimulatePhysicalWalk(50)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 font-semibold transition"
              >
                +50 Sim Steps
              </button>
              <button
                onClick={handleResetEngine}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition"
                title="Reset Counter"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Real-Time Last Step Event Telemetry Pill */}
          {lastStepEvent && (
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-400">
              <span className="flex items-center space-x-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirmed Step #{lastStepEvent.stepNumber}</span>
              </span>
              <span>Amplitude: {lastStepEvent.peakAmplitude} m/s²</span>
              <span>Interval: {lastStepEvent.intervalMs} ms</span>
              <span>Confidence: {(lastStepEvent.stepConfidence * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Live Developer Diagnostics */}
      {activeTab === "DIAGNOSTICS" && (
        <StepEngineDiagnostics
          diagnostics={diagnostics}
          metrics={metrics}
          onResetEngine={handleResetEngine}
        />
      )}

      {/* TAB 3: Ground-Truth Physical Step Benchmark Tool */}
      {activeTab === "VALIDATION" && (
        <PedometerValidationTool
          engineDetectedSteps={steps}
        />
      )}
    </div>
  );
};
