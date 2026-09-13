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
  motionArtifactScore: number; // 0..1
}

export class MotionEnergyAnalyzer {
  private window: number[] = [];
  private maxWindowSize: number = 40;
  private prevAccel: number = 0;
  private prevTimestamp: number = 0;

  public analyze(sample: SensorSample, linearMagnitude: number): MotionEnergyMetrics {
    this.window.push(linearMagnitude);
    if (this.window.length > this.maxWindowSize) {
      this.window.shift();
    }

    // 1. Calculate Jerk (da/dt)
    let jerk = 0;
    if (this.prevTimestamp > 0 && sample.timestamp > this.prevTimestamp) {
      const dtSec = (sample.timestamp - this.prevTimestamp) / 1000;
      if (dtSec > 0) {
        jerk = Math.abs(linearMagnitude - this.prevAccel) / dtSec;
      }
    }
    this.prevAccel = linearMagnitude;
    this.prevTimestamp = sample.timestamp;

    if (this.window.length < 5) {
      return {
        rms: 0,
        variance: 0,
        peakToPeak: 0,
        jerk,
        gyroMagnitude: 0,
        motionCategory: "STATIONARY",
        isVibrationDetected: false,
        isVehicleDetected: false,
        motionArtifactScore: 0
      };
    }

    // 2. Rolling RMS & Peak-to-Peak
    const mean = this.window.reduce((a, b) => a + b, 0) / this.window.length;
    const rms = Math.sqrt(this.window.reduce((acc, val) => acc + val * val, 0) / this.window.length);
    const minVal = Math.min(...this.window);
    const maxVal = Math.max(...this.window);
    const peakToPeak = maxVal - minVal;
    const variance = this.window.reduce((acc, val) => acc + (val - mean) ** 2, 0) / this.window.length;

    // 3. Gyroscope Rotation Magnitude (if present)
    let gyroMagnitude = 0;
    if (sample.gx !== undefined && sample.gy !== undefined && sample.gz !== undefined) {
      gyroMagnitude = Math.sqrt(sample.gx * sample.gx + sample.gy * sample.gy + sample.gz * sample.gz);
    }

    // 4. Vibration Protection
    // Human walking produces low frequency cadence (< 4 Hz) with high amplitude variance.
    // Engine/motor vibration produces continuous high jerk (> 20 m/s³) without human gait timing.
    const isVibrationDetected = (jerk > 20 && peakToPeak > 0.8 && gyroMagnitude < 30) || (jerk > 28);

    // 5. Vehicle Motion Detection (Steady engine frequency, low human-like gait variance)
    const isVehicleDetected = (variance > 0.05 && variance < 0.25) && jerk > 15 && peakToPeak < 0.6;

    // 6. Motion Category Classification
    let motionCategory: MotionCategory = "STATIONARY";
    if (rms < 0.12 && peakToPeak < 0.25) {
      motionCategory = "STATIONARY";
    } else if (rms < 0.35 && peakToPeak < 0.5) {
      motionCategory = "LOW_MOVEMENT";
    } else if (rms >= 0.35 && rms < 2.2 && peakToPeak >= 0.4) {
      motionCategory = "WALKING";
    } else if (rms >= 2.2 && peakToPeak >= 1.8) {
      motionCategory = "FAST_WALKING";
    } else if (gyroMagnitude > 180) { // Fast phone rotation
      motionCategory = "IRREGULAR_MOVEMENT";
    } else {
      motionCategory = "UNKNOWN";
    }

    // 7. Motion Artifact Score (0 = clean human motion, 1 = heavy noise/artifact)
    let motionArtifactScore = 0;
    if (isVibrationDetected) motionArtifactScore += 0.8;
    if (isVehicleDetected) motionArtifactScore += 0.5;
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
