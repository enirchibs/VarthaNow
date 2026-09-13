// 🏃‍♂️ Adaptive Cadence Tracker & Cadence Consistency Scoring Engine

export class AdaptiveCadenceTracker {
  private acceptedTimestamps: number[] = [];
  private maxHistorySize: number = 6;
  private estimatedIntervalMs: number = 550; // Default ~109 SPM (~550ms)
  private cadenceSPM: number = 109;
  private isInitialized: boolean = false;

  /**
   * Evaluates cadence score for a candidate timestamp without committing state
   */
  public evaluateCandidateCadence(
    candidateTimestamp: number,
    minIntervalMs: number,
    maxIntervalMs: number
  ): { candidateIntervalMs: number; cadenceScore: number } {
    if (this.acceptedTimestamps.length === 0) {
      return {
        candidateIntervalMs: this.estimatedIntervalMs,
        cadenceScore: 0.85 // Initial step gets strong neutral score
      };
    }

    const lastTimestamp = this.acceptedTimestamps[this.acceptedTimestamps.length - 1];
    const candidateIntervalMs = candidateTimestamp - lastTimestamp;

    // Check broad physiological bounds (300ms to 1500ms)
    if (candidateIntervalMs < minIntervalMs || candidateIntervalMs > maxIntervalMs) {
      return {
        candidateIntervalMs,
        cadenceScore: candidateIntervalMs > maxIntervalMs ? 0.60 : 0.20
      };
    }

    // Measure deviation from current estimated cadence
    const deviationRatio = Math.abs(candidateIntervalMs - this.estimatedIntervalMs) / this.estimatedIntervalMs;
    // Allow natural human gait variance (~30% tolerance)
    const cadenceScore = Math.max(0.10, Math.min(1.0, 1.0 - deviationRatio * 1.8));

    return {
      candidateIntervalMs,
      cadenceScore: parseFloat(cadenceScore.toFixed(3))
    };
  }

  /**
   * Commits a confirmed step timestamp to update dynamic cadence
   */
  public recordAcceptedStep(
    acceptedTimestamp: number,
    adaptationFactor: number
  ): void {
    if (this.acceptedTimestamps.length > 0) {
      const lastTimestamp = this.acceptedTimestamps[this.acceptedTimestamps.length - 1];
      const intervalMs = acceptedTimestamp - lastTimestamp;

      if (intervalMs >= 250 && intervalMs <= 2000) {
        if (!this.isInitialized && this.acceptedTimestamps.length >= 2) {
          const intervals: number[] = [];
          for (let i = 1; i < this.acceptedTimestamps.length; i++) {
            intervals.push(this.acceptedTimestamps[i] - this.acceptedTimestamps[i - 1]);
          }
          intervals.push(intervalMs);
          intervals.sort((a, b) => a - b);
          this.estimatedIntervalMs = intervals[Math.floor(intervals.length / 2)];
          this.isInitialized = true;
        } else if (this.isInitialized) {
          // EMA Adaptation: estimated = (1-k)*prev + k*curr
          this.estimatedIntervalMs = (1 - adaptationFactor) * this.estimatedIntervalMs + adaptationFactor * intervalMs;
        } else {
          this.estimatedIntervalMs = intervalMs;
        }
        this.cadenceSPM = Math.round(60000 / Math.max(250, this.estimatedIntervalMs));
      }
    }

    this.acceptedTimestamps.push(acceptedTimestamp);
    if (this.acceptedTimestamps.length > this.maxHistorySize) {
      this.acceptedTimestamps.shift();
    }
  }

  public getEstimatedIntervalMs(): number {
    return this.estimatedIntervalMs;
  }

  public getCadenceSPM(): number {
    return this.cadenceSPM;
  }

  public reset(): void {
    this.acceptedTimestamps = [];
    this.estimatedIntervalMs = 550;
    this.cadenceSPM = 109;
    this.isInitialized = false;
  }
}
