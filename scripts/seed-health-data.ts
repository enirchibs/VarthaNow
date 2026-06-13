import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

// Load environment variables
try {
  const envText = fs.readFileSync(".env", "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && value) process.env[key] = value;
  }
} catch {}

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRole) {
  console.error("❌ Supabase configurations are missing in .env!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRole, {
  auth: { persistSession: false }
});

const defaultMedicines = [
  {
    name: "Dolo 650",
    common_uses: "Relieving mild to moderate pain (such as headache, body ache, toothache) and reducing fever.",
    typical_dosage: "1 tablet (650 mg) every 4 to 6 hours as needed. Do not exceed 4 tablets in 24 hours.",
    side_effects: "Nausea, skin rash, or allergic reactions in rare cases. Liver damage if overdosed.",
    warnings: "Avoid alcohol consumption. Do not take with other paracetamol-containing medications.",
    drug_interactions: "Interacts with blood thinners like Warfarin, and certain anti-seizure medications."
  },
  {
    name: "Paracetamol",
    common_uses: "Widely used for pain relief (analgesic) and fever reduction (antipyretic).",
    typical_dosage: "500 mg to 1000 mg every 4 to 6 hours. Maximum daily dose is 4000 mg (4g).",
    side_effects: "Generally safe at recommended doses. High doses can lead to severe liver damage.",
    warnings: "Strictly avoid exceeding the maximum daily dose. Consult doctor for children's dosage.",
    drug_interactions: "Colestyramine reduces absorption. Metoclopramide and Domperidone increase absorption."
  },
  {
    name: "Crocin",
    common_uses: "Fever reducer and pain reliever for headaches, muscle pain, and joint aches.",
    typical_dosage: "1-2 tablets (500mg) up to 3 or 4 times a day, maintaining at least 4-hour gaps.",
    side_effects: "Rarely causes side effects when taken correctly. May cause minor skin allergy.",
    warnings: "Do not take if you have chronic liver or kidney disease without consulting a physician.",
    drug_interactions: "Interaction risk with medications containing paracetamol or anticoagulants."
  },
  {
    name: "Cetirizine",
    common_uses: "Relieving allergy symptoms such as runny nose, watery eyes, sneezing, itching, and hives.",
    typical_dosage: "5 mg to 10 mg once daily, preferably in the evening as it may cause drowsiness.",
    side_effects: "Drowsiness, dry mouth, tiredness, dizziness, and sore throat.",
    warnings: "Avoid driving or operating heavy machinery. Limit alcohol intake while on this medication.",
    drug_interactions: "Increased risk of drowsiness when taken with sedatives, tranquilizers, or alcohol."
  },
  {
    name: "Pantoprazole",
    common_uses: "Treating acid reflux, heartburn, gastroesophageal reflux disease (GERD), and stomach ulcers.",
    typical_dosage: "40 mg once daily, taken 30 to 60 minutes before breakfast.",
    side_effects: "Headache, diarrhea, stomach pain, flatulence, and dizziness.",
    warnings: "Do not chew or crush tablets; swallow whole. Long-term use may cause low magnesium levels.",
    drug_interactions: "May reduce the absorption of drugs that require stomach acid, such as Ketoconazole."
  }
];

const defaultTips = [
  {
    title: "Stay Hydrated",
    content: "Drinking at least 8-10 glasses of water daily helps maintain energy, flush toxins, and keep your skin healthy.",
    category: "General Health",
    tip_type: "daily",
    language: "en"
  },
  {
    title: "మంచినీరు తాగడం మరువకండి",
    content: "రోజుకు కనీసం 8-10 గ్లాసుల నీరు తాగడం వల్ల శరీరానికి శక్తి లభిస్తుంది, వ్యర్థాలు తొలగిపోతాయి మరియు చర్మం ఆరోగ్యంగా ఉంటుంది.",
    category: "General Health",
    tip_type: "daily",
    language: "te"
  },
  {
    title: "Heart Healthy Walking",
    content: "A 30-minute brisk walk every day can lower blood pressure, improve cholesterol levels, and strengthen your cardiovascular system.",
    category: "Heart Health",
    tip_type: "weekly",
    language: "en"
  },
  {
    title: "గుండె ఆరోగ్యం కోసం నడక",
    content: "రోజుకు 30 నిమిషాల పాటు వేగంగా నడవడం వల్ల రక్తపోటు తగ్గుతుంది, కొలెస్ట్రాల్ అదుపులో ఉంటుంది మరియు గుండె బలంగా మారుతుంది.",
    category: "Heart Health",
    tip_type: "weekly",
    language: "te"
  },
  {
    title: "Beat the Summer Heat",
    content: "Drink fresh buttermilk, coconut water, and eat seasonal fruits like watermelon to prevent dehydration and heat stroke.",
    category: "Preventive Care",
    tip_type: "seasonal",
    language: "en"
  },
  {
    title: "ఎండవేడిమి నుండి రక్షణ",
    content: "డీహైడ్రేషన్ మరియు వడదెబ్బ తగలకుండా ఉండేందుకు మజ్జిగ, కొబ్బరి నీరు ఎక్కువగా తాగండి మరియు పుచ్చకాయ లాంటి పండ్లను తినండి.",
    category: "Preventive Care",
    tip_type: "seasonal",
    language: "te"
  }
];

async function seed() {
  console.log("🌱 Starting database seeding for AI Health Assistant...");

  // 1. Seed Medicine Information
  console.log("Seeding medicine database...");
  const { error: medError } = await supabase
    .from("medicine_information")
    .upsert(defaultMedicines, { onConflict: "name" });

  if (medError) {
    console.error("❌ Error seeding medicines:", medError.message);
  } else {
    console.log("✅ Seeding medicines complete!");
  }

  // 2. Seed Health Tips
  console.log("Seeding health tips...");
  // To avoid duplicate insertions on multiple runs, we can clear the table or just insert
  // Since health_tips doesn't have a unique constraint, we can check count or clear first.
  const { data: existingTips } = await supabase.from("health_tips").select("id").limit(1);
  if (existingTips && existingTips.length > 0) {
    console.log("⚠️ Tips table already contains records. Skipping tips seeding.");
  } else {
    const { error: tipsError } = await supabase
      .from("health_tips")
      .insert(defaultTips);

    if (tipsError) {
      console.error("❌ Error seeding health tips:", tipsError.message);
    } else {
      console.log("✅ Seeding health tips complete!");
    }
  }

  console.log("🌱 Seeding finished.");
}

seed().then(() => process.exit(0));
