import { useEffect, useState, useRef } from "react";
import { 
  Play, 
  X, 
  Heart, 
  MessageCircle, 
  Share2, 
  Volume2, 
  VolumeX,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { getShortVideos, type ShortVideoItem } from "@/lib/shorts-api";

function getYoutubeId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url?.match(regExp);
  return (match && match[2].length === 11) ? match[2] : "";
}

export function ShortsReel() {
  const { lang } = useLanguage();
  const [videos, setVideos] = useState<ShortVideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<ShortVideoItem | null>(null);
  const [likedVideos, setLikedVideos] = useState<string[]>([]);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Record<string, { author: string; text: string }[]>>({});
  const [newComment, setNewComment] = useState("");
  const [muted, setMuted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef(0);
  
  const activeIndex = videos.findIndex((v) => v.link === activeVideo?.link);

  const playNextVideo = () => {
    if (activeIndex !== -1) {
      if (activeIndex < videos.length - 1) {
        setActiveVideo(videos[activeIndex + 1]);
      } else {
        setActiveVideo(videos[0]);
      }
    }
  };


  const playPrevVideo = () => {
    if (activeIndex > 0) {
      setActiveVideo(videos[activeIndex - 1]);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartY.current - touchEndY;
    const minSwipeDistance = 50; // pixels
    if (diffY > minSwipeDistance) {
      playNextVideo();
    } else if (diffY < -minSwipeDistance) {
      playPrevVideo();
    }
  };

  useEffect(() => {
    if (!activeVideo) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        playNextVideo();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        playPrevVideo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeVideo, videos, activeIndex]);

  // YouTube API integration to detect ended video from inside iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin.includes("youtube.com")) {
        try {
          const data = JSON.parse(event.data);
          if (data.event === "infoDelivery" && data.info && data.info.playerState === 0) {
            console.log("📺 YouTube Short ended, auto-playing next...");
            playNextVideo();
          }
        } catch {}
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [videos, activeIndex]);


  // Translations
  const ui = {
    title: {
      te: "మీ షార్ట్స్ 📹",
      en: "Your Shorts 📹",
      hi: "आपके शॉर्ट्स 📹",
      ta: "உங்களுடைய ஷார்ட்ஸ் 📹",
      kn: "ನಿಮ್ಮ ಶಾರ್ಟ್ಸ್ 📹"
    },
    follow: { te: "ఫాలో", en: "Follow", hi: "फॉलो", ta: "பின்தொடர்", kn: "ಫಾಲೋ" },
    following: { te: "ఫాలోయింగ్", en: "Following", hi: "फॉलोइंग", ta: "தொடர்கிறது", kn: "ಫಾಲೋಯಿಂಗ್" },
    comments: { te: "వ్యాఖ్యలు", en: "Comments", hi: "टिप्पणियां", ta: "கருத்துகள்", kn: "ಕಾಮೆಂಟ್‌ಗಳು" },
    addComment: { te: "వ్యాఖ్యను వ్రాయండి...", en: "Add comment...", hi: "टिप्पणी जोड़ें...", ta: "கருத்து சேர்க்க...", kn: "ಕಾಮೆಂಟ್ ಸೇರಿಸಿ..." },
    post: { te: "పోస్ట్", en: "Post", hi: "पोस्ट", ta: "பதிவிடு", kn: "ಪೋಸ್ಟ್" },
    original: { te: "అసలు మూలం", en: "Full Video", hi: "मूल स्रोत", ta: "முழு வீடியோ", kn: "ಮೂಲ ವೀಡಿಯೊ" }
  };

  useEffect(() => {
    async function loadShorts() {
      try {
        const query = lang === "te" ? "తెలుగు వార్తలు షార్ట్స్" : "telugu news shorts";
        const res = await getShortVideos(query);
        setVideos(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadShorts();
  }, [lang]);

  // Handle Like click
  const handleLikeToggle = (link: string) => {
    if (likedVideos.includes(link)) {
      setLikedVideos(likedVideos.filter((v) => v !== link));
    } else {
      setLikedVideos([...likedVideos, link]);
    }
  };

  // Add Comment
  const handleAddComment = (videoLink: string) => {
    if (!newComment.trim()) return;
    const list = comments[videoLink] || [];
    setComments({
      ...comments,
      [videoLink]: [...list, { author: "VaartaNow User", text: newComment }]
    });
    setNewComment("");
  };

  // Horizontal Scroll helpers
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  if (loading) return null;
  if (videos.length === 0) return null;

  return (
    <section className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden p-5 shadow-sm space-y-4 relative">
      <div className="flex justify-between items-center border-b border-[hsl(var(--border))]/70 pb-3">
        <h2 className="text-lg font-black flex items-center gap-2">
          {ui.title[lang] || ui.title.te}
        </h2>
        <div className="flex gap-1.5">
          <button 
            onClick={() => scroll("left")}
            className="size-7 rounded-full border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--muted))] transition"
          >
            <ChevronLeft className="size-4 text-[hsl(var(--foreground))]" />
          </button>
          <button 
            onClick={() => scroll("right")}
            className="size-7 rounded-full border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--muted))] transition"
          >
            <ChevronRight className="size-4 text-[hsl(var(--foreground))]" />
          </button>
        </div>
      </div>

      {/* Horizontal Shorts Grid */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto no-scrollbar py-1 scroll-smooth"
      >
        {videos.map((video) => (
          <div 
            key={video.link}
            onClick={() => setActiveVideo(video)}
            className="w-[180px] h-[280px] rounded-2xl border border-[hsl(var(--border))]/50 bg-black overflow-hidden relative cursor-pointer group shadow-sm flex-shrink-0 transition-transform active:scale-[0.98]"
          >
            {/* Thumbnail */}
            <img 
              src={video.thumbnail} 
              alt={video.title} 
              className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-60 transition duration-300"
            />
            {/* Floating duration */}
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/60 text-[9px] font-black text-white uppercase tracking-wider">
              {video.duration}
            </div>

            {/* Play overlay button */}
            <div className="absolute inset-0 m-auto size-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 scale-90 group-hover:scale-100">
              <Play className="size-5 text-white fill-white ml-0.5" />
            </div>

            {/* Bottom info layer */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 space-y-1.5 flex flex-col justify-end">
              <div className="flex items-center gap-1.5">
                <img 
                  src={video.source_icon} 
                  alt={video.channel} 
                  className="size-4.5 rounded-full border border-white/20"
                />
                <span className="text-[10px] font-black text-white truncate max-w-[110px]">
                  {video.channel}
                </span>
              </div>
              <p className="text-[10px] font-bold text-neutral-200 line-clamp-2 leading-relaxed">
                {video.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 📱 Fullscreen Reel Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-4">
          <div 
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="h-[90vh] aspect-[9/16] rounded-3xl overflow-hidden relative border-4 border-neutral-800 shadow-2xl flex bg-black"
          >
            {/* Left Side Navigation Chevrons (Up/Down) */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
              {activeIndex > 0 && (
                <button 
                  onClick={playPrevVideo}
                  className="size-9 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition shadow-lg"
                  title="Previous Short (Arrow Up)"
                >
                  <ChevronUp className="size-5" />
                </button>
              )}
              {activeIndex < videos.length - 1 && (
                <button 
                  onClick={playNextVideo}
                  className="size-9 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition shadow-lg"
                  title="Next Short (Arrow Down)"
                >
                  <ChevronDown className="size-5" />
                </button>
              )}
            </div>

            {/* Swipe Instruction Guide Overlay */}
            <div className="absolute inset-x-0 bottom-32 flex justify-center pointer-events-none z-10 animate-pulse text-[9px] font-black tracking-widest text-white/40 uppercase">
              ☝️ Swipe Up or Press ↓ for Next
            </div>
            
            {/* The Reel Video Player */}
            {activeVideo.clip.includes("youtube.com") || activeVideo.clip.includes("youtu.be") ? (
              <iframe
                src={`https://www.youtube.com/embed/${getYoutubeId(activeVideo.clip)}?autoplay=1&mute=${muted ? 1 : 0}&enablejsapi=1&controls=0&modestbranding=1&rel=0&playsinline=1`}
                className="w-full h-full object-cover pointer-events-none"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video 
                ref={videoRef}
                src={activeVideo.clip} 
                autoPlay
                muted={muted}
                playsInline
                onEnded={playNextVideo}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => {
                  if (videoRef.current) {
                    if (videoRef.current.paused) {
                      videoRef.current.play();
                    } else {
                      videoRef.current.pause();
                    }
                  }
                }}
              />
            )}


            {/* Top Navigation Bar inside phone */}
            <div className="absolute top-4 inset-x-4 flex justify-between items-center z-10">
              <button 
                onClick={() => setMuted(!muted)}
                className="size-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white"
              >
                {muted ? <VolumeX className="size-4.5" /> : <Volume2 className="size-4.5" />}
              </button>
              <button 
                onClick={() => {
                  setActiveVideo(null);
                  setCommentsOpen(false);
                }}
                className="size-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Right Side Control Toolbar */}
            <div className="absolute right-4 bottom-24 flex flex-col items-center gap-4 z-10">
              {/* Like */}
              <button 
                onClick={() => handleLikeToggle(activeVideo.link)}
                className="flex flex-col items-center gap-1 active:scale-90 transition group"
              >
                <div className={`size-11 rounded-full backdrop-blur-md flex items-center justify-center transition ${
                  likedVideos.includes(activeVideo.link) 
                    ? "bg-red-500/20 border border-red-500 text-red-500" 
                    : "bg-black/40 border border-white/10 text-white"
                }`}>
                  <Heart className={`size-5 ${likedVideos.includes(activeVideo.link) ? "fill-red-500" : "group-hover:text-red-400"}`} />
                </div>
                <span className="text-[10px] font-black text-white drop-shadow-md">
                  {likedVideos.includes(activeVideo.link) ? "1" : "0"}
                </span>
              </button>

              {/* Comment Toggle */}
              <button 
                onClick={() => setCommentsOpen(!commentsOpen)}
                className="flex flex-col items-center gap-1 active:scale-90 transition group"
              >
                <div className="size-11 rounded-full bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center text-white">
                  <MessageCircle className="size-5 group-hover:text-amber-400" />
                </div>
                <span className="text-[10px] font-black text-white drop-shadow-md">
                  {(comments[activeVideo.link] || []).length}
                </span>
              </button>

              {/* WhatsApp Share */}
              <button 
                onClick={() => {
                  const text = `📹 *VaartaNow Shorts* 📹\n\n📺 *${activeVideo.channel}:* ${activeVideo.title}\n\n👉 ఈ షార్ట్ వీడియోను మరియు తాజా తెలుగు వార్తలను మీ మొబైల్‌లో చూడటానికి క్లిక్ చేయండి:\n${activeVideo.link}`;
                  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                  window.open(url, "_blank");
                }}
                className="flex flex-col items-center gap-1 active:scale-90 transition group"
              >
                <div className="size-11 rounded-full bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center text-white">
                  <Share2 className="size-5 group-hover:text-green-400" />
                </div>
                <span className="text-[10px] font-black text-white drop-shadow-md">Share</span>
              </button>

              {/* Watch Original */}
              <button 
                onClick={() => window.open(activeVideo.link, "_blank")}
                className="flex flex-col items-center gap-1 active:scale-90 transition group"
              >
                <div className="size-11 rounded-full bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center text-white">
                  <ExternalLink className="size-4.5 group-hover:text-blue-400" />
                </div>
                <span className="text-[10px] font-black text-white drop-shadow-md">{ui.original[lang]}</span>
              </button>
            </div>

            {/* Bottom Info Overlay inside player */}
            <div className="absolute bottom-4 left-4 right-18 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 rounded-2xl z-10 space-y-2">
              <div className="flex items-center gap-2">
                <img 
                  src={activeVideo.source_icon} 
                  alt={activeVideo.channel} 
                  className="size-6 rounded-full border border-white/30"
                />
                <span className="text-xs font-black text-white">
                  {activeVideo.channel}
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider text-red-500 bg-red-500/15 px-2 py-0.5 rounded-full border border-red-500/20">
                  {ui.follow[lang]}
                </span>
              </div>
              <p className="text-xs font-bold text-neutral-100 leading-relaxed drop-shadow-md">
                {activeVideo.title}
              </p>
            </div>

            {/* Slide-In Comments Panel */}
            {commentsOpen && (
              <div className="absolute inset-y-0 right-0 w-[80%] max-w-[280px] bg-black/90 backdrop-blur-lg border-l border-white/15 p-4 flex flex-col justify-between z-20 animate-in slide-in-from-right duration-300">
                <div className="space-y-4 overflow-hidden flex flex-col flex-1">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      {ui.comments[lang]} ({(comments[activeVideo.link] || []).length})
                    </h4>
                    <button 
                      onClick={() => setCommentsOpen(false)}
                      className="text-white hover:text-red-400 transition"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  {/* Comments scroll container */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
                    {(comments[activeVideo.link] || []).length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-[10px] font-bold text-neutral-500 italic text-center">
                          {lang === "te" ? "ఇంకా వ్యాఖ్యలు లేవు. మొదటి వ్యాఖ్యను రాయండి!" : "No comments yet. Write the first comment!"}
                        </p>
                      </div>
                    ) : (
                      (comments[activeVideo.link] || []).map((cmt, idx) => (
                        <div key={idx} className="space-y-0.5 border-b border-white/5 pb-2">
                          <span className="text-[9px] font-black text-amber-500 block">
                            {cmt.author}
                          </span>
                          <p className="text-[10px] font-bold text-neutral-200 leading-relaxed">
                            {cmt.text}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Input box */}
                <div className="pt-3 border-t border-white/15 flex gap-2 items-center">
                  <input 
                    type="text" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={ui.addComment[lang]}
                    className="flex-1 text-[10px] font-bold px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddComment(activeVideo.link);
                    }}
                  />
                  <button 
                    onClick={() => handleAddComment(activeVideo.link)}
                    className="text-[10px] font-black px-3 py-2 rounded-xl bg-amber-500 text-black uppercase tracking-wider active:scale-95 transition"
                  >
                    {ui.post[lang]}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
