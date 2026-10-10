import { useEffect } from "react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  useEffect(() => {
    document.title = "404 - పేజీ కనబడలేదు | VaartaNow";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <main className="container-shell py-16 text-center space-y-4">
      <p className="text-6xl font-black text-[hsl(var(--primary))]">404</p>
      <h1 className="text-2xl font-black">ఈ పేజీ కనబడలేదు</h1>
      <p className="text-sm text-[hsl(var(--muted-foreground))]">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="inline-block rounded-full bg-[hsl(var(--primary))] px-6 py-2 font-black text-white">
        హోమ్‌కి వెళ్ళండి
      </Link>
    </main>
  );
}
