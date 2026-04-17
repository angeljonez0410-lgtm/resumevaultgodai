import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const modeInstructions: Record<string, string> = {
  image:
    "Generate one premium AI image prompt for a photorealistic AI influencer. Include subject, outfit, scene, lighting, camera, composition, mood, and a short negative prompt.",
  video:
    "Generate one short-form AI video prompt for a photorealistic AI influencer. Include hook, subject action, setting, camera movement, lighting, pacing, and a 3-shot list.",
  caption:
    "Generate a social media caption pack for an AI influencer. Include 5 captions, 10 hashtags, and 3 hook options.",
};

export async function POST(req: NextRequest) {
  try {
    const { topic, mode = "image", characterDescription = "" } = await req.json();

    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const instruction = modeInstructions[mode] || modeInstructions.image;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.85,
      messages: [
        {
          role: "system",
          content:
            "You are ARIA, the creative strategist inside InfluencerAI Studio. Keep outputs practical, visual, and ready to paste into generation tools.",
        },
        {
          role: "user",
          content: [
            instruction,
            `Topic: ${topic}`,
            characterDescription ? `Character details: ${characterDescription}` : "",
            "Use a polished creator/studio tone. Avoid mentioning ResumeVault or job-search tools.",
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
    });

    const prompt = completion.choices[0]?.message?.content?.trim();
    if (!prompt) {
      return NextResponse.json({ error: "No prompt generated" }, { status: 500 });
    }

    return NextResponse.json({ success: true, prompt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Prompt generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
