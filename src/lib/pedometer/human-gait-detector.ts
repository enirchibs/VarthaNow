// 🏃‍♂️ Dedicated Human Gait Recognition & Feature Extraction Detector

export interface GaitFeatures {
  motionEnergy: number;
  periodicityScore: number;
  cadenceSPM: number;
  cadenceVariance: number;
  peakProminence: number;
  waveformSimilarity: number;
  signalQuality: number;
  walkingConfidence: number;
}

export class HumanGaitDetector {
  private cadenceHistory: number[] = [];
  private maxHistory: number = 8;

  public evaluateGait(
    motionEnergyRMS: number,
    candidateProminence: number,
    cadenceSPM: number,
    waveformScore: number,
    samplingRateHz: number
  ): GaitFeatures {
    // 1. Signal Quality Score (0..1)
    const signalQuality = (samplingRateHz >= 25 && samplingRateHz <= 120) ? 0.95 : 0.60;

    // 2. Periodicity Score (0..1): Check if cadence SPM is in human walking range (40 - 200 SPM)
    let periodicityScore = 0;
    if (cadenceSPM >= 40 && cadenceSPM <= 200) {
      periodicityScore = 0.90;
    } else if (cadenceSPM > 200) {
      periodicityScore = 0.30;
    } else {
      periodicityScore = 0.40;
    }

    // 3. Cadence Variance
    this.cadenceHistory.push(cadenceSPM);
    if (this.cadenceHistory.length > this.maxHistory) {
      this.cadenceHistory.shift();
    }

    let cadenceVariance = 0;
    if (this.cadenceHistory.length > 2) {
      const mean = this.cadenceHistory.reduce((a, b) => a + b, 0) / this.cadenceHistory.length;
      cadenceVariance = this.cadenceHistory.reduce((acc, val) => acc + (val - mean) ** 2, 0) / this.cadenceHistory.length;
    }

    // Low variance in cadence indicates steady human walking gait
    const cadenceStabilityScore = Math.max(0, 1.0 - Math.min(1.0, cadenceVariance / 400));

    // 4. Combined Walking Confidence Score (0..1)
    const rawWalkConf = 
      0.30 * periodicityScore +
      0.25 * waveformScore +
      0.25 * cadenceStabilityScore +
      0.20 * Math.min(1.0, candidateProminence / 0.35);

    const walkingConfidence = parseFloat((rawWalkConf * signalQuality).toFixed(3));

    return {
      motionEnergy: parseFloat(motionEnergyRMS.toFixed(3)),
      periodicityScore: parseFloat(periodicityScore.toFixed(3)),
      cadenceSPM,
      cadenceVariance: parseFloat(cadenceVariance.toFixed(2)),
      peakProminence: parseFloat(candidateProminence.toFixed(3)),
      waveformSimilarity: parseFloat(waveformScore.toFixed(3)),
      signalQuality,
      walkingConfidence
    };
  }

  public reset(): void {
    this.cadenceHistory = [];
  }
}
