import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  exchangeMetaCodeForToken,
  fetchMetaPages,
  fetchMetaProfile,
  isMetaProvider,
  type MetaPage,
} from "@/lib/meta-oauth";
import { getAppUrl } from "@/lib/app-url";

type AccountPayload = {
  provider: "facebook" | "instagram";
  account_name: string;
  handle: string;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  metadata: Record<string, unknown>;
};

async function upsertAccount(payload: AccountPayload) {
  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("provider", payload.provider)
    .eq("handle", payload.handle)
    .limit(1)
    .maybeSingle();

  const row = {
    provider: payload.provider,
    account_name: payload.account_name,
    handle: payload.handle,
    auth_mode: "oauth",
    status: "connected",
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    token_expires_at: payload.token_expires_at,
    scopes: [
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_metadata",
      "pages_manage_posts",
      ...(payload.provider === "instagram" ? ["instagram_basic", "instagram_content_publish"] : []),
    ],
    metadata: payload.metadata,
    connected_at: new Date().toISOString(),
    last_validated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { data, error } = await supabase
      .from("social_accounts")
      .update(row)
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await supabase.from("social_accounts").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return data;
}

function buildFacebookPayload(page: MetaPage, profileName: string, provider: string) {
  return {
    provider: "facebook" as const,
    account_name: page.name || profileName || "Facebook Page",
    handle: page.id,
    metadata: {
      page_id: page.id,
      page_name: page.name || null,
      instagram_business_account: page.instagram_business_account || null,
      meta_profile_name: profileName || null,
      meta_source_provider: provider,
    },
  };
}

function buildInstagramPayload(page: MetaPage, profileName: string, provider: string) {
  const businessAccount = page.instagram_business_account;
  if (!businessAccount?.id) return null;

  return {
    provider: "instagram" as const,
    account_name: businessAccount.username || page.name || profileName || "Instagram Business",
    handle: businessAccount.username || businessAccount.id,
    metadata: {
      page_id: page.id,
      page_name: page.name || null,
      instagram_business_account: businessAccount,
      meta_profile_name: profileName || null,
      meta_source_provider: provider,
    },
  };
}

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const storedState = req.cookies.get("meta_oauth_state")?.value;

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
    if (!isMetaProvider(provider)) {
      return NextResponse.json({ error: "Invalid Meta provider" }, { status: 400 });
    }

    const redirectUri = getAppUrl("/api/social-connect/meta/callback", req);
    const tokenData = await exchangeMetaCodeForToken(code, redirectUri);
    const profile = await fetchMetaProfile(tokenData.accessToken);
    const pagesResponse = await fetchMetaPages(tokenData.accessToken);
    const pages = pagesResponse.data || [];

    if (!pages.length) {
      return NextResponse.json({ error: "No Facebook pages were returned for this account" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const savedAccounts: string[] = [];

    for (const page of pages) {
      const facebookPayload = buildFacebookPayload(page, profile.name || "", provider);
      await upsertAccount({
        ...facebookPayload,
        access_token: page.access_token || tokenData.accessToken,
        refresh_token: tokenData.accessToken,
        token_expires_at: tokenData.expiresIn ? new Date(Date.now() + tokenData.expiresIn * 1000).toISOString() : null,
      });
      savedAccounts.push(`facebook:${facebookPayload.account_name}`);

      const instagramPayload = buildInstagramPayload(page, profile.name || "", provider);
      if (instagramPayload) {
        await upsertAccount({
          ...instagramPayload,
          access_token: page.access_token || tokenData.accessToken,
          refresh_token: tokenData.accessToken,
          token_expires_at: tokenData.expiresIn ? new Date(Date.now() + tokenData.expiresIn * 1000).toISOString() : null,
        });
        savedAccounts.push(`instagram:${instagramPayload.account_name}`);
      }
    }

    await supabase.from("social_logs").insert({
      action: "Connected Meta account",
      result: `Linked ${savedAccounts.join(", ")}`,
    });

    const redirect = new URL("/app/social-bot/accounts", req.url);
    redirect.searchParams.set("connected", "meta");
    redirect.searchParams.set("provider", provider);
    redirect.searchParams.set("accounts", String(savedAccounts.length));

    const response = NextResponse.redirect(redirect);
    response.cookies.delete("meta_oauth_state");
    return response;
  } catch (error) {
    const redirect = new URL("/app/social-bot/accounts", req.url);
    redirect.searchParams.set("connected", "meta");
    redirect.searchParams.set("error", error instanceof Error ? error.message : "Failed to connect Meta account");
    return NextResponse.redirect(redirect);
  }
}
