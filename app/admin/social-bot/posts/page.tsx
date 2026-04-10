"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PostsPage() {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("sb_access_token")) {
      router.push("/admin/login");
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin/social-bot" className="flex items-center gap-2">
            <span className="text-xl font-bold text-indigo-600">←</span>
            <h1 className="text-2xl font-bold text-gray-900">Scheduled Posts</h1>
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-gray-900">Posts</h2>
          <Link href="/admin/social-bot/posts/create">
            <button className="btn-primary">Create Post</button>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow p-8">
          <p className="text-gray-600 text-center">No posts scheduled yet.</p>
        </div>
      </div>
    </main>
  );
}
