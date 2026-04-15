type FormatInput = {
  topic: string;
  caption?: string | null;
};

export function formatInstagramCaption({ topic, caption }: FormatInput) {
  const base = caption?.trim() || topic;

  return `${base}

Save this for later and follow ResumeVault for more career growth content.

#ResumeTips #JobSearch #CareerGrowth #ResumeVault #InterviewTips #LinkedInTips`;
}

export function formatTwitterCaption({ topic, caption }: FormatInput) {
  const base = caption?.trim() || topic;
  const shortBase = base.length > 220 ? `${base.slice(0, 220)}...` : base;

  return `${shortBase}

#ResumeVault #JobSearch #CareerTips`;
}

export function formatLinkedInCaption({ topic, caption }: FormatInput) {
  const base = caption?.trim() || topic;

  return `${base}

What's one thing job seekers should stop doing immediately?

Follow ResumeVault for practical AI-powered career tools and advice.

#Careers #JobSearch #ResumeWriting #ProfessionalDevelopment`;
}

export function formatTikTokCaption({ topic, caption }: FormatInput) {
  const base = caption?.trim() || topic;
  const shortBase = base.length > 140 ? `${base.slice(0, 140)}...` : base;

  return `${shortBase}

#ResumeVault #CareerTok #JobSearch #ResumeTips`;
}

export function formatCaptionForPlatform(post: {
  platform: string;
  topic: string;
  caption?: string | null;
}) {
  switch (post.platform) {
    case "instagram":
      return formatInstagramCaption(post);
    case "twitter":
      return formatTwitterCaption(post);
    case "linkedin":
      return formatLinkedInCaption(post);
    case "tiktok":
      return formatTikTokCaption(post);
    case "reddit":
    case "threads":
      return post.caption?.trim() || post.topic;
    default:
      return post.caption?.trim() || post.topic;
  }
}