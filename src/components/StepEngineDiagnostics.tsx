// 🏃‍♂️ Real-Time Pedometer Developer Diagnostics Component (HTML5 Canvas Signal Visualizer)
import React, { useEffect, useRef } from "react";
import { DiagnosticsPayload, EngineMetrics } from "../lib/pedometer/types";
import { Activity, Gauge, Cpu, Zap, Radio, ShieldCheck, RefreshCw } from "lucide-react";

interface StepEngineDiagnosticsProps {
  diagnostics: DiagnosticsPayload | null;
  metrics: EngineMetrics | null;
  onResetEngine?: () => void;
}

export const StepEngineDiagnostics: React.FC<StepEngineDiagnosticsProps> = ({
  diagnostics,
  metrics,
  onResetEngine
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const signalHistoryRef = useRef<{ filtered: number; thresh: number; isPeak: boolean }[]>([]);

  useEffect(() => {
    if (!diagnostics) return;

    // Push new point into rolling history window (150 samples)
    const isPeak = diagnostics.recentPeaks.some(
      (p) => Math.abs(p.timestamp - diagnostics.sampleTime) < 50
    );

    signalHistoryRef.current.push({
      filtered: diagnostics.filteredSignal,
      thresh: diagnostics.adaptiveThreshold,
      isPeak
    });

    if (signalHistoryRef.current.length > 150) {
      signalHistoryRef.current.shift();
    }

    // Render Canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = "#0f172a"; // Dark slate background
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const history = signalHistoryRef.current;
    if (history.length < 2) return;

    const stepX = width / 150;
    const midY = height * 0.70;
    const scaleY = 35; // 1 m/s² = 35px

    // 1. Draw Adaptive Threshold Curve (Amber dashed line)
    ctx.beginPath();
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    history.forEach((pt, i) => {
      const x = i * stepX;
      const y = midY - pt.thresh * scaleY;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Draw Filtered Gait Signal Curve (Emerald line)
    ctx.beginPath();
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2.5;
    history.forEach((pt, i) => {
      const x = i * stepX;
      const y = midY - pt.filtered * scaleY;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 3. Draw Peak Crest Markers
    history.forEach((pt, i) => {
      if (pt.isPeak) {
        const x = i * stepX;
        const y = midY - pt.filtered * scaleY;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#ef4444";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });
  }, [diagnostics]);

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 shadow-xl border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
          <h3 className="font-semibold text-lg text-white">Live Developer Diagnostics</h3>
        </div>
        {onResetEngine && (
          <button
            onClick={onResetEngine}
            className="flex items-center space-x-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Engine</span>
          </button>
        )}
      </div>

      {/* Real-Time Signal Waveform Canvas */}
      <div className="relative bg-slate-950 rounded-lg p-2 border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1 px-1">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-0.5 bg-emerald-500 inline-block"></span>
            <span>Filtered Signal (m/s²)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-0.5 border-t border-dashed border-amber-500 inline-block"></span>
            <span>Adaptive Threshold</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
            <span>Accepted Peak</span>
          </span>
        </div>
        <canvas
          ref={canvasRef}
          width={600}
          height={180}
          className="w-full h-44 rounded bg-slate-950"
        />
      </div>

      {/* Live Telemetry Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>Walking State</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-base font-bold text-emerald-400">
            {metrics?.currentState || diagnostics?.currentState || "STATIONARY"}
          </p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>Sampling Rate</span>
            <Radio className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-base font-bold text-blue-400">
            {metrics?.samplingRateHz ? `${metrics.samplingRateHz.toFixed(1)} Hz` : "50.0 Hz"}
          </p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>Cadence SPM</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-base font-bold text-amber-400">
            {metrics?.cadenceSPM || 0} SPM
          </p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>Walking Confidence</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-base font-bold text-purple-400">
            {((metrics?.walkingConfidence || diagnostics?.walkingConfidence || 0) * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Advanced Signal Features Detail */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
        <div className="flex justify-between">
          <span>Adaptive Peak Threshold:</span>
          <span className="text-amber-400">{(metrics?.adaptiveThreshold || diagnostics?.adaptiveThreshold || 0.25).toFixed(3)} m/s²</span>
        </div>
        <div className="flex justify-between">
          <span>Quiescent Noise Floor:</span>
          <span className="text-slate-400">{(metrics?.noiseFloor || diagnostics?.noiseFloor || 0.05).toFixed(3)} m/s²</span>
        </div>
        <div className="flex justify-between">
          <span>Peak Rejection Ratio:</span>
          <span className="text-red-400">
            {metrics ? `${metrics.rejectedPeaksCount} rejected / ${metrics.totalPeaksDetected} total` : "0 / 0"}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Sensor Hardware Mode:</span>
          <span className="text-cyan-400">{metrics?.sensorMode || "ACCEL_ONLY"}</span>
        </div>
      </div>
    </div>
  );
};
