import { supabase } from "./supabase";
import type { VaartanowJob, JobFilters, ContractType } from "@/types/jobs";


// ====================================================
// STABLE CRAWLER SIMULATOR FOR SERPAPI / UPWORK RSS
// ====================================================

// 5 Highly available placeholder logos for companies
const companyLogos = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80",
  "https://images.unsplash.com/photo-1516841273335-e39b37888115?auto=format&fit=crop&w=120&h=120&q=80",
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=120&h=120&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=120&h=120&q=80",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=120&h=120&q=80"
];

// Jobs come only from Supabase and the user's own posts; no seeded listings.
export const mockJobs: VaartanowJob[] = [];

// ====================================================
// TELUGU TRANSLATION HELPERS
// ====================================================
export function formatJobTitleTelugu(title?: string): string {
  if (!title) return "ఉద్యోగ ప్రకటన (Job Vacancy)";
  
  // If the title already contains Telugu characters, return it cleanly
  if (/[\u0C00-\u0C7F]/.test(title)) {
    return title;
  }

  const t = title.toLowerCase();

  // 1. Management & Leadership Roles
  if (t.includes("technical manager") || t.includes("tech manager")) return `టెక్నికల్ మేనేజర్ (${title})`;
  if (t.includes("engineering manager")) return `ఇంజనీరింగ్ మేనేజర్ (${title})`;
  if (t.includes("project manager") || t.includes("program manager")) return `ప్రాజెక్ట్ మేనేజర్ (${title})`;
  if (t.includes("product manager")) return `ప్రొడక్ట్ మేనేజర్ (${title})`;
  if (t.includes("operations manager") || t.includes("operation manager")) return `ఆపరేషన్స్ మేనేజర్ (${title})`;
  if (t.includes("general manager") || t.includes(" gm ")) return `జనరల్ మేనేజర్ (${title})`;
  if (t.includes("branch manager")) return `బ్రాంచ్ మేనేజర్ (${title})`;
  if (t.includes("store manager") || t.includes("showroom manager") || t.includes("shop manager")) return `స్టోర్ మేనేజర్ (${title})`;
  if (t.includes("sales manager")) return `సేల్స్ మేనేజర్ (${title})`;
  if (t.includes("marketing manager")) return `మార్కెటింగ్ మేనేజర్ (${title})`;
  if (t.includes("finance manager") || t.includes("accounts manager")) return `ఫైనాన్స్ & అకౌంట్స్ మేనేజర్ (${title})`;
  if (t.includes("relationship manager") || t.includes("rm -") || t.includes("bank rm")) return `రిలేషన్‌షిప్ మేనేజర్ (${title})`;
  if (t.includes("quality manager") || t.includes("qa manager")) return `క్వాలిటీ మేనేజర్ (${title})`;
  if (t.includes("assistant manager") || t.includes("ast. manager")) return `అసిస్టెంట్ మేనేజర్ (${title})`;
  if (t.includes("deputy manager")) return `డిప్యూటీ మేనేజర్ (${title})`;
  if (t.includes("manager")) return `మేనేజర్ (${title})`;

  // 2. Technical Leads & Architects
  if (t.includes("tech lead") || t.includes("technical lead") || t.includes("team lead") || t.includes("team leader")) return `టెక్నికల్ టీమ్ లీడ్ (${title})`;
  if (t.includes("architect") || t.includes("solution architect") || t.includes("cloud architect")) return `సొల్యూషన్ ఆర్కిటెక్ట్ (${title})`;
  if (t.includes("scrum master") || t.includes("agile coach")) return `స్క్రమ్ మాస్టర్ (${title})`;
  if (t.includes("consultant") || t.includes("advisor")) return `కన్సల్టెంట్ (${title})`;
  if (t.includes("business analyst") || t.includes("system analyst")) return `బిజినెస్ అనలిస్ట్ (${title})`;

  // 3. Software Developers & Engineers
  if (t.includes("react") && (t.includes("developer") || t.includes("engineer"))) return `రియాక్ట్ డెవలపర్ (${title})`;
  if (t.includes("next.js") || t.includes("nextjs")) return `నెక్స్ట్‌జేఎస్ డెవలపర్ (${title})`;
  if (t.includes("angular") && (t.includes("developer") || t.includes("engineer"))) return `యాంగులర్ డెవలపర్ (${title})`;
  if (t.includes("vue") && (t.includes("developer") || t.includes("engineer"))) return `వ్యూ జేఎస్ డెవలపర్ (${title})`;
  if (t.includes("frontend") || t.includes("front end") || t.includes("front-end")) return `ఫ్రంటెండ్ డెవలపర్ (${title})`;
  if (t.includes("backend") || t.includes("back end") || t.includes("back-end")) return `బ్యాకెండ్ డెవలపర్ (${title})`;
  if (t.includes("full stack") || t.includes("fullstack") || t.includes("full-stack")) return `ఫుల్‌స్టాక్ డెవలపర్ (${title})`;
  if (t.includes("python") && (t.includes("developer") || t.includes("engineer"))) return `పైథాన్ డెవలపర్ (${title})`;
  if (t.includes("java") && (t.includes("developer") || t.includes("engineer"))) return `జావా డెవలపర్ (${title})`;
  if (t.includes("node") && (t.includes("developer") || t.includes("engineer"))) return `నోడ్ జేఎస్ డెవలపర్ (${title})`;
  if (t.includes("flutter") || t.includes("react native") || t.includes("ios developer") || t.includes("android developer") || t.includes("mobile app")) return `మొబైల్ యాప్ డెవలపర్ (${title})`;
  if (t.includes("software engineer") || t.includes("software developer") || t.includes("programmer") || t.includes("coder")) return `సాఫ్ట్‌వేర్ ఇంజనీర్ (${title})`;
  if (t.includes("trainee") || t.includes("fresher")) return `ట్రైనీ ఇంజనీర్ / ఫ్రెషర్ (${title})`;

  // 4. Data, AI & Cloud
  if (t.includes("ai engineer") || t.includes("machine learning") || t.includes("ml engineer") || t.includes("artificial intelligence")) return `ఏఐ & మెషిన్ లెర్నింగ్ ఇంజనీర్ (${title})`;
  if (t.includes("data scientist")) return `డేటా సైంటిస్ట్ (${title})`;
  if (t.includes("data analyst")) return `డేటా అనలిస్ట్ (${title})`;
  if (t.includes("data engineer")) return `డేటా ఇంజనీర్ (${title})`;
  if (t.includes("devops") || t.includes("cloud engineer") || t.includes("aws") || t.includes("azure")) return `డెవాప్స్ & క్లౌడ్ ఇంజనీర్ (${title})`;
  if (t.includes("sysadmin") || t.includes("system admin") || t.includes("network engineer") || t.includes("it support")) return `సిస్టమ్ & నెట్‌వర్క్ ఇంజనీర్ (${title})`;
  if (t.includes("cyber security") || t.includes("cybersecurity") || t.includes("security analyst") || t.includes("soc analyst")) return `సైబర్ సెక్యూరిటీ అనలిస్ట్ (${title})`;
  if (t.includes("dba") || t.includes("database admin") || t.includes("sql developer")) return `డేటాబేస్ అడ్మినిస్ట్రేటర్ (${title})`;

  // 5. QA, UI/UX & Design
  if (t.includes("qa") || t.includes("tester") || t.includes("quality assurance") || t.includes("test engineer")) return `టెస్టింగ్ ఇంజనీర్ (${title})`;
  if (t.includes("ui/ux") || t.includes("ui ux") || t.includes("ui designer") || t.includes("ux designer")) return `యూఐ/యూఎక్స్ డిజైనర్ (${title})`;
  if (t.includes("graphic designer") || t.includes("photoshop") || t.includes("video editor") || t.includes("animator")) return `గ్రాఫిక్ డిజైనర్ / ఎడిటర్ (${title})`;

  // 6. Business, Marketing & Operations
  if (t.includes("marketing") || t.includes("digital marketing") || t.includes("seo") || t.includes("social media")) return `డిజిటల్ మార్కెటింగ్ (${title})`;
  if (t.includes("content writer") || t.includes("copywriter") || t.includes("content creator")) return `కంటెంట్ రైటర్ (${title})`;
  if (t.includes("translator") || t.includes("translation")) return `తెలుగు అనువాదకుడు / ట్రాన్స్‌లేటర్ (${title})`;
  if (t.includes("data entry") || t.includes("typing") || t.includes("computer operator")) return `డేటా ఎంట్రీ ఆపరేటర్ (${title})`;
  if (t.includes("hr ") || t.includes("human resource") || t.includes("recruiter") || t.includes("talent acquisition")) return `హెచ్‌ఆర్ రిక్రూటర్ (${title})`;
  if (t.includes("accountant") || t.includes("accounting") || t.includes("tally") || t.includes("auditor") || t.includes("ca inter")) return `అకౌంటెంట్ (${title})`;
  if (t.includes("sales") || t.includes("business development") || t.includes("bde") || t.includes("field sales")) return `సేల్స్ ఎగ్జిక్యూటివ్ (${title})`;
  if (t.includes("telecaller") || t.includes("bpo") || t.includes("customer care") || t.includes("customer support") || t.includes("call center")) return `కస్టమర్ కేర్ / టెలికాలర్ (${title})`;
  if (t.includes("office assistant") || t.includes("front office") || t.includes("admin assistant") || t.includes("receptionist") || t.includes("front desk")) return `ఆఫీస్ అసిస్టెంట్ / రిసెప్షనిస్ట్ (${title})`;
  if (t.includes("cashier") || t.includes("billing")) return `క్యాషియర్ / బిల్లింగ్ ఆపరేటర్ (${title})`;
  if (t.includes("supervisor")) return `సూపర్‌వైజర్ (${title})`;

  // 7. Core Engineering & Construction
  if (t.includes("civil engineer") || t.includes("site engineer") || t.includes("site supervisor")) return `సివిల్ & సైట్ ఇంజనీర్ (${title})`;
  if (t.includes("mechanical engineer") || t.includes("autocad")) return `మెకానికల్ ఇంజనీర్ (${title})`;
  if (t.includes("electrical engineer") || t.includes("electrician")) return `ఎలక్ట్రికల్ ఇంజనీర్ / ఎలక్ట్రీషియన్ (${title})`;

  // 8. Healthcare, Teaching, Logistics & Public Sector
  if (t.includes("pharmacist") || t.includes("pharmacy") || t.includes("nurse") || t.includes("nursing") || t.includes("doctor") || t.includes("lab technician")) return `మెడికల్ & హెల్త్‌కేర్ స్టాఫ్ (${title})`;
  if (t.includes("teacher") || t.includes("tutor") || t.includes("faculty") || t.includes("trainer") || t.includes("professor") || t.includes("lecturer")) return `టీచర్ / లెక్చరర్ / ట్రైనర్ (${title})`;
  if (t.includes("delivery") || t.includes("courier") || t.includes("zomato") || t.includes("swiggy")) return `డెలివరీ బాయ్ / ఎగ్జిక్యూటివ్ (${title})`;
  if (t.includes("driver") || t.includes("chauffeur")) return `డ్రైవర్ (${title})`;
  if (t.includes("security") || t.includes("guard")) return `సెక్యూరిటీ గార్డ్ (${title})`;
  if (t.includes("helper") || t.includes("attender") || t.includes("peon") || t.includes("worker") || t.includes("housekeeping")) return `హెల్పర్ / అటెండర్ (${title})`;
  if (t.includes("cook") || t.includes("chef")) return `వంట మాస్టర్ / చెఫ్ (${title})`;
  if (t.includes("appsc") || t.includes("tspsc") || t.includes("government") || t.includes("police") || t.includes("railway") || t.includes("ssc") || t.includes("upsc") || t.includes("govt")) return `ప్రభుత్వ ఉద్యోగం (${title})`;

  // Default fallback with clear Telugu indicator
  return `ఉద్యోగం: ${title}`;
}

export function formatWorkModeTelugu(mode?: string): string {
  if (!mode) return "ఆఫీస్ లో (On-site)";
  const m = mode.toLowerCase();
  if (m.includes("remote") || m.includes("wfh")) return "🏠 వర్క్ ఫ్రమ్ హోమ్ (Remote)";
  if (m.includes("hybrid")) return "🔄 హైబ్రిడ్ (Hybrid)";
  return "🏢 ఆఫీస్ లో (On-site)";
}

export function formatContractTypeTelugu(type?: string): string {
  if (!type) return "పూర్తి సమయం (Full-time)";
  const t = type.toLowerCase();
  if (t.includes("apprentice") || t.includes("అప్రెంటిస్")) return "🛠️ అప్రెంటిస్‌షిప్ (Apprenticeship)";
  if (t.includes("freelance")) return "💻 ఫ్రీలాన్స్ (Freelance)";
  if (t.includes("intern")) return "🎯 ఇంటర్న్‌షిప్ (Internship)";
  if (t.includes("contract") || t.includes("temp")) return "📜 కాంట్రాక్ట్ (Contract)";
  if (t.includes("part")) return "⏱️ పార్ట్-టైమ్ (Part-time)";
  return "💼 పూర్తి సమయం (Full-time)";
}

export function formatExperienceTelugu(exp?: string): string {
  if (!exp) return "అందరికీ (Any)";
  const e = exp.toLowerCase();
  if (e.includes("fresh")) return "🎓 ఫ్రెషర్స్ (Fresher)";
  if (e.includes("exp")) return "💼 అనుభవం ఉన్నవారు (Experienced)";
  return "🌟 అందరూ దరఖాస్తు చేసుకోవచ్చు (Any)";
}

export function formatSalaryTelugu(sal?: string): string {
  if (!sal) return "ఆకర్షణీయమైన జీతం (Competitive)";
  if (sal.toLowerCase().includes("competitive")) return "ఆకర్షణీయమైన జీతం (Competitive)";
  return sal;
}

// ====================================================
// AUTO-DETECTION AND COMPILING ENGINE
// ====================================================
export function autoDetectWorkMode(title: string, desc: string): "Remote" | "Hybrid" | "On-site" {
  const text = `${title} ${desc}`.toLowerCase();
  if (text.includes("remote") || text.includes("wfh") || text.includes("work from home")) {
    return "Remote";
  }
  if (text.includes("hybrid") || text.includes("flexible onsite")) {
    return "Hybrid";
  }
  return "On-site";
}

export function autoDetectContractType(title: string, desc: string): ContractType {
  const text = `${title} ${desc}`.toLowerCase();
  if (text.includes("apprentice") || text.includes("apprenticeship") || text.includes("అప్రెంటిస్")) {
    return "Apprenticeship";
  }
  if (text.includes("intern") || text.includes("internship") || text.includes("trainee")) {
    return "Internship";
  }
  if (text.includes("freelance") || text.includes("upwork") || text.includes("fiverr")) {
    return "Freelance";
  }
  if (text.includes("contract") || text.includes("temp") || text.includes("temporary")) {
    return "Contract";
  }
  if (text.includes("part-time") || text.includes("part time")) {
    return "Part-time";
  }
  return "Full-time";
}

// ====================================================
// DATABASE QUERIES & API INTERFACES
// ====================================================
export const JOB_MAX_AGE_DAYS = 30;
export const LOCAL_STORAGE_KEY = "vaartanow_jobs_db_v2"; // v2: drops cached seed listings
export const USER_POSTED_JOBS_KEY = "vaartanow_user_posted_jobs";
export const JOBS_UPDATED_EVENT = "vaartanow_jobs_updated";

export function getUserPostedJobs(): VaartanowJob[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USER_POSTED_JOBS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUserPostedJob(job: VaartanowJob) {
  if (typeof window === "undefined") return;
  try {
    const existing = getUserPostedJobs();
    const updated = [job, ...existing.filter(j => j.job_id !== job.job_id)];
    localStorage.setItem(USER_POSTED_JOBS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(JOBS_UPDATED_EVENT, { detail: job }));
  } catch (e) {
    console.warn("Failed to save user job:", e);
  }
}

export function getLocalJobs(): VaartanowJob[] {
  if (typeof window === "undefined") return mockJobs;
  const userJobs = getUserPostedJobs();
  const userJobIds = new Set(userJobs.map(j => j.job_id));

  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  let baseJobs = mockJobs;
  if (stored) {
    try {
      baseJobs = JSON.parse(stored);
    } catch (e) {
      baseJobs = mockJobs;
    }
  }
  // User jobs always stay at top
  return [...userJobs, ...baseJobs.filter(j => !userJobIds.has(j.job_id))];
}

export function saveLocalJobs(jobs: VaartanowJob[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(jobs));
  }
}

export async function getJobsList(filters?: JobFilters): Promise<VaartanowJob[]> {
  const userJobs = getUserPostedJobs();
  const userJobIds = new Set(userJobs.map(j => j.job_id));

  let fetchedJobs: VaartanowJob[] = [];

  // If Supabase client exists, fetch dynamically from Remote PostgreSQL table
  if (supabase) {
    try {
      // Only jobs posted in the last 30 days: older listings are very likely filled or expired.
      const freshSince = new Date(Date.now() - JOB_MAX_AGE_DAYS * 86_400_000).toISOString();
      let query = supabase.from("vaartanow_jobs").select("*").eq("is_active", true).eq("is_approved", true).gte("posted_date", freshSince);

      if (filters?.query) {
        query = query.or(`title.ilike.%${filters.query}%,company_name.ilike.%${filters.query}%,description_snippet.ilike.%${filters.query}%`);
      }
      if (filters?.workMode && filters.workMode !== "all") {
        query = query.eq("work_mode", filters.workMode);
      }
      if (filters?.experienceLevel && filters.experienceLevel !== "all") {
        query = query.eq("experience_level", filters.experienceLevel);
      }
      if (filters?.contractType && filters.contractType !== "all") {
        query = query.eq("contract_type", filters.contractType);
      }
      if (filters?.district) {
        query = query.ilike("district", `%${filters.district}%`);
      }
      if (filters?.state) {
        query = query.ilike("state", `%${filters.state}%`);
      }

      const { data, error } = await query
        .order("is_featured", { ascending: false })
        .order("posted_date", { ascending: false })
        .limit(1000);

      if (!error && data && data.length > 0) {
        fetchedJobs = data as VaartanowJob[];
      }
    } catch (err) {
      console.warn("Failed to query Supabase jobs:", err);
    }
  }

  if (fetchedJobs.length === 0) {
    const rawStored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (rawStored) {
      try {
        fetchedJobs = JSON.parse(rawStored);
      } catch {
        fetchedJobs = mockJobs;
      }
    } else {
      fetchedJobs = mockJobs;
    }
  }

  // Combined: User posted jobs ALWAYS placed at the very top!
  const combined = [...userJobs, ...fetchedJobs.filter(j => !userJobIds.has(j.job_id))];
  saveLocalJobs(combined);

  // Client-side fallback filtered feed (only active and approved)
  const freshCutoff = Date.now() - JOB_MAX_AGE_DAYS * 86_400_000;
  let result = combined.filter(j => j.is_active && (j.is_approved || userJobIds.has(j.job_id)) && (!j.posted_date || new Date(j.posted_date).getTime() >= freshCutoff));
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    result = result.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company_name.toLowerCase().includes(q) ||
        j.description_snippet.toLowerCase().includes(q) ||
        j.skills.some((s) => s.toLowerCase().includes(q))
    );
  }
  if (filters?.workMode && filters.workMode !== "all") {
    result = result.filter((j) => j.work_mode === filters.workMode);
  }
  if (filters?.experienceLevel && filters.experienceLevel !== "all") {
    result = result.filter((j) => j.experience_level === filters.experienceLevel);
  }
  if (filters?.contractType && filters.contractType !== "all") {
    result = result.filter((j) => j.contract_type === filters.contractType);
  }
  if (filters?.district) {
    const raw = filters.district.toLowerCase().trim();
    const tokens = raw.split(/[,\s\(\)\/–—]+/).filter((t) => t.length >= 2);
    result = result.filter((j) => {
      const matchFull =
        j.district?.toLowerCase().includes(raw) ||
        j.location?.toLowerCase().includes(raw) ||
        (j.tags || []).some((t) => t.toLowerCase().includes(raw));
      if (matchFull) return true;
      return tokens.some(
        (token) =>
          j.district?.toLowerCase().includes(token) ||
          j.location?.toLowerCase().includes(token) ||
          (j.tags || []).some((t) => t.toLowerCase().includes(token)) ||
          j.title.toLowerCase().includes(token)
      );
    });
  }
  return result;
}

// 🏛️ Admin: Get all jobs (including pending and inactive)
export async function getAdminJobsList(): Promise<VaartanowJob[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("vaartanow_jobs")
        .select("*")
        .order("posted_date", { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) return data as VaartanowJob[];
    } catch (err) {
      console.warn("Failed to query admin jobs from Supabase:", err);
    }
  }
  return getLocalJobs();
}

// 🏛️ Admin: Approve Job
export async function approveJob(jobId: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase.from("vaartanow_jobs").update({ is_approved: true }).eq("job_id", jobId);
      if (!error) return true;
    } catch (e) {
      console.warn("Supabase update error:", e);
    }
  }
  const jobs = getLocalJobs();
  const index = jobs.findIndex(j => j.job_id === jobId);
  if (index !== -1) {
    jobs[index].is_approved = true;
    saveLocalJobs(jobs);
    return true;
  }
  return false;
}

// 🏛️ Admin: Toggle Featured
export async function toggleFeaturedJob(jobId: string): Promise<boolean> {
  let currentFeatured = false;
  if (supabase) {
    try {
      const { data } = await supabase.from("vaartanow_jobs").select("is_featured").eq("job_id", jobId).single();
      if (data) {
        currentFeatured = data.is_featured;
        const { error } = await supabase.from("vaartanow_jobs").update({ is_featured: !currentFeatured }).eq("job_id", jobId);
        if (!error) return true;
      }
    } catch (e) {
      console.warn("Supabase update error:", e);
    }
  }
  const jobs = getLocalJobs();
  const index = jobs.findIndex(j => j.job_id === jobId);
  if (index !== -1) {
    jobs[index].is_featured = !jobs[index].is_featured;
    saveLocalJobs(jobs);
    return true;
  }
  return false;
}

// 🏛️ Admin: Delete Job (Soft Delete)
export async function deleteJob(jobId: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase.from("vaartanow_jobs").update({ is_active: false }).eq("job_id", jobId);
      if (!error) return true;
    } catch (e) {
      console.warn("Supabase delete error:", e);
    }
  }
  const jobs = getLocalJobs();
  const index = jobs.findIndex(j => j.job_id === jobId);
  if (index !== -1) {
    jobs[index].is_active = false;
    saveLocalJobs(jobs);
    return true;
  }
  return false;
}

// 🏛️ Admin: Add Custom Job Listing
export async function addJob(job: Omit<VaartanowJob, "job_id" | "created_at">): Promise<VaartanowJob> {
  const newJob: VaartanowJob = {
    ...job,
    job_id: `job-local-${Date.now()}`,
    created_at: new Date().toISOString()
  } as VaartanowJob;

  if (supabase) {
    try {
      const { data, error } = await supabase.from("vaartanow_jobs").insert(newJob).select().single();
      if (!error && data) return data as VaartanowJob;
    } catch (e) {
      console.warn("Supabase insert error:", e);
    }
  }

  const jobs = getLocalJobs();
  jobs.unshift(newJob);
  saveLocalJobs(jobs);
  return newJob;
}

// 🏛️ Admin: Trigger Scraper Simulation
// 💼 Add new user posted job
export function addLocalJob(jobData: Omit<VaartanowJob, "job_id" | "posted_date">): VaartanowJob {
  const newJob: VaartanowJob = {
    ...jobData,
    job_id: `job-user-${Date.now()}`,
    posted_date: new Date().toISOString(),
    // Visitor posts wait for admin approval (enforced by the database too).
    is_approved: false,
    is_active: true,
    is_featured: false
  };

  // 1. Permanently save to dedicated user-posted store
  saveUserPostedJob(newJob);

  // 2. Also prepend to current local database
  const jobs = getLocalJobs();
  const deduped = [newJob, ...jobs.filter(j => j.job_id !== newJob.job_id)];
  saveLocalJobs(deduped);

  // 3. Insert into Supabase 'vaartanow_jobs' table if connected
  if (supabase) {
    (async () => {
      try {
        // job_id is generated by the database; only columns that exist are sent.
        const { error } = await supabase.from("vaartanow_jobs").insert({
          title: newJob.title,
          company_name: newJob.company_name,
          location: newJob.location,
          district: newJob.district || "",
          state: newJob.state || "Andhra Pradesh",
          salary_range: newJob.salary_range,
          description_snippet: newJob.description_snippet,
          full_description: newJob.full_description,
          apply_link: newJob.apply_link,
          source_platform: newJob.source_platform || "VaartaNow Jobs Board",
          skills: newJob.skills || [],
          tags: newJob.tags || [],
          experience_level: newJob.experience_level,
          work_mode: newJob.work_mode,
          contract_type: newJob.contract_type,
          is_featured: false,
          is_approved: false,
          is_active: true
        });
        if (error) console.warn("Job submission failed:", error.message);
      } catch (err) {
        console.warn("Supabase jobs insert notice:", err);
      }
    })();
  }

  return newJob;
}

// 🏛️ Admin Dashboard metrics
export async function getAdminMetrics() {
  const list = await getAdminJobsList();
  
  const total = list.filter((j) => j.is_active).length;
  const pending = list.filter((j) => j.is_active && !j.is_approved).length;
  const featured = list.filter((j) => j.is_active && j.is_featured).length;
  const remote = list.filter((j) => j.is_active && j.work_mode === "Remote").length;
  const gov = list.filter((j) => j.is_active && j.tags.includes("Government")).length;
  
  // Compute trending skills
  const skillsCount: Record<string, number> = {};
  list.filter((j) => j.is_active).forEach((j) => {
    j.skills.forEach((s) => {
      skillsCount[s] = (skillsCount[s] || 0) + 1;
    });
  });
  
  const trendingSkills = Object.keys(skillsCount)
    .map((name) => ({ name, count: skillsCount[name] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  const sources = [
    { name: "SerpApi Google Jobs", count: list.filter((j) => j.is_active && j.source_platform.includes("Serp")).length },
    { name: "Upwork RSS", count: list.filter((j) => j.is_active && j.source_platform.includes("Upwork")).length },
    { name: "Local Portals", count: list.filter((j) => j.is_active && !j.source_platform.includes("Upwork") && !j.source_platform.includes("Serp")).length }
  ];

  return {
    total,
    pending,
    featured,
    remote,
    gov,
    trendingSkills,
    sources
  };
}
