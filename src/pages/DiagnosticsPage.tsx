import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  Activity,
  CheckCircle,
  XCircle,
  Key,
  RefreshCw,
  Play,
  Video,
  Cpu,
  Database,
  ArrowLeft,
  Server
} from "lucide-react";

interface TestResult {
  status: "idle" | "running" | "pass" | "fail";
  message: string;
  details?: any;
}

export function DiagnosticsPage() {
  const [secretsCheck, setSecretsCheck] = useState<TestResult>({ status: "idle", message: "Not started" });
  const [geminiCheck, setGeminiCheck] = useState<TestResult>({ status: "idle", message: "Not started" });
  const [youtubeCheck, setYoutubeCheck] = useState<TestResult>({ status: "idle", message: "Not started" });
  const [supabaseCheck, setSupabaseCheck] = useState<TestResult>({ status: "idle", message: "Not started" });

  useEffect(() => {
    runAllTests();
  }, []);

  const runAllTests = async () => {
    await testSupabase();
    await testSecretsAndGemini();
    await testYoutube();
  };

  // 1. Supabase Connection Test
  const testSupabase = async () => {
    setSupabaseCheck({ status: "running", message: "Verifying Supabase connection..." });
    if (!supabase) {
      setSupabaseCheck({
        status: "fail",
        message: "Supabase client is not initialized. Environment variables are missing."
      });
      return;
    }
    try {
      const { data, error } = await supabase.from("blog_posts").select("id").limit(1);
      if (error) throw error;
      setSupabaseCheck({
        status: "pass",
        message: "Successfully connected to Supabase Database",
        details: { postsCount: data?.length ?? 0 }
      });
    } catch (err: any) {
      console.error(err);
      setSupabaseCheck({
        status: "fail",
        message: err.message || "Failed to query Supabase Database"
      });
    }
  };

  // 2. Secrets & Gemini Test
  const testSecretsAndGemini = async () => {
    if (!supabase) {
      setSecretsCheck({ status: "fail", message: "Supabase is not initialized." });
      setGeminiCheck({ status: "fail", message: "Supabase is not initialized." });
      return;
    }

    setSecretsCheck({ status: "running", message: "Invoking Edge Function to validate secrets..." });
    setGeminiCheck({ status: "running", message: "Invoking Gemini Proxy..." });

    try {
      // Test Secrets Action
      const secretsRes = await supabase.functions.invoke("gemini-proxy", {
        body: { action: "validate_secrets" }
      });

      if (secretsRes.error) throw secretsRes.error;

      const secretsData = secretsRes.data;
      if (secretsData?.status === "success") {
        const geminiExists = secretsData.gemini;
        const youtubeExists = secretsData.youtube;

        if (geminiExists && youtubeExists) {
          setSecretsCheck({
            status: "pass",
            message: "All integration secrets found on backend",
            details: { GEMINI_API_KEY: "Exists", YOUTUBE_API_KEY: "Exists" }
          });
        } else {
          const missing = [];
          if (!geminiExists) missing.push("GEMINI_API_KEY");
          if (!youtubeExists) missing.push("YOUTUBE_API_KEY");
          setSecretsCheck({
            status: "fail",
            message: `Missing Secrets: ${missing.join(", ")}`,
            details: { geminiExists, youtubeExists }
          });
        }
      } else {
        throw new Error(secretsData?.error || "Failed to run secrets validation action");
      }
    } catch (err: any) {
      console.error(err);
      setSecretsCheck({
        status: "fail",
        message: err.message || "Secrets validation invocation failed"
      });
    }

    try {
      // Test Gemini Action
      const geminiRes = await supabase.functions.invoke("gemini-proxy", {
        body: { action: "health_check" }
      });

      if (geminiRes.error) throw geminiRes.error;

      const geminiData = geminiRes.data;
      if (geminiData?.status === "success" && geminiData.headline) {
        setGeminiCheck({
          status: "pass",
          message: "Gemini generated a Telugu headline successfully",
          details: { headline: geminiData.headline }
        });
      } else {
        throw new Error(geminiData?.error || "Gemini returned empty headline");
      }
    } catch (err: any) {
      console.error(err);
      setGeminiCheck({
        status: "fail",
        message: err.message || "Gemini health check invocation failed"
      });
    }
  };

  // 3. YouTube API Test
  const testYoutube = async () => {
    if (!supabase) {
      setYoutubeCheck({ status: "fail", message: "Supabase is not initialized." });
      return;
    }

    setYoutubeCheck({ status: "running", message: "Invoking YouTube Proxy..." });

    try {
      const { data, error } = await supabase.functions.invoke("youtube-proxy");
      if (error) throw error;

      const items = data.items || [];
      if (items.length > 0) {
        // Limit to 5
        const first5 = items.slice(0, 5).map((item: any) => ({
          title: item.snippet?.title || "No Title",
          channel: item.snippet?.channelTitle || "Unknown Channel",
          thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || ""
        }));

        setYoutubeCheck({
          status: "pass",
          message: `Successfully fetched ${items.length} popular videos`,
          details: first5
        });
      } else {
        throw new Error("YouTube API returned 0 videos");
      }
    } catch (err: any) {
      console.error(err);
      setYoutubeCheck({
        status: "fail",
        message: err.message || "YouTube API fetch failed"
      });
    }
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="size-6 text-emerald-500 shrink-0 animate-bounce" />;
      case "fail":
        return <XCircle className="size-6 text-rose-500 shrink-0" />;
      case "running":
        return <RefreshCw className="size-6 text-amber-500 shrink-0 animate-spin" />;
      default:
        return <Activity className="size-6 text-zinc-500 shrink-0" />;
    }
  };

  const getStatusClass = (status: TestResult["status"]) => {
    switch (status) {
      case "pass":
        return "border-emerald-500/20 bg-emerald-500/5";
      case "fail":
        return "border-rose-500/20 bg-rose-500/5";
      case "running":
        return "border-amber-500/20 bg-amber-500/5";
      default:
        return "border-[hsl(var(--border))] bg-zinc-950/20";
    }
  };

  const allPassed =
    supabaseCheck.status === "pass" &&
    secretsCheck.status === "pass" &&
    geminiCheck.status === "pass" &&
    youtubeCheck.status === "pass";

  return (
    <main className="container-shell max-w-4xl py-10 space-y-8 min-h-[80vh] text-zinc-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5 gap-4">
        <div className="space-y-1">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-[hsl(var(--primary))] transition-colors mb-2"
          >
            <ArrowLeft className="size-3.5" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-lg text-black shadow-lg shadow-amber-500/20">
              <Server className="size-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              API Diagnostics & Health
            </h1>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm">
            Verifying cloud integration layers, models, and proxy routes before production deployment.
          </p>
        </div>

        <button
          onClick={runAllTests}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:text-amber-500 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md active:scale-95 text-amber-500"
        >
          <RefreshCw className="size-4" />
          Re-run All Checks
        </button>
      </div>

      {/* Production Status Banner */}
      <div className={`p-6 border rounded-2xl transition-all duration-300 flex items-center justify-between ${
        allPassed ? "border-emerald-500/20 bg-emerald-950/20" : "border-zinc-800 bg-zinc-900/40"
      }`}>
        <div className="space-y-1">
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Launch Readiness</p>
          <p className="text-sm text-zinc-400">
            {allPassed ? "All backend systems fully verified. Ready for release." : "Run all diagnostic checks to assess release readiness."}
          </p>
        </div>
        <div>
          {allPassed ? (
            <span className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl font-black text-black text-xs tracking-wider shadow-lg shadow-emerald-500/20 animate-pulse">
              🚀 PRODUCTION READY
            </span>
          ) : (
            <span className="px-5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl font-black text-zinc-500 text-xs tracking-wider">
              ⚠️ STANDBY
            </span>
          )}
        </div>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* 1. Supabase Check */}
        <div className={`border rounded-2xl p-5 flex gap-4 transition-all duration-200 ${getStatusClass(supabaseCheck.status)}`}>
          {getStatusIcon(supabaseCheck.status)}
          <div className="space-y-3 flex-1 min-w-0">
            <div>
              <div className="flex items-center gap-2">
                <Database className="size-4.5 text-zinc-400" />
                <h3 className="font-bold text-sm text-zinc-200">Supabase Connection</h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1">Queries the local Supabase client instance and databases.</p>
            </div>
            {supabaseCheck.status === "pass" && (
              <div className="text-xs bg-black/40 border border-zinc-800 p-3 rounded-lg text-emerald-400 font-mono">
                ✅ Connection succeeded
              </div>
            )}
            {supabaseCheck.status === "fail" && (
              <div className="text-xs bg-rose-950/40 border border-rose-900/50 p-3 rounded-lg text-rose-400 break-words font-mono">
                ❌ Error: {supabaseCheck.message}
              </div>
            )}
          </div>
        </div>

        {/* 2. Secret Keys Check */}
        <div className={`border rounded-2xl p-5 flex gap-4 transition-all duration-200 ${getStatusClass(secretsCheck.status)}`}>
          {getStatusIcon(secretsCheck.status)}
          <div className="space-y-3 flex-1 min-w-0">
            <div>
              <div className="flex items-center gap-2">
                <Key className="size-4.5 text-zinc-400" />
                <h3 className="font-bold text-sm text-zinc-200">Supabase secrets vault</h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1">Verifies API keys reside securely in the backend environment vault.</p>
            </div>
            {secretsCheck.status === "pass" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs p-2.5 bg-black/40 border border-zinc-800 rounded">
                  <span className="font-semibold">GEMINI_API_KEY</span>
                  <span className="text-green-400 font-bold">Found</span>
                </div>
                <div className="flex justify-between items-center text-xs p-2.5 bg-black/40 border border-zinc-800 rounded">
                  <span className="font-semibold">YOUTUBE_API_KEY</span>
                  <span className="text-green-400 font-bold">Found</span>
                </div>
              </div>
            )}
            {secretsCheck.status === "fail" && (
              <div className="text-xs bg-rose-950/40 border border-rose-900/50 p-3 rounded-lg text-rose-400 break-words font-mono">
                ❌ Error: {secretsCheck.message}
              </div>
            )}
          </div>
        </div>

        {/* 3. Gemini 2.5 Flash Generation Check */}
        <div className={`border rounded-2xl p-5 flex gap-4 transition-all duration-200 ${getStatusClass(geminiCheck.status)}`}>
          {getStatusIcon(geminiCheck.status)}
          <div className="space-y-3 flex-1 min-w-0">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="size-4.5 text-zinc-400" />
                <h3 className="font-bold text-sm text-zinc-200">Gemini 2.5 Flash LLM</h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1">Generates a sample Andhra Pradesh Telugu headline using the proxy.</p>
            </div>
            {geminiCheck.status === "pass" && (
              <div className="bg-black/40 border border-zinc-800 p-4 rounded-xl space-y-2">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Generated Headline</span>
                <p className="text-sm font-bold text-amber-400 italic">
                  "{geminiCheck.details?.headline}"
                </p>
              </div>
            )}
            {geminiCheck.status === "fail" && (
              <div className="text-xs bg-rose-950/40 border border-rose-900/50 p-3 rounded-lg text-rose-400 break-words font-mono">
                ❌ Error: {geminiCheck.message}
              </div>
            )}
          </div>
        </div>

        {/* 4. YouTube API Trending Videos Check */}
        <div className={`border rounded-2xl p-5 flex gap-4 transition-all duration-200 ${getStatusClass(youtubeCheck.status)}`}>
          {getStatusIcon(youtubeCheck.status)}
          <div className="space-y-3 flex-1 min-w-0">
            <div>
              <div className="flex items-center gap-2">
                <Video className="size-4.5 text-zinc-400" />
                <h3 className="font-bold text-sm text-zinc-200">YouTube Data API v3</h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1">Retrieves a list of trending content in India (Region Code: IN).</p>
            </div>
            {youtubeCheck.status === "pass" && (
              <div className="space-y-3 bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl max-h-60 overflow-y-auto">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">First 5 Trending Videos</span>
                {youtubeCheck.details?.map((video: any, idx: number) => (
                  <div key={idx} className="flex gap-3 items-start border-b border-zinc-900 pb-2 last:border-b-0 last:pb-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-16 h-10 object-cover rounded border border-zinc-850 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs text-zinc-200 font-bold truncate leading-tight">
                        {video.title}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        {video.channel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {youtubeCheck.status === "fail" && (
              <div className="text-xs bg-rose-950/40 border border-rose-900/50 p-3 rounded-lg text-rose-400 break-words font-mono">
                ❌ Error: {youtubeCheck.message}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
export default DiagnosticsPage;
