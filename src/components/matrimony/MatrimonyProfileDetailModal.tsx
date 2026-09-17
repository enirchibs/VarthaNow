import React, { useState } from "react";
import { 
  X, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Heart, 
  Phone, 
  Share2, 
  Bookmark, 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Calendar,
  Sparkles,
  Users,
  Compass
} from "lucide-react";
import type { MatrimonyProfile } from "@/types/matrimony";

interface MatrimonyProfileDetailModalProps {
  profile: MatrimonyProfile | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  hasSentInterest: boolean;
  hasRequestedContact: boolean;
  onToggleSave: (id: string) => void;
  onSendInterest: (profile: MatrimonyProfile) => void;
  onRequestContact: (profile: MatrimonyProfile) => void;
  onReport: (profile: MatrimonyProfile) => void;
  familyMode: boolean;
}

export const MatrimonyProfileDetailModal: React.FC<MatrimonyProfileDetailModalProps> = ({
  profile,
  isOpen,
  onClose,
  isSaved,
  hasSentInterest,
  hasRequestedContact,
  onToggleSave,
  onSendInterest,
  onRequestContact,
  onReport,
  familyMode
}) => {
  const [photoRequestSent, setPhotoRequestSent] = useState(false);

  if (!isOpen || !profile) return null;

  const isPhotoPrivate = profile.photo_privacy === "request_only" || profile.photo_privacy === "hidden";
  const photoUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0] : null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `మన అడ్డా మ్యాట్రిమోనీ: ${profile.name} (${profile.age} సం.)`,
          text: `మన అడ్డా మ్యాట్రిమోనీలో ${profile.village_town} పరిధిలోని సంబంధం వివరాలు చూడండి.`,
          url: window.location.href
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("లింక్ కాపీ చేయబడింది!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="size-8 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 font-black text-sm">
              💍
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                సంబంధం వివరాలు
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                ఐడీ: {profile.id} • {profile.profile_managed_by_label_te}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShare}
              className="size-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 flex items-center justify-center text-slate-700 dark:text-slate-200 transition"
              title="షేర్ చేయండి"
            >
              <Share2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => onReport(profile)}
              className="size-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center text-slate-500 transition"
              title="రిపోర్ట్ లేదా బ్లాక్"
            >
              <AlertTriangle className="size-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 flex items-center justify-center text-slate-700 dark:text-slate-200 transition"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto px-4 py-4 space-y-5">
          {/* Photo & Basic Badge Banner */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 h-64 sm:h-80">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={profile.name}
                className={`w-full h-full object-cover ${
                  isPhotoPrivate && !photoRequestSent ? "blur-xl filter grayscale-[40%]" : ""
                }`}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-4xl">
                {profile.gender === "bride" ? "👩" : "👨"}
              </div>
            )}

            {/* Privacy Overlay if private */}
            {isPhotoPrivate && !photoRequestSent && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center text-white">
                <div className="size-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-2">
                  <Lock className="size-6 text-white" />
                </div>
                <h4 className="text-sm font-black mb-1">🔒 ఫోటో గోప్యంగా ఉంచబడింది</h4>
                <p className="text-xs text-slate-200 max-w-xs mb-3">
                  కుటుంబ అనుమతి కోసం రిక్వెస్ట్ పంపండి. వారు ఆమోదించిన వెంటనే ఫోటో కనిపిస్తుంది.
                </p>
                <button
                  type="button"
                  onClick={() => setPhotoRequestSent(true)}
                  className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-black hover:bg-rose-50 transition shadow-md"
                >
                  ఫోటో చూడటానికి అనుమతి కోరండి
                </button>
              </div>
            )}

            {photoRequestSent && (
              <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-black shadow-md flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" /> ఫోటో రిక్వెస్ట్ పంపబడింది
              </div>
            )}

            {/* Bottom Title bar */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white">
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl sm:text-3xl font-black">{profile.name}</h2>
                <span className="text-lg font-bold text-rose-300">{profile.age} సం.</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200 mt-1">
                <MapPin className="size-3.5 text-rose-400 shrink-0" />
                <span>{profile.village_town}, {profile.district}</span>
                {profile.distance_km && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-600/80 text-[10px] font-black">
                    ~{Math.round(profile.distance_km)} కి.మీ దూరం
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Verification & Trust Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>{profile.verification_badge_label_te}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-black">
              <Users className="size-4 text-indigo-600" />
              <span>{profile.profile_managed_by_label_te}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-black">
              <Sparkles className="size-4 text-amber-600" />
              <span>{profile.profile_completeness}% ప్రొఫైల్ పూర్తి</span>
            </span>
          </div>

          {/* About Section */}
          {profile.about_te && (
            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-zinc-800/60 border border-rose-100 dark:border-zinc-700">
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-900 dark:text-rose-300 mb-1.5 flex items-center gap-1.5">
                <span>💬 పరిచయం & కోరికలు (About)</span>
              </h4>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                "{profile.about_te}"
              </p>
            </div>
          )}

          {/* 1. Personal & Physical Details */}
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 p-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              వ్యక్తిగత వివరాలు (Personal Details)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">వయస్సు:</span>
                <strong className="text-slate-900 dark:text-white font-bold">{profile.age} సంవత్సరాలు</strong>
              </div>
              <div>
                <span className="text-slate-500 block">ఎత్తు:</span>
                <strong className="text-slate-900 dark:text-white font-bold">{profile.height}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">వైవాహిక స్థితి:</span>
                <strong className="text-slate-900 dark:text-white font-bold">{profile.marital_status_label_te}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">మాతృభాష:</span>
                <strong className="text-slate-900 dark:text-white font-bold">{profile.mother_tongue}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">మతం & సామాజిక వర్గం:</span>
                <strong className="text-slate-900 dark:text-white font-bold">
                  {profile.religion} - {profile.community}
                </strong>
              </div>
              {profile.gothram && (
                <div>
                  <span className="text-slate-500 block">గోత్రం:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{profile.gothram}</strong>
                </div>
              )}
            </div>
          </div>

          {/* 2. Education & Career Details */}
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 p-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <GraduationCap className="size-4 text-indigo-600" />
              <span>విద్య & ఉద్యోగం (Education & Profession)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">చదువు:</span>
                <strong className="text-slate-900 dark:text-white font-bold text-sm">{profile.education}</strong>
                {profile.education_detail && (
                  <span className="text-slate-500 block text-[11px]">{profile.education_detail}</span>
                )}
              </div>
              <div>
                <span className="text-slate-500 block">ఉద్యోగం:</span>
                <strong className="text-slate-900 dark:text-white font-bold text-sm">{profile.occupation}</strong>
                {profile.occupation_detail && (
                  <span className="text-slate-500 block text-[11px]">{profile.occupation_detail}</span>
                )}
              </div>
              {profile.income_range && (
                <div>
                  <span className="text-slate-500 block">వార్షిక ఆదాయం:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{profile.income_range}</strong>
                </div>
              )}
            </div>
          </div>

          {/* 3. Family & Lifestyle Details */}
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 p-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Users className="size-4 text-rose-600" />
              <span>కుటుంబం & జీవనశైలి (Family & Lifestyle)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {profile.family_type && (
                <div>
                  <span className="text-slate-500 block">కుటుంబ రకం:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{profile.family_type}</strong>
                </div>
              )}
              {profile.family_values && (
                <div>
                  <span className="text-slate-500 block">విలువలు:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{profile.family_values}</strong>
                </div>
              )}
              {profile.diet && (
                <div>
                  <span className="text-slate-500 block">ఆహార అలవాట్లు:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{profile.diet}</strong>
                </div>
              )}
            </div>
          </div>

          {/* 4. Horoscope Details (If available) */}
          {profile.horoscope_available && (
            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-2">
                ✨ జాతక వివరాలు (Horoscope Available)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {profile.rashi && (
                  <div>
                    <span className="text-slate-500 block">రాశి:</span>
                    <strong className="text-slate-900 dark:text-white font-bold">{profile.rashi}</strong>
                  </div>
                )}
                {profile.nakshatra && (
                  <div>
                    <span className="text-slate-500 block">నక్షత్రం:</span>
                    <strong className="text-slate-900 dark:text-white font-bold">{profile.nakshatra}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. Strict Privacy Notice & Phone Access */}
          <div className="rounded-2xl bg-slate-50 dark:bg-zinc-800/80 p-4 border border-slate-200 dark:border-zinc-700">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                <Lock className="size-5" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>ఫోన్ నంబర్ & సంప్రదింపు గోప్యత</span>
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-normal">
                  ఫోన్ నంబర్: <strong className="font-mono text-slate-900 dark:text-white">{profile.phone_masked}</strong>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  కుటుంబ సభ్యుల భద్రత కోసం పూర్తి ఫోన్ నంబర్ నేరుగా కనిపించదు. మీరు "వివరాల కోసం రిక్వెస్ట్" పంపినప్పుడు, అవతలి కుటుంబం ఆమోదిస్తేనే నంబర్ మరియు సంప్రదింపు వివరాలు మీకు అందుబాటులోకి వస్తాయి.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky bottom-0 z-20 flex items-center gap-2">
          {/* Save toggle */}
          <button
            type="button"
            onClick={() => onToggleSave(profile.id)}
            className={`size-11 rounded-2xl flex items-center justify-center border transition shrink-0 ${
              isSaved
                ? "bg-amber-500 text-white border-amber-600"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-200 border-slate-200 hover:bg-amber-50"
            }`}
            title="సేవ్ చేయండి"
          >
            <Bookmark className={`size-5 ${isSaved ? "fill-white" : ""}`} />
          </button>

          {/* Request Contact Button */}
          <button
            type="button"
            onClick={() => onRequestContact(profile)}
            disabled={hasRequestedContact}
            className={`flex-1 py-3 px-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition active:scale-95 ${
              hasRequestedContact
                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
            }`}
          >
            <Phone className="size-4" />
            <span>{hasRequestedContact ? "రిక్వెస్ట్ పంపబడింది" : "📞 వివరాల కోసం రిక్వెస్ట్"}</span>
          </button>

          {/* Send Interest Button */}
          <button
            type="button"
            onClick={() => onSendInterest(profile)}
            disabled={hasSentInterest}
            className={`flex-1 py-3 px-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition active:scale-95 ${
              hasSentInterest
                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300"
                : "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-md shadow-rose-600/20"
            }`}
          >
            <Heart className="size-4 fill-white" />
            <span>{hasSentInterest ? "ఆసక్తి పంపబడింది" : "❤️ సంబంధం ఆసక్తి"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
