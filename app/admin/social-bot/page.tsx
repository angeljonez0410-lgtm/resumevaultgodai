"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CreatePostForm from "../../../components/CreatePostForm";
import PostsTable from "../../../components/PostsTable";
import LogsPanel from "../../../components/LogsPanel";
import SettingsPanel from "../../../components/SettingsPanel";
import CalendarGenerator from "../../../components/CalendarGenerator";
import PublishingPanel from "../../../components/PublishingPanel";
import AnalyticsCards from "../../../components/AnalyticsCards";

type Analytics = {
  totalPosts: number;
  drafts: number;
  scheduled: number;
  posted: number;
  failed: number;
  totalLogs: number;
};

export default function SocialBotPage() {
  const [email, setEmail] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalPosts: 0,
    drafts: 0,
    scheduled: 0,
    posted: 0,
    failed: 0,
    totalLogs: 0,
  });
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const storedUser = localStorage.getItem("sb_user");
      const accessToken = localStorage.getItem("sb_access_token");

      if (!storedUser || !accessToken) {
        router.push("/admin/login");
        return;
      }

      // Verify token is still valid server-side
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();

      if (!data.user) {
        localStorage.removeItem("sb_user");
        localStorage.removeItem("sb_access_token");
        localStorage.removeItem("sb_refresh_token");
        router.push("/admin/login");
        return;
      }

      setEmail(data.user.email || "");
      await loadData();
    }

    checkUser();
  }, [router]);

  async function loadData() {
    const postsRes = await fetch("/api/posts");
    const postsData = await postsRes.json();
    setPosts(postsData.posts || []);

    const logsRes = await fetch("/api/logs");
    const logsData = await logsRes.json();
    setLogs(logsData.logs || []);

    const analyticsRes = await fetch("/api/analytics");
    const analyticsData = await analyticsRes.json();
    setAnalytics(
      analyticsData.analytics || {
        totalPosts: 0,
        drafts: 0,
        scheduled: 0,
        posted: 0,
        failed: 0,
        totalLogs: 0,
      }
    );
  }

  async function logout() {
    localStorage.removeItem("sb_user");
    localStorage.removeItem("sb_access_token");
    localStorage.removeItem("sb_refresh_token");
    router.push("/admin/login");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow p-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ResumeVault Social Bot</h1>
            <p className="text-gray-600 mt-1">Manage content and activity</p>
          </div>

          <button
            onClick={logout}
            className="bg-gray-200 px-4 py-2 rounded-xl font-semibold hover:bg-gray-300"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-sm text-gray-500">Logged in as</p>
          <p className="text-lg font-bold text-gray-900">{email || "Loading..."}</p>
        </div>

        <AnalyticsCards analytics={analytics} />
        <SettingsPanel onSaved={loadData} />
        <CalendarGenerator onGenerated={loadData} />
        <PublishingPanel onRun={loadData} />
        <CreatePostForm onCreated={loadData} />
        <PostsTable posts={posts} />
        <LogsPanel logs={logs} />
      </div>
    </main>
  );
}
