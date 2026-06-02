import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

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
const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

// ── Same domain lookup table as populate-news.ts ─────────────────────────────
const knownDomains: Record<string, string> = {
  "eenadu": "eenadu.net",
  "sakshi": "sakshi.com",
  "sakshi tv": "sakshi.com",
  "andhrajyothy": "andhrajyothy.com",
  "andhrajyothi": "andhrajyothy.com",
  "tv9": "tv9telugu.com",
  "tv9 telugu": "tv9telugu.com",
  "ntv": "ntvtelugu.com",
  "ntv telugu": "ntvtelugu.com",
  "hmtv": "hmtvlive.com",
  "hmtv live": "hmtvlive.com",
  "hmtvlive": "hmtvlive.com",
  "hmtvlivecom": "hmtvlive.com",
  "10tv": "10tv.in",
  "v6 news": "v6news.tv",
  "v6news": "v6news.tv",
  "abp desam": "abpdesam.com",
  "abp live": "abplive.com",
  "abplive": "abplive.com",
  "zee telugu": "zeenews.india.com",
  "the hindu": "thehindu.com",
  "times of india": "timesofindia.com",
  "ndtv": "ndtv.com",
  "deccan chronicle": "deccanchronicle.com",
  "indian express": "indianexpress.com",
  "livemint": "livemint.com",
  "business standard": "business-standard.com",
  "economic times": "economictimes.com",
  "dainik bhaskar": "bhaskar.com",
  "amar ujala": "amarujala.com",
  "dinamalar": "dinamalar.com",
  "dinamani": "dinamani.com",
  "vikatan": "vikatan.com",
  "prajavani": "prajavani.net",
  "vijaya karnataka": "vijaykarnataka.com",
  "bbc": "bbc.com",
  "reuters": "reuters.com",
  "ani": "aninews.in",
  "pti": "ptinews.com",
  "vaartha": "vaartha.com",
  "maalai malar": "maalaimalar.com",
  "maalaimalar": "maalaimalar.com",
  "daily thanthi": "dailythanthi.com",
  "thanthi tv": "thanthi.tv",
  "hiru news": "hirunews.lk",
  "samayam": "samayam.com",
  "samayam telugu": "telugu.samayam.com",
  "samayam tamil": "tamil.samayam.com",
  "kalki online": "kalkiweekly.com",
  "hindu tamil thisai": "hindutamil.in",
  "rockfort times": "rockforttimes.com",
  "news18": "news18.com",
  "news18 telugu": "news18.com",
  "news18 tamil": "news18.com",
  "news18 kannada": "news18.com",
  "india tv": "indiatvnews.com",
  "republic world": "republicworld.com",
  "republic": "republicworld.com",
  "the quint": "thequint.com",
  "scroll": "scroll.in",
  "wire": "thewire.in",
  "outlook": "outlookindia.com",
  "firstpost": "firstpost.com",
  "mint": "livemint.com",
  "hindustan times": "hindustantimes.com",
  "moneycontrol": "moneycontrol.com",
  "moneycontrolcom": "moneycontrol.com",
  "namasthe telangana": "namaste-telangana.com",
  "namaste telangana": "namaste-telangana.com",
  "disha daily": "dishadaily.com",
  "disha": "dishadaily.com",
  "telugu one": "teluguone.com",
  "tv5 news": "tv5news.in",
  "tv5": "tv5news.in",
  "mahaa news": "mahaanews.com",
  "mahaa": "mahaanews.com",
  "raj news": "rajnews.com",
  "etv andhra": "etvbharat.com",
  "etv telangana": "etvbharat.com",
  "etv bharat": "etvbharat.com",
  "etv": "etvbharat.com",
  "greater telangana": "greatertelangana.com",
  "telangana today": "telanganatoday.com",
  "hans india": "thehansindia.com",
  "india today": "indiatoday.in",
  "tractor junction": "tractorjunction.com",
  "zee news": "zeenews.india.com",
  "one india": "oneindia.com",
  "oneindia": "oneindia.com",
  "oneindia tamil": "oneindia.com",
  "oneindia telugu": "oneindia.com",
  "oneindia kannada": "oneindia.com",
  "abp news": "abplive.com",
  "navbharat times": "navbharattimes.indiatimes.com",
  "india today": "indiatoday.in",
  "the times of india": "timesofindia.com",
  "the economic times": "economictimes.com",
  "the economic times tamil": "economictimes.com",
  "hindustan hindi news": "livehindustan.com",
  "livehindustan": "livehindustan.com",
  "asianet news": "asianetnews.com",
  "asianet news telugu": "asianetnews.com",
  "asianet news tamil": "asianetnews.com",
  "asianet news kannada": "asianetnews.com",
  "jagran": "jagran.com",
  "dainik jagran": "jagran.com",
  "dailyhunt": "dailyhunt.com",
  "mashable": "mashable.com",
  "behindwoods": "behindwoods.com",
  "boldsky": "boldsky.com",
  "boldsky tamil": "boldsky.com",
  "harvard health": "health.harvard.edu",
  "upstox": "upstox.com",
  "communications today": "communicationstoday.net",
  "the south first": "thesouthfirst.com",
  "south first": "thesouthfirst.com",
  "olympics": "olympics.com",
  "news18 hindi": "news18.com",
  "sakshi education": "sakshi.com",
  "the indian express": "indianexpress.com",
};

function resolveLogoUrl(authorName: string): string | null {
  const raw = authorName.toLowerCase().trim();

  // Skip VaartaNow/VarthaNow fallback names — they're not real sources
  const SKIP_NAMES = new Set([
    "vaartanow ai desk", "varthanow ai desk", "vaartanow news desk",
    "google news", "google"
  ]);
  if (SKIP_NAMES.has(raw)) return null;

  // If it already looks like a domain (contains a dot), use directly
  if (raw.includes(".")) {
    return `https://www.google.com/s2/favicons?domain=${raw}&sz=64`;
  }

  // Strip non-alphanumeric (except spaces) for lookup key
  const key = raw.replace(/[^a-z0-9 ]/g, "").trim();

  // Try full key, then first word only, then join words (no spaces) as domain
  const domain = knownDomains[key]
    || knownDomains[key.split(" ")[0]]
    || (key.replace(/\s+/g, "") + ".com");

  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

async function backfill() {
  console.log("=".repeat(60));
  console.log("🔄 Backfill: source_logo for all existing blog_posts");
  console.log("=".repeat(60));

  // Fetch all posts that are missing source_logo OR have wrong author_name
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, author_name, source_logo")
    .order("published_at", { ascending: false });

  if (error || !posts) {
    console.error("Failed to fetch posts:", error?.message);
    process.exit(1);
  }

  console.log(`\nFound ${posts.length} total articles to process.\n`);

  let updated = 0;
  let skipped = 0;

  for (const post of posts) {
    const currentName = post.author_name || "";

    // Re-extract source from title suffix
    let extractedName = currentName;
    const isVaartaNowFallback = ["VaartaNow AI Desk", "VarthaNow AI Desk", "VaartaNow News Desk"].includes(currentName);

    if (post.title) {
      const dashMatch = post.title.match(/[-–—]\s*([^\-–—]+)\s*$/);
      if (dashMatch) {
        const candidate = dashMatch[1].trim();
        if (candidate.length < 60 && candidate !== post.title) {
          extractedName = candidate;
        }
      }
    }

    // If we couldn't extract a real source from title, keep the original name
    // but don't set a logo for VaartaNow fallbacks
    if (isVaartaNowFallback && extractedName === currentName) {
      // No real source found — skip logo update for this article
      skipped++;
      continue;
    }

    // Resolve logo URL
    const newLogo = resolveLogoUrl(extractedName);

    // Determine if we need to update
    const needsNameUpdate = extractedName !== currentName
      && ![
        "VaartaNow AI Desk", "VarthaNow AI Desk", "VaartaNow News Desk",
        "Google News", "Google"
      ].includes(extractedName);
    const needsLogoUpdate = newLogo !== null && (!post.source_logo || post.source_logo !== newLogo);

    if (!needsNameUpdate && !needsLogoUpdate) {
      skipped++;
      continue;
    }

    const patch: Record<string, string | null> = { source_logo: newLogo };
    if (needsNameUpdate) patch.author_name = extractedName;

    const { error: updateErr } = await supabase
      .from("blog_posts")
      .update(patch)
      .eq("id", post.id);

    if (updateErr) {
      console.error(`  ✗ Failed [${post.slug}]:`, updateErr.message);
    } else {
      updated++;
      if (needsNameUpdate) {
        console.log(`  ✓ Updated: "${extractedName}" (was: "${currentName}") → ${newLogo}`);
      } else {
        console.log(`  ✓ Logo set: "${currentName}" → ${newLogo}`);
      }
    }

    // Small delay to avoid hitting rate limits
    await new Promise(r => setTimeout(r, 50));
  }

  console.log("\n" + "=".repeat(60));
  console.log(`✅ Backfill complete!`);
  console.log(`   Updated : ${updated}`);
  console.log(`   Skipped : ${skipped} (already correct)`);
  console.log("=".repeat(60) + "\n");

  process.exit(0);
}

backfill().catch(e => { console.error(e); process.exit(1); });
