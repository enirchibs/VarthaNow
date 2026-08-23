import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load .env
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
  console.error("❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in env!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRole, {
  auth: { persistSession: false }
});

const SEED_CLASSIFIEDS = [
  {
    seller_name: "శ్రీనివాస్ రావు (Srinivas)",
    category: "other",
    title: "రైతు ధరకు సోనా మసూరి కొత్త బియ్యం (25kg బస్తా)",
    description: "సొంత పొలం నుంచి నేరుగా పండించిన బియ్యం బస్తాలు. కల్తీ లేని శ్రేష్ఠమైన బియ్యం. ఉచిత హోమ్ డెలివరీ కలదు.",
    price: "₹1,350 / బస్తా",
    locality: "విశాఖపట్నం (Visakhapatnam)",
    contact: "9848012345",
    images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"],
    status: "available",
    offer_discount: "10% Off on 5+ Bags",
    free_items: "ఉచిత డెలివరీ",
    is_active: true
  },
  {
    seller_name: "అరవింద్ (Aravind)",
    category: "electronics",
    title: "iPhone 13 128GB (మింట్ కండిషన్ - 10 నెలలు వాడకం)",
    description: "100% అసలైన ఐఫోన్. బ్యాటరీ హెల్త్ 89%. ఒరిజినల్ బాక్స్, యాపిల్ సి-టైప్ కేబుల్ మరియు టెంపర్డ్ గ్లాస్ ఉచితం.",
    price: "₹38,500",
    locality: "ఎంవీపీ కాలనీ (MVP Colony, Vizag)",
    contact: "9988776655",
    images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"],
    status: "available",
    offer_discount: "నెగోషియబుల్ (Negotiable)",
    free_items: "కవర్ & టెంపర్డ్ గ్లాస్ ఉచితం",
    is_active: true
  },
  {
    seller_name: "సురేష్ రెడ్డి (Suresh Reddy)",
    category: "vehicles",
    title: "Hero Splendor Plus 2022 మోడల్ (సింగిల్ హ్యాండ్ రన్నింగ్)",
    description: "ఒకే హ్యాండ్ వాడకం. మైలేజ్ 65+ kmpl. ఇన్సూరెన్స్ రన్నింగ్ లో ఉంది. క్లీన్ ఆర్‌సి మరియు రెండు కీలు కలవు.",
    price: "₹52,000",
    locality: "మధురవాడ (Madhurawada, Vizag)",
    contact: "9123456789",
    images: ["https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80"],
    status: "available",
    offer_discount: "ఫ్రీ హెల్మెట్",
    free_items: "హెల్మెట్ ఉచితం",
    is_active: true
  },
  {
    seller_name: "వెంకటేశ్వర్లు (Venkatesh)",
    category: "property",
    title: "2BHK ఫ్లాట్ అద్దెకు (కుటుంబాలకు మాత్రమే)",
    description: "24/7 మంచినీరు, గ్యాస్ పైప్‌లైన్, లిఫ్ట్, కార్ పార్కింగ్ కలదు. ప్రధాన రోడ్డుకు దగ్గరగా శ్రద్ధగల వాతావరణం.",
    price: "₹12,000 / నెల",
    locality: "గచ్చిబౌలి (Gachibowli, Hyderabad)",
    contact: "9876543210",
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"],
    status: "available",
    offer_discount: "మెయింటెనెన్స్ ఉచితం",
    free_items: "ఉచిత పార్కింగ్",
    is_active: true
  },
  {
    seller_name: "రాజేష్ ఎలక్ట్రికల్స్ (Rajesh Electrician)",
    category: "services",
    title: "ఇంటి వద్దకే ఎలక్ట్రీషియన్ & ప్లంబర్ సేవలు",
    description: "అన్ని రకాల హౌస్‌హోల్డ్ ఎలక్ట్రికల్ ఐటమ్స్ ఫిక్సింగ్, ప్లంబింగ్, వాటరింగ్ పంప్ వర్క్స్ & ట్యూటర్ సేవలు తక్షణమే.",
    price: "₹299 విజిటింగ్ ఛార్జ్",
    locality: "విజయవాడ (Vijayawada)",
    contact: "9550011223",
    images: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"],
    status: "available",
    offer_discount: "20% ఆఫర్ మొదటి విజిట్‌పై",
    free_items: "ఫ్రీ ఇన్‌స్పెక్షన్",
    is_active: true
  },
  {
    seller_name: "లక్ష్మి ఫర్నిచర్ (Lakshmi)",
    category: "furniture",
    title: "టీక్ వుడ్ 6 సీటర్ సోఫా సెట్ (కొత్తది అసలైన టేకు)",
    description: "అసలైన టేకు తో చేసిన 6 సీటర్ సోఫా. హై-డెన్సిటీ కుషన్స్. 5 ఏళ్ల వారంటీ.",
    price: "₹24,500",
    locality: "గాజువాక (Gajuwaka, Vizag)",
    contact: "9440156789",
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"],
    status: "available",
    offer_discount: "15% తగ్గింపు",
    free_items: "ఉచిత కుషన్ కవర్లు",
    is_active: true
  }
];

async function run() {
  console.log("🚀 Starting VaartaNow Classifieds migration and seed process...");

  // Try applying SQL migration via exec_sql RPC if available
  const sqlPath = path.join(process.cwd(), "supabase/migrations/20260824000000_create_vaartanow_classifieds.sql");
  if (fs.existsSync(sqlPath)) {
    const sql = fs.readFileSync(sqlPath, "utf8");
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": serviceRole,
          "Authorization": `Bearer ${serviceRole}`
        },
        body: JSON.stringify({ sql })
      });
      if (res.ok) {
        console.log("✅ SQL migration applied via RPC!");
      }
    } catch (e) {
      console.warn("RPC exec_sql skipped or unavailable:", e);
    }
  }

  // Seed data directly into public.classifieds table
  console.log("🌱 Upserting sample classifieds items into public.classifieds...");
  const { data, error } = await supabase
    .from("classifieds")
    .upsert(SEED_CLASSIFIEDS, { onConflict: "title" })
    .select();

  if (error) {
    console.error("⚠️ Note on Supabase classifieds upsert:", error.message);
  } else {
    console.log(`✅ Successfully seeded ${data?.length || SEED_CLASSIFIEDS.length} items into public.classifieds!`);
  }
}

run().then(() => process.exit(0));
