import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getSupabaseAdminConfig } from "@/lib/supabase-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const config = getSupabaseAdminConfig();

  if (config.missing.length > 0) {
    return NextResponse.json(
      {
        connected: false,
        error: "Supabase is not configured",
        missing: config.missing,
      },
      { status: 500 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("user_profiles")
      .select("user_id", { count: "exact", head: true });

    if (error) {
      return NextResponse.json(
        {
          connected: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ connected: true });
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : "Unable to reach Supabase",
      },
      { status: 500 }
    );
  }
}
