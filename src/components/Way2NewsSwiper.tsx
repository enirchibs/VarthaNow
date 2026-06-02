import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Volume2, 
  VolumeX, 
  Share2, 
  BookOpen, 
  ChevronUp, 
  ChevronDown, 
  ArrowLeft 
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { categoryLabel } from "@/lib/categories";
import type { BlogPost } from "@/types/news";

interface Way2NewsSwiperProps {
  posts: BlogPost[];
  onClose: () => void;
}

export function Way2NewsSwiper({ posts, onClose }: Way2NewsSwiperProps) {
  const { lang } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const touchStartY = useRef(0);
  const speechUtt = useRef<SpeechSynthesisUtterance | null>(null);

  const activePost = posts[activeIndex];

  // Stop speaking on change or unmount
  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    stopSpeaking();
  }, [activeIndex]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleNext = () => {
    if (activeIndex < posts.length - 1) {
      setActiveIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, posts]);

  // Swipe gesture tracking
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartY.current - touchEndY;
    const minSwipeDistance = 50; // pixels

    if (diffY > minSwipeDistance) {
      handleNext();
    } else if (diffY < -minSwipeDistance) {
      handlePrev();
    }
  };

  // Text-To-Speech reader function
  const handleToggleSpeak = () => {
    if (!activePost) return;

    if (isPlaying) {
      stopSpeaking();
      return;
    }

    if (!window.speechSynthesis) {
      alert("TTS Speech is not supported on this browser.");
      return;
    }

    // Use excerpt for 60-word concise reading
    const textToRead = `${activePost.title}. ${activePost.excerpt}`;
    
    const utterance = new SpeechSynthesisUtterance(textToRead);
    
    // Choose appropriate voice/lang
    if (lang === "te") {
      utterance.lang = "te-IN";
    } else if (lang === "hi") {
      utterance.lang = "hi-IN";
    } else if (lang === "ta") {
      utterance.lang = "ta-IN";
    } else if (lang === "kn") {
      utterance.lang = "kn-IN";
    } else {
      utterance.lang = "en-IN";
    }

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    speechUtt.current = utterance;
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!activePost) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-center">
        <p className="text-sm font-bold text-[hsl(var(--muted-foreground))]">
          No articles available to swipe.
        </p>
      </div>
    );
  }

  const label = categoryLabel(activePost.category, lang);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col justify-between overflow-hidden">
      {/* Top Header Controls */}
      <div className="absolute top-4 inset-x-4 flex justify-between items-center z-20">
        <button
          onClick={onClose}
          className="h-10 rounded-full px-4 bg-black/40 border border-white/20 text-white flex items-center gap-2 backdrop-blur-md active:scale-95 transition text-xs font-black"
        >
          <ArrowLeft className="size-4" />
          {lang === "te" ? "జాబితా" : "Back"}
        </button>

        <span className="bg-black/60 border border-white/10 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider">
          {activeIndex + 1} / {posts.length}
        </span>
      </div>

      {/* Swipe Cards deck area */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full relative flex items-center justify-center p-4 md:p-6"
      >
        <div className="relative w-full max-w-[420px] h-[85vh] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col bg-zinc-950">
          {/* Card image header */}
          <div className="relative h-[40%] w-full overflow-hidden bg-zinc-900 border-b border-white/5">
            {activePost.og_image ? (
              <img
                src={activePost.og_image}
                alt={activePost.title}
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-gradient-to-br from-indigo-500 to-red-600 text-white font-black text-2xl">
                VaartaNow
              </div>
            )}
            
            {/* Top gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/15 to-transparent h-20" />
            {/* Bottom gradient overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 to-transparent h-16" />
            
            {/* Category tag */}
            <span className="absolute bottom-3 left-4 bg-red-600 border border-red-500 px-3 py-0.5 rounded-full text-[9px] font-black uppercase text-white tracking-widest">
              {label}
            </span>
          </div>

          {/* Card body (60-word Summary content) */}
          <div className="h-[60%] p-5 md:p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h2 className="text-base md:text-lg font-black leading-snug text-white line-clamp-3">
                {activePost.title}
              </h2>
              
              {/* Concise 60-word Summary area */}
              <p className="text-xs md:text-sm font-semibold leading-relaxed text-zinc-300 line-clamp-6 md:line-clamp-8">
                {activePost.excerpt}
              </p>
            </div>

            {/* Bottom Controls toolbar */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
              <div className="flex items-center gap-3">
                {/* TTS Reader play button */}
                <button
                  onClick={handleToggleSpeak}
                  className={`size-10 rounded-full border flex items-center justify-center active:scale-95 transition ${
                    isPlaying 
                      ? "bg-red-500/25 border-red-500 text-red-400" 
                      : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  }`}
                  title="Read Aloud (TTS)"
                >
                  {isPlaying ? <VolumeX className="size-4.5" /> : <Volume2 className="size-4.5" />}
                </button>

                {/* Equalizer Audio waves visualizer */}
                {isPlaying && (
                  <div className="flex gap-0.5 items-end h-4 w-7 pr-1">
                    <span className="w-1 bg-red-500 animate-audio-wave-1 rounded-full" />
                    <span className="w-1 bg-red-400 animate-audio-wave-2 rounded-full" style={{ animationDelay: "0.15s" }} />
                    <span className="w-1 bg-red-500 animate-audio-wave-3 rounded-full" style={{ animationDelay: "0.3s" }} />
                    <span className="w-1 bg-red-400 animate-audio-wave-4 rounded-full" style={{ animationDelay: "0.45s" }} />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Whatsapp share button */}
                <button
                  onClick={() => {
                    const text = `📰 *VaartaNow Cards* 📰\n\n📢 *${activePost.title}*\n\n👉 చదవండి:\nhttps://varthanow.com/news/${activePost.slug}`;
                    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                    window.open(url, "_blank");
                  }}
                  className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition active:scale-95"
                  title="Share to WhatsApp"
                >
                  <Share2 className="size-4.5" />
                </button>

                {/* Read Full Article redirect */}
                <Link
                  to={`/news/${activePost.slug}`}
                  onClick={stopSpeaking}
                  className="h-10 rounded-2xl bg-white text-black text-xs font-black px-4 flex items-center gap-1.5 active:scale-95 transition"
                >
                  <BookOpen className="size-4" />
                  {lang === "te" ? "పూర్తి వార్త" : "Read Full"}
                </Link>
              </div>
            </div>
          </div>

          {/* Floating Vertical Navigation Arrows inside swiper */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
            {activeIndex > 0 && (
              <button
                onClick={handlePrev}
                className="size-8 rounded-full bg-black/50 border border-white/15 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition"
                title="Swipe Up"
              >
                <ChevronUp className="size-4" />
              </button>
            )}
            {activeIndex < posts.length - 1 && (
              <button
                onClick={handleNext}
                className="size-8 rounded-full bg-black/50 border border-white/15 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition"
                title="Swipe Down"
              >
                <ChevronDown className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Swipe guide banner overlay */}
      <div className="absolute bottom-4 inset-x-0 text-center pointer-events-none z-10 animate-pulse text-[8px] font-black tracking-widest text-white/30 uppercase">
        swipe up / down or press ↑ ↓ to browse cards
      </div>
    </div>
  );
}
