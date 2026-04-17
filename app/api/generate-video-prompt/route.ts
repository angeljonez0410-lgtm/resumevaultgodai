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

export async function POST(req: NextRequest) {
  if (!(await getAuthUser(req))) return unauthorized();
  try {
    const openai = getOpenAI();
=======

export async function POST(req: NextRequest) {
  try {
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
    const body = await req.json();
    const { topic, visualStyle } = body;

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

<<<<<<< HEAD
=======
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

    const brandVoice = settings?.brand_voice || "Professional, empowering, premium";
<<<<<<< HEAD
    const targetAudience = settings?.target_audience || "Job seekers and professionals";
=======
    const targetAudience = settings?.target_audience || "job seekers, career changers, and ambitious professionals";
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)

    const prompt = `
You are a premium video ad creative strategist.

<<<<<<< HEAD
Generate one photorealistic short-form vertical video prompt for ResumeVault.

Brand: ResumeVault
Topic: ${topic}
Visual style preset: ${visualStyle || "Premium SaaS Ad"}
=======
Generate one photorealistic short-form vertical video prompt for ResumeVaultGod.com.

Brand: ResumeVaultGod.com
Website: https://resumevaultgod.com/
Topic: ${topic}
Visual style preset: ${visualStyle || "ResumeVaultGod AI Career Brand"}
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
Brand voice: ${brandVoice}
Target audience: ${targetAudience}

Requirements:
- 9:16 vertical
- 15 to 30 seconds
- premium SaaS ad feel
- photorealistic
- cinematic
- realistic people and settings
- no animation unless necessary
- no cheesy stock footage look

The concept should include:
- hook scene
- subject
- setting
- motion/action
- camera movement
- lighting
- product/app usage moment if relevant
- ending CTA visual
<<<<<<< HEAD
=======
- clear tie-in to AI resumes, ATS optimization, interview prep, cover letters, or application tracking
- CTA to visit ResumeVaultGod.com
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)

Output in this exact format:

VIDEO_PROMPT:
[final detailed video prompt]

SHOT_LIST:
- [shot 1]
- [shot 2]
- [shot 3]

STYLE_NOTES:
[style notes]
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
    });

    const content = completion.choices[0]?.message?.content?.trim() || "";

    await supabase.from("social_logs").insert({
      action: "Generated realistic video prompt",
      result: `Video prompt generated for topic: ${topic}`,
    });

    return NextResponse.json({ prompt: content });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate video prompt" },
      { status: 500 }
    );
  }
}
