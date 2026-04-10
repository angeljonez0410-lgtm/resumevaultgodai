"use client";

import { useEffect, useState } from "react";

type Activity = {
  id: string;
  platform: string;
  action: string;
  username: string | null;
  detail: string | null;
  created_at: string;
};

const platformStyles: Record<string, { icon: string; color: string }> = {
  instagram: { icon: "📷", color: "bg-gradient-to-r from-purple-500 to-pink-500" },
  twitter: { icon: "𝕏", color: "bg-black" },
  linkedin: { icon: "in", color: "bg-blue-700" },
  tiktok: { icon: "♪", color: "bg-gray-900" },
  reddit: { icon: "🤖", color: "bg-orange-600" },
  threads: { icon: "@", color: "bg-black" },
  system: { icon: "⚙️", color: "bg-gray-500" },
};

const actionStyles: Record<string, { label: string; badge: string }> = {
  login: { label: "Logged In", badge: "bg-green-100 text-green-700" },
  logout: { label: "Logged Out", badge: "bg-red-100 text-red-700" },
  connect: { label: "Connected", badge: "bg-blue-100 text-blue-700" },
  disconnect: { label: "Disconnected", badge: "bg-orange-100 text-orange-700" },
  post_created: { label: "Post Created", badge: "bg-indigo-100 text-indigo-700" },
  post_published: { label: "Published", badge: "bg-green-100 text-green-700" },
  post_failed: { label: "Failed", badge: "bg-red-100 text-red-700" },
  settings_updated: { label: "Settings Updated", badge: "bg-yellow-100 text-yellow-700" },
};

export default function ActivityDashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    try {
      const res = await fetch("/api/activity");
      const data = await res.json();
      setActivities(data.activities || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === "all"
    ? activities
    : activities.filter((a) => a.platform === filter);

  const platforms = ["all", ...new Set(activities.map((a) => a.platform))];

  function timeAgo(date: string) {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Activity Log</h2>
          <p className="text-sm text-gray-500">Your social media login/logout and publishing activity</p>
        </div>
        <button
          onClick={loadActivities}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {platforms.map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
              filter === p
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Activity list */}
      {loading ? (
        <p className="text-gray-400 text-sm text-center py-8">Loading activity...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">No activity recorded yet.</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filtered.map((activity) => {
            const pStyle = platformStyles[activity.platform] || platformStyles.system;
            const aStyle = actionStyles[activity.action] || { label: activity.action, badge: "bg-gray-100 text-gray-700" };
            return (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition"
              >
                <div
                  className={`${pStyle.color} text-white w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0`}
                >
                  {pStyle.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900 capitalize">
                      {activity.platform}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${aStyle.badge}`}>
                      {aStyle.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {activity.username && `@${activity.username} · `}
                    {activity.detail || "No details"}
                  </p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {timeAgo(activity.created_at)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
