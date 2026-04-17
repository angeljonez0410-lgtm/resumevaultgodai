import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";
import { getAuthUser, unauthorized } from "../../../lib/auth";

export async function GET(req: NextRequest) {
  if (!(await getAuthUser(req))) return unauthorized();
  try {
    const supabase = getSupabaseAdmin();

    const { data: posts, error: postsError } = await supabase
      .from("social_posts")
      .select("id,status");

    if (postsError) {
      return NextResponse.json({ error: postsError.message }, { status: 500 });
    }

    const { data: logs, error: logsError } = await supabase
      .from("social_logs")
      .select("id");

    if (logsError) {
      return NextResponse.json({ error: logsError.message }, { status: 500 });
    }

    const totalPosts = posts?.length || 0;
    const drafts = posts?.filter((p) => p.status === "draft").length || 0;
    const scheduled = posts?.filter((p) => p.status === "scheduled").length || 0;
    const posted = posts?.filter((p) => p.status === "posted").length || 0;
    const failed = posts?.filter((p) => p.status === "failed").length || 0;
    const totalLogs = logs?.length || 0;

    return NextResponse.json({
      analytics: {
        totalPosts,
        drafts,
        scheduled,
        posted,
        failed,
        totalLogs,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}