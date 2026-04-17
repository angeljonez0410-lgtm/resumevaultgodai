import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export const maxDuration = 60;

function getOutputUrl(output: unknown): string | null {
  if (!output) return null;
  if (typeof output === "string") return output;
  if (Array.isArray(output)) return getOutputUrl(output[0]);
  if (typeof output === "object" && output !== null) {
    const maybeOutput = output as { url?: string | (() => URL | string) };
    if (typeof maybeOutput.url === "function") return maybeOutput.url().toString();
    if (maybeOutput.url) return maybeOutput.url.toString();
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, characterDescription } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const replicateKey = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY;
    if (!replicateKey) {
      return NextResponse.json({ error: "Replicate API token not configured" }, { status: 500 });
    }

    const enhancedPrompt = [
      typeof characterDescription === "string" && characterDescription.trim() ? characterDescription.trim() : "",
      "Photorealistic AI influencer content, realistic human proportions, natural skin texture, professional lighting, sharp focus, cinematic color grade, no distorted hands, no extra fingers, no text artifacts.",
      prompt.trim(),
    ]
      .filter(Boolean)
      .join("\n\n");

    const replicate = new Replicate({ auth: replicateKey });
    const output = await replicate.run("ideogram-ai/ideogram-v3-turbo", {
      input: {
        prompt: enhancedPrompt,
        aspect_ratio: "3:2",
      },
    });

    const imageUrl = getOutputUrl(output);
    if (!imageUrl) {
      return NextResponse.json({ error: "No image output received" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      model: "ideogram-ai/ideogram-v3-turbo",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
