import { useCallback, useEffect, useMemo, useState } from "react";
import { Sparkles, Info, RefreshCw, Trophy, AlertCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import {
  fetchLiveCricketMatches,
  type CricketMatch,
} from "@/lib/cricket-api";

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
  liveData: "\u0C32\u0C48\u0C35\u0C4D \u0C15\u0C4D\u0C30\u0C3F\u0C15\u0C46\u0C1F\u0C4D \u0C21\u0C47\u0C1F\u0C3E",
  liveHelp:
    "\u0C38\u0C4D\u0C15\u0C4B\u0C30\u0C4D\u0C32\u0C41 Cricbuzz \u0C32\u0C48\u0C35\u0C4D \u0C2B\u0C40\u0C21\u0C4D \u0C28\u0C41\u0C02\u0C1A\u0C3F \u0C06\u0C1F\u0C4B\u0C2E\u0C47\u0C1F\u0C3F\u0C15\u0C4D\u200C\u0C17\u0C3E \u0C35\u0C38\u0C4D\u0C24\u0C3E\u0C2F\u0C3F. \u0C30\u0C3F\u0C2B\u0C4D\u0C30\u0C46\u0C37\u0C4D \u0C2C\u0C1F\u0C28\u0C4D\u200C\u0C24\u0C4B \u0C24\u0C3E\u0C1C\u0C3E \u0C38\u0C4D\u0C15\u0C4B\u0C30\u0C41 \u0C1A\u0C42\u0C21\u0C02\u0C21\u0C3F.",
  seriesTitle: "\u0C2A\u0C4D\u0C30\u0C38\u0C4D\u0C24\u0C41\u0C24 \u0C38\u0C3F\u0C30\u0C40\u0C38\u0C4D / \u0C2E\u0C4D\u0C2F\u0C3E\u0C1A\u0C4D\u200C\u0C32\u0C41",
  noSeries: "\u0C38\u0C3F\u0C30\u0C40\u0C38\u0C4D \u0C21\u0C47\u0C1F\u0C3E \u0C32\u0C47\u0C26\u0C41",
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

                return (
                  <div
                    key={match.id}
                    className="rounded-3xl border border-[hsl(var(--border))]/75 bg-[hsl(var(--card))] p-5 shadow-sm space-y-4 relative overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 border-l-emerald-500"
                  >
                    <div className="flex justify-between items-center text-xs gap-2">
                      <span
                        className={`font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[9px] ${
                          match.status === "live"
                            ? "bg-red-500/15 text-red-600 dark:text-red-400 animate-pulse border border-red-500/20"
                            : match.status === "upcoming"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-zinc-500/15 text-zinc-500 border border-zinc-500/20"
                        }`}
                      >
                        {match.status === "live"
                          ? "Live"
                          : match.status === "upcoming"
                            ? "Upcoming"
                            : "Completed"}
                      </span>
                      <span className="font-extrabold text-[hsl(var(--muted-foreground))] text-right">
                        {match.series}
                        {match.matchDesc ? ` • ${match.matchDesc}` : ""}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-4 items-center">
                      <div className="col-span-2 space-y-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl shrink-0">{match.team1.logo}</span>
                          <span className="font-black text-sm text-[hsl(var(--foreground))]">
                            {match.team1.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl shrink-0">{match.team2.logo}</span>
                          <span className="font-black text-sm text-[hsl(var(--foreground))]">
                            {match.team2.name}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-3 text-right space-y-3">
                        {match.status !== "upcoming" ? (
                          <>
                            <div className="font-black text-sm">
                              {match.team1.score || "—"}{" "}
                              {match.team1.overs ? (
                                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                                  ({match.team1.overs} ov)
                                </span>
                              ) : null}
                            </div>
                            <div className="font-black text-sm">
                              {match.team2.score || "—"}{" "}
                              {match.team2.overs ? (
                                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                                  ({match.team2.overs} ov)
                                </span>
                              ) : null}
                            </div>
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
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-right">
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
                              className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs active:scale-95 shadow-md"
                            >
                              {match.team1.logo} {match.team1.name}
                            </button>
                            <div className="size-8 rounded-full border border-[hsl(var(--border))] flex items-center justify-center text-[9px] font-black bg-[hsl(var(--card))] shrink-0">
                              vs
                            </div>
                            <button
                              onClick={() => handlePollVote(match.id, "b")}
                              className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs active:scale-95 shadow-md"
                            >
                              {match.team2.logo} {match.team2.name}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2 pt-1 text-xs">
                            <div className="space-y-1">
                              <div className="flex justify-between font-black text-[10px]">
                                <span>{match.team1.name}</span>
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
                                <span>{match.team2.name}</span>
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
            <div className="rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Info className="size-4" />
                {lang === "te" ? TE.liveData : "Live Cricket Data"}
              </h4>
              <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] leading-relaxed">
                {lang === "te"
                  ? TE.liveHelp
                  : "Scores are pulled live from the Cricbuzz feed via our /api/cricket proxy. Use Refresh for the latest update."}
              </p>
              <div className="p-3 bg-[hsl(var(--muted))] rounded-xl border border-[hsl(var(--border))]/50 font-mono text-[9px] text-[hsl(var(--muted-foreground))] space-y-1">
                <div className="font-bold text-[hsl(var(--foreground))]">// Live cricket endpoint</div>
                <div>GET /api/cricket</div>
                <div>→ Cricbuzz current matches</div>
                <div>Auto-refresh every 90s</div>
              </div>
            </div>

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
                {list.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-2 text-[11px] font-bold text-[hsl(var(--muted-foreground))]"
                  >
                    <span>
                      {m.team1.name} vs {m.team2.name}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {m.result || m.time}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
