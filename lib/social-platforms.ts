export type SocialProvider =
  | "instagram"
  | "facebook"
  | "twitter"
  | "linkedin"
  | "tiktok"
  | "threads"
  | "youtube"
  | "pinterest"
  | "reddit";

export type SocialPlatformConfig = {
  id: SocialProvider;
  label: string;
  shortLabel: string;
  description: string;
  connectHint: string;
  publishHint: string;
  accent: string;
};

export const SOCIAL_PLATFORMS: SocialPlatformConfig[] = [
  {
    id: "instagram",
    label: "Instagram",
    shortLabel: "IG",
    description: "Reels, carousels, stories, and feed posts.",
    connectHint: "Use Meta OAuth to connect a business account or page token.",
    publishHint: "Best for visuals, carousels, and short-form creator content.",
    accent: "from-pink-500 to-rose-500",
  },
  {
    id: "facebook",
    label: "Facebook",
    shortLabel: "FB",
    description: "Pages, groups, and community updates.",
    connectHint: "Use Meta OAuth to connect a Facebook Page for direct posting.",
    publishHint: "Best for community announcements and brand updates.",
    accent: "from-blue-500 to-cyan-500",
  },
  {
    id: "twitter",
    label: "X / Twitter",
    shortLabel: "X",
    description: "Threads, punchy takes, and fast updates.",
    connectHint: "Use X OAuth to connect a posting account.",
    publishHint: "Best for concise hooks and conversation starters.",
    accent: "from-slate-700 to-slate-900",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    shortLabel: "IN",
    description: "Professional updates, thought leadership, and long-form posts.",
    connectHint: "Use LinkedIn OAuth to connect a member account for posting.",
    publishHint: "Best for B2B content, career advice, and authority building.",
    accent: "from-sky-600 to-blue-700",
  },
  {
    id: "tiktok",
    label: "TikTok",
    shortLabel: "TT",
    description: "Short-form video ideas and creator-style posts.",
    connectHint: "Use TikTok OAuth to connect a creator account for direct publishing.",
    publishHint: "Best for high-energy video concepts and hooks.",
    accent: "from-fuchsia-500 to-violet-600",
  },
  {
    id: "threads",
    label: "Threads",
    shortLabel: "TH",
    description: "Conversational posts and daily brand voice.",
    connectHint: "Connect a Threads token or Meta session.",
    publishHint: "Best for conversational text-first content.",
    accent: "from-purple-500 to-fuchsia-500",
  },
  {
    id: "youtube",
    label: "YouTube",
    shortLabel: "YT",
    description: "Long-form videos, Shorts, and community posts.",
    connectHint: "Use Google OAuth to connect a YouTube channel for uploads.",
    publishHint: "Best for tutorials, product walkthroughs, and Shorts.",
    accent: "from-red-500 to-orange-500",
  },
  {
    id: "pinterest",
    label: "Pinterest",
    shortLabel: "PT",
    description: "Pins, guides, and evergreen discovery content.",
    connectHint: "Use Pinterest OAuth to connect boards for pin publishing.",
    publishHint: "Best for evergreen traffic and visual discovery.",
    accent: "from-red-400 to-rose-500",
  },
  {
    id: "reddit",
    label: "Reddit",
    shortLabel: "RD",
    description: "Community posts, discussion threads, and AMA-style content.",
    connectHint: "Use Reddit OAuth to connect a subreddit posting account.",
    publishHint: "Best for community education and discussion starters.",
    accent: "from-orange-500 to-amber-600",
  },
];

export function getSocialPlatform(provider: string) {
  return SOCIAL_PLATFORMS.find((platform) => platform.id === provider);
}

export function isSocialProvider(provider: string): provider is SocialProvider {
  return SOCIAL_PLATFORMS.some((platform) => platform.id === provider);
}
