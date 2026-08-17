import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
};

const CITIES_CONFIG = [
  { name: "Hyderabad", maxPages: 25 },
  { name: "Visakhapatnam", maxPages: 15 },
  { name: "Vijayawada", maxPages: 8 },
  { name: "Guntur", maxPages: 8 },
  { name: "Warangal", maxPages: 8 },
  { name: "Kakinada", maxPages: 2 },
  { name: "Tirupati", maxPages: 2 },
  { name: "Nellore", maxPages: 2 },
  { name: "Kurnool", maxPages: 2 },
  { name: "Nizamabad", maxPages: 2 },
  { name: "Karimnagar", maxPages: 2 },
  { name: "Rajahmundry", maxPages: 2 },
  { name: "Khammam", maxPages: 2 },
];

const TELANGANA_CITIES = ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"];

function detectWorkMode(title: string, desc: string): "Remote" | "Hybrid" | "On-site" {
  const text = `${title} ${desc}`.toLowerCase();
  if (text.includes("remote") || text.includes("wfh") || text.includes("work from home") || text.includes("anywhere")) {
    return "Remote";
  }
  if (text.includes("hybrid") || text.includes("flexible onsite")) {
    return "Hybrid";
  }
  return "On-site";
}

function detectContractType(title: string, desc: string): "Full-time" | "Part-time" | "Contract" | "Freelance" | "Internship" {
  const text = `${title} ${desc}`.toLowerCase();
  if (text.includes("intern") || text.includes("internship") || text.includes("trainee")) {
    return "Internship";
  }
  if (text.includes("freelance") || text.includes("upwork") || text.includes("freelancer")) {
    return "Freelance";
  }
  if (text.includes("contract") || text.includes("temp")) {
    return "Contract";
  }
  if (text.includes("part-time") || text.includes("part time")) {
    return "Part-time";
  }
  return "Full-time";
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const appId = Deno.env.get("ADZUNA_APP_ID") || "4da9f8a0";
  const appKey = Deno.env.get("ADZUNA_APP_KEY") || "46b381cd4b77797427089920c6e2dde6";

  if (!appId || !appKey) {
    console.error("Adzuna API credentials (ADZUNA_APP_ID / ADZUNA_APP_KEY) are not set.");
    return new Response(JSON.stringify({ ok: false, error: "Adzuna API credentials missing in Environment Secrets" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

  const urlObj = new URL(req.url);
  const targetCity = urlObj.searchParams.get("city");
  
  const stats = { citiesProcessed: 0, pagesFetched: 0, jobsUpserted: 0 };
  const citiesToProcess = targetCity 
    ? CITIES_CONFIG.filter(c => c.name.toLowerCase() === targetCity.toLowerCase())
    : CITIES_CONFIG;

  if (citiesToProcess.length === 0) {
    return new Response(JSON.stringify({ ok: false, error: `Invalid city filter: ${targetCity}` }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  try {
    console.log(`Starting Adzuna Job Ingestion. Processing ${citiesToProcess.length} cities...`);

    for (const city of citiesToProcess) {
      console.log(`▶ Starting ingestion for city: ${city.name} (Max pages: ${city.maxPages})`);
      stats.citiesProcessed++;

      for (let page = 1; page <= city.maxPages; page++) {
        // Enforce 3-second delay to respect Adzuna's rate limit
        if (page > 1 || stats.pagesFetched > 0) {
          console.log("Sleeping 3 seconds to avoid rate limits...");
          await delay(3000);
        }

        const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/in/search/${page}?app_id=${appId}&app_key=${appKey}&results_per_page=50&where=${encodeURIComponent(city.name)}`;
        
        console.log(`Fetching page ${page} of ${city.maxPages} for ${city.name}...`);
        const res = await fetch(adzunaUrl);
        stats.pagesFetched++;

        if (!res.ok) {
          console.error(`Adzuna API returned status ${res.status} for ${city.name} page ${page}`);
          break; // Stop fetching this city if it fails
        }

        const data = await res.json();
        const results = data.results || [];
        
        if (results.length === 0) {
          console.log(`No more jobs found for ${city.name} on page ${page}. Moving to next city.`);
          break;
        }

        // Map data to match public.jobs table schema
        const mappedJobs = results.map((item: any) => ({
          id: String(item.id),
          title: item.title || "",
          company: item.company?.display_name || "",
          location_name: item.location?.display_name || "",
          salary_min: item.salary_min ? Number(item.salary_min) : null,
          salary_max: item.salary_max ? Number(item.salary_max) : null,
          redirect_url: item.redirect_url || "",
          city_category: city.name
        }));

        // Map data to match public.vaartanow_jobs table schema
        const mappedVaartaJobs = results.map((item: any) => {
          const title = item.title || "";
          const desc = item.description || "";
          const isTelangana = TELANGANA_CITIES.includes(city.name);

          return {
            title: title,
            company_name: item.company?.display_name || "Adzuna Sponsor",
            location: item.location?.display_name || `${city.name}, India`,
            district: city.name,
            state: isTelangana ? "Telangana" : "Andhra Pradesh",
            description_snippet: desc.slice(0, 180) + "...",
            full_description: desc,
            apply_link: item.redirect_url || `https://api.adzuna.com/redirect/${item.id}`,
            source_platform: "Adzuna API",
            posted_date: item.created ? new Date(item.created).toISOString() : new Date().toISOString(),
            salary_range: item.salary_min ? `₹${item.salary_min.toLocaleString()} - ₹${item.salary_max.toLocaleString()}` : "Competitive",
            skills: ["IT Development", "Software Engineering"],
            tags: ["Adzuna"],
            logo_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120",
            work_mode: detectWorkMode(title, desc),
            contract_type: detectContractType(title, desc),
            is_featured: false,
            is_approved: true,
            is_active: true
          };
        });

        // 1. Bulk upsert to public.jobs
        const { error: upsertErr1 } = await supabase
          .from("jobs")
          .upsert(mappedJobs, { onConflict: "id" });

        if (upsertErr1) {
          console.error(`Supabase jobs upsert error on page ${page} for ${city.name}:`, upsertErr1.message);
        }

        // 2. Bulk upsert to public.vaartanow_jobs
        const { error: upsertErr2 } = await supabase
          .from("vaartanow_jobs")
          .upsert(mappedVaartaJobs, { onConflict: "apply_link" });

        if (upsertErr2) {
          console.error(`Supabase vaartanow_jobs upsert error on page ${page} for ${city.name}:`, upsertErr2.message);
        } else {
          stats.jobsUpserted += mappedVaartaJobs.length;
          console.log(`Upserted ${mappedVaartaJobs.length} jobs to both tables.`);
        }
      }

      console.log(`✔ Finished ingestion for city: ${city.name}`);
    }

    // Data Cleanup: Delete jobs older than 45 days in both tables
    console.log("Cleaning up jobs older than 45 days...");
    const fortyFiveDaysAgo = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString();
    
    // Clean up jobs table
    await supabase.from("jobs").delete().lt("created_at", fortyFiveDaysAgo);

    // Clean up vaartanow_jobs table for Adzuna sources
    await supabase
      .from("vaartanow_jobs")
      .delete()
      .eq("source_platform", "Adzuna API")
      .lt("created_at", fortyFiveDaysAgo);

    console.log("45-day cleanup completed successfully.");

    return new Response(JSON.stringify({ ok: true, stats }), {
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  } catch (error: any) {
    console.error("Job Ingestion failed:", error.message);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});
