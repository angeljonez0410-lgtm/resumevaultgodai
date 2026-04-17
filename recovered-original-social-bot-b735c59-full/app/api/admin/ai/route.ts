import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import OpenAI from "openai";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "angeljonez0410@gmail.com").split(",").map(e => e.trim().toLowerCase());

function isAdmin(email: string | undefined) {
  return email ? ADMIN_EMAILS.includes(email.toLowerCase()) : false;
}

const SYSTEM_PROMPT = `You are the Admin AI Assistant for ResumeVaultGodAI platform. You help the platform admin manage and operate the business.

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
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  if (!isAdmin(auth.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { message, context } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Fetch platform stats for context
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
