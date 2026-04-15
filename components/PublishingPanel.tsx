"use client";

import { useState } from "react";

export default function PublishingPanel({
  onRun,
}: {
  onRun: () => Promise<void>;
}) {
  const [secret, setSecret] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function runPublishing() {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/publish-scheduled", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to run publishing");
      setLoading(false);
      return;
    }

    setMessage(`Processed ${data.processed} scheduled posts`);
    setLoading(false);
    await onRun();
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-900">Scheduled Publishing</h2>
      <p className="text-sm text-gray-600 mt-2">
        Manually trigger publishing for all due scheduled posts.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Cron Secret</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Enter CRON_SECRET"
          />
        </div>

        <button
          onClick={runPublishing}
          className="bg-orange-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-orange-700"
        >
          {loading ? "Running..." : "Run Scheduled Publishing"}
        </button>

        {message ? <p className="text-sm text-gray-600">{message}</p> : null}
      </div>
    </div>
  );
}