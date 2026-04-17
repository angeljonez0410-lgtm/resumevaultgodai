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
    const { topic, visualStyle } = body;

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

    const brandVoice = settings?.brand_voice || "Professional, empowering, premium";
    const targetAudience = settings?.target_audience || "Job seekers and professionals";

    const prompt = `
You are a world-class creative director for premium SaaS ad campaigns.

Generate one ultra-realistic AI image prompt for ResumeVault.

Brand: ResumeVault
Topic: ${topic}
Visual style preset: ${visualStyle || "Premium SaaS Ad"}
Brand voice: ${brandVoice}
Target audience: ${targetAudience}

The image must feel like:
- a premium startup ad
- cinematic
- photorealistic
- social-media ready
- 4K
- believable
- modern
- no stock-photo look

The image should be tied to ResumeVault and career growth themes:
- resumes
- job applications
- interview prep
- recruiters
- LinkedIn
- professionals using laptops/phones
- dashboard/product usage moments
- clean office or home office scenes
- diverse professionals
- authentic expressions

Output in this exact format:

PHOTO_PROMPT:
[final detailed prompt]

NEGATIVE_PROMPT:
[negative prompt]

Keep it concise but premium and specific.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
    });

    const content = completion.choices[0]?.message?.content?.trim() || "";

    await supabase.from("social_logs").insert({
      action: "Generated realistic photo prompt",
      result: `Photo prompt generated for topic: ${topic}`,
    });

    return NextResponse.json({ prompt: content });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate real photo prompt" },
      { status: 500 }
    );
  }
}