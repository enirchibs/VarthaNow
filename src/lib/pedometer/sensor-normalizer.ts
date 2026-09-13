// 🏃‍♂️ Sensor Normalizer & Effective Sampling Rate Estimator
import { SensorSample, SensorMode } from "./types";

export class SensorNormalizer {
  private lastTimestamp: number = 0;
  private sampleIntervals: number[] = [];
  private maxIntervalHistory: number = 30;
  private effectiveFs: number = 50; // Default 50 Hz fallback

  /**
   * Normalizes raw browser DeviceMotionEvent or pre-built SensorSample
   */
  public normalize(input: DeviceMotionEvent | SensorSample): SensorSample | null {
    if (!input) return null;

    let timestamp: number;
    let ax = 0, ay = 0, az = 0;
    let includesGravity = true;
    let gx: number | undefined;
    let gy: number | undefined;
    let gz: number | undefined;

    // Check if input is already a SensorSample
    if ("ax" in input && typeof input.ax === "number") {
      const sample = input as SensorSample;
      timestamp = sample.timestamp;
      ax = sample.ax;
      ay = sample.ay;
      az = sample.az;
      gx = sample.gx;
      gy = sample.gy;
      gz = sample.gz;
      includesGravity = sample.accelerationIncludesGravity;
    } else {
      const event = input as DeviceMotionEvent;
      const now = Date.now();
      timestamp = (event.timeStamp && event.timeStamp > 0) ? event.timeStamp : now;

      const accWithGrav = event.accelerationIncludingGravity;
      const accPure = event.acceleration;

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
        return null;
      }

      const rot = event.rotationRate;
      if (rot && rot.alpha !== null && rot.beta !== null && rot.gamma !== null) {
        gx = rot.alpha;
        gy = rot.beta;
        gz = rot.gamma;
      }
    }

    if (this.lastTimestamp > 0 && timestamp <= this.lastTimestamp) {
      timestamp = this.lastTimestamp + 1;
    }

    if (this.lastTimestamp > 0) {
      const dtMs = timestamp - this.lastTimestamp;
      if (dtMs > 0 && dtMs < 500) {
        this.sampleIntervals.push(dtMs);
        if (this.sampleIntervals.length > this.maxIntervalHistory) {
          this.sampleIntervals.shift();
        }
        const avgDtMs = this.sampleIntervals.reduce((a, b) => a + b, 0) / this.sampleIntervals.length;
        this.effectiveFs = Math.max(10, Math.min(200, 1000 / avgDtMs));
      }
    }
    this.lastTimestamp = timestamp;

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
