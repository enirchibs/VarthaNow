import React, { useState, useEffect, useRef } from "react";
import { 
  Video, Plus, Trash2, Upload, Play, CheckCircle2, AlertCircle, Sparkles, Film, ExternalLink
} from "lucide-react";
import { ShortVideoItem, getShortVideos, addShortVideo, deleteShortVideo } from "@/lib/shorts-api";
import { supabase } from "@/lib/supabase";
import { Button, Input } from "@/components/ui";

export function VideoNewsAdminDashboard() {
  const [videos, setVideos] = useState<ShortVideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [channel, setChannel] = useState("VaartaNow Video News");
  const [clipUrl, setClipUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [duration, setDuration] = useState("0:45");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File Upload Handling
  const videoFileRef = useRef<HTMLInputElement>(null);
  const thumbFileRef = useRef<HTMLInputElement>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getShortVideos();
      setVideos(data);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Video File Upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    setMessage("Uploading video file...");

    try {
      if (supabase) {
        const fileExt = file.name.split(".").pop();
        const fileName = `shorts/vid_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadErr } = await supabase.storage.from("news-images").upload(fileName, file);

        if (!uploadErr) {
          const { data } = supabase.storage.from("news-images").getPublicUrl(fileName);
          setClipUrl(data.publicUrl);
          setMessage("Video clip uploaded successfully!");
          setUploadingVideo(false);
          return;
        }
      }

      // Fallback object URL
      const blobUrl = URL.createObjectURL(file);
      setClipUrl(blobUrl);
      setMessage("Video loaded!");
    } catch (err: any) {
      setErrorMsg(`Video upload error: ${err.message}`);
    } finally {
      setUploadingVideo(false);
    }
  };

  // Handle Thumbnail Upload
  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);

    try {
      if (supabase) {
        const fileExt = file.name.split(".").pop();
        const fileName = `shorts/thumb_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadErr } = await supabase.storage.from("news-images").upload(fileName, file);

        if (!uploadErr) {
          const { data } = supabase.storage.from("news-images").getPublicUrl(fileName);
          setThumbnailUrl(data.publicUrl);
          setUploadingThumb(false);
          return;
        }
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setThumbnailUrl(event.target.result as string);
        setUploadingThumb(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg(`Thumbnail error: ${err.message}`);
      setUploadingThumb(false);
    }
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Please enter a video news title.");
      return;
    }
    if (!clipUrl.trim()) {
      setErrorMsg("Please upload a video or enter a video clip URL.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setErrorMsg("");

    try {
      addShortVideo({
        title: title.trim(),
        channel: channel.trim() || "VaartaNow Video News",
        clip: clipUrl.trim(),
        thumbnail: thumbnailUrl.trim() || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80",
        link: linkUrl.trim() || "#",
        source: "VaartaNow Editor",
        source_icon: "https://www.google.com/s2/favicons?domain=youtube.com&sz=64",
        duration: duration.trim() || "0:45",
      });

      await loadData();
      setMessage(`✨ Video News reel "${title}" published successfully!`);

      setTitle("");
      setClipUrl("");
      setThumbnailUrl("");
      setLinkUrl("");
    } catch (err: any) {
      setErrorMsg(`Failed to publish video news: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id?: string, itemTitle?: string) => {
    if (!id) return;
    if (!confirm(`Delete video news "${itemTitle || 'this item'}"?`)) return;
    deleteShortVideo(id);
    await loadData();
    setMessage("Video news item deleted.");
  };

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

      {/* 🎥 ADD VIDEO NEWS FORM */}
      <section className="rounded-[1.8rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] pb-4">
          <div className="size-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Film className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-black">Publish Video News & Short Reels</h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
              Upload short MP4 news reels, viral clips, or YouTube short video links for readers.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                Video News Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., తిరుమల శ్రీవారి బ్రహ్మోత్సవాలు.. గరుడ సేవ విశేషాలు"
                className="h-10 text-sm font-bold rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                Channel / Publisher Name
              </label>
              <Input
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                placeholder="e.g., VaartaNow News Bulletins"
                className="h-10 text-xs font-bold rounded-xl"
              />
            </div>
          </div>

          {/* Video Clip Upload / URL */}
          <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <Video className="size-4" />
                Video File (.mp4) or Direct Clip URL *
              </label>
              <input
                ref={videoFileRef}
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
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
                {uploadingVideo ? "Uploading Video..." : "Upload MP4 Video"}
              </Button>
            </div>

            <Input
              value={clipUrl}
              onChange={(e) => setClipUrl(e.target.value)}
              placeholder="https://vjs.zencdn.net/v/oceans.mp4 or uploaded video link"
              className="h-9 text-xs font-mono rounded-xl bg-[hsl(var(--background))]"
              required
            />

            {clipUrl && (
              <video src={clipUrl} controls className="h-32 rounded-xl border border-purple-500/40 bg-black" />
            )}
          </div>

          {/* Thumbnail & Duration */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black uppercase text-[hsl(var(--muted-foreground))]">
                  Thumbnail Image URL
                </label>
                <input
                  ref={thumbFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => thumbFileRef.current?.click()}
                  className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Upload Thumbnail Image
                </button>
              </div>
              <Input
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="h-10 text-xs font-mono rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                Video Duration
              </label>
              <Input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 0:45"
                className="h-10 text-xs font-bold rounded-xl"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <Sparkles className="size-4" />
            <span>Publish Video News Reel</span>
          </Button>
        </form>
      </section>

      {/* 📁 VIDEO REELS GRID */}
      <section className="space-y-4">
        <h3 className="text-lg font-black flex items-center gap-2">
          <Film className="size-5 text-purple-600" />
          Active Video News Reels ({videos.length})
        </h3>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="group relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-[9/16] w-full bg-black overflow-hidden">
                <video
                  src={vid.clip}
                  poster={vid.thumbnail}
                  controls
                  playsInline
                  className="size-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-0.5 rounded-full text-[9px] font-bold">
                  {vid.duration}
                </div>
                <div className="absolute inset-x-2 bottom-2 pointer-events-none">
                  <p className="text-[10px] font-black text-white line-clamp-2 drop-shadow-md">
                    {vid.title}
                  </p>
                </div>
              </div>

              <div className="p-2 border-t border-[hsl(var(--border))] flex items-center justify-between bg-[hsl(var(--card))]">
                <span className="text-[9px] font-bold text-[hsl(var(--muted-foreground))] truncate max-w-[100px]">
                  {vid.channel}
                </span>
                <button
                  onClick={() => handleDelete(vid.id, vid.title)}
                  className="p-1 rounded-lg text-red-500 hover:bg-red-500/10 transition"
                  title="Delete Video"
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
