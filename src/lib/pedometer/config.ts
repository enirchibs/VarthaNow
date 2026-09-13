// 🏃‍♂️ Centralized Configuration Parameters for Step Engine
import { EngineConfig } from "./types";

export const STEP_ENGINE_CONFIG: EngineConfig = {
  // Dynamic Gravity Alpha (0.97 isolates static gravity <0.2Hz from walking gait 1-3.5Hz)
  gravityAlpha: 0.97,

  // Low pass EMA Beta (0.65 for smoothing jitter while preserving step crests)
  emaBeta: 0.65,

  // Minimum noise floor threshold for step amplitude (m/s²)
  minimumPeakThreshold: 0.25,

  // Noise floor standard deviation multiplier
  noiseMultiplier: 2.0,

  // Refractory double-count protection bound (ms)
  minStepIntervalMs: 300,

  // Maximum step interval bound (ms) (1,500ms = 40 SPM slow walk)
  maxStepIntervalMs: 1500,

  // Step confidence acceptance threshold for CONFIRMED state
  stepAcceptThreshold: 0.65,

  // Step confidence threshold for TENTATIVE state
  tentativeThreshold: 0.40,

  // Walking confidence threshold to lock WALKING state
  walkingLockThreshold: 0.65,

  // Cadence adaptation factor (20% current, 80% history)
  cadenceAdaptation: 0.20,

  // Number of historical step waveforms stored for shape similarity matching
  waveformHistorySize: 5,

  // Initial sensor calibration duration (ms)
  calibrationDurationMs: 5000
};
