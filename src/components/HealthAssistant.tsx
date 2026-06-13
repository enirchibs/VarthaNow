import { useState, useEffect, useRef } from "react";
import { 
  Activity, 
  Search, 
  Send, 
  AlertTriangle, 
  Heart, 
  BookOpen, 
  ShieldAlert, 
  HelpCircle, 
  MessageSquare,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Plus
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  analyzeSymptoms, 
  sendChatMessage, 
  lookupMedicine, 
  getHealthTips, 
  getPopularQuestions,
  type SymptomAnalysisResult, 
  type MedicineInfo, 
  type HealthTip 
} from "@/lib/health-api";

export function HealthAssistant() {
  const { lang: rawLang } = useLanguage();
  const lang = rawLang === "te" ? "te" : "en";
  const [activeTab, setActiveTab] = useState<"symptom" | "medicine" | "chat" | "emergency">("symptom");

  // 🏥 Translations
  const t = {
    disclaimer: {
      te: "⚠️ నిరాకరణ: ఈ AI హెల్త్ అసిస్టెంట్ కేవలం విద్యా సమాచారాన్ని మాత్రమే అందిస్తుంది. ఇది వైద్య నిర్ధారణ లేదా చికిత్సకు ప్రత్యామ్నాయం కాదు. ఏదైనా ఆరోగ్య సమస్య కోసం అర్హత కలిగిన వైద్యుడిని సంప్రదించండి.",
      en: "⚠️ Disclaimer: This AI Health Assistant provides educational information only and does not replace professional medical advice, diagnosis, or treatment. Consult a qualified healthcare professional for medical concerns."
    },
    title: { te: "ఆరోగ్య సహాయకుడు 🩺", en: "AI Health Assistant 🩺" },
    subtitle: { te: "AI-ఆధారిత లక్షణాల విశ్లేషణ, మందుల సమాచారం మరియు ఆరోగ్య చిట్కాలు", en: "AI-Powered Symptom Guidance, Medicine Information & Wellness Tips" },
    tabSymptom: { te: "లక్షణాల విశ్లేషణ", en: "Symptom Checker" },
    tabMedicine: { te: "మందుల సమాచారం", en: "Medicine Lookup" },
    tabChat: { te: "AI చాట్", en: "AI Health Chat" },
    tabEmergency: { te: "అత్యవసర గైడ్ 🚨", en: "Emergency Guide 🚨" }
  };

  return (
    <div className="w-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-md flex flex-col transition duration-300">
      
      {/* ⚠️ Top Sticky Disclaimer */}
      <div className="bg-red-500/10 border-b border-red-500/15 p-3.5 text-center">
        <p className="text-[10px] sm:text-xs font-bold text-red-700 dark:text-red-400 leading-relaxed max-w-4xl mx-auto">
          {lang === "te" ? t.disclaimer.te : t.disclaimer.en}
        </p>
      </div>

      {/* Header section with rich aesthetics */}
      <div className="p-5 border-b border-[hsl(var(--border))]/70 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[hsl(var(--foreground))] flex items-center gap-2">
            <Activity className="size-6 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            {lang === "te" ? t.title.te : t.title.en}
            <span className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-black tracking-wider uppercase">Beta</span>
          </h2>
          <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] mt-1">
            {lang === "te" ? t.subtitle.te : t.subtitle.en}
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-[hsl(var(--border))]/50 bg-[hsl(var(--muted))]/25 overflow-x-auto no-scrollbar scroll-smooth">
        <button
          onClick={() => setActiveTab("symptom")}
          className={`flex-1 py-3.5 px-4 font-black text-xs text-center border-b-2 transition flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === "symptom"
              ? "border-emerald-600 text-emerald-600 bg-emerald-500/[0.02]"
              : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          }`}
        >
          <Activity className="size-4" />
          {lang === "te" ? t.tabSymptom.te : t.tabSymptom.en}
        </button>

        <button
          onClick={() => setActiveTab("medicine")}
          className={`flex-1 py-3.5 px-4 font-black text-xs text-center border-b-2 transition flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === "medicine"
              ? "border-emerald-600 text-emerald-600 bg-emerald-500/[0.02]"
              : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          }`}
        >
          <Search className="size-4" />
          {lang === "te" ? t.tabMedicine.te : t.tabMedicine.en}
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-3.5 px-4 font-black text-xs text-center border-b-2 transition flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === "chat"
              ? "border-emerald-600 text-emerald-600 bg-emerald-500/[0.02]"
              : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          }`}
        >
          <MessageSquare className="size-4" />
          {lang === "te" ? t.tabChat.te : t.tabChat.en}
        </button>

        <button
          onClick={() => setActiveTab("emergency")}
          className={`flex-1 py-3.5 px-4 font-black text-xs text-center border-b-2 transition flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === "emergency"
              ? "border-red-600 text-red-600 bg-red-500/[0.02]"
              : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-red-500"
          }`}
        >
          <ShieldAlert className="size-4 text-red-500" />
          {lang === "te" ? t.tabEmergency.te : t.tabEmergency.en}
        </button>
      </div>

      {/* Main Tab Render Panels */}
      <div className="p-5 min-h-[350px]">
        {activeTab === "symptom" && <SymptomCheckerPanel lang={lang} />}
        {activeTab === "medicine" && <MedicinePanel lang={lang} />}
        {activeTab === "chat" && <ChatPanel lang={lang} />}
        {activeTab === "emergency" && <EmergencyPanel lang={lang} />}
      </div>

      {/* Daily Tips / News summary widget on health home page */}
      <div className="border-t border-[hsl(var(--border))]/70 p-5 bg-[hsl(var(--muted))]/20">
        <HealthFooterWidgets lang={lang} />
      </div>
    </div>
  );
}

// ──────── COMPONENTS ────────

// 🏥 SYMPTOM CHECKER PANEL
function SymptomCheckerPanel({ lang }: { lang: "te" | "en" }) {
  const [symptomsInput, setSymptomsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SymptomAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const suggestedSymptoms = lang === "te" 
    ? ["జ్వరం & దగ్గు", "తీవ్ర తలనొప్పి", "కడుపు నొప్పి", "నీరసం & అలసట"]
    : ["Fever and Cough", "Severe Headache", "Stomach Pain", "Fatigue"];

  const handleAnalyze = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setResult(null);
    try {
      const res = await analyzeSymptoms(text, lang);
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div>
        <h3 className="font-black text-base text-[hsl(var(--foreground))]">
          {lang === "te" ? "🔍 మీ లక్షణాలను విశ్లేషించండి" : "🔍 AI Symptom Checker"}
        </h3>
        <p className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] mt-1 leading-relaxed">
          {lang === "te"
            ? "మీరు ఎదుర్కొంటున్న జ్వరం, దగ్గు లేదా అలసట వంటి సమస్యలను వివరించండి. నివారణలు, అత్యవసర హెచ్చరికలను తెలుసుకోండి."
            : "Briefly explain symptoms like fever, headache, stomach distress. Get general guidance and severity warnings."}
        </p>
      </div>

      {/* Suggested Quick Tags */}
      <div className="flex flex-wrap gap-2">
        {suggestedSymptoms.map((s) => (
          <button
            key={s}
            onClick={() => {
              setSymptomsInput(s);
              handleAnalyze(s);
            }}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-full border border-[hsl(var(--border))] hover:border-emerald-600 bg-[hsl(var(--card))] text-[10px] font-black text-[hsl(var(--muted-foreground))] hover:text-emerald-600 transition"
          >
            + {s}
          </button>
        ))}
      </div>

      {/* Text Area Input */}
      <div className="space-y-2">
        <textarea
          value={symptomsInput}
          onChange={(e) => setSymptomsInput(e.target.value)}
          placeholder={
            lang === "te"
              ? "ఉదాహరణకు: నాకు రెండు రోజులుగా జ్వరం మరియు తలనొప్పి ఉంది..."
              : "Example: I have fever and moderate head pain for 2 days..."
          }
          rows={3}
          className="w-full text-xs font-bold p-3.5 rounded-2xl bg-[hsl(var(--muted))]/40 border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-[hsl(var(--muted-foreground))]/70 leading-relaxed"
        />
        <button
          onClick={() => handleAnalyze(symptomsInput)}
          disabled={loading || !symptomsInput.trim()}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 disabled:dark:bg-neutral-800 disabled:cursor-not-allowed text-white font-black text-xs transition active:scale-[0.99] flex items-center justify-center gap-2 shadow-sm"
        >
          {loading ? (
            <>
              <RefreshCw className="size-4 animate-spin" />
              {lang === "te" ? "విశ్లేషిస్తోంది..." : "Analyzing Symptoms..."}
            </>
          ) : (
            <>
              <Sparkles className="size-4 fill-white" />
              {lang === "te" ? "లక్షణాలను విశ్లేషించండి" : "Analyze Symptoms"}
            </>
          )}
        </button>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-black text-center animate-pulse">
          {errorMsg}
        </div>
      )}

      {/* Result Cards Display */}
      {result && (
        <div className="pt-3 space-y-4 animate-in fade-in duration-300">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-emerald-500/[0.02] p-4">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
              {lang === "te" ? "నమోదైన లక్షణాలు" : "Entered Symptoms"}
            </span>
            <p className="text-xs font-black text-[hsl(var(--foreground))] mt-1">{result.symptoms}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-1 shadow-sm">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider">
                {lang === "te" ? "సాధ్యమయ్యే కారణాలు" : "Possible Causes"}
              </span>
              <p className="text-xs font-bold text-[hsl(var(--foreground))] leading-relaxed whitespace-pre-line">
                {result.possibleCauses}
              </p>
            </div>

            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-1 shadow-sm">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                {lang === "te" ? "ఇంటి చిట్కాలు / స్వీయ సంరక్షణ" : "Self-Care Suggestions"}
              </span>
              <p className="text-xs font-bold text-[hsl(var(--foreground))] leading-relaxed whitespace-pre-line">
                {result.selfCare}
              </p>
            </div>

            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-1 shadow-sm">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">
                {lang === "te" ? "వైద్యుడిని ఎప్పుడు సంప్రదించాలి" : "See Doctor If"}
              </span>
              <p className="text-xs font-bold text-[hsl(var(--foreground))] leading-relaxed whitespace-pre-line">
                {result.seeDoctorIf}
              </p>
            </div>

            <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.02] p-4 space-y-1 shadow-sm">
              <span className="text-[10px] font-black text-red-500 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="size-3.5 text-red-500 animate-bounce" />
                {lang === "te" ? "అత్యవసర హెచ్చరిక" : "Emergency Warning"}
              </span>
              <p className="text-xs font-extrabold text-red-700 dark:text-red-400 leading-relaxed whitespace-pre-line">
                {result.emergencyWarning}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 💊 MEDICINE LOOKUP PANEL
function MedicinePanel({ lang }: { lang: "te" | "en" }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<MedicineInfo | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const defaultMeds = ["Paracetamol", "Dolo 650", "Crocin", "Cetirizine", "Pantoprazole"];

  const handleLookup = async (name: string) => {
    if (!name.trim()) return;
    setLoading(true);
    setResult(null);
    setSearched(true);
    try {
      const res = await lookupMedicine(name);
      setResult(res);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div>
        <h3 className="font-black text-base text-[hsl(var(--foreground))]">
          {lang === "te" ? "💊 మందుల సమాచార శోధన" : "💊 Medicine Information Lookup"}
        </h3>
        <p className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] mt-1 leading-relaxed">
          {lang === "te"
            ? "మందుల ఉపయోగాలు, దుష్ప్రభావాలు, మోతాదులు మరియు హెచ్చరికలను తెలుసుకోవడానికి శోధించండి."
            : "Search the medicine database for common uses, side effects, dosage limits, and drug interactions."}
        </p>
      </div>

      {/* Suggested quick buttons */}
      <div className="flex flex-wrap gap-2">
        {defaultMeds.map((m) => (
          <button
            key={m}
            onClick={() => {
              setQuery(m);
              handleLookup(m);
            }}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-full border border-[hsl(var(--border))] hover:border-emerald-600 bg-[hsl(var(--card))] text-[10px] font-black text-[hsl(var(--muted-foreground))] hover:text-emerald-600 transition"
          >
            🔍 {m}
          </button>
        ))}
      </div>

      {/* Search Input Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={lang === "te" ? "మందుల పేరు రాయండి (ఉదా: Paracetamol)..." : "Enter medicine name..."}
          className="flex-1 text-xs font-bold px-4 py-3 rounded-2xl bg-[hsl(var(--muted))]/40 border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-emerald-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLookup(query);
          }}
        />
        <button
          onClick={() => handleLookup(query)}
          disabled={loading || !query.trim()}
          className="px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition active:scale-[0.99] flex items-center justify-center gap-1.5"
        >
          {loading ? <RefreshCw className="size-4 animate-spin" /> : <Search className="size-4" />}
          {lang === "te" ? "శోధించండి" : "Search"}
        </button>
      </div>

      {/* Search results */}
      {searched && !loading && (
        <div className="pt-2 animate-in fade-in duration-300">
          {result ? (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-sm">
              <div className="bg-emerald-600 px-4 py-3">
                <h4 className="text-white font-black text-sm">{result.name}</h4>
              </div>

              <div className="p-4 space-y-4 text-xs font-bold text-[hsl(var(--foreground))]">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">{lang === "te" ? "ఉపయోగాలు" : "Common Uses"}</span>
                    <p className="text-[hsl(var(--foreground))] leading-relaxed">{result.common_uses}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">{lang === "te" ? "సాధారణ మోతాదు" : "Typical Dosage"}</span>
                    <p className="text-[hsl(var(--foreground))] leading-relaxed">{result.typical_dosage}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-wider">{lang === "te" ? "దుష్ప్రభావాలు (Side Effects)" : "Common Side Effects"}</span>
                    <p className="text-[hsl(var(--foreground))] leading-relaxed">{result.side_effects}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">{lang === "te" ? "ఇతర మందులతో చర్యలు (Interactions)" : "Drug Interactions"}</span>
                    <p className="text-[hsl(var(--foreground))] leading-relaxed">{result.drug_interactions}</p>
                  </div>
                </div>

                <div className="border-t border-[hsl(var(--border))]/70 pt-3.5 space-y-1">
                  <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="size-3.5 text-red-600 dark:text-red-400" />
                    {lang === "te" ? "జాగ్రత్తలు & హెచ్చరికలు" : "Warnings"}
                  </span>
                  <p className="text-[hsl(var(--foreground))] leading-relaxed">{result.warnings}</p>
                </div>

                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/15 text-center text-[10px] font-black text-red-600 dark:text-red-400 mt-2">
                  {lang === "te" 
                    ? "⚠️ గమనిక: ఏదైనా మందులు తీసుకునే ముందు ఎల్లప్పుడూ అర్హత కలిగిన వైద్యుడిని సంప్రదించండి." 
                    : "⚠️ Always consult a qualified doctor before taking any medication."}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 border border-dashed border-[hsl(var(--border))] rounded-2xl text-center text-xs font-bold text-[hsl(var(--muted-foreground))]">
              {lang === "te" 
                ? "❌ ఆ మందుల సమాచారం మా డేటాబేస్ లో కనుగొనబడలేదు. దయచేసి పేరును సరిచూసుకోండి."
                : "❌ Medicine not found in our database. Please double-check the spelling."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 💬 AI CHAT PANEL
function ChatPanel({ lang }: { lang: "te" | "en" }) {
  const [messages, setMessages] = useState<{ role: "user" | "model"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => "session_" + Math.random().toString(36).slice(2, 11));
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const response = await sendChatMessage(
        sessionId,
        userMsg,
        messages.slice(-6), // Send last 6 messages context
        lang
      );
      setMessages((prev) => [...prev, { role: "model", text: response }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: err.message || "Error generating response" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--card))] overflow-hidden flex flex-col h-[400px] shadow-sm">
      
      {/* Disclaimer Header inside Chat */}
      <div className="bg-emerald-600 px-4 py-2.5 flex items-center gap-2">
        <Sparkles className="size-4 text-white fill-white animate-pulse" />
        <span className="text-[11px] font-black text-white uppercase tracking-wider">
          {lang === "te" ? "AI ఆరోగ్య అసిస్టెంట్ చాట్" : "AI Health Assistant Chat"}
        </span>
      </div>

      {/* Message Scroll Frame */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar bg-[hsl(var(--muted))]/10">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-2 px-6">
            <MessageSquare className="size-8 text-emerald-600/30" />
            <p className="text-xs font-black text-[hsl(var(--foreground))]">
              {lang === "te" ? "ఆరోగ్య సహాయకుడితో సంభాషణను ప్రారంభించండి" : "Start your health chat"}
            </p>
            <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] max-w-[280px] leading-relaxed">
              {lang === "te"
                ? "మీకున్న ఆరోగ్య సమస్యలు లేదా లక్షణాలను ఇక్కడ అడిగి తెలుసుకోండి. (ఉదా: 'నాకు దగ్గు మరియు జలుబు ఉంది')"
                : "Ask health-related questions. Informative responses are tailored immediately. (e.g. 'I have throat irritation')"}
            </p>
          </div>
        )}

        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-200`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs font-bold leading-relaxed ${
                m.role === "user"
                  ? "bg-emerald-600 text-white rounded-tr-none"
                  : "bg-[hsl(var(--muted))]/80 text-[hsl(var(--foreground))] rounded-tl-none border border-[hsl(var(--border))]/70 whitespace-pre-line"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[hsl(var(--muted))]/80 text-[hsl(var(--muted-foreground))] rounded-2xl rounded-tl-none p-3 text-xs font-bold border border-[hsl(var(--border))]/70 flex items-center gap-2">
              <RefreshCw className="size-3.5 animate-spin text-emerald-600" />
              <span>{lang === "te" ? "ఆలోచిస్తోంది..." : "Generating..."}</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input controls */}
      <div className="border-t border-[hsl(var(--border))]/70 p-3 bg-[hsl(var(--card))] flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={lang === "te" ? "మీ ప్రశ్న అడగండి..." : "Ask your question..."}
          className="flex-1 text-xs font-bold px-3.5 py-2.5 rounded-xl bg-[hsl(var(--muted))]/40 border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-emerald-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="size-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 disabled:dark:bg-neutral-800 disabled:cursor-not-allowed text-white flex items-center justify-center transition active:scale-95 shadow-sm"
        >
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
}

// 🚨 EMERGENCY GUIDANCE PANEL
function EmergencyPanel({ lang }: { lang: "te" | "en" }) {
  const guides = [
    {
      title: { te: "છાતી నొప్పా? (Chest Pain)", en: "Chest Pain / Heart Attack" },
      color: "bg-red-500",
      actions: {
        te: [
          "వెంబడే అత్యవసర అంబులెన్స్ సేవలకు కాల్ చేయండి.",
          "రోగిని కూర్చోబెట్టి, ప్రశాంతంగా ఉంచండి.",
          "వైద్యుల సూచన లేకుండా ఎలాంటి మందులు ఇవ్వకండి.",
          "శ్వాస మరియు స్పృహను గమనిస్తూ ఉండండి."
        ],
        en: [
          "Call emergency services immediately.",
          "Have the person sit down and rest in a comfortable position.",
          "Loosen any tight clothing.",
          "Monitor breathing and responsiveness."
        ]
      }
    },
    {
      title: { te: "పక్షవాతం లక్షణాలు (Stroke)", en: "Stroke Symptoms (FAST)" },
      color: "bg-orange-500",
      actions: {
        te: [
          "FAST పద్ధతిని గుర్తుంచుకోండి: ముఖం వాలడం (Face), చేతులు బలహీనపడడం (Arm), మాట్లాడటం కష్టమవ్వడం (Speech), సమయం ముఖ్యం (Time).",
          "లక్షణాలు కనిపించిన వెంటనే ఆసుపత్రికి తరలించండి.",
          "రోగికి ఆహారం లేదా నీరు ఇవ్వకండి (మింగడం కష్టంగా ఉండవచ్చు)."
        ],
        en: [
          "Remember FAST: Face drooping, Arm weakness, Speech difficulty, Time to call emergency.",
          "Note the time when the first symptoms appeared.",
          "Do not give them food or drink as swallowing may be impaired."
        ]
      }
    },
    {
      title: { te: "తీవ్ర అలర్జీ చర్యలు (Allergic Reaction)", en: "Severe Allergic Reaction (Anaphylaxis)" },
      color: "bg-amber-500",
      actions: {
        te: [
          "రోగి దగ్గర ఎపినెఫ్రిన్ ఆటో-ఇంజెక్టర్ (EpiPen) ఉంటే ఉపయోగించండి.",
          "వెల్లకిలా పడుకోబెట్టి, కాళ్లు కొద్దిగా పైకి లేపి ఉంచండి.",
          "వెంటనే అత్యవసర చికిత్స విభాగంతో సంప్రదించండి."
        ],
        en: [
          "If the person has an epinephrine auto-injector (EpiPen), use it immediately.",
          "Lay the person flat and raise their feet about 12 inches.",
          "Seek emergency medical help right away."
        ]
      }
    }
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="p-4 bg-red-500/10 border-2 border-red-500/25 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="size-6 text-red-600 dark:text-red-500 shrink-0 mt-0.5 animate-bounce" />
        <div>
          <h4 className="text-red-700 dark:text-red-400 text-sm font-black uppercase tracking-wider">
            {lang === "te" ? "⚠️ అత్యవసర హెచ్చరిక" : "⚠️ Emergency Warning"}
          </h4>
          <p className="text-xs font-bold text-red-600 dark:text-red-400/80 mt-1 leading-relaxed">
            {lang === "te"
              ? "కింది లక్షణాలు కనిపించినప్పుడు ఆలస్యం చేయకుండా వెంటనే అత్యవసర వైద్య సేవలను సంప్రదించండి లేదా సమీపంలోని అత్యవసర విభాగానికి తరలించండి."
              : "For life-threatening symptoms, do not use this AI module. Call emergency services immediately."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 pt-2">
        {guides.map((g, idx) => (
          <div key={idx} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-sm flex flex-col">
            <div className={`${g.color} px-4 py-2.5`}>
              <h5 className="text-white font-black text-xs">{lang === "te" ? g.title.te : g.title.en}</h5>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <ul className="space-y-2 text-[10px] font-bold text-[hsl(var(--foreground))] leading-relaxed flex-1">
                {(lang === "te" ? g.actions.te : g.actions.en).map((action, actionIdx) => (
                  <li key={actionIdx} className="flex gap-1.5 items-start">
                    <ChevronRight className="size-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────── FOOTER WIDGETS (TIPS & FAQS) ────────
function HealthFooterWidgets({ lang }: { lang: "te" | "en" }) {
  const [tips, setTips] = useState<HealthTip[]>([]);
  const [activeTipIdx, setActiveTipIdx] = useState(0);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const list = await getHealthTips(lang);
        setTips(list);
        const faqList = await getPopularQuestions();
        setFaqs(faqList);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, [lang]);

  const activeTip = tips[activeTipIdx];

  const handleNextTip = () => {
    if (tips.length > 0) {
      setActiveTipIdx((prev) => (prev + 1) % tips.length);
    }
  };

  return (
    <div className="grid gap-5 md:grid-cols-2 max-w-4xl mx-auto text-xs font-bold">
      
      {/* Dynamic Health Tip Container */}
      <div className="rounded-2xl border border-[hsl(var(--border))]/70 bg-[hsl(var(--card))] p-4 shadow-sm space-y-3 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="size-4 text-emerald-600 fill-emerald-500/20" />
              {activeTip?.tip_type === "seasonal" 
                ? (lang === "te" ? "ఋతు సంబంధిత చిట్కా" : "Seasonal Alert")
                : activeTip?.tip_type === "weekly"
                ? (lang === "te" ? "వారపు వెల్నెస్ చిట్కా" : "Weekly Wellness")
                : (lang === "te" ? "నేటి ఆరోగ్య చిట్కా" : "Daily Health Tip")}
            </span>
          </div>
          {activeTip ? (
            <div className="space-y-1.5">
              <h5 className="font-black text-[hsl(var(--foreground))]">{activeTip.title}</h5>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))] leading-relaxed">
                {activeTip.content}
              </p>
            </div>
          ) : (
            <p className="text-[11px] italic text-[hsl(var(--muted-foreground))] leading-relaxed">
              {lang === "te" ? "చిట్కాలు లోడ్ అవుతున్నాయి..." : "Loading tips..."}
            </p>
          )}
        </div>

        {tips.length > 1 && (
          <button
            onClick={handleNextTip}
            className="w-full mt-3 py-2 border border-[hsl(var(--border))] rounded-xl text-[10px] font-black hover:border-emerald-600 hover:text-emerald-600 bg-[hsl(var(--card))] transition"
          >
            {lang === "te" ? "మరొక చిట్కా చూడండి" : "Next Tip"}
          </button>
        )}
      </div>

      {/* FAQs Panel */}
      <div className="rounded-2xl border border-[hsl(var(--border))]/70 bg-[hsl(var(--card))] p-4 shadow-sm space-y-3">
        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="size-4 text-emerald-600" />
          {lang === "te" ? "ప్రజలు ఎక్కువగా అడిగే ప్రశ్నలు" : "Popular Health FAQs"}
        </span>

        {faqs.length > 0 ? (
          <div className="space-y-2">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="flex items-center gap-2 border-b border-[hsl(var(--border))]/40 pb-2 last:border-0 last:pb-0 text-[11px] font-semibold text-[hsl(var(--muted-foreground))]"
              >
                <ChevronRight className="size-3.5 text-emerald-600 shrink-0" />
                <span className="truncate max-w-[280px]">{faq.question}</span>
                <span className="text-[8px] ml-auto bg-[hsl(var(--muted))] px-1.5 py-0.5 rounded text-neutral-500 font-extrabold uppercase shrink-0">
                  {faq.view_count || 1} views
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2 border-b border-[hsl(var(--border))]/40 pb-2 text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
              <ChevronRight className="size-3.5 text-emerald-600 shrink-0" />
              <span>{lang === "te" ? "జలుబుకు ఉత్తమ హోమ్ కేర్ నివారణలేంటి?" : "What are the best home-care remedies for cold?"}</span>
            </div>
            <div className="flex gap-2 border-b border-[hsl(var(--border))]/40 pb-2 text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
              <ChevronRight className="size-3.5 text-emerald-600 shrink-0" />
              <span>{lang === "te" ? "మైగ్రేన్ తలనొప్పికి కారణాలు ఏవి?" : "What are common migraine triggers?"}</span>
            </div>
            <div className="flex gap-2 border-b border-[hsl(var(--border))]/40 pb-2 text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
              <ChevronRight className="size-3.5 text-emerald-600 shrink-0" />
              <span>{lang === "te" ? "డీహైడ్రేషన్ లక్షణాలను ఎలా గుర్తించాలి?" : "How to identify signs of dehydration?"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
