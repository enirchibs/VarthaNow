import { useRef } from "react";
import { Play, MapPin, Sparkles } from "lucide-react";
import { useViralVideos } from "@/hooks/useViralVideos";
import { useLanguage } from "@/hooks/useLanguage";

export function ViralShortsSwiper() {
  const { videos, loading } = useViralVideos(8);
  const { lang } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (loading || videos.length === 0) {
    return null; // Don't show anything while loading or if no videos
  }

  const translations = {
    title: {
      te: "వైరల్ షార్ట్స్",
      en: "Viral Shorts",
      hi: "वायरल शॉर्ट्स",
      ta: "வைரல் குறும்படங்கள்",
      kn: "ವೈರಲ್ ಶಾರ್ಟ್ಸ್"
    },
    subtitle: {
      te: "మీ అభిరుచికి, ప్రాంతానికి తగినట్లుగా",
      en: "Personalized for your interests & location",
      hi: "आपकी रुचि और स्थान के अनुसार",
      ta: "உங்கள் ஆர்வங்கள் மற்றும் இருப்பிடத்திற்கு ஏற்ப",
      kn: "ನಿಮ್ಮ ಆಸಕ್ತಿಗಳು ಮತ್ತು ಸ್ಥಳಕ್ಕೆ ಅನುಗುಣವಾಗಿ"
    }
  };

  return (
    <div className="flex flex-col rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-black text-red-600 dark:text-red-500">
            <Sparkles className="size-5" />
            {translations.title[lang] || translations.title.te}
          </h3>
          <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] flex items-center gap-1 mt-1">
            <MapPin className="size-3" />
            {translations.subtitle[lang] || translations.subtitle.te}
          </p>
        </div>
      </div>

      {/* Horizontal Scroll Area */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 p-4 pt-2 snap-x snap-mandatory no-scrollbar pb-6"
      >
        {videos.map((video) => (
          <div 
            key={video.id}
            className="relative flex-none w-[140px] md:w-[180px] aspect-[9/16] rounded-2xl overflow-hidden snap-center bg-black group cursor-pointer border border-[hsl(var(--border))]/50 shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => window.open(video.video_url, '_blank')}
          >
            {/* Thumbnail */}
            <img 
              src={video.thumbnail_url} 
              alt={video.title} 
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
              <div className="bg-red-600/90 text-white p-3 rounded-full backdrop-blur-sm shadow-xl">
                <Play className="size-6 ml-1" />
              </div>
            </div>

            {/* Video Info */}
            <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
              <h4 className="text-white font-black text-[11px] md:text-xs leading-snug line-clamp-2 drop-shadow-md group-hover:text-red-200 transition-colors">
                {video.title}
              </h4>
              <div className="flex items-center gap-1.5 mt-2">
                <img 
                  src={video.source_icon} 
                  alt={video.channel} 
                  className="size-4 md:size-5 rounded-full border border-white/40"
                />
                <span className="text-[9px] md:text-[10px] font-bold text-white/90 line-clamp-1 drop-shadow-sm">
                  {video.channel}
                </span>
              </div>
            </div>

            {/* Duration Badge */}
            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-black text-white pointer-events-none border border-white/20">
              {video.duration}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
