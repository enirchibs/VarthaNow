import React, { useState, useEffect } from "react";
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  BookmarkCheck, 
  Send, 
  Copy, 
  Check, 
  MessageCircle, 
  Instagram, 
  User 
} from "lucide-react";
import type { BlogPost } from "@/types/news";
import { useLanguage } from "@/hooks/useLanguage";
import { useBookmarks } from "@/hooks/useBookmarks";
import { timeAgo } from "@/lib/format";

interface ArticleEndActionBarProps {
  post: BlogPost;
}

interface CommentItem {
  id: string;
  name: string;
  text: string;
  createdAt: string;
}

export function ArticleEndActionBar({ post }: ArticleEndActionBarProps) {
  const { lang } = useLanguage();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(post.slug);

  // Like state
  const [liked, setLiked] = useState<boolean>(() => {
    return localStorage.getItem(`vaartanow-liked-${post.slug}`) === "true";
  });
  const [likeCount, setLikeCount] = useState<number>(() => {
    const saved = localStorage.getItem(`vaartanow-likes-count-${post.slug}`);
    return saved ? parseInt(saved, 10) : 24 + (post.title.length % 30);
  });

  // Comment section state
  const [showComments, setShowComments] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>("");
  const [authorName, setAuthorName] = useState<string>("");
  const [comments, setComments] = useState<CommentItem[]>(() => {
    try {
      const saved = localStorage.getItem(`vaartanow-comments-${post.slug}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: "1",
        name: "సురేష్ కుమార్",
        text: "చాలా ఉపయోగకరమైన సమాచారం. ధన్యవాదాలు!",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: "2",
        name: "Ramesh V",
        text: "Good coverage of the latest developments.",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
    ];
  });

  // Share state
  const [copied, setCopied] = useState<boolean>(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title}\n${shareUrl}`)}`;

  const handleLikeToggle = () => {
    const nextState = !liked;
    setLiked(nextState);
    const nextCount = nextState ? likeCount + 1 : Math.max(0, likeCount - 1);
    setLikeCount(nextCount);
    localStorage.setItem(`vaartanow-liked-${post.slug}`, String(nextState));
    localStorage.setItem(`vaartanow-likes-count-${post.slug}`, String(nextCount));
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: CommentItem = {
      id: Date.now().toString(),
      name: authorName.trim() || (lang === "te" ? "పాఠకుడు" : "Reader"),
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    setCommentText("");
    localStorage.setItem(`vaartanow-comments-${post.slug}`, JSON.stringify(updated));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInstagramShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.excerpt, url: shareUrl });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="my-6 rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-6 shadow-sm space-y-4">
      {/* 1 ── MAIN ACTION BAR (LIKE, COMMENT, SHARE, BOOKMARK) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[hsl(var(--border))]/60 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* 👍 LIKE BUTTON */}
          <button
            onClick={handleLikeToggle}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all active:scale-95 cursor-pointer ${
              liked
                ? "bg-red-600 text-white shadow-md"
                : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-red-500/10 hover:text-red-600 border border-[hsl(var(--border))]"
            }`}
          >
            <ThumbsUp className={`size-4 ${liked ? "fill-current" : ""}`} />
            <span>{liked ? (lang === "te" ? "ఇష్టం" : "Liked") : (lang === "te" ? "లైక్" : "Like")}</span>
            <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">{likeCount}</span>
          </button>

          {/* 💬 COMMENT BUTTON */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all active:scale-95 cursor-pointer ${
              showComments
                ? "bg-blue-600 text-white shadow-md"
                : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-blue-500/10 hover:text-blue-600 border border-[hsl(var(--border))]"
            }`}
          >
            <MessageSquare className="size-4" />
            <span>{lang === "te" ? "కామెంట్స్" : "Comments"}</span>
            <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">{comments.length}</span>
          </button>
        </div>

        {/* 🔖 BOOKMARK & SHARE SHORTCUT */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleBookmark(post.slug)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition border border-[hsl(var(--border))] ${
              bookmarked ? "bg-amber-500 text-white font-black" : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--border))]"
            }`}
            title={bookmarked ? "Saved" : "Save Article"}
          >
            {bookmarked ? <BookmarkCheck className="size-4 fill-current text-white" /> : <Bookmark className="size-4" />}
            <span className="hidden sm:inline">{bookmarked ? (lang === "te" ? "దాచినవి" : "Saved") : (lang === "te" ? "సేవ్" : "Save")}</span>
          </button>
        </div>
      </div>

      {/* 2 ── SHARE STRIP (WHATSAPP, INSTAGRAM, COPY LINK) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <span className="text-xs font-extrabold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
          📢 {lang === "te" ? "ఈ వార్తను షేర్ చేయండి:" : "Share Article:"}
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-black shadow-sm active:scale-95 transition"
          >
            <MessageCircle className="size-3.5 fill-current" />
            <span>WhatsApp</span>
          </a>

          {/* Instagram */}
          <button
            onClick={handleInstagramShare}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 text-white text-xs font-black shadow-sm active:scale-95 transition cursor-pointer"
          >
            <Instagram className="size-3.5" />
            <span>Instagram</span>
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] text-[hsl(var(--foreground))] text-xs font-bold border border-[hsl(var(--border))] active:scale-95 transition cursor-pointer"
          >
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            <span>{copied ? (lang === "te" ? "కాపీ అయింది" : "Copied") : (lang === "te" ? "లింక్" : "Copy")}</span>
          </button>
        </div>
      </div>

      {/* 3 ── COMMENTS SECTION (EXPANDABLE) */}
      {showComments && (
        <div className="space-y-4 border-t border-[hsl(var(--border))]/60 pt-4 animate-in fade-in duration-300">
          <h3 className="text-sm font-black text-[hsl(var(--foreground))] flex items-center gap-2">
            <MessageSquare className="size-4 text-blue-500" />
            <span>{lang === "te" ? "అభిప్రాయాలు & వ్యాఖ్యలు" : "Reader Comments"}</span>
          </h3>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="space-y-2.5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={lang === "te" ? "మీ వ్యాఖ్యను రాయండి..." : "Add a comment..."}
                  className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3.5 py-2 text-xs sm:text-sm font-semibold text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black transition active:scale-95 cursor-pointer flex items-center gap-1"
              >
                <Send className="size-3.5" />
                <span>{lang === "te" ? "పంపండి" : "Post"}</span>
              </button>
            </div>

            {/* Optional Author Name */}
            <div className="flex items-center gap-2">
              <User className="size-3 text-[hsl(var(--muted-foreground))]" />
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder={lang === "te" ? "మీ పేరు (ఐచ్ఛికం)" : "Your Name (Optional)"}
                className="w-48 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-2.5 py-1 text-[11px] font-semibold text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {comments.map((c) => (
              <div key={c.id} className="rounded-2xl bg-[hsl(var(--muted))]/60 p-3 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-[hsl(var(--foreground))]">
                  <span className="text-blue-600 dark:text-blue-400 font-extrabold">{c.name}</span>
                  <span className="text-[10px] font-normal text-[hsl(var(--muted-foreground))]">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="text-[hsl(var(--foreground))] leading-relaxed font-semibold">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
