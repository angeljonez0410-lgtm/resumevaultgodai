import { NextRequest, NextResponse } from "next/server";
<<<<<<< HEAD
import { createClient } from "@supabase/supabase-js";
=======
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "./supabase-admin";

const PUBLIC_USER_EMAIL = process.env.PUBLIC_USER_EMAIL || "public@resumevault.local";
type AuthResult = { user: User; supabase: SupabaseClient };

let publicUserPromise: Promise<User> | null = null;

async function getPublicUser() {
  if (!publicUserPromise) {
    publicUserPromise = (async () => {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 } as never);

      if (error) {
        throw error;
      }

      const existingUser = data.users.find((user) => user.email === PUBLIC_USER_EMAIL);
      if (existingUser) {
        return existingUser;
      }

      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email: PUBLIC_USER_EMAIL,
        email_confirm: true,
        user_metadata: { role: "public-demo" },
      });

      if (createError || !created.user) {
        throw createError || new Error("Failed to create public demo user");
      }

      return created.user;
    })().catch((error) => {
      publicUserPromise = null;
      throw error;
    });
  }

  return publicUserPromise;
}
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)

/**
 * Verifies the Bearer token from the request and returns the authenticated user.
 * Returns null if auth fails, or a { user, supabase } object on success.
 */
<<<<<<< HEAD
export async function getAuthUser(req: NextRequest) {
=======
export async function getAuthUser(req: NextRequest): Promise<AuthResult | null> {
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  const accessToken = req.headers.get("authorization")?.replace("Bearer ", "");
<<<<<<< HEAD
  if (!accessToken) return null;
=======
  if (!accessToken) return getPublicAuthUser();
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)

  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

<<<<<<< HEAD
  if (error || !user) return null;
=======
  if (error || !user) return getPublicAuthUser();
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)

  return { user, supabase };
}

/**
<<<<<<< HEAD
=======
 * Returns the shared public app user when no auth token is present.
 */
export async function getPublicAuthUser() {
  const user = await getPublicUser();
  const supabase = getSupabaseAdmin();
  return { user, supabase };
}

/**
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
 * Returns 401 response for unauthorized requests.
 */
export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
