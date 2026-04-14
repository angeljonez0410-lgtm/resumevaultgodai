import { Wand2 } from "lucide-react";
import InfluencerStudioPage from "@/components/InfluencerStudioPage";
import GenerationStudio from "@/components/GenerationStudio";

export default function QuickGeneratePage() {
  return (
    <>
      <InfluencerStudioPage
        title="Quick Generate"
        eyebrow="Scene Templates"
        description="Create AI images and videos instantly from a prompt, with optional character details for consistency."
        icon={Wand2}
        gradient="from-cyan-500 to-blue-600"
        actions={[
          { label: "Prompt Optimizer", description: "Clean up rough ideas into production-ready prompt language.", href: "/AIAssistant" },
          { label: "Create Video", description: "Move generated assets into a video project.", href: "/app/create-video" },
          { label: "Social Media", description: "Convert output into a post and schedule it.", href: "/app/social-media" },
        ]}
      />
      <div className="mx-auto max-w-7xl px-5 pb-10 sm:px-6 lg:px-10">
        <GenerationStudio />
      </div>
    </>
  );
}
