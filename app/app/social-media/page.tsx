import { Share2 } from "lucide-react";
import InfluencerStudioPage from "@/components/InfluencerStudioPage";

export default function SocialMediaPage() {
  return (
    <InfluencerStudioPage
      title="Social Media"
      eyebrow="Distribution"
      description="Plan captions, hooks, posting angles, and platform-specific content for your AI influencer campaigns."
      icon={Share2}
      gradient="from-violet-500 to-fuchsia-500"
      actions={[
        { label: "Caption Pack", description: "Create caption options, hashtags, and calls to action.", href: "/AIAssistant" },
        { label: "Schedule Posts", description: "Open the posting queue and plan content timing.", href: "/app/social-bot/posts" },
        { label: "Analytics", description: "Review campaign performance and engagement signals.", href: "/app/analytics" },
      ]}
    />
  );
}
