import { NextRequest, NextResponse } from "next/server";
import { buildLinkedInOAuthUrl } from "@/lib/linkedin-oauth";
import { getAppUrl } from "@/lib/app-url";

export async function GET(req: NextRequest) {
  try {
    const redirectUri = getAppUrl("/api/social-connect/linkedin/callback", req);
    const state = `linkedin:${crypto.randomUUID()}`;
    const authUrl = buildLinkedInOAuthUrl(redirectUri, state);
    const response = NextResponse.redirect(authUrl);

    response.cookies.set("linkedin_oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: req.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 600,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start LinkedIn OAuth" },
      { status: 500 }
    );
  }
}
