"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettingsPage() {
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
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">App Settings</h3>
          <p className="text-gray-600">Settings coming soon...</p>
        </div>
      </div>
    </main>
  );
}
