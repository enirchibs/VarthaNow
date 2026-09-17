import React, { useState, useEffect, useRef, useCallback } from "react";
import { Keyboard, Check, X, Sparkles, Globe } from "lucide-react";
import { 
  isTeluguTypingActive, 
  setTeluguTypingActive, 
  TELUGU_TYPING_EVENT, 
  fetchTeluguTransliteration, 
  offlinePhoneticTelugu,
  replaceWordInInput, 
  isEligibleInput 
} from "@/lib/telugu-typing";

interface SuggestionBoxState {
  visible: boolean;
  x: number;
  y: number;
  word: string;
  candidates: string[];
  selectedIndex: number;
  inputEl: HTMLInputElement | HTMLTextAreaElement | null;
}

export const TeluguTypingWidget: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(isTeluguTypingActive);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [suggestionState, setSuggestionState] = useState<SuggestionBoxState>({
    visible: false,
    x: 0,
    y: 0,
    word: "",
    candidates: [],
    selectedIndex: 0,
    inputEl: null
  });

  const lastConvertedRef = useRef<{
    el: HTMLInputElement | HTMLTextAreaElement;
    english: string;
    telugu: string;
    endPos: number;
  } | null>(null);

  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prefetchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state with storage / external toggle events
  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setIsEnabled(customEvent.detail);
      showToast(
        customEvent.detail 
          ? "తెలుగు టైపింగ్ ఆన్ చేయబడింది (Telugu Typing ON)" 
          : "ఇంగ్లీష్ టైపింగ్ (English Typing ON)"
      );
    };

    window.addEventListener(TELUGU_TYPING_EVENT, handleToggle);
    return () => window.removeEventListener(TELUGU_TYPING_EVENT, handleToggle);
  }, []);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const toggleTyping = useCallback(() => {
    const next = !isEnabled;
    setIsEnabled(next);
    setTeluguTypingActive(next);
  }, [isEnabled]);

  // Extract the English word currently being typed immediately behind the cursor
  const extractCurrentWord = (el: HTMLInputElement | HTMLTextAreaElement) => {
    const text = el.value;
    const cursorPos = el.selectionStart || 0;

    // Search backwards from cursor for word boundary (space, newline, punctuation)
    let startPos = cursorPos;
    while (startPos > 0 && /[a-zA-Z]/.test(text[startPos - 1])) {
      startPos--;
    }

    const word = text.substring(startPos, cursorPos);
    return { word, startPos, endPos: cursorPos };
  };

  // Replace active token with selected candidate
  const applyCandidate = useCallback((candidate: string, addTrailingSpace = true) => {
    const { inputEl, word } = suggestionState;
    if (!inputEl || !word) return;

    const cursorPos = inputEl.selectionStart || 0;
    const replacement = candidate + (addTrailingSpace ? " " : "");

    replaceWordInInput(inputEl, word, replacement, cursorPos);

    lastConvertedRef.current = {
      el: inputEl,
      english: word,
      telugu: candidate,
      endPos: cursorPos - word.length + replacement.length
    };

    setSuggestionState((prev) => ({ ...prev, visible: false, word: "", candidates: [] }));
  }, [suggestionState]);

  // Global KeyDown & Input Interceptor
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      if (isEligibleInput(e.target as Element)) {
        setIsInputFocused(true);
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      if (isEligibleInput(e.target as Element)) {
        setIsInputFocused(false);
        // Small delay to allow clicking on candidate suggestions
        setTimeout(() => {
          setSuggestionState((prev) => ({ ...prev, visible: false }));
        }, 200);
      }
    };

    const handleKeyDown = async (e: KeyboardEvent) => {
      // 1. Shortcut: Ctrl + G or F12 toggles Telugu Typing instantly
      if ((e.ctrlKey && (e.key === "g" || e.key === "G")) || e.key === "F12") {
        e.preventDefault();
        toggleTyping();
        return;
      }

      const activeEl = document.activeElement;
      if (!isEligibleInput(activeEl)) return;

      const input = activeEl as HTMLInputElement | HTMLTextAreaElement;

      // 2. Suggestion Box Navigation (Numbers 1-5 or Escape or Tab)
      if (suggestionState.visible && suggestionState.candidates.length > 0) {
        if (e.key === "Escape") {
          e.preventDefault();
          setSuggestionState((prev) => ({ ...prev, visible: false }));
          return;
        }

        // Direct number selection (1, 2, 3, etc.)
        if (/^[1-5]$/.test(e.key)) {
          const idx = parseInt(e.key, 10) - 1;
          if (suggestionState.candidates[idx]) {
            e.preventDefault();
            applyCandidate(suggestionState.candidates[idx], true);
            return;
          }
        }
      }

      // If Telugu typing is disabled, skip transliteration
      if (!isEnabled) return;

      // 3. Backspace to undo conversion if user just converted a word
      if (e.key === "Backspace" && lastConvertedRef.current) {
        const last = lastConvertedRef.current;
        if (last.el === input && input.selectionStart === last.endPos && input.selectionEnd === last.endPos) {
          // Revert converted word back to original English word
          const val = input.value;
          const teluguWithSpace = last.telugu + " ";
          const checkLen = teluguWithSpace.length;

          if (val.substring(last.endPos - checkLen, last.endPos) === teluguWithSpace) {
            e.preventDefault();
            const before = val.substring(0, last.endPos - checkLen);
            const after = val.substring(last.endPos);
            const revertedVal = before + last.english;

            const proto = input instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
            const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
            if (setter) {
              setter.call(input, revertedVal);
            } else {
              input.value = revertedVal;
            }

            const newCursor = before.length + last.english.length;
            input.setSelectionRange(newCursor, newCursor);
            input.dispatchEvent(new Event("input", { bubbles: true }));

            lastConvertedRef.current = null;
            return;
          }
        }
      }

      // 4. Word boundary trigger keys: Space, Enter, or Punctuation (, . ? ! - /)
      const isSpace = e.key === " " || e.code === "Space";
      const isEnter = e.key === "Enter";
      const isPunctuation = /^[.,?!:;\-]$/.test(e.key);

      if ((isSpace || isEnter || isPunctuation) && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const { word, endPos } = extractCurrentWord(input);

        if (word && /^[a-zA-Z]+$/.test(word)) {
          e.preventDefault();

          // Fetch candidates or use offline phonetic immediately
          const candidates = await fetchTeluguTransliteration(word);
          const topCandidate = candidates[0] || offlinePhoneticTelugu(word);

          const delimiter = isEnter ? (input.tagName === "TEXTAREA" ? "\n" : "") : isSpace ? " " : e.key + " ";
          const replacement = topCandidate + delimiter;

          replaceWordInInput(input, word, replacement, endPos);

          lastConvertedRef.current = {
            el: input,
            english: word,
            telugu: topCandidate,
            endPos: endPos - word.length + replacement.length
          };

          setSuggestionState((prev) => ({ ...prev, visible: false, word: "", candidates: [] }));
        }
      }
    };

    const handleInput = (e: Event) => {
      const activeEl = e.target as Element;
      if (!isEligibleInput(activeEl) || !isEnabled) {
        setSuggestionState((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }

      const input = activeEl as HTMLInputElement | HTMLTextAreaElement;
      const { word, endPos } = extractCurrentWord(input);

      // If word contains 2+ English letters, prefetch suggestions and display candidate bar
      if (word && word.length >= 2 && /^[a-zA-Z]+$/.test(word)) {
        if (prefetchTimerRef.current) clearTimeout(prefetchTimerRef.current);

        prefetchTimerRef.current = setTimeout(async () => {
          const candidates = await fetchTeluguTransliteration(word);
          if (candidates.length > 0) {
            // Position candidate popover near input element
            const rect = input.getBoundingClientRect();
            setSuggestionState({
              visible: true,
              x: Math.min(window.innerWidth - 300, Math.max(10, rect.left)),
              y: rect.bottom + window.scrollY + 6,
              word,
              candidates,
              selectedIndex: 0,
              inputEl: input
            });
          }
        }, 80);
      } else {
        setSuggestionState((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("input", handleInput, true);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("input", handleInput, true);
      if (prefetchTimerRef.current) clearTimeout(prefetchTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [isEnabled, toggleTyping, suggestionState, applyCandidate]);

  return (
    <>
      {/* 1. Floating Candidate Suggestions Popover (Appears right under active input when typing) */}
      {suggestionState.visible && suggestionState.candidates.length > 0 && (
        <div
          style={{
            position: "absolute",
            left: `${suggestionState.x}px`,
            top: `${suggestionState.y}px`,
            zIndex: 99999
          }}
          className="bg-slate-900/95 dark:bg-zinc-900/95 backdrop-blur-md text-white border border-amber-400/40 rounded-2xl shadow-2xl p-1.5 flex items-center gap-1 max-w-[95vw] overflow-x-auto no-scrollbar animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-black text-amber-300 border-r border-slate-700/60 shrink-0">
            <Sparkles className="size-3 text-amber-400 animate-pulse" />
            <span>తెలుగు:</span>
          </div>

          {suggestionState.candidates.slice(0, 4).map((cand, idx) => (
            <button
              key={`${cand}-${idx}`}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent blur of input
                applyCandidate(cand, true);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition shrink-0 cursor-pointer ${
                idx === 0
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs"
                  : "bg-slate-800/80 hover:bg-slate-700 text-slate-200"
              }`}
            >
              <span className="text-[9px] opacity-70 bg-black/30 px-1 rounded-md font-mono">{idx + 1}</span>
              <span>{cand}</span>
            </button>
          ))}

          {/* Keep English option */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyCandidate(suggestionState.word, true);
            }}
            className="px-2 py-1 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
            title="ఇంగ్లీష్‌లోనే ఉంచండి"
          >
            [En: {suggestionState.word}]
          </button>
        </div>
      )}

      {/* 2. Floating Language Switcher Pill (Always visible, docked gracefully at bottom left) */}
      <div className="fixed bottom-16 sm:bottom-6 left-3 sm:left-6 z-40 flex flex-col items-start gap-1.5 pointer-events-auto">
        {/* Subtle Input Tip (shown when user focuses any form/search input) */}
        {isInputFocused && isEnabled && (
          <div className="bg-amber-500/95 dark:bg-amber-600/95 text-white text-[10px] sm:text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-xs animate-in slide-in-from-bottom-2 fade-in duration-200 flex items-center gap-1 border border-amber-300/40">
            <span>💡 టైప్ చేయండి:</span>
            <span className="bg-black/20 px-1 py-0.5 rounded font-mono">raithu</span>
            <span>+ Space =</span>
            <span className="bg-white text-orange-950 px-1 py-0.5 rounded font-black">రైతు</span>
          </div>
        )}

        {/* The Toggle Button */}
        <button
          type="button"
          onClick={toggleTyping}
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full shadow-lg border transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-md select-none ${
            isEnabled
              ? "bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 text-white border-amber-300/60 ring-2 ring-orange-400/40 shadow-orange-500/30 font-black text-xs"
              : "bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-750 font-bold text-xs"
          }`}
          title="తెలుగు టైపింగ్ ఆన్/ఆఫ్ (Ctrl + G)"
          aria-label="Toggle Telugu Typing"
        >
          <Keyboard className={`size-3.5 sm:size-4 ${isEnabled ? "text-white animate-pulse" : "text-slate-400"}`} />
          <div className="flex items-center gap-1">
            <span className="leading-none">
              {isEnabled ? "తెలుగు టైపింగ్" : "English Typing"}
            </span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                isEnabled
                  ? "bg-white text-orange-900 shadow-xs"
                  : "bg-slate-700 text-slate-300"
              }`}
            >
              {isEnabled ? "ఆన్" : "Off"}
            </span>
          </div>
        </button>
      </div>

      {/* 3. Toast Alert on Language Toggle */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white border border-amber-400/60 px-4 py-2 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Keyboard className="size-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};
