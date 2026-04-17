import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isSocialProvider, type SocialProvider } from "@/lib/social-platforms";
import { DEFAULT_SOCIAL_CONTENT, type SocialContentIdea } from "@/lib/social-content";

function addDays(base: Date, days: number) {
  const copy = new Date(base);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function normalizeIdeas(items: unknown[]): SocialContentIdea[] {
  return items
    .map((item, index) => {
      const row = item as Partial<SocialContentIdea> & { platform?: string };
      const platform = isSocialProvider(String(row.platform || "instagram"))
        ? (String(row.platform) as SocialProvider)
        : "instagram";

      return {
        platform,
        topic: row.topic || `Content Idea ${index + 1}`,
        description: row.description || row.caption || "Helpful career content for ResumeVaultGod.com.",
        caption: row.caption || "",
        hook: row.hook || "",
        cta: row.cta || "Try ResumeVaultGod.com",
        hashtags: Array.isArray(row.hashtags) ? row.hashtags : [],
      };
    })
    .slice(0, 20);
}

async function generateWithAI(): Promise<SocialContentIdea[]> {
  if (!process.env.OPENAI_API_KEY) {
    return DEFAULT_SOCIAL_CONTENT;
  }

  const settingsClient = getSupabaseAdmin();
  const { data: settings } = await settingsClient
    .from("social_settings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const brandVoice = settings?.brand_voice || "Professional, empowering, modern";
  const targetAudience = settings?.target_audience || "job seekers, career changers, and ambitious professionals";
  const prompt = `
Create 20 social content ideas for ResumeVaultGod.com.

Website: https://resumevaultgod.com/
Brand voice: ${brandVoice}
Target audience: ${targetAudience}

Return valid JSON only, as an array of 20 objects. Each object must include:
- platform (instagram, facebook, twitter, linkedin, tiktok, threads, youtube, pinterest, reddit)
- topic
- description
- caption
- hook
- cta
- hashtags (array of strings)

Make the ideas varied across resume writing, ATS, cover letters, interviewing, job search confidence, networking, personal branding, and salary negotiation.
`;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.85,
    messages: [{ role: "user", content: prompt }],
  });

  const content = completion.choices[0]?.message?.content?.trim() || "[]";

  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length) {
      return normalizeIdeas(parsed);
    }
  } catch {
    // fall through to fallback ideas
  }

  return DEFAULT_SOCIAL_CONTENT;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const persist = Boolean(body?.persist);
    const ideas = await generateWithAI();

    if (persist) {
      const supabase = getSupabaseAdmin();
      const now = new Date();
      const rows = ideas.map((idea, index) => ({
        platform: idea.platform,
        topic: idea.topic,
        caption: idea.caption,
        status: "draft",
        scheduled_time: addDays(now, index + 1).toISOString(),
        visual_prompt: idea.description,
        visual_style: "ResumeVaultGod Content Engine",
      }));

      const { error } = await supabase.from("social_posts").insert(rows);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      await supabase.from("social_logs").insert({
        action: "Generated social content ideas",
        result: `Created and queued ${rows.length} content ideas`,
      });
    }

    return NextResponse.json({ success: true, ideas });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate content ideas" },
      { status: 500 }
    );
  }
}
