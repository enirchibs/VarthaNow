
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Share2, 
  Bookmark, 
  Search, 
  ChevronRight, 
  Brain, 
  FileText, 
  HelpCircle, 
  PlusCircle,
  ExternalLink,
  X,
  Sparkles
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  getJobsList, 
  getLocalJobs, 
  formatJobTitleTelugu,
  formatWorkModeTelugu, 
  formatContractTypeTelugu, 
  formatExperienceTelugu, 
  formatSalaryTelugu 
} from "@/lib/jobs-api";
import type { VaartanowJob, JobFilters, AIResumeAnalysis } from "@/types/jobs";
import { JobPostModal } from "./JobPostModal";

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
  const [jobs, setJobs] = useState<VaartanowJob[]>(() => {
    try {
      const initial = getLocalJobs();
      return Array.isArray(initial) && initial.length > 0 ? initial : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(jobs.length === 0);
  const [selectedJob, setSelectedJob] = useState<VaartanowJob | null>(() => jobs[0] || null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Search & Filters State
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>(initialCategoryFilter || "all");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [visibleCount, setVisibleCount] = useState(3); // show 2 or 3 job posts initially
  const tabsRef = useRef<HTMLDivElement>(null);
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);
  const [isTabAutoTouring, setIsTabAutoTouring] = useState<boolean>(true);
  const location = useLocation();
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(() => {
    try {
      return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("post") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("post") === "true") {
      setIsPostModalOpen(true);
    }
  }, [location.search]);
  
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
    let isMounted = true;

    async function loadJobs() {
      setLoading(true);
      
      // Determine district filter parameter
      const districtFilter = (selectedDistrict === "Remote" || selectedDistrict === "Freelance" || selectedDistrict === "Apprenticeship")
        ? ""
        : selectedDistrict;

      const data = await getJobsList({
        query: searchQuery,
        district: districtFilter,
        workMode: initialWorkModeFilter as any,
        contractType: initialContractFilter as any
      });
      
      if (!isMounted) return;

      // Filter related jobs for activeCategoryTab from the entire jobs list
      let filteredData = data;
      const tabSlug = activeTab;

      if (tabSlug === "WFH") {
        filteredData = data.filter(j => 
          j.work_mode === "Remote" || 
          /remote|wfh|work from home|వర్క్ ఫ్రమ్ హోమ్/i.test(j.title + j.location + j.description_snippet + (j.tags || []).join(" "))
        );
      } else if (tabSlug === "Freelance") {
        filteredData = data.filter(j => 
          j.contract_type === "Freelance" || 
          /freelance|ఫ్రీలాన్స్/i.test(j.title + (j.tags || []).join(" "))
        );
      } else if (tabSlug === "Apprenticeship") {
        filteredData = data.filter(j => 
          j.contract_type === "Apprenticeship" || 
          /apprentice|అప్రెంటిస్/i.test(j.title + (j.tags || []).join(" "))
        );
      } else if (tabSlug === "Freshers") {
        filteredData = data.filter(j => 
          j.experience_level === "Fresher" || 
          /fresher|trainee|ఫ్రెషర్|ట్రైనీ/i.test(j.title + j.experience_level + (j.tags || []).join(" "))
        );
      } else if (tabSlug === "Experienced") {
        filteredData = data.filter(j => 
          j.experience_level === "Experienced" || 
          /experienced|senior|lead|అనుభవం/i.test(j.title + j.experience_level + (j.tags || []).join(" "))
        );
      } else if (tabSlug === "Government") {
        filteredData = data.filter(j => 
          (j.tags || []).some(t => /govt|government/i.test(t)) || 
          /govt|government|appsc|tspsc|ప్రభుత్వ/i.test(j.title + j.company_name + (j.tags || []).join(" "))
        );
      } else if (tabSlug === "Startup") {
        filteredData = data.filter(j => 
          (j.tags || []).some(t => /startup/i.test(t)) || 
          /startup|స్టార్టప్/i.test(j.title + j.company_name + (j.tags || []).join(" "))
        );
      } else if (tabSlug === "Remote IT") {
        filteredData = data.filter(j => 
          (j.tags || []).some(t => /remote it|it jobs/i.test(t)) ||
          j.skills.some(s => /react|next\.js|python|software|typescript|developer|engineer|frontend|backend|java|node|cloud/i.test(s)) ||
          /it|developer|engineer|software|రిమోట్ ఐటీ/i.test(j.title + j.description_snippet)
        );
      } else if (tabSlug === "Internships") {
        filteredData = data.filter(j => 
          j.contract_type === "Internship" || 
          /intern|internship|ఇంటర్న్‌షిప్/i.test(j.title + j.contract_type + (j.tags || []).join(" "))
        );
      }

      // Secondary District Override for Special Filter items
      if (selectedDistrict === "Remote") {
        filteredData = filteredData.filter(j => j.work_mode === "Remote");
      } else if (selectedDistrict === "Freelance") {
        filteredData = filteredData.filter(j => j.contract_type === "Freelance");
      } else if (selectedDistrict === "Apprenticeship") {
        filteredData = filteredData.filter(j => j.contract_type === "Apprenticeship");
      }

      setJobs(filteredData);
      setVisibleCount(30);
      setLoading(false);
      setSelectedJob(prev => (prev && filteredData.some(j => j.job_id === prev.job_id)) ? prev : (filteredData[0] || null));
    }

    loadJobs();

    return () => {
      isMounted = false;
    };
  }, [searchQuery, activeTab, selectedDistrict, initialWorkModeFilter, initialContractFilter]);

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
      alert("దయచేసి ముందు మీ రెజ్యూమ్‌ను పేస్ట్ చేయండి! (Please paste resume text)");
      return;
    }
    setAnalyzing(true);
    setAiAnalysis(null);

    // Simulate AI Gemini text scanning analysis
    setTimeout(() => {
      const skillsInResume = ["React", "TypeScript", "HTML/CSS", "Javascript", "Python"];
      const matched = selectedJob ? selectedJob.skills.filter(s => skillsInResume.some(r => s.toLowerCase().includes(r.toLowerCase()))) : ["React", "TypeScript"];
      const missing = selectedJob ? selectedJob.skills.filter(s => !skillsInResume.some(r => s.toLowerCase().includes(r.toLowerCase()))) : ["Next.js", "Tailwind CSS"];
      
      const score = Math.round(65 + Math.random() * 30);

      setAiAnalysis({
        atsScore: score,
        matchPercentage: Math.round(55 + Math.random() * 40),
        matchedSkills: matched.length > 0 ? matched : ["Javascript", "Web Basics"],
        missingSkills: missing,
        feedback: score > 75 
          ? "చక్కటి ప్రొఫైల్! మీ స్కిల్స్ ఈ ఉద్యోగ అర్హతలకు బాగా సరిపోతున్నాయి. తప్పకుండా దరఖాస్తు చేసుకోండి." 
          : "మంచి ప్రొఫైల్, కానీ జాబ్ డిస్క్రిప్షన్‌లో ఉన్న మరికొన్ని కీలక టెక్నాలజీలను మీ రెజ్యూమ్‌లో జోడించండి.",
        summary: "అభ్యర్థి ప్రాథమిక సాంకేతిక నైపుణ్యాలు ఈ ఉద్యోగానికి అనుకూలంగా ఉన్నాయి.",
        careerPathAdvice: "ఈ ఉద్యోగంలో మరింత మెరుగైన ఫలితాలు పొందడానికి సంబంధిత ప్రాజెక్ట్ పోర్ట్‌ఫోలియోను జోడించండి."
      });
      setAnalyzing(false);
    }, 1500);
  };

  // AI Cover Letter Builder
  const handleGenerateCoverLetter = () => {
    if (!selectedJob) return;
    setGeneratingLetter(true);
    setGeneratedLetter("");

    setTimeout(() => {
      const text = "గౌరవనీయులైన నియామక అధికారి గారికి (Hiring Team),\n\nనేను మీ సంస్థ (" + selectedJob.company_name + ") లోని \"" + selectedJob.title + "\" ఉద్యోగ ప్రకటనను చూసి దరఖాస్తు చేస్తున్నాను. నాకు ఈ రంగంలో అద్భుతమైన ఆసక్తి మరియు అవసరమైన నైపుణ్యాలు ఉన్నాయి. మీ ప్రాజెక్టులలో నా ప్రతిభను ఉపయోగించి సంస్థ అభివృద్ధికి తోడ్పడగలనని నమ్ముతున్నాను.\n\nభవదీయుడు,\nఉద్యోగ అభ్యర్థి (VaartaNow Applicant)";
      
      setGeneratedLetter(text);
      setGeneratingLetter(false);
    }, 1200);
  };

  // AI Interview Prep Questions
  const handleGetInterviewQuestions = () => {
    if (!selectedJob) return;
    setPreppingInterview(true);
    setInterviewPrep([]);

    setTimeout(() => {
      const questions = [
        "1. " + (selectedJob.skills[0] || "సాఫ్ట్‌వేర్") + " టెక్నాలజీలో మీరు చేసిన ఒక ప్రాజెక్ట్ గురించి వివరించండి?",
        "2. " + selectedJob.company_name + " సంస్థలో ఈ పాత్రలో మీరు ఎదుర్కొనే సవాళ్లను ఎలా పరిష్కరిస్తారు?",
        "3. మీ గత అనుభవం ఈ ఉద్యోగ బాధ్యతలకు ఎలా సరిపోతుంది?"
      ];
      setInterviewPrep(questions);
      setPreppingInterview(false);
    }, 1000);
  };

  const tabs = [
    { name: "అన్ని విభాగాలు (All)", slug: "all" },
    { name: "🏠 వర్క్ ఫ్రమ్ హోమ్ (WFH)", slug: "WFH" },
    { name: "🌍 ఫ్రీలాన్స్ (Freelance)", slug: "Freelance" },
    { name: "🛠️ అప్రెంటిస్‌షిప్ (Apprenticeship)", slug: "Apprenticeship" },
    { name: "🎓 ఫ్రెషర్స్ (Freshers)", slug: "Freshers" },
    { name: "💼 అనుభవం (Experienced)", slug: "Experienced" },
    { name: "🏛️ ప్రభుత్వ ఉద్యోగాలు (Govt)", slug: "Government" },
    { name: "🚀 స్టార్టప్స్ (Startups)", slug: "Startup" },
    { name: "📱 రిమోట్ ఐటీ (Remote IT)", slug: "Remote IT" },
    { name: "🎯 ఇంటర్న్‌షిప్స్ (Internships)", slug: "Internships" }
  ];

  // 🎡 Auto-tour category tabs: stay 10 seconds on each category, move rightwards, loop to start at end
  useEffect(() => {
    if (!isTabAutoTouring) return;

    const tourTimer = setInterval(() => {
      setActiveTabIdx((prevIdx) => {
        const nextIdx = (prevIdx + 1) % tabs.length;
        const targetTab = tabs[nextIdx];
        if (targetTab) {
          setActiveTab(targetTab.slug);
          setVisibleCount(3); // show 2 or 3 job posts per view
        }

        // Smooth scroll container rightwards to center tab element
        if (tabsRef.current) {
          const container = tabsRef.current;
          const children = Array.from(container.children) as HTMLElement[];
          if (children[nextIdx]) {
            const child = children[nextIdx];
            if (nextIdx === 0) {
              container.scrollTo({ left: 0, behavior: "auto" });
            } else {
              const targetLeft = Math.max(0, child.offsetLeft - (container.clientWidth / 2) + (child.clientWidth / 2));
              container.scrollTo({ left: targetLeft, behavior: "smooth" });
            }
          }
        }

        return nextIdx;
      });
    }, 10000); // 10 seconds stay on each category tab

    return () => {
      clearInterval(tourTimer);
    };
  }, [isTabAutoTouring, tabs]);

  return (
    <div className="space-y-3.5">
      {/* 🚀 Hero Section: SaaS Gradient Header (Compact & Height-Reduced) */}
      <section className="relative overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-indigo-950 via-indigo-900 to-zinc-950 p-3 sm:p-3.5 text-center text-white border border-white/10 shadow-md">
        <div className="absolute -left-32 -top-32 size-48 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
        <div className="absolute -right-32 -bottom-32 size-48 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" />

        <div className="max-w-xl mx-auto space-y-1.5 relative z-10">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-[9px] sm:text-[10px] font-black text-indigo-300 uppercase tracking-widest animate-pulse">
            <Sparkles className="size-2.5 text-indigo-400" />
            VaartaNow జాబ్స్ హబ్ (Jobs Hub)
          </span>
          <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight leading-snug">
            మీ కెరీర్‌కు సరైన <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-rose-400">ఉద్యోగ అవకాశాలు</span>
          </h1>
          <p className="text-[10.5px] sm:text-xs font-bold text-zinc-300">
            ఆంధ్రప్రదేశ్, తెలంగాణ & రిమోట్ ఐటీ రంగాలలో వేల ఉద్యోగాలు — నేరుగా దరఖాస్తు చేసుకోండి!
          </p>

          <div className="pt-0.5">
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:opacity-95 text-white px-3.5 py-1.5 text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer touch-manipulation"
            >
              <PlusCircle className="size-3.5 text-white" />
              + ఉద్యోగ ప్రకటన పోస్ట్ చేయండి (Post a Job)
            </button>
          </div>

          {/* Search Box & All AP/TG Regional Locations Dropdown */}
          <div className="pt-1 flex flex-col sm:flex-row gap-1.5 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="ఉద్యోగం, టెక్నాలజీ లేదా కంపెనీ పేరుతో వెతకండి..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchQuery(searchInput);
                  }
                }}
                className="w-full h-9 pl-8 pr-16 rounded-xl bg-white/10 border border-white/10 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-400 transition"
              />
              <button
                onClick={() => setSearchQuery(searchInput)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[9.5px] font-black uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1 shadow-sm cursor-pointer"
              >
                వెతకండి
              </button>
            </div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="h-9 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-xs px-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer shadow-sm"
            >
              {/* 1. ALL DISTRICTS */}
              <option value="" className="bg-slate-900 text-white">-- అన్ని జిల్లాలు & ప్రాంతాలు (All Districts) --</option>

              {/* 2. REMOTE / WFH JOBS */}
              <option value="Remote" className="bg-slate-900 text-white">💻 రిమోట్ / వర్క్ ఫ్రమ్ హోమ్ (Remote WFH Jobs)</option>

              {/* 3. FREELANCE JOBS */}
              <option value="Freelance" className="bg-slate-900 text-white">🌍 ఫ్రీలాన్స్ ఉద్యోగాలు (Freelance Jobs)</option>

              {/* 4. APPRENTICESHIP JOBS */}
              <option value="Apprenticeship" className="bg-slate-900 text-white">🛠️ అప్రెంటిస్‌షిప్ ఉద్యోగాలు (Apprenticeship Jobs)</option>
              
              {/* 5. ANDHRA PRADESH CITIES (FIRST) */}
              <option value="Visakhapatnam" className="bg-slate-900 text-white">🌊 విశాఖపట్నం (Vizag) — North Coastal AP</option>
              <option value="Vijayawada" className="bg-slate-900 text-white">🏙️ విజయవాడ (Vijayawada) — Central AP</option>
              <option value="Tirupati" className="bg-slate-900 text-white">🕉️ తిరుపతి (Tirupati) — South AP</option>
              <option value="Rajahmundry" className="bg-slate-900 text-white">🌊 రాజమండ్రి (Rajamahendravaram) — East/Central Godavari</option>
              <option value="Nellore" className="bg-slate-900 text-white">🦐 నెల్లూరు (Nellore) — South Coastal AP</option>
              <option value="Guntur" className="bg-slate-900 text-white">🌶️ గుంటూరు (Guntur)</option>
              <option value="Kurnool" className="bg-slate-900 text-white">⛰️ కర్నూలు (Kurnool) — Rayalaseema</option>
              <option value="Amaravati" className="bg-slate-900 text-white">🏛️ అమరావతి (Amaravati)</option>

              {/* TELANGANA CITIES (SECOND) */}
              <option value="Hyderabad" className="bg-slate-900 text-white">🏢 హైదరాబాద్ (Hyderabad)</option>
              <option value="Warangal" className="bg-slate-900 text-white">🏰 వరంగల్ (Warangal)</option>
              <option value="Nizamabad" className="bg-slate-900 text-white">🏭 నిజామాబాద్ (Nizamabad)</option>
              <option value="Karimnagar" className="bg-slate-900 text-white">🌾 కరీంనగర్ (Karimnagar)</option>
              <option value="Khammam" className="bg-slate-900 text-white">🌳 ఖమ్మం (Khammam)</option>
              <option value="Mahbubnagar" className="bg-slate-900 text-white">🏞️ మహబూబ్‌నగర్ (Mahbubnagar)</option>
            </select>
          </div>
        </div>
      </section>

      {/* 🗂️ Category Tabs with 3s Auto Tour */}
      <div 
        ref={tabsRef}
        onMouseEnter={() => setIsTabAutoTouring(false)}
        onMouseLeave={() => setIsTabAutoTouring(true)}
        onTouchStart={() => setIsTabAutoTouring(false)}
        className="flex border-b border-[hsl(var(--border))]/70 overflow-x-auto no-scrollbar gap-1 py-0.5 relative"
      >
        {tabs.map((t, idx) => {
          const isActive = activeTab === t.slug;
          return (
            <button
              key={t.slug}
              onClick={() => {
                setIsTabAutoTouring(false);
                setActiveTab(t.slug);
                setActiveTabIdx(idx);
                setVisibleCount(3);
              }}
              className={"py-2 px-3 text-xs font-black border-b-2 shrink-0 transition cursor-pointer relative flex items-center gap-1.5 " + (
                isActive
                  ? "border-indigo-600 text-indigo-600 font-extrabold bg-indigo-50/60 dark:bg-indigo-950/40 rounded-t-lg"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <span>{t.name}</span>
              {isActive && isTabAutoTouring && (
                <span className="size-1.5 rounded-full bg-indigo-600 animate-ping shrink-0" title="10s Stay" />
              )}
            </button>
          );
        })}
      </div>

      {/* 🗄️ Double Column Grid layout */}
      <div className="grid gap-6 lg:grid-cols-[1.75fr_1.25fr]">
        
        {/* Left Column: Job Cards List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-[hsl(var(--foreground))]">
              {loading && jobs.length === 0 ? (
                <span className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <span className="inline-block size-2 rounded-full bg-indigo-500 animate-ping" />
                  ఉద్యోగాలు లోడ్ అవుతున్నాయి...
                </span>
              ) : (
                jobs.length + " ఉద్యోగావకాశాలు లభించాయి"
              )}
            </h3>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-black border border-indigo-500/20">
              ⚡ తాజా అప్‌డేట్స్ (Live)
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
                ప్రస్తుతం సరిపోలే ఉద్యోగాలు లేవు. దయచేసి ఫిల్టర్లను మార్చి వెతకండి.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, visibleCount).map((job) => {
                const isSelected = selectedJob?.job_id === job.job_id;
                return (
                  <div
                    key={job.job_id}
                    onClick={() => {
                      setSelectedJob(job);
                      setIsDetailModalOpen(true);
                    }}
                    className={"p-5 rounded-3xl border transition cursor-pointer flex flex-col gap-3 group " + (
                      isSelected
                        ? "bg-indigo-500/5 border-indigo-500 shadow-sm"
                        : "bg-[hsl(var(--card))] border-[hsl(var(--border))] hover:border-indigo-500/50 hover:shadow-md"
                    )}
                  >
                    <div className="flex gap-4">
                      {/* Logo */}
                      <div className="size-12 shrink-0 rounded-2xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))]/50 overflow-hidden flex items-center justify-center font-black text-indigo-500 text-lg">
                        {job.logo_url ? (
                          <img src={job.logo_url} alt={job.company_name} className="size-full object-cover" />
                        ) : (
                          job.company_name[0]
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex justify-between items-start gap-1">
                          <div>
                            <h4 className="font-black text-sm text-[hsl(var(--foreground))] group-hover:text-indigo-600 transition leading-snug">
                              {formatJobTitleTelugu(job.title)}
                            </h4>
                            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block mt-0.5">
                              🏢 {job.company_name}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaveJob(job.job_id);
                            }}
                            className={"p-1.5 rounded-full border transition active:scale-95 shrink-0 " + (
                              savedJobIds.includes(job.job_id)
                                ? "bg-indigo-500/15 border-indigo-400 text-indigo-500"
                                : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
                            )}
                            title="Save Job"
                          >
                            <Bookmark className="size-3.5" />
                          </button>
                        </div>

                        {/* Info badges in Telugu */}
                        <div className="flex flex-wrap gap-1.5 text-[10px] font-bold pt-0.5">
                          <span className="flex items-center gap-1 bg-[hsl(var(--muted))] px-2 py-0.5 rounded-md border border-[hsl(var(--border))]/60 text-[hsl(var(--foreground))]">
                            <MapPin className="size-3 text-red-500 shrink-0" />
                            <span>{job.location}</span>
                          </span>

                          <span className="flex items-center gap-1 bg-[hsl(var(--muted))] px-2 py-0.5 rounded-md border border-[hsl(var(--border))]/60 text-emerald-600 dark:text-emerald-400 font-extrabold">
                            <DollarSign className="size-3 text-emerald-500 shrink-0" />
                            <span>{formatSalaryTelugu(job.salary_range)}</span>
                          </span>

                          <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md font-black">
                            {formatWorkModeTelugu(job.work_mode)}
                          </span>

                          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-black">
                            {formatContractTypeTelugu(job.contract_type)}
                          </span>
                        </div>

                        <p className="text-[11px] leading-relaxed text-[hsl(var(--muted-foreground))] line-clamp-2 pt-1">
                          {job.description_snippet}
                        </p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {job.skills.map((s) => (
                            <span key={s} className="bg-[hsl(var(--muted))]/80 border border-[hsl(var(--border))]/40 px-2 py-0.5 rounded-md text-[9.5px] font-extrabold text-[hsl(var(--muted-foreground))]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Direct Apply Button on Card */}
                    <div className="flex items-center gap-2 pt-2 border-t border-[hsl(var(--border))]/50 mt-1">
                      <a
                        href={job.apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer min-h-[38px]"
                      >
                        <span>👉 దరఖాస్తు చేసుకోండి (Apply Now)</span>
                        <ExternalLink className="size-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedJob(job);
                          setIsDetailModalOpen(true);
                        }}
                        className="py-2.5 px-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] hover:bg-indigo-500/10 text-xs font-bold text-[hsl(var(--foreground))] transition cursor-pointer min-h-[38px]"
                      >
                        వివరాలు ➔
                      </button>
                    </div>
                  </div>
                );
              })}

              {visibleCount < jobs.length && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 10)}
                    className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>
                      {"మరిన్ని ఉద్యోగాలు చూడండి (" + (jobs.length - visibleCount) + " మిగిలి ఉన్నాయి)"}
                    </span>
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: AI Suite & Details Panel (Desktop View) */}
        <div className="space-y-5">
          {/* Active Job Description Drawer */}
          {selectedJob && (
            <div className="rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-4 shadow-sm relative">
              <div className="flex justify-between items-start gap-4 pb-3 border-b border-[hsl(var(--border))]/70">
                <div>
                  <span className="text-[9px] font-black uppercase bg-emerald-600 text-white px-2 py-0.5 rounded tracking-widest">
                    ఉద్యోగ వివరాలు (Active Job)
                  </span>
                  <h3 className="text-base font-black text-[hsl(var(--foreground))] mt-1.5 leading-snug">
                    {formatJobTitleTelugu(selectedJob.title)}
                  </h3>
                  <div className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-1">
                    🏢 {selectedJob.company_name}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const text = "💼 *VaartaNow Job Alert* 💼\n\n📢 *" + selectedJob.title + "*\n🏢 *" + selectedJob.company_name + "*\n📍 *" + selectedJob.location + "*\n💰 *" + selectedJob.salary_range + "*\n\n👉 Apply directly:\n" + selectedJob.apply_link;
                    window.open("https://api.whatsapp.com/send?text=" + encodeURIComponent(text), "_blank");
                  }}
                  className="p-2 rounded-full bg-[hsl(var(--muted))] hover:bg-indigo-500/10 hover:text-indigo-600 transition cursor-pointer"
                  title="Share Job"
                >
                  <Share2 className="size-4" />
                </button>
              </div>

              {/* Detailed specs in Telugu */}
              <div className="grid grid-cols-2 gap-2.5 text-xs font-bold">
                <div className="bg-[hsl(var(--muted))]/50 p-2.5 rounded-xl border border-[hsl(var(--border))]/50 space-y-0.5">
                  <div className="text-[9px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-wide">అనుభవం (Experience)</div>
                  <div className="text-[hsl(var(--foreground))]">{formatExperienceTelugu(selectedJob.experience_level)}</div>
                </div>
                <div className="bg-[hsl(var(--muted))]/50 p-2.5 rounded-xl border border-[hsl(var(--border))]/50 space-y-0.5">
                  <div className="text-[9px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-wide">పని విధానం (Work Mode)</div>
                  <div className="text-[hsl(var(--foreground))]">{formatWorkModeTelugu(selectedJob.work_mode)}</div>
                </div>
                <div className="bg-[hsl(var(--muted))]/50 p-2.5 rounded-xl border border-[hsl(var(--border))]/50 space-y-0.5">
                  <div className="text-[9px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-wide">జీతం (Salary)</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-extrabold">{formatSalaryTelugu(selectedJob.salary_range)}</div>
                </div>
                <div className="bg-[hsl(var(--muted))]/50 p-2.5 rounded-xl border border-[hsl(var(--border))]/50 space-y-0.5">
                  <div className="text-[9px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-wide">జాబ్ మూలం (Platform)</div>
                  <div className="text-[hsl(var(--foreground))]">{selectedJob.source_platform}</div>
                </div>
              </div>

              {/* Full Description Markup */}
              <div className="text-xs leading-relaxed text-[hsl(var(--muted-foreground))] space-y-3 max-h-[220px] overflow-y-auto pr-1 no-scrollbar border-b border-[hsl(var(--border))]/50 pb-3">
                <p className="font-bold text-[hsl(var(--foreground))]">ఉద్యోగ వివరాలు & అర్హతలు:</p>
                <div className="whitespace-pre-line leading-relaxed">{selectedJob.full_description}</div>
              </div>

              {/* Direct Apply Action Link */}
              <div className="flex gap-2">
                <a
                  href={selectedJob.apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 active:scale-95 transition cursor-pointer"
                >
                  <span>🚀 అసలు జాబ్ సైట్‌కి వెళ్లి Apply చేసుకోండి (Apply Now)</span>
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </div>
          )}

          {/* 🧠 AI Gemini Suite Dashboard */}
          <div className="rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-4 shadow-sm relative">
            <div className="flex items-center gap-2 pb-3 border-b border-[hsl(var(--border))]/70">
              <Brain className="size-5 text-indigo-500 animate-pulse" />
              <h3 className="font-black text-sm uppercase tracking-wider text-[hsl(var(--foreground))]">
                స్మార్ట్ రెజ్యూమ్ & ATS చెకర్ (Resume Analyzer)
              </h3>
            </div>

            {/* Resume Input Area */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                మీ రెజ్యూమ్ / అనుభవాల వివరాలు ఇక్కడ పేస్ట్ చేయండి:
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="మీ విద్యార్హతలు, స్కిల్స్ మరియు అనుభవాన్ని ఇక్కడ నమోదు చేసి స్కోర్ చెక్ చేసుకోండి..."
                rows={3}
                className="w-full text-xs font-bold p-3 rounded-2xl bg-[hsl(var(--muted))]/60 border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-neutral-400 focus:bg-[hsl(var(--card))]"
              />
              <button
                onClick={handleCheckATS}
                disabled={analyzing}
                className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
              >
                {analyzing ? "స్కాన్ చేస్తున్నాము..." : "⚡ ATS మ్యాచ్ స్కోర్ చెక్ చేయండి (Check Score)"}
              </button>
            </div>

            {/* ATS Score Display */}
            {aiAnalysis && (
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl space-y-3 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">ATS మ్యాచ్ స్కోర్</div>
                    <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{aiAnalysis.atsScore}%</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase bg-emerald-500/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                      ✓ సరిపోతుంది
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[10.5px] font-bold">
                  <div>
                    <span className="text-indigo-600 dark:text-indigo-400 block text-[9px] uppercase font-black">సరిపోలిన స్కిల్స్ (Matched Skills)</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {aiAnalysis.matchedSkills.map((s) => (
                        <span key={s} className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded font-black text-[9px]">{s}</span>
                      ))}
                    </div>
                  </div>
                  {aiAnalysis.missingSkills.length > 0 && (
                    <div className="pt-1.5">
                      <span className="text-amber-500 block text-[9px] uppercase font-black">అవసరమైన ఇతర స్కిల్స్ (Missing Skills)</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {aiAnalysis.missingSkills.map((s) => (
                          <span key={s} className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-black text-[9px]">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-[hsl(var(--border))]/60 pt-2 text-[10px] text-[hsl(var(--muted-foreground))] leading-relaxed font-semibold">
                  <span className="font-extrabold text-[hsl(var(--foreground))] block uppercase text-[9px] tracking-wide mb-0.5">AI సూచన (Feedback):</span>
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
                  className="flex-1 py-2 px-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] hover:bg-indigo-500/5 hover:border-indigo-500 hover:text-indigo-600 text-[10px] font-black transition flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                >
                  <FileText className="size-3.5" />
                  {generatingLetter ? "రాస్తున్నాము..." : "AI కవర్ లెటర్"}
                </button>
                <button
                  onClick={handleGetInterviewQuestions}
                  disabled={preppingInterview}
                  className="flex-1 py-2 px-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] hover:bg-indigo-500/5 hover:border-indigo-500 hover:text-indigo-600 text-[10px] font-black transition flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                >
                  <HelpCircle className="size-3.5" />
                  {preppingInterview ? "సిద్ధం చేస్తున్నాము..." : "ఇంటర్వ్యూ ప్రశ్నలు"}
                </button>
              </div>
            )}

            {/* Letter output overlay */}
            {generatedLetter && (
              <div className="p-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl text-[10px] leading-relaxed relative font-mono mt-3 animate-in slide-in-from-top duration-300">
                <button
                  onClick={() => setGeneratedLetter("")}
                  className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  ✕
                </button>
                <div className="font-black text-amber-700 mb-1 border-b border-slate-200 pb-1 uppercase tracking-wider text-[9px]">AI సిద్ధం చేసిన కవర్ లెటర్:</div>
                <div className="whitespace-pre-line select-all">{generatedLetter}</div>
              </div>
            )}

            {/* Interview Prep Questions overlay */}
            {interviewPrep.length > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl text-[10px] leading-relaxed relative mt-3 animate-in slide-in-from-top duration-300">
                <button
                  onClick={() => setInterviewPrep([])}
                  className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  ✕
                </button>
                <div className="font-black text-indigo-700 mb-1.5 border-b border-slate-200 pb-1 uppercase tracking-wider text-[9px]">ముఖ్యమైన ఇంటర్వ్యూ ప్రశ్నలు:</div>
                <div className="space-y-2">
                  {interviewPrep.map((q, i) => (
                    <p key={i} className="font-semibold text-slate-800">{q}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 📱 FULL TELUGU JOB DETAIL POPUP MODAL (WORKS ON MOBILE & DESKTOP) */}
      {isDetailModalOpen && selectedJob && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl space-y-4 p-5 sm:p-7 max-h-[94vh] overflow-y-auto no-scrollbar">

            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-3">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-600 text-white shadow-sm inline-block">
                  ఉద్యోగ వివరాలు (Job Opening)
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {formatJobTitleTelugu(selectedJob.title)}
                </h3>
                <p className="text-xs font-bold text-indigo-600">
                  🏢 {selectedJob.company_name}
                </p>
              </div>

              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="rounded-full p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Key badges */}
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase font-extrabold block">📍 ప్రాంతం</span>
                <span className="text-slate-900 font-bold">{selectedJob.location}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase font-extrabold block">💰 జీతం / వేతనం</span>
                <span className="text-emerald-600 font-black">{formatSalaryTelugu(selectedJob.salary_range)}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase font-extrabold block">🏢 పని విధానం</span>
                <span className="text-blue-600 font-bold">{formatWorkModeTelugu(selectedJob.work_mode)}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase font-extrabold block">💼 రకం / కాంట్రాక్ట్</span>
                <span className="text-teal-600 font-bold">{formatContractTypeTelugu(selectedJob.contract_type)}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                ఉద్యోగ వివరాలు & అర్హతలు (Job Details):
              </h4>
              <p className="text-xs leading-relaxed text-slate-800 whitespace-pre-line max-h-48 overflow-y-auto no-scrollbar">
                {selectedJob.full_description}
              </p>
            </div>

            {/* Skills */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-slate-600 uppercase">నైపుణ్యాలు (Required Skills):</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedJob.skills.map((s) => (
                  <span key={s} className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg text-xs font-bold">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions: Big Apply button that navigates to the original site */}
            <div className="pt-2 space-y-2.5">
              <a
                href={selectedJob.apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-black text-sm shadow-xl shadow-indigo-500/25 transition flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-[0.98]"
              >
                <span>🚀 అసలు జాబ్ సైట్‌కి వెళ్లి Apply చేసుకోండి (Apply on Site)</span>
                <ExternalLink className="size-4" />
              </a>

              <button
                onClick={() => {
                  const text = "💼 *VaartaNow Job Alert* 💼\n\n📢 *" + selectedJob.title + "*\n🏢 *" + selectedJob.company_name + "*\n📍 *" + selectedJob.location + "*\n💰 *" + selectedJob.salary_range + "*\n\n👉 Apply directly:\n" + selectedJob.apply_link;
                  window.open("https://api.whatsapp.com/send?text=" + encodeURIComponent(text), "_blank");
                }}
                className="w-full py-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Share2 className="size-4 text-emerald-600" />
                <span>వాట్సాప్‌లో స్నేహితులకు షేర్ చేయండి (Share Job)</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Job Post Modal */}
      <JobPostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onJobPosted={() => {
          // Refresh list on new job post
          window.location.reload();
        }}
      />
    </div>
  );
}
