// 🏃‍♂️ Synthetic Test Suite for Adaptive Human-Walk Step Detection Engine
import { AdaptiveStepEngine } from "../adaptive-step-engine";
import { SensorSample } from "../types";

function generateGaitWalk(
  durationSec: number,
  fsHz: number,
  stepFreqHz: number,
  amplitude: number,
  noiseLevel: number = 0.04
): SensorSample[] {
  const samples: SensorSample[] = [];
  const dtMs = 1000 / fsHz;
  const totalSamples = Math.floor(durationSec * fsHz);
  let timestamp = Date.now();

  for (let i = 0; i < totalSamples; i++) {
    const tSec = i / fsHz;
    // Human foot-strike pulse: 1 peak per step period (0.45 duty cycle)
    const phase = (tSec * stepFreqHz) % 1.0;
    let gaitSignal = 0;
    if (phase < 0.45) {
      gaitSignal = amplitude * Math.sin((phase / 0.45) * Math.PI);
    }

    const noise = (Math.random() - 0.5) * noiseLevel;
    const az = 9.81 + gaitSignal + noise;
    const ax = 0.2 * gaitSignal + (Math.random() - 0.5) * noiseLevel;
    const ay = (Math.random() - 0.5) * noiseLevel;

    samples.push({
      timestamp: timestamp + i * dtMs,
      ax,
      ay,
      az,
      accelerationIncludesGravity: true
    });
  }

  return samples;
}

function generateStationary(durationSec: number, fsHz: number): SensorSample[] {
  const samples: SensorSample[] = [];
  const dtMs = 1000 / fsHz;
  const totalSamples = Math.floor(durationSec * fsHz);
  let timestamp = Date.now();

  for (let i = 0; i < totalSamples; i++) {
    const noise = (Math.random() - 0.5) * 0.04;
    samples.push({
      timestamp: timestamp + i * dtMs,
      ax: noise,
      ay: noise,
      az: 9.81 + noise,
      accelerationIncludesGravity: true
    });
  }

  return samples;
}

function generateVibration(durationSec: number, fsHz: number): SensorSample[] {
  const samples: SensorSample[] = [];
  const dtMs = 1000 / fsHz;
  const totalSamples = Math.floor(durationSec * fsHz);
  let timestamp = Date.now();

  for (let i = 0; i < totalSamples; i++) {
    // High-frequency vibration (30 Hz)
    const vib = 1.2 * Math.sin(2 * Math.PI * 30 * (i / fsHz));
    samples.push({
      timestamp: timestamp + i * dtMs,
      ax: vib,
      ay: vib,
      az: 9.81 + vib,
      accelerationIncludesGravity: true
    });
  }

  return samples;
}

export function runTestSuite(): { name: string; passed: boolean; details: string }[] {
  const results: { name: string; passed: boolean; details: string }[] = [];

  // --- Test A: Sitting ---
  {
    const engine = new AdaptiveStepEngine();
    engine.start();
    const samples = generateStationary(10, 50); // 10s sitting still
    samples.forEach((s) => engine.processSample(s));
    const metrics = engine.getMetrics();
    const passed = metrics.steps === 0;
    results.push({
      name: "Test A: Sitting (0 False Steps)",
      passed,
      details: `Steps detected: ${metrics.steps} (Expected: 0)`
    });
  }

  // --- Test B: Standing Still ---
  {
    const engine = new AdaptiveStepEngine();
    engine.start();
    const samples = generateStationary(15, 50);
    samples.forEach((s) => engine.processSample(s));
    const metrics = engine.getMetrics();
    const passed = metrics.steps <= 1;
    results.push({
      name: "Test B: Standing Still (0-1 False Steps)",
      passed,
      details: `Steps detected: ${metrics.steps} (Expected: <= 1)`
    });
  }

  // --- Test C: Slow Walking ---
  {
    const engine = new AdaptiveStepEngine();
    engine.start();
    // 1.2 Hz step frequency = 72 SPM slow walk, 15s = ~18 steps, amplitude 0.75 m/s²
    const samples = generateGaitWalk(15, 50, 1.2, 0.75);
    samples.forEach((s) => engine.processSample(s));
    const metrics = engine.getMetrics();
    const passed = metrics.steps >= 12;
    results.push({
      name: "Test C: Slow Walking Detection",
      passed,
      details: `Steps detected: ${metrics.steps}, Cadence: ${metrics.cadenceSPM} SPM (Expected: >= 12 steps)`
    });
  }

  // --- Test D: Normal Walking ---
  {
    const engine = new AdaptiveStepEngine();
    engine.start();
    // 1.75 Hz step frequency = 105 SPM normal walk, 20s = ~35 steps, amplitude 1.8 m/s²
    const samples = generateGaitWalk(20, 50, 1.75, 1.8);
    samples.forEach((s) => engine.processSample(s));
    const metrics = engine.getMetrics();
    const passed = metrics.steps >= 25;
    results.push({
      name: "Test D: Normal Walking Detection",
      passed,
      details: `Steps detected: ${metrics.steps}, Cadence: ${metrics.cadenceSPM} SPM (Expected: >= 25 steps)`
    });
  }

  // --- Test E: Fast Walking Adaptive Cadence ---
  {
    const engine = new AdaptiveStepEngine();
    engine.start();
    // 2.3 Hz step frequency = 138 SPM fast walk, 15s = ~34 steps
    const samples = generateGaitWalk(15, 50, 2.3, 2.8);
    samples.forEach((s) => engine.processSample(s));
    const metrics = engine.getMetrics();
    const passed = metrics.cadenceSPM >= 120 && metrics.steps >= 25;
    results.push({
      name: "Test E: Fast Walking Adaptive Cadence",
      passed,
      details: `Steps detected: ${metrics.steps}, Cadence: ${metrics.cadenceSPM} SPM (Expected: Cadence >= 120 SPM)`
    });
  }

  // --- Test F: Phone Motor Vibration Rejection ---
  {
    const engine = new AdaptiveStepEngine();
    engine.start();
    const samples = generateVibration(10, 50); // 10s motor vibration
    samples.forEach((s) => engine.processSample(s));
    const metrics = engine.getMetrics();
    const passed = metrics.steps <= 2;
    results.push({
      name: "Test F: Phone Motor Vibration Rejection",
      passed,
      details: `Steps detected: ${metrics.steps} (Expected: <= 2)`
    });
  }

  // --- Test J & K: Start/Stop Walking State Transitions ---
  {
    const engine = new AdaptiveStepEngine();
    engine.start();
    const sit1 = generateStationary(5, 50);
    const walk = generateGaitWalk(10, 50, 1.8, 1.8);
    const sit2 = generateStationary(5, 50);

    sit1.forEach((s) => engine.processSample(s));
    const stateAtSit1 = engine.getMetrics().currentState;

    walk.forEach((s) => engine.processSample(s));
    const stateAtWalk = engine.getMetrics().currentState;

    sit2.forEach((s) => engine.processSample(s));
    const stateAtSit2 = engine.getMetrics().currentState;

    const passed = (stateAtSit1 === "STATIONARY") && 
                   (stateAtWalk === "WALKING" || stateAtWalk === "CANDIDATE_WALKING" || stateAtWalk === "FAST_WALKING") && 
                   (stateAtSit2 === "STATIONARY" || stateAtSit2 === "RECOVERY" || stateAtSit2 === "MOTION_DETECTED");

    results.push({
      name: "Test J/K: Start/Stop Walking State Transition Machine",
      passed,
      details: `States: Sit1=${stateAtSit1} -> Walk=${stateAtWalk} -> Sit2=${stateAtSit2}`
    });
  }

  return results;
}

// Execute tests if executed via node / tsx CLI
if (typeof process !== "undefined" && process.argv && process.argv[1]?.includes("run-tests")) {
  console.log("🏃 Running Adaptive Step Engine Synthetic Test Suite...\n");
  const testResults = runTestSuite();
  let passedCount = 0;
  testResults.forEach((r) => {
    const icon = r.passed ? "✅ PASS" : "❌ FAIL";
    if (r.passed) passedCount++;
    console.log(`${icon}: ${r.name}`);
    console.log(`   Details: ${r.details}\n`);
  });
  console.log(`Test Summary: ${passedCount}/${testResults.length} Tests Passed.`);
}
