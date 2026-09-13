// 🏃‍♂️ Sampling-Rate Aware Exponential Moving Average (EMA) Low-Pass Filter

export class EMAFilter {
  private filteredValue: number = 0;
  private initialized: boolean = false;

  /**
   * Filters the raw signal taking into account the effective sampling frequency (Fs)
   */
  public filter(rawSignal: number, defaultBeta: number, samplingRateHz: number): { rawSignal: number; filteredSignal: number } {
    if (!this.initialized) {
      this.filteredValue = rawSignal;
      this.initialized = true;
      return { rawSignal, filteredSignal: rawSignal };
    }

    // Sampling-rate scaling factor: Normalize beta around 50 Hz reference
    // Ensures equivalent low-pass cutoff frequency regardless of whether Fs is 30Hz, 60Hz, or 100Hz
    const referenceFs = 50;
    const fsRatio = samplingRateHz / referenceFs;
    const effectiveBeta = Math.pow(defaultBeta, Math.max(0.2, Math.min(3.0, fsRatio)));

    // EMA formula: filtered = beta * current + (1 - beta) * previous
    this.filteredValue = effectiveBeta * rawSignal + (1 - effectiveBeta) * this.filteredValue;

    return {
      rawSignal,
      filteredSignal: this.filteredValue
    };
  }

  public getFilteredValue(): number {
    return this.filteredValue;
  }

  public reset(): void {
    this.filteredValue = 0;
    this.initialized = false;
  }
}
