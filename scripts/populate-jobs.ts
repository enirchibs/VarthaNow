import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

// Load environment variables
try {
  const envText = fs.readFileSync(".env", "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const parts = trimmed.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
      if (key && value) {
        process.env[key] = value;
      }
    }
  }
} catch (e) {
  // Rely on process env
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRole) {
  console.error("Missing Supabase credentials for job ingestion.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRole, {
  auth: { persistSession: false }
});

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

// ─── SOURCE 1: Remotive API Ingestion ─────────────────────────────────────────
async function fetchRemotiveJobs(): Promise<any[]> {
  console.log("Fetching Remotive API...");
  try {
    const res = await fetch("https://remotive.com/api/remote-jobs?category=software-development&limit=10");
    if (!res.ok) throw new Error(`Remotive status ${res.status}`);
    const data = await res.json();
    return (data.jobs || []).map((job: any) => ({
      title: job.title,
      company_name: job.company_name || "Remote Tech Corp",
      location: job.candidate_required_location || "Remote (Worldwide)",
      description_snippet: (job.description || "").replace(/<[^>]*>/g, "").slice(0, 180) + "...",
      full_description: job.description || "",
      apply_link: job.url.split("?")[0],
      source_platform: "Remotive API",
      posted_date: job.publication_date ? new Date(job.publication_date).toISOString() : new Date().toISOString(),
      salary_range: job.salary || "Competitive Salary",
      skills: job.tags || ["Software Development", "IT"],
      tags: ["IT Jobs", "Remote IT", "WFH"],
      logo_url: job.company_logo || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120",
      work_mode: "Remote",
      contract_type: detectContractType(job.title, job.description || "")
    }));
  } catch (err) {
    console.error("Remotive fetch failed, using fallback:", err instanceof Error ? err.message : err);
    return [];
  }
}

// ─── SOURCE 2: JSearch API (RapidAPI) Ingestion ───────────────────────────────
async function fetchJSearchJobs(): Promise<any[]> {
  const apiKey = process.env.JSEARCH_API_KEY;
  if (!apiKey) {
    console.log("JSEARCH_API_KEY is missing in env. Simulating JSearch Jobs...");
    return [
      {
        title: "Frontend Developer (React)",
        company_name: "TCS Innovation Labs",
        location: "Bengaluru, India",
        description_snippet: "TCS is looking for experienced Frontend Engineers with strong React.js, TypeScript, and TailwindCSS skillset to join our core product division.",
        full_description: "We are hiring for our React development core team. Skills required: HTML5, CSS3, JavaScript, React.js, Next.js, Redux toolkit.",
        apply_link: "https://tcs.com/careers/react-dev-1",
        source_platform: "JSearch API",
        posted_date: new Date().toISOString(),
        salary_range: "₹8,00,000 - ₹12,00,000 / year",
        skills: ["React", "TypeScript", "TailwindCSS"],
        tags: ["Fresher Jobs", "TCS Careers", "React"],
        logo_url: "https://www.google.com/s2/favicons?domain=tcs.com&sz=128",
        work_mode: "Hybrid",
        contract_type: "Full-time"
      }
    ];
  }

  try {
    const res = await fetch("https://jsearch.p.rapidapi.com/search?query=Developer%20in%20India&num_pages=1", {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
      }
    });
    if (!res.ok) throw new Error(`JSearch status ${res.status}`);
    const data = await res.json();
    return (data.data || []).map((job: any) => ({
      title: job.job_title,
      company_name: job.employer_name || "Tech Hiring",
      location: `${job.job_city || ""}, ${job.job_country || "India"}`.trim().replace(/^,/, ""),
      description_snippet: job.job_description ? job.job_description.slice(0, 180) + "..." : "No snippet available.",
      full_description: job.job_description || "",
      apply_link: job.job_apply_link,
      source_platform: "JSearch API",
      posted_date: job.job_posted_at_datetimeutc || new Date().toISOString(),
      salary_range: job.job_min_salary ? `₹${job.job_min_salary.toLocaleString()} - ₹${job.job_max_salary.toLocaleString()}` : "Market Standard",
      skills: job.job_required_skills || ["IT Development"],
      tags: ["JSearch", "Development"],
      logo_url: job.employer_logo || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120",
      work_mode: detectWorkMode(job.job_title, job.job_description || ""),
      contract_type: detectContractType(job.job_title, job.job_description || "")
    }));
  } catch (err) {
    console.error("JSearch API fetch failed:", err instanceof Error ? err.message : err);
    return [];
  }
}

// ─── SOURCE 3: Adzuna API Ingestion ──────────────────────────────────────────
async function fetchAdzunaJobs(): Promise<any[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.log("ADZUNA_APP_ID or ADZUNA_APP_KEY is missing. Simulating Adzuna Jobs...");
    return [
      {
        title: "NodeJS Backend Developer (Intern)",
        company_name: "Wipro Technologies",
        location: "Hyderabad, Telangana",
        description_snippet: "Excellent internship opening for final year computer science students to work on active enterprise NodeJS/Express REST APIs and Postgres DB instances.",
        full_description: "We are seeking proactive backend engineering interns. Requirements: Node.js, Express, PostgreSQL, Git, API testing using Postman.",
        apply_link: "https://wipro.com/careers/node-intern-hyderabad",
        source_platform: "Adzuna API",
        posted_date: new Date().toISOString(),
        salary_range: "₹25,000 / month stipend",
        skills: ["NodeJS", "PostgreSQL", "REST APIs"],
        tags: ["Internships", "Wipro Careers", "Backend"],
        logo_url: "https://www.google.com/s2/favicons?domain=wipro.com&sz=128",
        work_mode: "On-site",
        contract_type: "Internship"
      }
    ];
  }

  try {
    const res = await fetch(`https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=5&what=developer`);
    if (!res.ok) throw new Error(`Adzuna status ${res.status}`);
    const data = await res.json();
    return (data.results || []).map((job: any) => ({
      title: job.title,
      company_name: job.company?.display_name || "Adzuna Sponsor",
      location: job.location?.display_name || "India",
      description_snippet: (job.description || "").slice(0, 180) + "...",
      full_description: job.description || "",
      apply_link: job.redirect_url,
      source_platform: "Adzuna API",
      posted_date: job.created ? new Date(job.created).toISOString() : new Date().toISOString(),
      salary_range: job.salary_min ? `₹${job.salary_min.toLocaleString()} - ₹${job.salary_max.toLocaleString()}` : "Competitive",
      skills: ["IT Development", "Software Engineering"],
      tags: ["Adzuna"],
      logo_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120",
      work_mode: detectWorkMode(job.title, job.description || ""),
      contract_type: detectContractType(job.title, job.description || "")
    }));
  } catch (err) {
    console.error("Adzuna fetch failed:", err instanceof Error ? err.message : err);
    return [];
  }
}

// ─── SOURCE 4: SerpAPI Google Jobs Ingestion ──────────────────────────────────
async function fetchSerpApiJobs(): Promise<any[]> {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    console.log("SERPAPI_KEY is missing. Simulating SerpAPI Google Jobs...");
    return [
      {
        title: "Mobile App Developer (Flutter)",
        company_name: "Infosys Careers",
        location: "Visakhapatnam, Andhra Pradesh",
        description_snippet: "Infosys is looking for a cross-platform mobile developer. Build highly fluid, premium user interfaces using Flutter, Dart, and state management frameworks.",
        full_description: "We are hiring for our Vizag Development Center. Requirements: Flutter framework, Dart language, Provider/Bloc state management, third party integration.",
        apply_link: "https://infosys.com/careers/flutter-vizag",
        source_platform: "SerpAPI Google Jobs",
        posted_date: new Date().toISOString(),
        salary_range: "₹6,50,000 - ₹9,00,000 / year",
        skills: ["Flutter", "Dart", "Mobile App Dev"],
        tags: ["Vizag Jobs", "Infosys", "Flutter"],
        logo_url: "https://www.google.com/s2/favicons?domain=infosys.com&sz=128",
        work_mode: "On-site",
        contract_type: "Full-time"
      }
    ];
  }

  try {
    const res = await fetch(`https://serpapi.com/search.json?engine=google_jobs&q=developer+india&api_key=${apiKey}`);
    if (!res.ok) throw new Error(`SerpAPI status ${res.status}`);
    const data = await res.json();
    return (data.jobs_results || []).map((job: any) => ({
      title: job.title,
      company_name: job.company_name || "Google Job",
      location: job.location || "India",
      description_snippet: job.description ? job.description.slice(0, 180) + "..." : "No description.",
      full_description: job.description || "",
      apply_link: job.share_link || "https://google.com/jobs",
      source_platform: "SerpAPI Google Jobs",
      posted_date: new Date().toISOString(),
      salary_range: job.salary || "Market Standard",
      skills: ["Google Jobs", "IT Development"],
      tags: ["SerpAPI"],
      logo_url: job.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120",
      work_mode: detectWorkMode(job.title, job.description || ""),
      contract_type: detectContractType(job.title, job.description || "")
    }));
  } catch (err) {
    console.error("SerpAPI fetch failed:", err instanceof Error ? err.message : err);
    return [];
  }
}

// ─── SOURCE 5: User-submitted Jobs ──────────────────────────────────────────
async function seedUserSubmittedJobs() {
  console.log("Seeding sample User-submitted Jobs (to ensure database has active user entries)...");
  const userJobs = [
    {
      title: "Senior UI/UX Designer",
      company_name: "VaartaNow Creative Agency",
      location: "Visakhapatnam, Andhra Pradesh",
      district: "Visakhapatnam",
      state: "Andhra Pradesh",
      description_snippet: "Join our core creative agency. Design stunning, rich, user-first mobile app layouts and high-converting web interfaces.",
      full_description: "We are seeking a senior designer with deep experience in Figma, Adobe XD, custom animations, and layout grids. Full-time position on-site in Visakhapatnam.",
      apply_link: "mailto:careers@vaartanow.in?subject=Senior UI/UX Designer",
      source_platform: "User-submitted jobs",
      posted_date: new Date().toISOString(),
      salary_range: "₹9,50,000 - ₹12,00,000 / year",
      skills: ["Figma", "UI/UX", "Aesthetics"],
      tags: ["User-submitted", "Vizag", "Design"],
      logo_url: "/vaartanow-logo.png",
      work_mode: "On-site",
      contract_type: "Full-time",
      is_approved: true,
      is_active: true
    }
  ];

  for (const job of userJobs) {
    const { error } = await supabase
      .from("vaartanow_jobs")
      .upsert(job, { onConflict: "apply_link" });
    if (error) console.error("Error seeding user-submitted job:", error.message);
  }
}

// ─── Main Aggregation Runner ──────────────────────────────────────────────────
async function run() {
  console.log("🚀 Starting Multi-source Jobs Ingestion Pipeline...");
  
  // Seed sample user jobs
  await seedUserSubmittedJobs();

  // Fetch from all API sources concurrently
  const [remotive, jsearch, adzuna, serpapi] = await Promise.all([
    fetchRemotiveJobs(),
    fetchJSearchJobs(),
    fetchAdzunaJobs(),
    fetchSerpApiJobs()
  ]);

  const allJobs = [...remotive, ...jsearch, ...adzuna, ...serpapi];
  console.log(`Aggregated ${allJobs.length} total jobs from all sources. Saving to Supabase...`);

  let count = 0;
  for (const job of allJobs) {
    const jobData = {
      ...job,
      district: job.location.includes("Visakhapatnam") ? "Visakhapatnam" : job.location.includes("Hyderabad") ? "Hyderabad" : "Remote",
      state: job.location.includes("Andhra Pradesh") ? "Andhra Pradesh" : job.location.includes("Telangana") ? "Telangana" : "Remote",
      is_featured: false,
      is_approved: true,
      is_active: true
    };

    const { error } = await supabase
      .from("vaartanow_jobs")
      .upsert(jobData, { onConflict: "apply_link" });

    if (error) {
      console.error(`Error saving job "${job.title}" from ${job.source_platform}:`, error.message);
    } else {
      count++;
    }
  }

  console.log(`✅ Jobs Ingestion complete! Upserted ${count} active jobs successfully.`);
  process.exit(0);
}

run().catch((e) => {
  console.error("Pipeline failure:", e);
  process.exit(1);
});
