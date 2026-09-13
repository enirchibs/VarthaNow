// 🏃‍♂️ Simple Real-Time Mobile Step Counter - Synthetic Test Runner
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
 * Generates synthetic sinusoidal walking acceleration trace
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

    const gaitAccel = Math.sin(phase) * peakAmplitude + Math.sin(2 * phase) * (peakAmplitude * 0.35);
    const zAccel = 9.81 + Math.max(0, gaitAccel);
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
      ax = (Math.random() - 0.5) * 0.05;
      ay = (Math.random() - 0.5) * 0.05;
      az = 9.81 + (Math.random() - 0.5) * 0.05;
    } else if (type === "VEHICLE") {
      const vibe = Math.sin((tMs / 1000) * 25 * 2 * Math.PI) * 0.8;
      ax = (Math.random() - 0.5) * 0.2;
      ay = (Math.random() - 0.5) * 0.2;
      az = 9.81 + vibe;
    } else if (type === "HAND_SHAKE") {
      const burst = Math.sin((tMs / 1000) * 12 * 2 * Math.PI) * 1.5;
      ax = burst * 0.8;
      ay = (Math.random() - 0.5) * 1.2;
      az = 9.81 + (Math.random() - 0.5) * 0.8;
    } else if (type === "ORIENTATION_CHANGE") {
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

  // Helper for running walking test
  const runWalkTest = (name: string, targetSteps: number, intervalMs: number, amp: number, allowedErrPct: number) => {
    const engine = new AdaptiveStepEngine();
    const trace = generateWalkingTrace(targetSteps, intervalMs, amp);
    let detected = 0;
    trace.forEach((s) => {
      const evt = engine.processSample(s);
      if (evt) detected++;
    });
    const errorPct = Math.abs(detected - targetSteps) / targetSteps * 100;
    const passed = errorPct <= allowedErrPct;
    results.push({
      name,
      expectedSteps: targetSteps,
      detectedSteps: detected,
      passed,
      notes: `Detected ${detected}/${targetSteps} steps (Error: ${errorPct.toFixed(1)}%)`
    });
  };

  // Test 1: 10 Physical Steps
  runWalkTest("1. Physical Walk Benchmark (10 Steps @ 110 SPM)", 10, 550, 2.2, 10);

  // Test 2: 50 Physical Steps
  runWalkTest("2. Physical Walk Benchmark (50 Steps @ 110 SPM)", 50, 550, 2.2, 6);

  // Test 3: 100 Physical Steps
  runWalkTest("3. Physical Walk Benchmark (100 Steps @ 110 SPM)", 100, 550, 2.2, 5);

  // Test 4: 500 Physical Steps
  runWalkTest("4. Physical Walk Benchmark (500 Steps @ 110 SPM)", 500, 550, 2.2, 4);

  // Test 5: 1000 Physical Steps
  runWalkTest("5. Physical Walk Benchmark (1000 Steps @ 110 SPM)", 1000, 550, 2.2, 3);

  // Test 6: Slow Walk (100 steps @ 70 SPM)
  runWalkTest("6. Slow Walking Gait (100 Steps @ 70 SPM)", 100, 850, 1.4, 10);

  // Test 7: Fast Walk (100 steps @ 158 SPM)
  runWalkTest("7. Fast Walking Gait (100 Steps @ 158 SPM)", 100, 380, 3.5, 8);

  // Test 8: Stationary Jitter (0 steps)
  {
    const engine = new AdaptiveStepEngine();
    const trace = generateNoiseTrace("STATIONARY", 10000);
    let detected = 0;
    trace.forEach((s) => {
      if (engine.processSample(s)) detected++;
    });
    results.push({
      name: "8. Stationary / Pocket Jitter Rejection",
      expectedSteps: 0,
      detectedSteps: detected,
      passed: detected === 0,
      notes: `Detected ${detected} false steps (Target: 0)`
    });
  }

  // Test 9: Vehicle Vibration (0 steps)
  {
    const engine = new AdaptiveStepEngine();
    const trace = generateNoiseTrace("VEHICLE", 10000);
    let detected = 0;
    trace.forEach((s) => {
      if (engine.processSample(s)) detected++;
    });
    results.push({
      name: "9. Vehicle Engine Micro-Vibration Rejection",
      expectedSteps: 0,
      detectedSteps: detected,
      passed: detected === 0,
      notes: `Detected ${detected} false steps (Target: 0)`
    });
  }

  // Test 10: Hand Shake / Phone Tapping (0 steps)
  {
    const engine = new AdaptiveStepEngine();
    const trace = generateNoiseTrace("HAND_SHAKE", 10000);
    let detected = 0;
    trace.forEach((s) => {
      if (engine.processSample(s)) detected++;
    });
    results.push({
      name: "10. Hand Shake & Device Tapping Rejection",
      expectedSteps: 0,
      detectedSteps: detected,
      passed: detected === 0,
      notes: `Detected ${detected} false steps (Target: 0)`
    });
  }

  // Test 11: Phone Rotation / Orientation Change (0 steps)
  {
    const engine = new AdaptiveStepEngine();
    const trace = generateNoiseTrace("ORIENTATION_CHANGE", 5000);
    let detected = 0;
    trace.forEach((s) => {
      if (engine.processSample(s)) detected++;
    });
    results.push({
      name: "11. Phone Rotation & Gravity Orientation Shift Rejection",
      expectedSteps: 0,
      detectedSteps: detected,
      passed: detected === 0,
      notes: `Detected ${detected} false steps (Target: 0)`
    });
  }

  return results;
}

// Execution block for CLI runner
console.log("================================================================================");
console.log("🏃‍♂️ SIMPLE REAL-TIME MOBILE STEP COUNTER - PHYSICAL BENCHMARK SUITE");
console.log("================================================================================\n");

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
