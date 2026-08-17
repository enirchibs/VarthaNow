import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  BarChart3, Edit3, Eye, Search, Star, Trash2, Sparkles, Upload, Activity,
  Plus, RefreshCw, Play, CheckCircle2, XCircle, Clock, AlertTriangle, ListFilter,
  ArrowRight, ShieldCheck, User, LogOut, ChevronRight
} from "lucide-react";
import type { BlogPost, NewsCategory } from "@/types/news";
import { createPost, deletePost, getAdminPosts, updatePost } from "@/lib/news-api";
import { categories, categoryLabel } from "@/lib/categories";
import { Button, Input } from "@/components/ui";
import { setMeta } from "@/lib/seo";
import { useLanguage, type Language } from "@/hooks/useLanguage";
import { supabase } from "@/lib/supabase";

interface RssFeed {
  id: string;
  url: string;
  category: string;
  priority_tier: number;
  publisher: string;
  direct_feed: boolean;
  last_fetched_at: string | null;
  next_fetch_time: string | null;
  current_interval_seconds: number;
  consecutive_failures: number;
}

interface PipelineJob {
  id: string;
  post_slug: string;
  job_type: string;
  status: string;
  priority: number;
  retry_count: number;
  max_retries: number;
  scheduled_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_log: string | null;
  payload: any;
  created_at: string;
}

type TabType = "articles" | "writer" | "feeds" | "queue";

export function AdminPage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Dashboard navigation
  const [activeTab, setActiveTab] = useState<TabType>("articles");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Data states
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [jobs, setJobs] = useState<PipelineJob[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [jobStats, setJobStats] = useState({ pending: 0, processing: 0, done: 0, failed: 0, dead: 0 });

  // Filter/Search states
  const [query, setQuery] = useState("");
  const [feedQuery, setFeedQuery] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");

  // Post Editor states
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [editPrompt, setEditPrompt] = useState("");

  // AI News Writer State
  const [subject, setSubject] = useState("");
  const [writerCategory, setWriterCategory] = useState<NewsCategory>("technology");
  const [writerLanguage, setWriterLanguage] = useState<Language>("te");
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<Omit<BlogPost, "id" | "created_at" | "updated_at"> | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState("");

  // RSS Feed Form State
  const [isFeedFormOpen, setIsFeedFormOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<RssFeed | null>(null);
  const [feedUrl, setFeedUrl] = useState("");
  const [feedPublisher, setFeedPublisher] = useState("");
  const [feedCategory, setFeedCategory] = useState<NewsCategory>("politics");
  const [feedPriority, setFeedPriority] = useState<number>(2);
  const [feedInterval, setFeedInterval] = useState<number>(3600);

  // File upload refs
  const draftFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  // Manual Trigger Loaders
  const [triggeringIngest, setTriggeringIngest] = useState<string | null>(null);
  const [triggeringAi, setTriggeringAi] = useState(false);
  const [triggeringSocial, setTriggeringSocial] = useState(false);

  // --- Auth Check ---
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // --- Load Metadata and Initial Data ---
  useEffect(() => {
    setMeta({
      title: "Admin Dashboard - VarthaNow",
      description: "Manage AI articles, RSS news ingestion, and queue workflows.",
      canonical: "/admin"
    });
    if (user) {
      refreshAllData();
    }
  }, [user]);

  const refreshAllData = async () => {
    if (!supabase) return;
    setLoadingData(true);
    setErrorMsg("");
    try {
      // 1. Fetch Posts
      const adminPosts = await getAdminPosts(0);
      setPosts(adminPosts);

      // 2. Fetch Feeds
      const { data: feedsData, error: feedsErr } = await supabase
        .from("rss_feeds")
        .select("*")
        .order("created_at", { ascending: false });
      if (feedsErr) throw feedsErr;
      setFeeds(feedsData || []);

      // 3. Fetch Jobs
      const { data: jobsData, error: jobsErr } = await supabase
        .from("pipeline_jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(40);
      if (jobsErr) throw jobsErr;
      setJobs(jobsData || []);

      // 4. Calculate Job Stats
      const { data: statsData, error: statsErr } = await supabase
        .from("pipeline_jobs")
        .select("status");
      if (statsErr) throw statsErr;
      
      const counts = { pending: 0, processing: 0, done: 0, failed: 0, dead: 0 };
      statsData?.forEach((j: any) => {
        if (j.status in counts) {
          counts[j.status as keyof typeof counts]++;
        }
      });
      setJobStats(counts);

    } catch (err: any) {
      console.error("Error loading admin data:", err);
      setErrorMsg(`Failed to load data: ${err.message}`);
    } finally {
      setLoadingData(false);
    }
  };

  // --- Custom Image File Upload ---
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, isDraft: boolean) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage("Uploading image...");
    if (!supabase) {
      setErrorMsg("Supabase is not configured.");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `article-images/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("news-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("news-images").getPublicUrl(filePath);
      
      if (isDraft) {
        if (draft) {
          setDraft({ ...draft, og_image: data.publicUrl });
        } else {
          setDraft({
            slug: `news-${Date.now()}`,
            title: subject || "Custom News Article",
            excerpt: "Custom news excerpt.",
            content: "## Article Content",
            category: writerCategory,
            tags: [writerCategory],
            meta_title: subject || "Custom News",
            meta_description: "Custom news description",
            og_image: data.publicUrl,
            author_name: "VarthaNow Editor",
            language: writerLanguage,
            published: true,
            featured: false,
            reading_time_min: 3,
            published_at: new Date().toISOString()
          });
        }
      } else if (!isDraft && editing) {
        setEditing({ ...editing, og_image: data.publicUrl });
      }

      setMessage("Image uploaded successfully!");
    } catch (error: any) {
      console.error("Upload error:", error);
      setErrorMsg(`Upload failed: ${error.message}`);
    }
  };

  // --- AI Generator handler ---
  const generateArticle = async () => {
    if (!subject.trim()) {
      setErrorMsg("Please enter a news subject.");
      return;
    }
    setIsGenerating(true);
    setMessage("");
    setErrorMsg("");
    setDraft(null);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    if (!apiKey) {
      setErrorMsg("VITE_GEMINI_API_KEY is not configured in .env");
      setIsGenerating(false);
      return;
    }

    const languageNames: Record<string, string> = {
      te: "Telugu",
      en: "English",
      hi: "Hindi",
      ta: "Tamil",
      kn: "Kannada"
    };

    const targetLanguage = languageNames[writerLanguage] || "Telugu";

    const prompt = `
    You are VarthaNow, a professional news editor. Rewrite the following news subject/topic into an original, copyright-safe, SEO-optimized news article in ${targetLanguage}.
    
    Topic/Subject: ${subject}
    Category: ${writerCategory}
    
    Rules:
    - Write a highly original, compelling news story in ${targetLanguage} using professional, human-like grammar and short readable paragraphs.
    - Do not invent fake statistics.
    - Include markdown headings, bullet points, FAQ, and a conclusion.
    - Return ONLY valid JSON with the exact keys:
      slug, title, excerpt, content, tags, meta_title, meta_description, reading_time_min, image_prompt, featured.
    
    For key "image_prompt":
    Create a highly descriptive prompt (2-3 sentences) in English for a text-to-image generator.
    - If the category or topic is about Vizag (Visakhapatnam), describe a beautiful coastal scenic photograph of Visakhapatnam sea corridor, R.K. Beach road overlooking the blue Bay of Bengal, palm trees, or Kailasagiri.
    - If the category or topic is about Telangana, describe Hyderabad landmarks such as the Charminar, Tank Bund Hussainsagar lake, Birla Mandir, or the Secretariat building.
    - If Andhra Pradesh, describe Prakasam Barrage, Tirumala hills, or Amaravati administrative buildings.
    - For other categories, describe a realistic, professional, editorial news photograph representing the event. Always specify 'no text, no logos, no watermarks, realistic photojournalism style'.
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Gemini API rate limit exceeded. Please wait 30 seconds and try again!");
        }
        throw new Error(`Gemini failed with status: ${response.status}`);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
      const cleanJson = textResponse.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(cleanJson);

      const generatedSlug = parsed.slug || subject.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");

      const draftArticle: Omit<BlogPost, "id" | "created_at" | "updated_at"> = {
        slug: generatedSlug,
        title: parsed.title || subject,
        excerpt: parsed.excerpt || `Latest news about: ${subject}`,
        content: parsed.content || `## ${subject}\n\nMore details will be updated soon.`,
        category: writerCategory,
        tags: Array.isArray(parsed.tags) ? parsed.tags : [writerCategory, "News"],
        meta_title: parsed.meta_title || parsed.title || subject,
        meta_description: parsed.meta_description || parsed.excerpt || subject,
        og_image: `/images/${writerCategory}-fallback.jpg`,
        author_name: "VarthaNow AI Writer",
        language: writerLanguage,
        published: true,
        featured: parsed.featured || false,
        reading_time_min: Number(parsed.reading_time_min || 3),
        published_at: new Date().toISOString()
      };

      setDraft(draftArticle);
      setCurrentPrompt("");
      setMessage("AI Draft generated successfully! Cover image fallback applied.");
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const submitDraft = async () => {
    if (!draft) return;
    try {
      const created = await createPost(draft);
      setPosts((items) => [created, ...items]);
      setMessage("Article published successfully!");
      setDraft(null);
      setSubject("");
    } catch (error: any) {
      setErrorMsg(`Publishing failed: ${error.message}`);
    }
  };

  // --- RSS Feed Actions ---
  const saveFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setErrorMsg("");
    setMessage("");

    const payload = {
      url: feedUrl,
      publisher: feedPublisher,
      category: feedCategory,
      priority_tier: Number(feedPriority),
      current_interval_seconds: Number(feedInterval),
      next_fetch_time: new Date().toISOString()
    };

    try {
      if (editingFeed) {
        // Edit Feed
        const { error } = await supabase
          .from("rss_feeds")
          .update(payload)
          .eq("id", editingFeed.id);
        if (error) throw error;
        setMessage("RSS Feed updated successfully!");
      } else {
        // Add Feed
        const { error } = await supabase
          .from("rss_feeds")
          .insert(payload);
        if (error) throw error;
        setMessage("RSS Feed added successfully!");
      }

      setIsFeedFormOpen(false);
      setEditingFeed(null);
      clearFeedForm();
      refreshAllData();
    } catch (err: any) {
      console.error("Error saving RSS Feed:", err);
      setErrorMsg(`Save failed: ${err.message}`);
    }
  };

  const startEditFeed = (feed: RssFeed) => {
    setEditingFeed(feed);
    setFeedUrl(feed.url);
    setFeedPublisher(feed.publisher);
    setFeedCategory(feed.category as NewsCategory);
    setFeedPriority(feed.priority_tier);
    setFeedInterval(feed.current_interval_seconds);
    setIsFeedFormOpen(true);
  };

  const deleteFeedItem = async (feedId: string) => {
    if (!supabase || !confirm("Are you sure you want to delete this RSS feed?")) return;
    setErrorMsg("");
    try {
      const { error } = await supabase
        .from("rss_feeds")
        .delete()
        .eq("id", feedId);
      if (error) throw error;
      setMessage("Feed deleted successfully.");
      refreshAllData();
    } catch (err: any) {
      setErrorMsg(`Delete failed: ${err.message}`);
    }
  };

  const clearFeedForm = () => {
    setFeedUrl("");
    setFeedPublisher("");
    setFeedCategory("politics");
    setFeedPriority(2);
    setFeedInterval(3600);
    setEditingFeed(null);
  };

  // --- Manual Workers Execution Triggers ---
  const triggerIngestPoll = async (category: string | null) => {
    if (!supabase) return;
    const catName = category || "All Categories";
    setTriggeringIngest(category || "all");
    setErrorMsg("");
    setMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("ingest-rss?force=true", {
        body: category ? { category } : {}
      });
      if (error) throw error;
      setMessage(`RSS Ingest triggered for ${catName}! Status: ${data?.ok ? "Success" : "Failed"}. Stats: ${JSON.stringify(data?.stats || {})}`);
      refreshAllData();
    } catch (err: any) {
      console.error("Ingest trigger error:", err);
      setErrorMsg(`Trigger failed: ${err.message}`);
    } finally {
      setTriggeringIngest(null);
    }
  };

  const triggerAiProcessor = async () => {
    if (!supabase) return;
    setTriggeringAi(true);
    setErrorMsg("");
    setMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("process-ai-queue");
      if (error) throw error;
      setMessage(`AI Processor triggered! Status: ${data?.ok ? "Success" : "Failed"}. Stats: ${JSON.stringify(data?.stats || {})}`);
      refreshAllData();
    } catch (err: any) {
      console.error("AI trigger error:", err);
      setErrorMsg(`AI execution failed: ${err.message}`);
    } finally {
      setTriggeringAi(false);
    }
  };

  const triggerSocialPublisher = async () => {
    if (!supabase) return;
    setTriggeringSocial(true);
    setErrorMsg("");
    setMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("social-worker");
      if (error) throw error;
      setMessage(`Social worker triggered! Status: ${data?.ok ? "Success" : "Failed"}. Stats: ${JSON.stringify(data?.stats || {})}`);
      refreshAllData();
    } catch (err: any) {
      console.error("Social trigger error:", err);
      setErrorMsg(`Social execution failed: ${err.message}`);
    } finally {
      setTriggeringSocial(false);
    }
  };

  // --- Article management handlers ---
  const toggle = async (post: BlogPost, key: "published" | "featured") => {
    const next = { ...post, [key]: !post[key] };
    setPosts((items) => items.map((item) => (item.slug === post.slug ? next : item)));
    try {
      await updatePost(post.slug, { [key]: next[key] });
      setMessage("Updated successfully.");
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  };

  const remove = async (post: BlogPost) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return;
    setPosts((items) => items.filter((item) => item.slug !== post.slug));
    try {
      await deletePost(post.slug);
      setMessage("Deleted successfully.");
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    setPosts((items) => items.map((item) => (item.slug === editing.slug ? editing : item)));
    try {
      await updatePost(editing.slug, {
        title: editing.title,
        excerpt: editing.excerpt,
        content: editing.content,
        meta_title: editing.meta_title,
        meta_description: editing.meta_description,
        tags: editing.tags,
        og_image: editing.og_image
      });
      setMessage("Article saved.");
      setEditing(null);
    } catch (error: any) {
      setErrorMsg(`Save failed: ${error.message}`);
    }
  };

  // --- Memoized Filter Lists ---
  const visiblePosts = useMemo(() => {
    const val = query.toLowerCase();
    return posts.filter((post) => 
      [post.title, post.category, post.excerpt].join(" ").toLowerCase().includes(val)
    );
  }, [posts, query]);

  const visibleFeeds = useMemo(() => {
    const val = feedQuery.toLowerCase();
    return feeds.filter((feed) => 
      [feed.publisher, feed.url, feed.category].join(" ").toLowerCase().includes(val)
    );
  }, [feeds, feedQuery]);

  const visibleJobs = useMemo(() => {
    if (jobTypeFilter === "all") return jobs;
    return jobs.filter(j => j.job_type === jobTypeFilter);
  }, [jobs, jobTypeFilter]);

  // --- Auth Guards / Loaders ---
  if (authLoading) {
    return (
      <div className="container-shell flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="size-8 animate-spin text-[hsl(var(--primary))]" />
          <p className="text-sm font-bold text-[hsl(var(--muted-foreground))]">Loading administrator credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-shell flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md w-full text-center p-8 border border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-[2rem] shadow-2xl">
          <ShieldCheck className="size-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black mb-2">Access Denied</h1>
          <p className="text-[hsl(var(--muted-foreground))] font-bold text-sm mb-6">
            The administrative dashboard is restricted. Please sign in with an authorized editor profile.
          </p>
          <Button onClick={() => navigate("/login")} className="w-full h-11 font-black">
            Sign In to Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="container-shell space-y-6 py-6 max-w-7xl mx-auto">
      {/* 🚀 Header */}
      <header className="rounded-[1.8rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <ShieldCheck className="size-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black tracking-tight">Admin Console</h1>
              <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">Authorized</span>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium mt-1">
              Active Session: <span className="text-[hsl(var(--foreground))] font-bold">{user.email}</span>
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/admin/diagnostics"
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-amber-500 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
          >
            <Activity className="size-4" />
            API Diagnostics
          </Link>
          <Button 
            variant="secondary" 
            onClick={() => supabase?.auth.signOut()} 
            className="h-10 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <LogOut className="size-3.5" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* 📊 Aggregate Stats Dashboard */}
      <section className="grid gap-3 grid-cols-2 md:grid-cols-5">
        <div className="rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
          <BarChart3 className="mb-3 size-5 text-blue-500" />
          <div className="text-2xl font-black">{posts.length}</div>
          <div className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mt-1">Articles</div>
        </div>
        <div className="rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
          <Play className="mb-3 size-5 text-emerald-500" />
          <div className="text-2xl font-black">{feeds.length}</div>
          <div className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mt-1">RSS Feeds</div>
        </div>
        <div className="rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
          <Clock className="mb-3 size-5 text-yellow-500" />
          <div className="text-2xl font-black">{jobStats.pending + jobStats.processing}</div>
          <div className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mt-1">Pending Jobs</div>
        </div>
        <div className="rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
          <CheckCircle2 className="mb-3 size-5 text-emerald-500" />
          <div className="text-2xl font-black">{jobStats.done}</div>
          <div className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mt-1">Completed Jobs</div>
        </div>
        <div className="rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 col-span-2 md:col-span-1 shadow-sm">
          <AlertTriangle className="mb-3 size-5 text-red-500" />
          <div className="text-2xl font-black text-red-500">{jobStats.failed + jobStats.dead}</div>
          <div className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mt-1">Failed Jobs</div>
        </div>
      </section>

      {/* ⚠️ Notification Messages */}
      {message && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 text-sm font-bold flex items-start gap-2.5 shadow-sm">
          <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
          <div>{message}</div>
        </div>
      )}
      {errorMsg && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 text-sm font-bold flex items-start gap-2.5 shadow-sm">
          <XCircle className="size-5 shrink-0 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      {/* 🎛️ Navigation Tabs */}
      <section className="flex border-b border-[hsl(var(--border))] gap-1 pb-px overflow-x-auto no-scrollbar">
        {[
          { id: "articles", label: "Articles Manager", icon: ListFilter },
          { id: "writer", label: "AI Generator", icon: Sparkles },
          { id: "feeds", label: "RSS Feeds", icon: Play },
          { id: "queue", label: "Queue Monitor", icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                setMessage("");
                setErrorMsg("");
              }}
              className={`flex items-center gap-2 px-5 py-3.5 border-b-2 font-bold text-sm transition-all whitespace-nowrap outline-none ${
                isActive 
                  ? "border-[hsl(var(--primary))] text-[hsl(var(--foreground))]" 
                  : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
        <Button 
          variant="secondary" 
          onClick={refreshAllData} 
          disabled={loadingData}
          className="ml-auto h-9 self-center rounded-xl text-xs flex items-center gap-1.5 shadow-sm px-3"
        >
          <RefreshCw className={`size-3.5 ${loadingData ? "animate-spin" : ""}`} />
          Sync Data
        </Button>
      </section>

      {/* 🚀 Tab Contents */}
      <section className="min-h-[400px]">
        {/* ==================== TAB 1: ARTICLES MANAGER ==================== */}
        {activeTab === "articles" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                <Input 
                  value={query} 
                  onChange={(event) => setQuery(event.target.value)} 
                  className="pl-11 rounded-2xl h-11" 
                  placeholder="Search stored news articles..." 
                />
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-sm">
              <div className="divide-y divide-[hsl(var(--border))]/50">
                {visiblePosts.length === 0 ? (
                  <div className="p-10 text-center text-sm font-bold text-[hsl(var(--muted-foreground))]">
                    No articles found matching search criteria.
                  </div>
                ) : (
                  visiblePosts.map((post) => (
                    <div key={post.slug} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[hsl(var(--muted))]/10 transition-colors">
                      <div className="space-y-1">
                        <div className="font-black text-base line-clamp-1 leading-snug">{post.title}</div>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[hsl(var(--muted-foreground))]">
                          <span className="bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] px-2 py-0.5 rounded-md uppercase text-[9px] tracking-wider">
                            {categoryLabel(post.category)}
                          </span>
                          <span>·</span>
                          <span>{post.published ? "🟢 Published" : "🟡 Draft"}</span>
                          <span>·</span>
                          <span>{post.featured ? "⭐ Featured" : "Standard"}</span>
                          <span>·</span>
                          <span>{new Date(post.published_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 self-end md:self-auto flex-wrap">
                        <Button 
                          variant="secondary" 
                          onClick={() => toggle(post, "published")}
                          className="h-9 px-3 text-xs font-bold rounded-xl flex items-center gap-1 bg-[hsl(var(--muted))]/80 hover:bg-[hsl(var(--muted))]"
                        >
                          <Eye className="size-3.5 text-zinc-500" />
                          {post.published ? "Unpublish" : "Publish"}
                        </Button>
                        
                        <Button 
                          variant="secondary" 
                          onClick={() => toggle(post, "featured")}
                          className={`h-9 px-3 text-xs font-bold rounded-xl flex items-center gap-1 ${
                            post.featured ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" : "bg-[hsl(var(--muted))]/80 hover:bg-[hsl(var(--muted))]"
                          }`}
                        >
                          <Star className={`size-3.5 ${post.featured ? "fill-amber-500" : ""}`} />
                          Feature
                        </Button>

                        <Button 
                          variant="secondary" 
                          onClick={() => {
                            setEditing(post);
                            const match = post.og_image?.match(/\/prompt\/(.+?)\?/);
                            setEditPrompt(match ? decodeURIComponent(match[1]) : "");
                            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                          }}
                          className="h-9 px-3 text-xs font-bold rounded-xl flex items-center gap-1 bg-[hsl(var(--muted))]/80 hover:bg-[hsl(var(--muted))]"
                        >
                          <Edit3 className="size-3.5 text-zinc-500" />
                          Edit
                        </Button>

                        <Button 
                          variant="secondary" 
                          onClick={() => remove(post)}
                          className="h-9 w-9 p-0 text-red-500 hover:bg-red-500/10 rounded-xl"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: AI NEWS GENERATOR ==================== */}
        {activeTab === "writer" && (
          <div className="rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-black flex items-center gap-2 text-[hsl(var(--foreground))]">
                <Sparkles className="size-5 text-blue-500" />
                Gemini AI Article Composer
              </h2>
              <p className="text-xs text-[hsl(var(--muted-foreground))] font-semibold mt-1">
                Enter a news headline, topic, or brief description to compose a full, SEO-ready Telugu article automatically.
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-[1fr_200px_180px_auto] items-end">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Topic / Prompt</label>
                <Input 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                  placeholder="e.g. Visakhapatnam steel plant modernizations or state election updates..." 
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Category</label>
                <select 
                  value={writerCategory} 
                  onChange={(e) => setWriterCategory(e.target.value as any)} 
                  className="w-full h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3.5 text-xs font-bold outline-none focus:border-[hsl(var(--primary))]"
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.label[lang] || c.label.en}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Language</label>
                <select 
                  value={writerLanguage} 
                  onChange={(e) => setWriterLanguage(e.target.value as any)} 
                  className="w-full h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3.5 text-xs font-bold outline-none focus:border-[hsl(var(--primary))]"
                >
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="kn">Kannada (ಕನ್ನಡ)</option>
                </select>
              </div>

              <Button 
                onClick={generateArticle} 
                disabled={isGenerating || !subject.trim()} 
                className="h-11 font-black bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Compose Draft
                  </>
                )}
              </Button>
            </div>

            {/* AI Draft Review */}
            {draft && (
              <div className="border-t border-[hsl(var(--border))]/50 pt-6 space-y-4 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-blue-600 dark:text-blue-400">✨ Review Generated AI News Draft</h3>
                  <Button variant="secondary" onClick={() => setDraft(null)} className="h-8 text-xs px-3 rounded-lg">Clear Draft</Button>
                </div>
                
                <div className="grid gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] block">Article Title</label>
                    <Input 
                      value={draft.title} 
                      onChange={(e) => setDraft({ ...draft, title: e.target.value, meta_title: e.target.value })} 
                      className="rounded-xl h-11"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] block">Excerpt (SEO Description)</label>
                    <Input 
                      value={draft.excerpt} 
                      onChange={(e) => setDraft({ ...draft, excerpt: e.target.value, meta_description: e.target.value })} 
                      className="rounded-xl h-11"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] block">Content (Markdown)</label>
                    <textarea
                      value={draft.content}
                      onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                      className="min-h-56 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-sm outline-none focus:border-[hsl(var(--primary))] font-medium leading-relaxed"
                    />
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] block">Tags (Comma separated)</label>
                      <Input 
                        value={draft.tags.join(", ")} 
                        onChange={(e) => setDraft({ ...draft, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })} 
                        className="rounded-xl h-11"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] block">Image Public URL</label>
                      <Input 
                        value={draft.og_image || ""} 
                        onChange={(e) => setDraft({ ...draft, og_image: e.target.value })} 
                        className="rounded-xl h-11"
                      />
                    </div>
                  </div>

                  <div className="border-t border-[hsl(var(--border))]/30 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {draft.og_image && (
                        <div className="relative aspect-[16/10] w-36 overflow-hidden rounded-2xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] shrink-0">
                          <img src={draft.og_image} alt="Draft cover" className="size-full object-cover" />
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-[hsl(var(--muted-foreground))] block">Cover Image Upload</span>
                        <input 
                          type="file" 
                          ref={draftFileRef} 
                          onChange={(e) => handleFileUpload(e, true)} 
                          accept="image/*" 
                          className="hidden" 
                        />
                        <Button 
                          variant="secondary" 
                          type="button"
                          onClick={() => draftFileRef.current?.click()}
                          className="h-10 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                        >
                          <Upload className="size-4" />
                          Choose Image File
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                      <label className="flex items-center gap-2 text-sm font-bold cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={draft.featured} 
                          onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} 
                          className="rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
                        />
                        Mark as Featured
                      </label>
                      
                      <Button onClick={submitDraft} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 h-11 rounded-xl shadow-md">
                        Submit & Publish Article
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 3: RSS FEEDS MANAGER ==================== */}
        {activeTab === "feeds" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                <Input 
                  value={feedQuery} 
                  onChange={(event) => setFeedQuery(event.target.value)} 
                  className="pl-11 rounded-2xl h-11" 
                  placeholder="Search active RSS feeds..." 
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                <Button 
                  onClick={() => triggerIngestPoll(null)}
                  disabled={triggeringIngest !== null}
                  className="h-11 px-4 text-xs font-bold rounded-2xl flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex-1 sm:flex-none justify-center"
                >
                  <RefreshCw className={`size-3.5 ${triggeringIngest === "all" ? "animate-spin" : ""}`} />
                  Poll All Feeds
                </Button>

                <Button 
                  onClick={() => {
                    clearFeedForm();
                    setIsFeedFormOpen(true);
                  }}
                  className="h-11 px-4 text-xs font-bold rounded-2xl flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex-1 sm:flex-none justify-center"
                >
                  <Plus className="size-4" />
                  Add Feed Url
                </Button>
              </div>
            </div>

            {/* Ingestion Trigger Blocks */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border border-[hsl(var(--border))]/40 p-3 bg-[hsl(var(--muted))]/10 rounded-[1.3rem]">
              <span className="col-span-2 sm:col-span-5 text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))] tracking-wider px-1">Quick Force Polls</span>
              {[
                { label: "Breaking", value: "breaking" },
                { label: "Politics", value: "politics" },
                { label: "Cinema", value: "cinema" },
                { label: "Business", value: "business" },
                { label: "Health", value: "health" }
              ].map(cat => (
                <button
                  key={cat.value}
                  onClick={() => triggerIngestPoll(cat.value)}
                  disabled={triggeringIngest !== null}
                  className="h-9 text-xs font-bold border border-[hsl(var(--border))]/50 hover:bg-[hsl(var(--muted))] active:scale-95 transition-all rounded-xl flex items-center justify-center gap-1.5 bg-[hsl(var(--card))]"
                >
                  <Play className={`size-3 text-emerald-500 ${triggeringIngest === cat.value ? "animate-ping" : ""}`} />
                  {cat.label}
                </button>
              ))}
            </div>

            {/* RSS Add/Edit Form Form */}
            {isFeedFormOpen && (
              <form onSubmit={saveFeed} className="rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-md space-y-4 animate-in slide-in-from-top-4 duration-200">
                <div className="flex items-center justify-between border-b border-[hsl(var(--border))]/30 pb-3">
                  <h3 className="text-base font-black text-[hsl(var(--foreground))]">
                    {editingFeed ? "Edit RSS Ingestion Feed" : "Register New RSS Feed"}
                  </h3>
                  <Button variant="secondary" type="button" onClick={() => setIsFeedFormOpen(false)} className="h-8 text-xs px-2.5 rounded-lg">Cancel</Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Publisher Name</label>
                    <Input 
                      value={feedPublisher} 
                      onChange={(e) => setFeedPublisher(e.target.value)} 
                      placeholder="e.g. Eenadu, Sakshi, Google News" 
                      required 
                      className="rounded-xl h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))]">RSS Feed URL</label>
                    <Input 
                      value={feedUrl} 
                      onChange={(e) => setFeedUrl(e.target.value)} 
                      placeholder="e.g. https://example.com/feed.xml" 
                      required 
                      type="url"
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Ingested Category Mapping</label>
                    <select 
                      value={feedCategory} 
                      onChange={(e) => setFeedCategory(e.target.value as any)} 
                      className="w-full h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3.5 text-xs font-bold outline-none focus:border-[hsl(var(--primary))]"
                    >
                      {categories.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.label[lang] || c.label.en}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Priority Tier</label>
                    <select 
                      value={feedPriority} 
                      onChange={(e) => setFeedPriority(Number(e.target.value))} 
                      className="w-full h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3.5 text-xs font-bold outline-none focus:border-[hsl(var(--primary))]"
                    >
                      <option value={1}>Tier 1 (High Importance)</option>
                      <option value={2}>Tier 2 (Standard)</option>
                      <option value={3}>Tier 3 (Bulk/Low Priority)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Fetch Interval (seconds)</label>
                    <select 
                      value={feedInterval} 
                      onChange={(e) => setFeedInterval(Number(e.target.value))} 
                      className="w-full h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3.5 text-xs font-bold outline-none focus:border-[hsl(var(--primary))]"
                    >
                      <option value={60}>1 Minute (Breaking only)</option>
                      <option value={900}>15 Minutes</option>
                      <option value={1800}>30 Minutes</option>
                      <option value={3600}>1 Hour</option>
                      <option value={7200}>2 Hours</option>
                      <option value={14400}>4 Hours</option>
                      <option value={86400}>24 Hours</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[hsl(var(--border))]/30">
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 h-10 rounded-xl shadow-md">
                    {editingFeed ? "Save Changes" : "Register Feed"}
                  </Button>
                </div>
              </form>
            )}

            {/* Feeds Table */}
            <div className="rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[hsl(var(--muted))]/50 border-b border-[hsl(var(--border))]/60">
                      <th className="p-4 text-xs font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Publisher</th>
                      <th className="p-4 text-xs font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Category</th>
                      <th className="p-4 text-xs font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))]">URL</th>
                      <th className="p-4 text-xs font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Tier</th>
                      <th className="p-4 text-xs font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Last Polled</th>
                      <th className="p-4 text-xs font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Status</th>
                      <th className="p-4 text-xs font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--border))]/40">
                    {visibleFeeds.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-sm font-bold text-[hsl(var(--muted-foreground))]">
                          No RSS feeds configured.
                        </td>
                      </tr>
                    ) : (
                      visibleFeeds.map((feed) => {
                        const hasErrors = feed.consecutive_failures > 0;
                        return (
                          <tr key={feed.id} className="hover:bg-[hsl(var(--muted))]/10 transition-colors">
                            <td className="p-4 font-bold text-sm text-[hsl(var(--foreground))] whitespace-nowrap">
                              {feed.publisher}
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <span className="bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">
                                {feed.category}
                              </span>
                            </td>
                            <td className="p-4 text-xs font-medium text-[hsl(var(--muted-foreground))] max-w-[200px] truncate" title={feed.url}>
                              {feed.url}
                            </td>
                            <td className="p-4 text-sm font-bold text-[hsl(var(--foreground))] whitespace-nowrap">
                              T{feed.priority_tier}
                            </td>
                            <td className="p-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                              {feed.last_fetched_at 
                                ? new Date(feed.last_fetched_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) 
                                : "Never"}
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              {hasErrors ? (
                                <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                                  ⚠️ Failed ({feed.consecutive_failures})
                                </span>
                              ) : (
                                <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button 
                                  variant="secondary" 
                                  onClick={() => startEditFeed(feed)}
                                  className="h-8 px-2 text-[10px] font-bold rounded-lg bg-[hsl(var(--muted))]/60 hover:bg-[hsl(var(--muted))]"
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="secondary" 
                                  onClick={() => deleteFeedItem(feed.id)}
                                  className="h-8 px-2 text-[10px] font-bold text-red-500 rounded-lg hover:bg-red-500/10"
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: QUEUE WORKFLOW MONITOR ==================== */}
        {activeTab === "queue" && (
          <div className="space-y-4 animate-in fade-in-40 duration-200">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-[hsl(var(--primary))]" />
                <h3 className="font-black text-base text-[hsl(var(--foreground))]">Active Pipeline Log</h3>
                <span className="text-xs font-bold text-[hsl(var(--muted-foreground))]">({jobs.length} jobs fetched)</span>
              </div>

              {/* Force Workers Triggers */}
              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                <Button 
                  onClick={triggerAiProcessor}
                  disabled={triggeringAi}
                  className="h-11 px-4 text-xs font-bold rounded-2xl flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex-1 sm:flex-none justify-center"
                >
                  <RefreshCw className={`size-3.5 ${triggeringAi ? "animate-spin" : ""}`} />
                  Run AI Writer
                </Button>

                <Button 
                  onClick={triggerSocialPublisher}
                  disabled={triggeringSocial}
                  className="h-11 px-4 text-xs font-bold rounded-2xl flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex-1 sm:flex-none justify-center"
                >
                  <RefreshCw className={`size-3.5 ${triggeringSocial ? "animate-spin" : ""}`} />
                  Run Social Worker
                </Button>
              </div>
            </div>

            {/* Filter Job Types */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-[hsl(var(--border))]/30">
              {[
                { id: "all", label: "All Tasks" },
                { id: "rewrite", label: "AI Rewrites" },
                { id: "seo", label: "SEO Metas" },
                { id: "tags", label: "Tag Composition" },
                { id: "summary", label: "Summarizations" },
                { id: "social", label: "Social Captions" },
                { id: "quality", label: "Quality Checks" }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setJobTypeFilter(filter.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    jobTypeFilter === filter.id 
                      ? "bg-[hsl(var(--primary))] text-white" 
                      : "bg-[hsl(var(--muted))]/50 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Jobs List */}
            <div className="rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-sm">
              <div className="divide-y divide-[hsl(var(--border))]/50">
                {visibleJobs.length === 0 ? (
                  <div className="p-10 text-center text-sm font-bold text-[hsl(var(--muted-foreground))]">
                    No pipeline tasks currently registered.
                  </div>
                ) : (
                  visibleJobs.map((job) => {
                    let statusColor = "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
                    let Icon = Clock;
                    if (job.status === "processing") {
                      statusColor = "bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse";
                      Icon = RefreshCw;
                    } else if (job.status === "done") {
                      statusColor = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                      Icon = CheckCircle2;
                    } else if (job.status === "failed") {
                      statusColor = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
                      Icon = AlertTriangle;
                    } else if (job.status === "dead") {
                      statusColor = "bg-red-500/10 text-red-500 border-red-500/20";
                      Icon = XCircle;
                    }

                    return (
                      <div key={job.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[hsl(var(--muted))]/10 transition-colors">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase text-[hsl(var(--primary))] tracking-wider">
                              [{job.job_type}]
                            </span>
                            <Link to={`/news/${job.post_slug}`} className="text-sm font-bold text-[hsl(var(--foreground))] hover:underline line-clamp-1">
                              {job.post_slug}
                            </Link>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[hsl(var(--muted-foreground))] font-semibold">
                            <span>Priority: P{job.priority}</span>
                            <span>·</span>
                            <span>Retries: {job.retry_count}/{job.max_retries}</span>
                            <span>·</span>
                            <span>Created: {new Date(job.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                            {job.completed_at && (
                              <>
                                <span>·</span>
                                <span>Done in: {Math.max(1, Math.round((new Date(job.completed_at).getTime() - new Date(job.created_at).getTime()) / 1000))}s</span>
                              </>
                            )}
                          </div>

                          {job.error_log && (
                            <div className="text-[11px] font-bold text-red-500 bg-red-500/5 border border-red-500/10 px-3 py-2 rounded-xl mt-2 select-all break-all leading-normal max-h-24 overflow-y-auto">
                              ❌ {job.error_log}
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 self-start md:self-auto">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${statusColor}`}>
                            <Icon className={`size-3.5 ${job.status === "processing" ? "animate-spin" : ""}`} />
                            {job.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ==================== EDIT ARTICLE MODAL SECTION (INLINE BOTTOM) ==================== */}
      {editing && (
        <section className="rounded-[1.8rem] border-2 border-[hsl(var(--primary))] bg-[hsl(var(--card))] p-6 shadow-xl space-y-4 animate-in slide-in-from-bottom-6 duration-200">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))]/40 pb-3">
            <h2 className="text-xl font-black text-[hsl(var(--foreground))] flex items-center gap-2">
              <Edit3 className="size-5 text-[hsl(var(--primary))]" />
              Modify News Article Content
            </h2>
            <Button variant="secondary" onClick={() => setEditing(null)} className="h-8 text-xs px-2.5 rounded-lg">Cancel</Button>
          </div>

          <div className="grid gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[hsl(var(--muted-foreground))]">Title</label>
              <Input 
                value={editing.title} 
                onChange={(event) => setEditing({ ...editing, title: event.target.value, meta_title: event.target.value })} 
                className="rounded-xl h-11"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[hsl(var(--muted-foreground))]">Excerpt</label>
              <Input 
                value={editing.excerpt} 
                onChange={(event) => setEditing({ ...editing, excerpt: event.target.value, meta_description: event.target.value })} 
                className="rounded-xl h-11"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[hsl(var(--muted-foreground))]">Body Content (Markdown)</label>
              <textarea
                value={editing.content}
                onChange={(event) => setEditing({ ...editing, content: event.target.value })}
                className="min-h-56 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-sm outline-none focus:border-[hsl(var(--primary))] font-medium leading-relaxed"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[hsl(var(--muted-foreground))]">Tags (Comma separated)</label>
                <Input
                  value={editing.tags.join(", ")}
                  onChange={(event) => setEditing({ ...editing, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })}
                  className="rounded-xl h-11"
                  placeholder="Tags"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[hsl(var(--muted-foreground))]">Image Cover URL</label>
                <Input 
                  value={editing.og_image || ""} 
                  onChange={(event) => setEditing({ ...editing, og_image: event.target.value })} 
                  className="rounded-xl h-11"
                  placeholder="Image URL" 
                />
              </div>
            </div>

            <div className="border-t border-[hsl(var(--border))]/30 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {editing.og_image && (
                  <div className="relative aspect-[16/10] w-36 overflow-hidden rounded-2xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] shrink-0">
                    <img src={editing.og_image} alt="Edit cover preview" className="size-full object-cover" />
                  </div>
                )}
                
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[hsl(var(--muted-foreground))] block">Upload Cover Replacement</span>
                  <input 
                    type="file" 
                    ref={editFileRef} 
                    onChange={(e) => handleFileUpload(e, false)} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <Button 
                    variant="secondary" 
                    type="button"
                    onClick={() => editFileRef.current?.click()}
                    className="h-10 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Upload className="size-4" />
                    Replace Image File
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 ml-auto">
                <Button onClick={saveEdit} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 h-11 rounded-xl shadow-md">
                  Save Changes & Update Post
                </Button>
                <Button variant="secondary" onClick={() => setEditing(null)} className="font-bold px-4 h-11 rounded-xl">Cancel</Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
