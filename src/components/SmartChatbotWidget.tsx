import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bot, 
  X, 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  ArrowRight
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  linkText?: string;
  linkUrl?: string;
  timestamp: string;
}

export function SmartChatbotWidget() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechLanguage, setSpeechLanguage] = useState<"te-IN" | "en-IN">("te-IN");

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Default welcome message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: "🌊 నమస్తే! నేను మీ విశాఖ/తెలుగు సహాయకుడిని — ఆంధ్రప్రదేశ్ & తెలంగాణ సమాధానాల సహాయకుడు!\n\nమీరు ఏ పేజీకైనా వెళ్లడానికి క్రింది త్వరిత లింక్‌లపై క్లిక్ చేయండి లేదా గొంతు (Voice) ద్వారా అడగండి!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  // Scroll to bottom of chat automatically
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Voice Speech Recognition Setup
  const handleToggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("మీ బ్రౌజర్ వాయిస్ రికగ్నిషన్‌కి మద్దతు ఇవ్వదు. దయచేసి టైప్ చేయండి.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = speechLanguage;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        if (transcript) {
          handleProcessUserQuery(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn("Voice init error:", e);
      setIsListening(false);
    }
  };

  // Natural Language Understanding & Navigation Routing Engine
  const handleProcessUserQuery = (query: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    const q = query.toLowerCase().trim();

    // Intent 1: Jobs
    if (q.includes("job") || q.includes("ఉద్యోగం") || q.includes("ఉద్యోగాలు") || q.includes("నౌకరీ") || q.includes("జాబ్స్")) {
      respondAndNavigate(
        "💼 ఉద్యోగాల పేజీకి తీసుకెళ్తున్నాను... (Navigating to Jobs Hub...)",
        "ఉద్యోగాల హబ్‌కి వెళ్లండి ➔",
        "/jobs"
      );
      return;
    }

    // Intent 2: Buy & Sell Market
    if (q.includes("market") || q.includes("అమ్మడం") || q.includes("కొనడం") || q.includes("వస్తువులు") || q.includes("మొబైల్")) {
      respondAndNavigate(
        "🛍️ కొనుగోలు & అమ్మకాల మార్కెట్‌కి తీసుకెళ్తున్నాను... (Navigating to Buy & Sell Market...)",
        "మన మార్కెట్‌కి వెళ్లండి ➔",
        "/market"
      );
      return;
    }

    // Intent 2.5: Building Materials
    if (q.includes("cement") || q.includes("sand") || q.includes("brick") || q.includes("ఇసుక") || q.includes("సిమెంట్") || q.includes("ఇటుకలు") || q.includes("టైల్స్") || q.includes("హార్డ్‌వేర్") || q.includes("పెయింట్")) {
      respondAndNavigate(
        "🏗️ బిల్డింగ్ & హోమ్ మెటీరియల్స్ పేజీకి తీసుకెళ్తున్నాను... (Navigating to Building Materials...)",
        "బిల్డింగ్ మెటీరియల్స్ వెళ్లండి ➔",
        "/market?cat=building_materials"
      );
      return;
    }

    // Intent 3: Mahila Market
    if (q.includes("mahila") || q.includes("మహిళా") || q.includes("పచ్చళ్ళు") || q.includes("కారం") || q.includes("చీరలు")) {
      respondAndNavigate(
        "🌸 మహిళా మార్కెట్ పేజీకి తీసుకెళ్తున్నాను... (Navigating to Mahila Market...)",
        "మహిళా మార్కెట్‌కి వెళ్లండి ➔",
        "/mahila-market"
      );
      return;
    }

    // Intent 4: Services & Rentals
    if (q.includes("service") || q.includes("సేవలు") || q.includes("అద్దె") || q.includes("ప్లంబర్") || q.includes("ఎలక్ట్రీషియన్") || q.includes("జేసీబీ")) {
      respondAndNavigate(
        "🔧 సేవలు & అద్దె పేజీకి తీసుకెళ్తున్నాను... (Navigating to Services & Rentals...)",
        "సేవలు & అద్దెకు వెళ్లండి ➔",
        "/services"
      );
      return;
    }

    // Intent 5: Raitu Bazar / Agriculture
    if (q.includes("raitu") || q.includes("రైతు") || q.includes("పంటలు") || q.includes("విత్తనాలు") || q.includes("వరి")) {
      respondAndNavigate(
        "🌾 రైతు మార్కెట్ పేజీకి తీసుకెళ్తున్నాను... (Navigating to Raitu Bazar...)",
        "రైతు మార్కెట్‌కి వెళ్లండి ➔",
        "/raitu-bazar"
      );
      return;
    }

    // Intent 6: Shorts
    if (q.includes("short") || q.includes("షార్ట్స్") || q.includes("వీడియో") || q.includes("వైరల్")) {
      respondAndNavigate(
        "🎥 వైరల్ షార్ట్స్ పేజీకి తీసుకెళ్తున్నాను... (Navigating to Viral Shorts...)",
        "వైరల్ షార్ట్స్ చూడండి ➔",
        "/category/viralshorts"
      );
      return;
    }

    // Intent 7: Traditional Recipes
    if (q.includes("vantulu") || q.includes("వంటలు") || q.includes("recipe") || q.includes("సంప్రదాయ")) {
      respondAndNavigate(
        "🍲 సంప్రదాయ వంటలు పేజీకి తీసుకెళ్తున్నాను... (Navigating to Devotional & Recipes...)",
        "సంప్రదాయ వంటలకు వెళ్లండి ➔",
        "/category/devotional"
      );
      return;
    }

    // Intent 8: Health
    if (q.includes("health") || q.includes("ఆరోగ్యం") || q.includes("వైద్యం") || q.includes("డాక్టర్")) {
      respondAndNavigate(
        "🏥 ఆరోగ్య పోర్టల్‌కి తీసుకెళ్తున్నాను... (Navigating to Health Portal...)",
        "ఆరోగ్య సమాచారం చూడండి ➔",
        "/health"
      );
      return;
    }

    // Intent 9: News
    if (q.includes("news") || q.includes("వార్తలు") || q.includes("తాజా")) {
      respondAndNavigate(
        "📰 తాజా ముఖ్య వార్తల పేజీకి తీసుకెళ్తున్నాను... (Navigating to Home News...)",
        "తాజా వార్తలకు వెళ్లండి ➔",
        "/"
      );
      return;
    }

    // Fallback response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: `మీరు '${query}' గురించి అడిగారు. నేరుగా వెళ్లడానికి క్రింది త్వరిత లింక్‌లలో ఒకదానిపై క్లిక్ చేయండి!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }, 400);
  };

  const respondAndNavigate = (replyText: string, linkText: string, targetUrl: string) => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: replyText,
          linkText,
          linkUrl: targetUrl,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);

      setTimeout(() => {
        navigate(targetUrl);
      }, 1000);
    }, 400);
  };

  const handleQuickChipClick = (title: string, path: string) => {
    handleProcessUserQuery(title);
  };

  return (
    <>
      {/* 🔴 FLOATING CHATBOT TRIGGER BUTTON WITH BOUNCE & GLOW MOTION ANIMATION */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[9990] flex items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-4 py-3 shadow-[0_10px_25px_rgba(37,99,235,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/30 cursor-pointer group animate-bounce hover:animate-none"
          aria-label="Open Assistant Chat"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="size-6 text-white group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 size-3 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 size-3 rounded-full bg-emerald-400" />
          </div>
          <div className="text-left leading-tight pr-1">
            <span className="block text-xs font-black text-white tracking-wide">మాట్లాడు</span>
            <span className="block text-[9px] text-blue-200 font-bold">Smart Assistant</span>
          </div>
        </button>
      )}

      {/* 💬 FLOATING INTERACTIVE CHATBOT DRAWER WINDOW WITH MOTION ANIMATION */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] w-[92vw] sm:w-[390px] h-[560px] max-h-[88vh] rounded-3xl border border-[#1f2937] bg-[#111827] text-white shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-6 duration-300 ease-out">
          
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 p-4 flex items-center justify-between shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 size-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2.5 relative z-10">
              <div className="size-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black text-xl shadow-inner animate-pulse">
                🤖
              </div>
              <div>
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  మాట్లాడు (Smart Assistant)
                  <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                </h4>
                <p className="text-[10px] text-blue-100 font-semibold">
                  ఆంధ్రప్రదేశ్ & తెలంగాణ సహాయకుడు
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer relative z-10 hover:scale-110 active:scale-95"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs no-scrollbar bg-[#030712]/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} animate-in fade-in-50 slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 space-y-2 shadow-md ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none font-bold"
                      : "bg-[#1f2937] text-gray-100 rounded-bl-none font-medium border border-[#374151]"
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {/* Clickable Navigation Link Button */}
                  {msg.linkUrl && (
                    <button
                      onClick={() => navigate(msg.linkUrl!)}
                      className="mt-2 w-full py-2.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition flex items-center justify-between shadow-sm cursor-pointer active:scale-95"
                    >
                      <span>{msg.linkText}</span>
                      <ArrowRight className="size-3.5" />
                    </button>
                  )}
                </div>
                <span className="text-[9px] text-gray-400 font-semibold mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            <div ref={chatEndRef} />
          </div>

          {/* ↕️ VERTICAL QUICK CHIP LINKS DISPLAYED VERTICALLY */}
          <div className="bg-[#111827] border-t border-[#1f2937] p-3 space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="size-3 text-blue-400 animate-spin" />
                త్వరిత లింకులు (Quick Links):
              </span>

              {/* Speech Language Switcher */}
              <button
                onClick={() => setSpeechLanguage((prev) => (prev === "te-IN" ? "en-IN" : "te-IN"))}
                className="text-[9px] font-black bg-[#1f2937] px-2.5 py-1 rounded-full text-gray-300 hover:text-white border border-[#374151] transition active:scale-95"
              >
                🎙️ {speechLanguage === "te-IN" ? "తెలుగు Mode" : "English Mode"}
              </button>
            </div>

            {/* ↕️ VERTICAL 2-COLUMN GRID LAYOUT FOR CHATBOT CATEGORIES */}
            <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-gray-700">
              {[
                { title: "📰 తాజా వార్తలు", path: "/" },
                { title: "🎥 వైరల్ షార్ట్స్", path: "/category/viralshorts" },
                { title: "💼 ఉద్యోగాలు", path: "/jobs" },
                { title: "🛍️ కొనడం / అమ్మడం", path: "/market" },
                { title: "🏗️ బిల్డింగ్ మెటీరియల్స్", path: "/market?cat=building_materials" },
                { title: "🌸 మహిళా మార్కెట్", path: "/mahila-market" },
                { title: "🔧 సేవలు & అద్దెకు", path: "/services" },
                { title: "🌾 రైతు మార్కెట్", path: "/raitu-bazar" },
                { title: "🍲 సంప్రదాయ వంటలు", path: "/category/devotional" },
                { title: "🏥 ఆరోగ్యం", path: "/health" }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickChipClick(chip.title, chip.path)}
                  className="w-full text-left px-3 py-2 rounded-xl bg-[#030712] border border-[#1f2937] text-[11px] font-bold text-gray-200 hover:bg-[#2563eb] hover:border-blue-500 hover:text-white transition duration-200 truncate min-h-[36px] flex items-center cursor-pointer active:scale-95 shadow-sm"
                >
                  <span className="truncate">{chip.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Box & Voice Microphone Toolbar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputText.trim()) {
                handleProcessUserQuery(inputText);
              }
            }}
            className="p-3 bg-[#030712] border-t border-[#1f2937] flex items-center gap-2"
          >
            {/* Voice Microphone Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2.5 rounded-full transition cursor-pointer flex items-center justify-center shrink-0 min-h-[40px] min-w-[40px] ${
                isListening
                  ? "bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/50"
                  : "bg-[#1f2937] text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
              title={isListening ? "మాట్లాడటం ఆపండి (Stop Listening)" : "గొంతు ద్వారా మాట్లాడండి (Voice Search in Telugu/English)"}
            >
              {isListening ? <MicOff className="size-4" /> : <Mic className="size-4 text-sky-400" />}
            </button>

            {/* Input Field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isListening
                  ? "వినబడుతోంది... మాట్లాడండి (Listening...)"
                  : "అడగండి (Ask news, jobs, market, recipes)..."
              }
              className="flex-1 rounded-full border border-[#1f2937] bg-[#111827] py-2 px-3.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-full bg-[#2563eb] hover:bg-blue-700 text-white transition disabled:opacity-40 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center active:scale-95 shrink-0"
            >
              <Send className="size-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
