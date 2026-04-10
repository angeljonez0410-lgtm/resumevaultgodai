import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const accessToken = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!accessToken) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const supabase = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user: { email: user.email, id: user.id } });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
