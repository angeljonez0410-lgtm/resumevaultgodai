"use client";

<<<<<<< HEAD
import { useState } from "react";
=======
import { useCallback, useEffect, useState } from "react";
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
import { authFetch } from "../lib/auth-fetch";

export default function CreatePostForm({
  onCreated,
}: {
  onCreated: () => Promise<void>;
}) {
  const [platform, setPlatform] = useState("instagram");
<<<<<<< HEAD
  const [topic, setTopic] = useState("");
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
=======
  const [topic, setTopic] = useState("ResumeVaultGod.com AI resume builder");
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
  const [status, setStatus] = useState("draft");
  const [scheduledTime, setScheduledTime] = useState("");
  const [visualPrompt, setVisualPrompt] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
<<<<<<< HEAD
  const [visualStyle, setVisualStyle] = useState("Premium SaaS Ad");
=======
  const [visualStyle, setVisualStyle] = useState("ResumeVaultGod AI Career Brand");
  const [tiktokPrivacyLevel, setTikTokPrivacyLevel] = useState("");
  const [tiktokPrivacyOptions, setTikTokPrivacyOptions] = useState<string[]>([]);
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
  const [message, setMessage] = useState("");
  const [loadingCaption, setLoadingCaption] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingPhotoPrompt, setLoadingPhotoPrompt] = useState(false);
  const [loadingVideoPrompt, setLoadingVideoPrompt] = useState(false);
<<<<<<< HEAD
=======
  const [loadingTikTokOptions, setLoadingTikTokOptions] = useState(false);

  function getErrorMessage(error: string | undefined, fallback: string) {
    return error === "Unauthorized" ? "Please log in again, then try this button." : error || fallback;
  }

  const loadTikTokPrivacyOptions = useCallback(async () => {
    setLoadingTikTokOptions(true);

    try {
      const res = await authFetch("/api/social-accounts");
      const data = await res.json();
      if (!res.ok) {
        setTikTokPrivacyOptions([]);
        return;
      }

      const tiktokAccount = (data.accounts || []).find((account: { provider?: string; metadata?: Record<string, unknown> }) => account.provider === "tiktok");
      const options = tiktokAccount?.metadata?.tiktok_privacy_level_options;
      const privacyOptions = Array.isArray(options) ? options.filter((option): option is string => typeof option === "string") : [];
      setTikTokPrivacyOptions(privacyOptions);
      setTikTokPrivacyLevel((currentValue) => currentValue || privacyOptions[0] || "");
    } catch {
      setTikTokPrivacyOptions([]);
    } finally {
      setLoadingTikTokOptions(false);
    }
  }, []);

  useEffect(() => {
    if (platform === "tiktok") {
      void loadTikTokPrivacyOptions();
    }
  }, [loadTikTokPrivacyOptions, platform]);
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)

  async function generateCaption() {
    if (!topic) {
      setMessage("Enter a topic first");
      return;
    }

    setLoadingCaption(true);
    setMessage("");

<<<<<<< HEAD
    const res = await authFetch("/api/generate-caption", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to generate caption");
      setLoadingCaption(false);
      return;
    }

    setCaption(data.caption || "");
    setMessage("Caption generated");
    setLoadingCaption(false);
=======
    try {
      const res = await authFetch("/api/generate-caption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, platform }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(getErrorMessage(data.error, "Failed to generate caption"));
        return;
      }

      setCaption(data.caption || "");
      setMessage("Caption generated");
    } catch {
      setMessage("Could not connect to caption generator");
    } finally {
      setLoadingCaption(false);
    }
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
  }

  async function generateImage() {
    if (!topic) {
      setMessage("Enter a topic first");
      return;
    }

    setLoadingImage(true);
    setMessage("");

<<<<<<< HEAD
    const res = await authFetch("/api/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to generate image");
      setLoadingImage(false);
      return;
    }

    setImageUrl(data.imageUrl || "");
    setMessage("Image generated");
    setLoadingImage(false);
=======
    try {
      const res = await authFetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Premium social media visual for ResumeVaultGod.com about: ${topic}. Show career growth, AI-powered resume building, job search confidence, and a modern product feel.`,
          characterDescription: "ResumeVaultGod.com is an AI-powered career platform for resume building, job applications, interview preparation, and social proof for job seekers.",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(getErrorMessage(data.error, "Failed to generate image"));
        return;
      }

      setImageUrl(data.imageUrl || "");
      setMessage("Image generated");
    } catch {
      setMessage("Could not connect to image generator");
    } finally {
      setLoadingImage(false);
    }
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
  }

  async function generateRealPhotoPrompt() {
    if (!topic) {
      setMessage("Enter a topic first");
      return;
    }

    setLoadingPhotoPrompt(true);
    setMessage("");

<<<<<<< HEAD
    const res = await authFetch("/api/generate-real-photo-prompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        visualStyle,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to generate photo prompt");
      setLoadingPhotoPrompt(false);
      return;
    }

    setVisualPrompt(data.prompt || "");
    setMessage("Realistic photo prompt generated");
    setLoadingPhotoPrompt(false);
=======
    try {
      const res = await authFetch("/api/generate-real-photo-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          visualStyle,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(getErrorMessage(data.error, "Failed to generate photo prompt"));
        return;
      }

      setVisualPrompt(data.prompt || "");
      setMessage("Realistic photo prompt generated");
    } catch {
      setMessage("Could not connect to photo prompt generator");
    } finally {
      setLoadingPhotoPrompt(false);
    }
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
  }

  async function generateVideoPrompt() {
    if (!topic) {
      setMessage("Enter a topic first");
      return;
    }

    setLoadingVideoPrompt(true);
    setMessage("");

<<<<<<< HEAD
    const res = await authFetch("/api/generate-video-prompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        visualStyle,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to generate video prompt");
      setLoadingVideoPrompt(false);
      return;
    }

    setVideoPrompt(data.prompt || "");
    setMessage("Realistic video prompt generated");
    setLoadingVideoPrompt(false);
=======
    try {
      const res = await authFetch("/api/generate-video-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          visualStyle,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(getErrorMessage(data.error, "Failed to generate video prompt"));
        return;
      }

      setVideoPrompt(data.prompt || "");
      setMessage("Realistic video prompt generated");
    } catch {
      setMessage("Could not connect to video prompt generator");
    } finally {
      setLoadingVideoPrompt(false);
    }
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
  }

  async function handleSubmit() {
    setMessage("");

<<<<<<< HEAD
=======
    if (platform === "tiktok" && !tiktokPrivacyLevel) {
      setMessage("Choose a TikTok privacy level first");
      return;
    }

>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
    const res = await authFetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
<<<<<<< HEAD
      body: JSON.stringify({
        platform,
        topic,
        caption,
        image_url: imageUrl,
        status,
        scheduled_time: scheduledTime || null,
        visual_prompt: visualPrompt,
        video_prompt: videoPrompt,
        visual_style: visualStyle,
=======
        body: JSON.stringify({
          platform,
          topic,
          caption,
          image_url: imageUrl,
          media_url: mediaUrl,
          tiktok_privacy_level: platform === "tiktok" ? tiktokPrivacyLevel || null : null,
          status,
          scheduled_time: scheduledTime || null,
          visual_prompt: visualPrompt,
          video_prompt: videoPrompt,
          visual_style: visualStyle,
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
      }),
    });

    const data = await res.json();

    if (!res.ok) {
<<<<<<< HEAD
      setMessage(data.error || "Failed to create post");
=======
      setMessage(getErrorMessage(data.error, "Failed to create post"));
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
      return;
    }

    setPlatform("instagram");
    setTopic("");
    setCaption("");
    setImageUrl("");
<<<<<<< HEAD
=======
    setMediaUrl("");
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
    setStatus("draft");
    setScheduledTime("");
    setVisualPrompt("");
    setVideoPrompt("");
<<<<<<< HEAD
    setVisualStyle("Premium SaaS Ad");
=======
    setVisualStyle("ResumeVaultGod AI Career Brand");
    setTikTokPrivacyLevel("");
    setTikTokPrivacyOptions([]);
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
    setMessage("Post created");
    await onCreated();
  }

  return (
<<<<<<< HEAD
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-900">Create Post</h2>

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Platform</label>
          <select
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
=======
    <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6">
      <h2 className="text-xl font-bold text-white">Create ResumeVaultGod Post</h2>
      <p className="mt-1 text-sm text-slate-400">
        Generate social content for ResumeVaultGod.com: resumes, ATS wins, interview prep, and career growth.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-300">Platform</label>
          <select
            className="w-full border border-white/10 bg-slate-950 text-white rounded-xl px-4 py-3"
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="instagram">Instagram</option>
<<<<<<< HEAD
            <option value="twitter">Twitter/X</option>
            <option value="linkedin">LinkedIn</option>
=======
            <option value="facebook">Facebook</option>
            <option value="twitter">Twitter/X</option>
            <option value="linkedin">LinkedIn</option>
            <option value="youtube">YouTube</option>
            <option value="pinterest">Pinterest</option>
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
            <option value="tiktok">TikTok</option>
            <option value="reddit">Reddit</option>
            <option value="threads">Threads</option>
          </select>
        </div>

        <div>
<<<<<<< HEAD
          <label className="block text-sm font-semibold mb-1">Topic</label>
          <input
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Resume Tips"
=======
          <label className="block text-sm font-semibold mb-1 text-slate-300">Topic</label>
          <input
            className="w-full border border-white/10 bg-slate-950 text-white rounded-xl px-4 py-3"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="AI resume builder for job seekers"
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
          />
        </div>

        <div>
<<<<<<< HEAD
          <label className="block text-sm font-semibold mb-1">Visual Style</label>
          <select
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
            value={visualStyle}
            onChange={(e) => setVisualStyle(e.target.value)}
          >
=======
          <label className="block text-sm font-semibold mb-1 text-slate-300">Visual Style</label>
          <select
            className="w-full border border-white/10 bg-slate-950 text-white rounded-xl px-4 py-3"
            value={visualStyle}
            onChange={(e) => setVisualStyle(e.target.value)}
          >
            <option value="ResumeVaultGod AI Career Brand">ResumeVaultGod AI Career Brand</option>
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
            <option value="Premium SaaS Ad">Premium SaaS Ad</option>
            <option value="Professional Corporate">Professional Corporate</option>
            <option value="Modern Minimalist">Modern Minimalist</option>
            <option value="Warm and Approachable">Warm and Approachable</option>
          </select>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={generateCaption}
<<<<<<< HEAD
            className="bg-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-purple-700 text-sm"
=======
            className="bg-violet-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-violet-700 text-sm"
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
          >
            {loadingCaption ? "Generating..." : "AI Caption"}
          </button>
          <button
            type="button"
            onClick={generateImage}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 text-sm"
          >
            {loadingImage ? "Generating..." : "AI Image"}
          </button>
          <button
            type="button"
            onClick={generateRealPhotoPrompt}
            className="bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 text-sm"
          >
            {loadingPhotoPrompt ? "Generating..." : "Photo Prompt"}
          </button>
          <button
            type="button"
            onClick={generateVideoPrompt}
            className="bg-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-700 text-sm"
          >
            {loadingVideoPrompt ? "Generating..." : "Video Prompt"}
          </button>
        </div>

        <div>
<<<<<<< HEAD
          <label className="block text-sm font-semibold mb-1">Caption</label>
          <textarea
            className="w-full border border-gray-300 rounded-xl px-4 py-3 min-h-[140px]"
=======
          <label className="block text-sm font-semibold mb-1 text-slate-300">Caption</label>
          <textarea
            className="w-full border border-white/10 bg-slate-950 text-white rounded-xl px-4 py-3 min-h-[140px]"
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write your caption"
          />
        </div>

        <div>
<<<<<<< HEAD
          <label className="block text-sm font-semibold mb-1">Image URL</label>
          <input
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
=======
          <label className="block text-sm font-semibold mb-1 text-slate-300">Image URL</label>
          <input
            className="w-full border border-white/10 bg-slate-950 text-white rounded-xl px-4 py-3"
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div>
<<<<<<< HEAD
          <label className="block text-sm font-semibold mb-1">Visual Prompt</label>
          <textarea
            className="w-full border border-gray-300 rounded-xl px-4 py-3 min-h-[100px]"
=======
          <label className="block text-sm font-semibold mb-1 text-slate-300">Media / Video URL</label>
          <input
            className="w-full border border-white/10 bg-slate-950 text-white rounded-xl px-4 py-3"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://...video.mp4"
          />
        </div>

        {platform === "tiktok" ? (
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-300">TikTok Privacy</label>
            <select
              className="w-full border border-white/10 bg-slate-950 text-white rounded-xl px-4 py-3"
              value={tiktokPrivacyLevel}
              onChange={(e) => setTikTokPrivacyLevel(e.target.value)}
              disabled={loadingTikTokOptions}
            >
              <option value="">
                {loadingTikTokOptions ? "Loading available privacy levels..." : "Choose a privacy level"}
              </option>
              {tiktokPrivacyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-500">
              This list comes from the connected TikTok account and is required before publishing.
            </p>
          </div>
        ) : null}

        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-300">Visual Prompt</label>
          <textarea
            className="w-full border border-white/10 bg-slate-950 text-white rounded-xl px-4 py-3 min-h-[100px]"
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
            value={visualPrompt}
            onChange={(e) => setVisualPrompt(e.target.value)}
            placeholder="Photorealistic prompt for image generation"
          />
        </div>

        <div>
<<<<<<< HEAD
          <label className="block text-sm font-semibold mb-1">Video Prompt</label>
          <textarea
            className="w-full border border-gray-300 rounded-xl px-4 py-3 min-h-[100px]"
=======
          <label className="block text-sm font-semibold mb-1 text-slate-300">Video Prompt</label>
          <textarea
            className="w-full border border-white/10 bg-slate-950 text-white rounded-xl px-4 py-3 min-h-[100px]"
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
            value={videoPrompt}
            onChange={(e) => setVideoPrompt(e.target.value)}
            placeholder="Detailed video prompt for production"
          />
        </div>

        <div>
<<<<<<< HEAD
          <label className="block text-sm font-semibold mb-1">Status</label>
          <select
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
=======
          <label className="block text-sm font-semibold mb-1 text-slate-300">Status</label>
          <select
            className="w-full border border-white/10 bg-slate-950 text-white rounded-xl px-4 py-3"
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        <div>
<<<<<<< HEAD
          <label className="block text-sm font-semibold mb-1">Scheduled Time</label>
          <input
            type="datetime-local"
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
=======
          <label className="block text-sm font-semibold mb-1 text-slate-300">Scheduled Time</label>
          <input
            type="datetime-local"
            className="w-full border border-white/10 bg-slate-950 text-white rounded-xl px-4 py-3"
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
          />
        </div>

        <button
          onClick={handleSubmit}
          className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-indigo-700"
        >
          Save Post
        </button>

<<<<<<< HEAD
        {message ? <p className="text-sm text-gray-600">{message}</p> : null}
=======
        {imageUrl ? <img src={imageUrl} alt="Generated visual" className="rounded-xl border border-white/10" /> : null}

        {message ? <p className="text-sm text-slate-400">{message}</p> : null}
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
      </div>
    </div>
  );
}
