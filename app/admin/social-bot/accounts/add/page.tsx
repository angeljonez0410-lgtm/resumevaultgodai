"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AddAccountPage() {
  const router = useRouter();
  const [platform, setPlatform] = useState("twitter");

  useEffect(() => {
    if (!localStorage.getItem("sb_access_token")) {
      router.push("/admin/login");
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin/social-bot/accounts" className="flex items-center gap-2">
            <span className="text-xl font-bold text-indigo-600">←</span>
            <h1 className="text-2xl font-bold text-gray-900">Add Social Account</h1>
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow p-8">
          <label className="block text-sm font-semibold text-gray-700 mb-4">Select Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-6"
          >
            <option value="twitter">Twitter</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="tiktok">TikTok</option>
            <option value="reddit">Reddit</option>
            <option value="threads">Threads</option>
          </select>

          <button className="btn-primary w-full">Connect Account</button>
        </div>
      </div>
    </main>
  );
}
