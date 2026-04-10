"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreatePostPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);

  useEffect(() => {
    if (!localStorage.getItem("sb_access_token")) {
      router.push("/admin/login");
    }
  }, [router]);

  const togglePlatform = (platform: string) => {
    setPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin/social-bot/posts" className="flex items-center gap-2">
            <span className="text-xl font-bold text-indigo-600">←</span>
            <h1 className="text-2xl font-bold text-gray-900">Create Post</h1>
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow p-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Post Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post here..."
            className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-6 h-32"
          />

          <label className="block text-sm font-semibold text-gray-700 mb-3">Platforms</label>
          <div className="space-y-2 mb-6">
            {["twitter", "instagram", "linkedin", "tiktok"].map((platform) => (
              <label key={platform} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={platforms.includes(platform)}
                  onChange={() => togglePlatform(platform)}
                  className="w-4 h-4"
                />
                <span className="text-gray-700 capitalize">{platform}</span>
              </label>
            ))}
          </div>

          <button className="btn-primary w-full">Schedule Post</button>
        </div>
      </div>
    </main>
  );
}
