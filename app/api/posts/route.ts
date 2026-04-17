import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";
import { getAuthUser, unauthorized } from "../../../lib/auth";

export async function GET(req: NextRequest) {
  if (!(await getAuthUser(req))) return unauthorized();
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("social_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ posts: data || [] });
  } catch {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await getAuthUser(req))) return unauthorized();
  try {
    const body = await req.json();
    const {
      platform,
      topic,
      caption,
      image_url,
<<<<<<< HEAD
=======
      media_url,
      tiktok_privacy_level,
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
      status,
      scheduled_time,
      visual_prompt,
      video_prompt,
      visual_style,
    } = body;

    if (!platform || !topic) {
      return NextResponse.json(
        { error: "platform and topic are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("social_posts")
      .insert({
        platform,
        topic,
        caption: caption || null,
        image_url: image_url || null,
<<<<<<< HEAD
=======
        media_url: media_url || null,
        tiktok_privacy_level: tiktok_privacy_level || null,
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
        status: status || "draft",
        scheduled_time: scheduled_time || null,
        visual_prompt: visual_prompt || null,
        video_prompt: video_prompt || null,
        visual_style: visual_style || null,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("social_logs").insert({
      action: "Created post",
      result: `Post ${data.id} created`,
    });

    return NextResponse.json({ post: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
