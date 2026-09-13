// 🏃‍♂️ Inflection Crest & Trough Peak-Valley Detector with Prominence Analysis
import { CandidatePeak } from "./types";

export class PeakValleyDetector {
  private signalBuffer: { value: number; timestamp: number }[] = [];
  private maxBufferSize: number = 30;
  private lastValley: { value: number; timestamp: number } = { value: 0, timestamp: 0 };
  private isRising: boolean = true;
  private lastAcceptedTimestamp: number = 0;

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
    const curr = this.signalBuffer[n - 2].value;
    const next = this.signalBuffer[n - 1].value;
    const currTime = this.signalBuffer[n - 2].timestamp;

    if (curr <= prev && curr <= next) {
      if (!this.isRising || curr < this.lastValley.value) {
        this.lastValley = { value: curr, timestamp: currTime };
      }
      this.isRising = true;
    }

    if (curr >= prev && curr > next && this.isRising) {
      this.isRising = false;
      const peakVal = curr;
      const peakTime = currTime;

      if (this.lastAcceptedTimestamp > 0 && (peakTime - this.lastAcceptedTimestamp < minStepIntervalMs)) {
        return null;
      }

      const leftValleyVal = this.lastValley.value;
      const leftValleyTime = this.lastValley.timestamp;

      const prominence = peakVal - leftValleyVal;

      const riseTimeMs = peakTime - leftValleyTime;
      const fallTimeMs = timestamp - peakTime;
      const widthMs = riseTimeMs + fallTimeMs;

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
