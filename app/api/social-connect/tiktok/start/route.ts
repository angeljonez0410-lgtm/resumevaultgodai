import { NextRequest, NextResponse } from "next/server";
import { buildTikTokOAuthUrl } from "@/lib/tiktok-oauth";
import { getAppUrl } from "@/lib/app-url";

export async function GET(req: NextRequest) {
  try {
    const redirectUri = getAppUrl("/api/social-connect/tiktok/callback", req);
    const state = `tiktok:${crypto.randomUUID()}`;
    const authUrl = buildTikTokOAuthUrl(redirectUri, state);
    const response = NextResponse.redirect(authUrl);

    response.cookies.set("tiktok_oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: req.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 600,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start TikTok OAuth" },
      { status: 500 }
    );
  }
}
