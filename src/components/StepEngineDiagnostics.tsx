import React, { useEffect, useRef, useState } from "react";
import { DiagnosticsPayload, EngineMetrics } from "@/lib/pedometer/types";
import { AdaptiveStepEngine } from "@/lib/pedometer/adaptive-step-engine";
import { Activity, Zap, CheckCircle2, XCircle, ShieldAlert, Cpu, Radio, ChevronDown, ChevronUp } from "lucide-react";

interface StepEngineDiagnosticsProps {
  engine: AdaptiveStepEngine | null;
  isExpanded?: boolean;
}

export function StepEngineDiagnostics({ engine, isExpanded = false }: StepEngineDiagnosticsProps) {
  const [diag, setDiag] = useState<DiagnosticsPayload | null>(null);
  const [metrics, setMetrics] = useState<EngineMetrics | null>(null);
  const [expanded, setExpanded] = useState<boolean>(isExpanded);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const signalHistoryRef = useRef<{ time: number; raw: number; filt: number; thresh: number }[]>([]);

  useEffect(() => {
    if (!engine) return;

    const unsubscribeDiag = engine.onDiagnostics((payload) => {
      setDiag(payload);
      setMetrics(engine.getMetrics());

      // Append to canvas waveform buffer (keep last 120 points)
      signalHistoryRef.current.push({
        time: payload.sampleTime,
        raw: payload.rawSignal,
        filt: payload.filteredSignal,
        thresh: payload.adaptiveThreshold
      });

      if (signalHistoryRef.current.length > 120) {
        signalHistoryRef.current.shift();
      }
    });

    return () => {
      unsubscribeDiag();
    };
  }, [engine]);

  // Render Real-Time Canvas Waveform Chart
  useEffect(() => {
    if (!expanded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const history = signalHistoryRef.current;
    if (history.length < 2) return;

    const maxVal = 3.5;
    const scaleY = (val: number) => height - Math.min(height - 10, Math.max(10, (val / maxVal) * height));

    // 1. Draw Adaptive Threshold Line (Yellow)
    ctx.beginPath();
    ctx.strokeStyle = "rgba(234, 179, 8, 0.6)";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    history.forEach((pt, i) => {
      const x = (i / (history.length - 1)) * width;
      const y = scaleY(pt.thresh);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Draw Raw Signal Waveform (Light Slate/Grey)
    ctx.beginPath();
    ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
    ctx.lineWidth = 1;
    history.forEach((pt, i) => {
      const x = (i / (history.length - 1)) * width;
      const y = scaleY(pt.raw);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 3. Draw Filtered Signal Waveform (Emerald Green)
    ctx.beginPath();
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2.5;
    history.forEach((pt, i) => {
      const x = (i / (history.length - 1)) * width;
      const y = scaleY(pt.filt);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 4. Draw Accepted / Rejected Peak Markers
    if (diag?.recentPeaks) {
      diag.recentPeaks.forEach((pk: { timestamp: number; peakValue: number; prominence: number; isAccepted: boolean }) => {
        // Find approximate x position in history
        const peakIdx = history.findIndex((h) => Math.abs(h.time - pk.timestamp) < 40);
        if (peakIdx >= 0) {
          const x = (peakIdx / (history.length - 1)) * width;
          const y = scaleY(pk.peakValue);

          ctx.beginPath();
          ctx.arc(x, y, pk.isAccepted ? 6 : 4, 0, 2 * Math.PI);
          ctx.fillStyle = pk.isAccepted ? "#34d399" : "#f87171";
          ctx.fill();
          ctx.strokeStyle = "#0f172a";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });
    }
  }, [diag, expanded]);

  return (
    <div className="bg-slate-950/90 border border-emerald-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl text-white space-y-4 font-mono text-xs">
      {/* Header Toggle */}
      <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2">
          <Cpu className="size-4 text-emerald-400 animate-pulse" />
          <span className="font-bold text-emerald-300 uppercase tracking-wider text-xs">
            Developer / Signal Processing Diagnostics
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
            {metrics?.currentState || "IDLE"}
          </span>
        </div>

        <button type="button" className="text-slate-400 hover:text-white transition">
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </div>

      {/* Primary Quick Status Line */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
        <div className="p-2 rounded-xl bg-slate-900/80 border border-white/10">
          <span className="text-slate-400 block text-[9px] uppercase">Sampling Rate</span>
          <span className="font-black text-emerald-400">{diag?.samplingRateHz || 50} Hz</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-900/80 border border-white/10">
          <span className="text-slate-400 block text-[9px] uppercase">Sensor Mode</span>
          <span className="font-black text-cyan-300">{diag?.sensorMode || "ACCEL_ONLY"}</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-900/80 border border-white/10">
          <span className="text-slate-400 block text-[9px] uppercase">Cadence</span>
          <span className="font-black text-amber-300">{diag?.cadenceSPM || 0} SPM</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-900/80 border border-white/10">
          <span className="text-slate-400 block text-[9px] uppercase">Walking Confidence</span>
          <span className="font-black text-emerald-300">{Math.round((diag?.walkingConfidence || 0) * 100)}%</span>
        </div>
      </div>

      {/* Expanded Real-Time Diagnostics Panel */}
      {expanded && (
        <div className="space-y-4 pt-2 border-t border-white/10 animate-in fade-in duration-200">
          {/* Waveform Canvas */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
              <span>Real-Time Waveform (Filtered: Green, Raw: Slate, Threshold: Yellow)</span>
              <span className="text-emerald-400 font-bold">0.0 – 3.5 m/s²</span>
            </div>
            <div className="relative rounded-2xl bg-slate-900 border border-emerald-500/30 overflow-hidden p-1">
              <canvas ref={canvasRef} width={500} height={100} className="w-full h-24 block rounded-xl" />
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/10 space-y-0.5">
              <span className="text-slate-400 block uppercase">Raw Magnitude</span>
              <span className="font-bold text-white">{diag?.rawSignal || 0} m/s²</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/10 space-y-0.5">
              <span className="text-slate-400 block uppercase">EMA Filtered</span>
              <span className="font-bold text-emerald-400">{diag?.filteredSignal || 0} m/s²</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/10 space-y-0.5">
              <span className="text-slate-400 block uppercase">Adaptive Threshold</span>
              <span className="font-bold text-yellow-400">{diag?.adaptiveThreshold || 0} m/s²</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/10 space-y-0.5">
              <span className="text-slate-400 block uppercase">Noise Floor RMS</span>
              <span className="font-bold text-slate-300">{diag?.noiseFloor || 0} m/s²</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/10 space-y-0.5">
              <span className="text-slate-400 block uppercase">Step Interval</span>
              <span className="font-bold text-indigo-300">{diag?.estimatedIntervalMs || 0} ms</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/10 space-y-0.5">
              <span className="text-slate-400 block uppercase">Total / Rejected Peaks</span>
              <span className="font-bold text-emerald-300">
                {metrics?.totalPeaksDetected || 0} / <span className="text-red-400">{metrics?.rejectedPeaksCount || 0}</span>
              </span>
            </div>
          </div>

          {/* Recent Candidate Peaks Log */}
          {diag?.recentPeaks && diag.recentPeaks.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Recent Peak Evaluations:</span>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                {diag.recentPeaks.slice(-8).map((pk: { timestamp: number; peakValue: number; prominence: number; isAccepted: boolean }, i: number) => (
                  <span
                    key={i}
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-1 border ${
                      pk.isAccepted
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-red-500/20 text-red-300 border-red-500/40"
                    }`}
                  >
                    {pk.isAccepted ? <CheckCircle2 className="size-3 text-emerald-400" /> : <XCircle className="size-3 text-red-400" />}
                    <span>{pk.peakValue}m/s²</span>
                    <span className="opacity-75">({pk.prominence}p)</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
