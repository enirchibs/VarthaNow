import React, { useEffect, useState } from "react";
import { 
  MessageCircle, 
  Send, 
  Share2, 
  Check, 
  Copy, 
  User, 
  MapPin, 
  Sparkles,
  TrendingUp
} from "lucide-react";
import type { BlogPost, ArticlePoll, ReaderOpinion } from "@/types/news";
import { 
  getArticlePoll, 
  submitPollVote, 
  getArticleOpinions, 
  submitReaderOpinion, 
  trackEngagementEvent 
} from "@/lib/engagement-api";
import { useLanguage } from "@/hooks/useLanguage";
import { timeAgo } from "@/lib/format";

interface ArticleEngagementCardProps {
  post: BlogPost;
}

// Optional Vizag & AP/TS Locality list for local engagement
const VIZAG_LOCALITIES = [
  "Madhurawada",
  "Gajuwaka",
  "MVP Colony",
  "Akkayyapalem",
  "Dwaraka Nagar",
  "Anakapalle",
  "Bheemili",
  "Vijayawada",
  "Hyderabad",
  "Other / ఇతర"
];

export function ArticleEngagementCard({ post }: ArticleEngagementCardProps) {
  const { lang } = useLanguage();
  const [poll, setPoll] = useState<ArticlePoll | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [votingLoading, setVotingLoading] = useState<boolean>(false);

  // Opinion Form State
  const [commentText, setCommentText] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [locality, setLocality] = useState<string>("");
  const [opinions, setOpinions] = useState<ReaderOpinion[]>([]);
  const [commentSubmitting, setCommentSubmitting] = useState<boolean>(false);
  const [commentSuccess, setCommentSuccess] = useState<boolean>(false);

  // Copy Link State
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    // Track card view
    trackEngagementEvent("engagement_card_view", { slug: post.slug });

    // Check if user already voted locally
    const votedId = localStorage.getItem(`vaartanow_voted_${post.slug}`);
    if (votedId) {
      setSelectedOptionId(votedId);
      setHasVoted(true);
    }

    // Load poll & opinions asynchronously without blocking article render
    getArticlePoll(post.slug, post, lang).then((p) => {
      if (mounted) setPoll(p);
    });

    getArticleOpinions(post.slug).then((ops) => {
      if (mounted) setOpinions(ops);
    });

    return () => {
      mounted = false;
    };
  }, [post, lang]);

  if (!poll || poll.engagement_enabled === false) {
    return null;
  }

  // Handle Vote Submission
  const handleVote = async (optionId: string) => {
    if (hasVoted || votingLoading) return;
    setVotingLoading(true);
    setSelectedOptionId(optionId);
    setHasVoted(true);

    trackEngagementEvent("poll_option_selected", { slug: post.slug, optionId });

    try {
      const res = await submitPollVote(post.slug, optionId, poll);
      setPoll(res.poll);
    } catch (err) {
      console.warn("Poll vote error:", err);
    } finally {
      setVotingLoading(false);
    }
  };

  // Handle Opinion Submission
  const handleOpinionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || commentSubmitting) return;

    setCommentSubmitting(true);
    try {
      const updated = await submitReaderOpinion(post.slug, {
        post_slug: post.slug,
        comment: commentText.trim(),
        display_name: displayName.trim() || undefined,
        locality: locality || undefined,
        selected_option_id: selectedOptionId || undefined
      });
      setOpinions(updated);
      setCommentText("");
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 4000);
    } catch (err) {
      console.warn("Opinion submit error:", err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Format Share Content
  const selectedOptionObj = poll.options.find((o) => o.id === selectedOptionId);
  const selectedText = selectedOptionObj ? selectedOptionObj.text : "";
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareText = `ఈ వార్తపై మీ అభిప్రాయం ఏమిటి?\n\n'${poll.question}'${selectedText ? `\n\nనా సమాధానం: ${selectedText}` : ""}\n\nVaartaNow: ${shareUrl}`;

  const shareToWhatsApp = () => {
    trackEngagementEvent("whatsapp_share_clicked", { slug: post.slug });
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const handleNativeShare = async () => {
    trackEngagementEvent("share_clicked", { slug: post.slug });
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.log("Share skipped", err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    trackEngagementEvent("share_clicked", { slug: post.slug, method: "copy" });
    navigator.clipboard.writeText(shareText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <section 
      className="my-8 rounded-[1.6rem] border border-indigo-500/25 dark:border-indigo-500/30 bg-[hsl(var(--card))] p-5 sm:p-7 shadow-sm transition-all duration-300 space-y-6"
      aria-label="Article Engagement System"
    >
      {/* 1. EDITORIAL HEADER & THOUGHT-PROVOKING QUESTION */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[hsl(var(--border))]/50 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤔</span>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-[hsl(var(--foreground))]">
              {lang === "te" ? "మీ అభిప్రాయం ఏమిటి?" : "What is your perspective?"}
            </h2>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 px-3 py-0.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
            <Sparkles className="size-3" />
            {lang === "te" ? "చదవండి → ఆలోచించండి → స్పందించండి" : "Read → Think → Respond"}
          </span>
        </div>

        {/* Question Text */}
        <p className="text-base sm:text-lg font-extrabold text-[hsl(var(--foreground))] leading-snug tracking-tight">
          "{poll.question}"
        </p>
      </div>

      {/* 2. QUICK POLL OPTIONS & RESULTS */}
      <div className="space-y-3">
        {!hasVoted ? (
          /* BEFORE VOTING STATE: 3 Touch Option Buttons */
          <div className="grid gap-2.5">
            {poll.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleVote(opt.id)}
                disabled={votingLoading}
                className="w-full min-h-[48px] p-3.5 sm:p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] hover:bg-indigo-500/10 hover:border-indigo-500/40 text-left text-sm sm:text-base font-extrabold text-[hsl(var(--foreground))] transition-all active:scale-[0.99] flex items-center justify-between gap-3 shadow-xs group cursor-pointer"
                aria-label={`Vote option: ${opt.text}`}
              >
                <span>{opt.text}</span>
                <span className="text-xs font-bold text-[hsl(var(--muted-foreground))] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {lang === "te" ? "ఓటు వేయండి ➔" : "Vote ➔"}
                </span>
              </button>
            ))}
          </div>
        ) : (
          /* AFTER VOTING STATE: "👥 పాఠకులు ఏమంటున్నారు?" Visual Progress Bars */
          <div className="space-y-4 rounded-2xl bg-[hsl(var(--muted))]/50 p-4 sm:p-5 border border-[hsl(var(--border))]/40">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <TrendingUp className="size-3.5" />
                {lang === "te" ? "👥 పాఠకులు ఏమంటున్నారు?" : "👥 What Other Readers Think"}
              </h3>
              <span className="text-[11px] font-bold text-[hsl(var(--muted-foreground))]">
                {poll.total_votes > 0
                  ? lang === "te"
                    ? `మొత్తం ${poll.total_votes.toLocaleString()} మంది పాఠకులు స్పందించారు`
                    : `${poll.total_votes.toLocaleString()} readers voted`
                  : lang === "te"
                  ? "ఇప్పటివరకు వచ్చిన స్పందనలు"
                  : "Latest responses"}
              </span>
            </div>

            <div className="space-y-3">
              {poll.options.map((opt) => {
                const percent = poll.total_votes > 0 ? Math.round((opt.count / poll.total_votes) * 100) : 0;
                const isSelected = opt.id === selectedOptionId;

                return (
                  <div key={opt.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-[hsl(var(--foreground))]">
                      <span className="flex items-center gap-1.5">
                        {opt.text}
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.2 text-[10px] font-black">
                            <Check className="size-3" />
                            {lang === "te" ? "మీ ఎంపిక" : "Your Vote"}
                          </span>
                        )}
                      </span>
                      <span className="font-black text-indigo-600 dark:text-indigo-400">{percent}%</span>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="w-full bg-[hsl(var(--border))]/50 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isSelected
                            ? "bg-gradient-to-r from-emerald-500 to-indigo-600 shadow-sm"
                            : "bg-gradient-to-r from-indigo-500 to-purple-600 opacity-80"
                        }`}
                        style={{ width: `${Math.max(percent, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. OPTIONAL OPEN-ENDED READER OPINION INPUT */}
      <div className="space-y-3 border-t border-[hsl(var(--border))]/50 pt-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
          <span>💬</span>
          {lang === "te" ? "మీ కారణం ఒక్క వాక్యంలో చెప్పండి" : "Share your reason in one line"}
        </h3>

        <form onSubmit={handleOpinionSubmit} className="space-y-3">
          {/* Comment Textarea with Character Counter */}
          <div className="relative">
            <textarea
              value={commentText}
              onChange={(e) => {
                setCommentText(e.target.value);
                if (e.target.value.length === 1) {
                  trackEngagementEvent("opinion_started", { slug: post.slug });
                }
              }}
              maxLength={500}
              rows={2}
              placeholder={lang === "te" ? "మీ అభిప్రాయం రాయండి..." : "Write your opinion..."}
              className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3 text-sm font-semibold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all placeholder:text-[hsl(var(--muted-foreground))]/70"
            />
            <span className="absolute right-3 bottom-2 text-[10px] font-bold text-[hsl(var(--muted-foreground))]">
              {commentText.length} / 500
            </span>
          </div>

          {/* Optional Display Name + Optional Vizag Locality Dropdown */}
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="relative">
              <User className="absolute left-3 top-2.5 size-4 text-[hsl(var(--muted-foreground))]" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={lang === "te" ? "మీ పేరు (ఐచ్ఛికం) e.g., రవి" : "Your Name (Optional)"}
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] py-2 pl-9 pr-3 text-xs font-semibold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 size-4 text-[hsl(var(--muted-foreground))]" />
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] py-2 pl-9 pr-3 text-xs font-semibold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
              >
                <option value="">{lang === "te" ? "📍 మీ ప్రాంతం (ఐచ్ఛికం)" : "📍 Select Locality (Optional)"}</option>
                {VIZAG_LOCALITIES.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-1">
            {commentSuccess ? (
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="size-4" />
                {lang === "te" ? "మీ అభిప్రాయం జోడించబడింది!" : "Opinion submitted!"}
              </span>
            ) : (
              <span className="text-[11px] font-bold text-[hsl(var(--muted-foreground))]">
                {lang === "te" ? "తెలుగు లేదా ఇంగ్లీష్‌లలో రాయవచ్చు" : "Telugu or English supported"}
              </span>
            )}

            <button
              type="submit"
              disabled={!commentText.trim() || commentSubmitting}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 text-xs font-black transition-all shadow-sm cursor-pointer"
            >
              <Send className="size-3.5" />
              {lang === "te" ? "సమర్పించండి" : "Submit Opinion"}
            </button>
          </div>
        </form>
      </div>

      {/* 4. READER OPINIONS LIST */}
      {opinions.length > 0 && (
        <div className="space-y-3 border-t border-[hsl(var(--border))]/50 pt-5">
          <h3 className="text-xs font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
            {lang === "te" ? "💬 పాఠకుల అభిప్రాయాలు" : "💬 Reader Opinions"}
          </h3>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {opinions.map((op) => (
              <div 
                key={op.id}
                className="rounded-2xl border border-[hsl(var(--border))]/60 bg-[hsl(var(--muted))]/40 p-3 text-xs space-y-1"
              >
                <p className="font-bold text-[hsl(var(--foreground))] leading-relaxed">
                  "{op.comment}"
                </p>
                <div className="flex items-center justify-between text-[10px] font-extrabold text-[hsl(var(--muted-foreground))]">
                  <span>
                    — {op.display_name || "పాఠకుడు"}
                    {op.locality ? `, ${op.locality}` : ""}
                  </span>
                  <span>{timeAgo(op.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SHARE FEATURE */}
      <div className="space-y-3 border-t border-[hsl(var(--border))]/50 pt-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          {lang === "te" ? "📲 మీ అభిప్రాయాన్ని షేర్ చేయండి" : "📲 Share Your Perspective"}
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          {/* WhatsApp Share (Brand Green) */}
          <button
            onClick={shareToWhatsApp}
            className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <MessageCircle className="size-4 fill-current" />
            WhatsApp
          </button>

          {/* Web Share / Telegram */}
          <button
            onClick={handleNativeShare}
            className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Share2 className="size-4" />
            {lang === "te" ? "షేర్ చేయండి" : "Share"}
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] text-[hsl(var(--foreground))] px-4 py-2 text-xs font-bold transition-all cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="size-3.5 text-emerald-500" />
                <span>{lang === "te" ? "కాపీ అయింది!" : "Copied!"}</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span>{lang === "te" ? "లింక్ కాపీ" : "Copy Link"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
