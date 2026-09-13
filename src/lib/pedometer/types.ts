// 🏃‍♂️ Real-Time Physical Step-Synchronized Pedometer Engine - Type Definitions

export interface SensorSample {
  timestamp: number;
  ax: number;
  ay: number;
  az: number;
  gx?: number;
  gy?: number;
  gz?: number;
  accelerationIncludesGravity: boolean;
}

export type WalkingState = 
  | "STATIONARY"
  | "MOTION_DETECTED"
  | "CANDIDATE_WALKING"
  | "WALKING"
  | "FAST_WALKING"
  | "IRREGULAR"
  | "RECOVERY"
  | "UNKNOWN";

export type MotionCategory =
  | "STATIONARY"
  | "LOW_MOVEMENT"
  | "WALKING"
  | "FAST_WALKING"
  | "IRREGULAR_MOVEMENT"
  | "UNKNOWN";

export type StepClassification = "CONFIRMED" | "TENTATIVE" | "REJECTED";

export type SensorMode = "ACCEL_ONLY" | "ACCEL_GYRO";

export interface CandidatePeak {
  timestamp: number;
  peakValue: number;
  leftValleyValue: number;
  rightValleyValue: number;
  leftValleyTime: number;
  rightValleyTime: number;
  prominence: number;
  riseTimeMs: number;
  fallTimeMs: number;
  widthMs: number;
}

export interface StepEvent {
  timestamp: number;
  stepNumber: number;
  intervalMs: number;
  cadenceSPM: number;
  peakAmplitude: number;
  peakProminence: number;
  cadenceScore: number;
  waveformScore: number;
  motionScore: number;
  walkingConfidence: number;
  stepConfidence: number;
  state: StepClassification;
  sensorMode: SensorMode;
}

export interface DiagnosticsPayload {
  sampleTime: number;
  rawSignal: number;
  filteredSignal: number;
  gravityZ: number;
  adaptiveThreshold: number;
  noiseFloor: number;
  walkingConfidence: number;
  motionEnergyRMS: number;
  cadenceSPM: number;
  estimatedIntervalMs: number;
  currentState: WalkingState;
  sensorMode: SensorMode;
  samplingRateHz: number;
  recentPeaks: { timestamp: number; peakValue: number; prominence: number; isAccepted: boolean }[];
}

export interface EngineMetrics {
  steps: number;
  cadenceSPM: number;
  estimatedStepIntervalMs: number;
  walkingConfidence: number;
  signalQuality: number;
  sensorQuality: number;
  motionArtifactScore: number;
  currentState: WalkingState;
  sensorMode: SensorMode;
  samplingRateHz: number;
  adaptiveThreshold: number;
  noiseFloor: number;
  totalPeaksDetected: number;
  rejectedPeaksCount: number;
}

export interface EngineConfig {
  gravityAlpha: number;
  emaBeta: number;
  minimumPeakThreshold: number;
  noiseMultiplier: number;
  minStepIntervalMs: number;
  maxStepIntervalMs: number;
  stepAcceptThreshold: number;
  tentativeThreshold: number;
  walkingLockThreshold: number;
  cadenceAdaptation: number;
  waveformHistorySize: number;
  calibrationDurationMs: number;
}

export interface ValidationMetrics {
  physicalTargetSteps: number;
  manualPhysicalCount: number;
  engineDetectedSteps: number;
  referencePedometerSteps?: number;
  errorPercentage: number;
  missedSteps: number;
  falseSteps: number;
  doubleCounts: number;
  precision: number;
  recall: number;
  f1Score: number;
  referenceMode: string;
}
