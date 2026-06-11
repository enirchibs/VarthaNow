import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Chrome, Mail, Lock, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/hooks/useLanguage";
import { setMeta } from "@/lib/seo";

export function LoginPage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  useState(() => {
    setMeta({
      title: lang === "te" ? "లాగిన్ | VaartaNow" : "Sign In | VaartaNow",
      description: "Sign in to VaartaNow using Google or Email and Password.",
      canonical: "/login"
    });
  });

  const handleGoogleLogin = async () => {
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password
        });
        if (error) throw error;
        setMessage(lang === "te" ? "ధృవీకరణ లింక్ కోసం మీ ఈమెయిల్ చెక్ చేయండి!" : "Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container-shell flex min-h-[75vh] items-center justify-center py-10">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/20 dark:border-white/10 bg-white/70 dark:bg-zinc-950/70 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        {/* Glow Effects */}
        <div className="absolute -left-16 -top-16 -z-10 size-32 rounded-full bg-blue-500/20 blur-2xl" />
        <div className="absolute -right-16 -bottom-16 -z-10 size-32 rounded-full bg-indigo-500/20 blur-2xl" />

        <div className="mb-6 flex items-center gap-3">
          <Link to="/" className="grid size-10 place-items-center rounded-full bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted))]/80 transition">
            <ArrowLeft className="size-4 text-[hsl(var(--foreground))]" />
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-6 text-[hsl(var(--primary))]" />
            <h1 className="text-xl font-black">{isSignUp ? (lang === "te" ? "రిజిస్ట్రేషన్" : "Create Account") : (lang === "te" ? "సైన్ ఇన్" : "Sign In")}</h1>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs font-bold text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {message}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-[hsl(var(--muted-foreground))]">
              {lang === "te" ? "ఈమెయిల్ ఐడి" : "Email Address"}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="pl-11"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-[hsl(var(--muted-foreground))]">
              {lang === "te" ? "పాస్ వర్డ్" : "Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-11"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white rounded-2xl font-black mt-2">
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isSignUp ? (
              lang === "te" ? "ఖాతా సృష్టించండి" : "Sign Up"
            ) : (
              lang === "te" ? "ఈమెయిల్ తో సైన్ ఇన్" : "Sign In with Email"
            )}
          </Button>
        </form>

        <div className="relative my-6 text-center">
          <hr className="border-[hsl(var(--border))]" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[hsl(var(--card))] px-3 text-xs font-bold text-[hsl(var(--muted-foreground))] rounded-full">
            {lang === "te" ? "లేదా" : "OR"}
          </span>
        </div>

        <div className="space-y-3">
          <Button type="button" onClick={handleGoogleLogin} disabled={loading} variant="secondary" className="w-full h-11 rounded-2xl font-black flex items-center justify-center gap-2">
            <Chrome className="size-4" />
            {lang === "te" ? "గూగుల్ తో సైన్ ఇన్ (Gmail)" : "Continue with Google"}
          </Button>

          <div className="text-center mt-5">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setMessage("");
              }}
              className="text-xs font-black text-[hsl(var(--primary))] hover:underline"
            >
              {isSignUp
                ? (lang === "te" ? "ఇప్పటికే ఖాతా ఉందా? లాగిన్ అవ్వండి" : "Already have an account? Sign In")
                : (lang === "te" ? "కొత్త ఖాతాను సృష్టించుకోవాలా?" : "Don't have an account? Sign Up")}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
