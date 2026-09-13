// 🏃‍♂️ Inflection Crest & Trough Peak-Valley Detector with Prominence Analysis
import { CandidatePeak } from "./types";

export class PeakValleyDetector {
  private signalBuffer: { value: number; timestamp: number }[] = [];
  private maxBufferSize: number = 30; // ~0.6 seconds buffer
  private lastValley: { value: number; timestamp: number } = { value: 0, timestamp: 0 };
  private isRising: boolean = true;
  private lastAcceptedTimestamp: number = 0;

  /**
   * Evaluates incoming filtered signal samples to detect candidate step peaks
   */
  public process(
    filteredSignal: number,
    timestamp: number,
    minThreshold: number,
    minStepIntervalMs: number
  ): CandidatePeak | null {
    this.signalBuffer.push({ value: filteredSignal, timestamp });
    if (this.signalBuffer.length > this.maxBufferSize) {
      this.signalBuffer.shift();
    }

    if (this.signalBuffer.length < 3) return null;

    const n = this.signalBuffer.length;
    const prev = this.signalBuffer[n - 3].value;
    const curr = this.signalBuffer[n - 2].value; // Center point under test
    const next = this.signalBuffer[n - 1].value;
    const currTime = this.signalBuffer[n - 2].timestamp;

    // Detect Valley (Local Minimum): curr is strictly lower than prev or next, and is in falling transition
    if (curr <= prev && curr <= next) {
      if (!this.isRising || curr < this.lastValley.value) {
        this.lastValley = { value: curr, timestamp: currTime };
      }
      this.isRising = true;
    }

    // Detect Peak (Local Maximum): curr is strictly higher than prev and next, and follows rising transition
    if (curr >= prev && curr > next && this.isRising) {
      this.isRising = false;
      const peakVal = curr;
      const peakTime = currTime;

      // Refractory Period: Must be >= minStepIntervalMs since last accepted step
      if (this.lastAcceptedTimestamp > 0 && (peakTime - this.lastAcceptedTimestamp < minStepIntervalMs)) {
        return null;
      }

      // Calculate Left Valley Bounds & True Prominence (height above preceding gait trough)
      const leftValleyVal = this.lastValley.value;
      const leftValleyTime = this.lastValley.timestamp;

      const prominence = peakVal - leftValleyVal;

      const riseTimeMs = peakTime - leftValleyTime;
      const fallTimeMs = timestamp - peakTime;
      const widthMs = riseTimeMs + fallTimeMs;

      // Basic Threshold Check: Must meet adaptive noise threshold and minimum prominence
      if (peakVal < minThreshold * 0.50 || prominence < 0.08) {
        return null;
      }

      const candidate: CandidatePeak = {
        timestamp: peakTime,
        peakValue: peakVal,
        leftValleyValue: leftValleyVal,
        rightValleyValue: leftValleyVal,
        leftValleyTime,
        rightValleyTime: timestamp,
        prominence,
        riseTimeMs,
        fallTimeMs,
        widthMs
      };

      return candidate;
    }

    return null;
  }

  public recordAcceptedStep(timestamp: number): void {
    this.lastAcceptedTimestamp = timestamp;
  }

  public reset(): void {
    this.signalBuffer = [];
    this.lastValley = { value: 0, timestamp: 0 };
    this.isRising = true;
    this.lastAcceptedTimestamp = 0;
  }
}
