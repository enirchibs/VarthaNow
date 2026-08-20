// Web Speech API Service for Maatlaadu AI (Speech Recognition & Speech Synthesis)

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

export type LanguageCode = "en-IN" | "en-US" | "hi-IN" | "te-IN";

class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private synthesis: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      }
      if ("speechSynthesis" in window) {
        this.synthesis = window.speechSynthesis;
      }
    }
  }

  public isSpeechRecognitionSupported(): boolean {
    return !!this.recognition;
  }

  public isSpeechSynthesisSupported(): boolean {
    return !!this.synthesis;
  }

  public startListening(
    lang: LanguageCode = "en-US",
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ): boolean {
    if (!this.recognition) {
      onError("Speech recognition is not supported in this browser.");
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    try {
      this.recognition.lang = lang;
      this.isListening = true;

      this.recognition.onresult = (event: any) => {
        let transcript = "";
        let isFinal = false;
        let confidence = 0.9;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinal = true;
            confidence = event.results[i][0].confidence || 0.9;
          }
        }

        onResult({ transcript: transcript.trim(), isFinal, confidence });
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        if (event.error !== "no-speech") {
          onError(event.error || "Speech recognition error");
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      this.isListening = false;
      onError(err.message || "Failed to start microphone");
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
  }

  public speak(
    text: string,
    lang: LanguageCode = "en-IN",
    onEnd?: () => void
  ): void {
    if (!this.synthesis) return;

    this.synthesis.cancel(); // Stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // Slightly slower for language learners
    utterance.pitch = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
    }

    // Try to pick a natural voice for target language
    const voices = this.synthesis.getVoices();
    const matchingVoice = voices.find((v) => v.lang.startsWith(lang.split("-")[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    this.synthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

export const speechService = new SpeechService();
