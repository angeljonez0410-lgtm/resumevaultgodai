const SUPABASE_URL_ENV = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_ANON_KEY_ENV = "NEXT_PUBLIC_SUPABASE_ANON_KEY";
const SUPABASE_SERVICE_ROLE_ENV = "SUPABASE_SERVICE_ROLE_KEY";

export function getSupabasePublicConfig() {
  const url = process.env[SUPABASE_URL_ENV];
  const anonKey = process.env[SUPABASE_ANON_KEY_ENV];
  const missing = [
    !url ? SUPABASE_URL_ENV : null,
    !anonKey ? SUPABASE_ANON_KEY_ENV : null,
  ].filter(Boolean) as string[];

  if (missing.length > 0) {
    return { url: null, anonKey: null, missing };
  }

  return { url, anonKey, missing };
}

export function getSupabaseAdminConfig() {
  const publicConfig = getSupabasePublicConfig();
  const serviceRoleKey = process.env[SUPABASE_SERVICE_ROLE_ENV];
  const missing = [
    ...publicConfig.missing,
    !serviceRoleKey ? SUPABASE_SERVICE_ROLE_ENV : null,
  ].filter(Boolean) as string[];

  if (missing.length > 0) {
    return { url: null, serviceRoleKey: null, missing };
  }

  return {
    url: publicConfig.url,
    serviceRoleKey,
    missing,
  };
}

export function formatMissingSupabaseEnv(missing: string[]) {
  return `Missing Supabase environment variables: ${missing.join(", ")}`;
}
