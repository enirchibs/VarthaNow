import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  ArrowLeft, 
  Sparkles, 
  Check, 
  RefreshCw,
  Utensils,
  Briefcase,
  Plane,
  Car,
  ShoppingBag,
  Star,
  Award,
  Bot
} from "lucide-react";
import { 
  UserLearningProfile, 
  TargetLanguage, 
  PRESET_ROLEPLAYS, 
  RoleplayScenario,
  evaluateSpeakingResponse,
  EvaluationResult,
  updateStreakAndXP
} from "@/lib/tutor-api";
import { speechService } from "@/lib/speech-service";

interface SpeakingPracticeViewProps {
  language: TargetLanguage;
  profile: UserLearningProfile;
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  evaluation?: EvaluationResult;
}

export function SpeakingPracticeView({ language, profile, onBack }: SpeakingPracticeViewProps) {
  const [selectedRoleplay, setSelectedRoleplay] = useState<RoleplayScenario | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [latestScore, setLatestScore] = useState<EvaluationResult["score"] | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial AI Greeting
    const greetingText = selectedRoleplay
      ? selectedRoleplay.initial_greeting
      : language === "english"
      ? "Good morning! I am your AI practice partner. How was your day today?"
      : "नमस्ते! मैं आपका अभ्यास साथी हूँ। आज आपका दिन कैसा रहा?";

    setMessages([
      {
        id: "msg_init",
        role: "model",
        text: greetingText
      }
    ]);
  }, [selectedRoleplay, language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isProcessing) return;

    const userMsgId = `usr_${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      { id: userMsgId, role: "user", text: textToSend.trim() }
    ];

    setMessages(newMessages);
    setInputText("");
    setIsProcessing(true);

    try {
      const historyForAI = newMessages.map((m) => ({
        role: m.role,
        text: m.text
      }));

      const evalResult = await evaluateSpeakingResponse(textToSend.trim(), historyForAI, language);

      const aiMsgId = `ai_${Date.now()}`;
      setMessages([
        ...newMessages,
        {
          id: aiMsgId,
          role: "model",
          text: evalResult.next_question,
          evaluation: evalResult
        }
      ]);

      setLatestScore(evalResult.score);
      updateStreakAndXP(20);

      // Play AI response voice
      speechService.speak(evalResult.next_question, language === "english" ? "en-US" : "hi-IN");

    } catch (err) {
      console.error("AI Speaking Practice error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleMic = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    speechService.startListening(
      language === "english" ? "en-US" : "hi-IN",
      (res) => {
        setInputText(res.transcript);
        if (res.isFinal) {
          setIsListening(false);
          handleSendMessage(res.transcript);
        }
      },
      (err) => {
        setIsListening(false);
        console.warn("Mic error:", err);
      },
      () => setIsListening(false)
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-xs font-bold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
        >
          <ArrowLeft className="size-4" />
          <span>వెనుకకు (Dashboard)</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xl">{language === "english" ? "🇬🇧" : "🇮🇳"}</span>
          <span className="text-sm font-black text-[hsl(var(--foreground))]">
            🎤 Speaking Practice ({language === "english" ? "English" : "Hindi"})
          </span>
        </div>
      </div>

      {/* ROLEPLAY SELECTOR STRIP */}
      <div className="rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-[hsl(var(--foreground))] flex items-center gap-1.5">
            <Sparkles className="size-4 text-amber-500" />
            సంభాషణ సందర్భం (Select Scenario / Role-Play):
          </h4>
          {selectedRoleplay && (
            <button
              onClick={() => setSelectedRoleplay(null)}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              సాధారణ చాట్ (General)
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PRESET_ROLEPLAYS.filter((r) => r.language === language).map((rp) => (
            <button
              key={rp.id}
              onClick={() => setSelectedRoleplay(rp)}
              className={`rounded-2xl px-3.5 py-2 text-xs font-extrabold whitespace-nowrap transition flex items-center gap-2 border ${
                selectedRoleplay?.id === rp.id
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-[hsl(var(--muted))]/50 border-[hsl(var(--border))] text-[hsl(var(--foreground))]"
              }`}
            >
              <span>{rp.title_te.split(" ")[0]}</span>
              <span>{rp.title_en}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CHAT & EVALUATION DISPLAY */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* CHAT MESSAGES PANEL (2 COLS) */}
        <div className="lg:col-span-2 flex flex-col rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] h-[65vh] shadow-xl overflow-hidden">
          
          {/* Scenario Banner */}
          <div className="p-4 bg-[hsl(var(--muted))]/60 border-b border-[hsl(var(--border))]/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bot className="size-5 text-blue-600" />
              <div>
                <h4 className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                  {selectedRoleplay ? selectedRoleplay.title_en : "AI Conversation Partner"}
                </h4>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                  {selectedRoleplay ? `AI: ${selectedRoleplay.ai_role}` : "Patient & encouraging tutor"}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-full">
              🎤 Voice & Speech Active
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                <div className={`flex items-start gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "model" && (
                    <div className="size-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-1">
                      AI
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-4 space-y-2 text-xs font-semibold shadow-xs ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))]/60 rounded-tl-none"
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>

                    {msg.role === "model" && (
                      <button
                        onClick={() => speechService.speak(msg.text, language === "english" ? "en-US" : "hi-IN")}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1"
                      >
                        <Volume2 className="size-3.5" />
                        <span>వినండి (Listen)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* TELUGU CORRECTION FEEDBACK CARD IF ERROR FOUND */}
                {msg.evaluation && msg.evaluation.has_error && (
                  <div className="ml-10 max-w-[85%] rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3.5 space-y-2 text-xs animate-in zoom-in-95">
                    <div className="flex items-center gap-1.5 font-black text-amber-700 dark:text-amber-300">
                      <span>💡 చిన్న Correction (Polite Telugu Note):</span>
                    </div>

                    <div className="space-y-1 text-[11px] font-semibold text-[hsl(var(--foreground))]">
                      {msg.evaluation.wrong && (
                        <p className="text-red-600 dark:text-red-400">❌ ప్రయత్నం: "{msg.evaluation.wrong}"</p>
                      )}
                      {msg.evaluation.correct && (
                        <p className="text-emerald-600 dark:text-emerald-400 font-extrabold">✅ మెరుగైన రూపం: "{msg.evaluation.correct}"</p>
                      )}
                      <p className="text-[hsl(var(--muted-foreground))] italic leading-relaxed">
                        తెలుగులో: {msg.evaluation.telugu_explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT CONTROL BAR */}
          <div className="p-3 border-t border-[hsl(var(--border))]/60 bg-[hsl(var(--card))] flex items-center gap-2">
            <button
              onClick={handleToggleMic}
              className={`size-12 rounded-full flex items-center justify-center shrink-0 shadow-md transition ${
                isListening
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isListening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputText)}
              placeholder={isListening ? "వింటున్నాము... (Listening...)" : "మాట్లాడండి లేదా ఇక్కడ టైప్ చేయండి..."}
              className="flex-1 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] py-3 px-4 text-xs font-semibold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim() || isProcessing}
              className="size-11 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 disabled:opacity-40"
            >
              <Send className="size-4.5" />
            </button>
          </div>

        </div>

        {/* SPEAKING SCORE & FEEDBACK CARD (1 COL) */}
        <div className="space-y-4">
          <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-[hsl(var(--border))]/60 pb-3">
              <Award className="size-5 text-amber-500" />
              <h3 className="text-base font-black text-[hsl(var(--foreground))]">
                🎤 Speaking Score Card
              </h3>
            </div>

            {latestScore ? (
              <div className="space-y-4">
                <div className="text-center bg-gradient-to-r from-amber-500/10 to-blue-500/10 p-4 rounded-2xl border border-amber-500/20">
                  <span className="text-3xl font-black text-amber-500">
                    ⭐ {latestScore.overall}%
                  </span>
                  <p className="text-xs font-extrabold text-[hsl(var(--foreground))] mt-1">
                    మొత్తం స్కోర్ (Overall Confidence)
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Grammar (వ్యాకరణం)", val: latestScore.grammar, color: "bg-blue-600" },
                    { label: "Vocabulary (పదజాలం)", val: latestScore.vocabulary, color: "bg-purple-600" },
                    { label: "Fluency (వేగం & ప్రవాహం)", val: latestScore.fluency, color: "bg-emerald-600" },
                    { label: "Pronunciation (ఉచ్చారణ)", val: latestScore.pronunciation, color: "bg-amber-600" }
                  ].map((stat) => (
                    <div key={stat.label} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-extrabold text-[hsl(var(--foreground))]">
                        <span>{stat.label}</span>
                        <span>{stat.val}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                        <div className={`h-full ${stat.color} rounded-full`} style={{ width: `${stat.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center p-6 space-y-2 text-[hsl(var(--muted-foreground))]">
                <Mic className="size-8 mx-auto text-blue-500/50" />
                <p className="text-xs font-semibold">
                  మొదటి వాక్యం మాట్లాడిన తర్వాత మీ స్కోర్ కార్డ్ ఇక్కడ కనిపిస్తుంది.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
