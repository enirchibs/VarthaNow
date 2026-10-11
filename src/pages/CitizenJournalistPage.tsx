import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Camera, CheckCircle2, Clock, FileCheck2, Loader2, Megaphone, Mic, PenLine, ShieldCheck, XCircle } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { setMeta } from "@/lib/seo";
import { Button, Input } from "@/components/ui";

// ═══════════════════════════════════════════════════════════════════
//  సిటిజన్ జర్నలిస్ట్‌గా చేరండి — join as a citizen journalist.
//  Signed-in citizens apply; an editor approves (appoints) or rejects.
// ═══════════════════════════════════════════════════════════════════

type Application = { id: string; status: "pending" | "approved" | "rejected"; review_note: string | null; created_at: string; district: string; area: string };
type Status = "loading" | "signed-out" | "journalist" | "pending" | "rejected" | "can-apply";

const BENEFITS = [
  { icon: Megaphone, title: "మీ ప్రాంత గొంతుక అవ్వండి", text: "మీ ఊరు, మండలం, కాలనీలో జరిగే వార్తలు, ప్రజా సమస్యలు వేలాది మంది పాఠకులకు చేరతాయి." },
  { icon: BadgeCheck, title: "మీ పేరుతో ప్రచురణ", text: "ఆమోదించిన ప్రతి వార్త “సిటిజన్ రిపోర్టర్ · మీ పేరు” అనే బైలైన్‌తో ప్రచురితమవుతుంది." },
  { icon: Camera, title: "ఫోటో, వీడియో, వాయిస్", text: "ఫోన్‌తోనే ఫోటోలు, వీడియోలు, వాయిస్ నోట్ పంపవచ్చు. రాయడం కష్టమైతే మాట్లాడి పంపండి." },
  { icon: ShieldCheck, title: "ఎడిటర్ సహాయం", text: "మా ఎడిటర్లు ప్రతి రిపోర్ట్‌ను పరిశీలించి, సరిచేసి, నిజమని నిర్ధారించిన తర్వాతే ప్రచురిస్తారు." },
];

const GUIDELINES = [
  "నిజమైన, మీరు స్వయంగా చూసిన లేదా నిర్ధారించుకున్న సమాచారం మాత్రమే పంపాలి.",
  "ఫోటోలు, వీడియోలు మీరే తీసినవి అయి ఉండాలి. ఇతరుల ఫోటోలు, టీవీ/సోషల్ మీడియా క్లిప్‌లు పంపకూడదు.",
  "ఎవరినీ దూషించడం, వ్యక్తిగత ఆరోపణలు, కుల-మత విద్వేషం, ఊహాగానాలు ఉండకూడదు.",
  "ప్రమాదాలు, నేరాల్లో బాధితుల ముఖాలు, పిల్లల వివరాలు, ఫోన్ నంబర్లు చూపకూడదు.",
  "రాజకీయ పార్టీల ప్రచారం కోసం కాదు: అన్ని పక్షాల సమాచారం న్యాయంగా ఉండాలి.",
  "ఎడిటర్ ఆమోదం తర్వాతే వార్త ప్రచురితమవుతుంది. అవసరమైతే మేము మార్పులు చేస్తాం లేదా తిరస్కరిస్తాం.",
  "నియమాలు పాటించకపోతే సిటిజన్ జర్నలిస్ట్ హోదా రద్దు చేయబడుతుంది.",
];

const STEPS = [
  { icon: PenLine, text: "లాగిన్ అయి దరఖాస్తు నింపండి" },
  { icon: FileCheck2, text: "మా ఎడిటర్ బృందం పరిశీలిస్తుంది (సాధారణంగా 2-3 రోజులు)" },
  { icon: BadgeCheck, text: "ఆమోదం తర్వాత సిటిజన్ జర్నలిస్ట్‌గా నియామకం" },
  { icon: Mic, text: "యాప్‌లో “+ పోస్ట్” ద్వారా వార్తలు, సమస్యలు పంపండి" },
];

const empty = { name: "", phone: "", state: "ఆంధ్రప్రదేశ్", district: "", area: "", occupation: "", motivation: "", experience: "", agreed: false };

export function CitizenJournalistPage() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [latest, setLatest] = useState<Application | null>(null);
  const [form, setForm] = useState(empty);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMeta({
      title: "సిటిజన్ జర్నలిస్ట్‌గా చేరండి | VaartaNow",
      description: "మీ ప్రాంత వార్తలు, ప్రజా సమస్యలను VaartaNow ద్వారా ప్రపంచానికి చెప్పండి. సిటిజన్ జర్నలిస్ట్‌గా దరఖాస్తు చేసుకోండి.",
      canonical: "/citizen-journalist",
    });
  }, []);

  const load = async (u: User | null) => {
    setUser(u);
    if (!u || !supabase) return setStatus(u ? "can-apply" : "signed-out");
    const [{ data: reporter }, { data: apps }] = await Promise.all([
      supabase.from("citizen_reporters").select("status").eq("user_id", u.id).maybeSingle(),
      supabase.from("citizen_journalist_applications").select("id, status, review_note, created_at, district, area").eq("user_id", u.id).order("created_at", { ascending: false }).limit(1),
    ]);
    const app = (apps?.[0] ?? null) as Application | null;
    setLatest(app);
    setForm((f) => ({ ...f, phone: f.phone || (u.phone ?? "") }));
    if (reporter?.status === "active") setStatus("journalist");
    else if (app?.status === "pending") setStatus("pending");
    else if (app?.status === "rejected") setStatus("rejected");
    else setStatus("can-apply");
  };

  useEffect(() => {
    if (!supabase) return setStatus("signed-out");
    supabase.auth.getSession().then(({ data: { session } }) => load(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => { load(session?.user ?? null); });
    return () => subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;
    const digits = form.phone.replace(/\D/g, "");
    if (form.name.trim().length < 2) return setError("దయచేసి మీ పూర్తి పేరు రాయండి.");
    if (digits.length < 10) return setError("సరైన 10 అంకెల ఫోన్ నంబర్ ఇవ్వండి.");
    if (!form.district.trim() || !form.area.trim()) return setError("మీ జిల్లా, మండలం/ప్రాంతం రాయండి.");
    if (form.motivation.trim().length < 20) return setError("ఎందుకు చేరాలనుకుంటున్నారో కనీసం ఒకటి రెండు వాక్యాల్లో రాయండి.");
    if (!form.agreed) return setError("నియమాలకు అంగీకరిస్తున్నట్లు టిక్ చేయండి.");
    setSending(true);
    setError("");
    const { error: err } = await supabase.from("citizen_journalist_applications").insert({
      user_id: user.id, name: form.name.trim(), phone: form.phone.trim(), email: user.email ?? null, state: form.state,
      district: form.district.trim(), area: form.area.trim(), occupation: form.occupation.trim() || null,
      motivation: form.motivation.trim(), experience: form.experience.trim() || null, agreed_guidelines: true,
    });
    setSending(false);
    if (err) {
      setError(/one_pending|duplicate/i.test(err.message) ? "మీ దరఖాస్తు ఇప్పటికే పరిశీలనలో ఉంది." : `దరఖాస్తు పంపడం కుదరలేదు: ${err.message}`);
      return;
    }
    setForm(empty);
    await load(user);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const field = "h-11 rounded-xl text-[15px]";
  const label = "mb-1 block text-sm font-bold text-slate-700 dark:text-slate-200";

  return (
    <main className="container-shell max-w-5xl space-y-8 py-6">
      {/* hero */}
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 p-6 text-white shadow-xl sm:p-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-black">
          <Megaphone className="size-4" /> VaartaNow సిటిజన్ జర్నలిజం
        </span>
        <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">సిటిజన్ జర్నలిస్ట్‌గా చేరండి</h1>
        <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-white/90">
          మీ ఊరిలో రోడ్లు, నీళ్లు, కరెంట్ సమస్యలు, స్థానిక సంఘటనలు, మంచి పనులు — ఇవన్నీ మీకంటే బాగా ఎవరికి తెలుసు?
          VaartaNow సిటిజన్ జర్నలిస్ట్‌గా మీ ప్రాంత వార్తలను మీ పేరుతో ప్రజల ముందుకు తీసుకురండి.
        </p>
        {status === "signed-out" && (
          <Link to="/login?next=/citizen-journalist" className="mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-6 text-base font-black text-red-600 shadow-lg active:scale-95">
            <PenLine className="size-5" /> లాగిన్ అయి దరఖాస్తు చేయండి
          </Link>
        )}
        {status === "can-apply" && (
          <a href="#apply" className="mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-6 text-base font-black text-red-600 shadow-lg active:scale-95">
            <PenLine className="size-5" /> ఇప్పుడే దరఖాస్తు చేయండి
          </a>
        )}
      </section>

      {/* status for signed-in users */}
      {status === "loading" && <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="size-4 animate-spin" /> లోడ్ అవుతోంది…</p>}
      {status === "journalist" && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-50 p-5 dark:bg-emerald-950/30">
          <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-emerald-600" />
          <div>
            <p className="text-lg font-black text-emerald-800 dark:text-emerald-300">మీరు VaartaNow సిటిజన్ జర్నలిస్ట్!</p>
            <p className="mt-1 text-[15px] text-emerald-900/80 dark:text-emerald-200/80">హోమ్ పేజీలో కింద ఉన్న “+ పోస్ట్” బటన్ నొక్కి “స్థానిక వార్త” లేదా “ఫిర్యాదు/సమస్య” ఎంచుకుని మీ రిపోర్ట్ పంపండి. ఎడిటర్ ఆమోదం తర్వాత ప్రచురితమవుతుంది.</p>
            <Link to="/" className="mt-3 inline-flex h-10 items-center rounded-xl bg-emerald-600 px-4 text-sm font-black text-white">హోమ్‌కు వెళ్లండి</Link>
          </div>
        </div>
      )}
      {status === "pending" && latest && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-50 p-5 dark:bg-amber-950/30">
          <Clock className="mt-0.5 size-6 shrink-0 text-amber-600" />
          <div>
            <p className="text-lg font-black text-amber-800 dark:text-amber-300">మీ దరఖాస్తు పరిశీలనలో ఉంది</p>
            <p className="mt-1 text-[15px] text-amber-900/80 dark:text-amber-200/80">
              {new Date(latest.created_at).toLocaleDateString("te-IN", { day: "numeric", month: "long" })} న అందింది ({latest.area}, {latest.district}).
              మా ఎడిటర్ బృందం త్వరలో పరిశీలిస్తుంది. ఆమోదం తర్వాత ఈ పేజీలో మీకు తెలుస్తుంది.
            </p>
          </div>
        </div>
      )}
      {status === "rejected" && latest && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-50 p-5 dark:bg-red-950/30">
          <XCircle className="mt-0.5 size-6 shrink-0 text-red-600" />
          <div>
            <p className="text-lg font-black text-red-800 dark:text-red-300">మీ గత దరఖాస్తు ఆమోదం పొందలేదు</p>
            {latest.review_note && <p className="mt-1 text-[15px] text-red-900/80 dark:text-red-200/80">కారణం: {latest.review_note}</p>}
            <p className="mt-1 text-[15px] text-red-900/80 dark:text-red-200/80">వివరాలు సరిచేసి కింద మళ్లీ దరఖాస్తు చేయవచ్చు.</p>
          </div>
        </div>
      )}

      {/* benefits */}
      <section className="grid gap-3 sm:grid-cols-2">
        {BENEFITS.map((b) => (
          <div key={b.title} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40"><b.icon className="size-5" /></span>
            <div>
              <h3 className="text-base font-black">{b.title}</h3>
              <p className="mt-0.5 text-[14.5px] leading-relaxed text-slate-600 dark:text-slate-300">{b.text}</p>
            </div>
          </div>
        ))}
      </section>

      {/* how it works */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <h2 className="text-xl font-black">ఎలా చేరాలి?</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.text} className="flex items-start gap-2.5 sm:flex-col">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-black text-white">{i + 1}</span>
              <span className="text-[14.5px] font-semibold leading-snug">{s.text}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* guidelines */}
      <section className="rounded-2xl border border-amber-500/30 bg-amber-50/60 p-5 dark:bg-amber-950/20">
        <h2 className="flex items-center gap-2 text-xl font-black"><ShieldCheck className="size-5 text-amber-600" /> సిటిజన్ జర్నలిస్ట్ నియమాలు</h2>
        <ul className="mt-3 space-y-2">
          {GUIDELINES.map((g) => (
            <li key={g} className="flex gap-2 text-[15px] leading-relaxed"><CheckCircle2 className="mt-1 size-4 shrink-0 text-amber-600" />{g}</li>
          ))}
        </ul>
      </section>

      {/* form */}
      {(status === "can-apply" || status === "rejected") && (
        <section id="apply" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900 sm:p-7">
          <h2 className="text-xl font-black">దరఖాస్తు ఫారం</h2>
          <p className="mt-1 text-sm text-slate-500">* ఉన్నవి తప్పనిసరి. మీ ఫోన్ నంబర్ ప్రచురించబడదు; ఎడిటర్ మిమ్మల్ని సంప్రదించడానికి మాత్రమే.</p>
          <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>పూర్తి పేరు *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ఉదా: రమేష్ కుమార్" className={field} />
            </div>
            <div>
              <label className={label}>ఫోన్ నంబర్ *</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="tel" placeholder="10 అంకెల మొబైల్ నంబర్" className={field} />
            </div>
            <div>
              <label className={label}>రాష్ట్రం *</label>
              <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-3 text-[15px] font-semibold">
                <option>ఆంధ్రప్రదేశ్</option>
                <option>తెలంగాణ</option>
                <option>ఇతర</option>
              </select>
            </div>
            <div>
              <label className={label}>జిల్లా *</label>
              <Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="ఉదా: విశాఖపట్నం" className={field} />
            </div>
            <div>
              <label className={label}>మండలం / పట్టణం / ప్రాంతం *</label>
              <Input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="ఉదా: గాజువాక" className={field} />
            </div>
            <div>
              <label className={label}>వృత్తి</label>
              <Input value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} placeholder="ఉదా: ఉపాధ్యాయుడు, విద్యార్థి, రైతు" className={field} />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>సిటిజన్ జర్నలిస్ట్‌గా ఎందుకు చేరాలనుకుంటున్నారు? *</label>
              <textarea
                value={form.motivation}
                onChange={(e) => setForm({ ...form, motivation: e.target.value })}
                rows={4}
                maxLength={1500}
                placeholder="మీ ప్రాంతంలో ఏ రకమైన వార్తలు, సమస్యలు మీరు రిపోర్ట్ చేయాలనుకుంటున్నారు?"
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-transparent p-3 text-[15px] leading-relaxed outline-none focus:border-red-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>జర్నలిజం / సోషల్ మీడియా అనుభవం (ఉంటే)</label>
              <Input value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="ఉదా: స్థానిక పత్రికకు రాశాను, యూట్యూబ్ ఛానల్ ఉంది" className={field} />
            </div>
            <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-[15px] leading-relaxed sm:col-span-2 dark:bg-white/5">
              <input type="checkbox" checked={form.agreed} onChange={(e) => setForm({ ...form, agreed: e.target.checked })} className="mt-1 size-5 shrink-0 accent-red-600" />
              పైన ఉన్న సిటిజన్ జర్నలిస్ట్ నియమాలు చదివాను. నిజమైన సమాచారం మాత్రమే పంపుతాను, ఎడిటర్ ఆమోదం తర్వాతే వార్త ప్రచురితమవుతుందని అంగీకరిస్తున్నాను. *
            </label>
            {error && <p className="text-sm font-bold text-red-600 sm:col-span-2">{error}</p>}
            <div className="sm:col-span-2">
              <Button type="submit" disabled={sending} className="h-12 w-full rounded-2xl bg-red-600 text-base font-black text-white hover:bg-red-700 sm:w-auto sm:px-10">
                {sending ? <Loader2 className="size-5 animate-spin" /> : <PenLine className="size-5" />} దరఖాస్తు పంపండి
              </Button>
            </div>
          </form>
        </section>
      )}

      {status === "signed-out" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <p className="text-[15px] font-semibold">దరఖాస్తు చేయడానికి ముందుగా లాగిన్ అవ్వండి.</p>
          <Link to="/login?next=/citizen-journalist" className="mt-3 inline-flex h-11 items-center rounded-xl bg-red-600 px-6 text-sm font-black text-white">లాగిన్ / సైన్ అప్</Link>
        </div>
      )}
    </main>
  );
}
