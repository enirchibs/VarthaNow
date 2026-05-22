import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

type ScrapedArticle = {
  headline: string;
  sourceName: string;
  sourceUrl: string;
  imageUrl?: string;
  categorySlug?: string;
};

serve(async (request) => {
  const secret = request.headers.get("x-cron-secret");
  if (Deno.env.get("CRON_SECRET") && secret !== Deno.env.get("CRON_SECRET")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const demoItems: ScrapedArticle[] = [
    {
      headline: "Vizag coastal rain alert updated",
      sourceName: "Demo RSS",
      sourceUrl: "https://example.com/source/vizag-rain",
      imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
    }
  ];

  const rows = demoItems.map((item) => ({
    headline: item.headline,
    source_name: item.sourceName,
    source_url: item.sourceUrl,
    image_url: item.imageUrl,
    content_hash: crypto.randomUUID(),
    status: "queued"
  }));

  const { error } = await supabase.from("articles").upsert(rows, { onConflict: "content_hash" });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ ok: true, inserted: rows.length }), {
    headers: { "Content-Type": "application/json" }
  });
});
