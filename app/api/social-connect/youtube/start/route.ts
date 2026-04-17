import { NextRequest, NextResponse } from "next/server";
import { buildYouTubeOAuthUrl } from "@/lib/youtube-oauth";
import { getAppUrl } from "@/lib/app-url";

export async function GET(req: NextRequest) {
  try {
    const redirectUri = getAppUrl("/api/social-connect/youtube/callback", req);
    const state = `youtube:${crypto.randomUUID()}`;
    const authUrl = buildYouTubeOAuthUrl(redirectUri, state);
    const response = NextResponse.redirect(authUrl);

    response.cookies.set("youtube_oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: req.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 600,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start YouTube OAuth" },
      { status: 500 }
    );
  }
}
