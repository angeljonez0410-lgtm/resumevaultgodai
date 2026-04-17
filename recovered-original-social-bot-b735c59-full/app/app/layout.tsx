
import AppShell from "@/components/AppShell";
import AIAssistant from "@/components/AIAssistant";
import { useEffect, useState } from "react";

export const metadata = {
  title: "ResumeVault GodAI",
  description: "Beat the ATS in 60 seconds — God-Mode your job hunt",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userStr = typeof window !== "undefined" ? localStorage.getItem("sb_user") : null;
    let email = null;
    if (userStr) {
      try {
        email = JSON.parse(userStr).email;
      } catch {}
    }
    setIsAdmin(email && ["angeljonez0410@gmail.com"].includes(email.toLowerCase()));
  }, []);

  return (
    <AppShell>
      {children}
      {isAdmin && <AIAssistant />}
    </AppShell>
  );
}
