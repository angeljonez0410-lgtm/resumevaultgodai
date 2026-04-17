import { NextRequest, NextResponse } from "next/server";
import { runScheduledPublishing } from "../../../lib/publisher";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const secret = process.env.CRON_SECRET;

    if (!secret || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await runScheduledPublishing();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to publish scheduled posts" },
      { status: 500 }
    );
  }
}