// 🏃‍♂️ Physical Step Count Manual Benchmark & Validation Tool UI Component
import React, { useState, useEffect } from "react";
import { ValidationToolSession, ReferencePedometerMode } from "../lib/pedometer/validation-tool";
import { ValidationMetrics } from "../lib/pedometer/types";
import { Target, Footprints, Award, AlertTriangle, CheckCircle2, RotateCcw, Smartphone } from "lucide-react";

interface PedometerValidationToolProps {
  onStepConfirmed?: (manualCount: number) => void;
  engineDetectedSteps: number;
}

export const PedometerValidationTool: React.FC<PedometerValidationToolProps> = ({
  engineDetectedSteps
}) => {
  const [session] = useState<ValidationToolSession>(() => new ValidationToolSession(100));
  const [targetSteps, setTargetSteps] = useState<number>(100);
  const [referenceMode, setReferenceMode] = useState<ReferencePedometerMode>("INDEPENDENT_GAIT_ENGINE");
  const [metrics, setMetrics] = useState<ValidationMetrics>(() => session.calculateMetrics());

  // Update session whenever engine detected steps change
  useEffect(() => {
    if (engineDetectedSteps > 0) {
      const updated = session.registerEngineStep();
      setMetrics({ ...updated });
    }
  }, [engineDetectedSteps, session]);

  const handleTargetChange = (target: number) => {
    setTargetSteps(target);
    session.setTargetSteps(target);
    setMetrics(session.calculateMetrics());
  };

  const handleModeChange = (mode: ReferencePedometerMode) => {
    setReferenceMode(mode);
    session.setReferenceMode(mode);
    setMetrics(session.calculateMetrics());
  };

  const handleManualStepTally = () => {
    const updated = session.incrementManualStep();
    setMetrics({ ...updated });
  };

  const handleResetSession = () => {
    session.reset();
    setMetrics(session.calculateMetrics());
  };

  const getPassFailBadge = () => {
    if (metrics.manualPhysicalCount === 0) return null;
    if (metrics.errorPercentage <= 5.0) {
      return (
        <span className="flex items-center space-x-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>PASS (&lt; 5% Error)</span>
        </span>
      );
    }
    return (
      <span className="flex items-center space-x-1 px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full text-xs font-semibold">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>RE-CALIBRATING ({metrics.errorPercentage.toFixed(1)}% Error)</span>
      </span>
    );
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-5 shadow-xl border border-slate-800 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-lg text-white">Physical Step Ground-Truth Benchmark Tool</h3>
        </div>
        <button
          onClick={handleResetSession}
          className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Session</span>
        </button>
      </div>

      {/* Target & Reference Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Target Steps Button Group */}
        <div>
          <label className="block text-slate-400 mb-1.5 font-medium">Target Physical Step Test:</label>
          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 5000].map((t) => (
              <button
                key={t}
                onClick={() => handleTargetChange(t)}
                className={`py-2 rounded-lg font-bold border transition ${
                  targetSteps === t
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-lg"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Reference Pedometer Mode Selector */}
        <div>
          <label className="block text-slate-400 mb-1.5 font-medium">Reference Benchmark Mode:</label>
          <select
            value={referenceMode}
            onChange={(e) => handleModeChange(e.target.value as ReferencePedometerMode)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg p-2 font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="INDEPENDENT_GAIT_ENGINE">Independent Adaptive Gait Engine</option>
            <option value="SYSTEM_HARDWARE_SENSOR">Android/iOS Hardware Sensor Pedometer</option>
            <option value="ANDROID_HEALTH_CONNECT">Android Health Connect API Sync</option>
            <option value="APPLE_HEALTH">Apple HealthKit Comparison</option>
            <option value="GOOGLE_FIT_API">Google Fit Activity Tracking API</option>
          </select>
        </div>
      </div>

      {/* Main Counter Comparison & Manual Physical Tally Button */}
      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          {/* Manual Ground Truth Tally */}
          <div className="bg-indigo-950/40 p-4 rounded-lg border border-indigo-900/60 space-y-1">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Manual Physical Count (Ground Truth)
            </span>
            <p className="text-4xl font-extrabold text-indigo-300">
              {metrics.manualPhysicalCount}
            </p>
            <span className="text-xs text-indigo-400/80">/ {metrics.physicalTargetSteps} target steps</span>
          </div>

          {/* Engine Real-time Count */}
          <div className="bg-emerald-950/40 p-4 rounded-lg border border-emerald-900/60 space-y-1">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Engine Detected Steps
            </span>
            <p className="text-4xl font-extrabold text-emerald-300">
              {metrics.engineDetectedSteps}
            </p>
            <span className="text-xs text-emerald-400/80">Real-time (100–300ms latency)</span>
          </div>
        </div>

        {/* Large Manual Tally Button */}
        <button
          onClick={handleManualStepTally}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2 text-lg active:scale-98 transition transform"
        >
          <Footprints className="w-6 h-6 animate-bounce" />
          <span>+1 Physical Step Taken</span>
        </button>
      </div>

      {/* Benchmark Precision & Accuracy Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-center space-y-1">
          <span className="text-slate-400">Error Percentage</span>
          <p className={`text-xl font-bold ${metrics.errorPercentage <= 5 ? "text-emerald-400" : "text-amber-400"}`}>
            {metrics.errorPercentage.toFixed(1)}%
          </p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-center space-y-1">
          <span className="text-slate-400">Missed Steps</span>
          <p className="text-xl font-bold text-slate-200">
            {metrics.missedSteps}
          </p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-center space-y-1">
          <span className="text-slate-400">Double / False Counts</span>
          <p className="text-xl font-bold text-red-400">
            {metrics.doubleCounts + metrics.falseSteps}
          </p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-center space-y-1">
          <span className="text-slate-400">F1 Gait Score</span>
          <p className="text-xl font-bold text-indigo-400">
            {(metrics.f1Score * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Validation Pass / Calibration Status Footer */}
      <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300 font-medium">Session Duration: {session.getSessionDurationSeconds()}s</span>
        </div>
        <div>{getPassFailBadge()}</div>
      </div>
    </div>
  );
};
