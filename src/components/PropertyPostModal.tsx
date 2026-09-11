import React, { useState, useRef } from "react";
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
  RefreshCw
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { LocationAreaSelector } from "./LocationAreaSelector";

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
  const [locality, setLocality] = useState("మధురవాడ (Madhurawada)");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(["Parking", "Security"]);
  const [agentName, setAgentName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

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
    if (!contactPhone.trim()) {
      setErrorMsg("దయచేసి సంప్రదించాల్సిన ఫోన్ నెంబర్ నమోదు చేయండి (Please enter contact phone)");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

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
                placeholder="e.g., Spacious 2BHK Apartment in Madhurawada / 200 Sq Yds Plot in Gajuwaka"
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
                placeholder="Describe your property details, facing, landmarks, nearby schools/hospitals..."
                className="w-full p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold outline-none focus:border-blue-600 resize-none"
              />
            </div>

            {/* Price & Area */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                  Price (₹) *
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g., 5000000 or 15000 / month"
                  className="w-full h-11 px-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                  Area (Sq Ft / Sq Yds)
                </label>
                <input
                  type="text"
                  value={areaSqft}
                  onChange={(e) => setAreaSqft(e.target.value)}
                  placeholder="e.g., 1200 sqft or 200 sq yds"
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
                    placeholder="e.g., 3rd Floor"
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
                    placeholder="e.g., 5"
                    className="w-full h-9 px-2.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold"
                  />
                </div>
              </div>
            )}

            {/* Locality with Universal GPS & Places Search */}
            <LocationAreaSelector
              value={locality}
              onChange={setLocality}
              label="Property Locality / Area * (ప్రాంతం / గ్రామం / మండలం / వీధి)"
              placeholder="గ్రామం, మండలం, వీధి, పట్నం లేదా నగరం టైప్ చేయండి..."
              required
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                  Agent / Owner Name *
                </label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g., Sekhar V"
                  className="w-full h-11 px-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full h-11 px-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold outline-none focus:border-blue-600"
                  required
                />
              </div>
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

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <Home className="size-4" />
              <span>List Property / ప్రాపర్టీ ప్రకటన పోస్ట్ చేయండి</span>
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
