import { createClient } from "@supabase/supabase-js";
import { formatMissingSupabaseEnv, getSupabaseAdminConfig } from "./supabase-config";

export function getSupabaseAdmin() {
  const { url, serviceRoleKey, missing } = getSupabaseAdminConfig();
  if (!url || !serviceRoleKey) {
    throw new Error(formatMissingSupabaseEnv(missing));
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
