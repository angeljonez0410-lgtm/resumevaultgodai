import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ENV_PATH = path.resolve(process.cwd(), ".env");
const ALLOWED_KEYS = [
  "REPLICATE_API_TOKEN",
  "REPLICATE_API_KEY",
  "OPENAI_API_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ANON_KEY",
  "SOCIAL_FACEBOOK_CLIENT_ID",
  "SOCIAL_FACEBOOK_CLIENT_SECRET",
  "SOCIAL_INSTAGRAM_CLIENT_ID",
  "SOCIAL_INSTAGRAM_CLIENT_SECRET",
  "SOCIAL_TWITTER_CLIENT_ID",
  "SOCIAL_TWITTER_CLIENT_SECRET",
  "SOCIAL_LINKEDIN_CLIENT_ID",
  "SOCIAL_LINKEDIN_CLIENT_SECRET",
  "SOCIAL_TIKTOK_CLIENT_KEY",
  "SOCIAL_TIKTOK_CLIENT_SECRET",
  "SOCIAL_THREADS_CLIENT_ID",
  "SOCIAL_THREADS_CLIENT_SECRET",
  "SOCIAL_YOUTUBE_CLIENT_ID",
  "SOCIAL_YOUTUBE_CLIENT_SECRET",
  "SOCIAL_PINTEREST_CLIENT_ID",
  "SOCIAL_PINTEREST_CLIENT_SECRET",
  "SOCIAL_REDDIT_CLIENT_ID",
  "SOCIAL_REDDIT_CLIENT_SECRET"
];

function parseEnvFile(content: string) {
  const lines = content.split("\n");
  const env: Record<string, string> = {};
  for (const line of lines) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) {
      env[match[1]] = match[2];
    }
  }
  return env;
}

function serializeEnvFile(env: Record<string, string>) {
  return Object.entries(env)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
}

export async function GET() {
  let envVars: Record<string, string> = {};
  try {
    const content = fs.readFileSync(ENV_PATH, "utf-8");
    envVars = parseEnvFile(content);
  } catch {}
  // Only return allowed keys
  const filtered = Object.fromEntries(
    Object.entries(envVars).filter(([k]) => ALLOWED_KEYS.includes(k))
  );
  return NextResponse.json({ env: filtered });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  let envVars: Record<string, string> = {};
  try {
    const content = fs.readFileSync(ENV_PATH, "utf-8");
    envVars = parseEnvFile(content);
  } catch {}
  for (const key of ALLOWED_KEYS) {
    if (key in body) {
      envVars[key] = body[key];
    }
  }
  fs.writeFileSync(ENV_PATH, serializeEnvFile(envVars), "utf-8");
  return NextResponse.json({ env: envVars });
}
