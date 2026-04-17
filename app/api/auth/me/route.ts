import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    return NextResponse.json({ user: auth?.user ? { email: auth.user.email, id: auth.user.id } : null });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
