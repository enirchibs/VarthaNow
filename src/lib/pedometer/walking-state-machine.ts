// 🏃‍♂️ Walking State Machine & Walking Confidence Score Decay/Buildup Engine
import { WalkingState, MotionCategory } from "./types";

export class WalkingStateMachine {
  private currentState: WalkingState = "STATIONARY";
  private walkingConfidence: number = 0.0;
  private candidateCount: number = 0;
  private lastMotionTimestamp: number = 0;

  /**
   * Updates walking state machine and manages walking confidence score (0..1)
   */
  public update(
    motionCategory: MotionCategory,
    isCandidateDetected: boolean,
    candidateConfidence: number,
    walkingLockThreshold: number
  ): { currentState: WalkingState; walkingConfidence: number } {
    const now = Date.now();

    // 1. Sitting & Standing Protection: Decay walking confidence when stationary or irregular
    if (motionCategory === "STATIONARY") {
      this.candidateCount = 0;
      this.walkingConfidence = Math.max(0.0, this.walkingConfidence - 0.08); // Gradual decay
      if (this.walkingConfidence < 0.2) {
        this.currentState = "STATIONARY";
      }
      return { currentState: this.currentState, walkingConfidence: this.walkingConfidence };
    }

    if (motionCategory === "LOW_MOVEMENT") {
      this.walkingConfidence = Math.max(0.0, this.walkingConfidence - 0.04);
      if (this.walkingConfidence < 0.3) {
        this.currentState = "MOTION_DETECTED";
      }
    }

    // 2. Candidate Step Processed
    if (isCandidateDetected) {
      this.lastMotionTimestamp = now;
      this.candidateCount++;

      // Increase walking confidence based on candidate quality
      const boost = 0.15 + (candidateConfidence * 0.15);
      this.walkingConfidence = Math.min(1.0, this.walkingConfidence + boost);

      // State Transitions
      if (this.candidateCount === 1) {
        this.currentState = "MOTION_DETECTED";
      } else if (this.candidateCount === 2) {
        this.currentState = "CANDIDATE_WALKING";
      } else if (this.candidateCount >= 3 && this.walkingConfidence >= walkingLockThreshold) {
        this.currentState = motionCategory === "FAST_WALKING" ? "FAST_WALKING" : "WALKING";
      }
    } else {
      // Check for motion pause timeout (> 2.0 seconds since last candidate)
      if (this.lastMotionTimestamp > 0 && (now - this.lastMotionTimestamp > 2000)) {
        this.candidateCount = 0;
        this.walkingConfidence = Math.max(0.0, this.walkingConfidence - 0.10);
        if (this.walkingConfidence < 0.3) {
          this.currentState = "RECOVERY";
        }
      }
    }

    return {
      currentState: this.currentState,
      walkingConfidence: parseFloat(this.walkingConfidence.toFixed(3))
    };
  }

  public getCurrentState(): WalkingState {
    return this.currentState;
  }

  public getWalkingConfidence(): number {
    return this.walkingConfidence;
  }

  public reset(): void {
    this.currentState = "STATIONARY";
    this.walkingConfidence = 0.0;
    this.candidateCount = 0;
    this.lastMotionTimestamp = 0;
  }
}
