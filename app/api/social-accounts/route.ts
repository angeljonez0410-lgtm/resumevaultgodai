import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { isSocialProvider } from "@/lib/social-platforms";

type SocialAccountInput = {
  provider?: string;
  account_name?: string;
  handle?: string;
  auth_mode?: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string | null;
  scopes?: string[] | string | null;
  metadata?: Record<string, unknown> | null;
};

function maskToken(token: string | null | undefined) {
  if (!token) return null;
  if (token.length <= 8) return "****";
  return `${token.slice(0, 4)}****${token.slice(-4)}`;
}

function sanitizeAccount(account: Record<string, unknown>) {
  return {
    ...account,
    access_token: null,
    refresh_token: null,
    access_token_masked: maskToken(account.access_token as string | null | undefined),
    refresh_token_masked: maskToken(account.refresh_token as string | null | undefined),
  };
}

export async function GET(req: NextRequest) {
  if (!(await getAuthUser(req))) return unauthorized();

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("social_accounts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      accounts: (data || []).map((account) => sanitizeAccount(account)),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch connected accounts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await getAuthUser(req))) return unauthorized();

  try {
    const body = (await req.json()) as SocialAccountInput;
    const provider = body.provider?.toLowerCase().trim();

    if (!provider || !isSocialProvider(provider)) {
      return NextResponse.json({ error: "Valid provider is required" }, { status: 400 });
    }

    const accountName = body.account_name?.trim() || provider;
    const handle = body.handle?.trim() || "";
    const authMode = body.auth_mode?.trim() || "token";

    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("provider", provider)
      .eq("handle", handle || accountName)
      .limit(1)
      .maybeSingle();

    const payload = {
      provider,
      account_name: accountName,
      handle,
      auth_mode: authMode,
      access_token: body.access_token || null,
      refresh_token: body.refresh_token || null,
      token_expires_at: body.token_expires_at || null,
      scopes: Array.isArray(body.scopes) ? body.scopes : body.scopes || [],
      metadata: body.metadata || {},
      status: body.access_token ? "connected" : "pending",
      connected_at: new Date().toISOString(),
      last_validated_at: new Date().toISOString(),
    };

    if (existing?.id) {
      const { data, error } = await supabase
        .from("social_accounts")
        .update(payload)
        .eq("id", existing.id)
        .select("*")
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      await supabase.from("social_logs").insert({
        action: "Updated social account",
        result: `${provider} account ${accountName} updated`,
      });

      return NextResponse.json({
        account: sanitizeAccount(data),
      });
    }

    const { data, error } = await supabase
      .from("social_accounts")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("social_logs").insert({
      action: "Connected social account",
      result: `${provider} account ${accountName} connected`,
    });

    return NextResponse.json(
      {
        account: sanitizeAccount(data),
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save connected account" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await getAuthUser(req))) return unauthorized();

  try {
    const body = (await req.json()) as SocialAccountInput & { id?: string; status?: string };
    if (!body.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const updates: Record<string, unknown> = {};

    if (typeof body.account_name === "string") updates.account_name = body.account_name;
    if (typeof body.handle === "string") updates.handle = body.handle;
    if (typeof body.auth_mode === "string") updates.auth_mode = body.auth_mode;
    if (typeof body.access_token === "string") updates.access_token = body.access_token;
    if (typeof body.refresh_token === "string") updates.refresh_token = body.refresh_token;
    if (typeof body.token_expires_at === "string" || body.token_expires_at === null) {
      updates.token_expires_at = body.token_expires_at;
    }
    if (typeof body.status === "string") updates.status = body.status;
    if (body.metadata && typeof body.metadata === "object") updates.metadata = body.metadata;
    if (body.scopes) updates.scopes = body.scopes;
    updates.last_validated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("social_accounts")
      .update(updates)
      .eq("id", body.id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      account: sanitizeAccount(data),
    });
  } catch {
    return NextResponse.json({ error: "Failed to update connected account" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await getAuthUser(req))) return unauthorized();

  try {
    const body = await req.json();
    const id = body?.id;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("social_accounts").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("social_logs").insert({
      action: "Disconnected social account",
      result: `Account ${id} disconnected`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove connected account" }, { status: 500 });
  }
}
