

import AppShell from "@/components/AppShell";
import AIAssistant from "@/components/AIAssistant";

export const metadata = {
  title: "ResumeVaultGodAI | God-Mode Job Hunt",
  description: "Beat the ATS in 60 seconds with resumes, auto apply, job analysis, tracking, analytics, and AI career support.",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      {children}
      <AIAssistant />
    </AppShell>
  );
}
