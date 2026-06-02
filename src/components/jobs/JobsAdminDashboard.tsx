import { useEffect, useState } from "react";
import { 
  Briefcase, 
  Check, 
  Trash2, 
  Star, 
  Plus, 
  RefreshCw, 
  Search, 
  MapPin, 
  Building2, 
  TrendingUp, 
  BarChart3, 
  SlidersHorizontal,
  Clock,
  Sparkles
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  getAdminJobsList, 
  getAdminMetrics, 
  approveJob, 
  toggleFeaturedJob, 
  deleteJob, 
  addJob, 
  triggerScraperSimulation 
} from "@/lib/jobs-api";
import type { VaartanowJob, ExperienceLevel, WorkMode, ContractType } from "@/types/jobs";

export function JobsAdminDashboard() {
  const { lang } = useLanguage();
  const [jobs, setJobs] = useState<VaartanowJob[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Search/Filters in Admin
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending" | "deleted">("all");

  // Scraper Trigger
  const [scraperKeyword, setScraperKeyword] = useState("React");
  const [scraperLogs, setScraperLogs] = useState<string[]>([]);
  const [scraping, setScraping] = useState(false);

  // Custom Job Form Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    company_name: "",
    location: "",
    district: "",
    state: "Telangana",
    description_snippet: "",
    full_description: "",
    apply_link: "",
    source_platform: "Local Admin",
    salary_range: "",
    skills: "",
    tags: "",
    experience_level: "Fresher" as ExperienceLevel,
    work_mode: "Remote" as WorkMode,
    contract_type: "Full-time" as ContractType
  });

  async function loadData() {
    setLoading(true);
    try {
      const jobList = await getAdminJobsList();
      const stats = await getAdminMetrics();
      setJobs(jobList);
      setMetrics(stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    await approveJob(id);
    await loadData();
    setActionLoading(null);
  };

  const handleToggleFeatured = async (id: string) => {
    setActionLoading(id);
    await toggleFeaturedJob(id);
    await loadData();
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      setActionLoading(id);
      await deleteJob(id);
      await loadData();
      setActionLoading(null);
    }
  };

  const handleTriggerScraper = async () => {
    if (!scraperKeyword.trim()) return;
    setScraping(true);
    setScraperLogs(prev => [`[${new Date().toLocaleTimeString()}] Triggering simulated SerpApi & Upwork crawler for keyword "${scraperKeyword}"...`, ...prev]);
    
    setTimeout(async () => {
      try {
        const count = await triggerScraperSimulation(scraperKeyword);
        setScraperLogs(prev => [
          `[${new Date().toLocaleTimeString()}] ✓ Scraper simulation complete!`,
          `[${new Date().toLocaleTimeString()}]   -> Added ${count} new pending jobs awaiting approval.`,
          ...prev
        ]);
        await loadData();
      } catch (e) {
        setScraperLogs(prev => [`[${new Date().toLocaleTimeString()}] ✗ Scraper error: ${e}`, ...prev]);
      } finally {
        setScraping(false);
      }
    }, 1500);
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.company_name || !newJob.apply_link) {
      alert("Please fill in all required fields!");
      return;
    }

    const skillsArray = newJob.skills.split(",").map(s => s.trim()).filter(Boolean);
    const tagsArray = newJob.tags.split(",").map(t => t.trim()).filter(Boolean);

    const jobData = {
      title: newJob.title,
      company_name: newJob.company_name,
      location: newJob.location,
      district: newJob.district || undefined,
      state: newJob.state,
      description_snippet: newJob.description_snippet,
      full_description: newJob.full_description || newJob.description_snippet,
      apply_link: newJob.apply_link,
      source_platform: newJob.source_platform,
      salary_range: newJob.salary_range || undefined,
      skills: skillsArray.length > 0 ? skillsArray : ["React", "CSS"],
      tags: tagsArray.length > 0 ? tagsArray : ["IT Jobs"],
      experience_level: newJob.experience_level,
      work_mode: newJob.work_mode,
      contract_type: newJob.contract_type,
      posted_date: new Date().toISOString(),
      is_featured: false,
      is_approved: true, // Admin-posted jobs are pre-approved!
      is_active: true
    };

    try {
      await addJob(jobData);
      setShowAddModal(false);
      // Reset form
      setNewJob({
        title: "",
        company_name: "",
        location: "",
        district: "",
        state: "Telangana",
        description_snippet: "",
        full_description: "",
        apply_link: "",
        source_platform: "Local Admin",
        salary_range: "",
        skills: "",
        tags: "",
        experience_level: "Fresher",
        work_mode: "Remote",
        contract_type: "Full-time"
      });
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to add custom job listing.");
    }
  };

  // Filter local state jobs for rendering
  const filteredJobs = jobs.filter(j => {
    const queryMatch = 
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!queryMatch) return false;

    if (statusFilter === "approved") return j.is_active && j.is_approved;
    if (statusFilter === "pending") return j.is_active && !j.is_approved;
    if (statusFilter === "deleted") return !j.is_active;
    return true; // "all"
  });

  return (
    <div className="container-shell py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* 🚀 Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[hsl(var(--border))]/70 pb-5">
        <div>
          <span className="inline-flex items-center gap-1 bg-indigo-500/10 border border-indigo-400/20 text-xs px-3 py-1 rounded-full font-black text-indigo-600 uppercase tracking-wider mb-2">
            <SlidersHorizontal className="size-3.5" />
            Administration Center
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-[hsl(var(--foreground))]">
            Jobs Portal Manager
          </h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))] font-bold mt-1">
            Audit automatic crawler records, configure feature priority, and launch manual campaign boards.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-[hsl(var(--muted))] hover:bg-indigo-500/15 hover:text-indigo-600 border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] transition flex items-center gap-1.5 text-xs font-black"
            title="Reload Data"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Sync
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="h-10 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black shadow-lg hover:shadow-indigo-500/25 active:scale-95 transition flex items-center gap-2"
          >
            <Plus className="size-4.5" />
            Post New Job
          </button>
        </div>
      </div>

      {/* 📊 Metrics Glass Panels */}
      {metrics && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-5 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm relative overflow-hidden flex items-center gap-4">
            <div className="size-11 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
              <Briefcase className="size-5" />
            </div>
            <div>
              <div className="text-[10px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-wide">ACTIVE CAMPAIGNS</div>
              <div className="text-2xl font-black text-[hsl(var(--foreground))] mt-0.5">{metrics.total}</div>
            </div>
          </div>

          <div className="p-5 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm relative overflow-hidden flex items-center gap-4">
            <div className="size-11 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <Clock className="size-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-wide">PENDING APPROVALS</div>
              <div className="text-2xl font-black text-[hsl(var(--foreground))] mt-0.5">{metrics.pending}</div>
            </div>
          </div>

          <div className="p-5 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm relative overflow-hidden flex items-center gap-4">
            <div className="size-11 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
              <Star className="size-5" />
            </div>
            <div>
              <div className="text-[10px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-wide">FEATURED LISTINGS</div>
              <div className="text-2xl font-black text-[hsl(var(--foreground))] mt-0.5">{metrics.featured}</div>
            </div>
          </div>

          <div className="p-5 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm relative overflow-hidden flex items-center gap-4">
            <div className="size-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <div className="text-[10px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-wide">WFH / REMOTE</div>
              <div className="text-2xl font-black text-[hsl(var(--foreground))] mt-0.5">{metrics.remote}</div>
            </div>
          </div>
        </div>
      )}

      {/* 🧬 Double Column: Analytical Charts & Scraper Agent Console */}
      {metrics && (
        <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
          {/* Analytics Graph Card */}
          <div className="p-6 rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-[hsl(var(--border))]/70">
              <BarChart3 className="size-5 text-indigo-500" />
              <h3 className="font-black text-sm uppercase tracking-wider text-[hsl(var(--foreground))]">
                Unified Channel Distributions
              </h3>
            </div>
            
            <div className="space-y-4 pt-2">
              <div>
                <span className="text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))] block mb-1">
                  Trending Technical Skills In-Demand
                </span>
                <div className="space-y-2">
                  {metrics.trendingSkills.map((sk: any, idx: number) => {
                    const pct = metrics.total > 0 ? Math.round((sk.count / metrics.total) * 100) : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-[hsl(var(--foreground))]">{sk.name}</span>
                          <span className="text-indigo-500">{sk.count} listings ({pct}%)</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[hsl(var(--border))]/60">
                <span className="text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))] block mb-2">
                  Campaign Sources Registry
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-black">
                  {metrics.sources.map((s: any, idx: number) => (
                    <div key={idx} className="p-3 bg-[hsl(var(--muted))]/50 rounded-2xl border border-[hsl(var(--border))]/50">
                      <div className="text-lg text-indigo-600">{s.count}</div>
                      <div className="text-[9px] text-[hsl(var(--muted-foreground))] mt-1 truncate">{s.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Scraper Control Console */}
          <div className="p-6 rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-[hsl(var(--border))]/70">
                <Sparkles className="size-5 text-amber-500 animate-pulse" />
                <h3 className="font-black text-sm uppercase tracking-wider text-[hsl(var(--foreground))]">
                  AI Crawlers Control Deck (SerpApi & Upwork)
                </h3>
              </div>

              <p className="text-[11px] leading-relaxed text-[hsl(var(--muted-foreground))] font-semibold mt-2">
                Simulate your background automated crawler scripts. This operation matches SerpApi Google Jobs scraper configurations and Upwork RSS parser engines to pull records on request, automatically applying auto-detection badge rules (Remote/Contract) before saving to the pending log.
              </p>

              <div className="pt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="E.g. React, Next.js, Python, Deno..."
                  value={scraperKeyword}
                  onChange={(e) => setScraperKeyword(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl bg-[hsl(var(--muted))]/60 border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--foreground))] placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={handleTriggerScraper}
                  disabled={scraping}
                  className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-600 text-white text-[11px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10"
                >
                  {scraping ? <RefreshCw className="size-3.5 animate-spin" /> : "Run Crawler Agent"}
                </button>
              </div>
            </div>

            {/* Scraper logs console */}
            <div className="h-32 mt-4 bg-neutral-950 text-emerald-400 p-3 rounded-2xl text-[9px] font-mono overflow-y-auto no-scrollbar space-y-1 select-none border border-white/5">
              {scraperLogs.length === 0 ? (
                <span className="text-zinc-500 font-bold italic">// Crawler logs: Idle... Ready to launch.</span>
              ) : (
                scraperLogs.map((log, index) => (
                  <p key={index} className="leading-tight">{log}</p>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 💼 Interactive CRUD Jobs Listings Log Table */}
      <div className="p-6 rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-4 shadow-sm">
        
        {/* Table Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[hsl(var(--border))]/70">
          <h3 className="font-black text-sm uppercase tracking-wider text-[hsl(var(--foreground))]">
            Active Campaigns Database Registry
          </h3>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search matching listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))]/80 text-[11px] font-bold text-[hsl(var(--foreground))] focus:outline-none placeholder-zinc-400"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-8 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))]/80 text-[11px] font-black px-2.5 text-[hsl(var(--foreground))] focus:outline-none"
            >
              <option value="all">All Campaigns</option>
              <option value="approved">Approved & Online</option>
              <option value="pending">Pending Admin Audit</option>
              <option value="deleted">Soft Deleted</option>
            </select>
          </div>
        </div>

        {/* Listings Table Layout */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]/60 text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))]">
                <th className="pb-3 font-black">Job Details</th>
                <th className="pb-3 font-black">Location & Specs</th>
                <th className="pb-3 font-black">Integration Source</th>
                <th className="pb-3 font-black text-center">Featured</th>
                <th className="pb-3 font-black text-center">Workflow Audit</th>
                <th className="pb-3 font-black text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[hsl(var(--muted-foreground))] font-bold">
                    <RefreshCw className="size-6 animate-spin mx-auto text-indigo-500 mb-2" />
                    Fetching registry streams...
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[hsl(var(--muted-foreground))] font-bold">
                    No records found matching current query conditions.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const isPending = !job.is_approved;
                  const isDeleted = !job.is_active;
                  return (
                    <tr 
                      key={job.job_id} 
                      className={`hover:bg-[hsl(var(--muted))]/25 transition ${
                        isDeleted ? "opacity-50" : ""
                      }`}
                    >
                      <td className="py-4 pr-3">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <div className="size-9 shrink-0 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))]/40 overflow-hidden flex items-center justify-center font-black text-indigo-500 text-sm">
                            {job.logo_url ? (
                              <img src={job.logo_url} alt={job.company_name} className="size-full object-cover" />
                            ) : (
                              job.company_name[0]
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-[hsl(var(--foreground))] truncate max-w-[180px]">{job.title}</h4>
                            <span className="text-[10px] text-[hsl(var(--muted-foreground))] block font-semibold">{job.company_name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="space-y-0.5 min-w-[120px]">
                          <div className="flex items-center gap-1 font-bold text-[hsl(var(--muted-foreground))]">
                            <MapPin className="size-3 text-red-500 shrink-0" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] bg-indigo-500/10 text-indigo-600 px-1.5 py-0.2 rounded font-black tracking-wide uppercase">{job.work_mode}</span>
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.2 rounded font-black tracking-wide uppercase">{job.contract_type}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="space-y-0.5">
                          <span className="font-bold text-[hsl(var(--foreground))]">{job.source_platform}</span>
                          <span className="text-[9px] text-[hsl(var(--muted-foreground))] block font-semibold">
                            {new Date(job.posted_date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <button
                          disabled={actionLoading === job.job_id || isDeleted}
                          onClick={() => handleToggleFeatured(job.job_id)}
                          className={`p-1.5 rounded-full border transition active:scale-95 ${
                            job.is_featured
                              ? "bg-amber-500/10 border-amber-400 text-amber-500"
                              : "border-[hsl(var(--border))]/80 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
                          }`}
                        >
                          <Star className="size-3.5 fill-current" />
                        </button>
                      </td>
                      <td className="py-4 px-2 text-center">
                        {isDeleted ? (
                          <span className="text-[9px] font-black uppercase text-red-500 bg-red-500/10 px-2 py-0.5 rounded">
                            DELETED
                          </span>
                        ) : isPending ? (
                          <button
                            disabled={actionLoading === job.job_id}
                            onClick={() => handleApprove(job.job_id)}
                            className="h-7 px-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white text-[9.5px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1 mx-auto"
                          >
                            <Check className="size-3.5" />
                            Approve
                          </button>
                        ) : (
                          <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                            ✓ Published
                          </span>
                        )}
                      </td>
                      <td className="py-4 pl-3 text-right">
                        <button
                          disabled={actionLoading === job.job_id || isDeleted}
                          onClick={() => handleDelete(job.job_id)}
                          className="p-1.5 rounded-lg border border-[hsl(var(--border))]/80 text-zinc-400 hover:border-red-500/50 hover:text-red-500 hover:bg-red-500/5 active:scale-95 transition"
                          title="Delete Listing"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 💼 Post Custom Campaign Modal Form */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[2rem] w-full max-w-xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 my-8">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-[hsl(var(--foreground))] text-sm font-black"
            >
              ✕
            </button>
            <h2 className="text-lg font-black text-[hsl(var(--foreground))] flex items-center gap-2 border-b border-[hsl(var(--border))]/60 pb-3 mb-4">
              <Building2 className="size-5 text-indigo-500" />
              Post Custom Job Listing
            </h2>

            <form onSubmit={handleCreateJob} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))]">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Senior Frontend Architect"
                    value={newJob.title}
                    onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))]">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Ather Tech Labs"
                    value={newJob.company_name}
                    onChange={(e) => setNewJob({...newJob, company_name: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))]">Experience *</label>
                  <select
                    value={newJob.experience_level}
                    onChange={(e) => setNewJob({...newJob, experience_level: e.target.value as any})}
                    className="w-full h-10 px-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none"
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="Experienced">Experienced</option>
                    <option value="Any">Any Experience</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))]">Work Mode *</label>
                  <select
                    value={newJob.work_mode}
                    onChange={(e) => setNewJob({...newJob, work_mode: e.target.value as any})}
                    className="w-full h-10 px-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))]">Contract Type *</label>
                  <select
                    value={newJob.contract_type}
                    onChange={(e) => setNewJob({...newJob, contract_type: e.target.value as any})}
                    className="w-full h-10 px-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))]">Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Hyderabad, Remote"
                    value={newJob.location}
                    onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))]">District (Optional)</label>
                  <input
                    type="text"
                    placeholder="E.g. Hyderabad, Visakhapatnam"
                    value={newJob.district}
                    onChange={(e) => setNewJob({...newJob, district: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))]">Apply Link *</label>
                  <input
                    type="url"
                    required
                    placeholder="E.g. https://careers.ather.com/job/12"
                    value={newJob.apply_link}
                    onChange={(e) => setNewJob({...newJob, apply_link: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))]">Salary Range (Optional)</label>
                  <input
                    type="text"
                    placeholder="E.g. ₹12,00,000 - ₹15,00,000 / year"
                    value={newJob.salary_range}
                    onChange={(e) => setNewJob({...newJob, salary_range: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))]">Skills (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="E.g. React, Next.js, Deno"
                    value={newJob.skills}
                    onChange={(e) => setNewJob({...newJob, skills: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))]">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="E.g. Remote IT, Startup, AI Jobs"
                    value={newJob.tags}
                    onChange={(e) => setNewJob({...newJob, tags: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))]">Brief Description *</label>
                <textarea
                  required
                  placeholder="Summarize this job in a short snippet (60 words)..."
                  value={newJob.description_snippet}
                  onChange={(e) => setNewJob({...newJob, description_snippet: e.target.value})}
                  rows={2}
                  className="w-full p-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))]">Full Description (Markdown supported)</label>
                <textarea
                  placeholder="Detail requirements, syllabus, stipend details, etc..."
                  value={newJob.full_description}
                  onChange={(e) => setNewJob({...newJob, full_description: e.target.value})}
                  rows={3}
                  className="w-full p-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[hsl(var(--border))]/60">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-10 rounded-xl border border-[hsl(var(--border))] bg-transparent text-[11px] font-black uppercase tracking-wider hover:bg-[hsl(var(--muted))] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-indigo-500/10 transition"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
