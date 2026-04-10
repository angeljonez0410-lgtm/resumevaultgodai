import { getSupabaseAdmin } from "./supabase-admin";
import { formatCaptionForPlatform } from "./formatters";

type PublishResult = {
  success: boolean;
  externalPostId?: string;
  error?: string;
  finalCaption?: string;
};

async function publishToInstagram(post: any): Promise<PublishResult> {
  const finalCaption = formatCaptionForPlatform(post);

  return {
    success: true,
    externalPostId: `instagram_${post.id}`,
    finalCaption,
  };
}

async function publishToTwitter(post: any): Promise<PublishResult> {
  const finalCaption = formatCaptionForPlatform(post);

  return {
    success: true,
    externalPostId: `twitter_${post.id}`,
    finalCaption,
  };
}

async function publishToLinkedIn(post: any): Promise<PublishResult> {
  const finalCaption = formatCaptionForPlatform(post);

  return {
    success: true,
    externalPostId: `linkedin_${post.id}`,
    finalCaption,
  };
}

async function publishToTikTok(post: any): Promise<PublishResult> {
  const finalCaption = formatCaptionForPlatform(post);

  return {
    success: true,
    externalPostId: `tiktok_${post.id}`,
    finalCaption,
  };
}

async function publishToReddit(post: any): Promise<PublishResult> {
  const finalCaption = formatCaptionForPlatform(post);

  return {
    success: true,
    externalPostId: `reddit_${post.id}`,
    finalCaption,
  };
}

async function publishToThreads(post: any): Promise<PublishResult> {
  const finalCaption = formatCaptionForPlatform(post);

  return {
    success: true,
    externalPostId: `threads_${post.id}`,
    finalCaption,
  };
}

async function publishPost(post: any): Promise<PublishResult> {
  switch (post.platform) {
    case "instagram":
      return publishToInstagram(post);
    case "twitter":
      return publishToTwitter(post);
    case "linkedin":
      return publishToLinkedIn(post);
    case "tiktok":
      return publishToTikTok(post);
    case "reddit":
      return publishToReddit(post);
    case "threads":
      return publishToThreads(post);
    default:
      return {
        success: false,
        error: `Unsupported platform: ${post.platform}`,
      };
  }
}

export async function runScheduledPublishing() {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data: duePosts, error } = await supabase
    .from("social_posts")
    .select("*")
    .eq("status", "scheduled")
    .lte("scheduled_time", now)
    .order("scheduled_time", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const results = [];

  for (const post of duePosts || []) {
    try {
      const result = await publishPost(post);

      if (result.success) {
        await supabase
          .from("social_posts")
          .update({
            status: "posted",
            published_at: new Date().toISOString(),
            external_post_id: result.externalPostId || null,
            publish_error: null,
          })
          .eq("id", post.id);

        await supabase.from("social_logs").insert({
          action: "Published scheduled post",
          result: `Post ${post.id} published to ${post.platform}. Caption: ${result.finalCaption || ""}`,
        });

        results.push({
          id: post.id,
          success: true,
          platform: post.platform,
          finalCaption: result.finalCaption,
        });
      } else {
        await supabase
          .from("social_posts")
          .update({
            status: "failed",
            publish_error: result.error || "Unknown publish error",
          })
          .eq("id", post.id);

        await supabase.from("social_logs").insert({
          action: "Failed scheduled post",
          result: `Post ${post.id} failed: ${result.error || "Unknown error"}`,
        });

        results.push({
          id: post.id,
          success: false,
          platform: post.platform,
          error: result.error,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown publish exception";

      await supabase
        .from("social_posts")
        .update({
          status: "failed",
          publish_error: message,
        })
        .eq("id", post.id);

      await supabase.from("social_logs").insert({
        action: "Publish exception",
        result: `Post ${post.id} exception: ${message}`,
      });

      results.push({
        id: post.id,
        success: false,
        platform: post.platform,
        error: message,
      });
    }
  }

  return {
    processed: results.length,
    results,
  };
}