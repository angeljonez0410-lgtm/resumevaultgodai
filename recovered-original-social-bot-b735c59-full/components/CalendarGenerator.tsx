"use client";

import { useState } from "react";
import { authFetch } from "../lib/auth-fetch";

export default function CalendarGenerator({
  onGenerated,
}: {
  onGenerated: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setMessage("");

    const res = await authFetch("/api/generate-calendar", {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to generate calendar");
      setLoading(false);
      return;
    }

    setMessage(`Generated ${data.count} scheduled posts`);
    setLoading(false);
    await onGenerated();
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-900">30-Day Content Calendar</h2>
      <p className="text-sm text-gray-600 mt-2">
        Generate 30 scheduled AI post ideas using your current settings.
      </p>

      <button
        onClick={handleGenerate}
        className="mt-4 bg-green-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-green-700"
      >
        {loading ? "Generating..." : "Generate 30-Day Calendar"}
      </button>

      {message ? <p className="mt-4 text-sm text-gray-600">{message}</p> : null}
    </div>
  );
}