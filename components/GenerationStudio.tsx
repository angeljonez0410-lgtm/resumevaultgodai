"use client";

import { useEffect, useState } from "react";
import { FileText, Image as ImageIcon, Loader2, Play, Sparkles, Video, Wand2 } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";

type GeneratedImage = {
  id: number;
  url: string;
  prompt: string;
};

type GeneratedVideo = {
  id: number;
  url: string;
  prompt: string;
};

type GeneratedPrompt = {
  id: number;
  prompt: string;
  topic: string;
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const STORAGE_KEY = "influencerai_generated_assets";

export default function GenerationStudio({ defaultMode = "image" }: { defaultMode?: "image" | "video" | "prompt" }) {
  const [mode, setMode] = useState<"image" | "video" | "prompt">(defaultMode);
  const [prompt, setPrompt] = useState("");
  const [characterDescription, setCharacterDescription] = useState("");
  const [duration, setDuration] = useState("10s");
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);
  const [loadedSavedAssets, setLoadedSavedAssets] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as {
          images?: GeneratedImage[];
          videos?: GeneratedVideo[];
          prompts?: GeneratedPrompt[];
        };
        setImages(parsed.images || []);
        setVideos(parsed.videos || []);
        setPrompts(parsed.prompts || []);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoadedSavedAssets(true);
  }, []);

  useEffect(() => {
    if (!loadedSavedAssets) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ images, videos, prompts }));
  }, [images, loadedSavedAssets, prompts, videos]);

  const generateImage = async () => {
    const res = await authFetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, characterDescription }),
    });
    const data = await res.json();
    if (!res.ok || !data.imageUrl) {
      throw new Error(data.error === "Unauthorized" ? "Please log in again, then generate your image." : data.error || "Image generation failed");
    }
    setImages((current) => [{ id: Date.now(), url: data.imageUrl, prompt }, ...current]);
  };

  const generateVideo = async () => {
    const res = await authFetch("/api/generate-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, characterDescription, duration }),
    });
    const data = await res.json();
    if (!res.ok || !data.predictionId) {
      throw new Error(data.error === "Unauthorized" ? "Please log in again, then generate your video." : data.error || "Video generation failed");
    }

    if (data.videoUrl) {
      setVideos((current) => [{ id: Date.now(), url: data.videoUrl, prompt }, ...current]);
      return;
    }

    for (let attempt = 0; attempt < 120; attempt += 1) {
      setStatusText(`Rendering video... ${Math.min(99, Math.round((attempt / 120) * 100))}%`);
      await delay(4000);

      const pollRes = await authFetch(`/api/generate-video?id=${data.predictionId}`);
      const pollData = await pollRes.json();
      if (!pollRes.ok) {
        throw new Error(pollData.error === "Unauthorized" ? "Please log in again, then check your video." : pollData.error || "Video status check failed");
      }
      if (pollData.status === "failed") throw new Error(pollData.error || "Video generation failed");
      if (pollData.videoUrl) {
        setVideos((current) => [{ id: Date.now(), url: pollData.videoUrl, prompt }, ...current]);
        return;
      }
    }

    throw new Error("Video generation is still running. Try again in a moment.");
  };

  const generatePrompt = async () => {
    const res = await authFetch("/api/generate-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: prompt, mode: "image", characterDescription }),
    });
    const data = await res.json();
    if (!res.ok || !data.prompt) {
      throw new Error(data.error === "Unauthorized" ? "Please log in again, then generate your prompt." : data.error || "Prompt generation failed");
    }
    setPrompts((current) => [{ id: Date.now(), prompt: data.prompt, topic: prompt }, ...current]);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return;

    setGenerating(true);
    setError("");
    setStatusText(
      mode === "image" ? "Creating image..." : mode === "video" ? "Starting video render..." : "Writing prompt pack..."
    );

    try {
      if (mode === "image") await generateImage();
      else if (mode === "video") await generateVideo();
      else await generatePrompt();
      setPrompt("");
      setStatusText(mode === "image" ? "Image generated." : mode === "video" ? "Video generated." : "Prompt generated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setStatusText("");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-white/5 bg-gradient-to-r from-slate-900/50 to-slate-900/30 p-4 backdrop-blur-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setMode("image")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              mode === "image" ? "bg-violet-500/20 text-violet-300" : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            <ImageIcon className="h-4 w-4" /> Images
          </button>
          <button
            onClick={() => setMode("video")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              mode === "video" ? "bg-violet-500/20 text-violet-300" : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            <Video className="h-4 w-4" /> Videos
          </button>
          <button
            onClick={() => setMode("prompt")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              mode === "prompt" ? "bg-violet-500/20 text-violet-300" : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="h-4 w-4" /> Prompts
          </button>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
          <input
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void handleGenerate();
            }}
            placeholder={
              mode === "image"
                ? "e.g. wearing a red dress on a beach at sunset..."
                : mode === "video"
                  ? "e.g. walking down a city street, waving at camera..."
                  : "e.g. luxury fitness creator launch campaign..."
            }
            className="min-h-12 rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
          />
          {mode === "video" ? (
            <select
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              className="min-h-12 rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none focus:border-violet-500/50"
            >
              <option value="5s">5 seconds</option>
              <option value="10s">10 seconds</option>
              <option value="15s">15 seconds</option>
            </select>
          ) : null}
        </div>

        <textarea
          value={characterDescription}
          onChange={(event) => setCharacterDescription(event.target.value)}
          placeholder="Optional character description for consistency..."
          className="mt-3 min-h-24 w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2 text-sm font-semibold text-white transition hover:from-violet-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {generating ? "Generating..." : `Generate ${mode === "image" ? "Image" : mode === "video" ? "Video" : "Prompt"}`}
          </button>
          {statusText ? <p className="text-xs text-slate-400">{statusText}</p> : null}
          {error ? <p className="text-xs text-red-300">{error}</p> : null}
        </div>
      </section>

      {images.length > 0 ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">Generated Images</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {images.map((image) => (
              <a
                key={image.id}
                href={image.url}
                target="_blank"
                rel="noreferrer"
                className="group relative overflow-hidden rounded-xl border border-white/5 bg-slate-900"
              >
                <img src={image.url} alt={image.prompt} className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105" />
                <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold text-violet-200">
                  AI
                </div>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {videos.length > 0 ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">Generated Videos</h2>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {videos.map((video) => (
              <div key={video.id} className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/50">
                <video src={video.url} controls playsInline className="aspect-video w-full bg-black object-contain" />
                <div className="flex items-center gap-2 p-4 text-sm text-slate-400">
                  <Play className="h-4 w-4 text-violet-400" />
                  {video.prompt}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {prompts.length > 0 ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">Generated Prompts</h2>
          <div className="space-y-4">
            {prompts.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/5 bg-slate-900/50 p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-violet-300">{item.topic}</p>
                <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{item.prompt}</pre>
                <button
                  onClick={() => navigator.clipboard.writeText(item.prompt)}
                  className="mt-4 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/15"
                >
                  Copy prompt
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {images.length === 0 && videos.length === 0 && prompts.length === 0 ? (
        <section className="rounded-2xl border border-white/5 bg-slate-900/40 p-8 text-center">
          <Sparkles className="mx-auto mb-3 h-10 w-10 text-slate-600" />
          <p className="text-sm text-slate-400">Generated assets will appear here.</p>
          <p className="mt-1 text-xs text-slate-500">Use a clear prompt and optional character details for better consistency.</p>
        </section>
      ) : null}
    </div>
  );
}
