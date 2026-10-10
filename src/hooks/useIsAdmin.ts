import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// Mirrors the RLS rule on blog_posts: only users whose server-set app_metadata.role is "admin" are admins.
export const isAdminUser = (user: User | null | undefined) => user?.app_metadata?.role === "admin";

export function useIsAdmin() {
  const [state, setState] = useState<{ loading: boolean; isAdmin: boolean }>({ loading: !!supabase, isAdmin: false });

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ loading: false, isAdmin: isAdminUser(session?.user) });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setState({ loading: false, isAdmin: isAdminUser(session?.user) });
    });
    return () => subscription.unsubscribe();
  }, []);

  return state;
}
