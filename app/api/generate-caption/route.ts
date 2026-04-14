import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";
import { getAuthUser, unauthorized } from "../../../lib/auth";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  if (!(await getAuthUser(req))) return unauthorized();
  try {
    const body = await req.json();
    const { topic } = body;

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: settings } = await supabase
      .from("social_settings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const brandVoice = settings?.brand_voice || "Professional, helpful, empowering";
    const targetAudience = settings?.target_audience || "job seekers, career changers, and professionals who want better resumes";
    const postFrequency = settings?.post_frequency || "daily";

    const prompt = `
You are writing a high-performing social media caption for ResumeVaultGod.com.

Topic: ${topic}
Website: https://resumevaultgod.com/
Core offer: AI resume builder, ATS optimization, cover letters, interview prep, application tracking, and career-growth tools.
Brand voice: ${brandVoice}
Target audience: ${targetAudience}
Post frequency style: ${postFrequency}

Write one engaging caption with:
- a strong hook
- useful career advice tied to ResumeVaultGod.com
- short paragraphs
- a call to action
- relevant hashtags

Keep it platform-neutral and ready for Instagram, LinkedIn, TikTok, Threads, or Twitter/X.
Do not mention unrelated brands. Make the CTA point people to ResumeVaultGod.com.
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

    const caption =
      completion.choices[0]?.message?.content?.trim() || "No caption generated";

    await supabase.from("social_logs").insert({
      action: "Generated AI caption",
      result: `Caption generated for topic: ${topic}`,
    });

    return NextResponse.json({ caption });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate caption" },
      { status: 500 }
    );
  }
}
