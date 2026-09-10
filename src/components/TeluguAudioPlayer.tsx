import { useEffect, useState, useRef } from "react";
import { Volume2, VolumeX, Play, Pause, Square, SkipForward, RefreshCw } from "lucide-react";
import type { BlogPost } from "@/types/news";

interface TeluguAudioPlayerProps {
  article: BlogPost;
  nextArticle?: BlogPost | null;
  onNavigateToNext?: (nextSlug: string) => void;
  autoPlayNext?: boolean;
}

/**
 * Extract up to 100 words of Telugu text (Title + Excerpt + Main Content)
 */
export function extract100WordsTeluguSummary(post: BlogPost): string {
  const fullText = `${post.title}. ${post.excerpt || ""} ${post.content || ""}`
    .replace(/<[^>]*>?/gm, "")
    .replace(/(https?:\/\/[^\s]+)/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const words = fullText.split(/\s+/);
  if (words.length <= 100) {
    return fullText;
  }
  return words.slice(0, 100).join(" ") + "।";
}

export function TeluguAudioPlayer({
  article,
  nextArticle,
  onNavigateToNext,
  autoPlayNext = true,
}: TeluguAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("🔊 వినండి (100 పదాలు)");
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isComponentMounted = useRef(true);

  useEffect(() => {
    isComponentMounted.current = true;
    stopAudio();
    return () => {
      isComponentMounted.current = false;
      stopAudio();
    };
  }, [article.slug]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsLoading(false);
    setStatusMsg("🔊 వినండి (100 పదాలు)");
  };

  /**
   * Synthesize & Play 100-word Telugu summary
   */
  const handlePlayClick = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsLoading(true);
    setStatusMsg("⏳ ఆడియో సిద్ధమవుతోంది...");

    const summaryText = extract100WordsTeluguSummary(article);

    try {
      // 1. CALL BACKEND FREE TTS ROUTE
      const response = await fetch("/api/tts/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: article.id || article.slug,
          slug: article.slug,
          text: summaryText,
          language: "te-IN",
        }),
      });

      const result = await response.json();

      if (!isComponentMounted.current) return;

      if (result.success && result.mode === "CLOUD_AUDIO" && (result.audioUrl || result.audioBase64)) {
        const src = result.audioUrl || `data:audio/mp3;base64,${result.audioBase64}`;
        setAudioUrl(src);
        playCloudAudioSource(src);
      } else {
        // Fallback: Web Speech API / Device Native TTS
        playWebSpeechFallback(summaryText);
      }
    } catch (err) {
      playWebSpeechFallback(summaryText);
    }
  };

  const playCloudAudioSource = (src: string) => {
    stopAudio();
    const audio = new Audio(src);
    audio.playbackRate = playbackSpeed;
    audioRef.current = audio;

    audio.onplay = () => {
      if (!isComponentMounted.current) return;
      setIsLoading(false);
      setIsPlaying(true);
      setStatusMsg("⏸ ఆపండి");
    };

    audio.onended = () => {
      if (!isComponentMounted.current) return;
      setIsPlaying(false);
      setStatusMsg("🔊 వినండి (100 పదాలు)");

      // AUTO ADVANCE TO NEXT NEWS ARTICLE AUTOMATICALLY!
      if (autoPlayNext && nextArticle && onNavigateToNext) {
        setStatusMsg("⏭ తదుపరి వార్తకు వెళ్తోంది...");
        setTimeout(() => {
          if (isComponentMounted.current) {
            onNavigateToNext(nextArticle.slug);
          }
        }, 800);
      }
    };

    audio.onerror = () => {
      const summaryText = extract100WordsTeluguSummary(article);
      playWebSpeechFallback(summaryText);
    };

    audio.play().catch(() => {
      const summaryText = extract100WordsTeluguSummary(article);
      playWebSpeechFallback(summaryText);
    });
  };

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const playDirectGooglePublicTTS = (text: string) => {
    try {
      const clean = text.slice(0, 180);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(clean)}&tl=te&client=tw-ob`;
      playCloudAudioSource(url);
    } catch {
      setIsLoading(false);
      setIsPlaying(false);
      setStatusMsg("ఆడియో ప్లే ఫెయిల్ అయింది");
    }
  };

  const playWebSpeechFallback = (text: string) => {
    if (!("speechSynthesis" in window)) {
      playDirectGooglePublicTTS(text);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "te-IN";
      utterance.rate = playbackSpeed;

      const voices = window.speechSynthesis.getVoices();
      const teluguVoice = voices.find((v) => v.lang.startsWith("te") || v.lang.includes("te"));
      if (teluguVoice) utterance.voice = teluguVoice;

      utterance.onstart = () => {
        if (!isComponentMounted.current) return;
        setIsLoading(false);
        setIsPlaying(true);
        setStatusMsg("⏸ ఆపండి");
      };

      utterance.onend = () => {
        if (!isComponentMounted.current) return;
        setIsPlaying(false);
        setStatusMsg("🔊 వినండి (100 పదాలు)");

        if (autoPlayNext && nextArticle && onNavigateToNext) {
          setStatusMsg("⏭ తదుపరి వార్తకు వెళ్తోంది...");
          setTimeout(() => {
            if (isComponentMounted.current) {
              onNavigateToNext(nextArticle.slug);
            }
          }, 800);
        }
      };

      utterance.onerror = () => {
        if (!isComponentMounted.current) return;
        playDirectGooglePublicTTS(text);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      playDirectGooglePublicTTS(text);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 p-3.5 shadow-sm space-y-2">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handlePlayClick}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white shadow-md active:scale-95 transition-all duration-200 ${
            isPlaying ? "bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {isLoading ? (
            <RefreshCw className="size-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="size-4" />
          ) : (
            <Volume2 className="size-4" />
          )}
          <span>{statusMsg}</span>
        </button>

        {/* Next article skip button */}
        {nextArticle && onNavigateToNext && (
          <button
            onClick={() => onNavigateToNext(nextArticle.slug)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-xs font-extrabold text-[hsl(var(--foreground))] hover:border-red-500 hover:text-red-600 transition"
            title={`Next: ${nextArticle.title}`}
          >
            <span>తదుపరి వార్త</span>
            <SkipForward className="size-3.5" />
          </button>
        )}
      </div>

      {/* Speed Controls */}
      {isPlaying && (
        <div className="flex items-center gap-1.5 pt-1 text-[11px] font-bold text-[hsl(var(--muted-foreground))]">
          <span>వేగం:</span>
          {[0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s)}
              className={`px-2 py-0.5 rounded-md transition ${
                playbackSpeed === s ? "bg-red-600 text-white font-black" : "bg-[hsl(var(--card))] border border-[hsl(var(--border))]"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
