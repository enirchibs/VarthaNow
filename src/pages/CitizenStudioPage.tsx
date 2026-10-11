import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Video } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { setMeta } from "@/lib/seo";
import { LiveStudio } from "@/components/admin/LiveStudio";

// ═══════════════════════════════════════════════════════════════════
//  సిటిజన్ వీడియో స్టూడియో: appointed citizen journalists record a video
//  report in the news studio (citizen graphics) and send it for review.
// ═══════════════════════════════════════════════════════════════════

type Reporter = { id: string; name: string; area: string | null };

export function CitizenStudioPage() {
  const [state, setState] = useState<"loading" | "signed-out" | "not-journalist" | "ready">("loading");
  const [reporter, setReporter] = useState<Reporter | null>(null);

  useEffect(() => {
    setMeta({ title: "సిటిజన్ వీడియో స్టూడియో | VaartaNow", description: "సిటిజన్ జర్నలిస్టులు వీడియో రిపోర్ట్ రికార్డ్ చేసి సమీక్షకు పంపండి.", canonical: "/citizen-journalist/studio" });
    if (!supabase) return setState("signed-out");
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user;
      if (!user) return setState("signed-out");
      const { data } = await supabase!.from("citizen_reporters").select("name, area, status").eq("user_id", user.id).maybeSingle();
      if (data?.status === "active") {
        setReporter({ id: user.id, name: data.name, area: data.area });
        return setState("ready");
      }
      // editors and admins may open it too (to try it out); their test reports go to the same review queue
      const { data: role } = await supabase!.rpc("my_role");
      if (role === "admin" || role === "editor") {
        setReporter({ id: user.id, name: user.email?.split("@")[0] ?? "VaartaNow", area: null });
        return setState("ready");
      }
      setState("not-journalist");
    });
  }, []);

  return (
    <main className="container-shell max-w-[1400px] space-y-4 py-5">
      <header className="flex flex-wrap items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-red-600 p-5 text-white shadow-lg">
        <Video className="size-8" />
        <div>
          <h1 className="text-2xl font-black">సిటిజన్ వీడియో స్టూడియో</h1>
          <p className="text-sm text-white/90">మీ ప్రాంత వార్తను వీడియోగా రికార్డ్ చేసి పంపండి. ఎడిటర్ సమీక్ష తర్వాత VaartaNowలో ప్రచురితమవుతుంది.</p>
        </div>
      </header>

      {state === "loading" && <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="size-4 animate-spin" /> లోడ్ అవుతోంది…</p>}
      {state === "signed-out" && (
        <div className="rounded-2xl border p-6 text-center">
          <p className="font-semibold">వీడియో రిపోర్ట్ పంపడానికి లాగిన్ అవ్వండి.</p>
          <Link to="/login?next=/citizen-journalist/studio" className="mt-3 inline-flex h-11 items-center rounded-xl bg-red-600 px-6 text-sm font-black text-white">లాగిన్</Link>
        </div>
      )}
      {state === "not-journalist" && (
        <div className="rounded-2xl border p-6 text-center">
          <p className="font-semibold">వీడియో స్టూడియో సిటిజన్ జర్నలిస్టుల కోసం. ముందుగా సిటిజన్ జర్నలిస్ట్‌గా చేరండి.</p>
          <Link to="/citizen-journalist" className="mt-3 inline-flex h-11 items-center rounded-xl bg-red-600 px-6 text-sm font-black text-white">సిటిజన్ జర్నలిస్ట్‌గా చేరండి</Link>
        </div>
      )}
      {state === "ready" && reporter && <LiveStudio mode="citizen" reporter={reporter} />}
    </main>
  );
}
