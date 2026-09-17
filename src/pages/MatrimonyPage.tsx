import React, { useState, useEffect, useMemo } from "react";
import { 
  Sparkles, 
  MapPin, 
  Search, 
  Filter, 
  Users, 
  Heart, 
  Bookmark, 
  Phone, 
  Plus, 
  RefreshCw, 
  ArrowLeft,
  CheckCircle2,
  SlidersHorizontal
} from "lucide-react";
import type { 
  MatrimonyProfile, 
  MatrimonyGender, 
  MatrimonySearchFilters,
  MatrimonyInterest,
  MatrimonyContactRequest
} from "@/types/matrimony";
import { 
  searchMatrimonyProfiles, 
  getUserMatrimonyProfile, 
  getSavedMatrimonyProfileIds, 
  toggleSaveMatrimonyProfile,
  getMatrimonyInterests,
  sendMatrimonyInterest,
  getMatrimonyContactRequests,
  requestMatrimonyContact,
  reportMatrimonyProfile,
  blockMatrimonyProfile,
  parseVoiceMatrimonyQuery
} from "@/lib/matrimony-api";

import { MatrimonyHeader } from "@/components/matrimony/MatrimonyHeader";
import { MatrimonyFirstScreen } from "@/components/matrimony/MatrimonyFirstScreen";
import { MatrimonyProfileCard } from "@/components/matrimony/MatrimonyProfileCard";
import { MatrimonyProfileDetailModal } from "@/components/matrimony/MatrimonyProfileDetailModal";
import { MatrimonyQuickRegisterModal } from "@/components/matrimony/MatrimonyQuickRegisterModal";
import { MatrimonyInterestModal } from "@/components/matrimony/MatrimonyInterestModal";
import { MatrimonyContactRequestModal } from "@/components/matrimony/MatrimonyContactRequestModal";
import { MatrimonyLocationModal } from "@/components/matrimony/MatrimonyLocationModal";
import { MatrimonyLocalMatchRings } from "@/components/matrimony/MatrimonyLocalMatchRings";
import { MatrimonySafetyNotice } from "@/components/matrimony/MatrimonySafetyNotice";

export const MatrimonyPage: React.FC = () => {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<"first_screen" | "matches">("first_screen");
  const [activeGender, setActiveGender] = useState<MatrimonyGender>("bride");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [activeRing, setActiveRing] = useState<"all" | "very_near" | "nearby_towns" | "wider">("all");

  // Location & Filters
  const [locality, setLocality] = useState("అనకాపల్లి");
  const [radiusKm, setRadiusKm] = useState(25);
  const [coords, setCoords] = useState<{ lat?: number; lon?: number }>({ lat: 17.6913, lon: 83.0039 });
  const [searchQuery, setSearchQuery] = useState("");
  const [familyMode, setFamilyMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("mana_adda_family_mode") === "true";
    }
    return false;
  });

  // Profiles and Async State
  const [profiles, setProfiles] = useState<MatrimonyProfile[]>([]);
  const [ringCounts, setRingCounts] = useState({
    all: 0,
    very_near: 0,
    nearby_towns: 0,
    wider: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // User Data & Interactions
  const [userProfile, setUserProfile] = useState<MatrimonyProfile | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [interests, setInterests] = useState<MatrimonyInterest[]>([]);
  const [contactRequests, setContactRequests] = useState<MatrimonyContactRequest[]>([]);

  // Modals
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedDetailProfile, setSelectedDetailProfile] = useState<MatrimonyProfile | null>(null);
  const [selectedInterestProfile, setSelectedInterestProfile] = useState<MatrimonyProfile | null>(null);
  const [selectedContactProfile, setSelectedContactProfile] = useState<MatrimonyProfile | null>(null);

  // Load initial persistent data
  useEffect(() => {
    setUserProfile(getUserMatrimonyProfile());
    setSavedIds(getSavedMatrimonyProfileIds());
    setInterests(getMatrimonyInterests());
    setContactRequests(getMatrimonyContactRequests());
  }, []);

  // Family mode persist
  const toggleFamilyMode = () => {
    setFamilyMode((prev) => {
      const next = !prev;
      localStorage.setItem("mana_adda_family_mode", String(next));
      return next;
    });
  };

  // Fetch profiles based on filters
  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const filters: MatrimonySearchFilters = {
        gender: activeGender,
        lat: coords.lat,
        lon: coords.lon,
        locality,
        radius_km: radiusKm,
        query: searchQuery,
        ring_tier: activeRing
      };
      const res = await searchMatrimonyProfiles(filters);
      setProfiles(res.profiles);
      setRingCounts({
        all: res.total,
        very_near: res.rings.very_near.length,
        nearby_towns: res.rings.nearby_towns.length,
        wider: res.rings.wider.length
      });
    } catch (err) {
      console.error("Error loading matrimony profiles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [activeGender, coords, locality, radiusKm, searchQuery, activeRing]);

  // First screen triggers
  const handleSelectGenderFromFirstScreen = (gender: MatrimonyGender) => {
    setActiveGender(gender);
    setViewMode("matches");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectNearMeFromFirstScreen = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setLocality("నా ప్రస్తుత లొకేషన్");
          setRadiusKm(10);
          setViewMode("matches");
        },
        () => {
          setIsLocationModalOpen(true);
        }
      );
    } else {
      setIsLocationModalOpen(true);
    }
  };

  const handleSearchFromFirstScreen = (query: string) => {
    const parsed = parseVoiceMatrimonyQuery(query);
    if (parsed.gender) setActiveGender(parsed.gender);
    if (parsed.locality) setLocality(parsed.locality);
    setSearchQuery(query);
    setViewMode("matches");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Location selection handler
  const handleSelectLocation = (loc: string, radius: number, lat?: number, lon?: number) => {
    setLocality(loc);
    setRadiusKm(radius);
    if (lat && lon) {
      setCoords({ lat, lon });
    }
    setViewMode("matches");
  };

  // Profile Save / Bookmark toggle
  const handleToggleSave = (id: string) => {
    toggleSaveMatrimonyProfile(id);
    setSavedIds(getSavedMatrimonyProfileIds());
  };

  // Interest sender
  const handleSendInterestClick = (profile: MatrimonyProfile) => {
    setSelectedInterestProfile(profile);
  };

  const handleConfirmInterest = (targetId: string, senderName: string) => {
    sendMatrimonyInterest(userProfile?.id || "usr_self", senderName, targetId);
    setInterests(getMatrimonyInterests());
    setSelectedInterestProfile(null);
    alert("❤️ మీ ఆసక్తి విజయవంతంగా చేరింది! అవతలి కుటుంబం స్పందించిన వెంటనే మీకు తెలియజేస్తాము.");
  };

  // Contact request sender
  const handleContactRequestClick = (profile: MatrimonyProfile) => {
    setSelectedContactProfile(profile);
  };

  const handleConfirmContactRequest = (targetId: string, name: string, phone: string) => {
    requestMatrimonyContact(targetId, name, phone);
    setContactRequests(getMatrimonyContactRequests());
    setSelectedContactProfile(null);
    alert("📞 మీ సంప్రదింపు రిక్వెస్ట్ పంపబడింది! వారి అనుమతి పొందిన తర్వాత ఫోన్ నంబర్ కనిపిస్తుంది.");
  };

  // Report & Block
  const handleReport = (profile: MatrimonyProfile) => {
    const reason = window.prompt("దయచేసి సమస్య లేదా కారణం నమోదు చేయండి (ఉదా: తప్పుడు సమాచారం, అనుమానాస్పదం):");
    if (reason) {
      reportMatrimonyProfile({
        reported_profile_id: profile.id,
        reason,
        description: reason,
        created_at: new Date().toISOString()
      });
      const shouldBlock = window.confirm("ఈ ప్రొఫైల్‌ను భవిష్యత్తులో కనిపించకుండా బ్లాక్ చేయాలా?");
      if (shouldBlock) {
        blockMatrimonyProfile(profile.id);
        loadProfiles();
      }
      setSelectedDetailProfile(null);
      alert("మీ ఫిర్యాదు నమోదు చేయబడింది. ధన్యవాదాలు!");
    }
  };

  // Tab change handler
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "very_near") {
      setActiveRing("very_near");
      setViewMode("matches");
    } else {
      setViewMode("matches");
    }
  };

  // Filtered profiles for view
  const displayedProfiles = useMemo(() => {
    if (activeTab === "saved") {
      return profiles.filter((p) => savedIds.includes(p.id));
    }
    if (activeTab === "interests") {
      const targetIds = interests.map((i) => i.receiver_profile_id);
      return profiles.filter((p) => targetIds.includes(p.id));
    }
    return profiles;
  }, [profiles, activeTab, savedIds, interests]);

  return (
    <div className={`min-h-screen bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-white transition-all pb-24 ${
      familyMode ? "text-base font-medium" : ""
    }`}>
      {/* 1. Header */}
      <MatrimonyHeader
        currentLocality={locality}
        radiusKm={radiusKm}
        familyMode={familyMode}
        onToggleFamilyMode={toggleFamilyMode}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        userProfile={userProfile}
        savedCount={savedIds.length}
        interestCount={interests.length}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* 2. Primary Content: First Screen vs Matches View */}
      {viewMode === "first_screen" ? (
        <MatrimonyFirstScreen
          onSelectGender={handleSelectGenderFromFirstScreen}
          onSelectNearMe={handleSelectNearMeFromFirstScreen}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          onSearchQuery={handleSearchFromFirstScreen}
          familyMode={familyMode}
        />
      ) : (
        <main className="container-shell max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Back to First Screen & Filter Summary Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode("first_screen")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold hover:bg-slate-100 transition shadow-2xs"
              >
                <ArrowLeft className="size-3.5" />
                <span>మొదటి పేజీ</span>
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800" />

              {/* Gender Toggle in Matches */}
              <div className="inline-flex rounded-full p-0.5 bg-slate-200/70 dark:bg-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveGender("bride")}
                  className={`px-3 py-1 rounded-full text-xs font-black transition ${
                    activeGender === "bride"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                  }`}
                >
                  👩 వధువులు
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGender("groom")}
                  className={`px-3 py-1 rounded-full text-xs font-black transition ${
                    activeGender === "groom"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                  }`}
                >
                  👨 వరులు
                </button>
              </div>
            </div>

            {/* Quick Location & Results Summary */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>
                📍 {locality} ({radiusKm} కి.మీ) • {displayedProfiles.length} సంబంధాలు లభించాయి
              </span>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="text-rose-600 dark:text-rose-400 underline font-black"
              >
                మార్చండి
              </button>
            </div>
          </div>

          {/* Local Match Rings 3-Tier Navigation */}
          {activeTab === "all" && (
            <MatrimonyLocalMatchRings
              activeRing={activeRing}
              onSelectRing={setActiveRing}
              counts={ringCounts}
            />
          )}

          {/* Tab Subheadings */}
          {activeTab === "saved" && (
            <div className="mb-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <Bookmark className="size-4 fill-amber-500 text-amber-500" />
              <span>మీరు భవిష్యత్ పరిశీలన కోసం సేవ్ చేసిన సంబంధాలు ({displayedProfiles.length})</span>
            </div>
          )}

          {activeTab === "interests" && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-2">
              <Heart className="size-4 fill-rose-500 text-rose-500" />
              <span>మీరు ఆసక్తి వ్యక్తం చేసిన సంబంధాలు ({displayedProfiles.length})</span>
            </div>
          )}

          {/* Profile Cards Grid */}
          {isLoading ? (
            <div className="py-16 text-center">
              <RefreshCw className="size-8 text-rose-500 animate-spin mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-500">సంబంధాల వివరాలు లోడ్ అవుతున్నాయి...</p>
            </div>
          ) : displayedProfiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {displayedProfiles.map((profile) => (
                <MatrimonyProfileCard
                  key={profile.id}
                  profile={profile}
                  isSaved={savedIds.includes(profile.id)}
                  hasSentInterest={interests.some((i) => i.receiver_profile_id === profile.id)}
                  onToggleSave={handleToggleSave}
                  onSendInterest={handleSendInterestClick}
                  onViewDetails={setSelectedDetailProfile}
                  familyMode={familyMode}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 px-4 text-center max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800">
              <div className="size-16 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto mb-3 text-2xl">
                💍
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">
                ఈ పరిధిలో సంబంధాలు కనుగొనబడలేదు
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                శోధన పరిధిని (కిలోమీటర్ల దూరం) పెంచండి లేదా సమీప పట్టణాన్ని ఎంచుకోండి.
              </p>
              <button
                type="button"
                onClick={() => {
                  setRadiusKm(100);
                  setActiveRing("all");
                }}
                className="px-4 py-2.5 rounded-2xl bg-rose-600 text-white font-black text-xs shadow-md shadow-rose-600/20"
              >
                విశాల పరిధిలో వెతకండి (100 కి.మీ)
              </button>
            </div>
          )}

          {/* Safety & Scam Prevention Notice */}
          <MatrimonySafetyNotice />
        </main>
      )}

      {/* Floating Action Button: + Register Profile */}
      <div className="fixed bottom-20 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsRegisterModalOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-rose-600/30 hover:scale-105 active:scale-95 transition"
        >
          <Plus className="size-4 stroke-[3px]" />
          <span>{userProfile ? "నా ప్రొఫైల్" : "+ ఉచిత ప్రొఫైల్ నమోదు"}</span>
        </button>
      </div>

      {/* MODALS */}
      {/* 1. Location Selector Modal */}
      <MatrimonyLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocality={locality}
        currentRadius={radiusKm}
        onSelectLocation={handleSelectLocation}
      />

      {/* 2. Profile Detail Modal */}
      <MatrimonyProfileDetailModal
        profile={selectedDetailProfile}
        isOpen={!!selectedDetailProfile}
        onClose={() => setSelectedDetailProfile(null)}
        isSaved={selectedDetailProfile ? savedIds.includes(selectedDetailProfile.id) : false}
        hasSentInterest={selectedDetailProfile ? interests.some((i) => i.receiver_profile_id === selectedDetailProfile.id) : false}
        hasRequestedContact={selectedDetailProfile ? contactRequests.some((r) => r.target_profile_id === selectedDetailProfile.id) : false}
        onToggleSave={handleToggleSave}
        onSendInterest={handleSendInterestClick}
        onRequestContact={handleContactRequestClick}
        onReport={handleReport}
        familyMode={familyMode}
      />

      {/* 3. Quick Register Modal */}
      <MatrimonyQuickRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onProfileCreated={(newProf) => {
          setUserProfile(newProf);
          loadProfiles();
        }}
        existingProfile={userProfile}
      />

      {/* 4. Respectful Interest Modal */}
      <MatrimonyInterestModal
        isOpen={!!selectedInterestProfile}
        onClose={() => setSelectedInterestProfile(null)}
        targetProfile={selectedInterestProfile}
        onConfirmSend={handleConfirmInterest}
      />

      {/* 5. Respectful Contact Request Modal */}
      <MatrimonyContactRequestModal
        isOpen={!!selectedContactProfile}
        onClose={() => setSelectedContactProfile(null)}
        targetProfile={selectedContactProfile}
        onConfirmRequest={handleConfirmContactRequest}
      />
    </div>
  );
};
