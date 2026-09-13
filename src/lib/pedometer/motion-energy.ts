// 🏃‍♂️ Motion Energy, Jerk Analysis, Vibration & Gyroscope Fusion Engine
import { MotionCategory, SensorSample } from "./types";

export interface MotionEnergyMetrics {
  rms: number;
  variance: number;
  peakToPeak: number;
  jerk: number;
  gyroMagnitude: number;
  motionCategory: MotionCategory;
  isVibrationDetected: boolean;
  isVehicleDetected: boolean;
  motionArtifactScore: number;
}

export class MotionEnergyAnalyzer {
  private window: number[] = [];
  private maxWindowSize: number = 40;
  private prevAccel: number = 0;
  private prevTimestamp: number = 0;

  public analyze(sample: SensorSample, rawMagnitude: number): MotionEnergyMetrics {
    this.window.push(rawMagnitude);
    if (this.window.length > this.maxWindowSize) {
      this.window.shift();
    }

    let jerk = 0;
    if (this.prevTimestamp > 0 && sample.timestamp > this.prevTimestamp) {
      const dtSec = (sample.timestamp - this.prevTimestamp) / 1000;
      if (dtSec > 0) {
        jerk = Math.abs(rawMagnitude - this.prevAccel) / dtSec;
      }
    }
    this.prevAccel = rawMagnitude;
    this.prevTimestamp = sample.timestamp;

    // Count direction reversals (crest/trough zero-crossings in slope) over current window
    let directionReversals = 0;
    for (let i = 2; i < this.window.length; i++) {
      const prevSlope = this.window[i - 1] - this.window[i - 2];
      const currSlope = this.window[i] - this.window[i - 1];
      if (prevSlope * currSlope < 0 && Math.abs(currSlope) > 0.04) {
        directionReversals++;
      }
    }

    let gyroMagnitude = 0;
    if (sample.gx !== undefined && sample.gy !== undefined && sample.gz !== undefined) {
      gyroMagnitude = Math.sqrt(sample.gx * sample.gx + sample.gy * sample.gy + sample.gz * sample.gz);
    }

    const isVibrationDetected = (jerk > 20 && gyroMagnitude < 30) || (jerk > 28);
    const isVehicleDetected = (this.window.length > 5) && (jerk > 15);
    
    // High direction reversal density (e.g. >= 5 reversals in any small window) indicates non-gait hand oscillation (> 4 Hz)
    const reversalDensity = this.window.length > 0 ? (directionReversals / this.window.length) : 0;
    const isHandShakeDetected = reversalDensity > 0.20 || directionReversals >= 6 || (jerk > 12 && gyroMagnitude > 30) || (gyroMagnitude > 90);

    if (this.window.length < 5) {
      return {
        rms: 0,
        variance: 0,
        peakToPeak: 0,
        jerk,
        gyroMagnitude,
        motionCategory: "STATIONARY",
        isVibrationDetected,
        isVehicleDetected: false,
        motionArtifactScore: isHandShakeDetected ? 0.9 : 0
      };
    }

    const mean = this.window.reduce((a, b) => a + b, 0) / this.window.length;
    const rms = Math.sqrt(this.window.reduce((acc, val) => acc + val * val, 0) / this.window.length);
    const minVal = Math.min(...this.window);
    const maxVal = Math.max(...this.window);
    const peakToPeak = maxVal - minVal;
    const variance = this.window.reduce((acc, val) => acc + (val - mean) ** 2, 0) / this.window.length;

    let motionCategory: MotionCategory = "STATIONARY";
    if (rms < 0.12 && peakToPeak < 0.25) {
      motionCategory = "STATIONARY";
    } else if (isHandShakeDetected) {
      motionCategory = "IRREGULAR_MOVEMENT";
    } else if (rms < 0.35 && peakToPeak < 0.5) {
      motionCategory = "LOW_MOVEMENT";
    } else if (rms >= 0.35 && rms < 2.2 && peakToPeak >= 0.4) {
      motionCategory = "WALKING";
    } else if (rms >= 2.2 && peakToPeak >= 1.8) {
      motionCategory = "FAST_WALKING";
    } else {
      motionCategory = "UNKNOWN";
    }

    let motionArtifactScore = 0;
    if (isVibrationDetected) motionArtifactScore += 0.8;
    if (isVehicleDetected) motionArtifactScore += 0.5;
    if (isHandShakeDetected) motionArtifactScore += 0.9;
    if (gyroMagnitude > 120) motionArtifactScore += 0.4;
    motionArtifactScore = Math.min(1.0, motionArtifactScore);

    return {
      rms,
      variance,
      peakToPeak,
      jerk,
      gyroMagnitude,
      motionCategory,
      isVibrationDetected,
      isVehicleDetected,
      motionArtifactScore
    };
  }

  public reset(): void {
    this.window = [];
    this.prevAccel = 0;
    this.prevTimestamp = 0;
  }
}
