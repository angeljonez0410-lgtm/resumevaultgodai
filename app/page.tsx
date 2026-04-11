import Link from "next/link";
import { Sparkles, Zap, FileText, Search, Mail, Star, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1e2d42] to-[#0f1a2a]">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-12">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <Zap className="w-4 h-4" /> God-Mode Your Job Hunt
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Beat the ATS in<br />
            <span style={{ color: "#f4c542" }}>60 Seconds</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            AI-powered resume builder, job analyzer, cover letter generator, and interview coach — everything you need to land your dream job.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-8 py-3.5 rounded-xl text-lg flex items-center gap-2 transition shadow-lg">
              <Sparkles className="w-5 h-5" /> Get Started Free
            </Link>
            <Link href="/app" className="text-white/80 hover:text-white font-medium flex items-center gap-1 transition">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-12 mt-16 mb-16">
          {[
            { value: "10,000+", label: "Resumes Built" },
            { value: "98%", label: "Avg ATS Score" },
            { value: "4.9/5", label: "User Rating" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold" style={{ color: "#f4c542" }}>{s.value}</p>
              <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Search, title: "Job Analyzer", desc: "Extract ATS keywords from any job posting" },
            { icon: FileText, title: "Resume Builder", desc: "98-100% ATS-optimized resume in seconds" },
            { icon: Mail, title: "Cover Letter", desc: "Tailored cover letters for every application" },
            { icon: Star, title: "Interview Coach", desc: "AI mock interviews with real-time feedback" },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-white font-semibold mb-1">{f.title}</h3>
                <p className="text-white/50 text-sm">{f.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pb-8">
          <p className="text-white/30 text-xs">
            © 2025 ResumevaultGodAI. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
