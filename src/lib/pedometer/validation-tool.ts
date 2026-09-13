// 🏃‍♂️ Physical Step Count Manual Benchmark & Validation Engine
import { ValidationMetrics } from "./types";

export type ReferencePedometerMode = 
  | "INDEPENDENT_GAIT_ENGINE"
  | "ANDROID_HEALTH_CONNECT"
  | "APPLE_HEALTH"
  | "GOOGLE_FIT_API"
  | "SYSTEM_HARDWARE_SENSOR";

export class ValidationToolSession {
  private targetSteps: number = 100;
  private manualPhysicalCount: number = 0;
  private engineDetectedSteps: number = 0;
  private referencePedometerSteps: number = 0;
  private referenceMode: ReferencePedometerMode = "INDEPENDENT_GAIT_ENGINE";
  private doubleCounts: number = 0;
  private lastDetectedTimestamp: number = 0;
  private sessionStartTime: number = Date.now();
  private sessionEndTime: number | null = null;
  private isSessionActive: boolean = false;

  constructor(targetSteps: number = 100, referenceMode: ReferencePedometerMode = "INDEPENDENT_GAIT_ENGINE") {
    this.targetSteps = targetSteps;
    this.referenceMode = referenceMode;
  }

  public startSession(): void {
    this.manualPhysicalCount = 0;
    this.engineDetectedSteps = 0;
    this.referencePedometerSteps = 0;
    this.doubleCounts = 0;
    this.lastDetectedTimestamp = 0;
    this.sessionStartTime = Date.now();
    this.sessionEndTime = null;
    this.isSessionActive = true;
  }

  public stopSession(): ValidationMetrics {
    this.isSessionActive = false;
    this.sessionEndTime = Date.now();
    return this.calculateMetrics();
  }

  /**
   * User manually taps physical step button (+1 physical step count)
   */
  public incrementManualStep(): ValidationMetrics {
    if (!this.isSessionActive) this.startSession();
    this.manualPhysicalCount++;
    return this.calculateMetrics();
  }

  /**
   * Called whenever AdaptiveStepEngine confirms a step
   */
  public registerEngineStep(timestamp: number = Date.now()): ValidationMetrics {
    if (!this.isSessionActive) this.startSession();
    this.engineDetectedSteps++;

    // Check for double counting (two engine steps detected within < 350ms of each other)
    if (this.lastDetectedTimestamp > 0 && (timestamp - this.lastDetectedTimestamp < 350)) {
      this.doubleCounts++;
    }
    this.lastDetectedTimestamp = timestamp;

    return this.calculateMetrics();
  }

  /**
   * Update reference pedometer step count (e.g. from System Hardware sensor or Google Fit/Apple Health)
   */
  public updateReferenceSteps(steps: number): ValidationMetrics {
    this.referencePedometerSteps = steps;
    return this.calculateMetrics();
  }

  public setReferenceMode(mode: ReferencePedometerMode): void {
    this.referenceMode = mode;
  }

  public setTargetSteps(target: number): void {
    this.targetSteps = target;
  }

  /**
   * Compute comprehensive validation metrics (Precision, Recall, F1, Error %)
   */
  public calculateMetrics(): ValidationMetrics {
    const manual = Math.max(0, this.manualPhysicalCount);
    const engine = Math.max(0, this.engineDetectedSteps);

    const truePositives = Math.min(manual, engine);
    const missedSteps = Math.max(0, manual - engine);
    const falseSteps = Math.max(0, engine - manual);

    const precision = (truePositives + falseSteps) > 0 
      ? truePositives / (truePositives + falseSteps) 
      : 1.0;

    const recall = (truePositives + missedSteps) > 0 
      ? truePositives / (truePositives + missedSteps) 
      : 1.0;

    const f1Score = (precision + recall) > 0 
      ? (2 * precision * recall) / (precision + recall) 
      : 1.0;

    const errorPercentage = manual > 0 
      ? Math.abs(engine - manual) / manual * 100 
      : 0;

    return {
      physicalTargetSteps: this.targetSteps,
      manualPhysicalCount: this.manualPhysicalCount,
      engineDetectedSteps: this.engineDetectedSteps,
      referencePedometerSteps: this.referencePedometerSteps,
      errorPercentage: parseFloat(errorPercentage.toFixed(2)),
      missedSteps,
      falseSteps,
      doubleCounts: this.doubleCounts,
      precision: parseFloat(precision.toFixed(3)),
      recall: parseFloat(recall.toFixed(3)),
      f1Score: parseFloat(f1Score.toFixed(3)),
      referenceMode: this.referenceMode
    };
  }

  public reset(): void {
    this.manualPhysicalCount = 0;
    this.engineDetectedSteps = 0;
    this.referencePedometerSteps = 0;
    this.doubleCounts = 0;
    this.lastDetectedTimestamp = 0;
    this.sessionStartTime = Date.now();
    this.sessionEndTime = null;
    this.isSessionActive = false;
  }

  public getSessionDurationSeconds(): number {
    const endTime = this.sessionEndTime || Date.now();
    return Math.max(0, Math.floor((endTime - this.sessionStartTime) / 1000));
  }
}
