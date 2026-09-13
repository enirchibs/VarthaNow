// 🏃‍♂️ Adaptive Cadence Tracker & Cadence Consistency Scoring Engine

export class AdaptiveCadenceTracker {
  private acceptedTimestamps: number[] = [];
  private maxHistorySize: number = 6;
  private estimatedIntervalMs: number = 600;
  private cadenceSPM: number = 100;
  private isInitialized: boolean = false;

  public evaluateCandidateCadence(
    candidateTimestamp: number,
    minIntervalMs: number,
    maxIntervalMs: number,
    peakAmplitude: number = 2.0
  ): { candidateIntervalMs: number; cadenceScore: number } {
    if (this.acceptedTimestamps.length === 0) {
      return {
        candidateIntervalMs: this.estimatedIntervalMs,
        cadenceScore: 0.85
      };
    }

    const lastTimestamp = this.acceptedTimestamps[this.acceptedTimestamps.length - 1];
    const candidateIntervalMs = candidateTimestamp - lastTimestamp;

    if (candidateIntervalMs < minIntervalMs || candidateIntervalMs > maxIntervalMs) {
      return {
        candidateIntervalMs,
        cadenceScore: candidateIntervalMs > maxIntervalMs ? 0.60 : 0.05
      };
    }

    // Biomechanical Harmonic Rebound Gate:
    // Low amplitude (< 1.8 m/s²) with short interval (< 500ms) indicates a secondary harmonic rebound crest of a slow walk!
    if (candidateIntervalMs < 500 && peakAmplitude < 1.8) {
      return {
        candidateIntervalMs,
        cadenceScore: 0.05
      };
    }

    if (this.isInitialized && this.estimatedIntervalMs > 600) {
      const halfInterval = this.estimatedIntervalMs * 0.5;
      const distFromHalf = Math.abs(candidateIntervalMs - halfInterval) / halfInterval;
      if (distFromHalf < 0.35 || candidateIntervalMs < 480) {
        return {
          candidateIntervalMs,
          cadenceScore: 0.05
        };
      }
    }

    const deviationRatio = Math.abs(candidateIntervalMs - this.estimatedIntervalMs) / this.estimatedIntervalMs;
    const cadenceScore = Math.max(0.10, Math.min(1.0, 1.0 - deviationRatio * 1.8));

    return {
      candidateIntervalMs,
      cadenceScore: parseFloat(cadenceScore.toFixed(3))
    };
  }

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
    this.estimatedIntervalMs = 600;
    this.cadenceSPM = 100;
    this.isInitialized = false;
  }
}
