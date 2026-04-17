"use client";

import { useState, useEffect } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { MessageSquare, Star, Send } from "lucide-react";

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const res = await authFetch("/api/reviews");
      if (res.ok) setReviews(await res.json());
    } catch { /* ignore */ }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch("/api/reviews");
        if (res.ok && !cancelled) setReviews(await res.json());
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const submit = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    await authFetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_name: name || "Anonymous", rating, comment }),
    });
    setComment("");
    setName("");
    setRating(5);
    setSubmitting(false);
    load();
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reviews</h1>
          <p className="text-sm text-slate-500">See what others think &amp; share your experience</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-8">
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold text-slate-900">{avgRating}</p>
          <div className="flex gap-0.5 justify-center my-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-4 h-4 ${s <= Math.round(Number(avgRating)) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
            ))}
          </div>
          <p className="text-xs text-slate-500">{reviews.length} reviews</p>
        </div>
      </div>

      {/* Submit Review */}
      <div className="card p-6 mb-8">
        <h3 className="font-semibold text-slate-700 mb-4">Leave a Review</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">Your Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div>
            <label className="label">Rating</label>
            <div className="flex gap-1 pt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)}>
                  <Star className={`w-6 h-6 cursor-pointer transition ${s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300 hover:text-amber-300"}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label className="label">Your Review</label>
          <textarea className="input min-h-[100px] resize-y" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." />
        </div>
        <button onClick={submit} disabled={!comment.trim() || submitting} className="btn-primary gap-2 disabled:opacity-50">
          <Send className="w-4 h-4" /> {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                  {r.user_name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{r.user_name}</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
