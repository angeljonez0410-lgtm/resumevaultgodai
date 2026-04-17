"use client";

import Link from "next/link";
<<<<<<< HEAD

export default function SocialBotPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Social Bot Dashboard</h1>
        <p className="mb-6 text-gray-700">Welcome to your Social Bot! Choose a section below:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/app/social-bot/accounts" className="block bg-white rounded-xl shadow p-6 hover:bg-gray-100 border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Accounts</h2>
            <p className="text-gray-600">Manage your connected social media accounts.</p>
          </Link>
          <Link href="/app/social-bot/posts" className="block bg-white rounded-xl shadow p-6 hover:bg-gray-100 border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Posts</h2>
            <p className="text-gray-600">View and schedule your social posts.</p>
          </Link>
          <Link href="/app/social-bot/settings" className="block bg-white rounded-xl shadow p-6 hover:bg-gray-100 border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Settings</h2>
            <p className="text-gray-600">Configure your social bot preferences.</p>
          </Link>
          <Link href="/app/social-bot/logs" className="block bg-white rounded-xl shadow p-6 hover:bg-gray-100 border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Logs</h2>
            <p className="text-gray-600">View recent activity and logs.</p>
          </Link>
        </div>
      </div>
    </main>
=======
import { useEffect, useState } from "react";
import { Bot, CalendarDays, Link2, Loader2, MessageSquarePlus, Sparkles, TrendingUp } from "lucide-react";

// Confetti burst effect
// ...existing code for maximalist, animated, confetti, and stats-enhanced SocialBotPage...
        if (cancelled) return;

        const posts: PostSummary[] = Array.isArray(postsData.posts) ? postsData.posts : [];
        setStats({
          accounts: Array.isArray(accountsData.accounts) ? accountsData.accounts.length : 0,
          posts: posts.length,
          drafts: posts.filter((post) => post.status === "draft").length,
          scheduled: posts.filter((post) => post.status === "scheduled").length,
          posted: posts.filter((post) => post.status === "posted").length,
          logs: Array.isArray(logsData.logs) ? logsData.logs.length : 0,
        });
      } catch {
        if (!cancelled) {
          setStats({ accounts: 0, posts: 0, drafts: 0, scheduled: 0, posted: 0, logs: 0 });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    // Confetti on load
    if (typeof window !== "undefined" && !window.confetti) {
      import("canvas-confetti").then((mod) => {
        window.confetti = mod.default;
        fireConfetti();
      });
    } else {
      fireConfetti();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative mx-auto max-w-7xl space-y-16 px-6 py-20 animate-gradient-bg">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-fuchsia-700 via-violet-700 to-slate-900 animate-gradient-move opacity-80 blur-2xl" />
      <section className="relative overflow-hidden rounded-4xl border-4 border-violet-400/40 bg-gradient-to-br from-violet-900 via-fuchsia-900 to-slate-900 shadow-2xl p-16 animate-pop">
        <div className="absolute right-0 top-0 h-72 w-72 translate-x-16 -translate-y-16 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-2xl font-black uppercase tracking-[0.18em] text-fuchsia-300 drop-shadow animate-bounce">Zuzu Hub</p>
            <h1 className="mt-6 text-6xl font-black tracking-tight text-white sm:text-7xl drop-shadow-2xl animate-pop">Supercharge Your Socials with Zuzu</h1>
            <p className="mt-8 max-w-2xl text-3xl leading-10 text-fuchsia-100 font-extrabold drop-shadow animate-bounce-slow">
              Connect every channel, generate viral content, review analytics, and schedule posts—all in one vibrant dashboard.
            </p>
          </div>
          <div className="flex h-36 w-36 items-center justify-center rounded-4xl bg-gradient-to-br from-fuchsia-500 to-violet-500 shadow-2xl border-8 border-white/10 animate-bounce">
            <Bot className="h-20 w-20 text-white drop-shadow-2xl animate-pulse" />
          </div>
        </div>
      </section>

      <section className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="rounded-4xl border-4 border-fuchsia-400/40 bg-gradient-to-br from-slate-900 via-violet-900 to-fuchsia-900 p-12 shadow-2xl hover:scale-105 transition-transform animate-pop">
              <div className="flex items-center justify-between gap-6">
                <p className="text-2xl font-extrabold text-fuchsia-200 drop-shadow animate-bounce">{card.label}</p>
                <Icon className="h-10 w-10 text-fuchsia-400 drop-shadow-2xl animate-pulse" />
              </div>
              <div className="mt-8 text-6xl font-black text-white drop-shadow-2xl animate-pop">
                {loading ? <Loader2 className="h-12 w-12 animate-spin text-fuchsia-300" /> : stats[card.key]}
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
        {[{
            href: "/app/social-bot/accounts",
            title: "Connect Accounts",
            description: "Link Instagram, Facebook, X, LinkedIn, TikTok, Threads, YouTube, and Pinterest.",
          },
          {
            href: "/app/social-bot/code",
            title: "Code Assistant",
            description: "Use Codex to draft code, patches, and implementation ideas, then apply patches locally in development.",
          },
          {
            href: "/app/social-bot/content",
            title: "20 Content Ideas",
            description: "Generate and save 20 resume-focused social posts for resumevaultgod.com.",
          },
          {
            href: "/app/social-bot/schedule",
            title: "Schedule Posts",
            description: "Set post times, manage calendar, and automate publishing.",
          },
          {
            href: "/app/social-bot/posts",
            title: "Queue & Schedule (Legacy)",
            description: "Create posts, generate captions, and manage the publishing queue.",
          },
          {
            href: "/app/social-bot/settings",
            title: "Publishing Settings",
            description: "Tune brand voice, audience, and post frequency.",
          },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group rounded-4xl border-4 border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-900 via-violet-900 to-slate-900 p-12 shadow-2xl hover:scale-105 hover:border-fuchsia-400/60 transition-transform animate-pop"
          >
            <p className="text-3xl font-black text-white drop-shadow-2xl group-hover:text-fuchsia-200 animate-pop">{action.title}</p>
            <p className="mt-6 min-h-16 text-xl leading-8 text-fuchsia-100 font-extrabold drop-shadow group-hover:text-white animate-bounce-slow">{action.description}</p>
            <Sparkles className="mt-10 h-10 w-10 text-fuchsia-400 transition group-hover:translate-x-2 group-hover:text-white drop-shadow-2xl animate-pulse" />
          </Link>
        ))}
      </section>

      <section className="grid gap-14 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-4xl border-4 border-fuchsia-400/40 bg-gradient-to-br from-slate-900 via-violet-900 to-fuchsia-900 p-14 shadow-2xl animate-pop">
          <h2 className="text-4xl font-black text-fuchsia-200 drop-shadow-2xl">What Zuzu Can Do</h2>
          <ul className="mt-10 space-y-6 text-2xl text-fuchsia-100 font-extrabold drop-shadow animate-bounce-slow">
            <li>✨ Generate 20-post content vaults for <a href='https://resumevaultgod.com' className='underline text-fuchsia-300 hover:text-white'>resumevaultgod.com</a>.</li>
            <li>🔗 Connect accounts across Instagram, Facebook, X, LinkedIn, TikTok, Threads, YouTube, Pinterest, and Reddit.</li>
            <li>📅 Build draft, scheduled, and published queues from one dashboard.</li>
            <li>💡 Draft code, patches, and feature scaffolds with Codex inside Zuzu.</li>
            <li>🎤 Use publishing settings to keep voice and cadence consistent.</li>
          </ul>
        </div>
        <div className="rounded-4xl border-4 border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-900 via-violet-900 to-slate-900 p-14 shadow-2xl animate-pop">
          <h2 className="text-4xl font-black text-fuchsia-200 drop-shadow-2xl">Quick Links</h2>
          <div className="mt-10 space-y-6">
            <Link className="block rounded-2xl bg-fuchsia-600/30 px-10 py-7 text-2xl font-black text-white shadow-xl hover:bg-fuchsia-600/50 hover:text-fuchsia-100 transition animate-pop" href="/app/social-bot/content">
              🚀 Generate Content Vault
            </Link>
            <Link className="block rounded-2xl bg-fuchsia-600/30 px-10 py-7 text-2xl font-black text-white shadow-xl hover:bg-fuchsia-600/50 hover:text-fuchsia-100 transition animate-pop" href="/app/social-bot/accounts">
              🔗 Connect Platforms
            </Link>
            <Link className="block rounded-2xl bg-fuchsia-600/30 px-10 py-7 text-2xl font-black text-white shadow-xl hover:bg-fuchsia-600/50 hover:text-fuchsia-100 transition animate-pop" href="/app/social-bot/code">
              💡 Open Codex Assistant
            </Link>
            <Link className="block rounded-2xl bg-fuchsia-600/30 px-10 py-7 text-2xl font-black text-white shadow-xl hover:bg-fuchsia-600/50 hover:text-fuchsia-100 transition animate-pop" href="/app/social-bot/schedule">
              📅 Schedule Posts
            </Link>
            <Link className="block rounded-2xl bg-fuchsia-600/30 px-10 py-7 text-2xl font-black text-white shadow-xl hover:bg-fuchsia-600/50 hover:text-fuchsia-100 transition animate-pop" href="/app/social-bot/posts">
              🗂️ Manage Posts (Legacy)
            </Link>
            <Link className="block rounded-2xl bg-fuchsia-600/30 px-10 py-7 text-2xl font-black text-white shadow-xl hover:bg-fuchsia-600/50 hover:text-fuchsia-100 transition animate-pop" href="/app/social-bot/logs">
              📊 Review Logs
            </Link>
          </div>
        </div>
      </section>
      <div className="fixed left-0 right-0 bottom-0 h-32 pointer-events-none z-50">
        {/* Extra animated gradient glow at the bottom */}
        <div className="absolute left-1/2 -translate-x-1/2 w-2/3 h-32 bg-gradient-to-r from-fuchsia-400/30 via-violet-400/30 to-fuchsia-400/30 blur-2xl animate-gradient-move" />
      </div>
    </div>
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
  );
}
