import React, { useState, useRef } from "react";
import { 
  Upload, Image as ImageIcon, Video, Plus, Trash2, Sparkles, Filter, 
  CheckCircle2, AlertCircle, Play, Eye, FileText, Check, Layers
} from "lucide-react";
import { DailyShareItem, DailyShareCategorySlug, ContentType } from "@/types/daily-share";
import { 
  DAILY_SHARE_CATEGORIES, 
  getDailyShareItems, 
  addDailyShareItem, 
  deleteDailyShareItem 
} from "@/lib/daily-share-api";
import { supabase } from "@/lib/supabase";
import { Button, Input } from "@/components/ui";

export function DailyShareAdminDashboard() {
  const [items, setItems] = useState<DailyShareItem[]>(() => getDailyShareItems());
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  // Notification state
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DailyShareCategorySlug>("good-morning");
  const [contentType, setContentType] = useState<ContentType>("image");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [quoteTe, setQuoteTe] = useState("");
  const [quoteEn, setQuoteEn] = useState("");
  const [author, setAuthor] = useState("VaartaNow Quotes");
  const [hashtags, setHashtags] = useState("#శుభోదయం, #VaartaNow");
  const [personalizationEnabled, setPersonalizationEnabled] = useState(true);
  const [templateStyle, setTemplateStyle] = useState<"classic" | "modern" | "festival" | "business" | "quote_card">("festival");

  // File Upload Handling
  const imageFileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Handle Image Upload (Supabase storage or DataURL fallback)
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMsg("");
    setMessage("Uploading image file...");

    try {
      if (supabase) {
        const fileExt = file.name.split(".").pop();
        const fileName = `daily-share/img_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadErr } = await supabase.storage.from("news-images").upload(fileName, file);

        if (!uploadErr) {
          const { data } = supabase.storage.from("news-images").getPublicUrl(fileName);
          setImageUrl(data.publicUrl);
          setMessage("Image uploaded successfully to cloud storage!");
          setUploadingImage(false);
          return;
        }
      }

      // Fallback to Data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
          setMessage("Image loaded successfully!");
        }
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg(`Image upload error: ${err.message}`);
      setUploadingImage(false);
    }
  };

  // Handle Video Upload (Supabase storage or Blob/DataURL fallback)
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    setErrorMsg("");
    setMessage("Uploading video file...");

    try {
      if (supabase) {
        const fileExt = file.name.split(".").pop();
        const fileName = `daily-share/vid_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadErr } = await supabase.storage.from("news-images").upload(fileName, file);

        if (!uploadErr) {
          const { data } = supabase.storage.from("news-images").getPublicUrl(fileName);
          setVideoUrl(data.publicUrl);
          setMessage("Video uploaded successfully to cloud storage!");
          setUploadingVideo(false);
          return;
        }
      }

      // Fallback to object URL / Data URL
      const blobUrl = URL.createObjectURL(file);
      setVideoUrl(blobUrl);
      setMessage("Video loaded successfully!");
      setUploadingVideo(false);
    } catch (err: any) {
      setErrorMsg(`Video upload error: ${err.message}`);
      setUploadingVideo(false);
    }
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Please enter a title for the status item.");
      return;
    }

    if (contentType === "video" && !videoUrl.trim() && !imageUrl.trim()) {
      setErrorMsg("Please provide a Video URL or upload a video file.");
      return;
    }

    if (contentType !== "video" && !imageUrl.trim()) {
      setErrorMsg("Please provide an Image URL or upload an image file.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setErrorMsg("");

    try {
      const slug = `${contentType}-${category}-${Date.now()}`;
      const tagList = hashtags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const newItem = addDailyShareItem({
        title: title.trim(),
        slug,
        category,
        language: "te",
        content_type: contentType,
        image_url: imageUrl.trim() || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80",
        video_url: videoUrl.trim() || undefined,
        thumbnail_url: thumbnailUrl.trim() || imageUrl.trim() || undefined,
        quote_te: quoteTe.trim() || undefined,
        quote_en: quoteEn.trim() || undefined,
        author: author.trim() || undefined,
        hashtags: tagList.length > 0 ? tagList : ["#VaartaNowDaily"],
        personalization_enabled: personalizationEnabled,
        template_style: templateStyle,
      });

      // Refresh list
      setItems(getDailyShareItems());
      setMessage(`✨ Successful! Daily Share item "${newItem.title}" added.`);
      
      // Reset form
      setTitle("");
      setImageUrl("");
      setVideoUrl("");
      setThumbnailUrl("");
      setQuoteTe("");
      setQuoteEn("");
    } catch (err: any) {
      setErrorMsg(`Failed to save item: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Item Deletion
  const handleDelete = (id: string, itemTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${itemTitle}"?`)) return;
    deleteDailyShareItem(id);
    setItems(getDailyShareItems());
    setMessage(`Deleted "${itemTitle}".`);
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCat = activeCategory === "all" || item.category === activeCategory;
    const matchesType = 
      filterType === "all" || 
      (filterType === "video" && (item.video_url || item.content_type === "video")) ||
      (filterType === "image" && (!item.video_url && item.content_type !== "video"));
    return matchesCat && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Messages */}
      {message && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="size-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {errorMsg && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 text-sm font-bold flex items-center gap-2">
          <AlertCircle className="size-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 🚀 ADD NEW DAILY SHARE MEDIA ITEM FORM */}
      <section className="rounded-[1.8rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-gradient-to-r from-amber-500 to-red-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Plus className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-black">Add New Daily WhatsApp Status / Video</h2>
              <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
                Upload images or videos for Daily Share templates, spiritual quotes, motivational status & festival wishes.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Content Type & Category */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                Content Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { type: "image", label: "🖼️ Image", icon: ImageIcon },
                  { type: "video", label: "🎥 Video", icon: Video },
                  { type: "personalized_image", label: "🎨 Personalized", icon: Sparkles },
                ].map((t) => (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => setContentType(t.type as ContentType)}
                    className={`py-2 px-3 rounded-xl border text-xs font-black transition flex items-center justify-center gap-1.5 ${
                      contentType === t.type
                        ? "bg-amber-500 text-black border-amber-400 shadow-sm"
                        : "bg-[hsl(var(--muted))] border-[hsl(var(--border))] hover:border-amber-400"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DailyShareCategorySlug)}
                className="w-full h-10 px-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm font-bold outline-none focus:border-amber-500"
              >
                {DAILY_SHARE_CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.emoji} {cat.title_te} ({cat.title_en})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Title */}
          <div>
            <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
              Status Title / Headline *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., ఉదయం లేవగానే ఈ ఒక్కటి గుర్తుపెట్టుకోండి (Good Morning Special)"
              className="h-10 text-sm font-bold rounded-xl"
              required
            />
          </div>

          {/* Row 3: Image Upload & URL */}
          <div className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase flex items-center gap-1.5">
                <ImageIcon className="size-4 text-amber-500" />
                Image File Upload or Image URL
              </label>
              <input
                ref={imageFileRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => imageFileRef.current?.click()}
                disabled={uploadingImage}
                className="h-8 text-xs font-bold rounded-lg px-3 flex items-center gap-1"
              >
                <Upload className="size-3.5" />
                {uploadingImage ? "Uploading Image..." : "Upload Image File"}
              </Button>
            </div>

            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-... or uploaded image link"
              className="h-9 text-xs font-mono rounded-xl bg-[hsl(var(--background))]"
            />

            {imageUrl && (
              <div className="flex items-center gap-3 pt-1">
                <img src={imageUrl} alt="Preview" className="h-16 w-12 object-cover rounded-lg border border-[hsl(var(--border))]" />
                <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                  <Check className="size-3.5" /> Image attached ready!
                </span>
              </div>
            )}
          </div>

          {/* Row 4: Video Upload & URL (if video selected) */}
          {contentType === "video" && (
            <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Video className="size-4" />
                  Video File Upload or Direct MP4 Video URL
                </label>
                <input
                  ref={videoFileRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => videoFileRef.current?.click()}
                  disabled={uploadingVideo}
                  className="h-8 text-xs font-bold rounded-lg px-3 flex items-center gap-1 border-purple-500/40 text-purple-600 dark:text-purple-300"
                >
                  <Upload className="size-3.5" />
                  {uploadingVideo ? "Uploading Video..." : "Upload Video File (.mp4)"}
                </Button>
              </div>

              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://commondatastorage.googleapis.com/.../sample.mp4"
                className="h-9 text-xs font-mono rounded-xl bg-[hsl(var(--background))]"
              />

              {videoUrl && (
                <div className="pt-1">
                  <video src={videoUrl} controls className="h-28 rounded-xl border border-purple-500/30 bg-black" />
                </div>
              )}
            </div>
          )}

          {/* Row 5: Quotes & Authors */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                Telugu Quote / Message Text (తెలుగు సూక్తి)
              </label>
              <textarea
                value={quoteTe}
                onChange={(e) => setQuoteTe(e.target.value)}
                rows={3}
                placeholder="ఉదా: ప్రతి కొత్త రోజు ఒక నూతన ఆశతో వస్తుంది. మీ లక్ష్యం వైపు అడుగు వేయండి. 🌅"
                className="w-full p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                English Quote / Message Text
              </label>
              <textarea
                value={quoteEn}
                onChange={(e) => setQuoteEn(e.target.value)}
                rows={3}
                placeholder="e.g., Every new day comes with fresh hope. Take steps toward your goal."
                className="w-full p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>

          {/* Row 6: Customization Options */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                Author / Source
              </label>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g., తిరుమల దివ్య సందేశం"
                className="h-10 text-xs font-bold rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                Hashtags (Comma Separated)
              </label>
              <Input
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#శుభోదయం, #VaartaNow, #TeluguQuotes"
                className="h-10 text-xs font-bold rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                Template Style
              </label>
              <select
                value={templateStyle}
                onChange={(e) => setTemplateStyle(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold outline-none focus:border-amber-500"
              >
                <option value="festival">🪔 Festival Style</option>
                <option value="modern">✨ Modern Gradient</option>
                <option value="classic">📜 Classic Frame</option>
                <option value="business">💼 Business Card</option>
                <option value="quote_card">💬 Quote Card</option>
              </select>
            </div>
          </div>

          {/* Toggle Personalization */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="personalization_toggle"
              checked={personalizationEnabled}
              onChange={(e) => setPersonalizationEnabled(e.target.checked)}
              className="size-4 accent-amber-500 rounded cursor-pointer"
            />
            <label htmlFor="personalization_toggle" className="text-xs font-extrabold cursor-pointer">
              Enable User Personalization (Allow readers to overlay their Name & Photo on this card ✏️)
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <Sparkles className="size-4" />
            <span>✨ వాట్సాప్ స్టేటస్ / వీడియో జోడించండి (Publish Daily Share Media)</span>
          </Button>
        </form>
      </section>

      {/* 📁 EXISTING DAILY SHARE MEDIA ITEMS LIST */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[hsl(var(--border))] pb-3">
          <div>
            <h3 className="text-lg font-black flex items-center gap-2">
              <Layers className="size-5 text-amber-500" />
              Daily Share Media Items ({filteredItems.length})
            </h3>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-9 px-3 text-xs font-bold rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
            >
              <option value="all">All Media Types</option>
              <option value="image">🖼️ Images Only</option>
              <option value="video">🎥 Videos Only</option>
            </select>

            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="h-9 px-3 text-xs font-bold rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
            >
              <option value="all">All Categories ({items.length})</option>
              {DAILY_SHARE_CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.emoji} {c.title_te}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              {/* Media Preview */}
              <div className="relative aspect-[9/16] w-full bg-slate-950 overflow-hidden">
                {item.video_url || item.content_type === "video" ? (
                  <video
                    src={item.video_url || item.image_url}
                    poster={item.thumbnail_url || item.image_url}
                    controls
                    playsInline
                    className="size-full object-cover"
                  />
                ) : (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="size-full object-cover group-hover:scale-105 transition duration-500"
                  />
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                  <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white">
                    {item.category}
                  </span>
                  {(item.video_url || item.content_type === "video") && (
                    <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-purple-600 text-white">
                      🎥
                    </span>
                  )}
                </div>

                <div className="absolute inset-x-2 bottom-2 pointer-events-none">
                  <p className="text-[10px] font-black text-white line-clamp-2 drop-shadow-md">
                    {item.title}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-2 border-t border-[hsl(var(--border))] flex items-center justify-between bg-[hsl(var(--card))]">
                <span className="text-[9px] font-bold text-[hsl(var(--muted-foreground))]">
                  {item.id.startsWith("ds-admin") ? "Custom Upload" : "Default Seed"}
                </span>
                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="p-1 rounded-lg text-red-500 hover:bg-red-500/10 transition"
                  title="Delete Status Item"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
