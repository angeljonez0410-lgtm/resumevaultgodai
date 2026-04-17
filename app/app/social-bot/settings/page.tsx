"use client";

<<<<<<< HEAD
export default function SocialBotSettingsPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Social Bot Settings</h1>
        <p className="text-gray-700">Configure your social bot preferences here.</p>
      </div>
    </main>
=======
import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { Loader2, Save, Settings } from "lucide-react";

type SocialSettings = {
  brand_voice: string;
  target_audience: string;
  post_frequency: string;
};

const DEFAULT_SETTINGS: SocialSettings = {
  brand_voice: "Professional, empowering, modern",
  target_audience: "job seekers and career switchers",
  post_frequency: "daily",
};

const API_KEYS = [
  { key: "REPLICATE_API_TOKEN", label: "Replicate API Token" },
  { key: "OPENAI_API_KEY", label: "OpenAI API Key" },
  { key: "SUPABASE_URL", label: "Supabase URL" },
  { key: "SUPABASE_SERVICE_ROLE_KEY", label: "Supabase Service Role Key" },
  { key: "SUPABASE_ANON_KEY", label: "Supabase Anon Key" },
  { key: "SOCIAL_FACEBOOK_CLIENT_ID", label: "Facebook Client ID" },
  { key: "SOCIAL_FACEBOOK_CLIENT_SECRET", label: "Facebook Client Secret" },
  { key: "SOCIAL_INSTAGRAM_CLIENT_ID", label: "Instagram Client ID" },
  { key: "SOCIAL_INSTAGRAM_CLIENT_SECRET", label: "Instagram Client Secret" },
  { key: "SOCIAL_TWITTER_CLIENT_ID", label: "X/Twitter Client ID" },
  { key: "SOCIAL_TWITTER_CLIENT_SECRET", label: "X/Twitter Client Secret" },
  { key: "SOCIAL_LINKEDIN_CLIENT_ID", label: "LinkedIn Client ID" },
  { key: "SOCIAL_LINKEDIN_CLIENT_SECRET", label: "LinkedIn Client Secret" },
  { key: "SOCIAL_TIKTOK_CLIENT_KEY", label: "TikTok Client Key" },
  { key: "SOCIAL_TIKTOK_CLIENT_SECRET", label: "TikTok Client Secret" },
  { key: "SOCIAL_THREADS_CLIENT_ID", label: "Threads Client ID" },
  { key: "SOCIAL_THREADS_CLIENT_SECRET", label: "Threads Client Secret" },
  { key: "SOCIAL_YOUTUBE_CLIENT_ID", label: "YouTube Client ID" },
  { key: "SOCIAL_YOUTUBE_CLIENT_SECRET", label: "YouTube Client Secret" },
  { key: "SOCIAL_PINTEREST_CLIENT_ID", label: "Pinterest Client ID" },
  { key: "SOCIAL_PINTEREST_CLIENT_SECRET", label: "Pinterest Client Secret" },
  { key: "SOCIAL_REDDIT_CLIENT_ID", label: "Reddit Client ID" },
  { key: "SOCIAL_REDDIT_CLIENT_SECRET", label: "Reddit Client Secret" },
];

export default function SocialBotSettingsPage() {
  const [settings, setSettings] = useState<SocialSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [env, setEnv] = useState<Record<string, string>>({});
  const [envLoading, setEnvLoading] = useState(true);
  const [envSaving, setEnvSaving] = useState(false);
  const [envMsg, setEnvMsg] = useState("");

  // Load .env values
  useEffect(() => {
    setEnvLoading(true);
    fetch("/api/env")
      .then((res) => res.json())
      .then((data) => setEnv(data.env || {}))
      .catch(() => setEnv({}))
      .finally(() => setEnvLoading(false));
  }, []);

  const handleEnvChange = (key: string, value: string) => {
    setEnv((prev) => ({ ...prev, [key]: value }));
  };

  const saveEnv = async () => {
    setEnvSaving(true);
    setEnvMsg("");
    try {
      const res = await fetch("/api/env", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(env),
      });
      const data = await res.json();
      if (!res.ok) {
        setEnvMsg(data.error || "Failed to save API keys");
      } else {
        setEnvMsg("API keys saved to .env!");
      }
    } catch {
      setEnvMsg("Could not save API keys");
    } finally {
      setEnvSaving(false);
    }
  };

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await authFetch("/api/settings");
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Failed to load settings");
      } else {
        setSettings(data.settings || DEFAULT_SETTINGS);
      }
    } catch {
      setMessage("Could not load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const saveSettings = useCallback(async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await authFetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Failed to save settings");
      } else {
        setSettings(data.settings || DEFAULT_SETTINGS);
        setMessage("Publishing settings saved");
      }
    } catch {
      setMessage("Could not save settings");
    } finally {
      setSaving(false);
    }
  }, [settings]);

  return (
    <div className="mx-auto max-w-5xl space-y-14 px-5 py-16 sm:px-10 lg:px-20 lg:py-20">
      <section className="rounded-3xl border-4 border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-900 via-violet-900 to-slate-900 p-14 shadow-2xl animate-pulse-slow">
        <p className="text-2xl font-extrabold uppercase tracking-[0.22em] text-fuchsia-200 text-center drop-shadow-lg">Zuzu Settings</p>
        <h1 className="mt-6 text-7xl font-extrabold tracking-tight text-white text-center drop-shadow-2xl uppercase animate-pop">Make It Pop! 🎉</h1>
        <p className="mt-6 max-w-4xl mx-auto text-3xl leading-10 text-fuchsia-100 font-extrabold text-center animate-bounce-slow">
          Add your API keys, tune your brand, and let Zuzu automate your socials with joy. The more you add, the more you unlock!
        </p>
      </section>

      <section className="rounded-3xl border-4 border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-900 via-violet-900 to-slate-900 p-14 shadow-2xl mt-14">
        <div className="flex items-center gap-6 mb-10">
          <Settings className="h-14 w-14 text-fuchsia-300 animate-spin-slow" />
          <h2 className="text-5xl font-extrabold text-white uppercase tracking-tight drop-shadow-lg">Workspace Defaults</h2>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-fuchsia-300" />
            <p className="text-3xl text-fuchsia-100 font-extrabold">Loading settings...</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-12">
            <label className="space-y-4">
              <span className="text-2xl font-extrabold text-fuchsia-200">Brand Voice</span>
              <textarea
                value={settings.brand_voice}
                onChange={(e) => setSettings((prev) => ({ ...prev, brand_voice: e.target.value }))}
                className="min-h-32 w-full rounded-2xl border-4 border-fuchsia-400/40 bg-slate-950 px-8 py-6 text-3xl font-extrabold text-white outline-none focus:ring-4 focus:ring-fuchsia-400 placeholder:text-fuchsia-400 shadow-xl"
                placeholder="e.g. Professional, empowering, modern"
              />
            </label>
            <label className="space-y-4">
              <span className="text-2xl font-extrabold text-fuchsia-200">Target Audience</span>
              <textarea
                value={settings.target_audience}
                onChange={(e) => setSettings((prev) => ({ ...prev, target_audience: e.target.value }))}
                className="min-h-28 w-full rounded-2xl border-4 border-fuchsia-400/40 bg-slate-950 px-8 py-6 text-3xl font-extrabold text-white outline-none focus:ring-4 focus:ring-fuchsia-400 placeholder:text-fuchsia-400 shadow-xl"
                placeholder="e.g. Job seekers and career switchers"
              />
            </label>
            <label className="space-y-4">
              <span className="text-2xl font-extrabold text-fuchsia-200">Post Frequency</span>
              <input
                value={settings.post_frequency}
                onChange={(e) => setSettings((prev) => ({ ...prev, post_frequency: e.target.value }))}
                className="w-full rounded-2xl border-4 border-fuchsia-400/40 bg-slate-950 px-8 py-6 text-3xl font-extrabold text-white outline-none focus:ring-4 focus:ring-fuchsia-400 placeholder:text-fuchsia-400 shadow-xl"
                placeholder="e.g. Daily"
              />
            </label>
          </div>
        )}
        <div className="mt-12 flex flex-wrap items-center gap-6">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="inline-flex items-center gap-4 rounded-2xl bg-fuchsia-600 px-12 py-6 text-3xl font-extrabold text-white shadow-2xl hover:bg-fuchsia-700 disabled:opacity-50 transition animate-bounce"
          >
            {saving ? <Loader2 className="h-8 w-8 animate-spin" /> : <Save className="h-8 w-8" />}
            Save Workspace
          </button>
        </div>
        {message ? <p className="mt-8 text-2xl text-fuchsia-100 font-extrabold text-center animate-pop">{message}</p> : null}
      </section>
    </div>
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
  );
}
