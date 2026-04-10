"use client";

import { useState } from "react";

export default function CreatePostForm({
  onCreated,
}: {
  onCreated: () => Promise<void>;
}) {
  const [platform, setPlatform] = useState("instagram");
  const [topic, setTopic] = useState("");
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("draft");
  const [scheduledTime, setScheduledTime] = useState("");
  const [visualPrompt, setVisualPrompt] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [visualStyle, setVisualStyle] = useState("Premium SaaS Ad");
  const [message, setMessage] = useState("");
  const [loadingCaption, setLoadingCaption] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingPhotoPrompt, setLoadingPhotoPrompt] = useState(false);
  const [loadingVideoPrompt, setLoadingVideoPrompt] = useState(false);

  async function generateCaption() {
    if (!topic) {
      setMessage("Enter a topic first");
      return;
    }

    setLoadingCaption(true);
    setMessage("");

    const res = await fetch("/api/generate-caption", {
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
  }

  async function generateImage() {
    if (!topic) {
      setMessage("Enter a topic first");
      return;
    }

    setLoadingImage(true);
    setMessage("");

    const res = await fetch("/api/generate-image", {
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
  }

  async function generateRealPhotoPrompt() {
    if (!topic) {
      setMessage("Enter a topic first");
      return;
    }

    setLoadingPhotoPrompt(true);
    setMessage("");

    const res = await fetch("/api/generate-real-photo-prompt", {
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
  }

  async function generateVideoPrompt() {
    if (!topic) {
      setMessage("Enter a topic first");
      return;
    }

    setLoadingVideoPrompt(true);
    setMessage("");

    const res = await fetch("/api/generate-video-prompt", {
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
  }

  async function handleSubmit() {
    setMessage("");

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to create post");
      return;
    }

    setPlatform("instagram");
    setTopic("");
    setCaption("");
    setImageUrl("");
    setStatus("draft");
    setScheduledTime("");
    setVisualPrompt("");
    setVideoPrompt("");
    setVisualStyle("Premium SaaS Ad");
    setMessage("Post created");
    await onCreated();
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-900">Create Post</h2>

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Platform</label>
          <select
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="instagram">Instagram</option>
            <option value="twitter">Twitter/X</option>
            <option value="linkedin">LinkedIn</option>
            <option value="tiktok">TikTok</option>
            <option value="reddit">Reddit</option>
            <option value="threads">Threads</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Topic</label>
          <input
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Resume Tips"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Visual Style</label>
          <select
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
            value={visualStyle}
            onChange={(e) => setVisualStyle(e.target.value)}
          >
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
            className="bg-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-purple-700 text-sm"
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
          <label className="block text-sm font-semibold mb-1">Caption</label>
          <textarea
            className="w-full border border-gray-300 rounded-xl px-4 py-3 min-h-[140px]"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write your caption"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Image URL</label>
          <input
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Visual Prompt</label>
          <textarea
            className="w-full border border-gray-300 rounded-xl px-4 py-3 min-h-[100px]"
            value={visualPrompt}
            onChange={(e) => setVisualPrompt(e.target.value)}
            placeholder="Photorealistic prompt for image generation"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Video Prompt</label>
          <textarea
            className="w-full border border-gray-300 rounded-xl px-4 py-3 min-h-[100px]"
            value={videoPrompt}
            onChange={(e) => setVideoPrompt(e.target.value)}
            placeholder="Detailed video prompt for production"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Status</label>
          <select
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Scheduled Time</label>
          <input
            type="datetime-local"
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
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

        {message ? <p className="text-sm text-gray-600">{message}</p> : null}
      </div>
    </div>
  );
}
