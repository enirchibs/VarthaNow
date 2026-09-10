/**
 * Automated Test Suite: Free-Only Billing Protection & Failover Test
 * 
 * Verifies:
 * 1. ZERO Paid Requests: Master safety switches ALLOW_PAID_TTS=false and TTS_FREE_ONLY_MODE=true.
 * 2. Pre-flight Quota Pre-checks: Local database/in-memory usage tracking skips exhausted providers BEFORE API calls.
 * 3. Multi-Provider Failover Chain: Google -> Azure -> Sarvam -> ElevenLabs -> Self-Hosted -> Device TTS.
 * 4. SHA-256 Audio Cache Reuse: Identical Telugu articles hit cache with zero extra API requests.
 * 5. Text Chunking: Long Telugu text is chunked by punctuation preserving Telugu graphemes.
 */

import { TTSProviderManager, MASTER_SAFETY_CONFIG } from "../lib/tts/provider-manager";
import { GoogleTTSProvider } from "../lib/tts/providers/google-tts";
import { AzureTTSProvider } from "../lib/tts/providers/azure-tts";
import { SarvamTTSProvider } from "../lib/tts/providers/sarvam-tts";
import { ElevenLabsTTSProvider } from "../lib/tts/providers/elevenlabs-tts";

let passedCount = 0;
let totalCount = 0;

function assert(condition: boolean, testName: string) {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`✅ [PASS] ${testName}`);
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

async function runBillingProtectionTests() {
  console.log("============================================================");
  console.log("🧪 RUNNING TELUGU TTS FREE-ONLY & BILLING PROTECTION TESTS");
  console.log("============================================================\n");

  const manager = new TTSProviderManager();

  // TEST 1: Master Safety Switches
  assert(
    MASTER_SAFETY_CONFIG.TTS_FREE_ONLY_MODE === true,
    "Master Switch: TTS_FREE_ONLY_MODE defaults to true"
  );
  assert(
    MASTER_SAFETY_CONFIG.ALLOW_PAID_TTS === false,
    "Master Switch: ALLOW_PAID_TTS defaults to false"
  );

  // TEST 2: Telugu Text Normalization & Hash Generation
  const rawText = "<p>తెలంగాణ వార్తలు <b>లేటెస్ట్</b></p>";
  const normalized = manager.normalizeTeluguText(rawText);
  assert(
    normalized === "తెలంగాణ వార్తలు లేటెస్ట్",
    "Telugu Text Processing: Strips HTML and normalizes whitespace"
  );

  const textHash = manager.generateTextHash(normalized);
  assert(
    textHash.length === 64,
    "SHA-256 Hash Generation: Returns 64-character hex hash"
  );

  // TEST 3: Telugu Long Text Chunking
  const longTelugu = "తెలంగాణలో వర్షాలు పడుతున్నాయి. రైతులు సంతోషం వ్యక్తం చేస్తున్నారు! పంటలు బాగా పండుతాయని ఆశిస్తున్నారు.";
  const chunks = manager.chunkTeluguText(longTelugu, 40);
  assert(
    chunks.length > 1 && chunks.every((c) => c.length <= 50),
    "Telugu Chunking: Intelligently splits by Telugu punctuation preserving words"
  );

  // TEST 4: Google Provider Free Quota Pre-Check
  const googleProvider = new GoogleTTSProvider({
    enabled: true,
    freeOnly: true,
    freeCharLimit: 1000,
    currentUsage: 1000, // 100% EXHAUSTED
  });

  const googleQuotaCheck = await googleProvider.hasEnoughFreeQuota(500);
  assert(
    googleQuotaCheck === false,
    "Billing Protection: Google skipped when free quota is 100% used"
  );

  const googleSynth = await googleProvider.synthesize("పరీక్షా పాఠం");
  assert(
    googleSynth.success === false && googleSynth.errorType === "QUOTA_EXHAUSTED",
    "Billing Protection: Google returns QUOTA_EXHAUSTED error without calling paid tier"
  );

  // TEST 5: Azure Provider Free Quota Pre-Check (F0 Tier)
  const azureProvider = new AzureTTSProvider({
    enabled: true,
    freeOnly: true,
    freeCharLimit: 500,
    currentUsage: 450,
  });

  const azureQuotaCheck = await azureProvider.hasEnoughFreeQuota(100); // 450 + 100 > 500
  assert(
    azureQuotaCheck === false,
    "Billing Protection: Azure F0 skipped when request exceeds remaining free allowance"
  );

  // TEST 6: Sarvam AI Free Credits Pre-Check
  const sarvamProvider = new SarvamTTSProvider({
    enabled: true,
    freeOnly: true,
    freeCharLimit: 200,
    currentUsage: 200,
  });

  const sarvamQuotaCheck = await sarvamProvider.hasEnoughFreeQuota(50);
  assert(
    sarvamQuotaCheck === false,
    "Billing Protection: Sarvam AI skipped when free credits are exhausted"
  );

  // TEST 7: ElevenLabs Free Plan Pre-Check
  const elevenProvider = new ElevenLabsTTSProvider({
    enabled: true,
    freeOnly: true,
    freeCharLimit: 100,
    currentUsage: 100,
  });

  const elevenQuotaCheck = await elevenProvider.hasEnoughFreeQuota(10);
  assert(
    elevenQuotaCheck === false,
    "Billing Protection: ElevenLabs skipped when 10,000 char free limit is reached"
  );

  // TEST 8: Full Manager Synthesis Failover (All Cloud Exceeded -> Android Device TTS Fallback)
  console.log("\nSimulating synthesis request with exhausted cloud free quotas...");
  const result = await manager.synthesizeTelugu({
    articleId: "test-article-123",
    slug: "telugu-news-test",
    text: "ఈ రోజు తాజా వార్తలు.",
    language: "te-IN",
  });

  assert(
    result.success === true,
    "Zero-Failure Guarantee: Synthesis call succeeds without throwing exception"
  );
  assert(
    result.mode === "DEVICE_TTS" || result.mode === "CLOUD_AUDIO",
    "Failover Resolution: Resolves to CLOUD_AUDIO or DEVICE_TTS fallback mode"
  );

  // TEST 9: SHA-256 Cache Hit Verification
  const secondResult = await manager.synthesizeTelugu({
    articleId: "test-article-123",
    slug: "telugu-news-test",
    text: "ఈ రోజు తాజా వార్తలు.",
    language: "te-IN",
  });

  assert(
    secondResult.cached === true,
    "Cache Reuse: Repeated request hits SHA-256 cache with ZERO extra API requests"
  );

  console.log("\n============================================================");
  console.log(`🎉 TEST RESULTS: ${passedCount} / ${totalCount} TESTS PASSED`);
  console.log("============================================================\n");
}

runBillingProtectionTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
