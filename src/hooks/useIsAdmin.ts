import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// The site owner has app_metadata.role = "admin" (set on the server). Other admins and editors are
// given a role on the admin "Users & Roles" screen (staff_roles); the database decides with my_role().
export const isAdminUser = (user: User | null | undefined) => user?.app_metadata?.role === "admin";

export type StaffRole = "admin" | "editor" | "citizen" | null;

export async function fetchMyRole(session: Session | null): Promise<StaffRole> {
  if (!session?.user || !supabase) return null;
  if (isAdminUser(session.user)) return "admin";
  const { data, error } = await supabase.rpc("my_role");
  return error ? null : ((data as StaffRole) ?? null);
}

export function useStaffRole() {
  const [state, setState] = useState<{ loading: boolean; role: StaffRole; user: User | null }>({ loading: !!supabase, role: null, user: null });

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    const update = async (session: Session | null) => {
      const role = await fetchMyRole(session);
      if (alive) setState({ loading: false, role, user: session?.user ?? null });
    };
    supabase.auth.getSession().then(({ data: { session } }) => update(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => { update(session); });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}

export function useIsAdmin() {
  const { loading, role } = useStaffRole();
  return { loading, isAdmin: role === "admin" };
}
