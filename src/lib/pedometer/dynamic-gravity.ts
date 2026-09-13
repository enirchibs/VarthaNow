// 🏃‍♂️ Dynamic Gravity Estimation & Orientation-Independent Linear Magnitude
import { SensorSample } from "./types";

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface GravityResult {
  gravity: Vector3D;
  linearAccel: Vector3D;
  linearMagnitude: number;
}

export class DynamicGravityEstimator {
  private gravity: Vector3D = { x: 0, y: 0, z: 9.81 };
  private initialized: boolean = false;

  /**
   * Processes a sensor sample to estimate 3D gravity vector and compute orientation-independent magnitude
   */
  public process(sample: SensorSample, alpha: number): GravityResult {
    const { ax, ay, az, accelerationIncludesGravity } = sample;

    if (!accelerationIncludesGravity) {
      // Browser sensor payload ALREADY excludes gravity
      const linearAccel = { x: ax, y: ay, z: az };
      const linearMagnitude = Math.sqrt(ax * ax + ay * ay + az * az);
      return {
        gravity: { x: 0, y: 0, z: 0 },
        linearAccel,
        linearMagnitude
      };
    }

    if (!this.initialized) {
      this.gravity = { x: ax, y: ay, z: az };
      this.initialized = true;
    } else {
      // Dynamic Low-Pass Gravity Filter (Exponential Smoother)
      this.gravity.x = alpha * this.gravity.x + (1 - alpha) * ax;
      this.gravity.y = alpha * this.gravity.y + (1 - alpha) * ay;
      this.gravity.z = alpha * this.gravity.z + (1 - alpha) * az;
    }

    // Subtract estimated gravity vector from raw acceleration
    const lx = ax - this.gravity.x;
    const ly = ay - this.gravity.y;
    const lz = az - this.gravity.z;

    const linearMagnitude = Math.sqrt(lx * lx + ly * ly + lz * lz);

    return {
      gravity: { ...this.gravity },
      linearAccel: { x: lx, y: ly, z: lz },
      linearMagnitude
    };
  }

  public reset(): void {
    this.gravity = { x: 0, y: 0, z: 9.81 };
    this.initialized = false;
  }
}
