import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./supabase-config";

/**
 * Verifies the Bearer token from the request and returns the authenticated user.
 * Returns null if auth fails, or a { user, supabase } object on success.
 */
export async function getAuthUser(req: NextRequest) {
  const { url, anonKey } = getSupabasePublicConfig();

  if (!url || !anonKey) return null;

  const accessToken = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!accessToken) return null;

  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  return { user, supabase };
}

/**
 * Returns 401 response for unauthorized requests.
 */
export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
