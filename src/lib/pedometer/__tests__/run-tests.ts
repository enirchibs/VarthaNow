// 🏃‍♂️ Real-Time Physical Step-Synchronized Pedometer Engine Synthetic Test Suite
import { AdaptiveStepEngine } from "../adaptive-step-engine";
import { SensorSample } from "../types";

interface TestResult {
  name: string;
  expectedSteps: number;
  detectedSteps: number;
  passed: boolean;
  notes: string;
}

/**
 * Generates synthetic sinusoidal walking acceleration waveform with realistic biomechanical harmonics
 */
function generateWalkingTrace(
  numPhysicalSteps: number,
  stepIntervalMs: number,
  peakAmplitude: number = 2.2,
  sampleRateHz: number = 50
): SensorSample[] {
  const samples: SensorSample[] = [];
  const dtMs = 1000 / sampleRateHz;
  const totalDurationMs = numPhysicalSteps * stepIntervalMs;
  let tMs = 0;

  while (tMs < totalDurationMs) {
    const cycleTimeMs = tMs % stepIntervalMs;
    const phase = (cycleTimeMs / stepIntervalMs) * 2 * Math.PI;

    // Biomechanical vertical acceleration model: fundamental gait wave + 2nd harmonic
    const gaitAccel = Math.sin(phase) * peakAmplitude + Math.sin(2 * phase) * (peakAmplitude * 0.35);
    const zAccel = 9.81 + Math.max(0, gaitAccel); // Gravity + dynamic gait thrust
    const xAccel = Math.cos(phase * 0.5) * 0.4;
    const yAccel = Math.sin(phase * 0.5) * 0.3;

    samples.push({
      timestamp: 1700000000000 + Math.floor(tMs),
      ax: xAccel,
      ay: yAccel,
      az: zAccel,
      accelerationIncludesGravity: true
    });

    tMs += dtMs;
  }

  return samples;
}

/**
 * Generates synthetic noise / vibration / rotation trace
 */
function generateNoiseTrace(
  type: "STATIONARY" | "VEHICLE" | "HAND_SHAKE" | "ORIENTATION_CHANGE",
  durationMs: number = 10000,
  sampleRateHz: number = 50
): SensorSample[] {
  const samples: SensorSample[] = [];
  const dtMs = 1000 / sampleRateHz;
  let tMs = 0;

  while (tMs < durationMs) {
    let ax = 0, ay = 0, az = 9.81;

    if (type === "STATIONARY") {
      // Minor sensor thermal noise
      ax = (Math.random() - 0.5) * 0.05;
      ay = (Math.random() - 0.5) * 0.05;
      az = 9.81 + (Math.random() - 0.5) * 0.05;
    } else if (type === "VEHICLE") {
      // High-frequency engine vibration (25Hz micro oscillations, jerk > 25 m/s³)
      const vibe = Math.sin((tMs / 1000) * 25 * 2 * Math.PI) * 0.8;
      ax = (Math.random() - 0.5) * 0.2;
      ay = (Math.random() - 0.5) * 0.2;
      az = 9.81 + vibe;
    } else if (type === "HAND_SHAKE") {
      // Irregular rapid hand gestures
      const burst = Math.sin((tMs / 1000) * 12 * 2 * Math.PI) * 1.5;
      ax = burst * 0.8;
      ay = (Math.random() - 0.5) * 1.2;
      az = 9.81 + (Math.random() - 0.5) * 0.8;
    } else if (type === "ORIENTATION_CHANGE") {
      // Smooth 90 degree device rotation over 2 seconds
      const progress = Math.min(1.0, tMs / 2000);
      const angle = progress * (Math.PI / 2);
      ax = Math.sin(angle) * 9.81;
      az = Math.cos(angle) * 9.81;
      ay = 0.1;
    }

    samples.push({
      timestamp: 1700000000000 + Math.floor(tMs),
      ax,
      ay,
      az,
      accelerationIncludesGravity: true
    });

    tMs += dtMs;
  }

  return samples;
}

export function runTestSuite(): TestResult[] {
  const results: TestResult[] = [];

  // Test 1: Normal Walking Gait (100 physical steps)
  {
    const engine = new AdaptiveStepEngine();
    const trace = generateWalkingTrace(100, 550, 2.2); // ~110 SPM
    let detected = 0;
    trace.forEach((s) => {
      const evt = engine.processSample(s);
      if (evt) detected++;
    });
    const errorPct = Math.abs(detected - 100) / 100 * 100;
    const passed = errorPct <= 8; // Allow 92 - 108 steps
    results.push({
      name: "1. Normal Walking Gait (100 Physical Steps @ 110 SPM)",
      expectedSteps: 100,
      detectedSteps: detected,
      passed,
      notes: `Detected ${detected}/100 steps (Error: ${errorPct.toFixed(1)}%)`
    });
  }

  // Test 2: Slow Walking Gait (100 physical steps @ ~70 SPM)
  {
    const engine = new AdaptiveStepEngine();
    const trace = generateWalkingTrace(100, 850, 1.4); // ~70 SPM, lower amplitude
    let detected = 0;
    trace.forEach((s) => {
      const evt = engine.processSample(s);
      if (evt) detected++;
    });
    const errorPct = Math.abs(detected - 100) / 100 * 100;
    const passed = errorPct <= 10; // Allow 90 - 110 steps
    results.push({
      name: "2. Slow Walking Gait (100 Physical Steps @ 70 SPM)",
      expectedSteps: 100,
      detectedSteps: detected,
      passed,
      notes: `Detected ${detected}/100 steps (Error: ${errorPct.toFixed(1)}%)`
    });
  }

  // Test 3: Fast Walking / Jogging Gait (100 physical steps @ ~158 SPM)
  {
    const engine = new AdaptiveStepEngine();
    const trace = generateWalkingTrace(100, 380, 3.5); // ~158 SPM
    let detected = 0;
    trace.forEach((s) => {
      const evt = engine.processSample(s);
      if (evt) detected++;
    });
    const errorPct = Math.abs(detected - 100) / 100 * 100;
    const passed = errorPct <= 8;
    results.push({
      name: "3. Fast Walking / Jogging Gait (100 Physical Steps @ 158 SPM)",
      expectedSteps: 100,
      detectedSteps: detected,
      passed,
      notes: `Detected ${detected}/100 steps (Error: ${errorPct.toFixed(1)}%)`
    });
  }

  // Test 4: Stationary Pocket Jitter (0 physical steps)
  {
    const engine = new AdaptiveStepEngine();
    const trace = generateNoiseTrace("STATIONARY", 10000);
    let detected = 0;
    trace.forEach((s) => {
      const evt = engine.processSample(s);
      if (evt) detected++;
    });
    const passed = detected === 0;
    results.push({
      name: "4. Stationary / Pocket Jitter Rejection",
      expectedSteps: 0,
      detectedSteps: detected,
      passed,
      notes: `Detected ${detected} false steps (Target: 0)`
    });
  }

  // Test 5: Vehicle Engine Vibration Rejection (0 physical steps)
  {
    const engine = new AdaptiveStepEngine();
    const trace = generateNoiseTrace("VEHICLE", 10000);
    let detected = 0;
    trace.forEach((s) => {
      const evt = engine.processSample(s);
      if (evt) detected++;
    });
    const passed = detected === 0;
    results.push({
      name: "5. Vehicle Micro-Vibration Rejection",
      expectedSteps: 0,
      detectedSteps: detected,
      passed,
      notes: `Detected ${detected} false steps (Target: 0)`
    });
  }

  // Test 6: Hand Shake / Tapping Rejection (0 physical steps)
  {
    const engine = new AdaptiveStepEngine();
    const trace = generateNoiseTrace("HAND_SHAKE", 10000);
    let detected = 0;
    trace.forEach((s) => {
      const evt = engine.processSample(s);
      if (evt) detected++;
    });
    const passed = detected === 0;
    results.push({
      name: "6. Hand Shake & Device Tapping Rejection",
      expectedSteps: 0,
      detectedSteps: detected,
      passed,
      notes: `Detected ${detected} false steps (Target: 0)`
    });
  }

  // Test 7: Phone Orientation Shift Rejection (0 physical steps)
  {
    const engine = new AdaptiveStepEngine();
    const trace = generateNoiseTrace("ORIENTATION_CHANGE", 5000);
    let detected = 0;
    trace.forEach((s) => {
      const evt = engine.processSample(s);
      if (evt) detected++;
    });
    const passed = detected === 0;
    results.push({
      name: "7. Phone Orientation Shift & Gravity Rotation Rejection",
      expectedSteps: 0,
      detectedSteps: detected,
      passed,
      notes: `Detected ${detected} false steps (Target: 0)`
    });
  }

  return results;
}

// Execution block for CLI runner
console.log("================================================================================");
console.log("🏃‍♂️ STEP DETECTION ENGINE SYNTHETIC & GAIT VERIFICATION SUITE");
console.log("================================================================ shower \n");

const testResults = runTestSuite();
let totalPassed = 0;

testResults.forEach((res) => {
  const statusMark = res.passed ? "✅ [PASS]" : "❌ [FAIL]";
  if (res.passed) totalPassed++;
  console.log(`${statusMark} ${res.name}`);
  console.log(`   Details: ${res.notes}\n`);
});

console.log("--------------------------------------------------------------------------------");
console.log(`SUMMARY: ${totalPassed}/${testResults.length} Tests Passed (${((totalPassed/testResults.length)*100).toFixed(0)}%)\n`);

if (totalPassed < testResults.length) {
  process.exit(1);
}
