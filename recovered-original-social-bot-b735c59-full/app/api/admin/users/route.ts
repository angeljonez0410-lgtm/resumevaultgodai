import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// Admin email(s) — only these users can access admin routes
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "angeljonez0410@gmail.com").split(",").map(e => e.trim().toLowerCase());

function isAdmin(email: string | undefined) {
  return email ? ADMIN_EMAILS.includes(email.toLowerCase()) : false;
}

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  if (!isAdmin(auth.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const sb = getSupabaseAdmin();
    const { data: profiles } = await sb
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    return NextResponse.json({ users: profiles || [] });
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  if (!isAdmin(auth.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { userId, credits, role } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const sb = getSupabaseAdmin();
    const updates: Record<string, unknown> = {};
    if (typeof credits === "number") updates.credits = credits;
    if (typeof role === "string") updates.role = role;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data, error } = await sb
      .from("user_profiles")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ user: data });
  } catch {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
