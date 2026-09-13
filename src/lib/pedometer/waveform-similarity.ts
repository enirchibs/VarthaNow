// HUMAN GAIT WAVEFORM SHAPE SIMILARITY ENGINE

export class WaveformSimilarityEngine {
  private history: number[][] = [];
  private maxHistorySize: number = 5;
  private templateLength: number = 16; // Fixed resampling points for shape comparison

  /**
   * Resamples raw sample window to fixed N-point normalized waveform array [0..1]
   */
  private normalizeWaveform(rawWindow: number[]): number[] {
    if (rawWindow.length === 0) return new Array(this.templateLength).fill(0);

    const min = Math.min(...rawWindow);
    const max = Math.max(...rawWindow);
    const range = max - min || 1;

    // Resample to templateLength points using linear interpolation
    const resampled: number[] = [];
    const step = (rawWindow.length - 1) / (this.templateLength - 1);

    for (let i = 0; i < this.templateLength; i++) {
      const index = i * step;
      const lower = Math.floor(index);
      const upper = Math.min(rawWindow.length - 1, Math.ceil(index));
      const frac = index - lower;

      const val = rawWindow[lower] * (1 - frac) + rawWindow[upper] * frac;
      resampled.push((val - min) / range); // Normalized [0..1]
    }

    return resampled;
  }

  /**
   * Calculates Pearson Normalized Cross-Correlation similarity score (0..1)
   */
  private calculateSimilarity(waveA: number[], waveB: number[]): number {
    let sumA = 0, sumB = 0;
    for (let i = 0; i < this.templateLength; i++) {
      sumA += waveA[i];
      sumB += waveB[i];
    }
    const meanA = sumA / this.templateLength;
    const meanB = sumB / this.templateLength;

    let num = 0, denA = 0, denB = 0;
    for (let i = 0; i < this.templateLength; i++) {
      const diffA = waveA[i] - meanA;
      const diffB = waveB[i] - meanB;
      num += diffA * diffB;
      denA += diffA * diffA;
      denB += diffB * diffB;
    }

    if (denA === 0 || denB === 0) return 0.5;
    const correlation = num / (Math.sqrt(denA) * Math.sqrt(denB));
    return Math.max(0, Math.min(1.0, (correlation + 1) / 2)); // Scale [-1..1] to [0..1]
  }

  /**
   * Scores a candidate waveform against accepted gait history (0..1)
   */
  public scoreCandidate(candidateWindow: number[]): number {
    const candidateNorm = this.normalizeWaveform(candidateWindow);

    if (this.history.length === 0) {
      return 0.85; // Default score when history is cold
    }

    // Average similarity across stored history templates
    let totalScore = 0;
    for (const template of this.history) {
      totalScore += this.calculateSimilarity(candidateNorm, template);
    }

    const averageScore = totalScore / this.history.length;
    return parseFloat(averageScore.toFixed(3));
  }

  /**
   * Stores an accepted step's waveform as a template
   */
  public addAcceptedWaveform(candidateWindow: number[]): void {
    const norm = this.normalizeWaveform(candidateWindow);
    this.history.push(norm);
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  public reset(): void {
    this.history = [];
  }
}
