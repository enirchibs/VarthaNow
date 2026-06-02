import { useState, useEffect } from "react";
import { Sparkles, Share2, Award, Info, RefreshCw, Trophy } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface Match {
  id: string;
  type: "ipl" | "t20" | "regular";
  status: "live" | "upcoming" | "completed";
  series: string;
  team1: { name: string; logo: string; score?: string; overs?: string };
  team2: { name: string; logo: string; score?: string; overs?: string };
  venue: string;
  time: string;
  result?: string;
}

export function CricketLiveScoreHub() {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<"overview" | "t20" | "ipl" | "regular" | "series">("overview");
  const [pollVoted, setPollVoted] = useState(false);
  const [pollVotes, setPollVotes] = useState({ rcb: 28540, gt: 23110 });
  const [loading, setLoading] = useState(false);

  // Sample Match Data (Matches closely with user's attached screenshot layout)
  const [matches, setMatches] = useState<Match[]>([
    {
      id: "m1",
      type: "ipl",
      status: "upcoming",
      series: "IPL • Final",
      team1: { name: "RCB", logo: "🔴" },
      team2: { name: "GT", logo: "🔵" },
      venue: "Narendra Modi Stadium, Ahmedabad",
      time: "Sun, May 31, 7:30 PM",
    },
    {
      id: "m2",
      type: "t20",
      status: "live",
      series: "ICC Men's T20 World Cup",
      team1: { name: "IND", logo: "🇮🇳", score: "184/4", overs: "18.2" },
      team2: { name: "PAK", logo: "🇵🇰", score: "172/7", overs: "20.0" },
      venue: "Melbourne Cricket Ground",
      time: "Live Now",
      result: "India needs 11 runs in 10 balls"
    },
    {
      id: "m3",
      type: "regular",
      status: "completed",
      series: "India tour of Australia",
      team1: { name: "AUS", logo: "🇦🇺", score: "348 & 210", overs: "Test" },
      team2: { name: "IND", logo: "🇮🇳", score: "412 & 148/3", overs: "Test" },
      venue: "Sydney Cricket Ground",
      time: "Completed",
      result: "India won by 7 wickets"
    }
  ]);

  // Handle Refresh simulation
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      // Simulate live score update
      setMatches(prev => prev.map(m => {
        if (m.id === "m2" && m.team1.score) {
          return {
            ...m,
            team1: { ...m.team1, score: "191/4", overs: "19.1" },
            result: "India won by 6 wickets (5 balls remaining) 🎉"
          };
        }
        return m;
      }));
      setLoading(false);
    }, 800);
  };

  // Poll Vote Handler
  const handlePollVote = (team: "rcb" | "gt") => {
    if (pollVoted) return;
    setPollVotes(prev => ({ ...prev, [team]: prev[team] + 1 }));
    setPollVoted(true);
  };

  const totalVotes = pollVotes.rcb + pollVotes.gt;
  const rcbPercent = Math.round((pollVotes.rcb / totalVotes) * 100);
  const gtPercent = 100 - rcbPercent;

  // Filtered matches based on selected subcategory tab
  const filteredMatches = matches.filter(m => {
    if (activeTab === "overview") return true;
    return m.type === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Subcategory Filter Tabs */}
      <div className="flex border border-amber-500/30 bg-[hsl(var(--muted))]/40 p-1 rounded-full text-xs font-black w-full overflow-x-auto no-scrollbar gap-1 shadow-sm">
        {(["overview", "t20", "ipl", "regular", "series"] as const).map((tab) => {
          const labels: Record<string, Record<string, string>> = {
            overview: { te: "ఓవర్‌వ్యూ Overview", en: "Overview" },
            t20: { te: "T20 మ్యాచ్‌లు", en: "T20 Matches" },
            ipl: { te: "IPL టోర్నమెంట్", en: "IPL Matches" },
            regular: { te: "సాధారణ మ్యాచ్‌లు", en: "Regular Matches" },
            series: { te: "పాయింట్ల పట్టిక Series", en: "Points Table / Series" },
          };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 transition whitespace-nowrap font-extrabold flex-1 text-center ${
                activeTab === tab
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm"
                  : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
              }`}
            >
              {labels[tab][lang] || labels[tab].en}
            </button>
          );
        })}
      </div>

      {activeTab !== "series" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Match Scorecards Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-500 flex items-center gap-1.5">
                <Sparkles className="size-4 animate-pulse text-amber-500" />
                {lang === "te" ? "లైవ్ క్రికెట్ స్కోర్లు & షెడ్యూల్" : "Live Cricket Scores & Fixtures"}
              </h3>
              <button 
                onClick={handleRefresh}
                disabled={loading}
                className="text-xs font-black px-3 py-1.5 rounded-full border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] active:scale-95 transition flex items-center gap-1 bg-[hsl(var(--card))]"
              >
                <RefreshCw className={`size-3 ${loading ? 'animate-spin' : ''}`} />
                {lang === "te" ? "రిఫ్రెష్" : "Refresh"}
              </button>
            </div>

            <div className="space-y-4">
              {filteredMatches.map((match) => (
                <div 
                  key={match.id}
                  className="rounded-3xl border border-[hsl(var(--border))]/75 bg-[hsl(var(--card))] p-5 shadow-sm space-y-4 relative overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 border-l-emerald-500"
                >
                  {/* Top Status Row */}
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[9px] ${
                      match.status === "live" 
                        ? "bg-red-500/15 text-red-600 dark:text-red-400 animate-pulse border border-red-500/20"
                        : match.status === "upcoming"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        : "bg-zinc-500/15 text-zinc-500 border border-zinc-500/20"
                    }`}>
                      {match.status === "live" ? "🔴 Live" : match.status === "upcoming" ? "Upcoming" : "Completed"}
                    </span>
                    <span className="font-extrabold text-[hsl(var(--muted-foreground))]">
                      {match.series}
                    </span>
                  </div>

                  {/* Score Grid */}
                  <div className="grid grid-cols-5 gap-4 items-center">
                    <div className="col-span-2 space-y-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl shrink-0">{match.team1.logo}</span>
                        <span className="font-black text-sm text-[hsl(var(--foreground))]">{match.team1.name}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl shrink-0">{match.team2.logo}</span>
                        <span className="font-black text-sm text-[hsl(var(--foreground))]">{match.team2.name}</span>
                      </div>
                    </div>

                    <div className="col-span-3 text-right space-y-3">
                      {match.status !== "upcoming" ? (
                        <>
                          <div className="font-black text-sm">
                            {match.team1.score} <span className="text-[10px] text-[hsl(var(--muted-foreground))]">({match.team1.overs} ov)</span>
                          </div>
                          <div className="font-black text-sm">
                            {match.team2.score} <span className="text-[10px] text-[hsl(var(--muted-foreground))]">({match.team2.overs} ov)</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-right space-y-0.5">
                          <div className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Starts On</div>
                          <div className="text-xs font-black text-[hsl(var(--foreground))]">{match.time}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Result & Venue info */}
                  <div className="border-t border-[hsl(var(--border))]/50 pt-3 flex justify-between items-center text-[10px] font-bold text-[hsl(var(--muted-foreground))]">
                    <span>🏟️ {match.venue}</span>
                    {match.result && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                        {match.result}
                      </span>
                    )}
                  </div>

                  {/* Matches User interactive poll for RCB vs GT (As requested in image) */}
                  {match.id === "m1" && (
                    <div className="border-t border-[hsl(var(--border))]/50 pt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-[hsl(var(--foreground))]">
                          {lang === "te" ? "ఈ మ్యాచ్‌లో ఎవరు గెలుస్తారు? 🗳️" : "Who will win the match? 🗳️"}
                        </span>
                        <span className="text-[9px] font-mono text-[hsl(var(--muted-foreground))]">
                          46k+ users predicted
                        </span>
                      </div>
                      
                      {!pollVoted ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handlePollVote("rcb")}
                            className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs hover:shadow-red-500/10 transition active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                          >
                            🔴 RCB
                          </button>
                          <div className="size-8 rounded-full border border-[hsl(var(--border))] flex items-center justify-center text-[9px] font-black bg-[hsl(var(--card))] shrink-0">vs</div>
                          <button 
                            onClick={() => handlePollVote("gt")}
                            className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs hover:shadow-blue-500/10 transition active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                          >
                            🔵 GT
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 pt-1 text-xs">
                          <div className="space-y-1">
                            <div className="flex justify-between font-black text-[10px]">
                              <span className="text-red-600">RCB</span>
                              <span className="text-[hsl(var(--foreground))]">{rcbPercent}% ({pollVotes.rcb.toLocaleString()} votes)</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-[hsl(var(--muted))] overflow-hidden flex">
                              <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${rcbPercent}%` }} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between font-black text-[10px]">
                              <span className="text-blue-600">GT</span>
                              <span className="text-[hsl(var(--foreground))]">{gtPercent}% ({pollVotes.gt.toLocaleString()} votes)</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-[hsl(var(--muted))] overflow-hidden flex">
                              <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${gtPercent}%` }} />
                            </div>
                          </div>
                          <div className="text-[9px] font-black text-center text-emerald-600 dark:text-emerald-400 mt-2">
                            ✓ {lang === "te" ? "మీ క్రికెట్ ప్రిడిక్షన్ విజయవంతంగా నమోదైంది!" : "Your match prediction has been submitted!"}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: API Integration & Adsense */}
          <div className="lg:col-span-1 space-y-4">
            {/* Free Cricket API Info Box */}
            <div className="rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Info className="size-4" />
                {lang === "te" ? "ఉచిత క్రికెట్ API సమాచారం" : "Free Cricket API Guide"}
              </h4>
              <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] leading-relaxed">
                {lang === "te"
                  ? "నిజ సమయ లైవ్ స్కోర్ల కోసం మా కోడ్‌లో ఉచిత 'CricketData.org' API ని అనుసంధానించవచ్చు. ఇది రోజుకు 100 ఉచిత అభ్యర్థనలను అందిస్తుంది."
                  : "We recommend integrating the free 'CricketData.org' API or 'RapidAPI Cricbuzz' endpoint. They offer free plans with comprehensive live scorecards."}
              </p>
              <div className="p-3 bg-[hsl(var(--muted))] rounded-xl border border-[hsl(var(--border))]/50 font-mono text-[9px] text-[hsl(var(--muted-foreground))] space-y-1">
                <div className="font-bold text-[hsl(var(--foreground))]">// CricketData API Request</div>
                <div>fetch('https://api.cricketdata.org/v1/liveScore?apikey=YOUR_KEY')</div>
                <div>.then(res =&gt; res.json())</div>
                <div>.then(data =&gt; updateScores(data));</div>
              </div>
            </div>

            {/* Premium Cricket Sponsor Ad Card */}
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-sm relative group">
              <div className="h-24 bg-gradient-to-r from-emerald-600 to-teal-700 flex items-center justify-center p-4 relative">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531415080290-bc98545bab3c?w=400')] bg-cover opacity-15" />
                <h4 className="text-sm font-black text-white z-10 text-center tracking-wide">
                  CRICKET LEAGUE 2026
                </h4>
              </div>
              <div className="p-4 text-center space-y-2">
                <span className="text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">Sponsor</span>
                <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))]">
                  Play Fantasy Sports & win prizes daily! Powered by Hero Fincorp & Daikin.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Series Points Table Tab */
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[hsl(var(--border))]/50 pb-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-500 flex items-center gap-1.5">
              <Trophy className="size-4 text-amber-500 animate-bounce" />
              T20 Points Table (IPL 2026)
            </h3>
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">
              Updated Live
            </span>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs font-bold">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]/60 text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  <th className="py-2.5">Teams</th>
                  <th className="py-2.5 text-center">P</th>
                  <th className="py-2.5 text-center">W</th>
                  <th className="py-2.5 text-center">L</th>
                  <th className="py-2.5 text-center">NR</th>
                  <th className="py-2.5 text-center">NRR</th>
                  <th className="py-2.5 text-right">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]/40">
                {[
                  { name: "🔴 RCB (Royal Challengers)", p: 14, w: 9, l: 5, nr: 0, nrr: "+0.765", pts: 18 },
                  { name: "🔵 GT (Gujarat Titans)", p: 14, w: 9, l: 5, nr: 0, nrr: "+0.612", pts: 18 },
                  { name: "🟡 CSK (Chennai Super Kings)", p: 14, w: 8, l: 6, nr: 0, nrr: "+0.320", pts: 16 },
                  { name: "🔵 MI (Mumbai Indians)", p: 14, w: 7, l: 7, nr: 0, nrr: "-0.144", pts: 14 },
                  { name: "🟣 KKR (Kolkata Knight Riders)", p: 14, w: 6, l: 8, nr: 0, nrr: "-0.285", pts: 12 },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-[hsl(var(--muted))]/30 transition">
                    <td className="py-3 font-black text-[hsl(var(--foreground))]">{row.name}</td>
                    <td className="py-3 text-center">{row.p}</td>
                    <td className="py-3 text-center text-emerald-600 dark:text-emerald-400">{row.w}</td>
                    <td className="py-3 text-center text-red-500">{row.l}</td>
                    <td className="py-3 text-center">{row.nr}</td>
                    <td className="py-3 text-center font-mono">{row.nrr}</td>
                    <td className="py-3 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">{row.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
