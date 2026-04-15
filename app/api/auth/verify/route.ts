import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { formatMissingSupabaseEnv, getSupabasePublicConfig } from "@/lib/supabase-config";

export async function POST(req: NextRequest) {
  try {
    const { access_token, refresh_token } = await req.json();

    if (!access_token) {
      return NextResponse.json({ error: "No access token" }, { status: 400 });
    }

    const { url, anonKey, missing } = getSupabasePublicConfig();
    if (!url || !anonKey) {
      return NextResponse.json({ error: formatMissingSupabaseEnv(missing) }, { status: 500 });
    }

    const supabase = createClient(url, anonKey);

    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error || !data.user) {
      return NextResponse.json({ error: error?.message || "Invalid session" }, { status: 401 });
    }

    return NextResponse.json({
      user: { email: data.user.email, id: data.user.id },
      access_token: data.session?.access_token || access_token,
      refresh_token: data.session?.refresh_token || refresh_token,
    });
  } catch {
    return NextResponse.json({ error: "Auth verification failed" }, { status: 500 });
  }
}
