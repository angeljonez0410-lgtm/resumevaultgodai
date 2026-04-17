import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  exchangeLinkedInCodeForToken,
  fetchLinkedInProfile,
} from "@/lib/linkedin-oauth";
import { getAppUrl } from "@/lib/app-url";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const storedState = req.cookies.get("linkedin_oauth_state")?.value;

    if (!code) {
      return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
    }

    if (!state) {
      return NextResponse.json({ error: "Missing OAuth state" }, { status: 400 });
    }

    if (storedState && storedState !== state) {
      return NextResponse.json({ error: "OAuth state mismatch" }, { status: 400 });
    }

    const redirectUri = getAppUrl("/api/social-connect/linkedin/callback", req);
    const tokenData = await exchangeLinkedInCodeForToken(code, redirectUri);
    if (!tokenData.access_token) {
      throw new Error("LinkedIn did not return an access token");
    }

    const profile = await fetchLinkedInProfile(tokenData.access_token);
    if (!profile.id) {
      throw new Error("LinkedIn profile did not return a member id");
    }

    const authorUrn = `urn:li:person:${profile.id}`;
    const displayName = [profile.localizedFirstName, profile.localizedLastName].filter(Boolean).join(" ").trim() || "LinkedIn Member";
    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("provider", "linkedin")
      .eq("handle", authorUrn)
      .limit(1)
      .maybeSingle();

    const row = {
      provider: "linkedin",
      account_name: displayName,
      handle: authorUrn,
      auth_mode: "oauth",
      status: "connected",
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      token_expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
      scopes: tokenData.scope ? tokenData.scope.split(" ") : ["r_liteprofile", "w_member_social"],
      metadata: {
        linkedin_profile: profile,
        linkedin_author_urn: authorUrn,
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
      action: "Connected LinkedIn account",
      result: `Linked ${displayName}`,
    });

    const redirect = new URL("/app/social-bot/accounts", req.url);
    redirect.searchParams.set("connected", "linkedin");
    redirect.searchParams.set("provider", "linkedin");

    const response = NextResponse.redirect(redirect);
    response.cookies.delete("linkedin_oauth_state");
    return response;
  } catch (error) {
    const redirect = new URL("/app/social-bot/accounts", req.url);
    redirect.searchParams.set("connected", "linkedin");
    redirect.searchParams.set("error", error instanceof Error ? error.message : "Failed to connect LinkedIn account");
    return NextResponse.redirect(redirect);
  }
}
