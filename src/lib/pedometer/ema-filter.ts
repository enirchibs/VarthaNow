// 🏃‍♂️ Sampling-Rate Aware Exponential Moving Average (EMA) Low-Pass Filter

export class EMAFilter {
  private filteredValue: number = 0;
  private initialized: boolean = false;

  public filter(rawSignal: number, defaultBeta: number, samplingRateHz: number): { rawSignal: number; filteredSignal: number } {
    if (!this.initialized) {
      this.filteredValue = rawSignal;
      this.initialized = true;
      return { rawSignal, filteredSignal: rawSignal };
    }

    const referenceFs = 50;
    const fsRatio = samplingRateHz / referenceFs;
    const effectiveBeta = Math.pow(defaultBeta, Math.max(0.2, Math.min(3.0, fsRatio)));

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
