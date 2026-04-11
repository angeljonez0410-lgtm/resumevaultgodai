"use client";

import { useState } from "react";
import { Sparkles, Mail, ArrowRight, Shield, Zap, Star } from "lucide-react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          redirectTo: `${appUrl}/auth/callback`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSent(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const supabase = getSupabaseBrowser();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${appUrl}/auth/callback`,
        },
      });
      if (oauthError) {
        setError(oauthError.message);
        setGoogleLoading(false);
      }
    } catch {
      setError("Failed to start Google sign-in");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e2d42] via-[#1e2d42] to-[#2a3f5f] flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#f4c542] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#1e2d42]" />
          </div>
          <span className="text-white font-bold text-lg">ResumeVault<span className="text-[#f4c542]">GodAI</span></span>
        </Link>
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md">
          {!sent ? (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-[#f4c542] flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-[#1e2d42]" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Welcome to ResumeVault GodAI</h1>
                <p className="text-slate-300 text-sm">Sign in to access your AI-powered career toolkit</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f4c542] focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full bg-[#f4c542] text-[#1e2d42] font-bold py-3 rounded-xl hover:bg-[#e0b02f] disabled:opacity-50 transition flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    "Sending magic link..."
                  ) : (
                    <>
                      Sign In with Magic Link <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/20" />
                <span className="text-xs text-slate-400">or</span>
                <div className="flex-1 h-px bg-white/20" />
              </div>

              {/* Google OAuth */}
              <button
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full bg-white text-slate-800 font-semibold py-3 rounded-xl hover:bg-slate-100 disabled:opacity-50 transition flex items-center justify-center gap-3 text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {googleLoading ? "Redirecting to Google..." : "Continue with Google"}
              </button>

              <p className="text-center text-xs text-slate-400 mt-4">
                No password needed — we&apos;ll send a secure link to your email
              </p>

              {/* Features */}
              <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
                <div>
                  <Shield className="w-5 h-5 text-[#f4c542] mx-auto mb-1" />
                  <p className="text-xs text-slate-300">Secure</p>
                </div>
                <div>
                  <Zap className="w-5 h-5 text-[#f4c542] mx-auto mb-1" />
                  <p className="text-xs text-slate-300">Instant</p>
                </div>
                <div>
                  <Star className="w-5 h-5 text-[#f4c542] mx-auto mb-1" />
                  <p className="text-xs text-slate-300">Free to Start</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your email!</h2>
              <p className="text-slate-300 text-sm mb-6">
                We sent a magic link to <span className="font-semibold text-white">{email}</span>. Click it to sign in.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-[#f4c542] text-sm font-medium hover:underline"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
