export type CricketMatchStatus = "live" | "upcoming" | "completed";
export type CricketMatchType = "ipl" | "t20" | "regular" | "odi" | "test";

export interface CricketMatch {
  id: string;
  type: CricketMatchType;
  status: CricketMatchStatus;
  series: string;
  matchDesc: string;
  team1: { name: string; fullName: string; logo: string; score?: string; overs?: string };
  team2: { name: string; fullName: string; logo: string; score?: string; overs?: string };
  venue: string;
  time: string;
  result?: string;
  startMs?: number;
}

interface CricbuzzInnings {
  inningsId?: number;
  runs?: number;
  wickets?: number;
  overs?: number;
  isDeclared?: boolean;
}

interface CricbuzzHomeMatch {
  match?: {
    matchInfo?: {
      matchId?: number;
      seriesName?: string;
      matchDesc?: string;
      matchFormat?: string;
      startDate?: string | number;
      state?: string;
      status?: string;
      team1?: { teamId?: number; teamName?: string; teamSName?: string; imageId?: number };
      team2?: { teamId?: number; teamName?: string; teamSName?: string; imageId?: number };
      venueInfo?: { ground?: string; city?: string; timezone?: string };
    };
    matchScore?: {
      team1Score?: Record<string, CricbuzzInnings>;
      team2Score?: Record<string, CricbuzzInnings>;
    };
  };
}

const FLAG: Record<string, string> = {
  IND: "🇮🇳",
  WI: "🌴",
  AUS: "🇦🇺",
  ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  PAK: "🇵🇰",
  SL: "🇱🇰",
  BAN: "🇧🇩",
  NZ: "🇳🇿",
  SA: "🇿🇦",
  AFG: "🇦🇫",
  IRE: "🇮🇪",
  ZIM: "🇿🇼",
  NED: "🇳🇱",
  SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  UAE: "🇦🇪",
  USA: "🇺🇸",
  RCB: "🔴",
  GT: "🔵",
  CSK: "🟡",
  MI: "💙",
  KKR: "🟣",
  SRH: "🟠",
  RR: "🩷",
  DC: "🔷",
  PBKS: "❤️",
  LSG: "🩵",
};

function teamEmoji(shortName?: string, fullName?: string): string {
  const key = (shortName || "").toUpperCase();
  if (FLAG[key]) return FLAG[key];
  const name = (fullName || shortName || "?").trim();
  return name.charAt(0).toUpperCase() || "🏏";
}

function formatInnings(scoreMap?: Record<string, CricbuzzInnings>): { score?: string; overs?: string } {
  if (!scoreMap) return {};
  const innings = Object.values(scoreMap).filter(Boolean);
  if (!innings.length) return {};

  const score = innings
    .map((inn) => {
      const runs = inn.runs ?? 0;
      const wickets = inn.wickets ?? 0;
      const declared = inn.isDeclared ? "d" : "";
      return `${runs}/${wickets}${declared}`;
    })
    .join(" & ");

  const last = innings[innings.length - 1];
  const overs =
    typeof last?.overs === "number" && Number.isFinite(last.overs)
      ? String(last.overs)
      : undefined;

  return { score, overs };
}

function mapStatus(state?: string, statusText?: string): CricketMatchStatus {
  const s = `${state || ""} ${statusText || ""}`.toLowerCase();
  if (s.includes("progress") || s.includes("live") || s.includes("innings break") || s.includes("drink")) {
    return "live";
  }
  if (
    s.includes("complete") ||
    s.includes("won") ||
    s.includes("draw") ||
    s.includes("tie") ||
    s.includes("no result") ||
    s.includes("abandoned")
  ) {
    return "completed";
  }
  return "upcoming";
}

function mapType(format?: string, series?: string): CricketMatchType {
  const f = `${format || ""} ${series || ""}`.toLowerCase();
  if (f.includes("ipl")) return "ipl";
  if (f.includes("test")) return "test";
  if (f.includes("odi") || f.includes("one-day") || f.includes("list a")) return "odi";
  if (f.includes("t20") || f.includes("twenty20")) return "t20";
  return "regular";
}

function formatStartTime(startMs?: number, statusText?: string, matchStatus?: CricketMatchStatus): string {
  if (matchStatus === "live") return "Live Now";
  if (matchStatus === "completed") return "Completed";
  if (statusText && /starts?/i.test(statusText)) return statusText.replace(/^Match\s+/i, "");
  if (!startMs) return statusText || "TBD";
  try {
    return new Date(startMs).toLocaleString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return statusText || "TBD";
  }
}

export function normalizeCricbuzzHome(payload: { matches?: CricbuzzHomeMatch[] }): CricketMatch[] {
  const rows = Array.isArray(payload?.matches) ? payload.matches : [];
  return rows
    .map((row) => {
      const info = row.match?.matchInfo;
      if (!info?.matchId) return null;

      const t1Short = info.team1?.teamSName || info.team1?.teamName || "T1";
      const t2Short = info.team2?.teamSName || info.team2?.teamName || "T2";
      const t1Full = info.team1?.teamName || t1Short;
      const t2Full = info.team2?.teamName || t2Short;
      const status = mapStatus(info.state, info.status);
      const startMs = info.startDate ? Number(info.startDate) : undefined;
      const t1Score = formatInnings(row.match?.matchScore?.team1Score);
      const t2Score = formatInnings(row.match?.matchScore?.team2Score);
      const venueParts = [info.venueInfo?.ground, info.venueInfo?.city].filter(Boolean);

      const match: CricketMatch = {
        id: String(info.matchId),
        type: mapType(info.matchFormat, info.seriesName),
        status,
        series: info.seriesName || "Cricket",
        matchDesc: info.matchDesc || info.matchFormat || "",
        team1: {
          name: t1Short,
          fullName: t1Full,
          logo: teamEmoji(t1Short, t1Full),
          score: t1Score.score,
          overs: t1Score.overs,
        },
        team2: {
          name: t2Short,
          fullName: t2Full,
          logo: teamEmoji(t2Short, t2Full),
          score: t2Score.score,
          overs: t2Score.overs,
        },
        venue: venueParts.join(", ") || "Venue TBA",
        time: formatStartTime(startMs, info.status, status),
        result: status === "upcoming" ? undefined : info.status,
        startMs,
      };
      return match;
    })
    .filter(Boolean) as CricketMatch[];
}

function sortMatches(matches: CricketMatch[]): CricketMatch[] {
  const rank: Record<CricketMatchStatus, number> = { live: 0, upcoming: 1, completed: 2 };
  return [...matches].sort((a, b) => {
    const byStatus = rank[a.status] - rank[b.status];
    if (byStatus !== 0) return byStatus;
    return (b.startMs || 0) - (a.startMs || 0);
  });
}

async function fetchViaProxy(force = false): Promise<CricketMatch[] | null> {
  const url = force ? "/api/cricket?force=1" : "/api/cricket";
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const data = await res.json();
  if (Array.isArray(data?.matches) && data.matches.length) {
    // already normalized by our proxy
    if (data.matches[0]?.team1?.name) return sortMatches(data.matches as CricketMatch[]);
  }
  if (data?.raw || data?.matches) {
    return sortMatches(normalizeCricbuzzHome(data.raw || data));
  }
  return null;
}

async function fetchViaSupabase(): Promise<CricketMatch[] | null> {
  try {
    const { supabase } = await import("@/lib/supabase");
    if (!supabase) return null;
    const { data, error } = await supabase.functions.invoke("cricket-scores");
    if (error || !data?.matches?.length) return null;
    if (data.matches[0]?.team1?.name) return sortMatches(data.matches as CricketMatch[]);
    return sortMatches(normalizeCricbuzzHome(data));
  } catch {
    return null;
  }
}

async function fetchViaCricApi(): Promise<CricketMatch[] | null> {
  const key = import.meta.env.VITE_CRICAPI_KEY as string | undefined;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://api.cricapi.com/v1/currentMatches?apikey=${encodeURIComponent(key)}&offset=0`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.status === "failure" || !Array.isArray(data?.data)) return null;

    const mapped: CricketMatch[] = data.data.map((m: any) => {
      const statusText = String(m.status || m.matchStarted === true ? "Live" : "Upcoming");
      const isLive = Boolean(m.matchStarted) && !m.matchEnded;
      const isDone = Boolean(m.matchEnded);
      const status: CricketMatchStatus = isLive ? "live" : isDone ? "completed" : "upcoming";
      const t1 = m.teams?.[0] || m.teamInfo?.[0]?.shortname || "T1";
      const t2 = m.teams?.[1] || m.teamInfo?.[1]?.shortname || "T2";
      const score1 = Array.isArray(m.score) ? m.score[0] : null;
      const score2 = Array.isArray(m.score) ? m.score[1] : null;
      return {
        id: String(m.id || m.name),
        type: mapType(m.matchType, m.name),
        status,
        series: m.name || "Cricket",
        matchDesc: m.matchType || "",
        team1: {
          name: t1,
          fullName: t1,
          logo: teamEmoji(t1, t1),
          score: score1 ? `${score1.r}/${score1.w}` : undefined,
          overs: score1?.o != null ? String(score1.o) : undefined,
        },
        team2: {
          name: t2,
          fullName: t2,
          logo: teamEmoji(t2, t2),
          score: score2 ? `${score2.r}/${score2.w}` : undefined,
          overs: score2?.o != null ? String(score2.o) : undefined,
        },
        venue: m.venue || "Venue TBA",
        time: formatStartTime(m.dateTimeGMT ? Date.parse(m.dateTimeGMT) : undefined, statusText, status),
        result: status === "upcoming" ? undefined : statusText,
        startMs: m.dateTimeGMT ? Date.parse(m.dateTimeGMT) : undefined,
      };
    });
    return sortMatches(mapped);
  } catch {
    return null;
  }
}

/** Fetch live/current cricket matches (proxy → supabase → cricapi). */
export async function fetchLiveCricketMatches(force = false): Promise<{
  matches: CricketMatch[];
  source: string;
  updatedAt: string;
}> {
  const updatedAt = new Date().toISOString();

  const viaProxy = await fetchViaProxy(force).catch(() => null);
  if (viaProxy?.length) {
    return { matches: viaProxy, source: "Cricbuzz Live", updatedAt };
  }

  const viaSupabase = await fetchViaSupabase().catch(() => null);
  if (viaSupabase?.length) {
    return { matches: viaSupabase, source: "Cricbuzz Live", updatedAt };
  }

  const viaCricApi = await fetchViaCricApi().catch(() => null);
  if (viaCricApi?.length) {
    return { matches: viaCricApi, source: "CricAPI", updatedAt };
  }

  return { matches: [], source: "none", updatedAt };
}
