import { useEffect, useState } from "react";

// ReadingProgress — a slim 3px bar fixed at the very top of the viewport.
// Fills left-to-right as user scrolls through the article.
// No competitor has this → strong differentiator for reading completion.

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      if (scrollHeight <= 0) return;
      setProgress(Math.min(100, Math.round((scrollTop / scrollHeight) * 100)));
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (progress === 0) return null;

  return (
    <div
      className="fixed left-0 top-0 z-[200] h-[3px] bg-gradient-to-r from-red-500 to-red-600 shadow-[0_0_8px_rgba(239,68,68,0.5)] transition-none"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    />
  );
}
