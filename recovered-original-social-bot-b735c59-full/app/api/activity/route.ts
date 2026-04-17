import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";
import { getAuthUser, unauthorized } from "../../../lib/auth";

export async function GET(req: NextRequest) {
  if (!(await getAuthUser(req))) return unauthorized();
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("social_activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ activities: [], error: error.message });
    }

    return NextResponse.json({ activities: data || [] });
  } catch {
    return NextResponse.json({ activities: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await getAuthUser(req))) return unauthorized();
  try {
    const { platform, action, username, detail } = await req.json();

    if (!platform || !action) {
      return NextResponse.json({ error: "Platform and action required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("social_activity_log")
      .insert({
        platform,
        action,
        username: username || null,
        detail: detail || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ activity: data });
  } catch {
    return NextResponse.json({ error: "Failed to log activity" }, { status: 500 });
  }
}
