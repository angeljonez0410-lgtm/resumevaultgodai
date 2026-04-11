"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Signing you in...");

  useEffect(() => {
    async function handleAuth() {
      try {
        // Parse tokens from URL hash (Supabase magic link puts them there)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (!access_token) {
          setStatus("No auth token found. Please try logging in again.");
          return;
        }

        // Verify tokens server-side and get user info
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token, refresh_token }),
        });

        const data = await res.json();

        if (!res.ok || !data.user) {
          setStatus("Authentication failed. Please try logging in again.");
          return;
        }

        // Store session in localStorage
        localStorage.setItem("sb_access_token", data.access_token);
        localStorage.setItem("sb_refresh_token", data.refresh_token);
        localStorage.setItem("sb_user", JSON.stringify(data.user));

        router.replace("/app");
      } catch {
        setStatus("Something went wrong. Please try logging in again.");
      }
    }

    handleAuth();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow p-8">
        <p className="text-gray-700 font-medium">{status}</p>
      </div>
    </main>
  );
}