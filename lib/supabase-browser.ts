import { createClient } from "@supabase/supabase-js";
import { formatMissingSupabaseEnv, getSupabasePublicConfig } from "./supabase-config";

let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowser() {
  if (client) return client;

  const { url, anonKey, missing } = getSupabasePublicConfig();
  if (!url || !anonKey) {
    throw new Error(formatMissingSupabaseEnv(missing));
  }

  client = createClient(url, anonKey);
  return client;
}
