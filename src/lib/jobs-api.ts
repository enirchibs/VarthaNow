import { supabase } from "./supabase";
import type { VaartanowJob, JobFilters } from "@/types/jobs";


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

// Seed initial mock jobs catalog with rich Telugu-first bilingual translations
export const mockJobs: VaartanowJob[] = [
  {
    job_id: "job-1",
    title: "రిమోట్ రియాక్ట్ & నెక్స్ట్‌జేఎస్ డెవలపర్ (Remote React & Next.js Developer)",
    company_name: "Ather Energy (ఏథర్ ఎనర్జీ)",
    location: "బెంగళూరు / హైదరాబాద్ (Remote WFH)",
    district: "Hyderabad",
    state: "Telangana",
    description_snippet: "రియాక్ట్, Next.js మరియు TypeScript ఉపయోగించి రెస్పాన్సివ్ వెబ్ యాప్‌లు తయారుచేసే అనుభవం ఉన్న డెవలపర్లు కావలెను.",
    full_description: "మా సాఫ్ట్‌వేర్ టీమ్‌లో పనిచేయడానికి టాలెంటెడ్ ఫ్రంటెండ్ డెవలపర్‌లు అవసరం.\n\n## అర్హతలు & నైపుణ్యాలు:\n- React.js, Next.js మరియు TypeScript లో అనుభవం.\n- Tailwind CSS, REST APIs & UI డిజైనింగ్ నైపుణ్యాలు.\n- ఇంటి నుండి పని చేసే (Remote WFH) సౌలభ్యం.",
    apply_link: "https://careers.atherenergy.com/jobs/react-frontend-dev-1",
    source_platform: "SerpApi Google Jobs",
    posted_date: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    salary_range: "₹12,00,000 - ₹18,00,000 / సంవత్సరం",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    tags: ["IT Jobs", "Remote IT", "AI/ML"],
    logo_url: companyLogos[0],
    experience_level: "Experienced",
    work_mode: "Remote",
    contract_type: "Full-time",
    is_featured: true,
    is_approved: true,
    is_active: true
  },
  {
    job_id: "job-2",
    title: "APPSC గ్రూప్ 2 రిక్రూట్‌మెంట్ (District Coordinator)",
    company_name: "ఆంధ్రప్రదేశ్ పబ్లిక్ సర్వీస్ కమిషన్ (APPSC)",
    location: "విశాఖపట్నం & విజయవాడ (AP)",
    district: "Visakhapatnam",
    state: "Andhra Pradesh",
    description_snippet: "ఆంధ్రప్రదేశ్ ప్రభుత్వ పరిధిలో గ్రూప్-2 ఎగ్జిక్యూటివ్ మరియు నాన్-ఎగ్జిక్యూటివ్ ఉద్యోగాలకు అధికారిక నోటిఫికేషన్.",
    full_description: "ఆంధ్రప్రదేశ్ ప్రభుత్వ వివిధ విభాగాలలో గ్రూప్-2 పోస్టుల భర్తీ ప్రక్రియ ప్రారంభమైనది.\n\n## వివరాలు:\n- అర్హత: ఏదైనా డిగ్రీ ఉత్తీర్ణత.\n- వయోపరిమితి: 18 - 42 సంవత్సరాలు (సడలింపు కలదు).\n- ఎంపిక విధానం: ప్రిలిమ్స్, మెయిన్స్ మరియు సర్టిఫికెట్ వెరిఫికేషన్.",
    apply_link: "https://psc.ap.gov.in/group2-recruitment-2026",
    source_platform: "Andhra Pradesh Govt Portal",
    posted_date: new Date(Date.now() - 3600000 * 20).toISOString(),
    salary_range: "₹45,000 - ₹72,000 / నెలకు",
    skills: ["General Studies", "Telugu Language", "Public Administration"],
    tags: ["Government", "AP Jobs"],
    logo_url: companyLogos[1],
    experience_level: "Any",
    work_mode: "On-site",
    contract_type: "Full-time",
    is_featured: true,
    is_approved: true,
    is_active: true
  },
  {
    job_id: "job-3",
    title: "జూనియర్ ఐటీ ట్రైనీ ఇంజనీర్ - ఫ్రెషర్స్ (Junior IT Trainee Engineer)",
    company_name: "Tech Mahindra (టెక్ మహీంద్రా)",
    location: "హైదరాబాద్ (హైటెక్ సిటీ, Telangana)",
    district: "Hyderabad",
    state: "Telangana",
    description_snippet: "బీటెక్ / ఎంసీఏ ఫ్రెషర్స్ కోసం సాఫ్ట్‌వేర్ ట్రైనీ ఉద్యోగాలు. క్లౌడ్, కోడింగ్ & వెబ్ డెవలప్‌మెంట్ ట్రైనింగ్ ఇవ్వబడును.",
    full_description: "హైదరాబాద్ టెక్ మహీంద్రా క్యాంపస్ లో ఫ్రెషర్స్ కొరకు అసోసియేట్ సాఫ్ట్‌వేర్ ఇంజనీర్ ఉద్యోగాలు.\n\n## అర్హతలు:\n- B.Tech (CSE, IT, ECE) / MCA ఉత్తీర్ణత.\n- Java, Python లేదా JavaScript బేసిక్స్ తెలిసి ఉండాలి.\n- మంచి కమ్యూనికేషన్ స్కిల్స్.",
    apply_link: "https://careers.techmahindra.com/jobs/trainee-fresher-2026",
    source_platform: "SerpApi Google Jobs",
    posted_date: new Date(Date.now() - 3600000 * 12).toISOString(),
    salary_range: "₹4,50,000 - ₹6,00,000 / సంవత్సరం",
    skills: ["Javascript", "HTML/CSS", "Cloud basics"],
    tags: ["Freshers", "Startup", "Hyderabad"],
    logo_url: companyLogos[2],
    experience_level: "Fresher",
    work_mode: "On-site",
    contract_type: "Full-time",
    is_featured: false,
    is_approved: true,
    is_active: true
  },
  {
    job_id: "job-4",
    title: "అప్‌వర్క్ తెలుగు ట్రాన్స్‌లేటర్ & డేటా ఎంట్రీ (Telugu Translator & Data Entry)",
    company_name: "గ్లోబల్ టెక్ ట్రాన్స్‌లేటర్స్ (Global Tech)",
    location: "వర్క్ ఫ్రమ్ హోమ్ (Remote WFH)",
    district: "Hyderabad",
    state: "Telangana",
    description_snippet: "ఇంగ్లీష్ నుండి తెలుగులోకి వార్తలు, డాక్యుమెంట్లు మరియు టెక్ సారాంశాలు అనువదించే ఫ్రీలాన్స్ పనులు.",
    full_description: "ఇంగ్లీష్ ఆర్టికల్స్ మరియు మొబైల్ న్యూస్ సారాంశాలను స్వచ్ఛమైన తెలుగులోకి అనువదించే ట్రాన్స్‌లేటర్స్ కావాలి.\n\n## అవసరమైనవి:\n- తెలుగు మరియు ఇంగ్లీష్ టైపింగ్ స్పీడ్.\n- కంప్యూటర్ లేదా లాప్‌టాప్ మరియు ఇంటర్నెట్ సౌకర్యం.\n- గంటకు ₹500 నుండి ₹900 వరకు చెల్లింపు.",
    apply_link: "https://www.upwork.com/jobs/telugu-translation-data-entry-1",
    source_platform: "Upwork RSS",
    posted_date: new Date(Date.now() - 3600000 * 2).toISOString(),
    salary_range: "₹500 - ₹900 / గంటకు",
    skills: ["Telugu Translation", "Data Entry", "Typing"],
    tags: ["Freelance", "WFH", "Telugu Jobs"],
    logo_url: companyLogos[3],
    experience_level: "Any",
    work_mode: "Remote",
    contract_type: "Freelance",
    is_featured: false,
    is_approved: true,
    is_active: true
  },
  {
    job_id: "job-5",
    title: "సాఫ్ట్‌వేర్ ట్రైనర్స్ & మెంటార్స్ (Looking for Trainers & Mentors - IT)",
    company_name: "K-HUB INDIA (కె-హబ్ ఇండియా)",
    location: "హైదరాబాద్ (మాదాపూర్, Telangana)",
    district: "Hyderabad",
    state: "Telangana",
    description_snippet: "సాఫ్ట్‌వేర్ టెక్నాలజీస్, ఫుల్‌స్టాక్ కోడింగ్ & వెబ్ డెవలప్‌మెంట్‌లో విద్యార్థులకు ట్రైనింగ్ ఇచ్చే కార్పొరేట్ ట్రైనర్లు కావలెను.",
    full_description: "ఐటీ రంగంలో ప్రముఖ సంస్థలకు కార్పొరేట్ ట్రైనర్స్ మరియు మెంటార్స్ కావలెను.\n\n## బాధ్యతలు & అర్హతలు:\n- Full-Stack, Python, Data Science లేదా React లో శిక్షణ ఇవ్వగలగడం.\n- ఆన్‌లైన్ & ఆఫ్‌లైన్ క్లాసులు నిర్వహించడం.\n- ఆకర్షణీయమైన ప్యాకేజీ & ఫ్రీలాన్స్ ఆప్షన్లు.",
    apply_link: "https://k-hub.in/careers",
    source_platform: "SerpApi Google Jobs",
    posted_date: new Date(Date.now() - 3600000 * 6).toISOString(),
    salary_range: "ఆకర్షణీయమైన ప్యాకేజీ (Competitive)",
    skills: ["IT Development", "Software Engineering", "Python", "React"],
    tags: ["IT Jobs", "Freelance", "Hyderabad"],
    logo_url: companyLogos[4],
    experience_level: "Experienced",
    work_mode: "On-site",
    contract_type: "Freelance",
    is_featured: true,
    is_approved: true,
    is_active: true
  },
  {
    job_id: "job-6",
    title: "పంచాయతీ సెక్రటరీ గ్రేడ్-4 రిక్రూట్‌మెంట్ (Panchayat Secretary TSPSC)",
    company_name: "తెలంగాణ పబ్లిక్ సర్వీస్ కమిషన్ (TSPSC)",
    location: "హైదరాబాద్ & అన్ని జిల్లాలు (Telangana)",
    district: "Hyderabad",
    state: "Telangana",
    description_snippet: "తెలంగాణ రాష్ట్ర పంచాయతీరాజ్ మరియు గ్రామీణాభివృద్ధి శాఖలో గ్రేడ్-4 పంచాయతీ కార్యదర్శి ఉద్యోగాలు.",
    full_description: "గ్రామీణ ప్రాంతాలలో ప్రభుత్వ సంక్షేమ పథకాలు మరియు పరిపాలన నిర్వహణకు పంచాయతీ సెక్రటరీ పోస్టులు.\n\n## ముఖ్య వివరాలు:\n- విద్యార్హత: గుర్తింపు పొందిన యూనివర్సిటీ నుండి ఏదైనా డిగ్రీ.\n- అధికారిక వెబ్‌సైట్ ద్వారా ఆన్‌లైన్‌లో దరఖాస్తు చేసుకోండి.",
    apply_link: "https://websitenew.tspsc.gov.in/panchayat-secretary-recruit-2026",
    source_platform: "TSPSC Govt Portal",
    posted_date: new Date(Date.now() - 3600000 * 48).toISOString(),
    salary_range: "₹38,000 - ₹55,000 / నెలకు",
    skills: ["Rural Development", "General Studies"],
    tags: ["Government", "Telangana Jobs"],
    logo_url: companyLogos[1],
    experience_level: "Any",
    work_mode: "On-site",
    contract_type: "Full-time",
    is_featured: false,
    is_approved: true,
    is_active: true
  }
];

// ====================================================
// TELUGU TRANSLATION HELPERS
// ====================================================
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

export function autoDetectContractType(title: string, desc: string): "Full-time" | "Part-time" | "Contract" | "Freelance" | "Internship" {
  const text = `${title} ${desc}`.toLowerCase();
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
export const LOCAL_STORAGE_KEY = "vaartanow_jobs_db";

export function getLocalJobs(): VaartanowJob[] {
  if (typeof window === "undefined") return mockJobs;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockJobs));
    return mockJobs;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return mockJobs;
  }
}

export function saveLocalJobs(jobs: VaartanowJob[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(jobs));
  }
}

export async function getJobsList(filters?: JobFilters): Promise<VaartanowJob[]> {
  // If Supabase client exists, fetch dynamically from Remote PostgreSQL table
  if (supabase) {
    try {
      let query = supabase.from("vaartanow_jobs").select("*").eq("is_active", true).eq("is_approved", true);

      if (filters?.query) {
        // GIN full text search helper or standard ilike fallback
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

      if (error) throw error;
      if (data && data.length > 0) {
        saveLocalJobs(data as VaartanowJob[]);
        return data as VaartanowJob[];
      }
    } catch (err) {
      console.warn("Failed to query Supabase, falling back to mock jobs catalog:", err);
    }
  }

  // Client-side fallback filtered feed (only active and approved)
  let result = getLocalJobs().filter(j => j.is_active && j.is_approved);
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
    result = result.filter((j) => j.district?.toLowerCase().includes(filters.district!.toLowerCase()));
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
export async function triggerScraperSimulation(query: string): Promise<number> {
  const scrapedJobs: Omit<VaartanowJob, "job_id">[] = [
    {
      title: `${query} Developer (React & Next.js)`,
      company_name: "Wipro Global Tech",
      location: "Hyderabad, TG",
      district: "Hyderabad",
      state: "Telangana",
      description_snippet: `Exciting new vacancy for a ${query} engineer. Help construct scalable UI modules and integrate AI APIs.`,
      full_description: `We are searching for developers with expertise in ${query} and associated modern React methodologies. In this role, you will be deploying code at high volume and collaborating across global tech hubs.\n\nSkills Needed:\n- JavaScript/TypeScript\n- React/Next.js\n- API consumption and state systems`,
      apply_link: `https://careers.wipro.com/jobs/scraped-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      source_platform: "SerpApi Google Jobs",
      posted_date: new Date().toISOString(),
      salary_range: "₹9,50,000 - ₹15,00,000 / year",
      skills: [query, "React", "TypeScript", "Tailwind CSS"],
      tags: ["IT Jobs", "Startup"],
      logo_url: "https://images.unsplash.com/photo-1516841273335-e39b37888115?auto=format&fit=crop&w=120&h=120&q=80",
      experience_level: "Fresher",
      work_mode: "Hybrid",
      contract_type: "Full-time",
      is_featured: false,
      is_approved: false, // Admin approval required!
      is_active: true
    } as VaartanowJob,
    {
      title: `Freelance Telugu Translator for ${query} documentation`,
      company_name: "OneForma Solutions",
      location: "Remote (Work from home)",
      district: "Visakhapatnam",
      state: "Andhra Pradesh",
      description_snippet: `Translate modern technical modules and user-facing dashboards for ${query} into standard literary Telugu.`,
      full_description: `Seeking freelance translation consultants fluent in English and standard literary Telugu. Background in software systems or IT nomenclature is highly beneficial.\n\nDetails:\n- Project length: 3 months\n- Hours: Flexible remote hours`,
      apply_link: `https://www.upwork.com/jobs/scraped-transl-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      source_platform: "Upwork RSS",
      posted_date: new Date().toISOString(),
      salary_range: "₹500 - ₹850 / hour",
      skills: ["Telugu Translation", query, "Writing"],
      tags: ["Freelance", "WFH", "Telugu Jobs"],
      logo_url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=120&h=120&q=80",
      experience_level: "Any",
      work_mode: "Remote",
      contract_type: "Freelance",
      is_featured: false,
      is_approved: false, // Admin approval required!
      is_active: true
    } as VaartanowJob
  ];

  if (supabase) {
    try {
      let count = 0;
      for (const job of scrapedJobs) {
        const { error } = await supabase.from("vaartanow_jobs").upsert(job, { onConflict: "apply_link" });
        if (!error) count++;
      }
      if (count > 0) return count;
    } catch (e) {
      console.warn("Supabase upsert error in scraper simulation:", e);
    }
  }

  const jobs = getLocalJobs();
  let count = 0;
  for (const job of scrapedJobs) {
    if (!jobs.some(j => j.apply_link === job.apply_link)) {
      jobs.unshift({
        ...job,
        job_id: `job-scraped-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
      });
      count++;
    }
  }
  saveLocalJobs(jobs);
  return count;
}

// 💼 Add new user posted job
export function addLocalJob(jobData: Omit<VaartanowJob, "job_id" | "posted_date">): VaartanowJob {
  const newJob: VaartanowJob = {
    ...jobData,
    job_id: `job-user-${Date.now()}`,
    posted_date: new Date().toISOString(),
    is_approved: true,
    is_active: true
  };
  const jobs = getLocalJobs();
  jobs.unshift(newJob);
  saveLocalJobs(jobs);

  // Optionally insert into Supabase public.jobs table if connected
  if (supabase) {
    (async () => {
      try {
        await supabase.from("jobs").insert({
          title: newJob.title,
          company_name: newJob.company_name,
          location: newJob.location,
          salary_range: newJob.salary_range,
          description: newJob.full_description,
          contact: newJob.contact_phone || "",
          work_mode: newJob.work_mode,
          contract_type: newJob.contract_type
        });
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
