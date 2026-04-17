import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  createPinterestBoard,
  createPinterestPin,
  exchangePinterestCodeForToken,
  fetchPinterestBoards,
} from "@/lib/pinterest-oauth";
import { getAppUrl } from "@/lib/app-url";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const storedState = req.cookies.get("pinterest_oauth_state")?.value;

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
    if (provider !== "pinterest") {
      return NextResponse.json({ error: "Invalid Pinterest provider" }, { status: 400 });
    }

    const redirectUri = getAppUrl("/api/social-connect/pinterest/callback", req);
    const tokenData = await exchangePinterestCodeForToken(code, redirectUri);
    if (!tokenData.access_token) {
      throw new Error("Pinterest did not return an access token");
    }

    const boardsResponse = await fetchPinterestBoards(tokenData.access_token);
    let boardId = boardsResponse.items?.[0]?.id || null;

    if (!boardId) {
      const createdBoard = await createPinterestBoard(
        tokenData.access_token,
        "ResumeVaultGod",
        "ResumeVaultGod content board"
      );
      boardId = createdBoard.id || null;
    }

    if (!boardId) {
      throw new Error("Pinterest could not identify or create a board");
    }

    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("provider", "pinterest")
      .eq("handle", boardId)
      .limit(1)
      .maybeSingle();

    const row = {
      provider: "pinterest",
      account_name: boardsResponse.items?.[0]?.name || "Pinterest account",
      handle: boardId,
      auth_mode: "oauth",
      status: "connected",
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      token_expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
      scopes: tokenData.scope ? tokenData.scope.split(",") : ["boards:read", "pins:read", "pins:write", "user_accounts:read"],
      metadata: {
        pinterest_board_id: boardId,
        pinterest_board_name: boardsResponse.items?.[0]?.name || "ResumeVaultGod",
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
      action: "Connected Pinterest account",
      result: `Linked board ${boardId}`,
    });

    const testPin = req.nextUrl.searchParams.get("test_pin");
    if (testPin === "1") {
      await createPinterestPin({
        accessToken: tokenData.access_token,
        boardId,
        title: "ResumeVaultGod",
        description: "ResumeVaultGod is connected to Pinterest.",
        link: "https://resumevaultgod.com/",
        imageUrl: "https://resumevaultgod.com/og-image.png",
      });
    }

    const redirect = new URL("/app/social-bot/accounts", req.url);
    redirect.searchParams.set("connected", "pinterest");
    redirect.searchParams.set("provider", "pinterest");

    const response = NextResponse.redirect(redirect);
    response.cookies.delete("pinterest_oauth_state");
    return response;
  } catch (error) {
    const redirect = new URL("/app/social-bot/accounts", req.url);
    redirect.searchParams.set("connected", "pinterest");
    redirect.searchParams.set("error", error instanceof Error ? error.message : "Failed to connect Pinterest account");
    return NextResponse.redirect(redirect);
  }
}
