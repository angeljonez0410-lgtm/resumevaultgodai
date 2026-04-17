import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";

function getSpeechMimeType(format: string) {
  switch (format) {
    case "wav":
      return "audio/wav";
    case "aac":
      return "audio/aac";
    case "opus":
      return "audio/opus";
    case "mp3":
    default:
      return "audio/mpeg";
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const voice = typeof body.voice === "string" && body.voice.trim() ? body.voice.trim() : "alloy";
    const instructions =
      typeof body.instructions === "string" && body.instructions.trim()
        ? body.instructions.trim()
        : "Speak clearly, warmly, and confidently.";
    const responseFormat = typeof body.responseFormat === "string" && body.responseFormat.trim() ? body.responseFormat.trim() : "mp3";

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const speechResponse = await openai.audio.speech.create({
      model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
      voice,
      input: text,
      instructions,
      response_format: responseFormat,
    });

    const audioBuffer = Buffer.from(await speechResponse.arrayBuffer());
    const audioUrl = `data:${getSpeechMimeType(responseFormat)};base64,${audioBuffer.toString("base64")}`;

    const supabase = getSupabaseAdmin();
    await supabase.from("social_logs").insert({
      action: "Generated speech audio",
      result: `Speech generated with voice ${voice}: ${text.slice(0, 120)}`,
    });

    return NextResponse.json({
      success: true,
      audioUrl,
      voice,
      responseFormat,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Speech generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
