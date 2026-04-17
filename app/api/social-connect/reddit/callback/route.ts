import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { exchangeRedditCodeForToken, fetchRedditMe } from "@/lib/reddit-oauth";
import { getAppUrl } from "@/lib/app-url";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const storedState = req.cookies.get("reddit_oauth_state")?.value;
    const targetSubreddit =
      req.cookies.get("reddit_target_subreddit")?.value ||
      req.nextUrl.searchParams.get("subreddit") ||
      process.env.REDDIT_DEFAULT_SUBREDDIT ||
      "resumevaultgod";

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
    if (provider !== "reddit") {
      return NextResponse.json({ error: "Invalid Reddit provider" }, { status: 400 });
    }

    const redirectUri = getAppUrl("/api/social-connect/reddit/callback", req);
    const tokenData = await exchangeRedditCodeForToken(code, redirectUri);
    if (!tokenData.access_token) {
      throw new Error("Reddit did not return an access token");
    }

    const me = await fetchRedditMe(tokenData.access_token);
    const redditUser = me.name || me.id || "reddit-user";
    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("provider", "reddit")
      .eq("handle", targetSubreddit)
      .limit(1)
      .maybeSingle();

    const row = {
      provider: "reddit",
      account_name: `r/${targetSubreddit}`,
      handle: targetSubreddit,
      auth_mode: "oauth",
      status: "connected",
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      token_expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
      scopes: tokenData.scope ? tokenData.scope.split(" ") : ["identity", "submit", "read"],
      metadata: {
        reddit_username: redditUser,
        reddit_subreddit: targetSubreddit,
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
      action: "Connected Reddit account",
      result: `Linked ${me.name || me.id || "reddit-user"} to r/${targetSubreddit}`,
    });

    const redirect = new URL("/app/social-bot/accounts", req.url);
    redirect.searchParams.set("connected", "reddit");
    redirect.searchParams.set("provider", "reddit");

    const response = NextResponse.redirect(redirect);
    response.cookies.delete("reddit_oauth_state");
    response.cookies.delete("reddit_target_subreddit");
    return response;
  } catch (error) {
    const redirect = new URL("/app/social-bot/accounts", req.url);
    redirect.searchParams.set("connected", "reddit");
    redirect.searchParams.set("error", error instanceof Error ? error.message : "Failed to connect Reddit account");
    return NextResponse.redirect(redirect);
  }
}
