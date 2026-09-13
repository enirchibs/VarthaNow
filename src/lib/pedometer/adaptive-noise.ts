// 🏃‍♂️ Adaptive Baseline & Noise Estimator Engine

export class AdaptiveNoiseEstimator {
  private window: number[] = [];
  private maxWindowSize: number = 40; // ~0.8 second rolling window at 50Hz
  private baseline: number = 0;
  private noiseFloor: number = 0.05;
  private noiseStd: number = 0.02;

  /**
   * Updates rolling baseline and quiescent noise floor
   */
  public update(filteredSignal: number): void {
    this.window.push(filteredSignal);
    if (this.window.length > this.maxWindowSize) {
      this.window.shift();
    }

    if (this.window.length < 5) return;

    // 1. Rolling Baseline (Mean)
    const sum = this.window.reduce((a, b) => a + b, 0);
    this.baseline = sum / this.window.length;

    // 2. Rolling Standard Deviation (Signal AC Variation)
    const squareDiffSum = this.window.reduce((acc, val) => acc + (val - this.baseline) ** 2, 0);
    const variance = squareDiffSum / this.window.length;
    const stdDev = Math.sqrt(variance);

    // 3. Quiescent Noise Floor Tracking
    // Quiescent noise when holding or sitting still is stdDev <= 0.08 m/s².
    // When walking, stdDev is > 0.12 m/s², so we freeze/decay noiseFloor to prevent walking waves from inflating threshold!
    if (stdDev <= 0.08) {
      this.noiseFloor = 0.85 * this.noiseFloor + 0.15 * stdDev;
    } else {
      this.noiseFloor = Math.max(0.04, this.noiseFloor * 0.95);
    }

    this.noiseStd = Math.max(0.02, Math.min(0.08, this.noiseFloor));
  }

  /**
   * Calculates dynamic adaptive threshold:
   * adaptiveThreshold = max(minimumThreshold, noiseFloor + K * noiseStd)
   */
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
