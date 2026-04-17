"use client";

<<<<<<< HEAD
export default function SocialBotAccountsPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Social Accounts</h1>
        <p className="text-gray-700">Manage your connected social media accounts here.</p>
      </div>
    </main>
=======
import { useCallback, useEffect, useMemo, useState } from "react";

// Confetti burst effect
function fireConfetti() {
  if (typeof window !== "undefined" && window.confetti) {
    window.confetti({
      particleCount: 100,
      spread: 120,
      origin: { y: 0.6 },
      colors: ["#f0abfc", "#a78bfa", "#f472b6", "#facc15", "#38bdf8", "#fff"],
    });
  }
}
import { authFetch } from "@/lib/auth-fetch";
import { SOCIAL_PLATFORMS, type SocialProvider } from "@/lib/social-platforms";
import { CheckCircle2, CircleDashed, Loader2, RefreshCw, ShieldAlert, Trash2, PlugZap } from "lucide-react";

type SocialAccount = {
  id: string;
  provider: SocialProvider;
  account_name: string;
  handle?: string | null;
  auth_mode?: string | null;
  status?: string | null;
  token_expires_at?: string | null;
  access_token_masked?: string | null;
  refresh_token_masked?: string | null;
  connected_at?: string | null;
  last_validated_at?: string | null;
};

const initialForm = {
  provider: "instagram" as SocialProvider,
  account_name: "",
  handle: "",
  auth_mode: "token",
  access_token: "",
  refresh_token: "",
  token_expires_at: "",
};

export default function SocialBotAccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  const connectedCount = useMemo(
    () => accounts.filter((account) => account.status === "connected").length,
    [accounts]
  );

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await authFetch("/api/social-accounts");
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Failed to load accounts");
        setAccounts([]);
      } else {
        setAccounts(data.accounts || []);
      }
    } catch {
      setMessage("Could not connect to accounts API");
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    // Confetti on load
    if (typeof window !== "undefined" && !window.confetti) {
      import("canvas-confetti").then((mod) => {
        window.confetti = mod.default;
        fireConfetti();
      });
    } else {
      fireConfetti();
    }
    void loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    const provider = searchParams.get("provider");
    const count = searchParams.get("accounts");

    if (error) {
      setMessage(error);
      return;
    }

    if (connected) {
      const providerLabel = provider ? provider.replace(/^\w/, (character) => character.toUpperCase()) : "Account";
      setMessage(
        count
          ? `${providerLabel} connected successfully. Saved ${count} account${count === "1" ? "" : "s"}.`
          : `${providerLabel} connected successfully.`
      );
      void loadAccounts();
    }
  }, [loadAccounts]);

  function connectWithMeta(provider: "facebook" | "instagram") {
    window.location.assign(`/api/social-connect/meta/start?provider=${provider}`);
  }

  const saveAccount = useCallback(async () => {
    setSaving(true);
    setMessage("");

    try {
      const res = await authFetch("/api/social-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to connect account");
        return;
      }

      setForm(initialForm);
      setMessage(`${form.provider} connected successfully`);
      fireConfetti();
      await loadAccounts();
    } catch {
      setMessage("Could not save account connection");
    } finally {
      setSaving(false);
    }
  }, [form, loadAccounts]);

  const removeAccount = useCallback(
    async (id: string) => {
      setMessage("");
      try {
        const res = await authFetch("/api/social-accounts", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        const data = await res.json();
        if (!res.ok) {
          setMessage(data.error || "Failed to disconnect account");
          return;
        }

        setMessage("Account disconnected");
        fireConfetti();
        await loadAccounts();
      } catch {
        setMessage("Could not disconnect account");
      }
    },
    [loadAccounts]
  );

  return (
    <div className="relative mx-auto max-w-7xl space-y-16 px-6 py-20 animate-gradient-bg">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-fuchsia-700 via-violet-700 to-slate-900 animate-gradient-move opacity-80 blur-2xl" />
      <section className="rounded-4xl border-4 border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-900 via-violet-900 to-slate-900 p-14 shadow-2xl animate-pop">
        <p className="text-3xl font-black uppercase tracking-[0.18em] text-fuchsia-300 text-center animate-bounce">Connected Accounts</p>
        <h1 className="mt-8 text-7xl font-black tracking-tight text-white text-center drop-shadow-2xl uppercase animate-pop">Link Your Social Platforms</h1>
        <p className="mt-8 max-w-3xl mx-auto text-3xl leading-10 text-fuchsia-100 font-extrabold text-center animate-bounce-slow">
          Connect Instagram, Facebook, X/Twitter, LinkedIn, TikTok, Threads, YouTube, Pinterest, and Reddit accounts. For live publishing, add the official app credentials or tokens from each platform.
        </p>
      </section>

      <section className="mb-16 rounded-4xl border-4 border-fuchsia-400/40 bg-slate-900/80 p-14 shadow-2xl animate-pop">
        <h2 className="text-4xl font-black text-fuchsia-200 mb-6 uppercase tracking-tight">Connection Tips</h2>
        <ul className="list-disc list-inside text-2xl text-fuchsia-100 font-extrabold space-y-3 text-left mx-auto max-w-2xl animate-bounce-slow">
          <li>Use Meta OAuth for Facebook and Instagram for the fastest setup.</li>
          <li>Tokens and OAuth credentials are required for live publishing.</li>
          <li>Connect all platforms to unlock full automation.</li>
          <li>Reset the form to quickly add multiple accounts.</li>
          <li>All credentials are stored securely.</li>
        </ul>
      </section>

      <section className="grid gap-10 md:grid-cols-3">
        <div className="rounded-4xl border-4 border-fuchsia-400/40 bg-slate-900/60 p-10 shadow-2xl animate-pop">
          <p className="text-2xl uppercase tracking-[0.14em] text-fuchsia-300 font-black">Connected</p>
          <p className="mt-6 text-4xl font-black text-white">{connectedCount}</p>
        </div>
        <div className="rounded-4xl border-4 border-fuchsia-400/40 bg-slate-900/60 p-10 shadow-2xl animate-pop">
          <p className="text-2xl uppercase tracking-[0.14em] text-fuchsia-300 font-black">Saved</p>
          <p className="mt-6 text-4xl font-black text-white">{accounts.length}</p>
        </div>
        <div className="rounded-4xl border-4 border-fuchsia-400/40 bg-slate-900/60 p-10 shadow-2xl animate-pop">
          <p className="text-2xl uppercase tracking-[0.14em] text-fuchsia-300 font-black">Mode</p>
          <p className="mt-6 text-4xl font-black text-white">OAuth + Token</p>
        </div>
      </section>

      <section className="rounded-4xl border-4 border-fuchsia-400/40 bg-slate-900/80 p-14 shadow-2xl animate-pop">
        <div className="flex flex-wrap items-center justify-between gap-10 mb-12">
          <div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tight animate-pop">Connect a new account</h2>
            <p className="text-2xl text-fuchsia-100 font-extrabold animate-bounce-slow">Use a platform token or OAuth-backed credentials.</p>
          </div>
          <button
            onClick={loadAccounts}
            className="inline-flex items-center gap-4 rounded-3xl border-4 border-white/20 bg-white/10 px-12 py-6 text-2xl font-black text-slate-200 shadow-2xl hover:bg-white/20 animate-pop"
          >
            <RefreshCw className="h-8 w-8" />
            Refresh
          </button>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-10 rounded-3xl border-4 border-blue-500/40 bg-blue-500/10 px-10 py-8 shadow-2xl animate-pop">
          <div>
            <p className="text-2xl font-black text-white">Meta OAuth is ready for Facebook and Instagram.</p>
            <p className="text-xl text-slate-300">
              Click once, approve access, and the connected page accounts will appear automatically.
              You just need <span className="font-black">META_APP_ID</span> and <span className="font-black">META_APP_SECRET</span> configured in the environment.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* ...existing code for connect buttons... */}
            <button type="button" onClick={() => connectWithMeta("facebook")} className="rounded-xl bg-blue-600 px-6 py-3 text-2xl font-black text-white hover:bg-blue-700 animate-pop">Connect Facebook</button>
            <button type="button" onClick={() => connectWithMeta("instagram")} className="rounded-xl bg-pink-600 px-6 py-3 text-2xl font-black text-white hover:bg-pink-700 animate-pop">Connect Instagram</button>
            <button type="button" onClick={() => window.location.assign("/api/social-connect/linkedin/start")} className="rounded-xl bg-sky-700 px-6 py-3 text-2xl font-black text-white hover:bg-sky-800 animate-pop">Connect LinkedIn</button>
            <button type="button" onClick={() => window.location.assign("/api/social-connect/x/start")} className="rounded-xl bg-slate-800 px-6 py-3 text-2xl font-black text-white hover:bg-slate-700 animate-pop">Connect X / Twitter</button>
            <button type="button" onClick={() => window.location.assign("/api/social-connect/youtube/start")} className="rounded-xl bg-red-700 px-6 py-3 text-2xl font-black text-white hover:bg-red-800 animate-pop">Connect YouTube</button>
            <button type="button" onClick={() => window.location.assign("/api/social-connect/pinterest/start")} className="rounded-xl bg-rose-600 px-6 py-3 text-2xl font-black text-white hover:bg-rose-700 animate-pop">Connect Pinterest</button>
            <button type="button" onClick={() => window.location.assign("/api/social-connect/tiktok/start")} className="rounded-xl bg-black px-6 py-3 text-2xl font-black text-white hover:bg-slate-800 animate-pop">Connect TikTok</button>
            <button type="button" onClick={() => window.location.assign("/api/social-connect/threads/start")} className="rounded-xl bg-black px-6 py-3 text-2xl font-black text-white hover:bg-slate-800 animate-pop">Connect Threads</button>
            <button type="button" onClick={() => window.location.assign("/api/social-connect/reddit/start?subreddit=resumevaultgod")} className="rounded-xl bg-orange-600 px-6 py-3 text-2xl font-black text-white hover:bg-orange-700 animate-pop">Connect Reddit</button>
          </div>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-2 xl:grid-cols-3">
          {SOCIAL_PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setForm((prev) => ({ ...prev, provider: platform.id }))}
              className={`rounded-3xl border-4 p-8 text-left text-2xl font-black transition animate-pop ${
                form.provider === platform.id
                  ? "border-violet-500/60 bg-violet-500/20"
                  : "border-white/10 bg-slate-950/80 hover:border-violet-500/30"
              }`}
            >
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-2xl font-black text-white">{platform.label}</p>
                  <p className="mt-2 text-xl text-slate-400">{platform.description}</p>
                </div>
                <span className={`rounded-full bg-gradient-to-br ${platform.accent} px-5 py-2 text-2xl font-black text-white animate-pop`}>
                  {platform.shortLabel}
                </span>
              </div>
              <p className="mt-4 text-xl leading-7 text-slate-500">{platform.connectHint}</p>
            </button>
          ))}
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-2">
          <label className="space-y-3">
            <span className="text-2xl font-black text-slate-300">Account name</span>
            <input
              value={form.account_name}
              onChange={(e) => setForm((prev) => ({ ...prev, account_name: e.target.value }))}
              placeholder="ResumeVault Social"
              className="w-full rounded-2xl border-2 border-white/20 bg-slate-950 px-6 py-4 text-2xl font-black text-white outline-none ring-0 placeholder:text-slate-500"
            />
          </label>
          <label className="space-y-3">
            <span className="text-2xl font-black text-slate-300">Handle / page</span>
            <input
              value={form.handle}
              onChange={(e) => setForm((prev) => ({ ...prev, handle: e.target.value }))}
              placeholder="@resumevaultgod"
              className="w-full rounded-2xl border-2 border-white/20 bg-slate-950 px-6 py-4 text-2xl font-black text-white outline-none ring-0 placeholder:text-slate-500"
            />
          </label>
          <label className="space-y-3">
            <span className="text-2xl font-black text-slate-300">Auth mode</span>
            <select
              value={form.auth_mode}
              onChange={(e) => setForm((prev) => ({ ...prev, auth_mode: e.target.value }))}
              className="w-full rounded-2xl border-2 border-white/20 bg-slate-950 px-6 py-4 text-2xl font-black text-white outline-none ring-0"
            >
              <option value="token">Token</option>
              <option value="oauth">OAuth</option>
              <option value="manual">Manual</option>
            </select>
          </label>
          <label className="space-y-3">
            <span className="text-2xl font-black text-slate-300">Token expires at</span>
            <input
              value={form.token_expires_at}
              onChange={(e) => setForm((prev) => ({ ...prev, token_expires_at: e.target.value }))}
              type="datetime-local"
              className="w-full rounded-2xl border-2 border-white/20 bg-slate-950 px-6 py-4 text-2xl font-black text-white outline-none ring-0"
            />
          </label>
          <label className="space-y-3 md:col-span-2">
            <span className="text-2xl font-black text-slate-300">Access token</span>
            <textarea
              value={form.access_token}
              onChange={(e) => setForm((prev) => ({ ...prev, access_token: e.target.value }))}
              placeholder="Paste access token or OAuth session token"
              className="min-h-28 w-full rounded-2xl border-2 border-white/20 bg-slate-950 px-6 py-4 text-2xl font-black text-white outline-none ring-0 placeholder:text-slate-500"
            />
          </label>
          <label className="space-y-3 md:col-span-2">
            <span className="text-2xl font-black text-slate-300">Refresh token</span>
            <textarea
              value={form.refresh_token}
              onChange={(e) => setForm((prev) => ({ ...prev, refresh_token: e.target.value }))}
              placeholder="Paste refresh token if the platform provides one"
              className="min-h-24 w-full rounded-2xl border-2 border-white/20 bg-slate-950 px-6 py-4 text-2xl font-black text-white outline-none ring-0 placeholder:text-slate-500"
            />
          </label>
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-6">
          <button
            onClick={saveAccount}
            disabled={saving}
            className="inline-flex items-center gap-4 rounded-3xl bg-violet-600 px-12 py-6 text-2xl font-black text-white shadow-2xl hover:bg-violet-700 disabled:opacity-50 animate-pop"
          >
            {saving ? <Loader2 className="h-8 w-8 animate-spin" /> : <PlugZap className="h-8 w-8" />}
            Connect Account
          </button>
          <button
            onClick={() => setForm(initialForm)}
            className="inline-flex items-center gap-4 rounded-3xl border-4 border-white/20 bg-white/10 px-12 py-6 text-2xl font-black text-slate-200 shadow-2xl hover:bg-white/20 animate-pop"
          >
            Reset
          </button>
          <div className="inline-flex items-center gap-4 rounded-3xl border-4 border-amber-500/40 bg-amber-500/10 px-12 py-6 text-2xl font-black text-amber-100 shadow-2xl animate-pop">
            <ShieldAlert className="h-8 w-8" />
            Real publishing depends on valid platform credentials.
          </div>
        </div>

        {message ? <p className="mt-10 text-2xl text-fuchsia-100 font-extrabold animate-pop">{message}</p> : null}
      </section>

      <section className="rounded-4xl border-4 border-fuchsia-400/40 bg-slate-900/80 p-14 shadow-2xl animate-pop">
        <h2 className="text-4xl font-black text-white uppercase tracking-tight">Connected accounts</h2>
        <p className="mt-6 text-2xl text-fuchsia-100 font-extrabold">These are the accounts the bot can use when publishing.</p>

        {loading ? (
          <div className="py-32 text-center">
            <Loader2 className="mx-auto mb-8 h-16 w-16 animate-spin text-fuchsia-300" />
            <p className="text-3xl text-fuchsia-100 font-extrabold">Loading connected accounts...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="mt-16 rounded-4xl border-4 border-dashed border-white/20 bg-slate-950/80 p-16 text-center animate-pop">
            <CircleDashed className="mx-auto h-16 w-16 text-slate-500" />
            <p className="mt-8 text-3xl font-black text-white">No accounts connected yet</p>
            <p className="mt-4 text-2xl text-fuchsia-100 font-extrabold">Connect a provider above to unlock publishing and testing.</p>
          </div>
        ) : (
          <div className="mt-16 grid gap-12 md:grid-cols-2 xl:grid-cols-3">
            {accounts.map((account) => {
              const platform = SOCIAL_PLATFORMS.find((item) => item.id === account.provider);
              return (
                <article key={account.id} className="rounded-4xl border-4 border-fuchsia-400/40 bg-slate-950/80 p-10 shadow-2xl flex flex-col h-full animate-pop">
                  <div className="flex items-center justify-between gap-6">
                    <div>
                      <p className="text-3xl font-black text-white uppercase tracking-tight">{platform?.label || account.provider}</p>
                      <p className="text-2xl text-fuchsia-100 font-extrabold">{account.account_name}</p>
                    </div>
                    <span
                      className={`rounded-full px-6 py-3 text-2xl font-black ${
                        account.status === "connected"
                          ? "bg-emerald-500/15 text-emerald-200"
                          : "bg-amber-500/15 text-amber-200"
                      } animate-pop`}
                    >
                      {account.status || "pending"}
                    </span>
                  </div>

                  <div className="mt-8 space-y-3 text-2xl text-fuchsia-100 font-extrabold animate-bounce-slow">
                    <p>Handle: {account.handle || "—"}</p>
                    <p>Auth mode: {account.auth_mode || "token"}</p>
                    <p>Access token: {account.access_token_masked || "—"}</p>
                    <p>Refresh token: {account.refresh_token_masked || "—"}</p>
                  </div>

                  <div className="mt-10 flex items-center gap-6">
                    <button
                      onClick={() => removeAccount(account.id)}
                      className="inline-flex flex-1 items-center justify-center gap-4 rounded-3xl border-4 border-rose-500/40 bg-rose-500/10 px-12 py-6 text-2xl font-black text-rose-100 hover:bg-rose-500/15 animate-pop"
                    >
                      <Trash2 className="h-8 w-8" />
                      Disconnect
                    </button>
                    <div className="inline-flex items-center gap-4 rounded-3xl border-4 border-white/20 px-12 py-6 text-2xl font-black text-fuchsia-100 animate-pop">
                      <CheckCircle2 className="h-8 w-8 text-emerald-300" />
                      Ready
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      <div className="fixed left-0 right-0 bottom-0 h-32 pointer-events-none z-50">
        {/* Extra animated gradient glow at the bottom */}
        <div className="absolute left-1/2 -translate-x-1/2 w-2/3 h-32 bg-gradient-to-r from-fuchsia-400/30 via-violet-400/30 to-fuchsia-400/30 blur-2xl animate-gradient-move" />
      </div>
    </div>
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
  );
}
