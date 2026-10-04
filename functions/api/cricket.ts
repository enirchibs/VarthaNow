/**
 * Cloudflare Pages Function — proxies Cricbuzz live home feed
 * Available at: /api/cricket
 */

const CRICBUZZ_HOME = "https://www.cricbuzz.com/api/home";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "public, max-age=60",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function formatInnings(scoreMap?: Record<string, any>) {
  if (!scoreMap) return {};
  const innings = Object.values(scoreMap).filter(Boolean) as any[];
  if (!innings.length) return {};
  const score = innings
    .map((inn) => `${inn.runs ?? 0}/${inn.wickets ?? 0}${inn.isDeclared ? "d" : ""}`)
    .join(" & ");
  const last = innings[innings.length - 1];
  return {
    score,
    overs: typeof last?.overs === "number" ? String(last.overs) : undefined,
  };
}

function mapStatus(state?: string, statusText?: string) {
  const s = `${state || ""} ${statusText || ""}`.toLowerCase();
  if (s.includes("progress") || s.includes("live") || s.includes("innings break")) return "live";
  if (s.includes("complete") || s.includes("won") || s.includes("draw") || s.includes("tie")) {
    return "completed";
  }
  return "upcoming";
}

function mapType(format?: string, series?: string) {
  const f = `${format || ""} ${series || ""}`.toLowerCase();
  if (f.includes("ipl")) return "ipl";
  if (f.includes("test")) return "test";
  if (f.includes("odi")) return "odi";
  if (f.includes("t20")) return "t20";
  return "regular";
}

function normalize(payload: any) {
  const rows = Array.isArray(payload?.matches) ? payload.matches : [];
  return rows
    .map((row: any) => {
      const info = row?.match?.matchInfo;
      if (!info?.matchId) return null;
      const status = mapStatus(info.state, info.status);
      const t1 = info.team1?.teamSName || info.team1?.teamName || "T1";
      const t2 = info.team2?.teamSName || info.team2?.teamName || "T2";
      const t1Score = formatInnings(row?.match?.matchScore?.team1Score);
      const t2Score = formatInnings(row?.match?.matchScore?.team2Score);
      const startMs = info.startDate ? Number(info.startDate) : undefined;
      let time = info.status || "TBD";
      if (status === "live") time = "Live Now";
      else if (status === "completed") time = "Completed";
      else if (startMs) {
        time = new Date(startMs).toLocaleString("en-IN", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      }

      return {
        id: String(info.matchId),
        type: mapType(info.matchFormat, info.seriesName),
        status,
        series: info.seriesName || "Cricket",
        matchDesc: info.matchDesc || info.matchFormat || "",
        team1: {
          name: t1,
          fullName: info.team1?.teamName || t1,
          logo: (t1 || "?").charAt(0),
          score: t1Score.score,
          overs: t1Score.overs,
        },
        team2: {
          name: t2,
          fullName: info.team2?.teamName || t2,
          logo: (t2 || "?").charAt(0),
          score: t2Score.score,
          overs: t2Score.overs,
        },
        venue: [info.venueInfo?.ground, info.venueInfo?.city].filter(Boolean).join(", ") || "Venue TBA",
        time,
        result: status === "upcoming" ? undefined : info.status,
        startMs,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => {
      const rank: Record<string, number> = { live: 0, upcoming: 1, completed: 2 };
      return (rank[a.status] ?? 9) - (rank[b.status] ?? 9) || (b.startMs || 0) - (a.startMs || 0);
    });
}

export const onRequestOptions = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const onRequestGet = async () => {
  try {
    const upstream = await fetch(CRICBUZZ_HOME, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Referer: "https://www.cricbuzz.com/",
      },
    });

    if (!upstream.ok) {
      return json(
        { success: false, error: `Upstream ${upstream.status}`, matches: [] },
        502
      );
    }

    const raw = await upstream.json();
    const matches = normalize(raw);
    return json({
      success: true,
      source: "Cricbuzz",
      updatedAt: new Date().toISOString(),
      matches,
      raw,
    });
  } catch (error: any) {
    return json(
      { success: false, error: error?.message || "Failed to fetch cricket scores", matches: [] },
      500
    );
  }
};
