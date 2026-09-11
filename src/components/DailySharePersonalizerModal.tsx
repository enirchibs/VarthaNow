import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Share2, Download, Check, Sparkles, User, Building, MapPin, Smartphone } from "lucide-react";
import { DailyShareItem, PersonalizeOptions } from "@/types/daily-share";
import { saveUserCreation } from "@/lib/daily-share-api";
import { useLanguage } from "@/hooks/useLanguage";

interface DailySharePersonalizerModalProps {
  item: DailyShareItem;
  isOpen: boolean;
  onClose: () => void;
}

export function DailySharePersonalizerModal({ item, isOpen, onClose }: DailySharePersonalizerModalProps) {
  const { lang } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [userName, setUserName] = useState("సాయి కిరణ్ (Sai Kiran)");
  const [businessName, setBusinessName] = useState(item.default_business_name || "");
  const [location, setLocation] = useState(item.location || "విశాఖపట్నం (Vizag)");
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const [themeColor, setThemeColor] = useState("#ef4444"); // Red 600

  const [rendering, setRendering] = useState(false);
  const [renderedDataUrl, setRenderedDataUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Default avatars if user hasn't uploaded a photo
  const defaultAvatars = [
    { label: "👤 Person", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" },
    { label: "👨‍💼 Business", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" },
    { label: "🕉️ Devotional", url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80" }
  ];

  // Handle Photo Upload from device
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserPhotoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Render 9:16 Portrait Canvas
  const renderCanvas = () => {
    setRendering(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 720;
    const height = 1280;
    canvas.width = width;
    canvas.height = height;

    const bgImage = new Image();
    bgImage.crossOrigin = "anonymous";
    bgImage.src = item.image_url;

    bgImage.onload = () => {
      // 1. Draw Background Image with 9:16 Cover
      const scale = Math.max(width / bgImage.width, height / bgImage.height);
      const x = (width / 2) - (bgImage.width / 2) * scale;
      const y = (height / 2) - (bgImage.height / 2) * scale;
      ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale);

      // 2. Dark Gradient Overlay for text readability
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "rgba(0, 0, 0, 0.45)");
      gradient.addColorStop(0.5, "rgba(0, 0, 0, 0.2)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.9)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 3. Top Header Branding: VaartaNow
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("VaartaNow • ఈరోజు షేర్", 40, 70);

      // Category badge on top right
      ctx.fillStyle = themeColor;
      ctx.beginPath();
      ctx.roundRect(width - 220, 40, 180, 44, 22);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(item.category.toUpperCase(), width - 130, 68);

      // 4. Quote Card Box in Center
      const cardY = 320;
      const cardHeight = 440;
      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.strokeStyle = themeColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(40, cardY, width - 80, cardHeight, 28);
      ctx.fill();
      ctx.stroke();

      // Telugu Quote Text
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.font = "bold 32px 'Segoe UI', system-ui, sans-serif";

      const quoteText = item.quote_te || item.title;
      const words = quoteText.split(" ");
      let line = "";
      let currentY = cardY + 90;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > width - 140 && n > 0) {
          ctx.fillText(line, width / 2, currentY);
          line = words[n] + " ";
          currentY += 48;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, width / 2, currentY);

      // Author / Hashtags
      ctx.fillStyle = "#fbbf24"; // Amber 400
      ctx.font = "bold 22px sans-serif";
      ctx.fillText(`— ${item.author || "VaartaNow"}`, width / 2, currentY + 65);

      // 5. User Personalization Footer Box (Avatar + Name + Business)
      const footerY = height - 220;
      ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
      ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.roundRect(40, footerY, width - 80, 160, 24);
      ctx.fill();
      ctx.shadowBlur = 0; // reset shadow

      // User Avatar Circle
      const avatarSrc = userPhotoUrl || defaultAvatars[0].url;
      const avatarImg = new Image();
      avatarImg.crossOrigin = "anonymous";
      avatarImg.src = avatarSrc;

      const drawUserFooter = () => {
        const avatarSize = 110;
        const avatarX = 75;
        const avatarY = footerY + 25;

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        // Circle Border
        ctx.strokeStyle = themeColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.stroke();

        // User Name text
        ctx.textAlign = "left";
        ctx.fillStyle = "#0f172a"; // Slate 900
        ctx.font = "bold 32px 'Segoe UI', system-ui, sans-serif";
        ctx.fillText(userName || "VaartaNow Member", 210, footerY + 65);

        // Subtitle (Business / Location)
        const subText = [businessName, location].filter(Boolean).join(" • ");
        ctx.fillStyle = "#64748b"; // Slate 500
        ctx.font = "bold 22px sans-serif";
        ctx.fillText(subText || "VaartaNow App • విమర్శ లేకుండా విశేషాలు", 210, footerY + 110);

        // Watermark Footer Note
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Downloaded from VaartaNow Daily Share • Install for Daily Statuses", width / 2, height - 25);

        const dataUrl = canvas.toDataURL("image/png");
        setRenderedDataUrl(dataUrl);
        setRendering(false);
      };

      avatarImg.onload = drawUserFooter;
      avatarImg.onerror = drawUserFooter;
    };
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        renderCanvas();
      }, 200);
    }
  }, [isOpen, userName, businessName, location, userPhotoUrl, themeColor]);

  if (!isOpen) return null;

  // Save to history & trigger download
  const handleDownload = () => {
    if (!renderedDataUrl) return;
    saveUserCreation({
      id: `uc-${Date.now()}`,
      shareItemId: item.id,
      title: item.title,
      category: item.category,
      created_at: new Date().toISOString(),
      renderedDataUrl: renderedDataUrl,
      options: { userName, businessName, location, userPhoto: userPhotoUrl || undefined }
    });

    const link = document.createElement("a");
    link.download = `${item.slug}-personalized-vaartanow.png`;
    link.href = renderedDataUrl;
    link.click();
  };

  // WhatsApp Direct Status Share
  const handleWhatsAppStatus = () => {
    handleDownload();
    const shareMessage = `✨ *${item.title}* ✨\n\n"${item.quote_te || item.title}"\n\n— ${userName}\n\n📲 మరింత సమాచారం మరియు రోజువారీ షేర్స్ కోసం ఇప్పుడే VaartaNow యాప్ పొందండి: ${window.location.origin}/daily-share`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl border-2 border-red-500/40 bg-[hsl(var(--card))] p-4 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="size-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-red-600 dark:text-red-400">
                {lang === "te" ? "మీ పేరు & ఫోటోతో ఈరోజు షేర్ / వాట్సాప్ స్టేటస్! ✏️" : "Create Status with Your Name & Photo ✏️"}
              </h3>
              <p className="text-[11px] font-extrabold text-amber-700 dark:text-amber-300">
                {lang === "te" ? "మీ పేరు మరియు ఫోటోతో ఈ కార్డ్‌ని పర్సనలైజ్ చేయాలనుకుంటున్నారా? కింద మీ వివరాలు ఇవ్వండి:" : "Do you want your Name and Photo on this status card? Enter details below:"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="size-9 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] flex items-center justify-center hover:bg-red-500 hover:text-white transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Main Grid (Form on Left, 9:16 Canvas Preview on Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left Column: Personalization Form */}
          <div className="space-y-4 rounded-2xl border border-red-500/30 bg-gradient-to-br from-amber-500/5 to-red-500/5 p-4">
            <h4 className="text-xs font-black text-[hsl(var(--foreground))] uppercase tracking-wider flex items-center gap-1.5 border-b border-red-500/20 pb-2">
              <User className="size-4 text-red-500" />
              {lang === "te" ? "1. మీ పేరు మరియు ఫోటో వివరాలు" : "1. Enter Name & Photo Details"}
            </h4>

            {/* Photo Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[hsl(var(--foreground))] block">
                📷 {lang === "te" ? "వాట్సాప్ స్టేటస్ కోసం మీ ఫోటో ఎంచుకోండి" : "Select Your Photo for Status"}
              </label>
              
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 text-white text-xs font-black cursor-pointer hover:bg-red-700 active:scale-95 transition shadow-md">
                  <Upload className="size-4" />
                  <span>{lang === "te" ? "గ్యాలరీ ఫోటో" : "Upload Photo"}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>

                <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                  {defaultAvatars.map((av, idx) => (
                    <button
                      key={idx}
                      onClick={() => setUserPhotoUrl(av.url)}
                      className={`size-9 rounded-full overflow-hidden border-2 transition ${
                        userPhotoUrl === av.url ? "border-red-500 ring-2 ring-red-500/40" : "border-[hsl(var(--border))]"
                      }`}
                    >
                      <img src={av.url} alt={av.label} className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-[hsl(var(--foreground))] block">
                {lang === "te" ? "మీ పేరు (Your Name)" : "Your Name"}
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="ఉదా: సాయి కిరణ్"
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Business / Organization Name (Optional) */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-[hsl(var(--foreground))] block flex items-center gap-1">
                <Building className="size-3.5 text-amber-500" />
                <span>{lang === "te" ? "వ్యాపారం / సంస్థ పేరు (ఐచ్ఛికం)" : "Business Name (Optional)"}</span>
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="ఉదా: శ్రీ లక్ష్మి ట్రేడర్స్"
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Location (Optional) */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-[hsl(var(--foreground))] block flex items-center gap-1">
                <MapPin className="size-3.5 text-sky-500" />
                <span>{lang === "te" ? "స్థలం / నగరం (Location)" : "City / Location"}</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="ఉదా: విశాఖపట్నం"
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Theme Accent Color */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-[hsl(var(--foreground))] block">
                {lang === "te" ? "కార్డ్ రంగు సూచిక" : "Card Accent Color"}
              </label>
              <div className="flex gap-2">
                {["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"].map((col) => (
                  <button
                    key={col}
                    onClick={() => setThemeColor(col)}
                    className={`size-7 rounded-full transition border-2 ${
                      themeColor === col ? "border-white ring-2 ring-black dark:ring-white scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Real-time 9:16 Canvas Preview */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="text-xs font-black text-[hsl(var(--muted-foreground))] uppercase tracking-wider flex items-center gap-1">
              <span>9:16 WhatsApp Status Live Preview</span>
            </div>

            {/* Hidden Canvas for Rendering */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Rendered Preview Image */}
            <div className="relative aspect-[9/16] w-full max-w-[260px] rounded-2xl overflow-hidden border-2 border-red-500/40 shadow-xl bg-black flex items-center justify-center">
              {renderedDataUrl ? (
                <img src={renderedDataUrl} alt="Personalized Status Preview" className="size-full object-cover" />
              ) : (
                <div className="p-4 text-center space-y-2 text-white">
                  <div className="size-8 rounded-full border-2 border-white/20 border-t-white animate-spin mx-auto" />
                  <p className="text-xs font-bold">{lang === "te" ? "కార్డ్ డిజైన్ అవుతోంది..." : "Rendering Status Card..."}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 w-full">
              <button
                onClick={handleWhatsAppStatus}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md active:scale-95 transition flex items-center justify-center gap-1.5"
              >
                <Smartphone className="size-4" />
                <span>{lang === "te" ? "వాట్సాప్ స్టేటస్ 🟢" : "WhatsApp Status"}</span>
              </button>

              <button
                onClick={handleDownload}
                className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md active:scale-95 transition flex items-center justify-center gap-1.5"
                title="Download Image File"
              >
                <Download className="size-4" />
                <span>{lang === "te" ? "డౌన్‌లోడ్ ⬇️" : "Download"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
