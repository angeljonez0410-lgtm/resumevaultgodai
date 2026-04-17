import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { listReviews, createReview } from "@/lib/db";

export async function GET() {
  try {
    const reviews = await listReviews();
    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json({ error: "Failed to load reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  try {
    const body = await req.json();
    const review = await createReview(auth.user.id, body);
    return NextResponse.json(review);
  } catch {
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }
}
