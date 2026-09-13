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
  /**
   * Calculates multi-factor weighted step confidence score (0..1)
   */
  public evaluateConfidence(
    input: ConfidenceInput,
    acceptThreshold: number,
    tentativeThreshold: number
  ): ConfidenceResult {
    const { candidate, adaptiveThreshold, cadenceScore, waveformScore, walkingConfidence, motionArtifactScore } = input;

    // Reject immediately if heavy motor/vehicle motion artifact is detected
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

    // 1. Amplitude Score (20%): Height above adaptive threshold
    const ampRatio = candidate.peakValue / Math.max(0.15, adaptiveThreshold);
    const amplitudeScore = Math.max(0, Math.min(1.0, ampRatio * 0.75));

    // 2. Peak Prominence Score (20%): Crest height above local valleys
    const prominenceScore = Math.max(0, Math.min(1.0, candidate.prominence / 0.25));

    // 3. Cadence Score (20%): Temporal consistency with walking rhythm
    const boundedCadenceScore = Math.max(0, Math.min(1.0, cadenceScore));

    // 4. Waveform Shape Similarity Score (15%)
    const boundedWaveformScore = Math.max(0, Math.min(1.0, waveformScore));

    // 5. Walking State Score (15%): Gait confidence score
    const effectiveWalkConf = Math.max(0.60, walkingConfidence);
    const walkingScore = Math.max(0, Math.min(1.0, effectiveWalkConf * (1.0 - motionArtifactScore)));

    // 6. Inflection Quality Score (10%): Symmetry of rise/fall time and crest width
    const symmetry = 1.0 - Math.min(1.0, Math.abs(candidate.riseTimeMs - candidate.fallTimeMs) / Math.max(1, candidate.widthMs));
    const inflectionScore = Math.max(0, Math.min(1.0, symmetry));

    // Multi-factor weighted sum (0..1)
    const rawConfidence = 
      0.20 * amplitudeScore +
      0.20 * prominenceScore +
      0.20 * boundedCadenceScore +
      0.15 * boundedWaveformScore +
      0.15 * walkingScore +
      0.10 * inflectionScore;

    // Penalize if motion artifacts detected
    const totalConfidence = parseFloat(Math.max(0, Math.min(1.0, rawConfidence - motionArtifactScore * 0.3)).toFixed(3));

    // State Classification Rules:
    // >= acceptThreshold -> CONFIRMED
    // tentativeThreshold..acceptThreshold -> TENTATIVE
    // < tentativeThreshold -> REJECTED
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
