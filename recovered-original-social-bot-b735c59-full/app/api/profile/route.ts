import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { getProfile, upsertProfile } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  try {
    const profile = await getProfile(auth.user.id);
    return NextResponse.json(profile || {});
  } catch {
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  try {
    const body = await req.json();
    const profile = await upsertProfile(auth.user.id, body);
    return NextResponse.json(profile);
  } catch {
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
