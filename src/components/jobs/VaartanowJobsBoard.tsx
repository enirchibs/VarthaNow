import { useEffect, useState, useMemo } from "react";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Sparkles, 
  Share2, 
  Bookmark, 
  Check, 
  Search, 
  SlidersHorizontal,
  ChevronRight,
  Brain,
  FileText,
  HelpCircle,
  TrendingUp
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { getJobsList, autoDetectWorkMode, autoDetectContractType } from "@/lib/jobs-api";
import type { VaartanowJob, JobFilters, AIResumeAnalysis } from "@/types/jobs";

interface VaartanowJobsBoardProps {
  initialCategoryFilter?: string;
  initialWorkModeFilter?: string;
  initialContractFilter?: string;
}

export function VaartanowJobsBoard({ 
  initialCategoryFilter,
  initialWorkModeFilter,
  initialContractFilter
}: VaartanowJobsBoardProps) {
  const { lang } = useLanguage();
  const [jobs, setJobs] = useState<VaartanowJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<VaartanowJob | null>(null);
  
  // Search & Filters State
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChip, setActiveChip] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>(initialCategoryFilter || "all");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  
  // AI Resume tools states
  const [resumeText, setResumeText] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<AIResumeAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [interviewPrep, setInterviewPrep] = useState<string[]>([]);
  const [preppingInterview, setPreppingInterview] = useState(false);

  // Saved/Bookmarked jobs
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  // Load jobs on filter change
  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      const filters: JobFilters = {
        query: searchQuery,
        workMode: initialWorkModeFilter as any,
        contractType: initialContractFilter as any
      };

      // Map scrollable chips to filters
      if (activeChip === "Remote") filters.workMode = "Remote";
      if (activeChip === "Hybrid") filters.workMode = "Hybrid";
      if (activeChip === "Contract") filters.contractType = "Contract";
      if (activeChip === "Fresher") filters.experienceLevel = "Fresher";
      if (activeChip === "Experienced") filters.experienceLevel = "Experienced";
      if (activeChip === "Internship") filters.contractType = "Internship";
      if (activeChip === "Freelance") filters.contractType = "Freelance";

      // Map category tabs to filters
      if (activeTab === "Freshers") filters.experienceLevel = "Fresher";
      if (activeTab === "Experienced") filters.experienceLevel = "Experienced";
      if (activeTab === "Freelance") filters.contractType = "Freelance";
      if (activeTab === "WFH") filters.workMode = "Remote";
      if (activeTab === "Internships") filters.contractType = "Internship";

      if (selectedDistrict) {
        filters.district = selectedDistrict;
      }

      const data = await getJobsList(filters);
      
      // Filter startup and remote IT custom logic in JS
      let filteredData = data;
      if (activeTab === "Startup" || activeChip === "Startup") {
        filteredData = data.filter((j) => j.tags.includes("Startup"));
      }
      if (activeTab === "Remote IT" || activeChip === "AI Jobs") {
        filteredData = data.filter((j) => j.skills.includes("React") || j.skills.includes("Next.js") || j.skills.includes("Python"));
      }
      if (activeTab === "Government" || activeChip === "Government") {
        filteredData = data.filter((j) => j.tags.includes("Government"));
      }

      setJobs(filteredData);
      setLoading(false);
      if (filteredData.length > 0 && !selectedJob) {
        setSelectedJob(filteredData[0]);
      }
    }
    loadJobs();
  }, [searchQuery, activeChip, activeTab, selectedDistrict, initialWorkModeFilter, initialContractFilter]);

  // Handle Bookmarks
  const toggleSaveJob = (id: string) => {
    if (savedJobIds.includes(id)) {
      setSavedJobIds(savedJobIds.filter((x) => x !== id));
    } else {
      setSavedJobIds([...savedJobIds, id]);
    }
  };

  // AI Resume Scanner & ATS Checker
  const handleCheckATS = () => {
    if (!resumeText.trim()) {
      alert("Please paste your resume text first!");
      return;
    }
    setAnalyzing(true);
    setAiAnalysis(null);

    // Simulate AI Gemini text scanning analysis
    setTimeout(() => {
      const skillsInResume = ["React", "TypeScript", "HTML/CSS", "Javascript"];
      const matched = selectedJob ? selectedJob.skills.filter(s => skillsInResume.includes(s)) : ["React", "TypeScript"];
      const missing = selectedJob ? selectedJob.skills.filter(s => !skillsInResume.includes(s)) : ["Next.js", "Tailwind CSS"];
      
      const score = Math.round(60 + Math.random() * 35);

      setAiAnalysis({
        atsScore: score,
        matchPercentage: Math.round(50 + Math.random() * 45),
        matchedSkills: matched,
        missingSkills: missing,
        feedback: score > 75 
          ? "Excellent resume format! Your technical stack aligns very well with industry standards. Consider expanding on your Next.js and API experiences." 
          : "Good start, but your resume lacks critical semantic keywords (e.g. Next.js, GIN indexing) that applicant tracking systems look for. Add specific tech stacks to bypass filters.",
        summary: "Applicant demonstrates strong foundational Javascript & React capabilities, matching frontend criteria.",
        careerPathAdvice: "Highly recommended to build 2 portfolio projects using Shadcn UI & Next.js to secure higher package roles."
      });
      setAnalyzing(false);
    }, 1800);
  };

  // AI Cover Letter Builder
  const handleGenerateCoverLetter = () => {
    if (!selectedJob) return;
    setGeneratingLetter(true);
    setGeneratedLetter("");

    setTimeout(() => {
      const text = lang === "te"
        ? `గౌరవనీయులైన నియామక అధికారి గారికి,\n\nనేను మీ సంస్థ లోని "${selectedJob.title}" ఉద్యోగ ప్రకటనను చూసి దరఖాస్తు చేస్తున్నాను. నాకు React, TypeScript మరియు వెబ్ డెవలప్‌మెంట్‌లో అద్భుతమైన అనుభవం ఉంది. మీ ప్రాజెక్టులలో నా నైపుణ్యాలను ఉపయోగించి సంస్థ అభివృద్ధికి తోడ్పడగలనని నమ్ముతున్నాను.\n\nభవదీయుడు,\nVaartaNow AI ఆర్టిఫిషియల్ కాండిడేట్`
        : `Dear Hiring Manager,\n\nI am writing to express my strong interest in the "${selectedJob.title}" position at your company. With my hands-on expertise in React, TypeScript, and modern frontend architectures, I am confident in my ability to contribute value to your development operations immediately.\n\nSincerely,\nVaartaNow AI Applicant`;
      
      setGeneratedLetter(text);
      setGeneratingLetter(false);
    }, 1500);
  };

  // AI Interview Prep Questions
  const handleGetInterviewQuestions = () => {
    if (!selectedJob) return;
    setPreppingInterview(true);
    setInterviewPrep([]);

    setTimeout(() => {
      const questions = [
        `1. Explain a complex feature you built using ${selectedJob.skills[0] || "Frontend frameworks"}. How did you optimize its performance?`,
        `2. In ${selectedJob.company_name}, how would you approach building a highly responsive user experience supporting RTL or regional languages?`,
        `3. Technical question: What are the key architectural differences between standard CSR React and ISR Next.js rendering?`
      ];
      setInterviewPrep(questions);
      setPreppingInterview(false);
    }, 1200);
  };

  const chips = [
    { label: "All Jobs", slug: "all" },
    { label: "Remote 🏠", slug: "Remote" },
    { label: "Hybrid 🏢", slug: "Hybrid" },
    { label: "Government 🏛️", slug: "Government" },
    { label: "Fresher 🎓", slug: "Fresher" },
    { label: "Experienced 💼", slug: "Experienced" },
    { label: "Internship 🎯", slug: "Internship" },
    { label: "Freelance 💻", slug: "Freelance" }
  ];

  const tabs = [
    { name: "All Categories", slug: "all" },
    { name: "🎓 Freshers", slug: "Freshers" },
    { name: "💼 Experienced", slug: "Experienced" },
    { name: "🌍 Freelance", slug: "Freelance" },
    { name: "🏠 WFH Jobs", slug: "WFH" },
    { name: "🏛️ Govt Jobs", slug: "Government" },
    { name: "🚀 Startups", slug: "Startup" },
    { name: "📱 Remote IT", slug: "Remote IT" },
    { name: "🎯 Internships", slug: "Internships" }
  ];

  return (
    <div className="space-y-6">
      {/* 🚀 Hero Section: SaaS Gradient Header */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 via-indigo-950 to-zinc-950 p-6 md:p-12 text-center text-white border border-white/10 shadow-2xl">
        <div className="absolute -left-32 -top-32 size-72 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
        <div className="absolute -right-32 -bottom-32 size-72 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" />

        <div className="max-w-2xl mx-auto space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-xs font-black text-indigo-300 uppercase tracking-widest animate-pulse">
            <Sparkles className="size-3.5 text-indigo-400" />
            VaartaNow AI Jobs Hub
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Vaartanow Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-red-400">Jobs Hub</span>
          </h1>
          <p className="text-sm md:text-base font-semibold text-zinc-300">
            {lang === "te" 
              ? "ఏపీ, తెలంగాణ & రిమోట్ ఐటీ రంగాలలో వేల ఉద్యోగ అవకాశాలు"
              : "AI-powered jobs aggregator for Andhra Pradesh, Telangana & Remote opportunities"}
          </p>

          {/* Search Box */}
          <div className="pt-4 flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-zinc-400" />
              <input
                type="text"
                placeholder={lang === "te" ? "టెక్నాలజీ, సంస్థ, స్కిల్స్ తో వెతకండి..." : "Search jobs by skill, company, technology..."}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchQuery(searchInput);
                  }
                }}
                className="w-full h-11 pl-11 pr-24 rounded-2xl bg-white/10 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-400 transition animate-all duration-300"
              />
              <button
                onClick={() => setSearchQuery(searchInput)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-[10px] font-black uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1 shadow-md shadow-indigo-500/25"
              >
                {lang === "te" ? "వెతకండి" : "Search"}
              </button>
            </div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="h-11 rounded-2xl bg-white/10 border border-white/10 text-white text-xs font-bold px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" className="text-black">-- {lang === "te" ? "జిల్లా" : "All Districts"} --</option>
              <option value="Visakhapatnam" className="text-black">Visakhapatnam</option>
              <option value="Hyderabad" className="text-black">Hyderabad</option>
              <option value="Vijayawada" className="text-black">Vijayawada</option>
              <option value="Bengaluru" className="text-black">Bengaluru</option>
            </select>
          </div>
        </div>
      </section>

      {/* 🏷️ Horizontal Filter Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {chips.map((c) => (
          <button
            key={c.slug}
            onClick={() => setActiveChip(c.slug)}
            className={`h-9 px-4 rounded-full text-xs font-black shrink-0 transition flex items-center gap-1.5 border ${
              activeChip === c.slug
                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/25"
                : "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-indigo-500 hover:text-indigo-600"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 🗂️ Category Tabs */}
      <div className="flex border-b border-[hsl(var(--border))]/70 overflow-x-auto no-scrollbar gap-1">
        {tabs.map((t) => (
          <button
            key={t.slug}
            onClick={() => setActiveTab(t.slug)}
            className={`py-3 px-4 text-xs font-black border-b-2 shrink-0 transition ${
              activeTab === t.slug
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* 🗄️ Double Column Grid layout */}
      <div className="grid gap-6 lg:grid-cols-[1.75fr_1.25fr]">
        
        {/* Left Column: Job Cards List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-[hsl(var(--foreground))]">
              {jobs.length} {lang === "te" ? "ఉద్యోగాలు లభించాయి" : "Active Jobs Found"}
            </h3>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded font-black">
              ⚡ Real-time updates
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((x) => (
                <div key={x} className="h-32 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/50 animate-pulse" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 rounded-[1.6rem] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))]/50">
              <Briefcase className="size-10 mx-auto text-[hsl(var(--muted-foreground))] opacity-40 mb-3" />
              <p className="text-xs font-bold text-[hsl(var(--muted-foreground))]">
                No matching jobs found. Try resetting your search filters.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => {
                const isSelected = selectedJob?.job_id === job.job_id;
                return (
                  <div
                    key={job.job_id}
                    onClick={() => setSelectedJob(job)}
                    className={`p-5 rounded-3xl border transition cursor-pointer flex gap-4 ${
                      isSelected
                        ? "bg-indigo-500/5 border-indigo-500 shadow-sm"
                        : "bg-[hsl(var(--card))] border-[hsl(var(--border))] hover:border-indigo-500/50 hover:shadow-sm"
                    }`}
                  >
                    {/* Logo */}
                    <div className="size-12 shrink-0 rounded-2xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))]/50 overflow-hidden flex items-center justify-center font-black text-indigo-500 text-lg">
                      {job.logo_url ? (
                        <img src={job.logo_url} alt={job.company_name} className="size-full object-cover" />
                      ) : (
                        job.company_name[0]
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <h4 className="font-black text-sm text-[hsl(var(--foreground))] truncate max-w-[240px]">
                            {job.title}
                          </h4>
                          <span className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] block mt-0.5">
                            {job.company_name}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveJob(job.job_id);
                          }}
                          className={`p-1.5 rounded-full border transition active:scale-95 ${
                            savedJobIds.includes(job.job_id)
                              ? "bg-indigo-500/15 border-indigo-400 text-indigo-500"
                              : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
                          }`}
                        >
                          <Bookmark className="size-3.5" />
                        </button>
                      </div>

                      {/* Info badges */}
                      <div className="flex flex-wrap gap-1.5 text-[9.5px] font-bold text-zinc-600 dark:text-zinc-400">
                        <span className="flex items-center gap-1 bg-[hsl(var(--muted))] px-2 py-0.5 rounded-md border border-[hsl(var(--border))]/60">
                          <MapPin className="size-3 text-red-500" />
                          {job.location}
                        </span>
                        {job.salary_range && (
                          <span className="flex items-center gap-1 bg-[hsl(var(--muted))] px-2 py-0.5 rounded-md border border-[hsl(var(--border))]/60">
                            <DollarSign className="size-3 text-emerald-500" />
                            {job.salary_range}
                          </span>
                        )}
                        <span className="bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-500/10 uppercase font-black">
                          {job.work_mode}
                        </span>
                        <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-500/10 uppercase font-black">
                          {job.contract_type}
                        </span>
                      </div>

                      <p className="text-[11px] leading-relaxed text-[hsl(var(--muted-foreground))] line-clamp-2">
                        {job.description_snippet}
                      </p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {job.skills.map((s) => (
                          <span key={s} className="bg-[hsl(var(--muted))]/80 border border-[hsl(var(--border))]/40 px-2 py-0.5 rounded-md text-[9px] font-extrabold text-[hsl(var(--muted-foreground))]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: AI Suite & Details Panel */}
        <div className="space-y-5">
          {/* Active Job Description Drawer */}
          {selectedJob && (
            <div className="rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-4 shadow-sm relative">
              <div className="flex justify-between items-start gap-4 pb-3 border-b border-[hsl(var(--border))]/70">
                <div>
                  <span className="text-[9px] font-black uppercase bg-indigo-500 text-white px-2 py-0.5 rounded tracking-widest">
                    ACTIVE LISTING
                  </span>
                  <h3 className="text-base font-black text-[hsl(var(--foreground))] mt-1.5 leading-snug">
                    {selectedJob.title}
                  </h3>
                  <div className="text-xs font-black text-indigo-600 mt-1">
                    {selectedJob.company_name}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const text = `💼 *VaartaNow Job Alert* 💼\n\n📢 *${selectedJob.title}* at *${selectedJob.company_name}*\n\n👉 Apply directly:\n${selectedJob.apply_link}`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
                  }}
                  className="p-2 rounded-full bg-[hsl(var(--muted))] hover:bg-indigo-500/10 hover:text-indigo-600 transition"
                  title="Share Job"
                >
                  <Share2 className="size-4" />
                </button>
              </div>

              {/* Detailed specs */}
              <div className="grid grid-cols-2 gap-2.5 text-xs font-bold">
                <div className="bg-[hsl(var(--muted))]/50 p-2.5 rounded-xl border border-[hsl(var(--border))]/50 space-y-0.5">
                  <div className="text-[9px] font-black text-neutral-400 uppercase tracking-wide">EXPERIENCE</div>
                  <div className="text-[hsl(var(--foreground))]">{selectedJob.experience_level}</div>
                </div>
                <div className="bg-[hsl(var(--muted))]/50 p-2.5 rounded-xl border border-[hsl(var(--border))]/50 space-y-0.5">
                  <div className="text-[9px] font-black text-neutral-400 uppercase tracking-wide">SOURCE PLATFORM</div>
                  <div className="text-[hsl(var(--foreground))]">{selectedJob.source_platform}</div>
                </div>
              </div>

              {/* Full Description Markup */}
              <div className="text-xs leading-relaxed text-[hsl(var(--muted-foreground))] space-y-3 max-h-[180px] overflow-y-auto pr-1 no-scrollbar border-b border-[hsl(var(--border))]/50 pb-3">
                <p className="font-bold text-[hsl(var(--foreground))]">Job Description:</p>
                <div className="whitespace-pre-line">{selectedJob.full_description}</div>
              </div>

              <div className="flex gap-2">
                <a
                  href={selectedJob.apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95 transition"
                >
                  Apply Now <ChevronRight className="size-4" />
                </a>
              </div>
            </div>
          )}

          {/* 🧠 AI Gemini Suite Dashboard */}
          <div className="rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-4 shadow-sm relative">
            <div className="flex items-center gap-2 pb-3 border-b border-[hsl(var(--border))]/70">
              <Brain className="size-5 text-indigo-500 animate-pulse" />
              <h3 className="font-black text-sm uppercase tracking-wider text-[hsl(var(--foreground))]">
                Gemini AI Resume & ATS Suite
              </h3>
            </div>

            {/* Resume Input Area */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                Paste Resume Text to Check Match:
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your professional summary, core skills, and experiences here..."
                rows={3}
                className="w-full text-xs font-bold p-3 rounded-2xl bg-[hsl(var(--muted))]/60 border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-neutral-400 focus:bg-[hsl(var(--card))]"
              />
              <button
                onClick={handleCheckATS}
                disabled={analyzing}
                className="w-full h-9 rounded-xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1"
              >
                {analyzing ? "Scanning Resume..." : "Check ATS Match Score ⚡"}
              </button>
            </div>

            {/* ATS Score Display */}
            {aiAnalysis && (
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl space-y-3 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-black text-indigo-600 uppercase tracking-wide">ATS MATCH SCORE</div>
                    <div className="text-2xl font-black text-indigo-600">{aiAnalysis.atsScore}%</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase bg-emerald-500/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                      ✓ ATS COMPLIANT
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[10.5px] font-bold">
                  <div>
                    <span className="text-indigo-600 block text-[9px] uppercase font-black">Matched Skills</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {aiAnalysis.matchedSkills.map((s) => (
                        <span key={s} className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded font-black text-[9px]">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-1.5">
                    <span className="text-red-500 block text-[9px] uppercase font-black">Skill Gap (Missing Skills)</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {aiAnalysis.missingSkills.map((s) => (
                        <span key={s} className="bg-red-500/10 text-red-700 dark:text-red-400 px-2 py-0.5 rounded font-black text-[9px]">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-[hsl(var(--border))]/60 pt-2 text-[10px] text-[hsl(var(--muted-foreground))] leading-relaxed font-semibold">
                  <span className="font-extrabold text-[hsl(var(--foreground))] block uppercase text-[9px] tracking-wide mb-0.5">AI Feedback:</span>
                  {aiAnalysis.feedback}
                </div>
              </div>
            )}

            {/* Dynamic AI Cover Letter & Interview prep links */}
            {selectedJob && (
              <div className="border-t border-[hsl(var(--border))]/70 pt-3 flex gap-2">
                <button
                  onClick={handleGenerateCoverLetter}
                  disabled={generatingLetter}
                  className="flex-1 py-2 px-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] hover:bg-indigo-500/5 hover:border-indigo-500 hover:text-indigo-600 text-[10px] font-black transition flex items-center justify-center gap-1 active:scale-95"
                >
                  <FileText className="size-3.5" />
                  {generatingLetter ? "Writing..." : "AI Cover Letter"}
                </button>
                <button
                  onClick={handleGetInterviewQuestions}
                  disabled={preppingInterview}
                  className="flex-1 py-2 px-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] hover:bg-indigo-500/5 hover:border-indigo-500 hover:text-indigo-600 text-[10px] font-black transition flex items-center justify-center gap-1 active:scale-95"
                >
                  <HelpCircle className="size-3.5" />
                  {preppingInterview ? "Prepping..." : "AI Interview Prep"}
                </button>
              </div>
            )}

            {/* Letter output overlay */}
            {generatedLetter && (
              <div className="p-3 bg-neutral-900 text-neutral-100 rounded-2xl text-[10px] leading-relaxed relative font-mono mt-3 animate-in slide-in-from-top duration-300">
                <button
                  onClick={() => setGeneratedLetter("")}
                  className="absolute top-2 right-2 text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
                <div className="font-black text-amber-500 mb-1 border-b border-neutral-800 pb-1 uppercase tracking-wider text-[9px]">AI Drafted Cover Letter:</div>
                <div className="whitespace-pre-line select-all">{generatedLetter}</div>
              </div>
            )}

            {/* Interview Prep Questions overlay */}
            {interviewPrep.length > 0 && (
              <div className="p-3 bg-neutral-900 text-neutral-100 rounded-2xl text-[10px] leading-relaxed relative mt-3 animate-in slide-in-from-top duration-300">
                <button
                  onClick={() => setInterviewPrep([])}
                  className="absolute top-2 right-2 text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
                <div className="font-black text-indigo-400 mb-1.5 border-b border-neutral-800 pb-1 uppercase tracking-wider text-[9px]">Gemini Practice Questions:</div>
                <div className="space-y-2">
                  {interviewPrep.map((q, i) => (
                    <p key={i} className="font-semibold text-neutral-300">{q}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
