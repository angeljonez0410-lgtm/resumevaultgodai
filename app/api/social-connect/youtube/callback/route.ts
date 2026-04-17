import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { exchangeYouTubeCodeForToken, fetchYouTubeChannel } from "@/lib/youtube-oauth";
import { getAppUrl } from "@/lib/app-url";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const storedState = req.cookies.get("youtube_oauth_state")?.value;

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
    if (provider !== "youtube") {
      return NextResponse.json({ error: "Invalid YouTube provider" }, { status: 400 });
    }

    const redirectUri = getAppUrl("/api/social-connect/youtube/callback", req);
    const tokenData = await exchangeYouTubeCodeForToken(code, redirectUri);
    if (!tokenData.access_token) {
      throw new Error("YouTube did not return an access token");
    }

    const channelResponse = await fetchYouTubeChannel(tokenData.access_token);
    const channel = channelResponse.items?.[0];
    if (!channel?.id) {
      throw new Error("YouTube channel not found for this account");
    }

    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("provider", "youtube")
      .eq("handle", channel.id)
      .limit(1)
      .maybeSingle();

    const row = {
      provider: "youtube",
      account_name: channel.snippet?.title || "YouTube channel",
      handle: channel.id,
      auth_mode: "oauth",
      status: "connected",
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      token_expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
      scopes: tokenData.scope ? tokenData.scope.split(" ") : ["https://www.googleapis.com/auth/youtube.upload"],
      metadata: {
        youtube_channel_id: channel.id,
        youtube_channel_title: channel.snippet?.title || null,
        youtube_channel_description: channel.snippet?.description || null,
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
      action: "Connected YouTube account",
      result: `Linked channel ${channel.snippet?.title || channel.id}`,
    });

    const redirect = new URL("/app/social-bot/accounts", req.url);
    redirect.searchParams.set("connected", "youtube");
    redirect.searchParams.set("provider", "youtube");

    const response = NextResponse.redirect(redirect);
    response.cookies.delete("youtube_oauth_state");
    return response;
  } catch (error) {
    const redirect = new URL("/app/social-bot/accounts", req.url);
    redirect.searchParams.set("connected", "youtube");
    redirect.searchParams.set("error", error instanceof Error ? error.message : "Failed to connect YouTube account");
    return NextResponse.redirect(redirect);
  }
}
