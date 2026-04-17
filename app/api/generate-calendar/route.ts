import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";
<<<<<<< HEAD
import { getAuthUser, unauthorized } from "../../../lib/auth";

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}
=======
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)

function addDays(base: Date, days: number) {
  const copy = new Date(base);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export async function POST(req: NextRequest) {
<<<<<<< HEAD
  if (!(await getAuthUser(req))) return unauthorized();
  try {
    const openai = getOpenAI();
=======
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
    const supabase = getSupabaseAdmin();

    const { data: settings } = await supabase
      .from("social_settings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const brandVoice = settings?.brand_voice || "Professional, helpful, empowering";
<<<<<<< HEAD
    const targetAudience = settings?.target_audience || "Job seekers";
    const postFrequency = settings?.post_frequency || "daily";

    const prompt = `
Create a 30-day social media content calendar for ResumeVault.

=======
    const targetAudience = settings?.target_audience || "job seekers, career changers, and professionals who want better resumes";
    const postFrequency = settings?.post_frequency || "daily";

    const prompt = `
Create a 30-day social media content calendar for ResumeVaultGod.com.

Website: https://resumevaultgod.com/
Core offer: AI resume builder, ATS optimization, cover letters, interview prep, application tracking, and career-growth tools.
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
Brand voice: ${brandVoice}
Target audience: ${targetAudience}
Posting frequency: ${postFrequency}

Return exactly 30 items as a JSON array.
Each item must include:
- day_number
- platform
- topic
- caption

Rules:
<<<<<<< HEAD
- platforms should rotate between instagram, linkedin, twitter, tiktok
- content should help job seekers and career changers
- captions should be engaging and concise
=======
- platforms should rotate between instagram, facebook, linkedin, twitter, youtube, pinterest, tiktok, threads, reddit
- content should help job seekers and career changers while pointing to ResumeVaultGod.com
- captions should be engaging and concise
- include CTAs that naturally reference ResumeVaultGod.com
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
- output valid JSON only
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
    });

    const content = completion.choices[0]?.message?.content?.trim() || "[]";

    let items: Record<string, unknown>[] = [];

    try {
      items = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON" },
        { status: 500 }
      );
    }

    if (!Array.isArray(items) || !items.length) {
      return NextResponse.json(
        { error: "No calendar items generated" },
        { status: 500 }
      );
    }

    const now = new Date();

    const rows = items.slice(0, 30).map((item, index) => ({
      platform: item.platform || "instagram",
      topic: item.topic || `Content Idea ${index + 1}`,
      caption: item.caption || "",
      status: "scheduled",
      scheduled_time: addDays(now, index + 1).toISOString(),
    }));

    const { data, error } = await supabase
      .from("social_posts")
      .insert(rows)
      .select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("social_logs").insert({
      action: "Generated 30-day calendar",
      result: `Created ${rows.length} scheduled posts`,
    });

    return NextResponse.json({
      success: true,
      count: rows.length,
      posts: data || [],
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate content calendar" },
      { status: 500 }
    );
  }
}
