import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://resumevaultgod.com"),
  title: "ResumeVaultGodAi",
  description:
    "Your intelligent career companion for tailored job applications, ATS optimization, and professional communication.",
  manifest: "/manifest.json",
  icons: {
    icon: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69af54761a15057b4bb02193/f276f462a_logo.png",
    apple:
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69af54761a15057b4bb02193/f276f462a_logo.png",
  },
  openGraph: {
    title: "ResumeVaultGodAi",
    description:
      "Your intelligent career companion for tailored job applications, ATS optimization, and professional communication.",
    url: "https://resumevaultgod.com",
    siteName: "ResumeVaultGodAi",
    type: "website",
    images: [
      {
        url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/render/image/public/base44-prod/public/69af54761a15057b4bb02193/f276f462a_logo.png?width=1200&height=630&resize=contain",
        width: 1200,
        height: 630,
        alt: "ResumeVaultGodAi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeVaultGodAi",
    description:
      "Your intelligent career companion for tailored job applications, ATS optimization, and professional communication.",
    images: [
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/render/image/public/base44-prod/public/69af54761a15057b4bb02193/f276f462a_logo.png?width=1200&height=630&resize=contain",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
