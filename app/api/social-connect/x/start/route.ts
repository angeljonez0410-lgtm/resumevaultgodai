import { NextRequest, NextResponse } from "next/server";
import { buildXOAuthUrl, createCodeChallenge, createCodeVerifier } from "@/lib/x-oauth";
import { getAppUrl } from "@/lib/app-url";

export async function GET(req: NextRequest) {
  try {
    const redirectUri = getAppUrl("/api/social-connect/x/callback", req);
    const state = `x:${crypto.randomUUID()}`;
    const codeVerifier = createCodeVerifier();
    const codeChallenge = await createCodeChallenge(codeVerifier);
    const authUrl = buildXOAuthUrl(redirectUri, state, codeChallenge);
    const response = NextResponse.redirect(authUrl);

    response.cookies.set("x_oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: req.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 600,
    });

    response.cookies.set("x_code_verifier", codeVerifier, {
      httpOnly: true,
      sameSite: "lax",
      secure: req.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 600,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start X OAuth" },
      { status: 500 }
    );
  }
}
