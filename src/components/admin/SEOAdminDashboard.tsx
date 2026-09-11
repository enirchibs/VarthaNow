import React, { useState } from "react";
import { 
  Globe, Search, Save, CheckCircle2, ShieldCheck, Sparkles, AlertCircle, FileText, Code, RefreshCw
} from "lucide-react";
import { Button, Input } from "@/components/ui";

export function SEOAdminDashboard() {
  const [siteTitle, setSiteTitle] = useState("VaartaNow - Telugu AI News, Daily Share & Jobs");
  const [siteDescription, setSiteDescription] = useState("తాజా తెలుగు వార్తలు, బ్రేకింగ్ న్యూస్, వాట్సాప్ స్టేటస్ ఇమేజెస్, స్థానిక ఉద్యోగాలు మరియు ట్రెండింగ్ అప్‌డేట్స్.");
  const [canonicalUrl, setCanonicalUrl] = useState("https://vaartanow.com");
  const [defaultOgImage, setDefaultOgImage] = useState("https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("G-VAARTANOW123");
  const [keywords, setKeywords] = useState("VaartaNow, Telugu News, Breaking Telugu News, WhatsApp Status Telugu, AP Jobs, TS Jobs, Devotional Quotes");
  const [robotsTxt, setRobotsTxt] = useState(`User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://vaartanow.com/sitemap.xml`);

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSaveSEO = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      localStorage.setItem("vaartanow_seo_site_title", siteTitle);
      localStorage.setItem("vaartanow_seo_site_description", siteDescription);
      localStorage.setItem("vaartanow_seo_canonical", canonicalUrl);
      localStorage.setItem("vaartanow_seo_og_image", defaultOgImage);
      localStorage.setItem("vaartanow_seo_ga_id", googleAnalyticsId);
      localStorage.setItem("vaartanow_seo_keywords", keywords);

      setMessage("✨ SEO meta tags and analytics tracking settings saved successfully!");
    } catch (err: any) {
      console.warn("Failed to save SEO settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {message && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="size-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* 🌐 GLOBAL SEO CONFIGURATION */}
      <section className="rounded-[1.8rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] pb-4">
          <div className="size-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Globe className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-black">Global SEO & Meta Tag Control Engine</h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
              Configure search engine indexing, Open Graph social share cards, keywords & Analytics tracking.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveSEO} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                Default Website Title
              </label>
              <Input
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="h-10 text-sm font-bold rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                Canonical Base Domain URL
              </label>
              <Input
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                className="h-10 text-xs font-mono rounded-xl"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
              Meta Description (Search Engine Snippet)
            </label>
            <textarea
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                Default Open Graph Share Cover Image URL
              </label>
              <Input
                value={defaultOgImage}
                onChange={(e) => setDefaultOgImage(e.target.value)}
                className="h-10 text-xs font-mono rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
                Google Analytics Measurement ID / Tag Manager
              </label>
              <Input
                value={googleAnalyticsId}
                onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                placeholder="G-XXXXXXX"
                className="h-10 text-xs font-mono rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
              Target SEO Keywords (Comma Separated)
            </label>
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="h-10 text-xs font-bold rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[hsl(var(--muted-foreground))] mb-1.5">
              Robots.txt & Sitemap Directives Preview
            </label>
            <textarea
              value={robotsTxt}
              onChange={(e) => setRobotsTxt(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-mono outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <Save className="size-4" />
            <span>Save & Apply SEO Configuration</span>
          </Button>
        </form>
      </section>

      {/* 📄 PER-PAGE SEO OVERRIDES PREVIEW */}
      <section className="rounded-[1.8rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-black flex items-center gap-2">
          <FileText className="size-5 text-blue-500" />
          Active Route SEO Overrides
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {[
            { page: "Homepage (/)", title: "తాజా తెలుగు వార్తలు & బ్రేకింగ్ అప్‌డేట్స్" },
            { page: "Jobs (/jobs)", title: "💼 స్థానిక ఉద్యోగాలు - AP & Telangana Jobs" },
            { page: "Daily Share (/daily-share)", title: "✨ ఈరోజు వాట్సాప్ షేర్ - Image & Video Status" },
            { page: "Devotional (/devotional)", title: "🚩 భక్తి సమయం - పంచాంగం & రాశి ఫలాలు" },
            { page: "Shorts (/shorts)", title: "🎬 షార్ట్స్ & వీడియో వార్తలు - Viral Reels" },
            { page: "Raitu Bazar (/raitu-bazar)", title: "🌾 రైతు బజార్ - మార్కెట్ ధరలు & పంటలు" },
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 space-y-1">
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 block">{item.page}</span>
              <p className="text-xs font-extrabold truncate">{item.title}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
