import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  // Test the key directly against Supabase
  let healthStatus = "not tested";
  let authTest = "not tested";
  try {
    const healthRes = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    healthStatus = `${healthRes.status} ${healthRes.statusText}`;
  } catch (e: unknown) {
    healthStatus = `error: ${e instanceof Error ? e.message : String(e)}`;
  }

  try {
    const authRes = await fetch(`${url}/auth/v1/health`);
    const authBody = await authRes.text();
    authTest = `${authRes.status}: ${authBody}`;
  } catch (e: unknown) {
    authTest = `error: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json({
    fullUrl: url,
    anonKeyLength: anonKey.length,
    anonKeyFirst40: anonKey.slice(0, 40),
    anonKeyLast10: anonKey.slice(-10),
    hasWhitespace: anonKey !== anonKey.trim(),
    hasNewlines: anonKey.includes("\n") || anonKey.includes("\r"),
    healthStatus,
    authTest,
  });
}
