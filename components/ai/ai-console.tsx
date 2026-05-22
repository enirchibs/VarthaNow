"use client";

import { useState, type FormEvent } from "react";
import { Bot, Mic, Send, Sparkles, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/components/providers/app-provider";
import { uiCopy } from "@/lib/i18n";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const suggestions = ["Today news", "Vizag jobs", "Gold rate today", "latest AP news", "weather today"];

export function AiConsole() {
  const { language } = useApp();
  const copy = uiCopy[language] ?? uiCopy.te;
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Namaste! I am Vartha AI. Ask me about news, jobs, weather, gold rates, local updates, summaries, and translations."
    }
  ]);

  const submit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!query.trim()) return;

    const prompt = query.trim();
    setQuery("");
    setMessages((items) => [...items, { role: "user", content: prompt }]);
    setLoading(true);

    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: prompt, language })
      });
      const data = (await response.json()) as { answer?: string };
      setMessages((items) => [...items, { role: "assistant", content: data.answer ?? "I could not answer that yet." }]);
    } catch {
      setMessages((items) => [...items, { role: "assistant", content: "Network issue. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[1.8rem] border border-border bg-card p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary text-white shadow-glow">
            <Bot className="size-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-[var(--font-telugu)] text-2xl font-black">{copy.ask}</h1>
            <p className="text-sm text-muted-foreground">Search, summarize, translate and listen in AI mode</p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-border bg-card p-3 shadow-soft">
        <div className="flex flex-wrap gap-2 p-1">
          {suggestions.map((item) => (
            <Button key={item} variant="secondary" size="sm" onClick={() => setQuery(item)}>
              <Sparkles className="size-3" />
              {item}
            </Button>
          ))}
        </div>
      </section>

      <section className="min-h-[28rem] rounded-[1.8rem] border border-border bg-card p-4 shadow-soft">
        <div className="space-y-3">
          {messages.map((message, index) => (
            <motion.div
              key={`${message.role}-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={message.role === "user" ? "ml-auto max-w-[82%]" : "mr-auto max-w-[88%]"}
            >
              <div
                className={
                  message.role === "user"
                    ? "rounded-[1.4rem] bg-primary px-4 py-3 text-sm font-semibold text-white"
                    : "rounded-[1.4rem] bg-muted px-4 py-3 text-sm leading-7"
                }
              >
                {message.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="mr-auto max-w-[70%] rounded-[1.4rem] bg-muted px-4 py-3 text-sm font-semibold text-muted-foreground">
              Thinking...
            </div>
          )}
        </div>
      </section>

      <form
        onSubmit={submit}
        className="sticky bottom-24 z-20 flex gap-2 rounded-full border border-border bg-background/90 p-2 backdrop-blur-xl md:bottom-4"
      >
        <Button type="button" variant="secondary" size="icon" aria-label="Voice input">
          <Mic className="size-4" />
        </Button>
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ask in Telugu, English or Hinglish..." />
        <Button type="button" variant="secondary" size="icon" aria-label="Voice playback">
          <Volume2 className="size-4" />
        </Button>
        <Button type="submit" size="icon" aria-label="Send">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
