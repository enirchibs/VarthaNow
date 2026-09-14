import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, FileText, CheckCircle2, Mail, Download, ExternalLink, ArrowLeft, AlertCircle } from "lucide-react";
import { getStoredTermsAcceptances, getStoredSafetyProfile, TermsAcceptanceRecord } from "@/lib/safety-compliance";

export function LegalAgreementsPage() {
  const profile = getStoredSafetyProfile();
  const acceptances = getStoredTermsAcceptances();
  const [selectedRecord, setSelectedRecord] = useState<TermsAcceptanceRecord | null>(null);
  const [emailSentNotice, setEmailSentNotice] = useState<string>("");

  const handleEmailCopy = (record: TermsAcceptanceRecord) => {
    if (record.email) {
      setEmailSentNotice(`ఒప్పందం కాపీ ${record.email} కు విజయవంతంగా పంపబడింది.`);
      setTimeout(() => setEmailSentNotice(""), 4000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="container-shell py-8 max-w-4xl space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-2">
        <Link to="/services" className="text-xs font-bold text-teal-500 hover:underline flex items-center gap-1">
          <ArrowLeft className="size-3.5" />
          <span>సేవలకు తిరిగి వెళ్ళండి (Back to Services)</span>
        </Link>
      </div>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 text-white space-y-6 shadow-2xl">
        <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <ShieldCheck className="size-7 text-emerald-400" />
              <span>చట్టపరమైన ఒప్పందాలు (Legal & Agreements)</span>
            </h1>
            <p className="text-xs text-slate-400">
              VaartaNow ప్లాట్‌ఫారమ్‌లో మీరు అంగీకరించిన నిబంధనలు మరియు డిక్లరేషన్ల రికార్డులు.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800">
              మొబైల్: {profile?.mobile_verified ? "✅ Verified" : "⚪ Pending"}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-800 text-slate-300 border border-slate-700">
              ఈమెయిల్: {profile?.email ? "✅ Verified" : "⚪ Not Provided"}
            </span>
          </div>
        </div>

        {emailSentNotice && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs font-bold text-emerald-300 text-center">
            ✓ {emailSentNotice}
          </div>
        )}

        {acceptances.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-slate-800 bg-slate-950/50 space-y-2">
            <FileText className="size-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-400">ఇంతవరకు ఎలాంటి ఒప్పందాలు అంగీకరించబడలేదు.</p>
            <p className="text-xs text-slate-500">మీరు సర్వీస్ లేదా లిస్టింగ్‌ను పోస్ట్ చేసినప్పుడు ఒప్పందం ఇక్కడ స్వయంచాలకంగా కనిపిస్తుంది.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {acceptances.map((rec) => (
              <div
                key={rec.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-3 hover:border-slate-700 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                    <div>
                      <h3 className="text-sm font-black text-white">
                        {rec.terms_type === "provider_terms"
                          ? "సర్వీస్ ప్రొవైడర్ నిబంధనలు (Service Provider Terms & Code of Conduct)"
                          : "విక్రేత నిబంధనలు (Seller Terms)"}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        వెర్షన్: <strong className="text-teal-400">{rec.terms_version}</strong> • అంగీకరించిన సమయం: {new Date(rec.accepted_at).toLocaleString("te-IN")}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-800">
                    ✅ అంగీకరించబడింది (Accepted)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 pt-1">
                  <div>
                    <span className="block text-slate-500">మొబైల్:</span>
                    <strong className="text-white">+91 {rec.mobile_number} ✅</strong>
                  </div>
                  <div>
                    <span className="block text-slate-500">ఈమెయిల్:</span>
                    <strong className="text-white">{rec.email || "⚪ Not Provided"}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-500">పద్ధతి:</span>
                    <strong className="text-white">{rec.acceptance_method}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-500">రిఫరెన్స్ ID:</span>
                    <strong className="text-slate-300 font-mono">{rec.id.slice(0, 8)}...</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => setSelectedRecord(rec)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="size-3.5" />
                    <span>ఒప్పంద పత్రం చూడండి (View Terms)</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="size-3.5" />
                    <span>డౌన్‌లోడ్ / ప్రింట్ (Print)</span>
                  </button>

                  {rec.email ? (
                    <button
                      onClick={() => handleEmailCopy(rec)}
                      className="px-3.5 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Mail className="size-3.5" />
                      <span>ఈమెయిల్ కాపీ (Email Copy)</span>
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Selected Terms Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-6 text-white space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-black text-lg text-white">
                  అంగీకరించిన పత్రం వివరాలు ({selectedRecord.terms_version})
                </h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold"
                >
                  ✕ మూసివేయి
                </button>
              </div>

              <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
                <p className="font-bold text-teal-300">సేవా ప్రదాత / విక్రేత డిక్లరేషన్ (Provider Declaration Snapshot):</p>
                <div className="bg-black/50 p-4 rounded-xl border border-slate-800 space-y-2 text-[11px]">
                  <p>• "నేను స్వతంత్రంగా నా సేవ లేదా వ్యాపారాన్ని VaartaNow లో లిస్ట్ చేస్తున్నాను."</p>
                  <p>• "నేను సమర్పించిన సమాచారం నిజమైనదని మరియు ఖచ్చితమైనదని ధృవీకరిస్తున్నాను."</p>
                  <p>• "VaartaNow అనేది ఒక డిస్కవరీ/లిస్టింగ్ ప్లాట్‌ఫారమ్ మాత్రమేనని, లావాదేవీలో యజమాని లేదా మధ్యవర్తి కాదని నేను అర్థం చేసుకున్నాను."</p>
                  <p>• "నా ప్రవర్తన, సేవలు, ఉద్యోగులు/సహాయకులు మరియు వర్తించే చట్టాలకు నేనే పూర్తి బాధ్యత వహిస్తాను."</p>
                  <p>• "మోసం, దొంగతనం, వేధింపులు లేదా అనధికారిక ప్రవేశం వంటి చట్టవిరుద్ధమైన పనులకు పాల్పడను."</p>
                  <p>• "కస్టమర్ల అనుమతి లేకుండా వారి వస్తువులు, పాస్‌వర్డ్‌లు లేదా సమాచారాన్ని దుర్వినియోగం చేయను."</p>
                  <p>• "VaartaNow సర్వీస్ ప్రొవైడర్ నిబంధనలు మరియు ప్రవర్తనా నియమావళికి కట్టుబడి ఉంటాను."</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800 text-[11px] space-y-1">
                  <p><strong>డిజిటల్ రికార్డు హ్యాష్:</strong> <span className="font-mono text-teal-400">{selectedRecord.terms_hash}</span></p>
                  <p><strong>అంగీకరించిన తేదీ:</strong> {new Date(selectedRecord.accepted_at).toString()}</p>
                  <p><strong>ధృవీకరించబడిన మొబైల్:</strong> +91 {selectedRecord.mobile_number}</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </section>
    </main>
  );
}
