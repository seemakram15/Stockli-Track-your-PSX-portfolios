import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { FORWARDED_USER_HEADER } from "@/lib/auth/user-header-key";

export const getRequestUser = cache(async (): Promise<User | null> => {
  const headerList = await headers();
  const forwarded = headerList.get(FORWARDED_USER_HEADER);
  if (forwarded) {
    try {
      return JSON.parse(decodeURIComponent(forwarded)) as User;
    } catch {}
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
