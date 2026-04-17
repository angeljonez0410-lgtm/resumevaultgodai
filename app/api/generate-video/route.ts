import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

function getReplicateKey() {
  return process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY;
}

function getVideoUrl(output: unknown): string | null {
  if (!output) return null;
  if (typeof output === "string") return output;
  if (Array.isArray(output)) return getVideoUrl(output[0]);
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, characterDescription = "", duration = "10s" } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const replicateKey = getReplicateKey();
    if (!replicateKey) {
      return NextResponse.json({ error: "Replicate API token not configured" }, { status: 500 });
    }

    const enhancedPrompt = [
      typeof characterDescription === "string" && characterDescription.trim() ? `${characterDescription.trim()}.` : "",
      `${prompt.trim()}. Realistic cinematic short video, natural human movement, stable camera, professional lighting, detailed environment, high quality production, no warping, no extra limbs, no text artifacts.`,
    ]
      .filter(Boolean)
      .join(" ");

    const createResponse = await fetch(`https://api.replicate.com/v1/models/minimax/video-01/predictions`, {
      method: "POST",
      headers: {
        Authorization: `Token ${replicateKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          prompt: enhancedPrompt,
        },
      }),
    });

    const prediction = await createResponse.json();
    if (!createResponse.ok) {
      return NextResponse.json(
        { error: prediction?.detail || prediction?.error || "Failed to create video generation request" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      predictionId: prediction.id,
      status: prediction.status,
      duration,
      videoUrl: getVideoUrl(prediction.output),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Video generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const predictionId = req.nextUrl.searchParams.get("id");
  if (!predictionId) {
    return NextResponse.json({ error: "Prediction id is required" }, { status: 400 });
  }

  const replicateKey = getReplicateKey();
  if (!replicateKey) {
    return NextResponse.json({ error: "Replicate API token not configured" }, { status: 500 });
  }

  const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
    headers: {
      Authorization: `Token ${replicateKey}`,
    },
  });

  const prediction = await statusResponse.json();
  if (!statusResponse.ok) {
    return NextResponse.json(
      { error: prediction?.detail || prediction?.error || "Failed to load video generation status" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: prediction.status === "succeeded",
    predictionId: prediction.id,
    status: prediction.status,
    error: prediction.error,
    videoUrl: getVideoUrl(prediction.output),
  });
}
