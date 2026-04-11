"use client";

import { useState } from "react";
import { Sparkles, Mail, ArrowRight, Shield, Zap, Star } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
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
