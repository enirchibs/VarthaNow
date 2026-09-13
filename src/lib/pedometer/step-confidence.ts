// 🏃‍♂️ Multi-Factor Step Confidence Scoring & Classification Engine
import { CandidatePeak, StepClassification } from "./types";

export interface ConfidenceInput {
  candidate: CandidatePeak;
  adaptiveThreshold: number;
  cadenceScore: number;
  waveformScore: number;
  walkingConfidence: number;
  motionArtifactScore: number;
}

export interface ConfidenceResult {
  amplitudeScore: number;
  prominenceScore: number;
  cadenceScore: number;
  waveformScore: number;
  walkingScore: number;
  inflectionScore: number;
  totalConfidence: number;
  state: StepClassification;
}

export class StepConfidenceEngine {
  public evaluateConfidence(
    input: ConfidenceInput,
    acceptThreshold: number,
    tentativeThreshold: number
  ): ConfidenceResult {
    const { candidate, adaptiveThreshold, cadenceScore, waveformScore, walkingConfidence, motionArtifactScore } = input;

    if (motionArtifactScore >= 0.50) {
      return {
        amplitudeScore: 0,
        prominenceScore: 0,
        cadenceScore: 0,
        waveformScore: 0,
        walkingScore: 0,
        inflectionScore: 0,
        totalConfidence: 0,
        state: "REJECTED"
      };
    }

    const ampRatio = candidate.peakValue / Math.max(0.15, adaptiveThreshold);
    const amplitudeScore = Math.max(0, Math.min(1.0, ampRatio * 0.75));
    const prominenceScore = Math.max(0, Math.min(1.0, candidate.prominence / 0.25));
    const boundedCadenceScore = Math.max(0, Math.min(1.0, cadenceScore));
    const boundedWaveformScore = Math.max(0, Math.min(1.0, waveformScore));
    const effectiveWalkConf = Math.max(0.60, walkingConfidence);
    const walkingScore = Math.max(0, Math.min(1.0, effectiveWalkConf * (1.0 - motionArtifactScore)));
    const symmetry = 1.0 - Math.min(1.0, Math.abs(candidate.riseTimeMs - candidate.fallTimeMs) / Math.max(1, candidate.widthMs));
    const inflectionScore = Math.max(0, Math.min(1.0, symmetry));

    let rawConfidence = 
      0.25 * amplitudeScore +
      0.25 * prominenceScore +
      0.20 * boundedCadenceScore +
      0.15 * boundedWaveformScore +
      0.15 * walkingScore;

    // Strict Cadence Gating: If candidate cadence is invalid (e.g. harmonic rebound or hand shake >12Hz), collapse confidence
    if (boundedCadenceScore < 0.25) {
      rawConfidence *= Math.max(0.10, boundedCadenceScore * 2.0);
    }

    const totalConfidence = parseFloat(Math.max(0, Math.min(1.0, rawConfidence - motionArtifactScore * 0.3)).toFixed(3));

    let state: StepClassification = "REJECTED";
    if (totalConfidence >= acceptThreshold) {
      state = "CONFIRMED";
    } else if (totalConfidence >= tentativeThreshold) {
      state = "TENTATIVE";
    } else {
      state = "REJECTED";
    }

    return {
      amplitudeScore: parseFloat(amplitudeScore.toFixed(3)),
      prominenceScore: parseFloat(prominenceScore.toFixed(3)),
      cadenceScore: parseFloat(boundedCadenceScore.toFixed(3)),
      waveformScore: parseFloat(boundedWaveformScore.toFixed(3)),
      walkingScore: parseFloat(walkingScore.toFixed(3)),
      inflectionScore: parseFloat(inflectionScore.toFixed(3)),
      totalConfidence,
      state
    };
  }
}
