"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { authFetch } from "@/lib/auth-fetch";
import { Zap, Star, Crown, Loader2, Coins, FileText, Mic, Send } from "lucide-react";

const creditPacks: Array<{
  credits: number; price: string; priceNum: number; perCredit: string;
  popular: boolean; stripePrice: string;
}> = [
  { credits: 50, price: "$9.99", priceNum: 9.99, perCredit: "$0.20", popular: false, stripePrice: "credits_50" },
  { credits: 150, price: "$24.99", priceNum: 24.99, perCredit: "$0.17", popular: true, stripePrice: "credits_150" },
  { credits: 400, price: "$59.99", priceNum: 59.99, perCredit: "$0.15", popular: false, stripePrice: "credits_400" },
  { credits: 1000, price: "$129.99", priceNum: 129.99, perCredit: "$0.13", popular: false, stripePrice: "credits_1000" },
];

const usageExamples = [
  { icon: FileText, name: "AI Resume Generation", cost: "2 credits", desc: "ATS-optimized resume tailored to any job" },
  { icon: Mic, name: "Mock Interview Session", cost: "3 credits", desc: "Full AI interview with feedback" },
  { icon: Send, name: "Auto-Apply (per app)", cost: "1 credit", desc: "Automated job application submission" },
  { icon: FileText, name: "Cover Letter", cost: "1 credit", desc: "Personalized cover letter generation" },
  { icon: Star, name: "Career Roadmap", cost: "2 credits", desc: "Customized career progression plan" },
  { icon: Zap, name: "Salary Negotiation Script", cost: "1 credit", desc: "Data-backed negotiation talking points" },
];

const testimonials = [
  { name: "Sarah K.", role: "Product Manager", text: "Got 3 interviews in my first week using the Resume Builder. The ATS optimization is incredible.", stars: 5 },
  { name: "Marcus J.", role: "Software Engineer", text: "The Mock Interview feature helped me ace my Google interview. Worth every penny.", stars: 5 },
  { name: "Lisa T.", role: "Marketing Director", text: "Auto Apply saved me 20+ hours a week. I landed my dream job in 3 weeks.", stars: 5 },
];

export default function PricingPage() {
  return (
    <Suspense>
      <PricingContent />
    </Suspense>
  );
}

function PricingContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (stripePrice: string | null) => {
    if (!stripePrice) return;
    setLoadingPlan(stripePrice);
    try {
      const res = await authFetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: stripePrice }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_self");
      }
    } catch { /* ignore */ }
    setLoadingPlan(null);
  };

  return (
    <div>
      {/* Success/Cancel banners */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 text-center">
          <p className="text-emerald-800 font-semibold">🎉 Credits added to your account! Start using your AI tools now.</p>
        </div>
      )}
      {canceled && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-center">
          <p className="text-amber-800">Checkout was canceled. No charges were made.</p>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold mb-4">
          <Coins className="w-3 h-3" /> Pay As You Go
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Buy Credits</h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          Purchase credits and use them across all AI tools — resumes, interviews, applications, and more.
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex justify-center gap-8 mb-12 text-center">
        {[
          { value: "10,000+", label: "Resumes Generated" },
          { value: "98%", label: "Avg ATS Score" },
          { value: "4.9/5", label: "User Rating" },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Credit Packs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 max-w-5xl mx-auto">
        {creditPacks.map((pack) => (
          <div
            key={pack.credits}
            className={`card p-6 relative ${pack.popular ? "ring-2 ring-amber-400 shadow-lg scale-[1.02]" : ""}`}
          >
            {pack.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" /> Best Value
              </div>
            )}
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 mb-3">
                <Coins className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">{pack.credits} Credits</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-slate-900">{pack.price}</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">{pack.perCredit} per credit</p>
            </div>
            <button
              onClick={() => handleCheckout(pack.stripePrice)}
              disabled={loadingPlan === pack.stripePrice}
              className={`w-full py-2.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${
                pack.popular
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                  : "bg-[#1e2d42] text-white hover:bg-[#2a3f5f]"
              }`}
            >
              {loadingPlan === pack.stripePrice ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting...</>
              ) : (
                <>Buy {pack.credits} Credits</>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Credit Usage Examples */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-xl font-bold text-slate-800 text-center mb-2">How Credits Work</h2>
        <p className="text-sm text-slate-500 text-center mb-8">Each AI action uses credits. Here&apos;s what you can do:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {usageExamples.map((ex) => {
            const Icon = ex.icon;
            return (
              <div key={ex.name} className="card p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{ex.name}</p>
                  <p className="text-xs text-slate-500">{ex.desc}</p>
                  <p className="text-xs font-bold text-amber-600 mt-1">{ex.cost}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-slate-800 text-center mb-8">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="card p-5">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">&ldquo;{t.text}&rdquo;</p>
              <p className="text-sm font-semibold text-slate-800">{t.name}</p>
              <p className="text-xs text-slate-500">{t.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
