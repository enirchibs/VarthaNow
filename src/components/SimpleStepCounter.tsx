import React, { useState, useEffect, useRef } from "react";
import { Play, Square, RotateCcw, Footprints, AlertCircle } from "lucide-react";

// Walking detection constants (rejects noise, hand tremors, and phone tilt):
const MIN_PEAK_THRESHOLD = 0.70; // m/s²: human foot strike minimum (resting sensor noise is 0.05-0.25)
const MIN_PROMINENCE = 0.40;     // m/s²: peak-to-valley prominence to reject flat sensor drift/jitter
const MIN_STEP_INTERVAL = 300;   // ms: maximum ~3.3 steps/sec (double-count protection)
const WALKING_TIMEOUT_MS = 1500; // ms: inactivity window to transition to ○ NOT WALKING and stop counting

export function SimpleStepCounter() {
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSensorEvent, setHasSensorEvent] = useState(false);

  // Sensor processing refs
  const gravityRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const initializedRef = useRef(false);
  const prevFilteredRef = useRef(0);
  const bufferRef = useRef<number[]>([0, 0]); // [previous, candidatePeak]
  const valleyRef = useRef(0.5); // Minimum value between peaks for prominence check
  const lastStepTimeRef = useRef(0);
  const walkingTimeoutRef = useRef<number | null>(null);

  // Start / Stop sensor listener
  useEffect(() => {
    if (!isRunning) {
      setIsWalking(false);
      return;
    }

    const handleMotion = (event: DeviceMotionEvent) => {
      // Prioritize accelerationIncludingGravity for universal mobile support
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      setHasSensorEvent(true);
      const ax = acc.x;
      const ay = acc.y;
      const az = acc.z;

      // Initialize dynamic gravity to instantaneous acceleration on first frame
      if (!initializedRef.current) {
        gravityRef.current = { x: ax, y: ay, z: az };
        initializedRef.current = true;
        return;
      }

      // Step 7: Dynamic Gravity Removal (alpha = 0.97)
      const gravityAlpha = 0.97;
      gravityRef.current.x = gravityAlpha * gravityRef.current.x + (1 - gravityAlpha) * ax;
      gravityRef.current.y = gravityAlpha * gravityRef.current.y + (1 - gravityAlpha) * ay;
      gravityRef.current.z = gravityAlpha * gravityRef.current.z + (1 - gravityAlpha) * az;

      const linearX = ax - gravityRef.current.x;
      const linearY = ay - gravityRef.current.y;
      const linearZ = az - gravityRef.current.z;

      // Step 8: Movement Magnitude
      const magnitude = Math.sqrt(
        linearX * linearX +
        linearY * linearY +
        linearZ * linearZ
      );

      // Step 9: Light Smoothing (beta = 0.65)
      const beta = 0.65;
      const filtered = beta * magnitude + (1 - beta) * prevFilteredRef.current;
      prevFilteredRef.current = filtered;

      // Track running valley (lowest acceleration between consecutive peaks)
      if (filtered < valleyRef.current) {
        valleyRef.current = filtered;
      }

      // Step 10: 3-Point Peak Detection (s0 < s1 && s1 > s2)
      const s0 = bufferRef.current[0];
      const s1 = bufferRef.current[1];
      const s2 = filtered;

      // Slide buffer: [s1, s2]
      bufferRef.current = [s1, s2];

      const prominence = s1 - valleyRef.current;
      const now = performance.now();

      // Check if walking timeout exceeded while sensor events are arriving
      if (isWalking && now - lastStepTimeRef.current > WALKING_TIMEOUT_MS) {
        setIsWalking(false);
      }

      // A valid human step requires:
      // 1. Local maximum: s1 > s0 && s1 > s2
      // 2. Real walking acceleration impact: s1 >= MIN_PEAK_THRESHOLD (0.70 m/s², rejecting resting noise < 0.25)
      // 3. Clear wave prominence: prominence >= MIN_PROMINENCE (0.40 m/s², rejecting flat drift/tremor)
      if (s1 > s0 && s1 > s2 && s1 >= MIN_PEAK_THRESHOLD && prominence >= MIN_PROMINENCE) {
        // Step 11: Minimum step interval (300ms) double-count protection
        if (now - lastStepTimeRef.current >= MIN_STEP_INTERVAL) {
          lastStepTimeRef.current = now;
          valleyRef.current = s2; // Reset valley after confirmed peak

          // Step 13: Instant step count update
          setSteps((prev) => prev + 1);

          // Indicate walking status: ● WALKING
          setIsWalking(true);

          // Walking timeout: if no valid walking step occurs for 1500ms, change to ○ NOT WALKING
          if (walkingTimeoutRef.current) window.clearTimeout(walkingTimeoutRef.current);
          walkingTimeoutRef.current = window.setTimeout(() => {
            setIsWalking(false);
          }, WALKING_TIMEOUT_MS);
        }
      }
    };

    window.addEventListener("devicemotion", handleMotion, { passive: true });

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
      if (walkingTimeoutRef.current) window.clearTimeout(walkingTimeoutRef.current);
    };
  }, [isRunning]);

  const handleToggleStart = async () => {
    setErrorMessage(null);

    if (isRunning) {
      setIsRunning(false);
      return;
    }

    // Step 14: Request iOS / Safari DeviceMotionEvent permission if required
    if (
      typeof DeviceMotionEvent !== "undefined" &&
      typeof (DeviceMotionEvent as any).requestPermission === "function"
    ) {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission !== "granted") {
          setErrorMessage("Motion access is required to count steps.");
          return;
        }
      } catch {
        setErrorMessage("Motion access is required to count steps.");
        return;
      }
    }

    // Reset sensor state on fresh start
    initializedRef.current = false;
    prevFilteredRef.current = 0;
    bufferRef.current = [0, 0];
    lastStepTimeRef.current = 0;
    setIsRunning(true);
  };

  // Step 15: Reset Button
  const handleReset = () => {
    setSteps(0);
    setIsWalking(false);
    initializedRef.current = false;
    prevFilteredRef.current = 0;
    bufferRef.current = [0, 0];
    valleyRef.current = 0.5;
    lastStepTimeRef.current = 0;
    if (walkingTimeoutRef.current) window.clearTimeout(walkingTimeoutRef.current);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 my-4">
      <div className="bg-[hsl(var(--card))] border-2 border-emerald-500/30 dark:border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6 transition-all">
        {/* Title Header */}
        <div className="flex items-center justify-center gap-2">
          <Footprints className="size-5 text-emerald-600 dark:text-emerald-400 animate-bounce" />
          <h2 className="text-sm sm:text-base font-black tracking-widest text-[hsl(var(--foreground))] uppercase">
            Step Counter
          </h2>
        </div>

        {/* Large Step Display */}
        <div className="py-4 space-y-1">
          <div className="text-6xl sm:text-7xl font-black tracking-tight text-[hsl(var(--foreground))] font-mono">
            {steps.toLocaleString()}
          </div>
          <div className="text-xs sm:text-sm font-black tracking-widest text-[hsl(var(--muted-foreground))] uppercase">
            Steps
          </div>
        </div>

        {/* Live Walking Status Indicator */}
        <div className="flex items-center justify-center">
          {isRunning && isWalking ? (
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-wider">
              <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
              ● WALKING
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] text-xs font-black tracking-wider">
              <span className="size-2 rounded-full border border-zinc-400 dark:border-zinc-500" />
              ○ NOT WALKING
            </span>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-rose-600 bg-rose-500/10 p-3 rounded-2xl border border-rose-500/20">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons: START / STOP and RESET */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleToggleStart}
            className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-black text-sm tracking-wider uppercase transition active:scale-95 shadow-md ${
              isRunning
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
            }`}
          >
            {isRunning ? (
              <>
                <Square className="size-4 fill-current" />
                STOP
              </>
            ) : (
              <>
                <Play className="size-4 fill-current" />
                START
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-black text-sm tracking-wider uppercase transition active:scale-95 bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted))]/80 text-[hsl(var(--foreground))] border border-[hsl(var(--border))]"
          >
            <RotateCcw className="size-4" />
            RESET
          </button>
        </div>

        {/* Desktop / Dev testing simulator fallback (unobtrusive) */}
        {isRunning && !hasSensorEvent && (
          <div className="pt-2 border-t border-[hsl(var(--border))]/50">
            <p className="text-[11px] text-[hsl(var(--muted-foreground))] font-bold mb-2">
              Waiting for phone motion sensor... (On desktop? Test manually below)
            </p>
            <button
              onClick={() => {
                setSteps((prev) => prev + 1);
                setIsWalking(true);
                if (walkingTimeoutRef.current) window.clearTimeout(walkingTimeoutRef.current);
                walkingTimeoutRef.current = window.setTimeout(() => setIsWalking(false), WALKING_TIMEOUT_MS);
              }}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition"
            >
              + 1 Step (Test)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
