import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Square, RotateCcw, Footprints, AlertCircle } from "lucide-react";

// ============================================================================
// STEP DETECTION CALIBRATION (Gait Cycle with Hysteresis & Minimum Cadence)
// ============================================================================
// In normal human walking, a physical step has a stance phase (impact) followed by
// a swing phase (trough). The hysteresis model guarantees:
// 1. A step is counted when acceleration crosses above THRESHOLD_HIGH.
// 2. The detector then enters WAITING_FOR_SWING state.
// 3. Rebounds, knee flex, and vibrations CANNOT count additional steps.
// 4. A new step can ONLY be counted after the leg swings and acceleration drops
//    below THRESHOLD_LOW, AND at least 420 ms have elapsed since the last step.
// ============================================================================
const THRESHOLD_HIGH = 1.20;      // m/s²: Human heel strike impact threshold
const THRESHOLD_LOW = 0.40;       // m/s²: Swing phase reset trough threshold
const MIN_STEP_INTERVAL = 420;    // ms: Minimum step interval (~142 steps/min max cadence)
const WALKING_TIMEOUT_MS = 1500;  // ms: Inactivity timeout to switch to ○ NOT WALKING

export function SimpleStepCounter() {
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSensorEvent, setHasSensorEvent] = useState(false);

  // Single authoritative source tracking
  const activeSourceRef = useRef<"native" | "web">("web");

  // Sensor processing refs
  const gravityRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const initializedRef = useRef(false);
  const prevFilteredRef = useRef(0);
  const stepStateRef = useRef<"ARMED" | "ABOVE_HIGH" | "WAITING_FOR_SWING">("ARMED");
  const peakCandidateRef = useRef(0);
  const lastStepTimeRef = useRef(0);
  const walkingTimeoutRef = useRef<number | null>(null);

  // ==========================================================================
  // SINGLE AUTHORITATIVE STEP REGISTRATION FUNCTION
  // All step sources (Native Android Step Detector / Counter, Web Accelerometer)
  // MUST route through this exact function. No other code can increment steps.
  // ==========================================================================
  const registerStep = useCallback((source: "native" | "web") => {
    // If native sensor is available, ignore web accelerometer to prevent double counting
    if (activeSourceRef.current === "native" && source === "web") {
      return;
    }

    setSteps((prev) => {
      const updated = prev + 1;
      console.log(`[StepCounter] Step counted via [${source}] -> Total: ${updated}`);
      return updated;
    });

    setIsWalking(true);

    if (walkingTimeoutRef.current) window.clearTimeout(walkingTimeoutRef.current);
    walkingTimeoutRef.current = window.setTimeout(() => {
      setIsWalking(false);
    }, WALKING_TIMEOUT_MS);
  }, []);

  // ==========================================================================
  // 1. PRIMARY: Native Android Step Detector / Counter Event Listeners
  // If running inside Android native / WebView / TWA / Cordova / Capacitor:
  // Android TYPE_STEP_DETECTOR or TYPE_STEP_COUNTER sends events.
  // ==========================================================================
  useEffect(() => {
    if (!isRunning) return;

    const win = window as any;
    const hasAndroidBridge = Boolean(win.Android?.registerStepListener || win.AndroidStepDetector || win.Android);

    const handleNativeStepEvent = () => {
      activeSourceRef.current = "native";
      setHasSensorEvent(true);
      registerStep("native");
    };

    win.onNativeStep = handleNativeStepEvent;
    window.addEventListener("nativeStep", handleNativeStepEvent);
    window.addEventListener("androidStep", handleNativeStepEvent);
    window.addEventListener("step", handleNativeStepEvent);

    if (hasAndroidBridge) {
      try {
        if (typeof win.Android?.startStepDetector === "function") {
          win.Android.startStepDetector();
          activeSourceRef.current = "native";
        }
      } catch (err) {
        console.warn("Android startStepDetector call error", err);
      }
    }

    return () => {
      delete win.onNativeStep;
      window.removeEventListener("nativeStep", handleNativeStepEvent);
      window.removeEventListener("androidStep", handleNativeStepEvent);
      window.removeEventListener("step", handleNativeStepEvent);
      if (hasAndroidBridge && typeof win.Android?.stopStepDetector === "function") {
        try {
          win.Android.stopStepDetector();
        } catch (err) {
          console.warn("Android stopStepDetector error", err);
        }
      }
    };
  }, [isRunning, registerStep]);

  // ==========================================================================
  // 2. FALLBACK: Web Accelerometer (Gait Cycle with Hysteresis & 420ms Cadence)
  // Used when Native Android Step Detector is not present.
  // ==========================================================================
  useEffect(() => {
    if (!isRunning) {
      setIsWalking(false);
      return;
    }

    const handleMotion = (event: DeviceMotionEvent) => {
      // If native Android step detector is already handling steps, DO NOT run accelerometer
      if (activeSourceRef.current === "native") return;

      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      setHasSensorEvent(true);
      const ax = acc.x;
      const ay = acc.y;
      const az = acc.z;

      // Initialize dynamic gravity on first frame
      if (!initializedRef.current) {
        gravityRef.current = { x: ax, y: ay, z: az };
        initializedRef.current = true;
        return;
      }

      // Dynamic Gravity Removal (alpha = 0.97)
      const gravityAlpha = 0.97;
      gravityRef.current.x = gravityAlpha * gravityRef.current.x + (1 - gravityAlpha) * ax;
      gravityRef.current.y = gravityAlpha * gravityRef.current.y + (1 - gravityAlpha) * ay;
      gravityRef.current.z = gravityAlpha * gravityRef.current.z + (1 - gravityAlpha) * az;

      const linearX = ax - gravityRef.current.x;
      const linearY = ay - gravityRef.current.y;
      const linearZ = az - gravityRef.current.z;

      // Movement Magnitude
      const magnitude = Math.sqrt(
        linearX * linearX +
        linearY * linearY +
        linearZ * linearZ
      );

      // Light EMA Smoothing (beta = 0.60)
      const beta = 0.60;
      const filtered = beta * magnitude + (1 - beta) * prevFilteredRef.current;
      prevFilteredRef.current = filtered;

      const now = performance.now();

      // GAIT CYCLE HYSTERESIS STATE MACHINE:
      // State 1: ARMED (waiting for foot strike)
      if (stepStateRef.current === "ARMED") {
        if (filtered >= THRESHOLD_HIGH) {
          stepStateRef.current = "ABOVE_HIGH";
          peakCandidateRef.current = filtered;
        }
      }
      // State 2: ABOVE_HIGH (tracking the peak of the heel strike)
      else if (stepStateRef.current === "ABOVE_HIGH") {
        if (filtered > peakCandidateRef.current) {
          peakCandidateRef.current = filtered;
        } else if (filtered < peakCandidateRef.current - 0.15) {
          // Peak confirmed! Check minimum interval since last step (420 ms)
          const timeSinceLastStep = now - lastStepTimeRef.current;
          if (timeSinceLastStep >= MIN_STEP_INTERVAL) {
            lastStepTimeRef.current = now;
            registerStep("web");
          }
          // Move to WAITING_FOR_SWING to block all secondary rebounds of the same step
          stepStateRef.current = "WAITING_FOR_SWING";
        }
      }
      // State 3: WAITING_FOR_SWING (cannot count again until leg swings and signal drops < THRESHOLD_LOW)
      else if (stepStateRef.current === "WAITING_FOR_SWING") {
        if (filtered < THRESHOLD_LOW) {
          stepStateRef.current = "ARMED";
        }
      }
    };

    window.addEventListener("devicemotion", handleMotion, { passive: true });

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
      if (walkingTimeoutRef.current) window.clearTimeout(walkingTimeoutRef.current);
    };
  }, [isRunning, registerStep]);

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
    stepStateRef.current = "ARMED";
    lastStepTimeRef.current = 0;
    setIsRunning(true);
  };

  // Step 15: Reset Button
  const handleReset = () => {
    setSteps(0);
    setIsWalking(false);
    initializedRef.current = false;
    prevFilteredRef.current = 0;
    stepStateRef.current = "ARMED";
    lastStepTimeRef.current = 0;
    if (walkingTimeoutRef.current) window.clearTimeout(walkingTimeoutRef.current);
  };

  return (
    <div className="w-full max-w-xs sm:max-w-sm mx-auto p-1">
      <div className="bg-[hsl(var(--card))] border border-emerald-500/30 dark:border-emerald-500/40 rounded-2xl p-4 shadow-md text-center space-y-3 transition-all">
        {/* Title Header */}
        <div className="flex items-center justify-center gap-1.5">
          <Footprints className="size-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-xs font-black tracking-widest text-[hsl(var(--foreground))] uppercase">
            Step Counter
          </h2>
        </div>

        {/* Compact Step Display */}
        <div className="py-1 space-y-0.5">
          <div className="text-4xl sm:text-5xl font-black tracking-tight text-[hsl(var(--foreground))] font-mono">
            {steps.toLocaleString()}
          </div>
          <div className="text-[10px] sm:text-xs font-bold tracking-widest text-[hsl(var(--muted-foreground))] uppercase">
            Steps
          </div>
        </div>

        {/* Live Walking Status Indicator */}
        <div className="flex items-center justify-center">
          {isRunning && isWalking ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-xs font-bold tracking-wider">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
              ● WALKING
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] text-[10px] sm:text-xs font-bold tracking-wider">
              <span className="size-1.5 rounded-full border border-zinc-400 dark:border-zinc-500" />
              ○ NOT WALKING
            </span>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-rose-600 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
            <AlertCircle className="size-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons: START / STOP and RESET */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleToggleStart}
            className={`flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-3 rounded-xl font-bold text-xs tracking-wider uppercase transition active:scale-95 shadow-sm ${
              isRunning
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
            }`}
          >
            {isRunning ? (
              <>
                <Square className="size-3.5 fill-current" />
                STOP
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-current" />
                START
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-3 rounded-xl font-bold text-xs tracking-wider uppercase transition active:scale-95 bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted))]/80 text-[hsl(var(--foreground))] border border-[hsl(var(--border))]"
          >
            <RotateCcw className="size-3.5" />
            RESET
          </button>
        </div>

        {/* Desktop / Dev testing simulator fallback (unobtrusive) */}
        {isRunning && !hasSensorEvent && (
          <div className="pt-2 border-t border-[hsl(var(--border))]/50">
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-medium mb-1.5">
              Waiting for phone sensor... (Desktop test below)
            </p>
            <button
              onClick={() => registerStep("web")}
              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition"
            >
              + 1 Step (Test)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
