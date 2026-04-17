import { createClient } from "@supabase/supabase-js";

let client: ReturnType<typeof createClient> | null = null;

<<<<<<< HEAD
=======
const SESSION_STORAGE_KEY = "sb_session";
const ACCESS_TOKEN_KEY = "sb_access_token";
const REFRESH_TOKEN_KEY = "sb_refresh_token";
const USER_KEY = "sb_user";

function mirrorSessionToCustomKeys(value: string | null) {
  if (typeof window === "undefined") return;

  if (!value) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return;
  }

  try {
    const parsed = JSON.parse(value);
    const session = parsed?.currentSession ?? parsed;

    if (session?.access_token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, session.access_token);
    }

    if (session?.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
    }

    if (session?.user) {
      localStorage.setItem(
        USER_KEY,
        JSON.stringify({ email: session.user.email, id: session.user.id })
      );
    }
  } catch {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

function createSessionStorage() {
  return {
    getItem: (key: string) => {
      if (typeof window === "undefined") return null;
      if (key !== SESSION_STORAGE_KEY) return localStorage.getItem(key);
      return localStorage.getItem(SESSION_STORAGE_KEY);
    },
    setItem: (key: string, value: string) => {
      if (typeof window === "undefined") return;
      localStorage.setItem(key, value);
      if (key === SESSION_STORAGE_KEY) {
        mirrorSessionToCustomKeys(value);
      }
    },
    removeItem: (key: string) => {
      if (typeof window === "undefined") return;
      localStorage.removeItem(key);
      if (key === SESSION_STORAGE_KEY) {
        mirrorSessionToCustomKeys(null);
      }
    },
  };
}

>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
export function getSupabaseBrowser() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase browser environment variables");
  }

<<<<<<< HEAD
  client = createClient(url, anonKey);
  return client;
}
=======
  client = createClient(url, anonKey, {
    auth: {
      storageKey: SESSION_STORAGE_KEY,
      flowType: "pkce",
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
      storage: createSessionStorage(),
    },
  });
  return client;
}
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
