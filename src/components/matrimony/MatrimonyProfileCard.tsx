import React from "react";
import { 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  Bookmark, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Sparkles,
  ChevronRight
} from "lucide-react";
import type { MatrimonyProfile } from "@/types/matrimony";

interface MatrimonyProfileCardProps {
  profile: MatrimonyProfile;
  isSaved: boolean;
  hasSentInterest: boolean;
  onToggleSave: (id: string) => void;
  onSendInterest: (profile: MatrimonyProfile) => void;
  onViewDetails: (profile: MatrimonyProfile) => void;
  familyMode: boolean;
}

export const MatrimonyProfileCard: React.FC<MatrimonyProfileCardProps> = ({
  profile,
  isSaved,
  hasSentInterest,
  onToggleSave,
  onSendInterest,
  onViewDetails,
  familyMode
}) => {
  const isPhotoHidden = profile.photo_privacy === "request_only" || profile.photo_privacy === "hidden";
  const photoUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0] : null;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border-2 border-slate-200/80 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-rose-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between">
      {/* Top Media & Header Section */}
      <div>
        <div className="relative w-full h-56 sm:h-64 bg-slate-100 dark:bg-zinc-800 overflow-hidden cursor-pointer" onClick={() => onViewDetails(profile)}>
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={profile.name}
              className={`w-full h-full object-cover transition duration-300 ${
                isPhotoHidden ? "blur-md scale-105 filter grayscale-[30%]" : "hover:scale-105"
              }`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-rose-100 to-pink-50 dark:from-zinc-800 dark:to-zinc-900 text-slate-400">
              <span className="text-5xl">{profile.gender === "bride" ? "👩" : "👨"}</span>
              <span className="text-xs font-bold text-slate-500 mt-2">ఫోటో అందుబాటులో లేదు</span>
            </div>
          )}

          {/* Privacy Overlay if photo is hidden */}
          {isPhotoHidden && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center text-white">
              <div className="size-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-1.5">
                <Lock className="size-5 text-white" />
              </div>
              <span className="text-xs font-black">🔒 ఫోటో ప్రైవేట్</span>
              <span className="text-[10px] text-slate-200 mt-0.5">వివరాలు చూసిన తర్వాత రిక్వెస్ట్ చేయవచ్చు</span>
            </div>
          )}

          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/75 via-black/30 to-transparent pointer-events-none" />

          {/* Verification Level & Managed By Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {profile.verification_badge_label_te && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold border border-white/20">
                <ShieldCheck className="size-3 text-emerald-400" />
                <span>{profile.verification_badge_label_te}</span>
              </span>
            )}
          </div>

          {/* Save / Bookmark Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(profile.id);
            }}
            className={`absolute top-3 right-3 size-9 rounded-full flex items-center justify-center backdrop-blur-md transition shadow-md z-10 ${
              isSaved
                ? "bg-amber-500 text-white"
                : "bg-black/50 text-white hover:bg-black/70"
            }`}
            title={isSaved ? "సేవ్ తొలగించండి" : "సంబంధం సేవ్ చేయండి"}
          >
            <Bookmark className={`size-4 ${isSaved ? "fill-white" : ""}`} />
          </button>

          {/* Bottom Card Image Text: Name, Age, Locality */}
          <div className="absolute bottom-3 left-3 right-3 text-white z-10">
            <div className="flex items-baseline gap-2">
              <h3 className={`font-black tracking-tight drop-shadow-sm ${
                familyMode ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
              }`}>
                {profile.name}
              </h3>
              <span className="text-sm sm:text-base font-extrabold text-rose-200 drop-shadow-xs">
                {profile.age} సం.
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-100 drop-shadow-xs mt-0.5">
              <MapPin className="size-3.5 text-rose-400 shrink-0" />
              <span className="truncate">
                {profile.village_town} ({profile.district})
              </span>
              {typeof profile.distance_km === "number" && (
                <span className="px-1.5 py-0.2 rounded-md bg-rose-600/80 text-white text-[10px] font-black shrink-0">
                  ~{Math.round(profile.distance_km)} కి.మీ
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info Body */}
        <div className="p-4">
          {/* Managed by badge */}
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              👪 {profile.profile_managed_by_label_te}
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {profile.profile_completeness}% పూర్తి
            </span>
          </div>

          {/* Education & Occupation */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
              <GraduationCap className="size-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="font-bold truncate">{profile.education}</span>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
              <Briefcase className="size-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="font-bold truncate">{profile.occupation}</span>
              {profile.income_range && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                  • {profile.income_range}
                </span>
              )}
            </div>
          </div>

          {/* Community & Height Pill tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
              📏 {profile.height}
            </span>
            <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
              {profile.marital_status_label_te}
            </span>
            {profile.community && (
              <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-100 dark:border-rose-900/50">
                {profile.community}
              </span>
            )}
          </div>

          {/* Transparent Match Reason */}
          <div className="p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 flex items-start gap-1.5 mb-2">
            <Sparkles className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold text-amber-950 dark:text-amber-200 leading-snug">
              🎯 ప్రాంతం & వయస్సు అనుకూలం (~{Math.round(profile.distance_km || 0)} కి.మీ పరిధి)
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
        {/* Send Interest Button */}
        <button
          type="button"
          onClick={() => onSendInterest(profile)}
          disabled={hasSentInterest}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-black transition shadow-xs active:scale-95 ${
            hasSentInterest
              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300"
              : "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-rose-600/20"
          }`}
        >
          {hasSentInterest ? (
            <>
              <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>ఆసక్తి పంపబడింది</span>
            </>
          ) : (
            <>
              <Heart className="size-3.5 fill-white" />
              <span>ఆసక్తి పంపండి</span>
            </>
          )}
        </button>

        {/* View Details Button */}
        <button
          type="button"
          onClick={() => onViewDetails(profile)}
          className="flex items-center justify-center gap-1 py-2.5 px-3 rounded-2xl text-xs font-black bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-zinc-700 transition active:scale-95 cursor-pointer"
        >
          <span>వివరాలు</span>
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
};
