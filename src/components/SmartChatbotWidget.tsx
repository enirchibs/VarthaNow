import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bot, 
  X, 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  ShoppingBag, 
  Briefcase, 
  FileText, 
  Video, 
  Wrench, 
  Sprout, 
  UtensilsCrossed, 
  HeartPulse, 
  Globe, 
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

  // Default welcome message with quick chip options matching requested format
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: "🌊 నమస్తే! నేను మీ విశాఖ/తెలుగు సహాయకుడిని — ఆంధ్రప్రదేశ్ & తెలంగాణ సమాధానాల సహాయకుడు!\n\nమీరు ఏ పేజీకైనా వెళ్లడానికి క్రింది లింక్‌లపై క్లిక్ చేయండి లేదా గొంతు (Voice) ద్వారా అడగండి!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  // Scroll to bottom of chat automatically
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Voice Speech Recognition Setup (Telugu & English Dual Mode)
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
      recognition.lang = speechLanguage; // te-IN or en-IN
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

    // Intent 1: Jobs / ఉద్యోగాలు
    if (q.includes("job") || q.includes("ఉద్యోగం") || q.includes("ఉద్యోగాలు") || q.includes("నౌకరీ") || q.includes("జాబ్స్") || q.includes("వ్యాపారం")) {
      respondAndNavigate(
        "💼 ఉద్యోగాల పేజీకి తీసుకెళ్తున్నాను... (Navigating to Jobs Hub...)",
        "ఉద్యోగాల హబ్‌కి వెళ్లండి ➔",
        "/jobs"
      );
      return;
    }

    // Intent 2: Buy & Sell / కొనడం అమ్మడం / వస్తువులు
    if (q.includes("market") || q.includes("అమ్మడం") || q.includes("కొనడం") || q.includes("వస్తువులు") || q.includes("మొబైల్") || q.includes("బైక్") || q.includes("ఇల్లు")) {
      respondAndNavigate(
        "🛍️ కొనుగోలు & అమ్మకాల మార్కెట్‌కి తీసుకెళ్తున్నాను... (Navigating to Buy & Sell Market...)",
        "మన మార్కెట్‌కి వెళ్లండి ➔",
        "/market"
      );
      return;
    }

    // Intent 3: Shorts / వైరల్ షార్ట్స్
    if (q.includes("short") || q.includes("షార్ట్స్") || q.includes("వీడియో") || q.includes("వైరల్") || q.includes("reel")) {
      respondAndNavigate(
        "🎥 వైరల్ షార్ట్స్ పేజీకి తీసుకెళ్తున్నాను... (Navigating to Viral Shorts...)",
        "వైరల్ షార్ట్స్ చూడండి ➔",
        "/category/viralshorts"
      );
      return;
    }

    // Intent 4: Local Services / స్థానిక సేవలు
    if (q.includes("service") || q.includes("సేవలు") || q.includes("రిపేర్") || q.includes("ఎలక్ట్రీషియన్") || q.includes("ప్లంబర్") || q.includes("డ్రైవర్")) {
      respondAndNavigate(
        "🔧 స్థానిక సేవల పేజీకి తీసుకెళ్తున్నాను... (Navigating to Local Services...)",
        "స్థానిక సేవలకు వెళ్లండి ➔",
        "/market?cat=services"
      );
      return;
    }

    // Intent 5: Farmers / రైతు మార్కెట్ & పంటలు
    if (q.includes("raitu") || q.includes("రైతు") || q.includes("పంటలు") || q.includes("బియ్యం") || q.includes("పల్లి") || q.includes("వ్యవసాయం")) {
      respondAndNavigate(
        "🌾 రైతు మార్కెట్ & పంటల పేజీకి తీసుకెళ్తున్నాను... (Navigating to Farmer Market...)",
        "రైతు మార్కెట్‌కి వెళ్లండి ➔",
        "/market?cat=agriculture"
      );
      return;
    }

    // Intent 6: Traditional Recipes / సంప్రదాయ వంటలు
    if (q.includes("vantulu") || q.includes("వంటలు") || q.includes("recipe") || q.includes("సంప్రదాయ") || q.includes("ఫుడ్") || q.includes("భక్తి")) {
      respondAndNavigate(
        "🍲 సంప్రదాయ వంటలు & భక్తి పేజీకి తీసుకెళ్తున్నాను... (Navigating to Devotional & Recipes...)",
        "సంప్రదాయ వంటలకు వెళ్లండి ➔",
        "/category/devotional"
      );
      return;
    }

    // Intent 7: Health / ఆరోగ్యం
    if (q.includes("health") || q.includes("ఆరోగ్యం") || q.includes("వైద్యం") || q.includes("డాక్టర్") || q.includes("ఆసుపత్రి")) {
      respondAndNavigate(
        "🏥 ఆరోగ్య పోర్టల్‌కి తీసుకెళ్తున్నాను... (Navigating to Health Portal...)",
        "ఆరోగ్య సమాచారం చూడండి ➔",
        "/health"
      );
      return;
    }

    // Intent 8: News / వార్తలు
    if (q.includes("news") || q.includes("వార్తలు") || q.includes("తాజా") || q.includes("ముఖ్యాంశాలు")) {
      respondAndNavigate(
        "📰 తాజా ముఖ్య వార్తల పేజీకి తీసుకెళ్తున్నాను... (Navigating to Home News...)",
        "తాజా వార్తలకు వెళ్లండి ➔",
        "/"
      );
      return;
    }

    // Fallback general response
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

      // Auto navigate after short delay
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
      {/* 🔴 FLOATING BOTTOM-RIGHT CHATBOT TRIGGER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[9990] flex items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-4 py-3 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/20 cursor-pointer group"
          aria-label="Open Assistant Chat"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="size-6 text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="text-left leading-tight pr-1">
            <span className="block text-xs font-black text-white">మాట్లాడు</span>
            <span className="block text-[9px] text-blue-200 font-bold">Smart Assistant</span>
          </div>
        </button>
      )}

      {/* 💬 FLOATING INTERACTIVE CHATBOT DRAWER WINDOW */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] w-[92vw] sm:w-[380px] h-[520px] max-h-[85vh] rounded-3xl border border-[#1f2937] bg-[#111827] text-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black text-lg">
                🤖
              </div>
              <div>
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  మాట్లాడు (Smart Assistant)
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                </h4>
                <p className="text-[10px] text-blue-100 font-semibold">
                  ఆంధ్రప్రదేశ్ & తెలంగాణ సహాయకుడు
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs no-scrollbar bg-[#030712]/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 shadow-sm ${
                    msg.sender === "user"
                      ? "bg-[#2563eb] text-white rounded-br-none font-bold"
                      : "bg-[#1f2937] text-gray-100 rounded-bl-none font-medium border border-[#374151]"
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {/* Clickable Navigation Link Button inside response */}
                  {msg.linkUrl && (
                    <button
                      onClick={() => navigate(msg.linkUrl!)}
                      className="mt-2 w-full py-2 px-3 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-black transition flex items-center justify-between shadow-sm cursor-pointer"
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

          {/* 🌟 CLICKABLE QUICK CHIP LINKS (త్వరిత లింకులు) matching screenshot format */}
          <div className="bg-[#111827] border-t border-[#1f2937] p-2.5 space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="size-3 text-blue-400" />
                త్వరిత లింకులు (Quick Links):
              </span>

              {/* Speech Language Switcher (Telugu / English) */}
              <button
                onClick={() => setSpeechLanguage((prev) => (prev === "te-IN" ? "en-IN" : "te-IN"))}
                className="text-[9px] font-black bg-[#1f2937] px-2 py-0.5 rounded-full text-gray-300 hover:text-white border border-[#374151]"
              >
                🎙️ {speechLanguage === "te-IN" ? "తెలుగు Mode" : "English Mode"}
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { title: "📰 తాజా వార్తలు", path: "/" },
                { title: "🎥 వైరల్ షార్ట్స్", path: "/category/viralshorts" },
                { title: "💼 ఉద్యోగాలు", path: "/jobs" },
                { title: "🛍️ కొనడం / అమ్మడం", path: "/market" },
                { title: "🌸 మహిళా మార్కెట్", path: "/mahila-market" },
                { title: "🔧 సేవలు & అద్దెకు", path: "/services" },
                { title: "🌾 రైతు మార్కెట్", path: "/market?cat=agriculture" },
                { title: "🍲 సంప్రదాయ వంటలు", path: "/category/devotional" },
                { title: "🏥 ఆరోగ్యం", path: "/health" }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickChipClick(chip.title, chip.path)}
                  className="px-3 py-1.5 rounded-full bg-[#030712] border border-[#1f2937] text-[11px] font-bold text-gray-300 hover:bg-[#2563eb] hover:text-white transition whitespace-nowrap min-h-[32px] flex items-center cursor-pointer active:scale-95"
                >
                  {chip.title}
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
                  ? "వినబడుతోంది... మాట్లాడండి (Listening... Speak now)"
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
