
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
  ChevronDown,
  Brain, 
  FileText, 
  HelpCircle, 
  PlusCircle,
  ExternalLink,
  X,
  Sparkles,
  CheckCircle2,
  Check,
  Building2,
  ShoppingCart,
  Truck,
  Wrench,
  HardHat,
  UtensilsCrossed,
  HeartPulse,
  GraduationCap,
  ShieldCheck,
  Laptop,
  Landmark,
  Compass,
  Navigation,
  Clock,
  Home,
  UserCheck,
  Bell,
  User,
  Crosshair,
  Loader2
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
import { LocationAreaSelector } from "@/components/LocationAreaSelector";
import { detectDetailedGPSArea } from "@/lib/location-detector";
import { UserProfileModal } from "@/components/UserProfileModal";
import { UserProfile, getStoredUserProfile, PROFILE_EVENT_NAME } from "@/lib/user-profile";

// 🛍️ Local Job Categories matching Mana Adda Image
const MANA_ADDA_CATEGORIES = [
  { name: "ఆఫీస్ & అడ్మిన్", enName: "Office & Admin", slug: "Office", icon: Building2, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50" },
  { name: "సేల్స్ & రిటైల్", enName: "Sales & Retail", slug: "Sales", icon: ShoppingCart, color: "text-red-500 bg-red-50 dark:bg-red-950/50" },
  { name: "డ్రైవర్ & డెలివరీ", enName: "Driver & Delivery", slug: "Delivery", icon: Truck, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" },
  { name: "టెక్నీషియన్ & స్కిల్డ్", enName: "Technician & Skilled", slug: "Technician", icon: Wrench, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50" },
  { name: "కన్‌స్ట్రక్షన్", enName: "Construction", slug: "Construction", icon: HardHat, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50" },
  { name: "హోటల్ & హాస్పిటాలిటీ", enName: "Hotel & Hospitality", slug: "Hospitality", icon: UtensilsCrossed, color: "text-pink-600 bg-pink-50 dark:bg-pink-950/50" },
  { name: "హెల్త్‌కేర్", enName: "Healthcare", slug: "Healthcare", icon: HeartPulse, color: "text-rose-600 bg-rose-50 dark:bg-rose-950/50" },
  { name: "టీచింగ్ & ఎడ్యుకేషన్", enName: "Teaching & Education", slug: "Teaching", icon: GraduationCap, color: "text-teal-600 bg-teal-50 dark:bg-teal-950/50" },
  { name: "సెక్యూరిటీ", enName: "Security", slug: "Security", icon: ShieldCheck, color: "text-sky-600 bg-sky-50 dark:bg-sky-950/50" },
  { name: "IT & Software", enName: "IT & Software", slug: "IT", icon: Laptop, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50" },
  { name: "గవర్నమెంట్", enName: "Government", slug: "Government", icon: Landmark, color: "text-green-700 bg-green-50 dark:bg-green-950/50" },
  { name: "ఇంటర్న్‌షిప్స్", enName: "Internships", slug: "Internships", icon: GraduationCap, color: "text-orange-600 bg-orange-50 dark:bg-orange-950/50" }
];

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
  const [selectedAreaLocality, setSelectedAreaLocality] = useState("");
  const [selectedTown, setSelectedTown] = useState<string>("విశాఖపట్నం (Visakhapatnam)");
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [quickChip, setQuickChip] = useState<string>("all");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      return getStoredUserProfile();
    } catch {
      return null;
    }
  });
  const [isGPSDetecting, setIsGPSDetecting] = useState(false);
  const [gpsNotice, setGpsNotice] = useState<string | null>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const [visibleCount, setVisibleCount] = useState(10);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);
  const [isTabAutoTouring, setIsTabAutoTouring] = useState<boolean>(false);
  const location = useLocation();
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(() => {
    try {
      return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("post") === "true";
    } catch {
      return false;
    }
  });

  const [showNewJobAlert, setShowNewJobAlert] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target as Node)) {
        setIsLocationDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync profile reactively
  useEffect(() => {
    const handleProfileUpdate = () => {
      setUserProfile(getStoredUserProfile());
    };
    window.addEventListener(PROFILE_EVENT_NAME as any, handleProfileUpdate);
    window.addEventListener("storage", handleProfileUpdate);
    return () => {
      window.removeEventListener(PROFILE_EVENT_NAME as any, handleProfileUpdate);
      window.removeEventListener("storage", handleProfileUpdate);
    };
  }, []);

  // One-tap GPS Detection
  const handleDetectGPS = async () => {
    setIsGPSDetecting(true);
    setGpsNotice("మీ ప్రస్తుత లొకేషన్ గుర్తిస్తున్నాము...");
    try {
      const area = await detectDetailedGPSArea();
      if (area) {
        const detectedName = area.suburb_village || area.city_town || area.formatted_address || "విశాఖపట్నం";
        setSelectedTown(detectedName);
        setQuickChip("near_me");
        setActiveTab("NearMe");
        setGpsNotice(`✅ మీ లొకేషన్ గుర్తించబడింది: ${detectedName}`);
      } else {
        setSelectedTown("విశాఖపట్నం (Visakhapatnam)");
        setQuickChip("near_me");
        setActiveTab("NearMe");
        setGpsNotice("✅ స్థానిక ఉద్యోగాలు లోడ్ చేయబడ్డాయి.");
      }
    } catch {
      setSelectedTown("విశాఖపట్నం (Visakhapatnam)");
      setQuickChip("near_me");
      setActiveTab("NearMe");
      setGpsNotice("✅ సమీప ఉద్యోగాలు లోడ్ చేయబడ్డాయి.");
    } finally {
      setIsGPSDetecting(false);
      setTimeout(() => setGpsNotice(null), 4000);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("post") === "true") {
      setIsPostModalOpen(true);
    }
    if (params.get("newJob") === "true") {
      setShowNewJobAlert(true);
      setActiveTab("all");
      setIsTabAutoTouring(false);
      setVisibleCount(50);
      setRefreshTrigger((prev) => prev + 1);
      window.history.replaceState({}, "", "/jobs");
    }
  }, [location.search]);

  // Reactive listener for newly posted jobs across tabs / modals
  useEffect(() => {
    const handleJobsUpdated = () => {
      setRefreshTrigger((prev) => prev + 1);
    };
    window.addEventListener("vaartanow_jobs_updated", handleJobsUpdated);
    window.addEventListener("storage", handleJobsUpdated);
    return () => {
      window.removeEventListener("vaartanow_jobs_updated", handleJobsUpdated);
      window.removeEventListener("storage", handleJobsUpdated);
    };
  }, []);
  
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
      
      // Determine district / locality filter parameter
      const districtFilter = (selectedDistrict === "Remote" || selectedDistrict === "Freelance" || selectedDistrict === "Apprenticeship")
        ? ""
        : (selectedAreaLocality || selectedDistrict);

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
      } else if (tabSlug === "Office") {
        filteredData = data.filter(j => 
          /office|admin|computer operator|data entry|ఆఫీస్|అడ్మిన్|కంప్యూటర్|డేటా ఎంట్రీ/i.test(j.title + j.skills.join(" ") + (j.tags || []).join(" "))
        );
      } else if (tabSlug === "Sales") {
        filteredData = data.filter(j => 
          /sales|retail|store|billing|సేల్స్|రిటైల్|స్టోర్|మార్కెటింగ్/i.test(j.title + j.skills.join(" ") + (j.tags || []).join(" "))
        );
      } else if (tabSlug === "Delivery") {
        filteredData = data.filter(j => 
          /delivery|driver|rider|zomato|swiggy|blinkit|డెలివరీ|డ్రైవర్/i.test(j.title + j.skills.join(" ") + (j.tags || []).join(" "))
        );
      } else if (tabSlug === "Technician") {
        filteredData = data.filter(j => 
          /technician|mechanic|electrician|ac repair|repair|టెక్నీషియన్|మెకానిక్|ఎలక్ట్రీషియన్/i.test(j.title + j.skills.join(" ") + (j.tags || []).join(" "))
        );
      } else if (tabSlug === "Construction") {
        filteredData = data.filter(j => 
          /construction|site|civil|supervisor|కన్‌స్ట్రక్షన్|సివిల్|సూపర్‌వైజర్/i.test(j.title + j.skills.join(" ") + (j.tags || []).join(" "))
        );
      } else if (tabSlug === "Hospitality") {
        filteredData = data.filter(j => 
          /hotel|hospitality|restaurant|chef|cook|waiter|హోటల్|రెస్టారెంట్/i.test(j.title + j.skills.join(" ") + (j.tags || []).join(" "))
        );
      } else if (tabSlug === "Healthcare") {
        filteredData = data.filter(j => 
          /health|hospital|nurse|pharma|medical|హెల్త్|హాస్పిటల్|నర్సు/i.test(j.title + j.skills.join(" ") + (j.tags || []).join(" "))
        );
      } else if (tabSlug === "Teaching") {
        filteredData = data.filter(j => 
          /teaching|teacher|trainer|education|tutor|టీచర్|లెక్చరర్|ట్రైనర్/i.test(j.title + j.skills.join(" ") + (j.tags || []).join(" "))
        );
      } else if (tabSlug === "Security") {
        filteredData = data.filter(j => 
          /security|guard|watchman|సెక్యూరిటీ|గార్డ్/i.test(j.title + j.skills.join(" ") + (j.tags || []).join(" "))
        );
      } else if (tabSlug === "IT") {
        filteredData = data.filter(j => 
          /software|developer|engineer|it|programmer|సాఫ్ట్‌వేర్|కోడింగ్/i.test(j.title + j.skills.join(" ") + (j.tags || []).join(" "))
        );
      } else if (tabSlug === "NearMe") {
        // Show local town-level / near-me jobs
        filteredData = data.filter(j => 
          (j.tags || []).includes("నా దగ్గర") || 
          j.source_platform.includes("మన అడ్డా") || 
          /km\)|local|town/i.test(j.location)
        );
        if (filteredData.length === 0) filteredData = data;
      }

      // Quick Chips Filter
      if (quickChip === "near_me") {
        const nearJobs = filteredData.filter(j => 
          (j.tags || []).includes("నా దగ్గర") || 
          j.source_platform.includes("మన అడ్డా") || 
          /km\)|local|town/i.test(j.location)
        );
        if (nearJobs.length > 0) filteredData = nearJobs;
      } else if (quickChip === "govt") {
        filteredData = filteredData.filter(j => 
          (j.tags || []).some(t => /govt|government/i.test(t)) || 
          /govt|government|appsc|tspsc|ప్రభుత్వ/i.test(j.title + j.company_name + (j.tags || []).join(" "))
        );
      } else if (quickChip === "freshers") {
        filteredData = filteredData.filter(j => 
          j.experience_level === "Fresher" || 
          (j.tags || []).includes("Freshers") || 
          /fresher|trainee|ఫ్రెషర్|ట్రైనీ/i.test(j.title + j.description_snippet)
        );
      } else if (quickChip === "wfh") {
        filteredData = filteredData.filter(j => 
          j.work_mode === "Remote" || 
          /remote|wfh|work from home|వర్క్ ఫ్రమ్ హోమ్/i.test(j.title + j.location)
        );
      } else if (quickChip === "part_time") {
        filteredData = filteredData.filter(j => 
          j.contract_type === "Freelance" || 
          (j.tags || []).includes("Part-time") || 
          /part-time|పార్ట్ టైమ్|ఫ్రీలాన్స్/i.test(j.title + j.contract_type)
        );
      } else if (quickChip === "onsite") {
        filteredData = filteredData.filter(j => j.work_mode === "On-site");
      }

      // Selected Town/City Filter
      if (selectedTown && selectedTown.trim() !== "") {
        const teTown = selectedTown.split("(")[0].trim().toLowerCase();
        const enTown = (selectedTown.match(/\((.*?)\)/)?.[1] || "").toLowerCase();
        const townMatches = filteredData.filter(j => 
          (teTown && j.location.toLowerCase().includes(teTown)) ||
          (enTown && j.location.toLowerCase().includes(enTown)) ||
          (enTown && (j.district || "").toLowerCase().includes(enTown)) ||
          (teTown && (j.district || "").toLowerCase().includes(teTown))
        );
        if (townMatches.length > 0) {
          filteredData = townMatches;
        }
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
  }, [searchQuery, activeTab, selectedDistrict, selectedAreaLocality, selectedTown, quickChip, initialWorkModeFilter, initialContractFilter, refreshTrigger]);

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
      {/* 🌟 1. Mana Adda Brand Header: Logo, Town Selector, Notifications & Profile */}
      <header className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 shadow-lg border border-indigo-500/20 relative z-30">
        {/* Background Glows (Contained) */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -left-20 -top-20 size-40 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -right-20 -bottom-20 size-40 rounded-full bg-emerald-500/20 blur-3xl" />
        </div>

        <div className="flex items-center justify-between gap-3 relative z-10">
          {/* Left: Brand + Tagline + Location Picker */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">మన అడ్డా</span>
                </span>
                <span className="text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  జాబ్స్
                </span>
              </div>
              <p className="text-[10.5px] sm:text-xs font-bold text-zinc-300">
                మన ఊరి.. మన వాళ్ల కోసం
              </p>
            </div>

            {/* Location Selector Dropdown Pill */}
            <div className="relative" ref={locationDropdownRef}>
              <button
                type="button"
                onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-black text-white transition active:scale-95 cursor-pointer shadow-sm"
              >
                <MapPin className="size-3.5 text-rose-400 shrink-0" />
                <span className="truncate max-w-[170px] sm:max-w-[260px]">
                  {selectedTown || "విశాఖపట్నం (Visakhapatnam)"}
                </span>
                <ChevronDown className="size-3 text-zinc-300 shrink-0" />
              </button>

              {/* Dropdown Menu */}
              {isLocationDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 max-h-[26rem] overflow-y-auto rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-indigo-500/40 shadow-2xl shadow-black/80 p-2 z-[60] animate-in fade-in-50 zoom-in-95 text-xs text-white divide-y divide-slate-800">
                  {/* 1-tap GPS Button */}
                  <div className="p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLocationDropdownOpen(false);
                        handleDetectGPS();
                      }}
                      disabled={isGPSDetecting}
                      className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow transition active:scale-95 cursor-pointer"
                    >
                      {isGPSDetecting ? (
                        <Loader2 className="size-4 animate-spin text-white shrink-0" />
                      ) : (
                        <Crosshair className="size-4 text-emerald-200 shrink-0" />
                      )}
                      <span>🎯 ప్రస్తుత స్థానం ఉపయోగించండి (GPS)</span>
                    </button>
                  </div>

                  {/* AP & TG Main Cities */}
                  <div className="p-2 space-y-1">
                    <div className="text-[10px] font-black uppercase text-indigo-400 px-2 py-1 tracking-wider">
                      🏙️ AP & TG ప్రధాన నగరాలు (Main Cities)
                    </div>
                    {[
                      "హైదరాబాద్ (Hyderabad)",
                      "విశాఖపట్నం (Visakhapatnam)",
                      "విజయవాడ (Vijayawada)",
                      "తిరుపతి (Tirupati)",
                      "వరంగల్ (Warangal)",
                      "ఖమ్మం (Khammam)",
                      "రాజమండ్రి (Rajahmundry)",
                      "గుంటూరు (Guntur)",
                      "నెల్లూరు (Nellore)",
                      "కర్నూలు (Kurnool)",
                      "కాకినాడ (Kakinada)",
                      "నిజామాబాద్ (Nizamabad)",
                      "కరీంనగర్ (Karimnagar)"
                    ].map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setSelectedTown(city);
                          setSelectedDistrict(city.split("(")[1]?.replace(")", "") || "");
                          setIsLocationDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-bold text-xs transition cursor-pointer ${
                          selectedTown === city 
                            ? "bg-indigo-600 text-white shadow-sm" 
                            : "text-zinc-200 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <span className="truncate">{city}</span>
                        {selectedTown === city && <Check className="size-4 text-white shrink-0 ml-2" />}
                      </button>
                    ))}
                  </div>

                  {/* Town / Mandal Localities */}
                  <div className="p-2 space-y-1">
                    <div className="text-[10px] font-black uppercase text-emerald-400 px-2 py-1 tracking-wider">
                      📍 లోకల్ టౌన్లు & మండలాలు (Towns & Mandals)
                    </div>
                    {[
                      "డాబాగార్డెన్స్ (Daba Gardens, Vizag)",
                      "మధురవాడ (Madhurawada, Vizag)",
                      "గాజువాక (Gajuwaka, Vizag)",
                      "ఎంవీపీ కాలనీ (MVP Colony, Vizag)",
                      "సీతమ్మధార (Seethammadhara, Vizag)",
                      "ఆనందపురం (Anandapuram)",
                      "బెంచ్ సర్కిల్ (Benz Circle, Vijayawada)",
                      "కూకట్‌పల్లి (Kukatpally, Hyderabad)",
                      "హైటెక్ సిటీ (Hitec City, Hyderabad)"
                    ].map((town) => (
                      <button
                        key={town}
                        type="button"
                        onClick={() => {
                          setSelectedTown(town);
                          setIsLocationDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-bold text-xs transition cursor-pointer ${
                          selectedTown === town 
                            ? "bg-indigo-600 text-white shadow-sm" 
                            : "text-zinc-200 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <span className="truncate">{town}</span>
                        {selectedTown === town && <Check className="size-4 text-white shrink-0 ml-2" />}
                      </button>
                    ))}
                  </div>

                  {/* All Locations */}
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTown("");
                        setSelectedDistrict("");
                        setIsLocationDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl font-bold text-xs text-zinc-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                    >
                      🌐 అన్ని నగరాలు & పట్టణాలు (All Locations)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Notifications Bell (with badge 3) + Profile Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer"
                title="నోటిఫికేషన్లు (Notifications)"
              >
                <Bell className="size-4 sm:size-5" />
                <span className="absolute -top-1 -right-1 size-4 sm:size-4.5 rounded-full bg-rose-600 text-white font-black text-[9px] sm:text-[10px] flex items-center justify-center border-2 border-slate-900 shadow">
                  3
                </span>
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-3 z-50 animate-in fade-in text-xs text-white space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="font-black text-white text-xs">🔔 ఉద్యోగ నోటిఫికేషన్లు</span>
                    <span className="text-[10px] bg-rose-600/20 text-rose-300 px-1.5 py-0.5 rounded font-bold">3 కొత్తవి</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 rounded-xl bg-slate-800/70 border border-slate-700">
                      <p className="font-bold text-[11px] text-emerald-400">⚡ 3 కొత్త లోకల్ ఉద్యోగాలు</p>
                      <p className="text-[10px] text-zinc-300 mt-0.5">వైజాగ్ & విజయవాడ పరిసర ప్రాంతాల్లో తాజా లోకల్ ఉద్యోగాలు చేరాయి.</p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-800/70 border border-slate-700">
                      <p className="font-bold text-[11px] text-blue-400">💼 TV Mechanic & Sales Executive</p>
                      <p className="text-[10px] text-zinc-300 mt-0.5">తక్కువ దూరం (5-12 km) లోని ఉద్యోగాలకు నేరుగా దరఖాస్తు చేసుకోండి.</p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-800/70 border border-slate-700">
                      <p className="font-bold text-[11px] text-purple-400">🤖 AI రెజ్యూమ్ స్కానర్</p>
                      <p className="text-[10px] text-zinc-300 mt-0.5">మీ రెజ్యూమ్‌ను స్కాన్ చేసి జాబ్ మ్యాచ్ స్కోర్ చెక్ చేయండి.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar */}
            <button
              type="button"
              onClick={() => setIsUserProfileModalOpen(true)}
              className="size-9 sm:size-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-white/40 flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition overflow-hidden cursor-pointer"
              title={userProfile?.name ? userProfile.name : "ప్రొఫైల్ (Profile)"}
            >
              {userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} alt="User" className="size-full object-cover" />
              ) : userProfile?.name ? (
                userProfile.name.charAt(0).toUpperCase()
              ) : (
                <User className="size-4 sm:size-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* GPS Status Notice Banner */}
      {gpsNotice && (
        <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/40 p-3 text-center font-bold text-xs text-emerald-800 dark:text-emerald-200 animate-in slide-in-from-top-2 shadow-xs">
          {gpsNotice}
        </div>
      )}

      {/* Success Alert Banner for Newly Posted Job */}
      {showNewJobAlert && (
        <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/40 p-4 text-center font-black text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-2 shadow-md animate-in slide-in-from-top-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
            <span className="truncate">🎉 మీ ఉద్యోగ ప్రకటన విజయవంతంగా ప్రచురించబడింది! జాబితాలో మొదటిగా జోడించబడింది.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowNewJobAlert(false)}
            className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 size-6 flex items-center justify-center rounded-full hover:bg-emerald-500/20 shrink-0 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* 💼 2. Section Title Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div>
          <h1 className="text-base sm:text-lg font-black text-[hsl(var(--foreground))] flex items-center gap-1.5">
            <span>💼 ఉద్యోగాలు</span>
          </h1>
          <p className="text-xs font-bold text-[hsl(var(--muted-foreground))]">
            మంచి అవకాశాలు.. మీ కోసం..
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsPostModalOpen(true)}
          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-md active:scale-95 transition cursor-pointer"
        >
          <PlusCircle className="size-3.5" />
          <span>+ ప్రకటన పోస్ట్ చేయండి</span>
        </button>
      </div>

      {/* 🔍 3. Search & GPS Bar */}
      <div className="flex flex-col sm:flex-row gap-2 pt-0.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <input
            type="text"
            placeholder="ఉద్యోగాలు, నైపుణ్యాలు లేదా కంపెనీ పేరు వెతకండి..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearchQuery(searchInput);
              }
            }}
            className="w-full h-10 pl-9 pr-20 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-400 shadow-sm transition"
          />
          <button
            type="button"
            onClick={() => setSearchQuery(searchInput)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[10px] font-black uppercase tracking-wider transition active:scale-95 shadow cursor-pointer"
          >
            వెతకండి
          </button>
        </div>

        {/* GPS Location 1-tap Detect Button */}
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isGPSDetecting}
          className="h-10 px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer shrink-0"
        >
          {isGPSDetecting ? (
            <Loader2 className="size-4 animate-spin text-white shrink-0" />
          ) : (
            <Crosshair className="size-4 text-emerald-200 shrink-0" />
          )}
          <span>🎯 ప్రస్తుత స్థానం ఉపయోగించండి</span>
        </button>
      </div>

      {/* 🏷️ 4. Quick Filter Horizontal Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs font-black">
        {[
          { id: "near_me", label: "📍 నా దగ్గర (Near Me)" },
          { id: "govt", label: "🏛️ ప్రభుత్వ ఉద్యోగాలు" },
          { id: "freshers", label: "🎓 Freshers" },
          { id: "wfh", label: "🏠 Remote Work From Home" },
          { id: "part_time", label: "⏱️ Part-time" },
          { id: "onsite", label: "🏢 On-site" },
        ].map((chip) => {
          const isSelected = quickChip === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => {
                if (isSelected) {
                  setQuickChip("all");
                } else {
                  setQuickChip(chip.id);
                  if (chip.id === "near_me") {
                    setActiveTab("NearMe");
                  }
                }
              }}
              className={`px-3 py-1.5 rounded-full shrink-0 border transition active:scale-95 cursor-pointer flex items-center gap-1 text-[11px] ${
                isSelected
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-indigo-400"
              }`}
            >
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      {/* 🗂️ 5. Category Grid Section: ఉద్యోగాలు వెతకండి (2 Columns matching mockup) */}
      <section className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-black text-[hsl(var(--foreground))]">
              ఉద్యోగాలు వెతకండి
            </h2>
            <p className="text-[11px] font-bold text-[hsl(var(--muted-foreground))]">
              మీకు సరిపోయే ఉద్యోగ విభాగాన్ని ఎంచుకోండి
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveTab("all");
              setQuickChip("all");
            }}
            className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>అన్ని కేటగిరీలు</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {MANA_ADDA_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => {
                  setIsTabAutoTouring(false);
                  setActiveTab(cat.slug);
                  setVisibleCount(30);
                }}
                className={`p-2.5 rounded-2xl border transition flex items-center justify-between gap-2 text-left active:scale-[0.98] cursor-pointer shadow-xs ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm"
                    : "bg-[hsl(var(--card))] border-[hsl(var(--border))] hover:border-indigo-300 dark:hover:border-indigo-700"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${cat.color}`}>
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-black text-xs text-[hsl(var(--foreground))] truncate">
                      {cat.name}
                    </span>
                    <span className="block text-[9.5px] font-bold text-[hsl(var(--muted-foreground))] truncate">
                      {cat.enName}
                    </span>
                  </div>
                </div>
                <ChevronRight className={`size-3.5 shrink-0 transition ${isActive ? "text-indigo-600" : "text-[hsl(var(--muted-foreground))]"}`} />
              </button>
            );
          })}
        </div>
      </section>

      {/* 🗄️ 6. Double Column Grid layout: Feed & Detail Drawer */}
      <div className="grid gap-6 lg:grid-cols-[1.75fr_1.25fr] pt-2">
        
        {/* Left Column: Recommended Job Cards Feed */}
        <div className="space-y-3">
          {/* Feed Title Bar matching mockup */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-black text-[hsl(var(--foreground))]">
                మీకు సరిపోయే ఉద్యోగాలు
              </h3>
              <p className="text-[11px] font-bold text-[hsl(var(--muted-foreground))]">
                మీ ప్రాంతంలోని తాజా ఉద్యోగ అవకాశాలు
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab("all");
                setQuickChip("all");
                setSelectedTown("");
                setSelectedDistrict("");
                setVisibleCount(50);
              }}
              className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>అన్ని చూడండి</span>
              <ChevronRight className="size-3.5" />
            </button>
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
                const isFresherFriendly = job.experience_level === "Fresher" || (job.tags || []).includes("Freshers");
                const isNew = (job.tags || []).includes("New") || (Date.now() - new Date(job.posted_date).getTime() < 86400000 * 3);

                return (
                  <div
                    key={job.job_id}
                    onClick={() => {
                      setSelectedJob(job);
                      setIsDetailModalOpen(true);
                    }}
                    className={`p-4 sm:p-5 rounded-3xl border transition cursor-pointer flex flex-col gap-3 group ${
                      isSelected
                        ? "bg-indigo-500/5 border-indigo-500 shadow-sm"
                        : "bg-[hsl(var(--card))] border-[hsl(var(--border))] hover:border-indigo-500/50 hover:shadow-md"
                    }`}
                  >
                    {/* Header Row: Company Avatar + Title/Company/Distance + Badges/Bookmark */}
                    <div className="flex gap-3 items-start">
                      {/* Logo Avatar */}
                      <div className="size-12 shrink-0 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-lg flex items-center justify-center shadow-xs overflow-hidden">
                        {job.logo_url ? (
                          <img src={job.logo_url} alt={job.company_name} className="size-full object-cover" />
                        ) : (
                          job.company_name[0]
                        )}
                      </div>

                      {/* Main Title & Subtitle */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-sm text-[hsl(var(--foreground))] group-hover:text-indigo-600 transition leading-snug">
                          {formatJobTitleTelugu(job.title)}
                        </h4>
                        <div className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] mt-0.5">
                          {job.company_name}
                        </div>
                        <div className="flex items-center gap-1 text-[10.5px] font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                          <MapPin className="size-3 text-red-500 shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                      </div>

                      {/* Top Right: Badges + Bookmark */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isNew && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[9.5px] font-black">
                            New
                          </span>
                        )}
                        {isFresherFriendly && !isNew && (
                          <span className="px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30 text-[9.5px] font-black">
                            Freshers OK
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveJob(job.job_id);
                          }}
                          className={`p-1.5 rounded-full border transition active:scale-95 shrink-0 ${
                            savedJobIds.includes(job.job_id)
                              ? "bg-indigo-500/15 border-indigo-400 text-indigo-500"
                              : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
                          }`}
                          title="Save Job"
                        >
                          <Bookmark className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Row: Salary · Work Mode · Experience */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-extrabold pt-0.5">
                      <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        <DollarSign className="size-3 shrink-0" />
                        <span>{formatSalaryTelugu(job.salary_range)}</span>
                      </span>

                      <span className="flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md">
                        <Building2 className="size-3 shrink-0" />
                        <span>{formatWorkModeTelugu(job.work_mode)}</span>
                      </span>

                      <span className="flex items-center gap-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-md">
                        <Briefcase className="size-3 shrink-0" />
                        <span>{formatExperienceTelugu(job.experience_level)}</span>
                      </span>
                    </div>

                    {/* Description snippet */}
                    <p className="text-[11px] leading-relaxed text-[hsl(var(--muted-foreground))] line-clamp-2">
                      {job.description_snippet}
                    </p>

                    {/* Skills pills */}
                    <div className="flex flex-wrap gap-1">
                      {job.skills.map((s) => (
                        <span key={s} className="bg-[hsl(var(--muted))]/80 border border-[hsl(var(--border))]/50 px-2 py-0.5 rounded-md text-[9.5px] font-bold text-[hsl(var(--muted-foreground))]">
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Action buttons matching image */}
                    <div className="flex items-center gap-2 pt-2 border-t border-[hsl(var(--border))]/50 mt-0.5">
                      <a
                        href={job.apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer min-h-[36px]"
                      >
                        <span>అప్లై చేయండి (Apply)</span>
                        <ExternalLink className="size-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedJob(job);
                          setIsDetailModalOpen(true);
                        }}
                        className="py-2 px-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] hover:bg-indigo-500/10 text-xs font-bold text-[hsl(var(--foreground))] transition cursor-pointer min-h-[36px]"
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
        onClose={() => {
          setIsPostModalOpen(false);
          window.history.replaceState({}, "", "/jobs");
        }}
        onJobPosted={() => {
          setIsPostModalOpen(false);
          window.history.replaceState({}, "", "/jobs");
          setActiveTab("all");
          setIsTabAutoTouring(false);
          setVisibleCount(50);
          setShowNewJobAlert(true);
          setRefreshTrigger((prev) => prev + 1);
        }}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        onLoginSuccess={(profile) => {
          setUserProfile(profile);
          setIsUserProfileModalOpen(false);
        }}
      />
    </div>
  );
}
