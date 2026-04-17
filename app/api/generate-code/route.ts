import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const task = typeof body.task === "string" ? body.task.trim() : "";
    const language = typeof body.language === "string" && body.language.trim() ? body.language.trim() : "TypeScript";
    const context = typeof body.context === "string" ? body.context.trim() : "";
    const filePath = typeof body.filePath === "string" ? body.filePath.trim() : "";
    const outputMode = typeof body.outputMode === "string" && body.outputMode.trim() ? body.outputMode.trim() : "code";

    if (!task) {
      return NextResponse.json({ error: "Task is required" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_CODE_MODEL || "gpt-5.2-codex";

    const response = await openai.responses.create({
      model,
      reasoning: { effort: "high" },
      instructions:
        outputMode === "patch"
          ? "You are Codex inside ResumeVault Social Bot. Produce a single unified diff patch that can be applied cleanly to the user's codebase. Be precise, keep the diff minimal, and do not include commentary outside the patch unless necessary for the patch to make sense."
          : "You are Codex inside ResumeVault Social Bot. Produce practical code that can be pasted into the user's codebase. Be concise, accurate, and mention any follow-up steps only when necessary.",
      input: [
        `Task: ${task}`,
        `Language: ${language}`,
        `Output mode: ${outputMode}`,
        filePath ? `Target file: ${filePath}` : "",
        context ? `Context:\n${context}` : "",
        outputMode === "patch"
          ? "Return your answer as a single unified diff patch only."
          : "Return your answer in this format:\nSUMMARY:\n[one short paragraph]\n\nCODE:\n```[language]\n[the code]\n```\n\nNOTES:\n[bullets or short notes about integration, if needed]",
      ]
        .filter(Boolean)
        .join("\n\n"),
    });

    const code = response.output_text?.trim() || "";
    if (!code) {
      return NextResponse.json({ error: "No code generated" }, { status: 500 });
    }

    const supabase = getSupabaseAdmin();
    await supabase.from("social_logs").insert({
      action: "Generated code snippet",
      result: `Code assistant task: ${task.slice(0, 120)}`,
    });

    return NextResponse.json({
      success: true,
      response: code,
      model,
      outputMode,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Code generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
