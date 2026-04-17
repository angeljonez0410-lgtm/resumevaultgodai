import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  try {
    const sb = getSupabaseAdmin();
    const { data: profiles } = await sb.from("user_profiles").select("*").order("created_at", { ascending: false });
    return NextResponse.json({ users: profiles || [] });
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
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

    const { data, error } = await sb.from("user_profiles").update(updates).eq("user_id", userId).select().single();
    if (error) throw error;
    return NextResponse.json({ user: data });
  } catch {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
