import { NextRequest, NextResponse } from "next/server";
import { buildRedditOAuthUrl } from "@/lib/reddit-oauth";
import { getAppUrl } from "@/lib/app-url";

export async function GET(req: NextRequest) {
  try {
    const redirectUri = getAppUrl("/api/social-connect/reddit/callback", req);
    const subreddit = req.nextUrl.searchParams.get("subreddit") || process.env.REDDIT_DEFAULT_SUBREDDIT || "resumevaultgod";
    const state = `reddit:${crypto.randomUUID()}`;
    const authUrl = buildRedditOAuthUrl(redirectUri, state);
    const response = NextResponse.redirect(authUrl);

    response.cookies.set("reddit_oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: req.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 600,
    });

    response.cookies.set("reddit_target_subreddit", subreddit, {
      httpOnly: true,
      sameSite: "lax",
      secure: req.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 600,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start Reddit OAuth" },
      { status: 500 }
    );
  }
}
