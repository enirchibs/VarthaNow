import React, { useState, useEffect } from "react";
import { ShieldAlert, ShieldCheck, X, AlertTriangle, Home, ExternalLink } from "lucide-react";
import { hasAcknowledgedSafety, setAcknowledgedSafety } from "@/lib/safety-compliance";
import { Link } from "react-router-dom";

interface SafetyNoticeProps {
  category?: string;
  isHighRiskHomeAccess?: boolean;
}

export function CustomerSafetyNotice({ category, isHighRiskHomeAccess }: SafetyNoticeProps) {
  const [acknowledged, setAcknowledged] = useState<boolean>(true);
  const [isTipsOpen, setIsTipsOpen] = useState<boolean>(false);

  useEffect(() => {
    setAcknowledged(hasAcknowledgedSafety());
  }, []);

  const handleAcknowledge = () => {
    setAcknowledgedSafety(true);
    setAcknowledged(true);
  };

  // High-risk categories that involve home entry
  const homeAccessCategories = [
    "workers",
    "electrician",
    "plumber",
    "carpenter",
    "cleaner",
    "appliance_repair",
    "pest_control",
    "construction",
    "care_services"
  ];

  const isHomeAccess = isHighRiskHomeAccess || (category && homeAccessCategories.includes(category));

  if (!acknowledged) {
    return (
      <div className="rounded-2xl border-2 border-amber-500/80 bg-amber-950/40 backdrop-blur-md p-4 sm:p-5 text-amber-100 shadow-xl space-y-3 animate-in fade-in duration-300">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="size-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
              <span>⚠️ ముఖ్యమైన భద్రతా సమాచారం (Important Safety Notice)</span>
            </h4>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              VaartaNow అనేది స్థానిక స్వతంత్ర సేవా ప్రదాతలు, వ్యాపారులు మరియు విక్రేతలను కనుగొనడానికి ఒక డైరెక్టరీ ప్లాట్‌ఫారమ్ మాత్రమే. VaartaNow స్వయంగా సేవలను అందించదు లేదా విక్రేత కాదు.
            </p>
          </div>
        </div>

        <div className="text-[11px] bg-black/40 rounded-xl p-3 space-y-1.5 font-bold text-amber-200/80">
          <p className="font-extrabold text-amber-300">ముందుకు కొనసాగే ముందు జాగ్రత్తలు:</p>
          <ul className="list-disc list-inside space-y-1 ml-1 text-slate-300">
            <li>వ్యక్తి లేదా వ్యాపార గుర్తింపును స్వయంగా ధృవీకరించుకోండి.</li>
            <li>పని పరిధి మరియు ధరను నేరుగా మాట్లాడి ముందుగానే స్పష్టం చేసుకోండి.</li>
            <li>విలువైన వస్తువులు, పత్రాలు మరియు ఆభరణాలను సురక్షితంగా భద్రపరచండి.</li>
            <li><strong className="text-red-400">ఎట్టి పరిస్థితుల్లోనూ OTP, పాస్‌వర్డ్‌లు, PIN లేదా ఆర్థిక వివరాలను పంచుకోవద్దు.</strong></li>
            <li>ముందస్తు చెల్లింపుల (Advance Payments) విషయంలో అప్రమత్తంగా ఉండండి.</li>
            <li>అనుమానాస్పద లేదా అసురక్షిత ప్రవర్తన కనిపిస్తే వెంటనే రిపోర్ట్ చేయండి.</li>
          </ul>
        </div>

        {isHomeAccess && (
          <div className="rounded-xl border border-red-500/50 bg-red-950/50 p-3 text-[11px] text-red-200 flex items-start gap-2">
            <Home className="size-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-red-300 block mb-0.5">🏠 గృహ భద్రత (Home Safety Warning):</strong>
              ఒప్పందం చేసుకున్న పనికి మాత్రమే ప్రవేశం కల్పించండి. విలువైన వస్తువులు మరియు పత్రాలు భద్రపరుచుకోండి. ఏదైనా అనుమానాస్పద చర్య లేదా మోసం జరిగితే పోలీసులను/అధికారులను సంప్రదించండి.
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-1">
          <Link
            to="/safety"
            className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>పూర్తి భద్రతా సూచనలు</span>
            <ExternalLink className="size-3" />
          </Link>

          <button
            onClick={handleAcknowledge}
            className="px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-black text-xs font-black transition cursor-pointer shadow-lg active:scale-95"
          >
            ✓ అర్థమైంది, నేను అంగీకరిస్తున్నాను (I Understand)
          </button>
        </div>
      </div>
    );
  }

  // Compact safety reminder after initial acknowledgment
  return (
    <div className="rounded-xl border border-[#1f2937] bg-[#111827]/80 p-3 text-xs text-gray-300 flex flex-wrap items-center justify-between gap-2 shadow-sm">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
        <span className="text-[11px] font-bold text-gray-300">
          ⚠️ <strong>భద్రతా సూచన:</strong> స్వతంత్ర సేవా ప్రదాత / వ్యాపారి. ముందుకు కొనసాగే ముందు గుర్తింపు & ధరను నేరుగా ధృవీకరించుకోండి.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsTipsOpen(!isTipsOpen)}
          className="text-[11px] font-black text-teal-400 hover:underline cursor-pointer"
        >
          {isTipsOpen ? "సూచనలు దాచు" : "భద్రతా సూచనలు చూడండి (Tips)"}
        </button>
        <Link
          to="/report-abuse"
          className="text-[11px] font-extrabold text-red-400 hover:underline"
        >
          🚨 రిపోర్ట్ చేయండి
        </Link>
      </div>

      {isTipsOpen && (
        <div className="w-full mt-2 pt-2 border-t border-[#1f2937] text-[11px] text-gray-400 space-y-1">
          <p>• ఎవరితోనూ OTP, బ్యాంక్ PIN లేదా పాస్‌వర్డ్ పంచుకోవద్దు.</p>
          <p>• పని పూర్తయిన తర్వాత మాత్రమే సంతృప్తికరంగా చెల్లింపు చేయండి.</p>
          {isHomeAccess && (
            <p className="text-amber-400 font-bold">• ఇంటి మరమ్మతులకు పిలిచినప్పుడు విలువైన వస్తువులను భద్రపరచండి.</p>
          )}
        </div>
      )}
    </div>
  );
}
