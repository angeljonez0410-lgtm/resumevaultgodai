"use client";

import { useState, useEffect } from "react";

// Confetti burst effect
function fireConfetti() {
  if (typeof window !== "undefined" && window.confetti) {
    window.confetti({
      particleCount: 100,
      spread: 120,
      origin: { y: 0.6 },
      colors: ["#f0abfc", "#a78bfa", "#f472b6", "#facc15", "#38bdf8", "#fff"],
    });
  }
}
import { Calendar, Clock, PlusCircle, Save, Loader2 } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";

export default function SchedulePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [newPost, setNewPost] = useState({
    platform: "",
    topic: "",
    caption: "",
    scheduled_time: "",
  });

  useEffect(() => {
    // Confetti on load
    if (typeof window !== "undefined" && !window.confetti) {
      import("canvas-confetti").then((mod) => {
        window.confetti = mod.default;
        fireConfetti();
      });
    } else {
      fireConfetti();
    }
  }, []);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const res = await authFetch("/api/posts");
        const data = await res.json();
        setPosts(data.posts || []);
      } catch {
        setMessage("Failed to load scheduled posts");
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const handleChange = (e) => {
    setNewPost({ ...newPost, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await authFetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newPost, status: "scheduled" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Failed to schedule post");
        return;
      }
      setPosts([data.post, ...posts]);
      setNewPost({ platform: "", topic: "", caption: "", scheduled_time: "" });
      setMessage("Post scheduled!");
      fireConfetti();
    } catch {
      setMessage("Could not schedule post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-5xl py-20 px-6 animate-gradient-bg">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-fuchsia-700 via-violet-700 to-slate-900 animate-gradient-move opacity-80 blur-2xl" />
      <h1 className="text-7xl font-black text-fuchsia-300 flex items-center gap-6 drop-shadow-2xl uppercase tracking-tight mb-16 animate-pop">
        <Calendar className="h-14 w-14 animate-pulse" />
        Schedule Posts
      </h1>
      <div className="mb-16 rounded-4xl border-4 border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-900 via-violet-900 to-slate-900 p-14 shadow-2xl animate-pop">
        <h2 className="text-4xl font-black text-fuchsia-200 mb-6 uppercase tracking-tight">New Scheduled Post</h2>
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <input
            type="text"
            name="platform"
            placeholder="Platform (e.g. Instagram)"
            value={newPost.platform}
            onChange={handleChange}
            className="rounded-2xl px-8 py-6 text-2xl font-black bg-slate-800 text-fuchsia-100 border-4 border-fuchsia-400/40 flex-1 animate-pop"
          />
          <input
            type="text"
            name="topic"
            placeholder="Topic"
            value={newPost.topic}
            onChange={handleChange}
            className="rounded-2xl px-8 py-6 text-2xl font-black bg-slate-800 text-fuchsia-100 border-4 border-fuchsia-400/40 flex-1 animate-pop"
          />
          <input
            type="text"
            name="caption"
            placeholder="Caption"
            value={newPost.caption}
            onChange={handleChange}
            className="rounded-2xl px-8 py-6 text-2xl font-black bg-slate-800 text-fuchsia-100 border-4 border-fuchsia-400/40 flex-2 animate-pop"
          />
          <input
            type="datetime-local"
            name="scheduled_time"
            value={newPost.scheduled_time}
            onChange={handleChange}
            className="rounded-2xl px-8 py-6 text-2xl font-black bg-slate-800 text-fuchsia-100 border-4 border-fuchsia-400/40 flex-1 animate-pop"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-4 rounded-3xl bg-fuchsia-600/90 px-12 py-6 text-3xl font-black text-white shadow-2xl hover:bg-fuchsia-700 transition disabled:opacity-50 animate-pop"
          >
            {saving ? <Loader2 className="h-8 w-8 animate-spin" /> : <Save className="h-8 w-8" />}
            Schedule
          </button>
        </div>
        {message && <p className="mt-8 text-2xl text-fuchsia-100 font-black animate-pop">{message}</p>}
      </div>
      <div className="overflow-x-auto rounded-4xl border-4 border-fuchsia-400/40 bg-slate-900/80 p-12 shadow-2xl animate-pop">
        <h2 className="text-4xl font-black text-fuchsia-200 mb-8 uppercase tracking-tight">Scheduled Posts</h2>
        {loading ? (
          <div className="flex items-center gap-6 text-fuchsia-100 font-black text-3xl animate-pop"><Loader2 className="animate-spin" /> Loading...</div>
        ) : (
          <table className="min-w-full text-left text-2xl text-fuchsia-100 animate-pop">
            <thead>
              <tr className="border-b-4 border-fuchsia-400/30">
                <th className="py-5 px-6 text-3xl font-black uppercase">Platform</th>
                <th className="py-5 px-6 text-3xl font-black uppercase">Topic</th>
                <th className="py-5 px-6 text-3xl font-black uppercase">Caption</th>
                <th className="py-5 px-6 text-3xl font-black uppercase">Scheduled Time</th>
                <th className="py-5 px-6 text-3xl font-black uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b-2 border-fuchsia-400/10 hover:bg-fuchsia-900/10 animate-pop">
                  <td className="py-5 px-6 font-black text-fuchsia-200 text-2xl">{post.platform}</td>
                  <td className="py-5 px-6 text-2xl">{post.topic}</td>
                  <td className="py-5 px-6 font-black text-fuchsia-100 text-2xl">{post.caption}</td>
                  <td className="py-5 px-6 text-2xl">{post.scheduled_time ? new Date(post.scheduled_time).toLocaleString() : "-"}</td>
                  <td className="py-5 px-6 text-2xl">{post.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="fixed left-0 right-0 bottom-0 h-32 pointer-events-none z-50">
        {/* Extra animated gradient glow at the bottom */}
        <div className="absolute left-1/2 -translate-x-1/2 w-2/3 h-32 bg-gradient-to-r from-fuchsia-400/30 via-violet-400/30 to-fuchsia-400/30 blur-2xl animate-gradient-move" />
      </div>
    </div>
  );
}
