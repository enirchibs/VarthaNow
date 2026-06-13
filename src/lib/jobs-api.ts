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

// Seed initial mock jobs catalog mirroring the scraped targets
export const mockJobs: VaartanowJob[] = [
  {
    job_id: "job-1",
    title: "Remote React & Next.js Frontend Developer",
    company_name: "Ather Energy",
    location: "Bengaluru (Remote)",
    district: "Bengaluru",
    state: "Karnataka",
    description_snippet: "Build highly responsive frontend dashboards using React, Next.js, and TypeScript. Experience with Tailwind and Shadcn UI required.",
    full_description: "We are seeking a Frontend Developer to construct highly reliable and modern next-generation web applications. You will collaborate with our product design team to deliver micro-interactions, dark mode rendering, and performant state systems.\n\n## Requirements:\n- Strong typing experience with TypeScript.\n- Modern React Hooks and custom state optimization.\n- Infinite scrolls and virtualized list management.",
    apply_link: "https://careers.atherenergy.com/jobs/react-frontend-dev-1",
    source_platform: "SerpApi Google Jobs",
    posted_date: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    salary_range: "₹12,00,000 - ₹18,00,000 / year",
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
    title: "APPSC Group 2 recruitment (District Coordinator)",
    company_name: "Andhra Pradesh Public Service Commission",
    location: "Visakhapatnam, AP",
    district: "Visakhapatnam",
    state: "Andhra Pradesh",
    description_snippet: "Government recruitment under APPSC Group 2 services. Administrative duties, district planning and mandal oversight.",
    full_description: "The Government of Andhra Pradesh invites applications for Group 2 administrative services. Selection process includes preliminary and mains exams followed by an interview.\n\n## Syllabus and Guidelines:\nDownload the TSPSC/APPSC official PDF next to this listing. Practice with simulated micro-polls and mock tests.",
    apply_link: "https://psc.ap.gov.in/group2-recruitment-2026",
    source_platform: "Andhra Pradesh Govt Portal",
    posted_date: new Date(Date.now() - 3600000 * 20).toISOString(), // 20 hours ago
    salary_range: "₹45,000 - ₹72,000 / month",
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
    title: "Junior IT Trainee Engineer (Freshers Only)",
    company_name: "Tech Mahindra",
    location: "Hyderabad, Telangana",
    district: "Hyderabad",
    state: "Telangana",
    description_snippet: "Fresher IT jobs in Hyderabad. Learn cloud management, software deployment, and basic frontend frameworks.",
    full_description: "We are hiring Associate Trainees for our cloud & application operations. Perfect opportunity for B.Tech / MCA freshers who graduated recently.\n\n## Qualifications:\n- B.Tech (CS/IT/ECE) or MCA.\n- Basic coding knowledge in Java, Python, or JS.",
    apply_link: "https://careers.techmahindra.com/jobs/trainee-fresher-2026",
    source_platform: "SerpApi Google Jobs",
    posted_date: new Date(Date.now() - 3600000 * 12).toISOString(),
    salary_range: "₹4,50,000 - ₹6,00,000 / year",
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
    title: "Upwork Freelance Telugu Translation & Data Entry",
    company_name: "Global Tech Translators",
    location: "Remote (Work from home)",
    district: "Hyderabad",
    state: "Telangana",
    description_snippet: "Freelance data entry and Telugu translation contract. Translate English news briefings and tech summaries into Telugu.",
    full_description: "We need a Telugu translator with fast writing speed. Translation content includes localized articles, mobile news swipe cards, and job updates.\n\n## Requirements:\n- Exceptional vocabulary in standard Telugu.\n- Accurate spelling and typing speeds.",
    apply_link: "https://www.upwork.com/jobs/telugu-translation-data-entry-1",
    source_platform: "Upwork RSS",
    posted_date: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    salary_range: "₹500 - ₹900 / hour",
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
    title: "AI/ML Engineering & Web Development Intern",
    company_name: "GenAI Labs",
    location: "Bengaluru (Hybrid)",
    district: "Bengaluru",
    state: "Karnataka",
    description_snippet: "Internship opportunity for students. Train Gemini models, configure edge functions, and design AI chat plugins.",
    full_description: "Join our artificial intelligence development lab as a summer trainee. You will build and configure edge engines using Deno and Supabase.\n\n## STIPEND:\n₹25,000 / month flat.",
    apply_link: "https://internshala.com/internship/ai-development-trainee-1",
    source_platform: "Internship Finder",
    posted_date: new Date(Date.now() - 3600000 * 24).toISOString(),
    salary_range: "₹25,000 / month stipend",
    skills: ["Python", "OpenAI API", "React"],
    tags: ["Internships", "AI Jobs", "Startup"],
    logo_url: companyLogos[4],
    experience_level: "Fresher",
    work_mode: "Hybrid",
    contract_type: "Internship",
    is_featured: false,
    is_approved: true,
    is_active: true
  },
  {
    job_id: "job-6",
    title: "Panchayat Secretary (TSPSC Grade 4 Recruit)",
    company_name: "Telangana State Public Service Commission",
    location: "Hyderabad, TG",
    district: "Hyderabad",
    state: "Telangana",
    description_snippet: "Government jobs under TSPSC rural planning board. Work in mandal level administrative clusters.",
    full_description: "Government recruitment notification for Grade 4 Panchayat Secretaries in Telangana. Selection is purely merit-based through competitive state mains exam.\n\n## Timeline:\nApply online before the last date timer closes.",
    apply_link: "https://websitenew.tspsc.gov.in/panchayat-secretary-recruit-2026",
    source_platform: "TSPSC Govt Portal",
    posted_date: new Date(Date.now() - 3600000 * 48).toISOString(),
    salary_range: "₹38,000 - ₹55,000 / month",
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

      const { data, error } = await query.order("is_featured", { ascending: false }).order("posted_date", { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) return data as VaartanowJob[];
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
