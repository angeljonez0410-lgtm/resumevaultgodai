"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
<<<<<<< HEAD
=======
import { storeClientSession } from "@/lib/auth-fetch";
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Signing you in...");

  useEffect(() => {
    async function handleAuth() {
      try {
<<<<<<< HEAD
        // Parse tokens from URL hash (Supabase magic link / OAuth puts them there)
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        // Also check query params (some OAuth flows use query params)
        const queryParams = new URLSearchParams(window.location.search);

        const access_token = hashParams.get("access_token") || queryParams.get("access_token");
        const refresh_token = hashParams.get("refresh_token") || queryParams.get("refresh_token");

        if (!access_token) {
          // For Google OAuth, Supabase may handle session via cookies
          // Try using the Supabase client to get the session
          const { getSupabaseBrowser } = await import("@/lib/supabase-browser");
          const supabase = getSupabaseBrowser();
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            localStorage.setItem("sb_access_token", session.access_token);
            localStorage.setItem("sb_refresh_token", session.refresh_token);
            localStorage.setItem("sb_user", JSON.stringify({ email: session.user.email, id: session.user.id }));
            router.replace("/app");
            return;
          }

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
=======
        const { getSupabaseBrowser } = await import("@/lib/supabase-browser");
        const supabase = getSupabaseBrowser();
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get("code");

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error || !data.session?.user) {
            setStatus(error?.message || "Authentication failed. Please try logging in again.");
            return;
          }

          storeClientSession(data.session);

          router.replace("/app");
          return;
        }

        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const access_token = hashParams.get("access_token") || queryParams.get("access_token");
        const refresh_token = hashParams.get("refresh_token") || queryParams.get("refresh_token");

        if (access_token) {
          const res = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token, refresh_token }),
          });

          const data = await res.json();

          if (!res.ok || !data.user) {
            setStatus(data.error || "Authentication failed. Please try logging in again.");
            return;
          }

          localStorage.setItem("sb_access_token", data.access_token);
          localStorage.setItem("sb_refresh_token", data.refresh_token);
          localStorage.setItem("sb_user", JSON.stringify(data.user));

          router.replace("/app");
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          storeClientSession(session);
          router.replace("/app");
          return;
        }

        setStatus("No auth token found. Please try logging in again.");
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
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
<<<<<<< HEAD
}
=======
}
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
