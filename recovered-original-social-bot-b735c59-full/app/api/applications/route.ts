import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { listApplications, createApplication, updateApplication, deleteApplication } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  try {
    const apps = await listApplications(auth.user.id);
    return NextResponse.json(apps);
  } catch {
    return NextResponse.json({ error: "Failed to load applications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  try {
    const body = await req.json();
    const app = await createApplication(auth.user.id, body);
    return NextResponse.json(app);
  } catch {
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  try {
    const body = await req.json();
    const { id, ...fields } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const app = await updateApplication(id, auth.user.id, fields);
    return NextResponse.json(app);
  } catch {
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await deleteApplication(id, auth.user.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 });
  }
}
