// 🏃‍♂️ Real-Time Physical Step-Synchronized Pedometer Engine Main Controller
import { 
  SensorSample, 
  StepEvent, 
  DiagnosticsPayload, 
  EngineMetrics, 
  EngineConfig, 
  CandidatePeak,
  WalkingState,
  SensorMode
} from "./types";
import { STEP_ENGINE_CONFIG } from "./config";
import { SensorNormalizer } from "./sensor-normalizer";
import { DynamicGravityEstimator } from "./dynamic-gravity";
import { EMAFilter } from "./ema-filter";
import { AdaptiveNoiseEstimator } from "./adaptive-noise";
import { MotionEnergyAnalyzer } from "./motion-energy";
import { PeakValleyDetector } from "./peak-valley-detector";
import { AdaptiveCadenceTracker } from "./adaptive-cadence";
import { WaveformSimilarityEngine } from "./waveform-similarity";
import { StepConfidenceEngine } from "./step-confidence";
import { WalkingStateMachine } from "./walking-state-machine";
import { HumanGaitDetector } from "./human-gait-detector";

export class AdaptiveStepEngine {
  private config: EngineConfig;
  private sensorNormalizer: SensorNormalizer;
  private gravityEstimator: DynamicGravityEstimator;
  private emaFilter: EMAFilter;
  private noiseEstimator: AdaptiveNoiseEstimator;
  private motionAnalyzer: MotionEnergyAnalyzer;
  private peakDetector: PeakValleyDetector;
  private cadenceTracker: AdaptiveCadenceTracker;
  private waveformEngine: WaveformSimilarityEngine;
  private confidenceEngine: StepConfidenceEngine;
  private stateMachine: WalkingStateMachine;
  private gaitDetector: HumanGaitDetector;

  // Engine state variables
  private totalSteps: number = 0;
  private totalPeaksDetected: number = 0;
  private rejectedPeaksCount: number = 0;
  private lastStepTimestamp: number = 0;
  private lastPeakTimestamp: number = 0;
  private signalBuffer: number[] = [];
  private recentPeaksLog: { timestamp: number; peakValue: number; prominence: number; isAccepted: boolean }[] = [];
  private isListening: boolean = false;
  private motionListenerRef: ((e: DeviceMotionEvent) => void) | null = null;
  private sensorMode: SensorMode = "ACCEL_ONLY";

  // Callbacks
  private stepCallbacks: ((step: StepEvent) => void)[] = [];
  private diagnosticsCallbacks: ((diag: DiagnosticsPayload) => void)[] = [];
  private metricsCallbacks: ((metrics: EngineMetrics) => void)[] = [];

  constructor(customConfig?: Partial<EngineConfig>) {
    this.config = { ...STEP_ENGINE_CONFIG, ...customConfig };
    this.sensorNormalizer = new SensorNormalizer();
    this.gravityEstimator = new DynamicGravityEstimator();
    this.emaFilter = new EMAFilter();
    this.noiseEstimator = new AdaptiveNoiseEstimator();
    this.motionAnalyzer = new MotionEnergyAnalyzer();
    this.peakDetector = new PeakValleyDetector();
    this.cadenceTracker = new AdaptiveCadenceTracker();
    this.waveformEngine = new WaveformSimilarityEngine();
    this.confidenceEngine = new StepConfidenceEngine();
    this.stateMachine = new WalkingStateMachine();
    this.gaitDetector = new HumanGaitDetector();
  }

  /**
   * Process a single normalized sensor sample
   */
  public processSample(rawSample: SensorSample): StepEvent | null {
    // 1. Sensor Normalization & Sampling Rate Estimation
    const sample = this.sensorNormalizer.normalize(rawSample);
    if (!sample) return null;
    const samplingRateHz = this.sensorNormalizer.getSamplingRateHz();

    if (rawSample.gx !== undefined && rawSample.gy !== undefined && rawSample.gz !== undefined) {
      this.sensorMode = "ACCEL_GYRO";
    }

    // 2. Dynamic 3D Gravity Removal
    const { gravity, linearMagnitude } = this.gravityEstimator.process(sample, this.config.gravityAlpha);
    const gravityZ = gravity.z;
    const totalRawMagnitude = Math.sqrt(sample.ax * sample.ax + sample.ay * sample.ay + sample.az * sample.az);

    // 3. Sampling-rate aware low-pass EMA Filter
    const filterRes = this.emaFilter.filter(linearMagnitude, this.config.emaBeta, samplingRateHz);
    const filteredSignal = filterRes.filteredSignal;

    // Maintain recent signal buffer for waveform shape matching (50 samples max)
    this.signalBuffer.push(filteredSignal);
    if (this.signalBuffer.length > 50) {
      this.signalBuffer.shift();
    }

    // 4. Adaptive Noise Baseline & Threshold Estimation
    this.noiseEstimator.update(filteredSignal);
    const adaptiveThreshold = this.noiseEstimator.getAdaptiveThreshold(
      this.config.minimumPeakThreshold,
      this.config.noiseMultiplier
    );
    const noiseFloor = this.noiseEstimator.getNoiseFloor();

    // 5. Motion Energy & Vibration Rejection
    const motionMetrics = this.motionAnalyzer.analyze(sample, totalRawMagnitude);

    // If severe motor vibration detected, skip step candidate processing
    if (motionMetrics.isVibrationDetected) {
      const stateInfo = this.stateMachine.update("IRREGULAR_MOVEMENT" as any, false, 0, this.config.walkingLockThreshold);
      this.emitDiagnostics(sample.timestamp, linearMagnitude, filteredSignal, gravityZ, adaptiveThreshold, noiseFloor, stateInfo.walkingConfidence, motionMetrics.rms, stateInfo.currentState, samplingRateHz);
      return null;
    }

    // 6. Peak-Valley Detection
    const candidatePeak: CandidatePeak | null = this.peakDetector.process(
      filteredSignal,
      sample.timestamp,
      adaptiveThreshold,
      this.config.minStepIntervalMs
    );

    let stepEvent: StepEvent | null = null;

    if (candidatePeak) {
      this.totalPeaksDetected++;
      this.lastPeakTimestamp = candidatePeak.timestamp;

      // Refractory Period Check (< 300ms is impossible for human steps)
      const timeSinceLastStep = candidatePeak.timestamp - this.lastStepTimestamp;
      if (this.lastStepTimestamp > 0 && timeSinceLastStep < this.config.minStepIntervalMs) {
        this.rejectedPeaksCount++;
        this.logRecentPeak(candidatePeak.timestamp, candidatePeak.peakValue, candidatePeak.prominence, false);
        return null;
      }

      // 7. Adaptive Cadence Analysis
      const cadenceEval = this.cadenceTracker.evaluateCandidateCadence(
        candidatePeak.timestamp,
        this.config.minStepIntervalMs,
        this.config.maxStepIntervalMs,
        candidatePeak.peakValue
      );

      // 8. Waveform Shape Similarity Matching
      const waveformScore = this.waveformEngine.scoreCandidate(this.signalBuffer);

      // 9. Gait Feature Extraction
      const currentSPM = this.cadenceTracker.getCadenceSPM();
      const gaitFeatures = this.gaitDetector.evaluateGait(
        motionMetrics.rms,
        candidatePeak.prominence,
        currentSPM,
        waveformScore,
        samplingRateHz
      );

      // 10. Multi-factor Step Confidence Scoring
      const confidenceRes = this.confidenceEngine.evaluateConfidence(
        {
          candidate: candidatePeak,
          adaptiveThreshold,
          cadenceScore: cadenceEval.cadenceScore,
          waveformScore,
          walkingConfidence: gaitFeatures.walkingConfidence,
          motionArtifactScore: motionMetrics.motionArtifactScore
        },
        this.config.stepAcceptThreshold,
        this.config.tentativeThreshold
      );

      // 11. Walking State Machine Update
      const isConfirmedCandidate = confidenceRes.state === "CONFIRMED";
      const { currentState, walkingConfidence } = this.stateMachine.update(
        motionMetrics.motionCategory,
        isConfirmedCandidate,
        confidenceRes.totalConfidence,
        this.config.walkingLockThreshold
      );

      // 12. Final Acceptance Criteria
      if (isConfirmedCandidate && (currentState === "WALKING" || currentState === "FAST_WALKING" || currentState === "CANDIDATE_WALKING" || walkingConfidence >= 0.50)) {
        this.totalSteps++;
        const intervalMs = this.lastStepTimestamp > 0 ? candidatePeak.timestamp - this.lastStepTimestamp : 550;
        this.lastStepTimestamp = candidatePeak.timestamp;

        // Confirm step in cadence tracker & store accepted waveform template
        this.cadenceTracker.recordAcceptedStep(candidatePeak.timestamp, this.config.cadenceAdaptation);
        this.waveformEngine.addAcceptedWaveform(this.signalBuffer);
        this.logRecentPeak(candidatePeak.timestamp, candidatePeak.peakValue, candidatePeak.prominence, true);

        stepEvent = {
          timestamp: candidatePeak.timestamp,
          stepNumber: this.totalSteps,
          intervalMs,
          cadenceSPM: this.cadenceTracker.getCadenceSPM(),
          peakAmplitude: parseFloat(candidatePeak.peakValue.toFixed(3)),
          peakProminence: parseFloat(candidatePeak.prominence.toFixed(3)),
          cadenceScore: cadenceEval.cadenceScore,
          waveformScore,
          motionScore: gaitFeatures.periodicityScore,
          walkingConfidence,
          stepConfidence: confidenceRes.totalConfidence,
          state: "CONFIRMED",
          sensorMode: this.sensorMode
        };

        // Dispatch step event callbacks
        this.stepCallbacks.forEach((cb) => cb(stepEvent!));
      } else {
        this.rejectedPeaksCount++;
        this.logRecentPeak(candidatePeak.timestamp, candidatePeak.peakValue, candidatePeak.prominence, false);
      }
    } else {
      // Periodic state machine decay update
      this.stateMachine.update(motionMetrics.motionCategory, false, 0, this.config.walkingLockThreshold);
    }

    // Emit diagnostics payload & metrics update
    const state = this.stateMachine.getCurrentState();
    const conf = this.stateMachine.getWalkingConfidence();
    this.emitDiagnostics(
      sample.timestamp,
      linearMagnitude,
      filteredSignal,
      gravityZ,
      adaptiveThreshold,
      noiseFloor,
      conf,
      motionMetrics.rms,
      state,
      samplingRateHz
    );

    return stepEvent;
  }

  /**
   * Process native DeviceMotionEvent from Browser Window Sensor API
   */
  public processDeviceMotionEvent(event: DeviceMotionEvent): StepEvent | null {
    const timestamp = event.timeStamp || Date.now();
    let ax = 0, ay = 0, az = 0;
    let accelerationIncludesGravity = true;

    if (event.acceleration && event.acceleration.x !== null) {
      ax = event.acceleration.x || 0;
      ay = event.acceleration.y || 0;
      az = event.acceleration.z || 0;
      accelerationIncludesGravity = false;
    } else if (event.accelerationIncludingGravity && event.accelerationIncludingGravity.x !== null) {
      ax = event.accelerationIncludingGravity.x || 0;
      ay = event.accelerationIncludingGravity.y || 0;
      az = event.accelerationIncludingGravity.z || 0;
      accelerationIncludesGravity = true;
    }

    let gx: number | undefined = undefined;
    let gy: number | undefined = undefined;
    let gz: number | undefined = undefined;

    if (event.rotationRate) {
      gx = event.rotationRate.alpha || 0;
      gy = event.rotationRate.beta || 0;
      gz = event.rotationRate.gamma || 0;
    }

    const sample: SensorSample = {
      timestamp,
      ax,
      ay,
      az,
      gx,
      gy,
      gz,
      accelerationIncludesGravity
    };

    return this.processSample(sample);
  }

  /**
   * Request Motion Permissions & Start Real-time Browser Sensor Listener
   */
  public async startSensorListener(
    onStepCb?: (step: StepEvent) => void,
    onDiagCb?: (diag: DiagnosticsPayload) => void
  ): Promise<boolean> {
    if (onStepCb) this.onStep(onStepCb);
    if (onDiagCb) this.onDiagnostics(onDiagCb);

    if (typeof window === "undefined") return false;

    if (typeof (DeviceMotionEvent as any)?.requestPermission === "function") {
      try {
        const permissionState = await (DeviceMotionEvent as any).requestPermission();
        if (permissionState !== "granted") {
          console.warn("DeviceMotionEvent permission was denied by user.");
          return false;
        }
      } catch (err) {
        console.error("Error requesting DeviceMotionEvent permission:", err);
        return false;
      }
    }

    this.motionListenerRef = (event: DeviceMotionEvent) => {
      this.processDeviceMotionEvent(event);
    };

    window.addEventListener("devicemotion", this.motionListenerRef, true);
    this.isListening = true;
    return true;
  }

  /**
   * Stop Real-time Browser Sensor Listener
   */
  public stopSensorListener(): void {
    if (typeof window !== "undefined" && this.motionListenerRef) {
      window.removeEventListener("devicemotion", this.motionListenerRef, true);
      this.motionListenerRef = null;
    }
    this.isListening = false;
  }

  /**
   * Reset engine state
   */
  public reset(): void {
    this.totalSteps = 0;
    this.totalPeaksDetected = 0;
    this.rejectedPeaksCount = 0;
    this.lastStepTimestamp = 0;
    this.lastPeakTimestamp = 0;
    this.signalBuffer = [];
    this.recentPeaksLog = [];
    this.sensorNormalizer.reset();
    this.gravityEstimator.reset();
    this.emaFilter.reset();
    this.noiseEstimator.reset();
    this.motionAnalyzer.reset();
    this.peakDetector.reset();
    this.cadenceTracker.reset();
    this.waveformEngine.reset();
    this.stateMachine.reset();
    this.gaitDetector.reset();
  }

  public getMetrics(): EngineMetrics {
    return {
      steps: this.totalSteps,
      cadenceSPM: this.cadenceTracker.getCadenceSPM(),
      estimatedStepIntervalMs: this.cadenceTracker.getEstimatedIntervalMs(),
      walkingConfidence: this.stateMachine.getWalkingConfidence(),
      signalQuality: 0.95,
      sensorQuality: 0.95,
      motionArtifactScore: 0.05,
      currentState: this.stateMachine.getCurrentState(),
      sensorMode: this.sensorMode,
      samplingRateHz: this.sensorNormalizer.getSamplingRateHz(),
      adaptiveThreshold: this.noiseEstimator.getAdaptiveThreshold(this.config.minimumPeakThreshold, this.config.noiseMultiplier),
      noiseFloor: this.noiseEstimator.getNoiseFloor(),
      totalPeaksDetected: this.totalPeaksDetected,
      rejectedPeaksCount: this.rejectedPeaksCount
    };
  }

  public getDiagnostics(): DiagnosticsPayload {
    return {
      sampleTime: Date.now(),
      rawSignal: 0,
      filteredSignal: this.signalBuffer.length > 0 ? this.signalBuffer[this.signalBuffer.length - 1] : 0,
      gravityZ: 9.81,
      adaptiveThreshold: this.noiseEstimator.getAdaptiveThreshold(this.config.minimumPeakThreshold, this.config.noiseMultiplier),
      noiseFloor: this.noiseEstimator.getNoiseFloor(),
      walkingConfidence: this.stateMachine.getWalkingConfidence(),
      motionEnergyRMS: 0.20,
      cadenceSPM: this.cadenceTracker.getCadenceSPM(),
      estimatedIntervalMs: this.cadenceTracker.getEstimatedIntervalMs(),
      currentState: this.stateMachine.getCurrentState(),
      sensorMode: this.sensorMode,
      samplingRateHz: this.sensorNormalizer.getSamplingRateHz(),
      recentPeaks: [...this.recentPeaksLog]
    };
  }

  // Subscriptions
  public onStep(cb: (event: StepEvent) => void): () => void {
    this.stepCallbacks.push(cb);
    return () => {
      this.stepCallbacks = this.stepCallbacks.filter((c) => c !== cb);
    };
  }

  public onDiagnostics(cb: (diag: DiagnosticsPayload) => void): () => void {
    this.diagnosticsCallbacks.push(cb);
    return () => {
      this.diagnosticsCallbacks = this.diagnosticsCallbacks.filter((c) => c !== cb);
    };
  }

  public onMetricsUpdate(cb: (metrics: EngineMetrics) => void): () => void {
    this.metricsCallbacks.push(cb);
    return () => {
      this.metricsCallbacks = this.metricsCallbacks.filter((c) => c !== cb);
    };
  }

  private emitDiagnostics(
    sampleTime: number,
    rawSignal: number,
    filteredSignal: number,
    gravityZ: number,
    adaptiveThreshold: number,
    noiseFloor: number,
    walkingConfidence: number,
    motionEnergyRMS: number,
    currentState: WalkingState,
    samplingRateHz: number
  ): void {
    const diag: DiagnosticsPayload = {
      sampleTime,
      rawSignal: parseFloat(rawSignal.toFixed(3)),
      filteredSignal: parseFloat(filteredSignal.toFixed(3)),
      gravityZ: parseFloat(gravityZ.toFixed(3)),
      adaptiveThreshold: parseFloat(adaptiveThreshold.toFixed(3)),
      noiseFloor: parseFloat(noiseFloor.toFixed(3)),
      walkingConfidence: parseFloat(walkingConfidence.toFixed(3)),
      motionEnergyRMS: parseFloat(motionEnergyRMS.toFixed(3)),
      cadenceSPM: this.cadenceTracker.getCadenceSPM(),
      estimatedIntervalMs: this.cadenceTracker.getEstimatedIntervalMs(),
      currentState,
      sensorMode: this.sensorMode,
      samplingRateHz,
      recentPeaks: [...this.recentPeaksLog]
    };

    this.diagnosticsCallbacks.forEach((cb) => cb(diag));
    const metrics = this.getMetrics();
    this.metricsCallbacks.forEach((cb) => cb(metrics));
  }

  private logRecentPeak(timestamp: number, peakValue: number, prominence: number, isAccepted: boolean): void {
    this.recentPeaksLog.push({
      timestamp,
      peakValue: parseFloat(peakValue.toFixed(3)),
      prominence: parseFloat(prominence.toFixed(3)),
      isAccepted
    });
    if (this.recentPeaksLog.length > 20) {
      this.recentPeaksLog.shift();
    }
  }
}
