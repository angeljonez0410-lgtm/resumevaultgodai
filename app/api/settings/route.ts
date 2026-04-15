import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";
import { getAuthUser, unauthorized } from "../../../lib/auth";

export async function GET(req: NextRequest) {
  if (!(await getAuthUser(req))) return unauthorized();
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("social_settings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      settings: data || {
        brand_voice: "",
        target_audience: "",
        post_frequency: "daily",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await getAuthUser(req))) return unauthorized();
  try {
    const body = await req.json();
    const { brand_voice, target_audience, post_frequency } = body;

    const supabase = getSupabaseAdmin();

    const { data: existing } = await supabase
      .from("social_settings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let saved;

    if (existing?.id) {
      const { data, error } = await supabase
        .from("social_settings")
        .update({
          brand_voice,
          target_audience,
          post_frequency,
        })
        .eq("id", existing.id)
        .select("*")
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      saved = data;
    } else {
      const { data, error } = await supabase
        .from("social_settings")
        .insert({
          brand_voice,
          target_audience,
          post_frequency,
        })
        .select("*")
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      saved = data;
    }

    await supabase.from("social_logs").insert({
      action: "Saved settings",
      result: "Social settings updated",
    });

    return NextResponse.json({ settings: saved });
  } catch {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
