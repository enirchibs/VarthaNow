import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

// CORS Headers for API access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS"
};

const OROPOCKET_PRICES_URL = "https://api.oropocket.com/public/prices";
const CACHE_MAX_AGE_MS = 20 * 60 * 1000; // 20 minutes

serve(async (req) => {
  // Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Optional query param ?force=true allows manual refresh bypass
  const url = new URL(req.url);
  const forceRefresh = url.searchParams.get("force") === "true";

  // Initialize Supabase Client with service role if available
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = (supabaseUrl && serviceRoleKey)
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      })
    : null;

  let latestCachedRow: any = null;

  // 1. Check existing cached gold rate from database
  if (supabase && !forceRefresh) {
    try {
      const { data, error } = await supabase
        .from("gold_rates")
        .select("gold_24k, gold_22k, unit, source, source_timestamp, fetched_at")
        .order("fetched_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data && data.gold_24k > 0 && data.gold_22k > 0) {
        latestCachedRow = data;
        const cacheAge = Date.now() - new Date(data.fetched_at).getTime();
        
        // If cache is fresh (< 20 minutes), return it immediately
        if (cacheAge < CACHE_MAX_AGE_MS) {
          return new Response(
            JSON.stringify({
              success: true,
              gold: {
                "24k": Number(data.gold_24k),
                "22k": Number(data.gold_22k),
                unit: data.unit || "INR/10g"
              },
              source: "OroPocket",
              updatedAt: data.source_timestamp || data.fetched_at,
              cached: true
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200
            }
          );
        }
      }
    } catch (dbErr: any) {
      console.warn("Supabase cache check warning:", dbErr.message);
    }
  }

  // 2. Fetch fresh Gold rates from OroPocket public API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const oroResponse = await fetch(OROPOCKET_PRICES_URL, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "VaartaNow-GoldRate-Bot/1.0"
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!oroResponse.ok) {
      throw new Error(`OroPocket API returned status ${oroResponse.status}`);
    }

    const payload = await oroResponse.json();

    // 3. Validate response structure
    const goldData = payload?.data?.gold;
    const rawBuyPrice = goldData?.buy;

    if (typeof rawBuyPrice !== "number" || isNaN(rawBuyPrice) || rawBuyPrice <= 0) {
      throw new Error("Invalid or missing gold buy price from OroPocket API");
    }

    // 4. Formula conversions:
    // OroPocket provides BUY price in INR per gram
    // 24K INR/10g = Gold Buy INR/g × 10
    const gold24k = Math.round(rawBuyPrice * 10);

    // Indicative 22K derived from 24K × 0.916, rounded to nearest rupee
    const gold22k = Math.round(gold24k * 0.916);

    const sourceTimestamp = payload?.data?.timestamp
      ? new Date(payload.data.timestamp).toISOString()
      : new Date().toISOString();

    // 5. Cache to Supabase table
    if (supabase) {
      try {
        await supabase.from("gold_rates").insert({
          gold_24k: gold24k,
          gold_22k: gold22k,
          unit: "INR/10g",
          source: "OroPocket",
          source_timestamp: sourceTimestamp,
          fetched_at: new Date().toISOString()
        });

        // Housekeeping: delete rows older than 7 days to prevent unbounded growth
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        await supabase.from("gold_rates").delete().lt("fetched_at", sevenDaysAgo);
      } catch (insertErr: any) {
        console.warn("Failed saving gold rate to Supabase cache table:", insertErr.message);
      }
    }

    // 6. Return normalized JSON
    return new Response(
      JSON.stringify({
        success: true,
        gold: {
          "24k": gold24k,
          "22k": gold22k,
          unit: "INR/10g"
        },
        source: "OroPocket",
        updatedAt: sourceTimestamp
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (apiError: any) {
    console.error("OroPocket fetch error:", apiError.message);

    // 7. Fallback: Return previously cached row if available
    if (latestCachedRow && latestCachedRow.gold_24k > 0) {
      return new Response(
        JSON.stringify({
          success: true,
          gold: {
            "24k": Number(latestCachedRow.gold_24k),
            "22k": Number(latestCachedRow.gold_22k),
            unit: latestCachedRow.unit || "INR/10g"
          },
          source: "OroPocket",
          updatedAt: latestCachedRow.source_timestamp || latestCachedRow.fetched_at,
          stale: true
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }

    // 8. Graceful controlled failure if neither API nor DB is available
    return new Response(
      JSON.stringify({
        success: false,
        gold: null,
        source: "OroPocket",
        error: "Gold price temporarily unavailable"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  }
});
