import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createXTweet, exchangeXCodeForToken, fetchXMe } from "@/lib/x-oauth";
import { getAppUrl } from "@/lib/app-url";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const storedState = req.cookies.get("x_oauth_state")?.value;
    const codeVerifier = req.cookies.get("x_code_verifier")?.value;

    if (!code) {
      return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
    }

    if (!state) {
      return NextResponse.json({ error: "Missing OAuth state" }, { status: 400 });
    }

    if (storedState && storedState !== state) {
      return NextResponse.json({ error: "OAuth state mismatch" }, { status: 400 });
    }

    if (!codeVerifier) {
      return NextResponse.json({ error: "Missing PKCE verifier" }, { status: 400 });
    }

    const [provider] = state.split(":");
    if (provider !== "x") {
      return NextResponse.json({ error: "Invalid X provider" }, { status: 400 });
    }

    const redirectUri = getAppUrl("/api/social-connect/x/callback", req);
    const tokenData = await exchangeXCodeForToken(code, redirectUri, codeVerifier);
    if (!tokenData.access_token) {
      throw new Error("X did not return an access token");
    }

    const profile = await fetchXMe(tokenData.access_token);
    const account = profile.data;
    if (!account?.id) {
      throw new Error("X profile did not return a user id");
    }

    const handle = account.username || account.id;
    const displayName = account.name || account.username || "X account";
    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("provider", "twitter")
      .eq("handle", handle)
      .limit(1)
      .maybeSingle();

    const row = {
      provider: "twitter",
      account_name: displayName,
      handle,
      auth_mode: "oauth",
      status: "connected",
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      token_expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
      scopes: tokenData.scope ? tokenData.scope.split(" ") : ["tweet.read", "users.read", "tweet.write", "offline.access"],
      metadata: {
        x_profile: account,
        x_user_id: account.id,
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
      action: "Connected X account",
      result: `Linked ${displayName}`,
    });

    const testTweet = req.nextUrl.searchParams.get("test_tweet");
    if (testTweet === "1") {
      await createXTweet(tokenData.access_token, "ResumeVaultGod is now connected to X. Ready to ship career content.");
    }

    const redirect = new URL("/app/social-bot/accounts", req.url);
    redirect.searchParams.set("connected", "x");
    redirect.searchParams.set("provider", "twitter");

    const response = NextResponse.redirect(redirect);
    response.cookies.delete("x_oauth_state");
    response.cookies.delete("x_code_verifier");
    return response;
  } catch (error) {
    const redirect = new URL("/app/social-bot/accounts", req.url);
    redirect.searchParams.set("connected", "x");
    redirect.searchParams.set("error", error instanceof Error ? error.message : "Failed to connect X account");
    return NextResponse.redirect(redirect);
  }
}
