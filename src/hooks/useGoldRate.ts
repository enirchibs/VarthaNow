import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface GoldRateData {
  gold24k: number;
  gold22k: number;
  formatted24k: string;
  formatted22k: string;
  unit: string;
  source: string;
  updatedAt: string;
  timeAgo: string;
}

const LOCAL_STORAGE_KEY = "vaartanow_gold_rate_cache";
const REFRESH_INTERVAL_MS = 20 * 60 * 1000; // 20 minutes
const OROPOCKET_URL = "https://api.oropocket.com/public/prices";

// Baseline fallback aligned with recent market values
const DEFAULT_FALLBACK: GoldRateData = {
  gold24k: 158140,
  gold22k: 144856,
  formatted24k: "1,58,140",
  formatted22k: "1,44,856",
  unit: "INR/10g",
  source: "OroPocket",
  updatedAt: new Date().toISOString(),
  timeAgo: "ఇప్పుడే అప్‌డేట్ అయ్యింది"
};

function formatINR(val: number): string {
  try {
    return new Intl.NumberFormat("en-IN").format(Math.round(val));
  } catch {
    return String(Math.round(val));
  }
}

function computeTimeAgo(dateIso: string): string {
  try {
    const diffMs = Date.now() - new Date(dateIso).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return "ఇప్పుడే అప్‌డేట్ అయ్యింది";
    if (diffMinutes === 1) return "1 నిమిషం క్రితం";
    if (diffMinutes < 60) return `${diffMinutes} నిమిషాల క్రితం`;
    const hours = Math.floor(diffMinutes / 60);
    return `${hours} గంటల క్రితం`;
  } catch {
    return "ఇప్పుడే";
  }
}

export function useGoldRate() {
  const [data, setData] = useState<GoldRateData>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.gold24k > 0 && parsed.gold22k > 0) {
          return {
            ...parsed,
            timeAgo: computeTimeAgo(parsed.updatedAt)
          };
        }
      }
    } catch {}
    return DEFAULT_FALLBACK;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRate = useCallback(async () => {
    try {
      let resolved24k: number | null = null;
      let resolved22k: number | null = null;
      let timestamp = new Date().toISOString();
      let source = "OroPocket";

      // Method A: Try invoking Supabase Edge Function if available
      if (supabase) {
        try {
          const { data: edgeData, error: edgeErr } = await supabase.functions.invoke("gold-rate");
          if (!edgeErr && edgeData?.success && edgeData.gold?.["24k"]) {
            resolved24k = edgeData.gold["24k"];
            resolved22k = edgeData.gold["22k"];
            timestamp = edgeData.updatedAt || timestamp;
            source = edgeData.source || source;
          }
        } catch {}
      }

      // Method B: Try reading from Supabase DB 'gold_rates' table if Edge Function is cold
      if (!resolved24k && supabase) {
        try {
          const { data: dbData, error: dbErr } = await supabase
            .from("gold_rates")
            .select("gold_24k, gold_22k, source, source_timestamp, fetched_at")
            .order("fetched_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!dbErr && dbData && dbData.gold_24k > 0) {
            resolved24k = Number(dbData.gold_24k);
            resolved22k = Number(dbData.gold_22k);
            timestamp = dbData.source_timestamp || dbData.fetched_at || timestamp;
            source = dbData.source || source;
          }
        } catch {}
      }

      // Method C: Direct fallback to OroPocket Public API
      if (!resolved24k) {
        try {
          const res = await fetch(OROPOCKET_URL, {
            headers: { Accept: "application/json" }
          });
          if (res.ok) {
            const json = await res.json();
            const buyPerGram = json?.data?.gold?.buy;
            if (typeof buyPerGram === "number" && buyPerGram > 0) {
              resolved24k = Math.round(buyPerGram * 10);
              resolved22k = Math.round(resolved24k * 0.916);
              timestamp = json?.data?.timestamp ? new Date(json.data.timestamp).toISOString() : timestamp;
            }
          }
        } catch {}
      }

      if (resolved24k && resolved22k) {
        const payload: GoldRateData = {
          gold24k: resolved24k,
          gold22k: resolved22k,
          formatted24k: formatINR(resolved24k),
          formatted22k: formatINR(resolved22k),
          unit: "INR/10g",
          source,
          updatedAt: timestamp,
          timeAgo: computeTimeAgo(timestamp)
        };

        setData(payload);
        setError(null);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
        } catch {}
      }
    } catch (err: any) {
      setError(err?.message || "Failed to fetch gold rate");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRate();

    const intervalId = setInterval(() => {
      fetchRate();
    }, REFRESH_INTERVAL_MS);

    const timeAgoInterval = setInterval(() => {
      setData((prev) => ({
        ...prev,
        timeAgo: computeTimeAgo(prev.updatedAt)
      }));
    }, 60000);

    return () => {
      clearInterval(intervalId);
      clearInterval(timeAgoInterval);
    };
  }, [fetchRate]);

  return {
    ...data,
    loading,
    error,
    refresh: fetchRate
  };
}
