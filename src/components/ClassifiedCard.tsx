import React, { useState, useEffect, useRef } from "react";
import { 
  MapPin, 
  Phone, 
  MessageCircle, 
  ShieldCheck, 
  Gift, 
  Tag, 
  Edit3, 
  Trash2, 
  Camera, 
  ChevronLeft, 
  ChevronRight,
  Clock
} from "lucide-react";
import { ClassifiedItem, ClassifiedCategory, deleteClassifiedItem, updateClassifiedItem } from "@/lib/classifieds-api";

interface ClassifiedCardProps {
  item: ClassifiedItem;
  currentSellerPhone?: string;
  onCardClick: () => void;
  onItemUpdated: () => void;
}

// Fallback High-Resolution Unsplash Cover Images per Category
const FALLBACK_CATEGORY_COVERS: Record<ClassifiedCategory, string> = {
  electronics: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
  furniture: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
  vehicles: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80",
  property: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
  services: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80",
  jobs: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  other: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80"
};

export function ClassifiedCard({ item, currentSellerPhone, onCardClick, onItemUpdated }: ClassifiedCardProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Edit form inline state
  const [editTitle, setEditTitle] = useState<string>(item.title);
  const [editPrice, setEditPrice] = useState<string>(item.price);
  const [editDiscount, setEditDiscount] = useState<string>(item.offer_discount || "");
  const [editStatus, setEditStatus] = useState<"available" | "sold">(item.status);

  // Prepare images list or fallback cover
  const rawImages = item.images && item.images.length > 0 ? item.images : [];
  const displayImages = rawImages.length > 0
    ? rawImages
    : [FALLBACK_CATEGORY_COVERS[item.category] || FALLBACK_CATEGORY_COVERS.other];

  // Auto-Slideshow interval (3.2 seconds / 3200ms) with Pause-on-Hover
  useEffect(() => {
    if (displayImages.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % displayImages.length);
    }, 3200);

    return () => clearInterval(timer);
  }, [displayImages.length, isHovered]);

  const cleanPhone = item.contact.replace(/\D/g, "");
  const isOwner = currentSellerPhone && currentSellerPhone.replace(/\D/g, "") === cleanPhone;

  // Direct WhatsApp pre-filled message as specified
  const whatsappMsg = `Hi ${item.seller_name}, I am interested in your item '${item.title}' listed for ${item.price} on VaartaNow.`;
  const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`;

  // Delete Action
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`మీరు నిజంగా '${item.title}' ప్రకటనను తొలగించాలనుకుంటున్నారా?`)) {
      await deleteClassifiedItem(item.id);
      onItemUpdated();
    }
  };

  // Save Edit Action
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await updateClassifiedItem(item.id, {
      title: editTitle.trim(),
      price: editPrice.trim(),
      offer_discount: editDiscount.trim() || undefined,
      status: editStatus
    });
    setIsEditing(false);
    onItemUpdated();
  };

  return (
    <div
      onClick={onCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="rounded-[1.8rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer group relative"
    >
      {/* ---------------- SLIDESHOW BANNER ---------------- */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
        <img
          src={displayImages[currentSlideIndex]}
          alt={item.title}
          className="w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
        />

        {/* Live Photo Counter Badge (📷 1/3) */}
        {displayImages.length > 1 && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-black text-white flex items-center gap-1 shadow-md">
            <Camera className="size-3" />
            <span>{currentSlideIndex + 1}/{displayImages.length}</span>
          </div>
        )}

        {/* Category Badge & Status Ribbon */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
            item.status === "available"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}>
            {item.status === "available" ? "🟢 AVAILABLE" : "🔴 SOLD OUT"}
          </span>

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white uppercase shadow-sm">
            {item.category}
          </span>
        </div>

        {/* Slideshow Arrow Controls on Hover */}
        {displayImages.length > 1 && (
          <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlideIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
              }}
              className="p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md"
            >
              <ChevronLeft className="size-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlideIndex((prev) => (prev + 1) % displayImages.length);
              }}
              className="p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}

        {/* Slideshow Dot Navigation Indicators (· · ·) */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-2.5 inset-x-0 flex justify-center gap-1.5 z-10">
            {displayImages.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlideIndex === idx ? "w-5 bg-white shadow-sm" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ---------------- CARD BODY ---------------- */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          
          {/* Price & Locality Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {item.price}
              </span>

              {/* Discount Tag (🔥 25% OFF) */}
              {item.offer_discount && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-xs">
                  🔥 {item.offer_discount}
                </span>
              )}
            </div>

            <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
              <MapPin className="size-3" />
              {item.locality.split(" ")[0]}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-black text-[hsl(var(--foreground))] leading-snug line-clamp-2 group-hover:text-blue-600 transition">
            {item.title}
          </h3>

          {/* Free Bonus Box (🎁 Free Bonus) */}
          {item.free_items && (
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
              <Gift className="size-3.5 text-purple-600 shrink-0" />
              <span className="truncate">🎁 <strong>Free Bonus:</strong> {item.free_items}</span>
            </div>
          )}

          {/* Verification Tag (👤 [Seller Name] ✓ Verified) */}
          <div className="flex items-center justify-between text-xs font-bold text-[hsl(var(--muted-foreground))] border-t border-[hsl(var(--border))]/50 pt-2.5">
            <div className="flex items-center gap-1 text-[11px]">
              <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
              <span className="truncate max-w-[130px]">
                👤 {item.seller_name} <strong className="text-emerald-600 font-extrabold">✓ Verified</strong>
              </span>
            </div>

            <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] flex items-center gap-1">
              <Clock className="size-3" />
              {new Date(item.created_at).toLocaleDateString("te-IN")}
            </span>
          </div>
        </div>

        {/* ---------------- CARD ACTIONS & SELLER CONTROLS ---------------- */}
        <div className="border-t border-[hsl(var(--border))]/60 pt-3 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
          
          {/* Owner Seller Management Controls (✏️ Edit & 🗑️ Delete) */}
          {isOwner ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="px-2.5 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white text-[11px] font-black transition flex items-center gap-1 cursor-pointer"
                title="Edit Listing"
              >
                <Edit3 className="size-3" />
                <span>✏️ Edit</span>
              </button>

              <button
                onClick={handleDelete}
                className="px-2.5 py-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white text-[11px] font-black transition flex items-center gap-1 cursor-pointer"
                title="Delete Listing"
              >
                <Trash2 className="size-3" />
                <span>🗑️ Delete</span>
              </button>
            </div>
          ) : (
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              🟢 Active Listing
            </span>
          )}

          {/* Buyer Quick Contact Toolbar (Call & WhatsApp) */}
          <div className="flex items-center gap-1.5">
            <a
              href={`tel:${item.contact}`}
              className="p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-xs flex items-center gap-1 text-[10px] font-black px-3"
              title="Call Seller"
            >
              <Phone className="size-3" />
              <span>కాల్</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-green-600 hover:bg-green-700 text-white transition shadow-xs flex items-center gap-1 text-[10px] font-black px-3"
              title="WhatsApp Chat"
            >
              <MessageCircle className="size-3" />
              <span>వాట్సాప్</span>
            </a>
          </div>
        </div>

      </div>

      {/* Inline Quick Edit Modal for Seller */}
      {isEditing && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={(e) => e.stopPropagation()}>
          <div className="relative w-full max-w-sm rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl space-y-3">
            <h4 className="font-black text-sm text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))] pb-2">
              ✏️ ప్రకటన సవరించండి (Edit Classified)
            </h4>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-black text-[hsl(var(--muted-foreground))]">శీర్షిక (Title)</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-[hsl(var(--muted-foreground))]">ధర (Price in ₹)</label>
                <input
                  type="text"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-[hsl(var(--muted-foreground))]">ఆఫర్ / డిస్కౌంట్ Tag</label>
                <input
                  type="text"
                  value={editDiscount}
                  onChange={(e) => setEditDiscount(e.target.value)}
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-[hsl(var(--muted-foreground))]">స్థితి (Status)</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as "available" | "sold")}
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-2 text-xs font-bold"
                >
                  <option value="available">🟢 అందుబాటులో ఉంది (Available)</option>
                  <option value="sold">🔴 అమ్మేసాము (SOLD OUT)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 rounded-full border border-[hsl(var(--border))] text-xs font-bold"
              >
                రద్దు చేయి
              </button>

              <button
                onClick={handleSaveEdit}
                className="flex-1 py-2 rounded-full bg-blue-600 text-white text-xs font-black shadow-md"
              >
                సేవ్ చేయి
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
