import { useEffect, useState } from "react";
import { 
  Volume2, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowUp, 
  ArrowDown, 
  RefreshCw, 
  Database,
  CheckCircle,
  XCircle,
  Zap,
  Lock
} from "lucide-react";

interface ProviderConfig {
  id: string;
  provider_name: string;
  enabled: boolean;
  priority: number;
  free_only: boolean;
  supports_telugu: boolean;
  model: string;
  voice: string;
  free_character_limit: number;
  status: string;
  circuit_breaker_failures?: number;
}

interface UsageLog {
  provider_id: string;
  characters_used: number;
  requests_used: number;
  last_success?: string;
  last_failure?: string;
}

export function TTSAdminDashboard() {
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [usage, setUsage] = useState<Record<string, UsageLog>>({});
  const [cacheCount, setCacheCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cfgRes, usageRes] = await Promise.all([
        fetch("/api/tts/config").then((r) => r.json()),
        fetch("/api/tts/usage").then((r) => r.json()),
      ]);

      if (cfgRes?.providers) {
        setProviders(cfgRes.providers);
      }

      if (usageRes?.usageLogs) {
        const map: Record<string, UsageLog> = {};
        for (const log of usageRes.usageLogs) {
          map[log.provider_id] = log;
        }
        setUsage(map);
      }

      if (usageRes?.cacheCount !== undefined) {
        setCacheCount(usageRes.cacheCount);
      }
    } catch (err: any) {
      setMessage("Failed to load TTS dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleEnable = async (id: string, currentEnabled: boolean) => {
    try {
      await fetch("/api/tts/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: id,
          updates: { enabled: !currentEnabled },
        }),
      });
      fetchData();
    } catch {}
  };

  const handleMovePriority = async (index: number, direction: "up" | "down") => {
    const newProviders = [...providers];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newProviders.length) return;

    const temp = newProviders[index];
    newProviders[index] = newProviders[targetIdx];
    newProviders[targetIdx] = temp;

    const priorityOrder = newProviders.map((p) => p.id);

    try {
      await fetch("/api/tts/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priorityOrder }),
      });
      fetchData();
    } catch {}
  };

  const handleResetCircuitBreaker = async (id: string) => {
    try {
      await fetch("/api/tts/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: id,
          updates: { status: "ACTIVE", resetCircuitBreaker: true },
        }),
      });
      fetchData();
    } catch {}
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      {/* Master Safety Banner */}
      <div className="rounded-2xl border border-red-500/30 bg-red-50 dark:bg-red-950/40 p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shrink-0">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-red-700 dark:text-red-400">
                Zero Surprise Billing Safeguard: ACTIVE
              </h3>
              <span className="rounded-full bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-wider">
                FREE-ONLY MODE
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
              TTS_FREE_ONLY_MODE = true | ALLOW_PAID_TTS = false (Strictly Enforced)
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-sm hover:bg-slate-50 transition"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Stats
        </button>
      </div>

      {/* Cache & Quota Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center gap-3">
          <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Database className="size-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Audio Cache Hits & Storage</div>
            <div className="text-xl font-black">{cacheCount} Articles Cached</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center gap-3">
          <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <Zap className="size-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Active Free Providers</div>
            <div className="text-xl font-black">
              {providers.filter((p) => p.enabled && p.status === "ACTIVE").length} / {providers.length}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center gap-3">
          <div className="size-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <Lock className="size-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Final Fallback Safety</div>
            <div className="text-xl font-black text-purple-600 dark:text-purple-400">Android Native TTS</div>
          </div>
        </div>
      </div>

      {/* Provider List & Quota Progress Bars */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
        <h3 className="text-base font-black flex items-center gap-2">
          <Volume2 className="size-5 text-red-600" />
          Telugu TTS Provider Priority & Free Quota Allocation
        </h3>

        <div className="space-y-3">
          {providers.map((p, idx) => {
            const log = usage[p.id];
            const used = log ? log.characters_used : 0;
            const limit = p.free_character_limit;
            const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

            const isExhausted = p.status === "FREE_QUOTA_EXHAUSTED" || pct >= 100;
            const isTempUnavailable = p.status === "TEMPORARILY_UNAVAILABLE";

            return (
              <div
                key={p.id}
                className={`p-4 rounded-xl border transition-all ${
                  !p.enabled
                    ? "opacity-50 border-slate-200 bg-slate-50 dark:bg-slate-950/40"
                    : isExhausted
                    ? "border-red-300 bg-red-50/50 dark:bg-red-950/20"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Priority Reordering Arrows */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleMovePriority(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-30"
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleMovePriority(idx, "down")}
                        disabled={idx === providers.length - 1}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-30"
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          #{idx + 1}
                        </span>
                        <h4 className="text-sm font-black">{p.provider_name}</h4>

                        {/* Status Badges */}
                        {isExhausted ? (
                          <span className="rounded-full bg-red-600 text-white text-[9px] font-black px-2 py-0.5 uppercase">
                            QUOTA EXHAUSTED (HARD STOP)
                          </span>
                        ) : isTempUnavailable ? (
                          <span className="rounded-full bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 uppercase">
                            CIRCUIT BREAKER COOLDOWN
                          </span>
                        ) : p.enabled ? (
                          <span className="rounded-full bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 uppercase">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-400 text-white text-[9px] font-black px-2 py-0.5 uppercase">
                            DISABLED
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-semibold text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                        <span>Voice: <strong className="text-slate-700 dark:text-slate-300">{p.voice}</strong></span>
                        <span>Model: <strong className="text-slate-700 dark:text-slate-300">{p.model}</strong></span>
                        <span>Free Chars: <strong className="text-slate-700 dark:text-slate-300">{limit.toLocaleString()}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Toggle */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isTempUnavailable && (
                      <button
                        onClick={() => handleResetCircuitBreaker(p.id)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition"
                      >
                        Reset Cooldown
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleEnable(p.id, p.enabled)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                        p.enabled
                          ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      {p.enabled ? "Disable" : "Enable"}
                    </button>
                  </div>
                </div>

                {/* Quota Usage Bar */}
                {p.enabled && limit > 0 && p.id !== "android" && (
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      <span>Free Usage: {used.toLocaleString()} / {limit.toLocaleString()} chars</span>
                      <span>{pct}% Used</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          pct >= 90 ? "bg-red-600" : pct >= 80 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
