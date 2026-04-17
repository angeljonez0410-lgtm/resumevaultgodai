import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { exchangeThreadsCodeForToken, fetchThreadsProfile } from "@/lib/threads-oauth";
import { getAppUrl } from "@/lib/app-url";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const storedState = req.cookies.get("threads_oauth_state")?.value;

    if (!code) {
      return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
    }

    if (!state) {
      return NextResponse.json({ error: "Missing OAuth state" }, { status: 400 });
    }

    if (storedState && storedState !== state) {
      return NextResponse.json({ error: "OAuth state mismatch" }, { status: 400 });
    }

    const [provider] = state.split(":");
    if (provider !== "threads") {
      return NextResponse.json({ error: "Invalid Threads provider" }, { status: 400 });
    }

    const redirectUri = getAppUrl("/api/social-connect/threads/callback", req);
    const tokenData = await exchangeThreadsCodeForToken(code, redirectUri);
    if (!tokenData.access_token) {
      throw new Error("Threads did not return an access token");
    }

    const profile = await fetchThreadsProfile(tokenData.access_token);
    const threadsUsername = profile.username || profile.id || "threads-account";
    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("provider", "threads")
      .eq("handle", threadsUsername)
      .limit(1)
      .maybeSingle();

    const row = {
      provider: "threads",
      account_name: profile.name || profile.username || "Threads account",
      handle: threadsUsername,
      auth_mode: "oauth",
      status: "connected",
      access_token: tokenData.access_token,
      refresh_token: null,
      token_expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
      scopes: tokenData.scope ? tokenData.scope.split(",") : ["threads_basic", "threads_content_publish"],
      metadata: {
        threads_user_id: profile.id || null,
        threads_username: profile.username || null,
        threads_name: profile.name || null,
      },
      connected_at: new Date().toISOString(),
      last_validated_at: new Date().toISOString(),
    };

    if (existing?.id) {
      const { error } = await supabase.from("social_accounts").update(row).eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("social_accounts").insert(row);
      if (error) throw new Error(error.message);
    }

    await supabase.from("social_logs").insert({
      action: "Connected Threads account",
      result: `Linked account ${profile.username || profile.id || "threads-account"}`,
    });

    const redirect = new URL("/app/social-bot/accounts", req.url);
    redirect.searchParams.set("connected", "threads");
    redirect.searchParams.set("provider", "threads");

    const response = NextResponse.redirect(redirect);
    response.cookies.delete("threads_oauth_state");
    return response;
  } catch (error) {
    const redirect = new URL("/app/social-bot/accounts", req.url);
    redirect.searchParams.set("connected", "threads");
    redirect.searchParams.set("error", error instanceof Error ? error.message : "Failed to connect Threads account");
    return NextResponse.redirect(redirect);
  }
}
