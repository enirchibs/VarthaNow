import { useEffect, useState } from "react";
import { Crown, Megaphone, PenLine, RefreshCw, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button, Input } from "@/components/ui";

// ═══════════════════════════════════════════════════════════════════
//  Users & Roles (admins only): admins, editors and citizen journalists.
//  Roles are tied to accounts: the person must have signed in once.
//  The database functions (migration 010) enforce every rule; this
//  screen only calls them.
// ═══════════════════════════════════════════════════════════════════

type Staff = { user_id: string; email: string | null; name: string | null; role: "admin" | "editor"; added_by: string | null; created_at: string };
type Reporter = { user_id: string; name: string; phone: string | null; area: string | null; status: "active" | "revoked"; appointed_by: string | null; appointed_at: string };

const ROLES = [
  { id: "admin", label: "Admin", icon: Crown, color: "text-red-600 bg-red-500/10", can: "Everything: articles (incl. delete), settings, feeds, SEO, jobs, and managing people and roles." },
  { id: "editor", label: "Editor", icon: PenLine, color: "text-blue-600 bg-blue-500/10", can: "Newsroom: write, edit, approve and publish articles; AI News Generator; review citizen reports and photos; galleries; appoint citizen journalists. Cannot delete articles or change settings or roles." },
  { id: "citizen", label: "Citizen journalist", icon: Megaphone, color: "text-amber-700 bg-amber-500/10", can: "Sends local news and public issues with photos, video and voice notes from the app. An editor reviews every report before it is published." },
] as const;

const date = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function UsersRolesDashboard({ currentUserId, ownerEmail }: { currentUserId?: string; ownerEmail?: string | null }) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [reportCounts, setReportCounts] = useState<Record<string, { total: number; approved: number }>>({});
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [staffForm, setStaffForm] = useState({ identifier: "", name: "", role: "editor" as "admin" | "editor" });
  const [citForm, setCitForm] = useState({ identifier: "", name: "", area: "" });

  const load = async () => {
    if (!supabase) return;
    setLoading(true);
    const [s, r, reps] = await Promise.all([
      supabase.from("staff_roles").select("*").order("created_at"),
      supabase.from("citizen_reporters").select("*").order("appointed_at", { ascending: false }),
      supabase.from("citizen_reports").select("reporter_id, status").limit(5000),
    ]);
    setStaff((s.data ?? []) as Staff[]);
    setReporters((r.data ?? []) as Reporter[]);
    const counts: Record<string, { total: number; approved: number }> = {};
    for (const x of reps.data ?? []) {
      const c = (counts[x.reporter_id] ??= { total: 0, approved: 0 });
      c.total++;
      if (x.status === "approved") c.approved++;
    }
    setReportCounts(counts);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const run = async (fn: () => PromiseLike<{ error: { message: string } | null }>, success: string) => {
    setBusy(true);
    setNote(null);
    const { error } = await fn();
    setBusy(false);
    setNote(error ? { ok: false, text: error.message } : { ok: true, text: success });
    if (!error) await load();
    return !error;
  };

  const addStaff = async () => {
    if (!staffForm.identifier.trim()) return setNote({ ok: false, text: "Enter the person's email or phone number." });
    const done = await run(() => supabase!.rpc("grant_staff_role", { identifier: staffForm.identifier.trim(), new_role: staffForm.role, display_name: staffForm.name || null }),
      `${staffForm.identifier.trim()} is now ${staffForm.role === "admin" ? "an admin" : "an editor"}.`);
    if (done) setStaffForm({ identifier: "", name: "", role: "editor" });
  };
  const changeRole = (s: Staff, role: "admin" | "editor") =>
    run(() => supabase!.rpc("grant_staff_role", { identifier: s.email ?? "", new_role: role, display_name: s.name }), `${s.name || s.email} is now ${role === "admin" ? "an admin" : "an editor"}.`);
  const removeStaff = (s: Staff) => {
    if (!window.confirm(`Remove ${s.name || s.email} from the team? They lose admin access immediately.`)) return;
    run(() => supabase!.rpc("revoke_staff_role", { target: s.user_id }), `${s.name || s.email} removed.`);
  };
  const appoint = async () => {
    if (!citForm.identifier.trim() || !citForm.name.trim()) return setNote({ ok: false, text: "Enter the citizen's email or phone and name." });
    const done = await run(() => supabase!.rpc("appoint_citizen_journalist", { identifier: citForm.identifier.trim(), display_name: citForm.name.trim(), area_name: citForm.area || null }),
      `${citForm.name.trim()} is now a citizen journalist.`);
    if (done) setCitForm({ identifier: "", name: "", area: "" });
  };
  const setReporterStatus = (r: Reporter, status: "active" | "revoked") =>
    run(() => supabase!.from("citizen_reporters").update({ status }).eq("user_id", r.user_id), `${r.name} ${status === "active" ? "re-appointed" : "revoked"}.`);

  const card = "rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm";
  const roleBadge = (id: string) => {
    const r = ROLES.find((x) => x.id === id)!;
    return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-black ${r.color}`}><r.icon className="size-3" />{r.label}</span>;
  };

  return (
    <div className="space-y-5">
      {/* the three roles */}
      <div className="grid gap-3 md:grid-cols-3">
        {ROLES.map((r) => (
          <div key={r.id} className={`${card} p-4`}>
            <div className="flex items-center justify-between">
              {roleBadge(r.id)}
              <span className="text-2xl font-black">
                {r.id === "citizen" ? reporters.filter((x) => x.status === "active").length : staff.filter((x) => x.role === r.id).length + (r.id === "admin" ? 1 : 0)}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">{r.can}</p>
          </div>
        ))}
      </div>

      {note && <div className={`rounded-xl border p-3 text-sm font-bold ${note.ok ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700" : "border-red-500/20 bg-red-500/10 text-red-700"}`}>{note.text}</div>}

      {/* team */}
      <section className={card}>
        <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] px-4 py-3">
          <ShieldCheck className="size-4 text-red-600" />
          <h3 className="text-sm font-black">Admins & editors</h3>
          <div className="flex-1" />
          <button onClick={load} className="flex items-center gap-1 text-xs font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
        <div className="grid gap-2 border-b border-[hsl(var(--border))] p-4 md:grid-cols-[1.3fr_1fr_150px_auto]">
          <Input value={staffForm.identifier} onChange={(e) => setStaffForm({ ...staffForm, identifier: e.target.value })} placeholder="Email or phone of their VaartaNow account" className="h-10 rounded-xl text-sm" />
          <Input value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} placeholder="Name (optional)" className="h-10 rounded-xl text-sm" />
          <select value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as "admin" | "editor" })} className="h-10 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 px-3 text-sm font-bold">
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
          <Button onClick={addStaff} disabled={busy} className="h-10 rounded-xl bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700"><UserPlus className="size-4" /> Add</Button>
          <p className="text-[11px] text-[hsl(var(--muted-foreground))] md:col-span-4">The person must sign in to VaartaNow once (email OTP or phone) before you can give them a role.</p>
        </div>
        <ul className="divide-y divide-[hsl(var(--border))]">
          <li className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-zinc-950">{(ownerEmail ?? "O").slice(0, 2).toUpperCase()}</span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold">{ownerEmail ?? "Site owner"}</div>
              <div className="text-[11px] text-[hsl(var(--muted-foreground))]">Site owner · built-in admin, cannot be removed here</div>
            </div>
            {roleBadge("admin")}
          </li>
          {staff.map((s) => (
            <li key={s.user_id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-xs font-black">{(s.name || s.email || "?").slice(0, 2).toUpperCase()}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{s.name || s.email}{s.user_id === currentUserId && <span className="ml-1.5 text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">(you)</span>}</div>
                <div className="truncate text-[11px] text-[hsl(var(--muted-foreground))]">{s.name ? `${s.email} · ` : ""}added {date(s.created_at)}{s.added_by ? ` by ${s.added_by}` : ""}</div>
              </div>
              <select
                value={s.role}
                disabled={busy || s.user_id === currentUserId}
                onChange={(e) => changeRole(s, e.target.value as "admin" | "editor")}
                className="h-8 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 px-2 text-xs font-bold"
              >
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={() => removeStaff(s)}
                disabled={busy || s.user_id === currentUserId}
                title={s.user_id === currentUserId ? "You cannot remove yourself" : "Remove from team"}
                className="rounded-lg p-2 text-red-600 hover:bg-red-500/10 disabled:opacity-30"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
          {!loading && staff.length === 0 && <li className="px-4 py-6 text-center text-xs text-[hsl(var(--muted-foreground))]">No editors or extra admins yet. Add someone above.</li>}
        </ul>
      </section>

      {/* citizen journalists */}
      <section className={card}>
        <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] px-4 py-3">
          <Megaphone className="size-4 text-amber-600" />
          <h3 className="text-sm font-black">Citizen journalists</h3>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">· {reporters.filter((r) => r.status === "active").length} active</span>
        </div>
        <div className="grid gap-2 border-b border-[hsl(var(--border))] p-4 md:grid-cols-[1.2fr_1fr_1fr_auto]">
          <Input value={citForm.identifier} onChange={(e) => setCitForm({ ...citForm, identifier: e.target.value })} placeholder="Email or phone of their account" className="h-10 rounded-xl text-sm" />
          <Input value={citForm.name} onChange={(e) => setCitForm({ ...citForm, name: e.target.value })} placeholder="Name shown on their reports" className="h-10 rounded-xl text-sm" />
          <Input value={citForm.area} onChange={(e) => setCitForm({ ...citForm, area: e.target.value })} placeholder="Area, e.g. Gajuwaka, Vizag" className="h-10 rounded-xl text-sm" />
          <Button onClick={appoint} disabled={busy} className="h-10 rounded-xl bg-amber-500 px-4 text-sm font-bold text-black hover:bg-amber-600"><UserPlus className="size-4" /> Appoint</Button>
          <p className="text-[11px] text-[hsl(var(--muted-foreground))] md:col-span-4">You can also appoint a citizen straight from one of their reports in the Review Queue. Every report is still reviewed before publishing.</p>
        </div>
        <ul className="divide-y divide-[hsl(var(--border))]">
          {reporters.map((r) => {
            const c = reportCounts[r.user_id] ?? { total: 0, approved: 0 };
            return (
              <li key={r.user_id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-amber-500/15 text-xs font-black text-amber-700">{r.name.slice(0, 2).toUpperCase()}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{r.name}{r.area ? <span className="font-semibold text-[hsl(var(--muted-foreground))]"> · {r.area}</span> : null}</div>
                  <div className="truncate text-[11px] text-[hsl(var(--muted-foreground))]">
                    {c.total} report(s), {c.approved} published · appointed {date(r.appointed_at)}{r.appointed_by ? ` by ${r.appointed_by}` : ""}
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${r.status === "active" ? "bg-emerald-500/15 text-emerald-700" : "bg-zinc-500/15 text-zinc-500"}`}>{r.status === "active" ? "Active" : "Revoked"}</span>
                <Button variant="secondary" disabled={busy} onClick={() => setReporterStatus(r, r.status === "active" ? "revoked" : "active")} className="h-8 rounded-lg px-3 text-xs font-bold">
                  {r.status === "active" ? "Revoke" : "Re-appoint"}
                </Button>
              </li>
            );
          })}
          {!loading && reporters.length === 0 && <li className="px-4 py-6 text-center text-xs text-[hsl(var(--muted-foreground))]">No citizen journalists yet.</li>}
        </ul>
      </section>
    </div>
  );
}
