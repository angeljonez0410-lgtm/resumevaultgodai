import { NextRequest, NextResponse } from "next/server";
import { formatCaptionForPlatform } from "../../../lib/formatters";
<<<<<<< HEAD
import { getAuthUser, unauthorized } from "../../../lib/auth";

export async function POST(req: NextRequest) {
  if (!(await getAuthUser(req))) return unauthorized();
=======

export async function POST(req: NextRequest) {
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
  try {
    const body = await req.json();
    const { platform, topic, caption } = body;

    if (!platform || !topic) {
      return NextResponse.json(
        { error: "platform and topic are required" },
        { status: 400 }
      );
    }

    const formattedCaption = formatCaptionForPlatform({
      platform,
      topic,
      caption,
    });

    return NextResponse.json({ formattedCaption });
  } catch {
    return NextResponse.json(
      { error: "Failed to format caption" },
      { status: 500 }
    );
  }
}
