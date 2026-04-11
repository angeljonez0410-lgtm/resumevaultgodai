"use client";

import { useState, useEffect, useCallback } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { Users, Search, Coins, RefreshCw, Save, Loader2 } from "lucide-react";

interface UserProfile {
  user_id: string;
  email?: string;
  full_name?: string;
  credits?: number;
  role?: string;
  stripe_customer_id?: string;
  created_at?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editCredits, setEditCredits] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load users");
      } else {
        setUsers(data.users || []);
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await authFetch("/api/admin/users");
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || "Failed to load users");
        } else {
          setUsers(data.users || []);
        }
      } catch {
        if (!cancelled) setError("Network error");
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSaveCredits = async (userId: string) => {
    setSaving(true);
    try {
      const res = await authFetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, credits: editCredits }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.user_id === userId ? { ...u, credits: editCredits } : u))
        );
        setEditingUser(null);
      }
    } catch {
      /* ignore */
    }
    setSaving(false);
  };

  const filtered = users.filter(
    (u) =>
      !search ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#f4c542]" /> Admin Users
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage all registered users, credits, and roles
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e2d42] text-white rounded-xl text-sm font-medium hover:bg-[#2a3f5f] transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or name..."
          className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f4c542] bg-white"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{users.length}</p>
          <p className="text-xs text-slate-500">Total Users</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">
            {users.filter((u) => (u.credits || 0) > 0).length}
          </p>
          <p className="text-xs text-slate-500">With Credits</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">
            {users.reduce((sum, u) => sum + (u.credits || 0), 0)}
          </p>
          <p className="text-xs text-slate-500">Total Credits</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {users.filter((u) => u.stripe_customer_id).length}
          </p>
          <p className="text-xs text-slate-500">Stripe Customers</p>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#f4c542] mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading users...</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Credits</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Stripe</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Joined</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.user_id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{user.full_name || "—"}</p>
                      <p className="text-xs text-slate-500">{user.email || user.user_id.slice(0, 8)}</p>
                    </td>
                    <td className="px-4 py-3">
                      {editingUser === user.user_id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editCredits}
                            onChange={(e) => setEditCredits(parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-slate-300 rounded-lg text-sm"
                          />
                          <button
                            onClick={() => handleSaveCredits(user.user_id)}
                            disabled={saving}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Coins className="w-4 h-4 text-amber-500" />
                          <span className="font-semibold">{user.credits || 0}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.stripe_customer_id ? (
                        <span className="text-xs text-emerald-600 font-medium">Connected</span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setEditingUser(user.user_id);
                          setEditCredits(user.credits || 0);
                        }}
                        className="text-xs text-[#1e2d42] font-semibold hover:underline"
                      >
                        Edit Credits
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      {search ? "No users match your search" : "No users found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
