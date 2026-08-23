import React, { useState } from "react";
import { 
  X, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Share2, 
  ShieldCheck, 
  CheckCircle, 
  Tag, 
  Clock, 
  User, 
  Sparkles,
  ShoppingBag
} from "lucide-react";
import { ClassifiedItem, updateClassifiedStatus } from "@/lib/classifieds-api";

interface ClassifiedDetailModalProps {
  item: ClassifiedItem | null;
  onClose: () => void;
  onStatusUpdated: () => void;
}

export function ClassifiedDetailModal({ item, onClose, onStatusUpdated }: ClassifiedDetailModalProps) {
  const [selectedImgIndex, setSelectedImgIndex] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  if (!item) return null;

  const images = item.images && item.images.length > 0
    ? item.images
    : ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"];

  const handleToggleSold = async () => {
    setIsUpdating(true);
    const newStatus = item.status === "available" ? "sold" : "available";
    await updateClassifiedStatus(item.id, newStatus);
    setIsUpdating(false);
    onStatusUpdated();
  };

  const handleShare = () => {
    const text = `🛍️ *VaartaNow మన మార్కెట్* 🛍️\n\n📌 *${item.title}*\n💰 *ధర:* ${item.price}\n📍 *ప్రాంతం:* ${item.locality}\n📞 *సంప్రదించండి:* ${item.contact}\n\nవివరాలు చూడటానికి క్లిక్ చేయండి:\nhttps://varthanow.pages.dev/market`;
    if (navigator.share) {
      navigator.share({ title: item.title, text, url: "https://varthanow.pages.dev/market" }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  const cleanPhone = item.contact.replace(/\D/g, "");
  const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`నమస్తే ${item.seller_name}, VaartaNow 'మన మార్కెట్' లో మీరు పోస్ట్ చేసిన "${item.title}" గురించి వివరాలు తెలుసుకోవాలనుకుంటున్నాను.`)}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl space-y-5 p-6 sm:p-8 max-h-[90vh] overflow-y-auto no-scrollbar">

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full bg-black/40 hover:bg-black/60 p-2 text-white transition z-10"
        >
          <X className="size-5" />
        </button>

        {/* Image Gallery Viewer */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-neutral-900 border border-[hsl(var(--border))]/60">
          <img
            src={images[selectedImgIndex] || images[0]}
            alt={item.title}
            className="w-full h-full object-cover"
          />

          {/* Status Overlay Badge */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              item.status === "available"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-red-600 text-white shadow-md"
            }`}>
              {item.status === "available" ? "🟢 అందుబాటులో ఉంది (Available)" : "🔴 అమ్మేసాము (SOLD)"}
            </span>

            {item.free_items && (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-600 text-white shadow-md">
                🎁 {item.free_items}
              </span>
            )}
          </div>

          {/* Multiple Image Thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  className={`size-10 rounded-xl overflow-hidden border-2 transition ${
                    selectedImgIndex === idx ? "border-white scale-110 shadow-md" : "border-white/50 opacity-70"
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="space-y-4">
          
          {/* Price & Offer Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[hsl(var(--border))]/60 pb-3">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {item.price}
              </span>
              {item.offer_discount && (
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                  🏷️ ఆఫర్: {item.offer_discount}
                </p>
              )}
            </div>

            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 text-xs font-black uppercase">
              {item.category}
            </span>
          </div>

          {/* Title & Locality */}
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-[hsl(var(--foreground))] leading-snug">
              {item.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[hsl(var(--muted-foreground))]">
              <span className="flex items-center gap-1 text-red-500">
                <MapPin className="size-4" />
                {item.locality}
              </span>

              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {new Date(item.created_at).toLocaleDateString("te-IN")}
              </span>
            </div>
          </div>

          {/* Seller Verified Profile Card */}
          <div className="rounded-2xl bg-[hsl(var(--muted))]/50 p-4 border border-[hsl(var(--border))]/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md">
                <User className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-sm text-[hsl(var(--foreground))]">
                    {item.seller_name}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="size-3" />
                    Verified Seller
                  </span>
                </div>
                <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                  మొబైల్: {item.contact}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-extrabold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
              వస్తువు వివరాలు (Item Description):
            </h4>
            <p className="text-xs sm:text-sm font-medium text-[hsl(var(--foreground))] leading-relaxed bg-[hsl(var(--muted))]/30 p-4 rounded-2xl border border-[hsl(var(--border))]/40">
              {item.description}
            </p>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {/* Call */}
            <a
              href={`tel:${item.contact}`}
              className="flex-1 py-3.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="size-4" />
              <span>కాల్ చేయండి (Call)</span>
            </a>

            {/* WhatsApp */}
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3.5 px-4 rounded-full bg-green-600 hover:bg-green-700 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="size-4" />
              <span>వాట్సాప్ చాట్ (WhatsApp)</span>
            </a>

            {/* Share */}
            <button
              onClick={handleShare}
              className="py-3.5 px-4 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="size-4" />
              <span>షేర్</span>
            </button>
          </div>

          {/* Toggle Sold Status Button */}
          <div className="border-t border-[hsl(var(--border))]/60 pt-3">
            <button
              onClick={handleToggleSold}
              disabled={isUpdating}
              className="w-full py-2.5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 hover:bg-[hsl(var(--muted))] text-xs font-bold text-[hsl(var(--muted-foreground))] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle className="size-4" />
              <span>
                {item.status === "available"
                  ? "అమ్మకందారుగా గుర్తించు ➔ '🔴 అమ్మేసాము (Mark as Sold)' గా మార్చండి"
                  : "మళ్లీ అమ్మకానికి పెట్టు ➔ '🟢 అందుబాటులో ఉంది (Mark as Available)' గా మార్చండి"}
              </span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
