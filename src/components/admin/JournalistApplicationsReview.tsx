import { useEffect, useState } from "react";
import { Check, Mail, MapPin, Phone, RefreshCw, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button, Input } from "@/components/ui";

// Applications from /citizen-journalist ("సిటిజన్ జర్నలిస్ట్‌గా చేరండి"). Approving appoints the
// person as a citizen journalist (approve_journalist_application); rejecting needs a reason, which
// the applicant sees on the page.

type App = {
  id: string; name: string; phone: string; email: string | null; state: string; district: string; area: string;
  occupation: string | null; motivation: string; experience: string | null; status: "pending" | "approved" | "rejected";
  review_note: string | null; reviewed_by: string | null; reviewed_at: string | null; created_at: string;
};

export function JournalistApplicationsReview({ editorEmail }: { editorEmail?: string }) {
  const [apps, setApps] = useState<App[] | null>(null);
  const [show, setShow] = useState<"pending" | "decided">("pending");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = async () => {
    const { data } = await supabase!.from("citizen_journalist_applications").select("*").order("created_at", { ascending: false }).limit(300);
    setApps((data ?? []) as App[]);
  };
  useEffect(() => { if (supabase) load(); }, []);

  const approve = async (a: App) => {
    setBusy(a.id);
    const { error } = await supabase!.rpc("approve_journalist_application", { application: a.id, note: notes[a.id] || null });
    setBusy(null);
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: `${a.name} is now a citizen journalist.` });
    if (!error) load();
  };
  const reject = async (a: App) => {
    const note = (notes[a.id] ?? "").trim();
    if (!note) return setMsg({ ok: false, text: "Write a reason (in Telugu if possible) before rejecting; the applicant sees it." });
    setBusy(a.id);
    const { error } = await supabase!.from("citizen_journalist_applications")
      .update({ status: "rejected", review_note: note, reviewed_by: editorEmail ?? null, reviewed_at: new Date().toISOString() }).eq("id", a.id);
    setBusy(null);
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: `${a.name}'s application rejected.` });
    if (!error) load();
  };

  const list = (apps ?? []).filter((a) => (show === "pending" ? a.status === "pending" : a.status !== "pending"));
  const pending = (apps ?? []).filter((a) => a.status === "pending").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {([["pending", `Waiting (${pending})`], ["decided", "Decided"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setShow(id)}
            className={`rounded-xl px-3 py-1.5 text-xs font-black ${show === id ? "bg-red-600 text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"}`}>
            {label}
          </button>
        ))}
        <button onClick={load} className="ml-auto flex items-center gap-1 text-xs font-bold text-[hsl(var(--muted-foreground))]"><RefreshCw className="size-3.5" /> Refresh</button>
      </div>
      {msg && <p className={`rounded-xl p-3 text-sm font-bold ${msg.ok ? "bg-emerald-500/10 text-emerald-700" : "bg-red-500/10 text-red-700"}`}>{msg.text}</p>}
      {!apps ? <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading…</p> : list.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[hsl(var(--border))] p-10 text-center text-sm text-[hsl(var(--muted-foreground))]">
          {show === "pending" ? "No applications waiting. People apply at /citizen-journalist (link in the site footer and the news form)." : "No decided applications yet."}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((a) => (
            <article key={a.id} className="space-y-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-black">{a.name}</h3>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{a.occupation || "—"} · applied {new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
                {a.status !== "pending" && (
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${a.status === "approved" ? "bg-emerald-500/15 text-emerald-700" : "bg-red-500/15 text-red-700"}`}>
                    {a.status === "approved" ? "Approved" : "Rejected"}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold">
                <span className="flex items-center gap-1"><MapPin className="size-3.5 text-red-600" />{a.area}, {a.district}, {a.state}</span>
                <a href={`tel:${a.phone}`} className="flex items-center gap-1 hover:underline"><Phone className="size-3.5 text-red-600" />{a.phone}</a>
                {a.email && <a href={`mailto:${a.email}`} className="flex items-center gap-1 hover:underline"><Mail className="size-3.5 text-red-600" />{a.email}</a>}
              </div>
              <div className="rounded-xl bg-[hsl(var(--muted))]/50 p-3 text-[14px] leading-relaxed">
                <p className="mb-1 text-[11px] font-black uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Why they want to join</p>
                {a.motivation}
                {a.experience && <p className="mt-2 text-[13px]"><span className="font-bold">Experience:</span> {a.experience}</p>}
              </div>
              {a.status === "pending" ? (
                <div className="space-y-2">
                  <Input value={notes[a.id] ?? ""} onChange={(e) => setNotes({ ...notes, [a.id]: e.target.value })}
                    placeholder="Note to the applicant (needed to reject), e.g. ఫోన్ నంబర్ సరిగా లేదు" className="h-10 rounded-xl text-sm" />
                  <div className="flex gap-2">
                    <Button onClick={() => approve(a)} disabled={busy === a.id} className="h-10 flex-1 rounded-xl bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700"><Check className="size-4" /> Approve & appoint</Button>
                    <Button onClick={() => reject(a)} disabled={busy === a.id} variant="secondary" className="h-10 flex-1 rounded-xl text-sm font-bold text-red-600"><X className="size-4" /> Reject</Button>
                  </div>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Tip: call them first to confirm who they are and the area they cover.</p>
                </div>
              ) : (
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {a.status === "approved" ? "Approved" : "Rejected"}{a.reviewed_by ? ` by ${a.reviewed_by}` : ""}{a.review_note ? ` · “${a.review_note}”` : ""}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
