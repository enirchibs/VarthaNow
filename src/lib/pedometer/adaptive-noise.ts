// 🏃‍♂️ Adaptive Baseline & Noise Estimator Engine

export class AdaptiveNoiseEstimator {
  private window: number[] = [];
  private maxWindowSize: number = 40;
  private baseline: number = 0;
  private noiseFloor: number = 0.05;
  private noiseStd: number = 0.02;

  public update(filteredSignal: number): void {
    this.window.push(filteredSignal);
    if (this.window.length > this.maxWindowSize) {
      this.window.shift();
    }

    if (this.window.length < 5) return;

    const sum = this.window.reduce((a, b) => a + b, 0);
    this.baseline = sum / this.window.length;

    const squareDiffSum = this.window.reduce((acc, val) => acc + (val - this.baseline) ** 2, 0);
    const variance = squareDiffSum / this.window.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev <= 0.08) {
      this.noiseFloor = 0.85 * this.noiseFloor + 0.15 * stdDev;
    } else {
      this.noiseFloor = Math.max(0.04, this.noiseFloor * 0.95);
    }

    this.noiseStd = Math.max(0.02, Math.min(0.08, this.noiseFloor));
  }

  public getAdaptiveThreshold(minThreshold: number, noiseMultiplier: number): number {
    const dynamicThreshold = this.noiseFloor + noiseMultiplier * this.noiseStd;
    return Math.max(minThreshold, dynamicThreshold);
  }

  public getBaseline(): number {
    return this.baseline;
  }

  public getNoiseFloor(): number {
    return this.noiseFloor;
  }

  public getNoiseStd(): number {
    return this.noiseStd;
  }

  public reset(): void {
    this.window = [];
    this.baseline = 0;
    this.noiseFloor = 0.05;
    this.noiseStd = 0.02;
  }
}
