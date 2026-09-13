// 🏃‍♂️ Sensor Normalizer & Effective Sampling Rate Estimator
import { SensorSample, SensorMode } from "./types";

export class SensorNormalizer {
  private lastTimestamp: number = 0;
  private sampleIntervals: number[] = [];
  private maxIntervalHistory: number = 30;
  private effectiveFs: number = 50; // Default 50 Hz fallback

  /**
   * Normalizes raw browser DeviceMotionEvent into a unified SensorSample
   */
  public normalize(event: DeviceMotionEvent): SensorSample | null {
    const now = Date.now();
    
    // Determine timestamp - fallback to Date.now() if event.timeStamp is invalid
    const timestamp = (event.timeStamp && event.timeStamp > 0) ? event.timeStamp : now;

    // Reject duplicate or non-increasing timestamps
    if (this.lastTimestamp > 0 && timestamp <= this.lastTimestamp) {
      return null;
    }

    // Update effective sampling frequency (Fs)
    if (this.lastTimestamp > 0) {
      const dtMs = timestamp - this.lastTimestamp;
      if (dtMs > 0 && dtMs < 500) { // Ignore huge gaps from background tab pause
        this.sampleIntervals.push(dtMs);
        if (this.sampleIntervals.length > this.maxIntervalHistory) {
          this.sampleIntervals.shift();
        }
        const avgDtMs = this.sampleIntervals.reduce((a, b) => a + b, 0) / this.sampleIntervals.length;
        this.effectiveFs = Math.max(10, Math.min(200, 1000 / avgDtMs));
      }
    }
    this.lastTimestamp = timestamp;

    const accWithGrav = event.accelerationIncludingGravity;
    const accPure = event.acceleration;

    let ax = 0, ay = 0, az = 0;
    let includesGravity = true;

    if (accWithGrav && accWithGrav.x !== null && accWithGrav.y !== null && accWithGrav.z !== null) {
      ax = accWithGrav.x;
      ay = accWithGrav.y;
      az = accWithGrav.z;
      includesGravity = true;
    } else if (accPure && accPure.x !== null && accPure.y !== null && accPure.z !== null) {
      ax = accPure.x;
      ay = accPure.y;
      az = accPure.z;
      includesGravity = false;
    } else {
      return null; // Invalid accelerometer payload
    }

    const rot = event.rotationRate;
    let gx: number | undefined;
    let gy: number | undefined;
    let gz: number | undefined;

    if (rot && rot.alpha !== null && rot.beta !== null && rot.gamma !== null) {
      gx = rot.alpha;
      gy = rot.beta;
      gz = rot.gamma;
    }

    return {
      timestamp,
      ax,
      ay,
      az,
      gx,
      gy,
      gz,
      accelerationIncludesGravity: includesGravity
    };
  }

  public getSamplingRateHz(): number {
    return this.effectiveFs;
  }

  public detectSensorMode(sample: SensorSample): SensorMode {
    return (sample.gx !== undefined && sample.gy !== undefined && sample.gz !== undefined)
      ? "ACCEL_GYRO"
      : "ACCEL_ONLY";
  }

  public reset(): void {
    this.lastTimestamp = 0;
    this.sampleIntervals = [];
    this.effectiveFs = 50;
  }
}
