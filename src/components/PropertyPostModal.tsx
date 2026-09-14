import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  X, 
  Home, 
  Building2, 
  MapPin, 
  Phone, 
  Check, 
  Upload, 
  Camera, 
  Sparkles, 
  MessageCircle, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw,
  FileCheck
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { LocationAreaSelector } from "./LocationAreaSelector";
import { 
  UserProfile, 
  getStoredUserProfile, 
  saveStoredUserProfile, 
  PROFILE_EVENT_NAME 
} from "@/lib/user-profile";

interface PropertyPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export type PropertyCategory = "residential" | "commercial";

export type PropertyType = 
  | "flat" 
  | "house_villa" 
  | "plot_land" 
  | "pg_hostel" 
  | "farmhouse" 
  | "shop_showroom" 
  | "office" 
  | "warehouse" 
  | "other";

export type ListingType = "sale" | "rent" | "lease";

const RESIDENTIAL_TYPES = [
  { id: "flat", label: "Flat / Apartment", labelTe: "🏢 ఫ్లాట్ / అపార్ట్‌మెంట్" },
  { id: "house_villa", label: "Independent House / Villa", labelTe: "🏠 ఇల్లు / విల్లా" },
  { id: "plot_land", label: "Plot / Land", labelTe: "📐 ప్లాట్ / ల్యాండ్" },
  { id: "pg_hostel", label: "PG / Hostel", labelTe: "🏢 పీజీ / హాస్టల్" },
  { id: "farmhouse", label: "Farmhouse", labelTe: "🌴 ఫామ్‌హౌస్" },
  { id: "other", label: "Other Residential", labelTe: "🏘️ ఇతర నివాస స్థలం" }
];

const COMMERCIAL_TYPES = [
  { id: "shop_showroom", label: "Shop / Showroom", labelTe: "🏬 షాప్ / షోరూమ్" },
  { id: "office", label: "Office Space", labelTe: "🏢 ఆఫీస్" },
  { id: "warehouse", label: "Warehouse / Godown", labelTe: "🏭 గోదాము" },
  { id: "plot_land", label: "Commercial Plot / Land", labelTe: "📐 వాణిజ్య ప్లాట్" },
  { id: "farmhouse", label: "Commercial Farmhouse", labelTe: "🌴 కమర్షియల్ ఫామ్‌హౌస్" },
  { id: "other", label: "Other Commercial", labelTe: "🏬 ఇతర వాణిజ్య స్థలం" }
];

const AMENITIES_LIST = [
  "Parking", "Gym", "Swimming Pool", "Security", 
  "Power Backup", "Elevator", "Garden", "Club House", 
  "Wifi", "Furnished"
];

const LOCALITIES = [
  "విశాఖపట్నం (Visakhapatnam)",
  "మధురవాడ (Madhurawada)",
  "గాజువాక (Gajuwaka)",
  "ఎంవీపీ కాలనీ (MVP Colony)",
  "విజయవాడ (Vijayawada)",
  "హైదరాబాద్ (Hyderabad)",
  "తిరుపతి (Tirupati)",
  "గుంటూరు (Guntur)",
  "కాకినాడ (Kakinada)",
  "నెల్లూరు (Nellore)",
  "రాజమండ్రి (Rajahmundry)",
  "ఇతర ప్రాంతం (Other Area)"
];

export function PropertyPostModal({ isOpen, onClose, onSuccess }: PropertyPostModalProps) {
  const { lang } = useLanguage();

  // Category & Type Selection
  const [propertyCategory, setPropertyCategory] = useState<PropertyCategory>("residential");
  const [propertyType, setPropertyType] = useState<PropertyType>("flat");
  const [listingType, setListingType] = useState<ListingType>("sale");

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [areaSqft, setAreaSqft] = useState("");
  const [bedrooms, setBedrooms] = useState("2");
  const [bathrooms, setBathrooms] = useState("2");
  const [floorNumber, setFloorNumber] = useState("");
  const [totalFloors, setTotalFloors] = useState("");
  const [locality, setLocality] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(["Parking", "Security"]);
  const [agentName, setAgentName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // Mandatory Legal Terms & Disclaimers (Default checked = true)
  const [declarationIndependent, setDeclarationIndependent] = useState<boolean>(true);
  const [declarationResponsibility, setDeclarationResponsibility] = useState<boolean>(true);
  const [declarationTerms, setDeclarationTerms] = useState<boolean>(true);

  // Persistent User Profile Session (OLX / Upwork Style)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(getStoredUserProfile());

  // Auto-fill from active user profile on open or profile change
  React.useEffect(() => {
    const syncProfile = () => {
      const active = getStoredUserProfile();
      setUserProfile(active);
      if (active && active.is_verified) {
        if (active.name && !agentName) setAgentName(active.name);
        if (active.phone && !contactPhone) setContactPhone(active.phone);
      }
    };
    if (isOpen) {
      syncProfile();
    }
    window.addEventListener(PROFILE_EVENT_NAME as any, syncProfile);
    window.addEventListener("storage", syncProfile);
    return () => {
      window.removeEventListener(PROFILE_EVENT_NAME as any, syncProfile);
      window.removeEventListener("storage", syncProfile);
    };
  }, [isOpen]);

  // Media & UI States
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Real-Time Live WebCam / Device Camera Viewfinder State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startRealCamera = async (mode: "environment" | "user" = "environment") => {
    setIsCameraOpen(true);
    setCameraError(null);

    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setCameraStream(stream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err: any) {
      console.warn("Live camera access note:", err);
      setCameraError("కెమెరా అనుమతి లేదు. దయచేసి బ్రౌజర్ కెమెరా పర్మిషన్ ఎనేబుల్ చేయండి (Camera access was not granted or blocked).");
    }
  };

  const stopRealCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
    setCameraError(null);
  };

  const captureRealPhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setImages((prev) => [...prev, dataUrl].slice(0, 4));
        stopRealCamera();
      }
    }
  };

  const switchCameraFacing = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    startRealCamera(nextMode);
  };

  if (!isOpen) return null;

  // Toggle Amenities
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) => 
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    Array.from(files).forEach((file) => {
      if (images.length + newImages.length >= 4) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImages((prev) => [...prev, reader.result as string].slice(0, 4));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("దయచేసి ప్రాపర్టీ శీర్షిక ఎంటర్ చేయండి (Please enter property title)");
      return;
    }
    if (!locality.trim()) {
      setErrorMsg("దయచేసి ప్రాపర్టీ ప్రాంతం / లొకేషన్ ఎంచుకోండి (Please select property locality)");
      return;
    }
    if (!agentName.trim()) {
      setErrorMsg("దయచేసి ఏజెంట్ లేదా యజమాని పేరు నమోదు చేయండి (* Name is mandatory)");
      return;
    }
    const cleanPhone = contactPhone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      setErrorMsg("దయచేసి సరైన 10-అంకెల భారతీయ మొబైల్ నంబర్ ఇవ్వండి (10-digit Phone Required)");
      return;
    }
    if (!declarationIndependent || !declarationResponsibility || !declarationTerms) {
      setErrorMsg("దయచేసి ఫారమ్ చివర ఉన్న చట్టపరమైన డిక్లరేషన్లను అంగీకరించండి (Please check declaration boxes to proceed)");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    // Persist session so future ads do not require login/OTP
    const profileToSave: UserProfile = {
      id: userProfile?.id || `usr_${cleanPhone}`,
      name: agentName.trim(),
      phone: cleanPhone,
      is_verified: true,
      avatar_url: userProfile?.avatar_url,
      headline: userProfile?.headline || "🏡 ప్రాపర్టీ ఓనర్ / రియల్ ఎస్టేట్ ఏజెంట్",
      bio: userProfile?.bio,
      created_at: userProfile?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    saveStoredUserProfile(profileToSave);
    setUserProfile(profileToSave);

    try {
      const propertyAd = {
        id: `prop_${Date.now()}`,
        category: "property",
        property_category: propertyCategory,
        property_type: propertyType,
        listing_type: listingType,
        title: title.trim(),
        description: description.trim(),
        price: price.trim(),
        area_sqft: areaSqft.trim(),
        bedrooms,
        bathrooms,
        floor_number: floorNumber,
        total_floors: totalFloors,
        locality,
        amenities: selectedAmenities,
        seller_name: agentName.trim() || "ప్రాపర్టీ యజమాని",
        contact: contactPhone.trim(),
        whatsapp: whatsappNumber.trim() || contactPhone.trim(),
        images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80"],
        created_at: new Date().toISOString()
      };

      // Save to localStorage for instant persistence
      const existing = JSON.parse(localStorage.getItem("vaartanow_user_classifieds") || "[]");
      localStorage.setItem("vaartanow_user_classifieds", JSON.stringify([propertyAd, ...existing]));

      setSuccessMsg("✨ మీ ప్రాపర్టీ ప్రకటన విజయవంతంగా పోస్ట్ చేయబడింది! (Your property ad was listed successfully!)");
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(`Failed to save listing: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const currentPropertyTypes = propertyCategory === "residential" ? RESIDENTIAL_TYPES : COMMERCIAL_TYPES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative my-6 w-full max-w-2xl rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-xs shadow-inner">
              <Home className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">List Your Property for Sale or Rent</h2>
              <p className="text-[11px] font-bold text-blue-100">
                ప్లాట్, ఇల్లు, ఫ్లాట్, హాస్టల్, ఫామ్‌హౌస్, షాప్ ఉచితంగా పోస్ట్ చేయండి
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* 🌟 Logged-in Profile Badge (OLX Multi-Ad Posting Active) */}
          {userProfile && userProfile.is_verified && (
            <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-blue-950 dark:text-blue-200 flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-8 rounded-full overflow-hidden border border-blue-500 bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                  {userProfile.avatar_url ? (
                    <img src={userProfile.avatar_url} alt={userProfile.name} className="size-full object-cover" />
                  ) : (
                    <span>{userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "U"}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 font-black text-xs">
                    <span className="truncate">లాగిన్ అయ్యారు: {userProfile.name}</span>
                    <ShieldCheck className="size-3.5 text-blue-600 shrink-0" />
                  </div>
                  <p className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold truncate">
                    +91 {userProfile.phone} • OLX తరహాలో ఎన్ని ప్రకటనలైనా OTP లేకుండా పోస్ట్ చేయవచ్చు
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100 shrink-0">
                OTP ఫ్రీ
              </span>
            </div>
          )}
          
          {/* WhatsApp Direct Posting Strip */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-left space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                  Prefer WhatsApp? List via WhatsApp!
                </h4>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300 font-medium">
                  Share property details directly on WhatsApp and our team will list it for you.
                </p>
              </div>
              <a
                href={`https://api.whatsapp.com/send?phone=919876543210&text=${encodeURIComponent("Hi VaartaNow Team, I want to list my property for sale/rent on VaartaNow Real Estate.")}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm transition flex items-center gap-1.5 shrink-0"
              >
                <MessageCircle className="size-4" />
                <span>Post Property via WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-[hsl(var(--border))] w-full" />
            <span className="absolute bg-[hsl(var(--card))] px-3 text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
              OR fill the form below
            </span>
          </div>

          {/* Success / Error Toast */}
          {successMsg && (
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="size-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3.5 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Property Category Buttons (Residential vs Commercial) */}
            <div>
              <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                Property Category *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPropertyCategory("residential");
                    setPropertyType("flat");
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                    propertyCategory === "residential"
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-[hsl(var(--muted))]/50 border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-blue-500"
                  }`}
                >
                  <span className="text-sm font-black">Residential</span>
                  <span className="text-[10px] font-bold opacity-90">Homes, Flats, Plots, PG, Farmhouse</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPropertyCategory("commercial");
                    setPropertyType("shop_showroom");
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                    propertyCategory === "commercial"
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-[hsl(var(--muted))]/50 border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-blue-500"
                  }`}
                >
                  <span className="text-sm font-black">Commercial</span>
                  <span className="text-[10px] font-bold opacity-90">Office, Shop, Showroom, Warehouse</span>
                </button>
              </div>
            </div>

            {/* Property Type & Listing Type */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                  Property Type * (ప్లాట్ / ఫ్లాట్ / ఇల్లు / హాస్టల్ / ఫామ్‌హౌస్)
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold outline-none focus:border-blue-600"
                >
                  {currentPropertyTypes.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.labelTe} ({pt.label})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                  Listing Type * (అమ్మకం / అద్దె / లీజు)
                </label>
                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value as ListingType)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold outline-none focus:border-blue-600"
                >
                  <option value="sale">Sale (అమ్మకానికి)</option>
                  <option value="rent">Rent (అద్దెకు)</option>
                  <option value="lease">Lease (లీజుకు)</option>
                </select>
              </div>
            </div>

            {/* Property Title */}
            <div>
              <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                Property Title * (శీర్షిక)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ఉదా: విశాలమైన 2BHK ఫ్లాట్ అమ్మకానికి / 200 గజాల ప్లాట్ (e.g. Spacious 2BHK Flat / 200 Sq Yds Plot)"
                className="w-full h-11 px-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold outline-none focus:border-blue-600"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                Description (వివరాలు)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="ఉదా: తూర్పు ముఖం, మెయిన్ రోడ్డు దగ్గర, కార్ పార్కింగ్, 24 గంటల నీటి వసతి (e.g., East facing, near main road, car parking, 24/7 water, 2nd floor)..."
                className="w-full p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold outline-none focus:border-blue-600 resize-none"
              />
            </div>

            {/* Price & Area */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                  Price (₹) * (ధర)
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="ఉదా: 50,00,000 లేదా 15,000 / నెల (e.g., 5000000 or 15000 / month)"
                  className="w-full h-11 px-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                  Area (Sq Ft / Sq Yds) (విస్తీర్ణం)
                </label>
                <input
                  type="text"
                  value={areaSqft}
                  onChange={(e) => setAreaSqft(e.target.value)}
                  placeholder="ఉదా: 1200 sqft లేదా 200 గజాలు (e.g., 1200 sqft or 200 sq yds)"
                  className="w-full h-11 px-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Bedrooms, Bathrooms, Floor info (if flat/house) */}
            {(propertyType === "flat" || propertyType === "house_villa") && (
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))] mb-1">
                    Bedrooms
                  </label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold"
                  >
                    {["1", "2", "3", "4", "5+"].map((b) => (
                      <option key={b} value={b}>{b} BHK</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))] mb-1">
                    Bathrooms
                  </label>
                  <select
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold"
                  >
                    {["1", "2", "3", "4+"].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))] mb-1">
                    Floor Number
                  </label>
                  <input
                    type="text"
                    value={floorNumber}
                    onChange={(e) => setFloorNumber(e.target.value)}
                    placeholder="ఉదా: 3వ అంతస్తు (e.g., 3rd Floor)"
                    className="w-full h-9 px-2.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))] mb-1">
                    Total Floors
                  </label>
                  <input
                    type="text"
                    value={totalFloors}
                    onChange={(e) => setTotalFloors(e.target.value)}
                    placeholder="ఉదా: 5 అంతస్తులు (e.g., 5)"
                    className="w-full h-9 px-2.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold"
                  />
                </div>
              </div>
            )}

            {/* Locality with Universal GPS & Places Search */}
            <LocationAreaSelector
              value={locality}
              onChange={setLocality}
              label="ప్రాపర్టీ ప్రాంతం / లొకేషన్ (Property Locality / Area)"
              placeholder="ఉదా: ఆనందపురం, కూకట్‌పల్లి, విజయవాడ..."
              required={true}
            />

            {/* Amenities Toggle */}
            <div>
              <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-2">
                Amenities (సౌకర్యాలు)
              </label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_LIST.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-[hsl(var(--muted))]/40 border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-blue-400"
                      }`}
                    >
                      {amenity} {isSelected ? "✓" : "+"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Agent / Owner Info */}
            <div>
              <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                Agent / Owner Name (ఏజెంట్ / యజమాని పేరు) *
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g., Sekhar V"
                className="w-full h-11 px-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold outline-none focus:border-blue-600"
              />
            </div>

            {/* Property Images Upload & Camera Capture */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))]">
                  Property Images (Upload or Take Photo - up to 4 Photos)
                </label>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full">
                  {images.length}/4 Images
                </span>
              </div>

              {/* Upload & Camera Buttons */}
              {images.length < 4 && (
                <div className="grid grid-cols-2 gap-2.5 mb-2">
                  {/* Option 1: File / Gallery Upload */}
                  <label className="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10 cursor-pointer transition text-center group">
                    <Upload className="size-5 text-blue-600 group-hover:scale-110 transition shrink-0" />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-black text-blue-600">Upload Images</span>
                      <span className="text-[9px] font-bold text-blue-800/70 dark:text-blue-300">From Gallery / Files</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Option 2: Live Real Camera Capture */}
                  <button
                    type="button"
                    onClick={() => startRealCamera("environment")}
                    className="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer transition text-center group"
                  >
                    <Camera className="size-5 text-emerald-600 group-hover:scale-110 transition shrink-0" />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-black text-emerald-600">Camera</span>
                      <span className="text-[9px] font-bold text-emerald-800/70 dark:text-emerald-300">Take Live Photo (ఫోటో తీయండి)</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Thumbnails Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[hsl(var(--border))] shadow-xs group">
                      <img src={img} alt="Upload preview" className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white hover:bg-red-600 transition"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AT THE END OF FORM, BEFORE UPDATING MOBILE NUMBER: LEGAL TERMS & DISCLAIMER (DEFAULT CHECKED) */}
            <div className="space-y-2.5 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/20">
              <div className="flex items-center gap-1.5 font-black text-blue-950 dark:text-blue-300 text-xs">
                <FileCheck className="size-4 text-blue-600" />
                <span>చట్టపరమైన డిక్లరేషన్లు & నిబంధనల అంగీకారం (Legal Terms & Disclaimer)</span>
              </div>

              {/* Declaration 1: Independent Property Owner / Agent */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={declarationIndependent}
                  onChange={(e) => setDeclarationIndependent(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                />
                <div className="text-[11px] leading-relaxed text-slate-800 dark:text-slate-200 font-bold">
                  <span className="text-blue-950 dark:text-blue-300 font-black">1. స్వతంత్ర ప్రాపర్టీ ఓనర్ / ఏజెంట్ డిక్లరేషన్:</span> నేను ప్రాపర్టీ యజమానిని లేదా అధికృత ఏజెంట్‌నని, ప్రాపర్టీ వివరాలు మరియు యాజమాన్యం వాస్తవమైనవని ధృవీకరిస్తున్నాను. (Independent Owner / Agent declaration)
                </div>
              </label>

              {/* Declaration 2: Legal Title & Responsibility */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={declarationResponsibility}
                  onChange={(e) => setDeclarationResponsibility(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                />
                <div className="text-[11px] leading-relaxed text-slate-800 dark:text-slate-200 font-bold">
                  <span className="text-blue-950 dark:text-blue-300 font-black">2. టైటిల్ & చట్టపరమైన బాధ్యత:</span> ఈ ఆస్తి లీగల్ టైటిల్, డాక్యుమెంట్లు, చట్టపరమైన అనుమతులు మరియు ధర వివరాల ఖచ్చితత్వానికి నేనే స్వయంగా బాధ్యుడను. (Sole legal responsibility for title, approvals & pricing)
                </div>
              </label>

              {/* Declaration 3: Terms Acceptance */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={declarationTerms}
                  onChange={(e) => setDeclarationTerms(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                />
                <div className="text-[11px] leading-relaxed text-slate-800 dark:text-slate-200 font-bold">
                  <span className="text-blue-950 dark:text-blue-300 font-black">3. నిబంధనలు:</span> నేను VaartaNow{" "}
                  <Link to="/provider-terms" target="_blank" className="text-blue-600 underline font-black">
                    రియల్ ఎస్టేట్ నిబంధనలు (Terms)
                  </Link>
                  {" "}మరియు{" "}
                  <Link to="/provider-code-of-conduct" target="_blank" className="text-blue-600 underline font-black">
                    ప్రవర్తనా నియమావళి (Code of Conduct)
                  </Link>
                  {" "}ని చదివి, పూర్తిగా అంగీకరిస్తున్నాను.
                </div>
              </label>
            </div>

            {/* UPDATING MOBILE NUMBER (AT THE END OF FORM, RIGHT AFTER TERMS) */}
            <div>
              <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5 flex items-center justify-between">
                <span>Contact Phone / WhatsApp Number (సంప్రదించే మొబైల్ నంబర్) *</span>
                <span className="text-[10px] text-slate-500 font-bold">భారతదేశం (+91)</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-black text-slate-500 select-none">+91</span>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9876543210"
                  maxLength={10}
                  className="w-full h-11 pl-12 pr-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-black outline-none focus:border-blue-600"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-500 font-semibold mt-1">కొనుగోలుదారులు మరియు అద్దెదారులు మిమ్మల్ని సంప్రదించడానికి ఈ నంబర్ ఉపయోగపడుతుంది.</p>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={submitting || !declarationIndependent || !declarationResponsibility || !declarationTerms}
              className="w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Home className="size-4" />
              <span>
                {submitting
                  ? "పోస్ట్ చేస్తోంది..."
                  : userProfile && userProfile.is_verified
                  ? "🚀 ప్రాపర్టీని నేరుగా ప్రచురించండి (Publish Property - No OTP)"
                  : "List Property / ప్రాపర్టీ ప్రకటన పోస్ట్ చేయండి"}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* 📷 Real-Time Live WebCam / Device Camera Viewfinder Modal Overlay */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-950 border border-slate-800 p-4 shadow-2xl space-y-4 text-white overflow-hidden flex flex-col items-center">
            
            {/* Header Controls */}
            <div className="flex items-center justify-between w-full border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="size-5 text-emerald-400 animate-pulse" />
                <span className="text-sm font-black">Live Camera (లైవ్ కెమెరా - ఫోటో తీయండి)</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={switchCameraFacing}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1 text-slate-200 transition"
                  title="Switch Front/Rear Camera"
                >
                  <RefreshCw className="size-3.5" />
                  <span>మార్చండి</span>
                </button>
                
                <button
                  type="button"
                  onClick={stopRealCamera}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Error Message if camera access blocked */}
            {cameraError ? (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center space-y-3 my-4">
                <p>{cameraError}</p>
                <button
                  type="button"
                  onClick={stopRealCamera}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white font-black text-xs shadow-md"
                >
                  మూసివేయండి (Close)
                </button>
              </div>
            ) : (
              <>
                {/* Live Camera Video Stream Viewfinder */}
                <div className="relative aspect-[4/3] w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="size-full object-cover"
                  />
                  
                  {/* Hidden Canvas for Frame Capture */}
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Viewfinder Framing Overlay */}
                  <div className="absolute inset-6 border-2 border-emerald-400/40 rounded-xl pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] font-black text-emerald-400/80 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-xs">
                      ఫోటో తీయడానికి కింద బటన్ నొక్కండి
                    </span>
                  </div>
                </div>

                {/* Snap Photo Trigger Button */}
                <div className="flex items-center justify-center pt-2">
                  <button
                    type="button"
                    onClick={captureRealPhoto}
                    className="size-16 rounded-full bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 text-white shadow-[0_0_25px_rgba(52,211,153,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-4 border-white cursor-pointer"
                    title="Snap Real Photo"
                  >
                    <Camera className="size-7" />
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
