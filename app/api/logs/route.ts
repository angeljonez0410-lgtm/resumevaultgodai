import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";
import { getAuthUser, unauthorized } from "../../../lib/auth";

export async function GET(req: NextRequest) {
  if (!(await getAuthUser(req))) return unauthorized();
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("social_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ logs: data || [] });
  } catch {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
