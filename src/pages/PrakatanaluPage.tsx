import React, { useState } from "react";
import { Megaphone, PlusCircle, FileText, AlertCircle, Briefcase, Smartphone, Car, Home, Sprout, Wrench, MapPin } from "lucide-react";
import { CreatePostModal } from "@/components/CreatePostModal";

export function PrakatanaluPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="container-shell py-6 space-y-6">
      {/* Header */}
      <div className="rounded-[1.8rem] bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2 max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-black backdrop-blur-md">
            <Megaphone className="size-3.5" />
            స్థానిక ప్రకటనలు & విజ్ఞప్తులు
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight">
            ప్రకటనలు (Local Ads & Complaints)
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-amber-100 leading-relaxed">
            మీ ఏరియాలో వార్తలు, డ్రైనేజీ/రోడ్డు ఫిర్యాదులు, ఉద్యోగ నోటిఫికేషన్లు మరియు మీ బిజినెస్ ఉచిత ప్రకటనలను పోస్ట్ చేయండి!
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-white text-orange-600 hover:bg-orange-50 px-5 py-3 text-xs sm:text-sm font-black transition-all shadow-lg active:scale-95 cursor-pointer"
        >
          <PlusCircle className="size-5" />
          + ఉచితంగా పోస్ట్ చేయండి
        </button>
      </div>

      {/* Directory Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div 
          onClick={() => setIsModalOpen(true)}
          className="p-5 rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-orange-500/10 hover:border-orange-500/30 transition-all cursor-pointer space-y-3 group"
        >
          <div className="size-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-black">
            <AlertCircle className="size-6" />
          </div>
          <h3 className="text-base font-extrabold text-[hsl(var(--foreground))] group-hover:text-orange-600 transition-colors">
            ✊ 1. ఫిర్యాదు పోస్ట్ చేయండి
          </h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            రోడ్లు, డ్రైనేజీ, కరెంట్ సమస్యలను అధికారుల దృష్టికి తీసుకెళ్లండి.
          </p>
        </div>

        <div 
          onClick={() => setIsModalOpen(true)}
          className="p-5 rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-sky-500/10 hover:border-sky-500/30 transition-all cursor-pointer space-y-3 group"
        >
          <div className="size-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-black">
            <Briefcase className="size-6" />
          </div>
          <h3 className="text-base font-extrabold text-[hsl(var(--foreground))] group-hover:text-sky-600 transition-colors">
            💼 2. ఉద్యోగాలు పోస్ట్ చేయండి
          </h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            ఉద్యోగాలు వెతకండి లేదా మీ దగ్గర జాబ్స్ ఉంటే పోస్ట్ చేసి నిరుద్యోగులకు సహాయపడండి.
          </p>
        </div>

        <div 
          onClick={() => setIsModalOpen(true)}
          className="p-5 rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-blue-500/10 hover:border-blue-500/30 transition-all cursor-pointer space-y-3 group"
        >
          <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-black">
            <FileText className="size-6" />
          </div>
          <h3 className="text-base font-extrabold text-[hsl(var(--foreground))] group-hover:text-blue-600 transition-colors">
            📰 3. వార్తలు పోస్ట్ చేయండి
          </h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            సమాజానికి దోహదపడండి, మీ ఏరియా తాజా వార్తలను పంచుకోండి.
          </p>
        </div>

        <div 
          onClick={() => setIsModalOpen(true)}
          className="p-5 rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-amber-500/10 hover:border-amber-500/30 transition-all cursor-pointer space-y-3 group"
        >
          <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
            <Smartphone className="size-6" />
          </div>
          <h3 className="text-base font-extrabold text-[hsl(var(--foreground))] group-hover:text-amber-600 transition-colors">
            📱 4. మీ వస్తువులు అమ్మండి / కొనండి
          </h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            మొబైల్స్, బైక్స్, ల్యాప్‌టాప్, ఇల్లు స్థానికంగా అమ్మండి లేదా కొనండి.
          </p>
        </div>
      </div>

      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
