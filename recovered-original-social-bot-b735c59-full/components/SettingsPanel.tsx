"use client";

import { useEffect, useState } from "react";
import { authFetch } from "../lib/auth-fetch";

export default function SettingsPanel({
  onSaved,
}: {
  onSaved: () => Promise<void>;
}) {
  const [brandVoice, setBrandVoice] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [postFrequency, setPostFrequency] = useState("daily");
  const [message, setMessage] = useState("");

  async function loadSettings() {
    const res = await authFetch("/api/settings");
    const data = await res.json();

    if (data.settings) {
      setBrandVoice(data.settings.brand_voice || "");
      setTargetAudience(data.settings.target_audience || "");
      setPostFrequency(data.settings.post_frequency || "daily");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSettings();
  }, []);

  async function saveSettings() {
    setMessage("");

    const res = await authFetch("/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        brand_voice: brandVoice,
        target_audience: targetAudience,
        post_frequency: postFrequency,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to save settings");
      return;
    }

    setMessage("Settings saved");
    await onSaved();
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-900">Settings</h2>

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Brand Voice</label>
          <textarea
            className="w-full border border-gray-300 rounded-xl px-4 py-3 min-h-[100px]"
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            placeholder="Professional, bold, helpful"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Target Audience</label>
          <input
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="Job seekers, professionals, career changers"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Post Frequency</label>
          <select
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
            value={postFrequency}
            onChange={(e) => setPostFrequency(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="3x-week">3x per week</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        <button
          onClick={saveSettings}
          className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-indigo-700"
        >
          Save Settings
        </button>

        {message ? <p className="text-sm text-gray-600">{message}</p> : null}
      </div>
    </div>
  );
}
