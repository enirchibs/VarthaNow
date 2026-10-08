export type CricketMatchStatus = "live" | "upcoming" | "completed";
export type CricketMatchType = "ipl" | "t20" | "regular" | "odi" | "test";

export interface CricketMatch {
  id: string;
  type: CricketMatchType;
  status: CricketMatchStatus;
  series: string;
  matchDesc: string;
  team1: {
    name: string;
    fullName: string;
    logo: string;
    /** Real flag/icon image URL (preferred over emoji on Windows). */
    flagUrl?: string | null;
    score?: string;
    overs?: string;
  };
  team2: {
    name: string;
    fullName: string;
    logo: string;
    flagUrl?: string | null;
    score?: string;
    overs?: string;
  };
  venue: string;
  time: string;
  result?: string;
  startMs?: number;
}

export type CricketWinnerSide = "team1" | "team2" | "tie" | null;

function teamMentionedIn(text: string, team: CricketMatch["team1"]): boolean {
  const hay = text.toLowerCase();
  const candidates = [team.fullName, team.name]
    .filter(Boolean)
    .map((s) => s.toLowerCase().trim())
    .sort((a, b) => b.length - a.length);
  return candidates.some((c) => {
    if (c.length <= 3) return new RegExp(`\\b${c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(hay);
    return hay.includes(c);
  });
}

/** Figure out who won from Cricbuzz-style result text (e.g. "England won by 5 wickets"). */
export function detectMatchWinner(match: CricketMatch): CricketWinnerSide {
  if (match.status !== "completed") return null;
  const result = (match.result || "").toLowerCase();
  if (!result) return null;
  if (/\b(tied|tie|draw|no result|abandoned|cancelled)\b/i.test(result)) return "tie";

  const wonIdx = result.search(/\bwon\b|\bbeat\b|\bdefeated\b/);
  if (wonIdx >= 0) {
    const before = result.slice(0, wonIdx);
    const t1 = teamMentionedIn(before, match.team1);
    const t2 = teamMentionedIn(before, match.team2);
    if (t1 && !t2) return "team1";
    if (t2 && !t1) return "team2";
  }

  const t1Hit = teamMentionedIn(result, match.team1);
  const t2Hit = teamMentionedIn(result, match.team2);
  if (t1Hit && !t2Hit) return "team1";
  if (t2Hit && !t1Hit) return "team2";
  return null;
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
  INDIA: "🇮🇳",
  WI: "🇧🇧",
  "WEST INDIES": "🇧🇧",
  AUS: "🇦🇺",
  AUSTRALIA: "🇦🇺",
  ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  ENGLAND: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  PAK: "🇵🇰",
  PAKISTAN: "🇵🇰",
  SL: "🇱🇰",
  "SRI LANKA": "🇱🇰",
  BAN: "🇧🇩",
  BANGLADESH: "🇧🇩",
  NZ: "🇳🇿",
  "NEW ZEALAND": "🇳🇿",
  SA: "🇿🇦",
  "SOUTH AFRICA": "🇿🇦",
  AFG: "🇦🇫",
  AFGHANISTAN: "🇦🇫",
  IRE: "🇮🇪",
  IRELAND: "🇮🇪",
  ZIM: "🇿🇼",
  ZIMBABWE: "🇿🇼",
  NED: "🇳🇱",
  NETHERLANDS: "🇳🇱",
  SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  SCOTLAND: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
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

/** Display labels for common country short codes */
const SHORT_LABEL: Record<string, string> = {
  IND: "IND",
  WI: "WI",
  AUS: "AUS",
  ENG: "ENG",
  PAK: "PAK",
  SL: "SL",
  BAN: "BAN",
  NZ: "NZ",
  SA: "SA",
  AFG: "AFG",
  IRE: "IRE",
  ZIM: "ZIM",
  NED: "NED",
  SCO: "SCO",
  UAE: "UAE",
  USA: "USA",
};

/** ISO / regional codes for flagcdn.com image icons */
const FLAG_ISO: Record<string, string> = {
  IND: "in",
  ENG: "gb-eng",
  AUS: "au",
  PAK: "pk",
  SL: "lk",
  BAN: "bd",
  NZ: "nz",
  SA: "za",
  AFG: "af",
  IRE: "ie",
  ZIM: "zw",
  NED: "nl",
  SCO: "gb-sct",
  UAE: "ae",
  USA: "us",
  // West Indies — no single flag; use Windies green via Barbados as closest common proxy
  WI: "bb",
};

/** IPL / franchise badge colors when no country flag exists */
const FRANCHISE_COLOR: Record<string, string> = {
  RCB: "#d32f2f",
  GT: "#1a237e",
  CSK: "#f9a825",
  MI: "#1565c0",
  KKR: "#6a1b9a",
  SRH: "#e65100",
  RR: "#c2185b",
  DC: "#0d47a1",
  PBKS: "#b71c1c",
  LSG: "#0277bd",
};

export function getTeamFlagUrl(codeOrName?: string): string | null {
  const code = stripChampionsCode(codeOrName || "") || (codeOrName || "").toUpperCase().trim();
  if (!code) return null;
  const iso = FLAG_ISO[code];
  if (iso) return `https://flagcdn.com/w80/${iso}.png`;
  return null;
}

export function getFranchiseColor(codeOrName?: string): string | null {
  const code = stripChampionsCode(codeOrName || "") || (codeOrName || "").toUpperCase().trim();
  return FRANCHISE_COLOR[code] || null;
}

/**
 * Cricbuzz "Champions" / legends sides use codes like ENGCH, WICH, INDCH.
 * Strip that CH suffix so we can show ENG + England flag.
 */
function stripChampionsCode(code: string): string {
  const raw = (code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!raw) return "";
  // ENGCH → ENG, WICH → WI, AUSCH → AUS (keep real codes like CSK untouched)
  if (raw.length >= 4 && raw.endsWith("CH") && !["CSK"].includes(raw)) {
    return raw.slice(0, -2);
  }
  return raw;
}

function cleanTeamFullName(name?: string): string {
  return (name || "")
    .replace(/\bChampions?\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function countryCodeFromName(fullName?: string): string | undefined {
  const n = (fullName || "").toLowerCase();
  if (!n) return undefined;
  if (n.includes("west ind")) return "WI";
  if (n.includes("england") || n.includes("eng ")) return "ENG";
  if (n.includes("india")) return "IND";
  if (n.includes("australia")) return "AUS";
  if (n.includes("pakistan")) return "PAK";
  if (n.includes("sri lanka")) return "SL";
  if (n.includes("bangladesh")) return "BAN";
  if (n.includes("new zealand")) return "NZ";
  if (n.includes("south africa")) return "SA";
  if (n.includes("afghanistan")) return "AFG";
  if (n.includes("ireland")) return "IRE";
  if (n.includes("zimbabwe")) return "ZIM";
  if (n.includes("netherlands")) return "NED";
  if (n.includes("scotland")) return "SCO";
  return undefined;
}

function resolveTeamIdentity(shortName?: string, fullName?: string): {
  name: string;
  fullName: string;
  logo: string;
  flagUrl: string | null;
} {
  const cleanedFull = cleanTeamFullName(fullName) || cleanTeamFullName(shortName);
  const code =
    stripChampionsCode(shortName || "") ||
    countryCodeFromName(cleanedFull) ||
    stripChampionsCode(fullName || "");

  const logo =
    (code && FLAG[code]) ||
    FLAG[(cleanedFull || "").toUpperCase()] ||
    teamEmojiFallback(code, cleanedFull);

  const name = (code && SHORT_LABEL[code]) || code || cleanedFull || shortName || "TBD";

  return {
    name,
    fullName: cleanedFull || name,
    logo,
    flagUrl: getTeamFlagUrl(code) || getTeamFlagUrl(name),
  };
}

function teamEmojiFallback(shortName?: string, fullName?: string): string {
  const key = (shortName || "").toUpperCase();
  if (FLAG[key]) return FLAG[key];
  const name = (fullName || shortName || "?").trim();
  // Prefer cricket ball over a bare letter when we can't map a flag
  if (!name) return "🏏";
  return FLAG[name.toUpperCase()] || "🏏";
}

function teamEmoji(shortName?: string, fullName?: string): string {
  return resolveTeamIdentity(shortName, fullName).logo;
}

/** Re-apply clean names + flags on matches coming from any source (proxy may send ENGCH + "E"). */
export function polishCricketMatches(matches: CricketMatch[]): CricketMatch[] {
  return matches.map((m) => {
    const t1 = resolveTeamIdentity(m.team1.name, m.team1.fullName);
    const t2 = resolveTeamIdentity(m.team2.name, m.team2.fullName);
    return {
      ...m,
      team1: {
        ...m.team1,
        name: t1.name,
        fullName: t1.fullName,
        logo: t1.logo,
        flagUrl: t1.flagUrl,
      },
      team2: {
        ...m.team2,
        name: t2.name,
        fullName: t2.fullName,
        logo: t2.logo,
        flagUrl: t2.flagUrl,
      },
    };
  });
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

      const t1 = resolveTeamIdentity(info.team1?.teamSName, info.team1?.teamName);
      const t2 = resolveTeamIdentity(info.team2?.teamSName, info.team2?.teamName);
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
          name: t1.name,
          fullName: t1.fullName,
          logo: t1.logo,
          flagUrl: t1.flagUrl,
          score: t1Score.score,
          overs: t1Score.overs,
        },
        team2: {
          name: t2.name,
          fullName: t2.fullName,
          logo: t2.logo,
          flagUrl: t2.flagUrl,
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
    // Proxy may send raw codes (ENGCH) + letter logos — polish flags/names
    if (data.matches[0]?.team1?.name) {
      return sortMatches(polishCricketMatches(data.matches as CricketMatch[]));
    }
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
    if (data.matches[0]?.team1?.name) {
      return sortMatches(polishCricketMatches(data.matches as CricketMatch[]));
    }
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
      const t1Raw = m.teamInfo?.[0]?.shortname || m.teams?.[0] || "T1";
      const t2Raw = m.teamInfo?.[1]?.shortname || m.teams?.[1] || "T2";
      const t1Full = m.teamInfo?.[0]?.name || m.teams?.[0] || t1Raw;
      const t2Full = m.teamInfo?.[1]?.name || m.teams?.[1] || t2Raw;
      const t1 = resolveTeamIdentity(t1Raw, t1Full);
      const t2 = resolveTeamIdentity(t2Raw, t2Full);
      const score1 = Array.isArray(m.score) ? m.score[0] : null;
      const score2 = Array.isArray(m.score) ? m.score[1] : null;
      return {
        id: String(m.id || m.name),
        type: mapType(m.matchType, m.name),
        status,
        series: m.name || "Cricket",
        matchDesc: m.matchType || "",
        team1: {
          name: t1.name,
          fullName: t1.fullName,
          logo: t1.logo,
          flagUrl: t1.flagUrl,
          score: score1 ? `${score1.r}/${score1.w}` : undefined,
          overs: score1?.o != null ? String(score1.o) : undefined,
        },
        team2: {
          name: t2.name,
          fullName: t2.fullName,
          logo: t2.logo,
          flagUrl: t2.flagUrl,
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
