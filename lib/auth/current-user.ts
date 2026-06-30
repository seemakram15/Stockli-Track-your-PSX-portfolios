import "server-only";
import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * The verified Supabase user for the current request, memoised with React
 * `cache()` so the (often 2-3) callers in a single render — middleware aside —
 * share ONE `auth.getUser()` network round-trip instead of each paying for
 * their own. This is the main per-navigation latency win for authed pages.
 */
export const getRequestUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
