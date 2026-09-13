// 🏃‍♂️ Principal Adaptive Human-Walk Step Detection Engine
import { 
  SensorSample, 
  EngineConfig, 
  EngineMetrics, 
  StepEvent, 
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

export class AdaptiveStepEngine {
  private config: EngineConfig;
  private isRunning: boolean = false;
  private startTime: number = 0;

  // Pipeline Sub-Components
  private normalizer = new SensorNormalizer();
  private gravityEstimator = new DynamicGravityEstimator();
  private emaFilter = new EMAFilter();
  private noiseEstimator = new AdaptiveNoiseEstimator();
  private motionAnalyzer = new MotionEnergyAnalyzer();
  private peakDetector = new PeakValleyDetector();
  private cadenceTracker = new AdaptiveCadenceTracker();
  private waveformEngine = new WaveformSimilarityEngine();
  private confidenceEngine = new StepConfidenceEngine();
  private stateMachine = new WalkingStateMachine();

  // Step Counter & Metrics
  private confirmedStepsCount: number = 0;
  private totalPeaksCount: number = 0;
  private rejectedPeaksCount: number = 0;
  private windowSignalBuffer: number[] = [];
  private sensorMode: SensorMode = "ACCEL_ONLY";

  // Event Listener Callbacks
  private stepListeners: ((step: StepEvent) => void)[] = [];
  private stateListeners: ((state: WalkingState) => void)[] = [];
  private diagnosticsListeners: ((diag: DiagnosticsPayload) => void)[] = [];

  // Diagnostics History for Real-Time Canvas Chart
  private recentPeaksLog: { timestamp: number; peakValue: number; prominence: number; isAccepted: boolean }[] = [];

  constructor(customConfig?: Partial<EngineConfig>) {
    this.config = { ...STEP_ENGINE_CONFIG, ...customConfig };
  }

  public start(): void {
    this.isRunning = true;
    this.startTime = Date.now();
    this.resetState();
  }

  public stop(): void {
    this.isRunning = false;
  }

  public resetState(): void {
    this.normalizer.reset();
    this.gravityEstimator.reset();
    this.emaFilter.reset();
    this.noiseEstimator.reset();
    this.motionAnalyzer.reset();
    this.peakDetector.reset();
    this.cadenceTracker.reset();
    this.waveformEngine.reset();
    this.stateMachine.reset();

    this.confirmedStepsCount = 0;
    this.totalPeaksCount = 0;
    this.rejectedPeaksCount = 0;
    this.recentPeaksLog = [];
    this.windowSignalBuffer = [];
  }

  /**
   * Main Sample Processing Pipeline Entrypoint (invoked per raw browser DeviceMotionEvent)
   */
  public processDeviceMotionEvent(event: DeviceMotionEvent): void {
    if (!this.isRunning) return;

    const sample = this.normalizer.normalize(event);
    if (!sample) return;

    this.processSample(sample);
  }

  /**
   * Process unified SensorSample through the full 15-stage pipeline
   */
  public processSample(sample: SensorSample): void {
    if (!this.isRunning) return;

    this.sensorMode = this.normalizer.detectSensorMode(sample);
    const samplingRateHz = this.normalizer.getSamplingRateHz();

    // Stage 4 & 5: Dynamic Gravity & Vector Magnitude
    const gravityRes = this.gravityEstimator.process(sample, this.config.gravityAlpha);
    const rawMagnitude = gravityRes.linearMagnitude;

    // Stage 6: Sampling-Rate Aware EMA Filter
    const { filteredSignal } = this.emaFilter.filter(rawMagnitude, this.config.emaBeta, samplingRateHz);

    // Buffer signal window for waveform shape similarity
    this.windowSignalBuffer.push(filteredSignal);
    if (this.windowSignalBuffer.length > 25) {
      this.windowSignalBuffer.shift();
    }

    // Stage 7 & 8: Adaptive Baseline & Noise Floor Estimation
    this.noiseEstimator.update(filteredSignal);
    const adaptiveThreshold = this.noiseEstimator.getAdaptiveThreshold(
      this.config.minimumPeakThreshold,
      this.config.noiseMultiplier
    );

    // Stage 9: Motion Energy & Vibration Analysis (uses rawMagnitude for true un-smoothed jerk detection)
    const motionMetrics = this.motionAnalyzer.analyze(sample, rawMagnitude);

    // Stage 10 & 11: Human Motion Gate & Peak-Valley Detection
    const candidatePeak = this.peakDetector.process(
      filteredSignal,
      sample.timestamp,
      adaptiveThreshold,
      this.config.minStepIntervalMs
    );

    let isCandidateDetected = false;
    let candidateConfidence = 0;

    if (candidatePeak) {
      this.totalPeaksCount++;
      isCandidateDetected = true;

      // Stage 15 & 16: Evaluate Cadence Consistency (without mutating state)
      const cadenceEval = this.cadenceTracker.evaluateCandidateCadence(
        candidatePeak.timestamp,
        this.config.minStepIntervalMs,
        this.config.maxStepIntervalMs
      );

      // Stage 19: Waveform Similarity Score
      const waveformScore = this.waveformEngine.scoreCandidate(this.windowSignalBuffer);

      // Current Walking State Confidence
      const walkingConf = this.stateMachine.getWalkingConfidence();

      // Stage 20: Multi-Factor Step Confidence Engine
      const confidenceRes = this.confidenceEngine.evaluateConfidence(
        {
          candidate: candidatePeak,
          adaptiveThreshold,
          cadenceScore: cadenceEval.cadenceScore,
          waveformScore,
          walkingConfidence: walkingConf,
          motionArtifactScore: motionMetrics.motionArtifactScore
        },
        this.config.stepAcceptThreshold,
        this.config.tentativeThreshold
      );

      candidateConfidence = confidenceRes.totalConfidence;

      // Log Peak for Real-time Developer Diagnostics Chart
      const isAccepted = confidenceRes.state === "CONFIRMED";
      this.recentPeaksLog.push({
        timestamp: candidatePeak.timestamp,
        peakValue: parseFloat(candidatePeak.peakValue.toFixed(2)),
        prominence: parseFloat(candidatePeak.prominence.toFixed(2)),
        isAccepted
      });
      if (this.recentPeaksLog.length > 20) {
        this.recentPeaksLog.shift();
      }

      if (isAccepted) {
        // CONFIRMED STEP!
        this.confirmedStepsCount++;
        this.peakDetector.recordAcceptedStep(candidatePeak.timestamp);
        this.cadenceTracker.recordAcceptedStep(candidatePeak.timestamp, this.config.cadenceAdaptation);
        this.waveformEngine.addAcceptedWaveform(this.windowSignalBuffer);

        const stepEvent: StepEvent = {
          timestamp: candidatePeak.timestamp,
          intervalMs: cadenceEval.candidateIntervalMs,
          cadenceSPM: this.cadenceTracker.getCadenceSPM(),
          peakAmplitude: candidatePeak.peakValue,
          peakProminence: candidatePeak.prominence,
          cadenceScore: cadenceEval.cadenceScore,
          waveformScore,
          motionScore: motionMetrics.rms,
          stepConfidence: confidenceRes.totalConfidence,
          walkingConfidence: walkingConf,
          state: "CONFIRMED",
          sensorMode: this.sensorMode
        };

        // Notify Step Event Listeners
        this.stepListeners.forEach((listener) => listener(stepEvent));
      } else {
        this.rejectedPeaksCount++;
      }
    }

    // Stage 17 & 18: Update Walking State Machine
    const prevState = this.stateMachine.getCurrentState();
    const stateRes = this.stateMachine.update(
      motionMetrics.motionCategory,
      isCandidateDetected,
      candidateConfidence,
      this.config.walkingLockThreshold
    );

    if (stateRes.currentState !== prevState) {
      this.stateListeners.forEach((listener) => listener(stateRes.currentState));
    }

    // Emit Real-Time Developer Diagnostics Payload
    if (this.diagnosticsListeners.length > 0) {
      const diag: DiagnosticsPayload = {
        sampleTime: sample.timestamp,
        rawSignal: parseFloat(rawMagnitude.toFixed(2)),
        filteredSignal: parseFloat(filteredSignal.toFixed(2)),
        gravityZ: parseFloat(gravityRes.gravity.z.toFixed(2)),
        adaptiveThreshold: parseFloat(adaptiveThreshold.toFixed(2)),
        noiseFloor: parseFloat(this.noiseEstimator.getNoiseFloor().toFixed(2)),
        walkingConfidence: stateRes.walkingConfidence,
        motionEnergyRMS: parseFloat(motionMetrics.rms.toFixed(2)),
        cadenceSPM: this.cadenceTracker.getCadenceSPM(),
        estimatedIntervalMs: Math.round(this.cadenceTracker.getEstimatedIntervalMs()),
        currentState: stateRes.currentState,
        sensorMode: this.sensorMode,
        samplingRateHz: parseFloat(samplingRateHz.toFixed(1)),
        recentPeaks: [...this.recentPeaksLog]
      };
      this.diagnosticsListeners.forEach((listener) => listener(diag));
    }
  }

  // --- Listener Subscriptions ---
  public onStep(callback: (step: StepEvent) => void): () => void {
    this.stepListeners.push(callback);
    return () => {
      this.stepListeners = this.stepListeners.filter((cb) => cb !== callback);
    };
  }

  public onStateChange(callback: (state: WalkingState) => void): () => void {
    this.stateListeners.push(callback);
    return () => {
      this.stateListeners = this.stateListeners.filter((cb) => cb !== callback);
    };
  }

  public onDiagnostics(callback: (diag: DiagnosticsPayload) => void): () => void {
    this.diagnosticsListeners.push(callback);
    return () => {
      this.diagnosticsListeners = this.diagnosticsListeners.filter((cb) => cb !== callback);
    };
  }

  public getMetrics(): EngineMetrics {
    return {
      steps: this.confirmedStepsCount,
      cadenceSPM: this.cadenceTracker.getCadenceSPM(),
      estimatedStepIntervalMs: Math.round(this.cadenceTracker.getEstimatedIntervalMs()),
      walkingConfidence: this.stateMachine.getWalkingConfidence(),
      signalQuality: 0.95,
      sensorQuality: 0.95,
      motionArtifactScore: 0.05,
      currentState: this.stateMachine.getCurrentState(),
      sensorMode: this.sensorMode,
      samplingRateHz: parseFloat(this.normalizer.getSamplingRateHz().toFixed(1)),
      adaptiveThreshold: parseFloat(
        this.noiseEstimator
          .getAdaptiveThreshold(this.config.minimumPeakThreshold, this.config.noiseMultiplier)
          .toFixed(2)
      ),
      noiseFloor: parseFloat(this.noiseEstimator.getNoiseFloor().toFixed(2)),
      totalPeaksDetected: this.totalPeaksCount,
      rejectedPeaksCount: this.rejectedPeaksCount
    };
  }

  public setSteps(count: number): void {
    this.confirmedStepsCount = Math.max(0, count);
  }
}
