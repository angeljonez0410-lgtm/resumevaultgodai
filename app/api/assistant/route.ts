import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import OpenAI from "openai";

const SYSTEM_PROMPT = `You are the AI Assistant for the ResumeVaultGodAI platform. You help manage and operate the business.

You can help with:
- User management: answering questions about users, credits, subscriptions
- Analytics: summarize platform metrics, user activity, revenue insights
- Content: draft announcements, marketing copy, support responses
- Technical: explain features, suggest improvements, troubleshoot issues
- Business: pricing strategy, growth ideas, competitor analysis

Platform context:
- Credit-based pricing: 50/$9.99, 150/$24.99, 400/$59.99, 1000/$129.99
- Features: AI Resume Builder, Job Analyzer, Cover Letter, Mock Interview, Auto Apply, Career Roadmap, Salary Negotiation, Portfolio Builder
- Tech stack: Next.js, Supabase, OpenAI, Stripe, Vercel
- Color scheme: Navy #1e2d42 + Gold #f4c542

Be concise, professional, and action-oriented. When asked about data, provide it clearly. When asked to draft content, produce polished copy.`;

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const sb = getSupabaseAdmin();
    const { count: userCount } = await sb.from("user_profiles").select("*", { count: "exact", head: true });

    const contextMessage = `Platform stats: ${userCount || 0} registered users. ${context || ""}`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "system", content: contextMessage },
        { role: "user", content: message },
      ],
      max_tokens: 1500,
    });

    const reply = completion.choices[0]?.message?.content || "No response generated.";
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
