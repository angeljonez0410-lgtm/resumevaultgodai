import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.resumevaultgod.com";
const appName = "ResumeVaultGodAi";
const appDescription =
  "Your intelligent career companion for tailored job applications, ATS optimization, and professional communication.";
const logoUrl =
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69af54761a15057b4bb02193/f276f462a_logo.png";
const socialImageUrl =
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/render/image/public/base44-prod/public/69af54761a15057b4bb02193/f276f462a_logo.png?width=1200&height=630&resize=contain";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: appName,
  description: appDescription,
  manifest: "/manifest.json",
  icons: {
    icon: logoUrl,
    apple: logoUrl,
  },
  openGraph: {
    title: appName,
    description: appDescription,
    url: appUrl,
    siteName: appName,
    type: "website",
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: appName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
    description: appDescription,
    images: [socialImageUrl],
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
