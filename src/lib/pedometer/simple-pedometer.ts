// 🏃‍♂️ Simple Real-Time Mobile Step Counter Engine
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

export type WalkingState = "STATIONARY" | "WALKING";

export interface PedometerMetrics {
  steps: number;
  cadenceSPM: number;
  walkingState: WalkingState;
  lastStepTimestamp: number;
}

export const STEP_CONFIG = {
  gravityAlpha: 0.97,           // Gravity low-pass alpha
  emaBeta: 0.65,                // Light EMA smoothing beta
  minimumPeakThreshold: 0.25,   // Minimum peak amplitude threshold (m/s²)
  noiseMultiplier: 2.0,         // Noise floor stdDev multiplier
  minStepIntervalMs: 300,       // Refractory double-count protection (ms)
  maxStepIntervalMs: 1500,      // Max interval for slow walk (ms)
  walkingStartPeaks: 2,         // Consecutive peaks required to confirm WALKING state
  walkingTimeoutMs: 1800        // Timeout to return to STATIONARY (ms)
};

export class SimplePedometer {
  private config = STEP_CONFIG;

  // Sensor & Filter State
  private gravity = { x: 0, y: 0, z: 9.81 };
  private isGravityInitialized = false;
  private previousFilteredSignal = 0;
  private isFilterInitialized = false;

  // Noise Floor Window (Rolling 30 samples)
  private noiseWindow: number[] = [];

  // Peak Detection Buffer (3-sample sliding window: prev, curr, next)
  private sampleWindow: { value: number; timestamp: number }[] = [];
  private lastValleyValue = 0;

  // Gait & Timing State
  private steps = 0;
  private lastStepTimestamp = 0;
  private recentStepIntervals: number[] = [];
  private candidatePeakCount = 0;
  private walkingState: WalkingState = "STATIONARY";
  private lastPeakTimestamp = 0;

  // Callbacks
  private stepListeners: ((steps: number, metrics: PedometerMetrics) => void)[] = [];
  private isListening = false;
  private motionListenerRef: ((e: DeviceMotionEvent) => void) | null = null;

  /**
   * Process a single accelerometer sample
   */
  public processSample(rawSample: SensorSample): boolean {
    const { timestamp, ax, ay, az, accelerationIncludesGravity } = rawSample;

    // 1. Dynamic Gravity Removal
    let linearX = ax;
    let linearY = ay;
    let linearZ = az;

    if (accelerationIncludesGravity) {
      if (!this.isGravityInitialized) {
        this.gravity = { x: ax, y: ay, z: az };
        this.isGravityInitialized = true;
      } else {
        this.gravity.x = this.config.gravityAlpha * this.gravity.x + (1 - this.config.gravityAlpha) * ax;
        this.gravity.y = this.config.gravityAlpha * this.gravity.y + (1 - this.config.gravityAlpha) * ay;
        this.gravity.z = this.config.gravityAlpha * this.gravity.z + (1 - this.config.gravityAlpha) * az;
      }
      linearX = ax - this.gravity.x;
      linearY = ay - this.gravity.y;
      linearZ = az - this.gravity.z;
    }

    // 2. Orientation-Independent Movement Magnitude
    const magnitude = Math.sqrt(linearX * linearX + linearY * linearY + linearZ * linearZ);

    // 3. Lightweight EMA Filter
    if (!this.isFilterInitialized) {
      this.previousFilteredSignal = magnitude;
      this.isFilterInitialized = true;
    }
    const filteredSignal = this.config.emaBeta * magnitude + (1 - this.config.emaBeta) * this.previousFilteredSignal;
    this.previousFilteredSignal = filteredSignal;

    // 4. Adaptive Noise Floor & Direction Reversal Estimation
    this.noiseWindow.push(filteredSignal);
    if (this.noiseWindow.length > 30) {
      this.noiseWindow.shift();
    }

    let noiseFloor = 0.05;
    let noiseStd = 0.02;
    let directionReversals = 0;

    for (let i = 2; i < this.noiseWindow.length; i++) {
      const prevSlope = this.noiseWindow[i - 1] - this.noiseWindow[i - 2];
      const currSlope = this.noiseWindow[i] - this.noiseWindow[i - 1];
      if (prevSlope * currSlope < 0 && Math.abs(currSlope) > 0.04) {
        directionReversals++;
      }
    }

    if (this.noiseWindow.length >= 5) {
      const mean = this.noiseWindow.reduce((a, b) => a + b, 0) / this.noiseWindow.length;
      const variance = this.noiseWindow.reduce((acc, val) => acc + (val - mean) ** 2, 0) / this.noiseWindow.length;
      const stdDev = Math.sqrt(variance);
      if (stdDev <= 0.08) {
        noiseFloor = mean;
        noiseStd = stdDev;
      }
    }

    const isHandShakeDetected = directionReversals >= 6;
    const adaptiveThreshold = Math.max(
      this.config.minimumPeakThreshold,
      noiseFloor + noiseStd * this.config.noiseMultiplier
    );

    // 5. Peak Detection (3-sample sliding window: prev < current > next)
    this.sampleWindow.push({ value: filteredSignal, timestamp });
    if (this.sampleWindow.length > 3) {
      this.sampleWindow.shift();
    }

    let isStepConfirmed = false;

    if (this.sampleWindow.length === 3) {
      const prev = this.sampleWindow[0];
      const curr = this.sampleWindow[1];
      const next = this.sampleWindow[2];

      // Track trough / valley
      if (curr.value < prev.value && curr.value < next.value) {
        this.lastValleyValue = curr.value;
      }

      // Check peak crest condition
      if (!isHandShakeDetected && curr.value > prev.value && curr.value > next.value) {
        const peakProminence = curr.value - this.lastValleyValue;

        if (curr.value >= adaptiveThreshold && peakProminence >= 0.15) {
          const peakTime = curr.timestamp;
          const intervalMs = this.lastPeakTimestamp > 0 ? peakTime - this.lastPeakTimestamp : 550;

          // Biomechanical 2nd Harmonic Rebound Gate for Slow Walking
          const isHarmonicRebound = (intervalMs < 480 && curr.value < 1.8) || 
            (this.recentStepIntervals.length > 0 && Math.abs(intervalMs - (this.recentStepIntervals[this.recentStepIntervals.length - 1] * 0.5)) < 100);

          if (!isHarmonicRebound) {
            // Minimum Step Interval Protection (300ms refractory period)
            if (this.lastStepTimestamp === 0 || (peakTime - this.lastStepTimestamp >= this.config.minStepIntervalMs)) {
              // Check interval bounds
              if (intervalMs >= this.config.minStepIntervalMs && intervalMs <= this.config.maxStepIntervalMs) {
                this.candidatePeakCount++;
                this.lastPeakTimestamp = peakTime;

                // Enter WALKING state after 3 valid candidate peaks
                if (this.candidatePeakCount >= this.config.walkingStartPeaks) {
                  this.walkingState = "WALKING";
                }

                // Confirm step if WALKING state is active or candidate count reached
                if (this.walkingState === "WALKING" || this.candidatePeakCount >= 2) {
                  this.steps++;
                  this.lastStepTimestamp = peakTime;

                  // Track step interval history for cadence calculation
                  if (intervalMs > 0 && intervalMs < 2000) {
                    this.recentStepIntervals.push(intervalMs);
                    if (this.recentStepIntervals.length > 5) {
                      this.recentStepIntervals.shift();
                    }
                  }

                  isStepConfirmed = true;
                  this.notifyListeners();
                }
              }
            }
          }
        }
      }
    }

    // 6. Walking Timeout Check (Reset to STATIONARY if no step within 1800ms)
    if (this.walkingState === "WALKING" && this.lastStepTimestamp > 0) {
      if (timestamp - this.lastStepTimestamp > this.config.walkingTimeoutMs) {
        this.walkingState = "STATIONARY";
        this.candidatePeakCount = 0;
        this.notifyListeners();
      }
    }

    return isStepConfirmed;
  }

  /**
   * Process native browser DeviceMotionEvent
   */
  public processDeviceMotionEvent(event: DeviceMotionEvent): boolean {
    const timestamp = (event.timeStamp && event.timeStamp > 0) ? event.timeStamp : Date.now();
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
    } else {
      return false;
    }

    return this.processSample({
      timestamp,
      ax,
      ay,
      az,
      accelerationIncludesGravity
    });
  }

  /**
   * Start Motion Sensor Listener
   */
  public async startSensorListener(onStepCb?: (steps: number, metrics: PedometerMetrics) => void): Promise<boolean> {
    if (onStepCb) this.subscribe(onStepCb);

    if (typeof window === "undefined") return false;

    // Check iOS 13+ permission
    if (typeof (DeviceMotionEvent as any)?.requestPermission === "function") {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission !== "granted") {
          console.warn("DeviceMotionEvent permission denied.");
          return false;
        }
      } catch (err) {
        console.error("DeviceMotionEvent permission error:", err);
        return false;
      }
    }

    this.motionListenerRef = (e: DeviceMotionEvent) => {
      this.processDeviceMotionEvent(e);
    };

    window.addEventListener("devicemotion", this.motionListenerRef, true);
    this.isListening = true;
    return true;
  }

  /**
   * Stop Motion Sensor Listener
   */
  public stopSensorListener(): void {
    if (typeof window !== "undefined" && this.motionListenerRef) {
      window.removeEventListener("devicemotion", this.motionListenerRef, true);
      this.motionListenerRef = null;
    }
    this.isListening = false;
  }

  /**
   * Reset Step Counter
   */
  public reset(): void {
    this.steps = 0;
    this.lastStepTimestamp = 0;
    this.recentStepIntervals = [];
    this.candidatePeakCount = 0;
    this.walkingState = "STATIONARY";
    this.lastPeakTimestamp = 0;
    this.sampleWindow = [];
    this.noiseWindow = [];
    this.isGravityInitialized = false;
    this.isFilterInitialized = false;
    this.notifyListeners();
  }

  public getMetrics(): PedometerMetrics {
    let cadenceSPM = 0;
    if (this.recentStepIntervals.length > 0) {
      const avgInterval = this.recentStepIntervals.reduce((a, b) => a + b, 0) / this.recentStepIntervals.length;
      if (avgInterval > 0) {
        cadenceSPM = Math.round(60000 / avgInterval);
      }
    }

    return {
      steps: this.steps,
      cadenceSPM,
      walkingState: this.walkingState,
      lastStepTimestamp: this.lastStepTimestamp
    };
  }

  public subscribe(cb: (steps: number, metrics: PedometerMetrics) => void): () => void {
    this.stepListeners.push(cb);
    return () => {
      this.stepListeners = this.stepListeners.filter((c) => c !== cb);
    };
  }

  private notifyListeners(): void {
    const metrics = this.getMetrics();
    this.stepListeners.forEach((cb) => cb(this.steps, metrics));
  }
}
