"use client";

import Link from "next/link";

export default function SocialBotPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Social Bot Dashboard</h1>
        <p className="mb-6 text-gray-700">Welcome to your Social Bot! Choose a section below:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/app/social-bot/accounts" className="block bg-white rounded-xl shadow p-6 hover:bg-gray-100 border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Accounts</h2>
            <p className="text-gray-600">Manage your connected social media accounts.</p>
          </Link>
          <Link href="/app/social-bot/posts" className="block bg-white rounded-xl shadow p-6 hover:bg-gray-100 border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Posts</h2>
            <p className="text-gray-600">View and schedule your social posts.</p>
          </Link>
          <Link href="/app/social-bot/settings" className="block bg-white rounded-xl shadow p-6 hover:bg-gray-100 border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Settings</h2>
            <p className="text-gray-600">Configure your social bot preferences.</p>
          </Link>
          <Link href="/app/social-bot/logs" className="block bg-white rounded-xl shadow p-6 hover:bg-gray-100 border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Logs</h2>
            <p className="text-gray-600">View recent activity and logs.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
