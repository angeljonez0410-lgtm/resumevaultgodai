"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ConnectedAccount = {
  platform: string;
  username: string;
  connected_at: string;
  logged_in: boolean;
  last_login: string | null;
  last_logout: string | null;
};

type ActivityEntry = {
  platform: string;
  action: string;
  username: string | null;
  detail: string | null;
  created_at: string;
};

const platforms = [
  {
    id: "instagram",
    name: "Instagram",
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
    hoverColor: "hover:from-purple-600 hover:to-pink-600",
    icon: "📷",
    description: "Share photos, reels, and stories",
  },
  {
    id: "twitter",
    name: "Twitter / X",
    color: "bg-black",
    hoverColor: "hover:bg-gray-800",
    icon: "𝕏",
    description: "Post tweets and threads",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    color: "bg-blue-700",
    hoverColor: "hover:bg-blue-800",
    icon: "in",
    description: "Professional posts and articles",
  },
  {
    id: "tiktok",
    name: "TikTok",
    color: "bg-gray-900",
    hoverColor: "hover:bg-gray-800",
    icon: "♪",
    description: "Short-form video content",
  },
  {
    id: "reddit",
    name: "Reddit",
    color: "bg-orange-600",
    hoverColor: "hover:bg-orange-700",
    icon: "🤖",
    description: "Community posts and discussions",
  },
  {
    id: "threads",
    name: "Threads",
    color: "bg-black",
    hoverColor: "hover:bg-gray-800",
    icon: "@",
    description: "Text-based conversations",
  },
];

export default function AccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityEntry[]>([]);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("sb_access_token")) {
      router.push("/admin/login");
      return;
    }
    const stored = localStorage.getItem("connected_accounts");
    if (stored) {
      setAccounts(JSON.parse(stored));
    }
    loadActivity();
  }, [router]);

  async function loadActivity() {
    try {
      const res = await fetch("/api/activity");
      const data = await res.json();
      setRecentActivity(
        (data.activities || []).filter(
          (a: ActivityEntry) => a.platform !== "system"
        ).slice(0, 20)
      );
    } catch { /* silent */ }
  }

  function saveAccounts(updated: ConnectedAccount[]) {
    setAccounts(updated);
    localStorage.setItem("connected_accounts", JSON.stringify(updated));
  }

  async function logActivity(platform: string, action: string, username: string, detail: string) {
    await fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, action, username, detail }),
    });
    loadActivity();
  }

  function handleConnect(platformId: string) {
    setConnectingPlatform(platformId);
    setUsernameInput("");
  }

  function confirmConnect() {
    if (!connectingPlatform || !usernameInput.trim()) return;
    const username = usernameInput.trim().replace(/^@/, "");
    const newAccount: ConnectedAccount = {
      platform: connectingPlatform,
      username,
      connected_at: new Date().toISOString(),
      logged_in: true,
      last_login: new Date().toISOString(),
      last_logout: null,
    };
    saveAccounts([...accounts.filter(a => a.platform !== connectingPlatform), newAccount]);
    logActivity(connectingPlatform, "connect", username, `Connected and logged into ${connectingPlatform} as @${username}`);
    logActivity(connectingPlatform, "login", username, `Logged into ${connectingPlatform}`);
    setConnectingPlatform(null);
    setUsernameInput("");
  }

  function handleLogin(platformId: string) {
    const account = accounts.find(a => a.platform === platformId);
    if (!account) return;
    const updated = accounts.map(a =>
      a.platform === platformId ? { ...a, logged_in: true, last_login: new Date().toISOString() } : a
    );
    saveAccounts(updated);
    logActivity(platformId, "login", account.username, `Logged into ${platformId}`);
  }

  function handleLogout(platformId: string) {
    const account = accounts.find(a => a.platform === platformId);
    if (!account) return;
    const updated = accounts.map(a =>
      a.platform === platformId ? { ...a, logged_in: false, last_logout: new Date().toISOString() } : a
    );
    saveAccounts(updated);
    logActivity(platformId, "logout", account.username, `Logged out of ${platformId}`);
  }

  function handleDisconnect(platformId: string) {
    const account = accounts.find(a => a.platform === platformId);
    if (!account) return;
    if (!confirm(`Disconnect your ${platformId} account @${account.username}?`)) return;
    const updated = accounts.filter(a => a.platform !== platformId);
    saveAccounts(updated);
    logActivity(platformId, "disconnect", account.username, `Disconnected ${platformId} account @${account.username}`);
  }

  function timeAgo(date: string) {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  const loggedInCount = accounts.filter(a => a.logged_in).length;

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin/social-bot" className="flex items-center gap-2">
            <span className="text-xl font-bold text-indigo-600">←</span>
            <h1 className="text-2xl font-bold text-gray-900">Social Accounts</h1>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm text-gray-600">{loggedInCount} active</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Status overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {platforms.map((p) => {
            const account = accounts.find(a => a.platform === p.id);
            return (
              <div key={p.id} className={`rounded-xl p-3 text-center ${account?.logged_in ? "bg-green-50 border border-green-200" : account ? "bg-orange-50 border border-orange-200" : "bg-gray-50 border border-gray-200"}`}>
                <div className="text-2xl mb-1">{p.icon}</div>
                <p className="text-xs font-semibold text-gray-700">{p.name}</p>
                <p className={`text-xs mt-0.5 ${account?.logged_in ? "text-green-600" : account ? "text-orange-600" : "text-gray-400"}`}>
                  {account?.logged_in ? "Logged In" : account ? "Logged Out" : "Not Connected"}
                </p>
              </div>
            );
          })}
        </div>

        {/* Connect modal */}
        {connectingPlatform && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Connect {platforms.find(p => p.id === connectingPlatform)?.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">Enter your username to link your account.</p>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && confirmConnect()}
                placeholder="@yourusername"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setConnectingPlatform(null)}
                  className="flex-1 py-2 rounded-xl font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmConnect}
                  disabled={!usernameInput.trim()}
                  className="flex-1 py-2 rounded-xl font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  Connect &amp; Log In
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Platform cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Your Platforms</h2>
          {platforms.map((platform) => {
            const account = accounts.find(a => a.platform === platform.id);
            return (
              <div key={platform.id} className="bg-white rounded-2xl shadow p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`${platform.color} text-white w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold`}>
                      {platform.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{platform.name}</h3>
                      {account ? (
                        <div>
                          <p className="text-sm text-gray-700">@{account.username}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`w-2 h-2 rounded-full ${account.logged_in ? "bg-green-500" : "bg-gray-300"}`}></span>
                            <span className={`text-xs ${account.logged_in ? "text-green-600" : "text-gray-400"}`}>
                              {account.logged_in ? "Active session" : "Signed out"}
                            </span>
                            {account.last_login && (
                              <span className="text-xs text-gray-400 ml-2">
                                Last login: {timeAgo(account.last_login)}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">{platform.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {account ? (
                      <>
                        {account.logged_in ? (
                          <button
                            onClick={() => handleLogout(platform.id)}
                            className="px-4 py-2 rounded-xl font-semibold text-sm bg-orange-100 text-orange-700 hover:bg-orange-200"
                          >
                            Log Out
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLogin(platform.id)}
                            className="px-4 py-2 rounded-xl font-semibold text-sm bg-green-100 text-green-700 hover:bg-green-200"
                          >
                            Log In
                          </button>
                        )}
                        <button
                          onClick={() => handleDisconnect(platform.id)}
                          className="px-4 py-2 rounded-xl font-semibold text-sm bg-red-100 text-red-600 hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleConnect(platform.id)}
                        className={`${platform.color} ${platform.hoverColor} text-white px-5 py-2 rounded-xl font-semibold text-sm`}
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No social account activity yet.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentActivity.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="text-lg w-8 text-center">
                    {entry.action === "login" ? "🟢" : entry.action === "logout" ? "🔴" : entry.action === "connect" ? "🔗" : "❌"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold capitalize">{entry.platform}</span>
                      {" — "}
                      <span className={entry.action === "login" ? "text-green-600" : entry.action === "logout" ? "text-red-500" : entry.action === "connect" ? "text-blue-600" : "text-orange-600"}>
                        {entry.action === "login" ? "Logged In" : entry.action === "logout" ? "Logged Out" : entry.action === "connect" ? "Connected" : "Disconnected"}
                      </span>
                      {entry.username && <span className="text-gray-500"> @{entry.username}</span>}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">{timeAgo(entry.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Full OAuth integration requires app registration with each platform&apos;s developer portal.
            Currently using simulated connections. Real publishing will be enabled once OAuth credentials are configured.
          </p>
        </div>
      </div>
    </main>
  );
}
