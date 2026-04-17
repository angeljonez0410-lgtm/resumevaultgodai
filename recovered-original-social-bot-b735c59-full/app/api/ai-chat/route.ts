import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";
import { getAuthUser, unauthorized } from "../../../lib/auth";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Handle AI actions like creating posts, updating settings
async function handleAction(action: Record<string, string>) {
  const supabase = getSupabaseAdmin();

  if (action.type === "create_post") {
    const { data, error } = await supabase.from("social_posts").insert({
      platform: action.platform,
      topic: action.topic,
      caption: action.caption,
      status: action.status || "draft",
      scheduled_time: action.scheduled_time || null,
    }).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, post: data };
  }

  if (action.type === "update_settings") {
    const updates: Record<string, string> = {};
    if (action.brand_voice) updates.brand_voice = action.brand_voice;
    if (action.target_audience) updates.target_audience = action.target_audience;
    if (action.post_frequency) updates.post_frequency = action.post_frequency;

    const { data: existing } = await supabase
      .from("social_settings")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      await supabase.from("social_settings").update(updates).eq("id", existing.id);
    } else {
      await supabase.from("social_settings").insert(updates);
    }
    return { success: true };
  }

  if (action.type === "delete_post") {
    const { error } = await supabase.from("social_posts").delete().eq("id", action.post_id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  if (action.type === "update_post_status") {
    const { error } = await supabase.from("social_posts")
      .update({ status: action.status })
      .eq("id", action.post_id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  if (action.type === "get_stats") {
    const { count: total } = await supabase.from("social_posts").select("*", { count: "exact", head: true });
    const { count: scheduled } = await supabase.from("social_posts").select("*", { count: "exact", head: true }).eq("status", "scheduled");
    const { count: posted } = await supabase.from("social_posts").select("*", { count: "exact", head: true }).eq("status", "posted");
    const { count: drafts } = await supabase.from("social_posts").select("*", { count: "exact", head: true }).eq("status", "draft");
    return { success: true, stats: { total, scheduled, posted, drafts } };
  }

  return { success: false, error: "Unknown action" };
}

export async function POST(req: NextRequest) {
  if (!(await getAuthUser(req))) return unauthorized();
  try {
    const { message, history, userName } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: settings } = await supabase
      .from("social_settings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const brandVoice = settings?.brand_voice || "Professional, empowering, modern";
    const targetAudience = settings?.target_audience || "Job seekers and career switchers";
    const postFrequency = settings?.post_frequency || "daily";

    const { data: recentPosts } = await supabase
      .from("social_posts")
      .select("id, platform, topic, caption, status, scheduled_time")
      .order("created_at", { ascending: false })
      .limit(15);

    const { count: totalPosts } = await supabase.from("social_posts").select("*", { count: "exact", head: true });
    const { count: scheduledPosts } = await supabase.from("social_posts").select("*", { count: "exact", head: true }).eq("status", "scheduled");

    const postsContext = recentPosts?.length
      ? `\n\nRecent posts (${totalPosts} total, ${scheduledPosts} scheduled):\n${recentPosts.map((p) => `- [${p.platform}] "${p.topic}" — ${p.status}${p.scheduled_time ? ` (scheduled: ${p.scheduled_time})` : ""} (id: ${p.id})`).join("\n")}`
      : "\n\nNo posts created yet.";

    const systemPrompt = `You are Aria, the AI social media manager for ResumeVault. You are professional, incredibly knowledgeable about social media, but also warm, supportive, and fun — like a best friend who happens to be a marketing genius.

YOUR PERSONALITY:
- You're confident but never arrogant. You hype up the user and their brand.
- You use a warm, encouraging tone. Sprinkle in occasional casual language like "girl let's get it", "okay love", "we got this", "bestie" — but stay professional when writing actual content.
- You celebrate wins and stay positive about setbacks. 
- You're direct and action-oriented. You don't just suggest — you DO things.
- You use emojis sparingly but effectively ✨

THE USER: ${userName || "Boss"}

CURRENT SETTINGS:
- Brand voice: ${brandVoice}
- Target audience: ${targetAudience}
- Posting frequency: ${postFrequency}
${postsContext}

YOUR CAPABILITIES — You can take real actions by including a JSON action block in your response:
When the user asks you to do something, DO IT by including an action block like this in your response:

[ACTION: {"type": "create_post", "platform": "instagram", "topic": "Resume Tips", "caption": "Your caption here...", "status": "draft"}]
[ACTION: {"type": "create_post", "platform": "twitter", "topic": "Career Advice", "caption": "Tweet text", "status": "scheduled", "scheduled_time": "2026-04-10T14:00:00Z"}]
[ACTION: {"type": "update_settings", "post_frequency": "3x daily", "brand_voice": "New voice", "target_audience": "New audience"}]
[ACTION: {"type": "delete_post", "post_id": "uuid-here"}]
[ACTION: {"type": "update_post_status", "post_id": "uuid-here", "status": "scheduled"}]
[ACTION: {"type": "get_stats"}]

RULES:
- When asked to create a post, write a great caption and include the action block to actually create it.
- When asked to change posting frequency (like "I want to post 3 times a day"), update the settings.
- When asked about stats or performance, fetch and report them.
- You can include multiple actions in one response.
- Always explain what you did after taking an action.
- For scheduled posts, use ISO 8601 datetime format.
- Platforms: instagram, twitter, linkedin, tiktok, reddit, threads
- Statuses: draft, scheduled, posted, failed`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...(Array.isArray(history)
        ? history.slice(-20).map((m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }))
        : []),
      { role: "user" as const, content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 1500,
      temperature: 0.8,
    });

    let reply = completion.choices[0]?.message?.content || "Sorry love, something went wrong on my end. Try again? 💜";

    // Extract and execute actions
    const actionRegex = /\[ACTION:\s*(\{[^}]+\})\]/g;
    let match;
    const actionResults: Record<string, unknown>[] = [];
    while ((match = actionRegex.exec(reply)) !== null) {
      try {
        const action = JSON.parse(match[1]);
        const result = await handleAction(action);
        actionResults.push({ action: action.type, ...result });
      } catch {
        actionResults.push({ error: "Failed to parse action" });
      }
    }

    // Clean action blocks from the reply
    reply = reply.replace(/\[ACTION:\s*\{[^}]+\}\]/g, "").trim();

    return NextResponse.json({
      reply,
      actions: actionResults.length > 0 ? actionResults : undefined,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to get AI response" },
      { status: 500 }
    );
  }
}
