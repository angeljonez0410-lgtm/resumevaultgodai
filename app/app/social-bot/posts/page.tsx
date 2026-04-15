"use client";

import { useCallback, useEffect, useState } from "react";
import CalendarGenerator from "@/components/CalendarGenerator";
import CreatePostForm from "@/components/CreatePostForm";
import PostsTable from "@/components/PostsTable";
import PublishingPanel from "@/components/PublishingPanel";
import { authFetch } from "@/lib/auth-fetch";

type PostEntry = {
  id: string;
  platform: string;
  topic: string;
  status: string;
  created_at: string;
};

export default function SocialBotPostsPage() {
  const [posts, setPosts] = useState<PostEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await authFetch("/api/posts");
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to load posts");
        setPosts([]);
      } else {
        setPosts(data.posts || []);
      }
    } catch {
      setMessage("Could not connect to posts API");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 sm:px-6 lg:px-10 lg:py-10">
      <section className="rounded-2xl border border-white/5 bg-slate-900/50 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-300">
          ResumeVaultGod.com Content Engine
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">AI Post Builder</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Generate captions, image ideas, video prompts, and scheduled posts for ResumeVaultGod.com.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <CreatePostForm onCreated={loadPosts} />
        <div className="space-y-6">
          <CalendarGenerator onGenerated={loadPosts} />
          <PublishingPanel onRun={loadPosts} />
        </div>
      </div>

      {message ? <p className="text-sm text-red-300">{message}</p> : null}
      {loading ? <p className="text-sm text-slate-400">Loading posts...</p> : <PostsTable posts={posts} />}
    </div>
  );
}
