import { useEffect, useState, useMemo } from "react";
import { 
  Search, Image as ImageIcon, Sparkles, Filter, Copy, Check, ExternalLink, 
  Tag, Info, Eye, RefreshCw, Layers, ShieldCheck, MapPin, User, Folder, AlertTriangle, X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button, Input } from "@/components/ui";

export interface ImageLibraryItem {
  id: string;
  asset_code?: string;
  kind: "person" | "place" | "topic" | "category";
  label: string;
  title?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  prompt?: string;
  negative_prompt?: string;
  tags: string[];
  keywords_en?: string[];
  keywords_te?: string[];
  location_tags?: string[];
  person_tags?: string[];
  topic_tags?: string[];
  public_url: string;
  storage_path: string;
  credit: string;
  license: string;
  focus: string;
  times_used: number;
  is_ai_generated?: boolean;
  editorial_label?: string;
  generation_provider?: string;
  generation_model?: string;
  generation_status?: string;
  width?: number;
  height?: number;
  created_at?: string;
  // licensed real photos (migration 008)
  person_name?: string | null;
  designation?: string | null;
  party?: string | null;
  photo_date?: string | null;
  event_caption?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  author?: string | null;
  license_name?: string | null;
  license_url?: string | null;
  attribution_text?: string | null;
  share_alike?: boolean;
  terms_note?: string | null;
  review_status?: "pending" | "approved" | "rejected";
  review_notes?: { faces_visible?: number; has_text_or_watermark?: boolean; suitable_for_news_thumbnail?: boolean; reason?: string } | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
}

export function ImageLibraryAdminDashboard({ editorEmail, provider, emptyText }: {
  editorEmail?: string | null;
  /** Show only images from one generator, e.g. "openai" for the ChatGPT gallery. */
  provider?: string;
  emptyText?: string;
} = {}) {
  const [items, setItems] = useState<ImageLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKind, setSelectedKind] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all"); // all | ai | real
  const [selectedReview, setSelectedReview] = useState<string>("all"); // all | pending | approved | rejected
  const [rejectReason, setRejectReason] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  // Selected Detail Modal
  const [activeItem, setActiveItem] = useState<ImageLibraryItem | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    if (!supabase) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const { data, error } = await supabase
        .from("image_library")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems((data || []) as ImageLibraryItem[]);
    } catch (err: any) {
      console.error("Failed to load image library:", err);
      setErrorMsg(`Failed to load images: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Approve / reject a licensed photo. RLS lets only admins update the review columns.
  const review = async (item: ImageLibraryItem, status: "approved" | "rejected") => {
    if (!supabase) return;
    if (status === "rejected" && !rejectReason.trim()) {
      setErrorMsg("Write a reason before rejecting a photo.");
      return;
    }
    setSavingReview(true);
    setErrorMsg("");
    const patch = {
      review_status: status,
      reviewed_by: editorEmail ?? null,
      reviewed_at: new Date().toISOString(),
      ...(status === "rejected" ? { takedown_reason: rejectReason.trim() } : {}),
    };
    const { error } = await supabase.from("image_library").update(patch).eq("id", item.id);
    setSavingReview(false);
    if (error) {
      setErrorMsg(`Could not save the review: ${error.message}`);
      return;
    }
    setItems((all) => all.map((i) => (i.id === item.id ? { ...i, ...patch } : i)));
    setRejectReason("");
    setActiveItem(null);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Distinct categories from data
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats).sort();
  }, [items]);

  // Filtered & Ranked Items
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const qTokens = q.split(/\s+/).filter(Boolean);

    return items
      .filter((item) => {
        if (provider && item.generation_provider !== provider) return false;

        // Filter by kind
        if (selectedKind !== "all" && item.kind !== selectedKind) return false;
        
        // Filter by category
        if (selectedCategory !== "all" && item.category !== selectedCategory) return false;

        // Filter by AI vs Real
        if (selectedType === "ai" && !item.is_ai_generated) return false;
        if (selectedType === "real" && item.is_ai_generated) return false;

        // Filter by review status
        if (selectedReview !== "all" && (item.review_status ?? "approved") !== selectedReview) return false;

        // Search query
        if (!q) return true;

        const label = (item.label || "").toLowerCase();
        const code = (item.asset_code || "").toLowerCase();
        const tags = (item.tags || []).join(" ").toLowerCase();
        const teluguKws = (item.keywords_te || []).join(" ").toLowerCase();
        const englishKws = (item.keywords_en || []).join(" ").toLowerCase();
        const searchCorpus = `${label} ${code} ${tags} ${teluguKws} ${englishKws}`;

        return qTokens.every((token) => searchCorpus.includes(token));
      })
      .sort((a, b) => {
        if (!q) return (b.times_used || 0) - (a.times_used || 0);
        // Simple search scoring
        const aCodeMatch = (a.asset_code || "").toLowerCase().includes(q) ? 10 : 0;
        const bCodeMatch = (b.asset_code || "").toLowerCase().includes(q) ? 10 : 0;
        return bCodeMatch - aCodeMatch;
      });
  }, [items, searchQuery, selectedKind, selectedCategory, selectedType, selectedReview, provider]);

  const stats = useMemo(() => {
    const scoped = provider ? items.filter((i) => i.generation_provider === provider) : items;
    const total = scoped.length;
    const aiCount = scoped.filter((i) => i.is_ai_generated).length;
    const realCount = total - aiCount;
    const pendingCount = scoped.filter((i) => i.review_status === "pending").length;
    return { total, aiCount, realCount, pendingCount };
  }, [items, provider]);

  return (
    <div className="space-y-6">
      {/* 📊 Top Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
            <ImageIcon className="size-4 text-blue-500" />
            Total Images
          </div>
          <div className="text-2xl font-black mt-2">{stats.total}</div>
        </div>

        <div className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
            <Sparkles className="size-4 text-purple-500" />
            AI Generated
          </div>
          <div className="text-2xl font-black mt-2 text-purple-600 dark:text-purple-400">{stats.aiCount}</div>
        </div>

        <div className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
            <ShieldCheck className="size-4 text-emerald-500" />
            Licensed Real
          </div>
          <div className="text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-400">{stats.realCount}</div>
        </div>

        <div className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
            <Filter className="size-4 text-amber-500" />
            Filtered View
          </div>
          <div className="text-2xl font-black mt-2 text-amber-600 dark:text-amber-400">{filteredItems.length}</div>
        </div>
      </div>

      {/* 🔍 Search & Filters Toolbar */}
      <div className="p-4 rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by English/Telugu keyword (e.g. 'రైతులు', 'Vizag beach', 'airport', 'EVT-POL')..."
              className="pl-11 rounded-2xl h-11 text-sm"
            />
          </div>

          <Button
            variant="secondary"
            onClick={fetchImages}
            disabled={loading}
            className="h-11 px-4 rounded-2xl font-bold text-xs flex items-center gap-2 shrink-0"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[hsl(var(--border))]/50 text-xs">
          {/* Kind Filter */}
          <div className="flex items-center gap-1 bg-[hsl(var(--muted))]/50 p-1 rounded-xl">
            <span className="text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))] px-2">Kind:</span>
            {["all", "place", "topic", "person", "category"].map((k) => (
              <button
                key={k}
                onClick={() => setSelectedKind(k)}
                className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                  selectedKind === k
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-xs"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-[hsl(var(--muted))]/50 p-1 rounded-xl">
            <span className="text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))] px-2">Source:</span>
            {[
              { id: "all", label: "All" },
              { id: "ai", label: "AI (ప్రతీకాత్మక)" },
              { id: "real", label: "Licensed Real" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedType === t.id
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-xs"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Review Filter */}
          <div className="flex items-center gap-1 bg-[hsl(var(--muted))]/50 p-1 rounded-xl">
            <span className="text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))] px-2">Review:</span>
            {[
              { id: "all", label: "All" },
              { id: "pending", label: `Pending review (${stats.pendingCount})` },
              { id: "approved", label: "Approved" },
              { id: "rejected", label: "Rejected" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedReview(t.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedReview === t.id
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-xs"
                    : t.id === "pending" && stats.pendingCount > 0
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          {availableCategories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[hsl(var(--muted))]/50 border border-[hsl(var(--border))] rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="all">All Categories ({availableCategories.length})</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {(searchQuery || selectedKind !== "all" || selectedCategory !== "all" || selectedType !== "all" || selectedReview !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedKind("all");
                setSelectedCategory("all");
                setSelectedType("all");
                setSelectedReview("all");
              }}
              className="text-[11px] font-bold text-red-500 hover:underline ml-auto px-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ⚠️ Error message */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold">
          {errorMsg}
        </div>
      )}

      {/* 🖼️ Thumbnail Grid */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="size-8 animate-spin text-[hsl(var(--primary))]" />
          <span className="text-xs font-bold text-[hsl(var(--muted-foreground))]">Loading image library...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-16 text-center rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <ImageIcon className="size-12 text-zinc-500 mx-auto mb-3 opacity-40" />
          <h3 className="font-black text-lg">No Images Found</h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))] font-bold mt-1">
            {emptyText ?? "Try adjusting your search keywords or filter settings."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const isAI = item.is_ai_generated;
            const code = item.asset_code || item.id.slice(0, 8);

            return (
              <div
                key={item.id || item.asset_code}
                onClick={() => setActiveItem(item)}
                className="group relative rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-xs hover:shadow-xl hover:border-[hsl(var(--primary))]/50 transition-all cursor-pointer flex flex-col"
              >
                {/* Image Preview */}
                <div className="relative aspect-video bg-zinc-900 overflow-hidden">
                  <img
                    src={item.public_url}
                    alt={item.label}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback placeholder if image load fails
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' fill='%2318181b'><text x='50%' y='50%' fill='%2371717a' font-family='sans-serif' font-size='14' text-anchor='middle'>Image Loading...</text></svg>";
                    }}
                  />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/80 text-white backdrop-blur-xs">
                      {item.kind}
                    </span>
                    {isAI ? (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider bg-purple-600/90 text-white backdrop-blur-xs">
                        AI ప్రతీకాత్మక
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider bg-emerald-600/90 text-white backdrop-blur-xs">
                        Licensed
                      </span>
                    )}
                    {item.review_status === "pending" && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider bg-amber-500 text-black">
                        Pending review
                      </span>
                    )}
                    {item.review_status === "rejected" && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider bg-red-600 text-white">
                        Rejected
                      </span>
                    )}
                    {item.share_alike && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider bg-orange-600 text-white" title="CC BY-SA: cannot be combined with other images">
                        BY-SA · use alone
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2 right-2">
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-zinc-900/80 text-zinc-300 border border-zinc-700 backdrop-blur-xs">
                      {code}
                    </span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-white text-zinc-900 text-xs font-black flex items-center gap-1.5 shadow-md">
                      <Eye className="size-3.5" /> View Details
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h4 className="font-black text-sm line-clamp-1 leading-tight group-hover:text-[hsl(var(--primary))] transition-colors">
                      {item.label}
                    </h4>
                    {item.subcategory && (
                      <p className="text-[11px] text-[hsl(var(--muted-foreground))] font-bold capitalize mt-0.5">
                        {item.category} · {item.subcategory.replace(/-/g, " ")}
                      </p>
                    )}
                  </div>

                  {/* Tags snippet */}
                  <div className="flex flex-wrap gap-1 pt-1 border-t border-[hsl(var(--border))]/50">
                    {(item.tags || []).slice(0, 3).map((t, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                      >
                        #{t}
                      </span>
                    ))}
                    {(item.tags || []).length > 3 && (
                      <span className="px-1 py-0.5 rounded text-[9px] font-bold text-[hsl(var(--muted-foreground))]">
                        +{(item.tags || []).length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🔍 Asset Detail Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[2rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[hsl(var(--border))]">
            {/* Left: Full Preview */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between bg-zinc-950/50">
              <div className="space-y-3">
                <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-inner">
                  <img
                    src={activeItem.public_url}
                    alt={activeItem.label}
                    className="w-full h-auto object-cover max-h-[360px]"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 text-xs">
                  <a
                    href={activeItem.public_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[hsl(var(--primary))] font-bold hover:underline"
                  >
                    <ExternalLink className="size-3.5" /> Open Public URL
                  </a>

                  <button
                    onClick={() => copyToClipboard(activeItem.public_url, "url")}
                    className="px-2.5 py-1 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted))]/80 text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    {copiedId === "url" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                    {copiedId === "url" ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                <div><strong>Dimensions:</strong> {activeItem.width || 1536} × {activeItem.height || 864} (WebP)</div>
                <div><strong>Credit:</strong> {activeItem.credit}</div>
                <div><strong>License:</strong> {activeItem.license}</div>
                {activeItem.generation_model && (
                  <div><strong>AI Model:</strong> {activeItem.generation_model}</div>
                )}
              </div>
            </div>

            {/* Right: Metadata & Prompt */}
            <div className="md:w-1/2 p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]">
                        {activeItem.asset_code || activeItem.id.slice(0, 8)}
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-[hsl(var(--primary))]">
                        {activeItem.kind}
                      </span>
                    </div>
                    <h3 className="text-xl font-black mt-1.5 leading-snug">{activeItem.label}</h3>
                  </div>

                  <button
                    onClick={() => setActiveItem(null)}
                    className="size-8 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center font-bold hover:bg-zinc-800 text-sm shrink-0"
                  >
                    ✕
                  </button>
                </div>

                {/* Licensed photo: provenance and review */}
                {activeItem.person_name && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-[hsl(var(--muted))]/50 border border-[hsl(var(--border))] text-xs space-y-1.5">
                      <div><strong>Person (from source caption):</strong> {activeItem.person_name}</div>
                      {activeItem.designation && <div><strong>Designation:</strong> {activeItem.designation}{activeItem.party ? ` · ${activeItem.party}` : ""}</div>}
                      {activeItem.photo_date && <div><strong>Photo date:</strong> {activeItem.photo_date}</div>}
                      <div>
                        <strong>Source:</strong>{" "}
                        {activeItem.source_url ? (
                          <a href={activeItem.source_url} target="_blank" rel="noreferrer" className="text-[hsl(var(--primary))] font-bold hover:underline">
                            {activeItem.source_name} <ExternalLink className="inline size-3" />
                          </a>
                        ) : activeItem.source_name}
                        {activeItem.author ? ` · by ${activeItem.author}` : ""}
                      </div>
                      <div>
                        <strong>Licence:</strong>{" "}
                        {activeItem.license_url ? (
                          <a href={activeItem.license_url} target="_blank" rel="noreferrer" className="text-[hsl(var(--primary))] font-bold hover:underline">
                            {activeItem.license_name}
                          </a>
                        ) : activeItem.license_name}
                      </div>
                      <div><strong>Attribution:</strong> {activeItem.attribution_text}</div>
                      {activeItem.terms_note && <div><strong>Terms checked:</strong> {activeItem.terms_note}</div>}
                      {activeItem.event_caption && <div className="text-[hsl(var(--muted-foreground))] line-clamp-4"><strong>Caption:</strong> {activeItem.event_caption}</div>}
                    </div>

                    {activeItem.share_alike && (
                      <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs font-bold text-orange-700 dark:text-orange-300 flex items-start gap-2">
                        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                        <span>CC BY-SA: this photo cannot be combined with other images; it is only used on its own.</span>
                      </div>
                    )}

                    {activeItem.review_notes && (
                      <div className={`p-3 rounded-xl border text-xs font-bold ${activeItem.review_notes.suitable_for_news_thumbnail ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300" : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300"}`}>
                        Gemini check: {activeItem.review_notes.faces_visible ?? "?"} face(s) ·{" "}
                        {activeItem.review_notes.suitable_for_news_thumbnail ? "suitable" : "not suitable"} for a thumbnail
                        {activeItem.review_notes.reason ? ` — ${activeItem.review_notes.reason}` : ""}
                        <div className="font-medium opacity-80 mt-1">Check yourself that the person named above is the main person in the photo.</div>
                      </div>
                    )}

                    {activeItem.review_status === "pending" ? (
                      <div className="space-y-2">
                        <Input
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Reason (needed to reject), e.g. wrong person, unflattering, outdated designation"
                          className="h-10 rounded-xl text-xs"
                        />
                        <div className="flex gap-2">
                          <Button onClick={() => review(activeItem, "approved")} disabled={savingReview} className="flex-1 h-10 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5">
                            <Check className="size-4" /> Approve
                          </Button>
                          <Button onClick={() => review(activeItem, "rejected")} disabled={savingReview} variant="secondary" className="flex-1 h-10 rounded-xl font-bold text-xs text-red-600 flex items-center justify-center gap-1.5">
                            <X className="size-4" /> Reject
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] font-bold text-[hsl(var(--muted-foreground))]">
                        {activeItem.review_status === "rejected" ? "Rejected" : "Approved"}
                        {activeItem.reviewed_by ? ` by ${activeItem.reviewed_by}` : ""}
                        {activeItem.reviewed_at ? ` on ${new Date(activeItem.reviewed_at).toLocaleDateString()}` : ""}
                      </div>
                    )}
                  </div>
                )}

                {/* Editorial Label info */}
                {activeItem.is_ai_generated && (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-600 dark:text-purple-300 flex items-center gap-2">
                    <Sparkles className="size-4 shrink-0" />
                    <span>Editorial Label: <strong>{activeItem.editorial_label || "ప్రతీకాత్మక చిత్రం (AI)"}</strong></span>
                  </div>
                )}

                {/* Prompt */}
                {activeItem.prompt && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                      Generation Prompt
                    </label>
                    <div className="p-3 rounded-xl bg-[hsl(var(--muted))]/50 border border-[hsl(var(--border))] text-xs font-medium leading-relaxed max-h-32 overflow-y-auto">
                      {activeItem.prompt}
                    </div>
                  </div>
                )}

                {/* Keywords & Tags */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))] flex items-center justify-between">
                    <span>Search Tags ({activeItem.tags.length})</span>
                    <button
                      onClick={() => copyToClipboard(activeItem.tags.join(", "), "tags")}
                      className="text-[10px] text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
                    >
                      {copiedId === "tags" ? "Copied!" : "Copy All Tags"}
                    </button>
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                    {activeItem.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-xs font-bold bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Telugu Keywords */}
                {activeItem.keywords_te && activeItem.keywords_te.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                      తెలుగు కీవర్డ్స్ (Telugu Match Keys)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {activeItem.keywords_te.map((kte, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        >
                          {kte}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[hsl(var(--border))] flex justify-end">
                <Button onClick={() => setActiveItem(null)} className="h-10 px-6 font-bold text-xs rounded-xl">
                  Close Preview
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
