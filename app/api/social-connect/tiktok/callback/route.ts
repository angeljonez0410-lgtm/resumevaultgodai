import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  exchangeTikTokCodeForToken,
  fetchTikTokCreatorInfo,
  fetchTikTokUserInfo,
} from "@/lib/tiktok-oauth";
import { getAppUrl } from "@/lib/app-url";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const storedState = req.cookies.get("tiktok_oauth_state")?.value;

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
    if (provider !== "tiktok") {
      return NextResponse.json({ error: "Invalid TikTok provider" }, { status: 400 });
    }

    const redirectUri = getAppUrl("/api/social-connect/tiktok/callback", req);
    const tokenData = await exchangeTikTokCodeForToken(code, redirectUri);
    if (!tokenData.access_token) {
      throw new Error("TikTok did not return an access token");
    }

    const userInfo = await fetchTikTokUserInfo(tokenData.access_token);
    const user = userInfo.data?.user;
    if (!user?.open_id) {
      throw new Error("TikTok user info not available");
    }

    const creatorInfo = await fetchTikTokCreatorInfo(tokenData.access_token);
    const privacyLevelOptions = creatorInfo.data?.privacy_level_options || [];

    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("provider", "tiktok")
      .eq("handle", user.username || user.open_id)
      .limit(1)
      .maybeSingle();

    const row = {
      provider: "tiktok",
      account_name: user.display_name || user.username || "TikTok account",
      handle: user.username || user.open_id,
      auth_mode: "oauth",
      status: "connected",
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      token_expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
      scopes: tokenData.scope ? tokenData.scope.split(" ") : ["user.info.basic", "video.publish", "video.upload"],
      metadata: {
        tiktok_open_id: user.open_id,
        tiktok_union_id: user.union_id || null,
        tiktok_username: user.username || null,
        tiktok_display_name: user.display_name || null,
        tiktok_avatar_url: user.avatar_large_url || user.avatar_url_100 || user.avatar_url || null,
        tiktok_profile_deep_link: user.profile_deep_link || null,
        tiktok_privacy_level_options: privacyLevelOptions,
        tiktok_comment_disabled: creatorInfo.data?.comment_disabled ?? null,
        tiktok_duet_disabled: creatorInfo.data?.duet_disabled ?? null,
        tiktok_stitch_disabled: creatorInfo.data?.stitch_disabled ?? null,
        tiktok_max_video_post_duration_sec: creatorInfo.data?.max_video_post_duration_sec ?? null,
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
      action: "Connected TikTok account",
      result: `Linked ${user.display_name || user.username || user.open_id}`,
    });

    const redirect = new URL("/app/social-bot/accounts", req.url);
    redirect.searchParams.set("connected", "tiktok");
    redirect.searchParams.set("provider", "tiktok");

    const response = NextResponse.redirect(redirect);
    response.cookies.delete("tiktok_oauth_state");
    return response;
  } catch (error) {
    const redirect = new URL("/app/social-bot/accounts", req.url);
    redirect.searchParams.set("connected", "tiktok");
    redirect.searchParams.set("error", error instanceof Error ? error.message : "Failed to connect TikTok account");
    return NextResponse.redirect(redirect);
  }
}
