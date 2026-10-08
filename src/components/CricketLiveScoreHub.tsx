import { useCallback, useEffect, useMemo, useState } from "react";
import { Sparkles, RefreshCw, Trophy, AlertCircle, Crown } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import {
  detectMatchWinner,
  fetchLiveCricketMatches,
  getFranchiseColor,
  getTeamFlagUrl,
  type CricketMatch,
} from "@/lib/cricket-api";

type TeamInfo = CricketMatch["team1"];

/** Small flag / franchise icon beside team names (image icons work on Windows where emoji flags often fail). */
function TeamFlag({
  team,
  size = "md",
}: {
  team: TeamInfo;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "sm" ? "size-5" : size === "lg" ? "size-9" : "size-8";
  const flagUrl = team.flagUrl || getTeamFlagUrl(team.name) || getTeamFlagUrl(team.fullName);
  const franchise = getFranchiseColor(team.name);

  if (flagUrl) {
    return (
      <span
        className={`${dim} shrink-0 overflow-hidden rounded-full bg-[hsl(var(--muted))] shadow-sm ring-1 ring-[hsl(var(--border))]`}
        title={team.fullName || team.name}
      >
        <img
          src={flagUrl}
          alt=""
          className="size-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const el = e.currentTarget;
            el.style.display = "none";
            const parent = el.parentElement;
            if (parent && !parent.querySelector("[data-fallback]")) {
              const span = document.createElement("span");
              span.dataset.fallback = "1";
              span.className = "grid size-full place-items-center text-[11px] leading-none";
              span.textContent = team.logo || team.name.charAt(0);
              parent.appendChild(span);
            }
          }}
        />
      </span>
    );
  }

  if (franchise) {
    return (
      <span
        className={`${dim} grid shrink-0 place-items-center rounded-full text-[9px] font-black text-white shadow-sm ring-1 ring-white/30`}
        style={{ backgroundColor: franchise }}
        title={team.fullName || team.name}
      >
        {team.name.slice(0, 3)}
      </span>
    );
  }

  return (
    <span
      className={`${dim} grid shrink-0 place-items-center rounded-full bg-[hsl(var(--muted))] text-sm shadow-sm ring-1 ring-[hsl(var(--border))]`}
      title={team.fullName || team.name}
    >
      {team.logo || "🏏"}
    </span>
  );
}

const TE = {
  overview: "\u0C13\u0C35\u0C30\u0C4D\u200C\u0C35\u0C4D\u0C2F\u0C42 Overview",
  t20: "T20 \u0C2E\u0C4D\u0C2F\u0C3E\u0C1A\u0C4D\u200C\u0C32\u0C41",
  ipl: "IPL \u0C1F\u0C4B\u0C30\u0C4D\u0C28\u0C2E\u0C46\u0C02\u0C1F\u0C4D",
  regular: "\u0C38\u0C3E\u0C27\u0C3E\u0C30\u0C23 \u0C2E\u0C4D\u0C2F\u0C3E\u0C1A\u0C4D\u200C\u0C32\u0C41",
  series: "\u0C2A\u0C3E\u0C2F\u0C3F\u0C02\u0C1F\u0C4D\u0C32 \u0C2A\u0C1F\u0C4D\u0C1F\u0C3F\u0C15 Series",
  title: "\u0C32\u0C48\u0C35\u0C4D \u0C15\u0C4D\u0C30\u0C3F\u0C15\u0C46\u0C1F\u0C4D \u0C38\u0C4D\u0C15\u0C4B\u0C30\u0C4D\u0C32\u0C41 & \u0C37\u0C46\u0C21\u0C4D\u0C2F\u0C42\u0C32\u0C4D",
  refresh: "\u0C30\u0C3F\u0C2B\u0C4D\u0C30\u0C46\u0C37\u0C4D",
  source: "\u0C2E\u0C42\u0C32\u0C02",
  updated: "\u0C05\u0C2A\u0C4D\u200C\u0C21\u0C47\u0C1F\u0C4D",
  loading: "\u0C32\u0C48\u0C35\u0C4D \u0C38\u0C4D\u0C15\u0C4B\u0C30\u0C4D\u0C32\u0C41 \u0C32\u0C4B\u0C21\u0C4D \u0C05\u0C35\u0C41\u0C24\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C2F\u0C3F...",
  empty: "\u0C08 \u0C15\u0C47\u0C1F\u0C17\u0C3F\u0C30\u0C40\u0C32\u0C4B \u0C2E\u0C4D\u0C2F\u0C3E\u0C1A\u0C4D\u200C\u0C32\u0C41 \u0C32\u0C47\u0C35\u0C41",
  noLive:
    "\u0C2A\u0C4D\u0C30\u0C38\u0C4D\u0C24\u0C41\u0C24\u0C02 \u0C32\u0C48\u0C35\u0C4D \u0C2E\u0C4D\u0C2F\u0C3E\u0C1A\u0C4D \u0C21\u0C47\u0C1F\u0C3E \u0C32\u0C2D\u0C3F\u0C02\u0C1A\u0C32\u0C47\u0C26\u0C41. \u0C15\u0C3E\u0C38\u0C47\u0C2A\u0C1F\u0C3F \u0C24\u0C30\u0C4D\u0C35\u0C3E\u0C24 \u0C30\u0C3F\u0C2B\u0C4D\u0C30\u0C46\u0C37\u0C4D \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F.",
  poll: "\u0C08 \u0C2E\u0C4D\u0C2F\u0C3E\u0C1A\u0C4D\u200C\u0C32\u0C4B \u0C0E\u0C35\u0C30\u0C41 \u0C17\u0C46\u0C32\u0C41\u0C38\u0C4D\u0C24\u0C3E\u0C30\u0C41? \uD83D\uDDF3\uFE0F",
  seriesTitle: "\u0C2A\u0C4D\u0C30\u0C38\u0C4D\u0C24\u0C41\u0C24 \u0C38\u0C3F\u0C30\u0C40\u0C38\u0C4D / \u0C2E\u0C4D\u0C2F\u0C3E\u0C1A\u0C4D\u200C\u0C32\u0C41",
  noSeries: "\u0C38\u0C3F\u0C30\u0C40\u0C38\u0C4D \u0C21\u0C47\u0C1F\u0C3E \u0C32\u0C47\u0C26\u0C41",
  winner: "\u0C35\u0C3F\u0C1C\u0C47\u0C24",
  matchTied: "\u0C2E\u0C4D\u0C2F\u0C3E\u0C1A\u0C4D \u0C1F\u0C48",
};

export function CricketLiveScoreHub() {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<"overview" | "t20" | "ipl" | "regular" | "series">(
    "overview"
  );
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [source, setSource] = useState("—");
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollVoted, setPollVoted] = useState<Record<string, string>>({});
  const [pollVotes, setPollVotes] = useState<Record<string, { a: number; b: number }>>({});

  const loadMatches = useCallback(
    async (force = false) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchLiveCricketMatches(force);
        setMatches(result.matches);
        setSource(result.source);
        setUpdatedAt(result.updatedAt);
        if (!result.matches.length) {
          setError(lang === "te" ? TE.noLive : "No live cricket data available right now. Try refresh in a moment.");
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load cricket scores");
      } finally {
        setLoading(false);
      }
    },
    [lang]
  );

  useEffect(() => {
    loadMatches(false);
    const timer = window.setInterval(() => loadMatches(false), 90_000);
    return () => window.clearInterval(timer);
  }, [loadMatches]);

  const handlePollVote = (matchId: string, side: "a" | "b") => {
    if (pollVoted[matchId]) return;
    setPollVotes((prev) => {
      const current = prev[matchId] || {
        a: 1200 + (matchId.length % 40) * 37,
        b: 1100 + (matchId.length % 35) * 41,
      };
      return {
        ...prev,
        [matchId]: {
          a: side === "a" ? current.a + 1 : current.a,
          b: side === "b" ? current.b + 1 : current.b,
        },
      };
    });
    setPollVoted((prev) => ({ ...prev, [matchId]: side }));
  };

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (activeTab === "overview") return true;
      if (activeTab === "t20") return m.type === "t20" || m.type === "ipl";
      if (activeTab === "ipl") return m.type === "ipl" || /ipl/i.test(m.series);
      if (activeTab === "regular") return m.type === "regular" || m.type === "odi" || m.type === "test";
      return true;
    });
  }, [matches, activeTab]);

  const featuredUpcoming = filteredMatches.find((m) => m.status === "upcoming") || filteredMatches[0];

  const labels = {
    overview: { te: TE.overview, en: "Overview" },
    t20: { te: TE.t20, en: "T20 Matches" },
    ipl: { te: TE.ipl, en: "IPL Matches" },
    regular: { te: TE.regular, en: "Regular Matches" },
    series: { te: TE.series, en: "Points Table / Series" },
  };

  return (
    <div className="space-y-6">
      <div className="flex border border-amber-500/30 bg-[hsl(var(--muted))]/40 p-1 rounded-full text-xs font-black w-full overflow-x-auto no-scrollbar gap-1 shadow-sm">
        {(["overview", "t20", "ipl", "regular", "series"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-2 transition whitespace-nowrap font-extrabold flex-1 text-center ${
              activeTab === tab
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm"
                : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            {labels[tab][lang === "te" ? "te" : "en"]}
          </button>
        ))}
      </div>

      {activeTab !== "series" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center px-1 gap-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-500 flex items-center gap-1.5">
                <Sparkles className="size-4 animate-pulse text-amber-500" />
                {lang === "te" ? TE.title : "Live Cricket Scores & Fixtures"}
              </h3>
              <button
                onClick={() => loadMatches(true)}
                disabled={loading}
                className="text-xs font-black px-3 py-1.5 rounded-full border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] active:scale-95 transition flex items-center gap-1 bg-[hsl(var(--card))]"
              >
                <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
                {lang === "te" ? TE.refresh : "Refresh"}
              </button>
            </div>

            <div className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] px-1">
              {source !== "none" && source !== "—"
                ? `${lang === "te" ? TE.source : "Source"}: ${source}`
                : null}
              {updatedAt
                ? ` · ${lang === "te" ? TE.updated : "Updated"} ${new Date(updatedAt).toLocaleTimeString(
                    "en-IN",
                    { hour: "numeric", minute: "2-digit" }
                  )}`
                : null}
            </div>

            {error && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-bold text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {loading && !filteredMatches.length && (
                <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center text-sm font-bold text-[hsl(var(--muted-foreground))]">
                  {lang === "te" ? TE.loading : "Loading live scores..."}
                </div>
              )}

              {!loading && !filteredMatches.length && !error && (
                <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center text-sm font-bold text-[hsl(var(--muted-foreground))]">
                  {lang === "te" ? TE.empty : "No matches in this category"}
                </div>
              )}

              {filteredMatches.map((match) => {
                const votes = pollVotes[match.id] || {
                  a: 1200 + (match.id.length % 40) * 37,
                  b: 1100 + (match.id.length % 35) * 41,
                };
                const total = votes.a + votes.b;
                const aPct = Math.round((votes.a / total) * 100);
                const bPct = 100 - aPct;
                const showPoll = match.status === "upcoming" || match.id === featuredUpcoming?.id;
                const winner = detectMatchWinner(match);
                const winnerTeam =
                  winner === "team1" ? match.team1 : winner === "team2" ? match.team2 : null;
                const isDone = match.status === "completed";

                return (
                  <div
                    key={match.id}
                    className={`rounded-3xl border bg-[hsl(var(--card))] p-5 shadow-sm space-y-4 relative overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 ${
                      isDone && winnerTeam
                        ? "border-amber-400/80 border-l-amber-500 shadow-amber-500/10"
                        : match.status === "live"
                          ? "border-[hsl(var(--border))]/75 border-l-red-500"
                          : "border-[hsl(var(--border))]/75 border-l-emerald-500"
                    }`}
                  >
                    {isDone && winnerTeam && (
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />
                    )}

                    <div className="flex justify-between items-center text-xs gap-2">
                      <span
                        className={`font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[9px] ${
                          match.status === "live"
                            ? "bg-red-500/15 text-red-600 dark:text-red-400 animate-pulse border border-red-500/20"
                            : match.status === "upcoming"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {match.status === "live"
                          ? "Live"
                          : match.status === "upcoming"
                            ? "Upcoming"
                            : lang === "te"
                              ? "ముగిసింది"
                              : "Completed"}
                      </span>
                      <span className="font-extrabold text-[hsl(var(--muted-foreground))] text-right">
                        {match.series}
                        {match.matchDesc ? ` • ${match.matchDesc}` : ""}
                      </span>
                    </div>

                    {isDone && winnerTeam && (
                      <div className="flex items-center gap-2 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-yellow-400/10 to-emerald-500/10 px-3 py-2.5">
                        <Crown className="size-4 shrink-0 text-amber-500" />
                        <TeamFlag team={winnerTeam} size="lg" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300">
                            {lang === "te" ? TE.winner : "Winner"}
                          </p>
                          <p className="truncate text-sm font-black text-[hsl(var(--foreground))]">
                            {winnerTeam.fullName || winnerTeam.name}
                          </p>
                        </div>
                        <Trophy className="size-4 shrink-0 text-amber-500" />
                      </div>
                    )}

                    {isDone && winner === "tie" && (
                      <div className="rounded-2xl border border-zinc-400/30 bg-zinc-500/10 px-3 py-2 text-center text-xs font-black text-[hsl(var(--muted-foreground))]">
                        {lang === "te" ? TE.matchTied : "Match tied / no result"}
                      </div>
                    )}

                    <div className="grid grid-cols-5 gap-4 items-center">
                      <div className="col-span-2 space-y-2">
                        {([match.team1, match.team2] as const).map((team, idx) => {
                          const side = idx === 0 ? "team1" : "team2";
                          const isWinner = winner === side;
                          return (
                            <div
                              key={side}
                              className={`flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition ${
                                isWinner
                                  ? "bg-amber-500/15 ring-1 ring-amber-400/50"
                                  : isDone && winnerTeam
                                    ? "opacity-55"
                                    : ""
                              }`}
                            >
                              <TeamFlag team={team} size="md" />
                              <span
                                className={`font-black text-sm truncate ${
                                  isWinner
                                    ? "text-amber-800 dark:text-amber-200"
                                    : "text-[hsl(var(--foreground))]"
                                }`}
                              >
                                {team.name}
                              </span>
                              {isWinner && (
                                <span className="ml-auto shrink-0 rounded-full bg-amber-500 px-1.5 py-0.5 text-[8px] font-black uppercase text-white">
                                  Win
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="col-span-3 text-right space-y-2">
                        {match.status !== "upcoming" ? (
                          <>
                            {([match.team1, match.team2] as const).map((team, idx) => {
                              const side = idx === 0 ? "team1" : "team2";
                              const isWinner = winner === side;
                              return (
                                <div
                                  key={side}
                                  className={`font-black text-sm rounded-lg px-2 py-1.5 ${
                                    isWinner ? "bg-amber-500/10 text-amber-800 dark:text-amber-200" : ""
                                  }`}
                                >
                                  {team.score || "—"}{" "}
                                  {team.overs ? (
                                    <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                                      ({team.overs} ov)
                                    </span>
                                  ) : null}
                                </div>
                              );
                            })}
                          </>
                        ) : (
                          <div className="text-right space-y-0.5">
                            <div className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                              Starts On
                            </div>
                            <div className="text-xs font-black text-[hsl(var(--foreground))]">
                              {match.time}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-[hsl(var(--border))]/50 pt-3 flex justify-between items-center text-[10px] font-bold text-[hsl(var(--muted-foreground))] gap-2">
                      <span>Venue: {match.venue}</span>
                      {match.result && (
                        <span
                          className={`font-extrabold text-right ${
                            isDone
                              ? "text-amber-700 dark:text-amber-300"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {match.result}
                        </span>
                      )}
                    </div>

                    {showPoll && match.status !== "completed" && (
                      <div className="border-t border-[hsl(var(--border))]/50 pt-4 space-y-3">
                        <div className="text-xs font-black text-[hsl(var(--foreground))]">
                          {lang === "te" ? TE.poll : "Who will win the match?"}
                        </div>

                        {!pollVoted[match.id] ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePollVote(match.id, "a")}
                              className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs active:scale-95 shadow-md inline-flex items-center justify-center gap-1.5"
                            >
                              <TeamFlag team={match.team1} size="sm" />
                              {match.team1.name}
                            </button>
                            <div className="size-8 rounded-full border border-[hsl(var(--border))] flex items-center justify-center text-[9px] font-black bg-[hsl(var(--card))] shrink-0">
                              vs
                            </div>
                            <button
                              onClick={() => handlePollVote(match.id, "b")}
                              className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs active:scale-95 shadow-md inline-flex items-center justify-center gap-1.5"
                            >
                              <TeamFlag team={match.team2} size="sm" />
                              {match.team2.name}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2 pt-1 text-xs">
                            <div className="space-y-1">
                              <div className="flex justify-between font-black text-[10px]">
                                <span className="inline-flex items-center gap-1.5">
                                  <TeamFlag team={match.team1} size="sm" /> {match.team1.name}
                                </span>
                                <span>
                                  {aPct}% ({votes.a.toLocaleString()} votes)
                                </span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                                <div className="h-full bg-emerald-600" style={{ width: `${aPct}%` }} />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between font-black text-[10px]">
                                <span className="inline-flex items-center gap-1.5">
                                  <TeamFlag team={match.team2} size="sm" /> {match.team2.name}
                                </span>
                                <span>
                                  {bPct}% ({votes.b.toLocaleString()} votes)
                                </span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                                <div className="h-full bg-blue-600" style={{ width: `${bPct}%` }} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-sm">
              <div className="h-24 bg-gradient-to-r from-emerald-600 to-teal-700 flex items-center justify-center p-4">
                <h4 className="text-sm font-black text-white tracking-wide">LIVE CRICKET 2026</h4>
              </div>
              <div className="p-4 text-center space-y-2">
                <span className="text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">
                  Live Feed
                </span>
                <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))]">
                  {matches.length
                    ? `${matches.length} current matches loaded`
                    : "Waiting for live match feed..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[hsl(var(--border))]/50 pb-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-500 flex items-center gap-1.5">
              <Trophy className="size-4 text-amber-500" />
              {lang === "te" ? TE.seriesTitle : "Current Series / Matches"}
            </h3>
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">
              Live Feed
            </span>
          </div>

          <div className="space-y-3">
            {matches.length === 0 && (
              <p className="text-xs font-bold text-[hsl(var(--muted-foreground))]">
                {lang === "te" ? TE.noSeries : "No series data yet"}
              </p>
            )}
            {Object.entries(
              matches.reduce<Record<string, CricketMatch[]>>((acc, m) => {
                acc[m.series] = acc[m.series] || [];
                acc[m.series].push(m);
                return acc;
              }, {})
            ).map(([series, list]) => (
              <div key={series} className="rounded-2xl border border-[hsl(var(--border))]/60 p-3 space-y-2">
                <div className="text-xs font-black text-[hsl(var(--foreground))]">{series}</div>
                {list.map((m) => {
                  const w = detectMatchWinner(m);
                  const winnerTeam = w === "team1" ? m.team1 : w === "team2" ? m.team2 : null;
                  return (
                    <div
                      key={m.id}
                      className={`flex items-center justify-between gap-2 text-[11px] font-bold rounded-xl px-2 py-1.5 ${
                        winnerTeam
                          ? "bg-amber-500/10 text-amber-800 dark:text-amber-200"
                          : "text-[hsl(var(--muted-foreground))]"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5 min-w-0">
                        <TeamFlag team={m.team1} size="sm" />
                        <span className="truncate">{m.team1.name}</span>
                        <span className="opacity-50">vs</span>
                        <TeamFlag team={m.team2} size="sm" />
                        <span className="truncate">{m.team2.name}</span>
                        {winnerTeam && <Trophy className="size-3 shrink-0 text-amber-500" />}
                      </span>
                      <span
                        className={`shrink-0 text-right ${
                          winnerTeam
                            ? "text-amber-700 dark:text-amber-300"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {m.result || m.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
