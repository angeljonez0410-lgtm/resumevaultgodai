import { getSupabaseAdmin } from "./supabase-admin";
import { formatCaptionForPlatform } from "./formatters";
<<<<<<< HEAD
=======
import { createLinkedInPost } from "./linkedin-oauth";
import { createThreadsPost } from "./threads-oauth";
import { submitRedditPost } from "./reddit-oauth";
import { initTikTokVideoPost, resolveTikTokPrivacyLevel } from "./tiktok-oauth";
import { createXTweet } from "./x-oauth";
import { createPinterestPin } from "./pinterest-oauth";
import { uploadYouTubeVideo } from "./youtube-oauth";
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)

type SocialPost = {
  id: string;
  platform: string;
  caption?: string | null;
  topic: string;
<<<<<<< HEAD
  media_url?: string;
=======
  image_url?: string | null;
  media_url?: string;
  tiktok_privacy_level?: string | null;
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
  scheduled_time?: string;
  status?: string;
};

type PublishResult = {
  success: boolean;
  externalPostId?: string;
  error?: string;
  finalCaption?: string;
};

<<<<<<< HEAD
async function publishToInstagram(post: SocialPost): Promise<PublishResult> {
  const finalCaption = formatCaptionForPlatform(post);

  return {
    success: true,
    externalPostId: `instagram_${post.id}`,
=======
type ConnectedAccount = {
  id: string;
  provider: string;
  account_name: string;
  handle?: string | null;
  access_token?: string | null;
  metadata?: Record<string, unknown> | null;
};

const META_GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v20.0";

async function getConnectedAccount(provider: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("provider", provider)
    .eq("status", "connected")
    .order("connected_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as ConnectedAccount | null;
}

async function publishFacebookFeed(pageId: string, pageAccessToken: string, message: string) {
  const response = await fetch(`https://graph.facebook.com/${META_GRAPH_VERSION}/${pageId}/feed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      message,
      access_token: pageAccessToken,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Facebook publish failed");
  }

  return payload as { id?: string };
}

async function publishToInstagram(post: SocialPost): Promise<PublishResult> {
  const account = await getConnectedAccount("instagram");
  if (!account?.access_token) {
    return { success: false, error: "No connected Instagram account found" };
  }

  const instagramBusinessAccount = account.metadata?.instagram_business_account as
    | { id?: string; username?: string }
    | undefined;
  const instagramUserId = instagramBusinessAccount?.id;

  if (!instagramUserId) {
    return { success: false, error: "Instagram account is missing a business account id" };
  }

  if (!post.image_url) {
    return { success: false, error: "Instagram publishing requires an image_url" };
  }

  const finalCaption = formatCaptionForPlatform(post);
  const mediaResponse = await fetch(`https://graph.facebook.com/${META_GRAPH_VERSION}/${instagramUserId}/media`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      image_url: post.image_url,
      caption: finalCaption,
      access_token: account.access_token,
    }),
  });

  const mediaPayload = await mediaResponse.json().catch(() => ({}));
  if (!mediaResponse.ok) {
    throw new Error(mediaPayload?.error?.message || "Instagram media container creation failed");
  }

  const creationId = mediaPayload?.id;
  if (!creationId) {
    return { success: false, error: "Instagram did not return a media container id" };
  }

  const publishResponse = await fetch(
    `https://graph.facebook.com/${META_GRAPH_VERSION}/${instagramUserId}/media_publish`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        creation_id: creationId,
        access_token: account.access_token,
      }),
    }
  );

  const publishPayload = await publishResponse.json().catch(() => ({}));
  if (!publishResponse.ok) {
    throw new Error(publishPayload?.error?.message || "Instagram publish failed");
  }

  return {
    success: true,
    externalPostId: publishPayload?.id || `instagram_${post.id}`,
    finalCaption,
  };
}

async function publishToFacebook(post: SocialPost): Promise<PublishResult> {
  const account = await getConnectedAccount("facebook");
  if (!account?.access_token) {
    return { success: false, error: "No connected Facebook Page account found" };
  }

  const pageId = String(account.metadata?.page_id || account.handle || "");
  if (!pageId) {
    return { success: false, error: "Facebook account is missing a page id" };
  }

  const finalCaption = formatCaptionForPlatform(post);
  const result = await publishFacebookFeed(pageId, account.access_token, finalCaption);

  return {
    success: true,
    externalPostId: result.id || `facebook_${post.id}`,
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
    finalCaption,
  };
}

async function publishToTwitter(post: SocialPost): Promise<PublishResult> {
<<<<<<< HEAD
  const finalCaption = formatCaptionForPlatform(post);

  return {
    success: true,
    externalPostId: `twitter_${post.id}`,
=======
  const account = await getConnectedAccount("twitter");
  if (!account?.access_token) {
    return { success: false, error: "No connected X account found" };
  }

  const finalCaption = formatCaptionForPlatform(post);
  const result = await createXTweet(account.access_token, finalCaption);

  return {
    success: true,
    externalPostId: result.data?.id || `twitter_${post.id}`,
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
    finalCaption,
  };
}

async function publishToLinkedIn(post: SocialPost): Promise<PublishResult> {
<<<<<<< HEAD
  const finalCaption = formatCaptionForPlatform(post);

  return {
    success: true,
    externalPostId: `linkedin_${post.id}`,
=======
  const account = await getConnectedAccount("linkedin");
  if (!account?.access_token) {
    return { success: false, error: "No connected LinkedIn account found" };
  }

  const authorUrn = String(account.metadata?.linkedin_author_urn || account.handle || "");
  if (!authorUrn) {
    return { success: false, error: "LinkedIn account is missing an author URN" };
  }

  if (post.image_url) {
    return { success: false, error: "LinkedIn image publishing is not enabled yet. Use a text-only post for now." };
  }

  const finalCaption = formatCaptionForPlatform(post);
  const result = await createLinkedInPost(account.access_token, authorUrn, finalCaption);

  return {
    success: true,
    externalPostId: result.id || `linkedin_${post.id}`,
    finalCaption,
  };
}

async function publishToPinterest(post: SocialPost): Promise<PublishResult> {
  const account = await getConnectedAccount("pinterest");
  if (!account?.access_token) {
    return { success: false, error: "No connected Pinterest account found" };
  }

  const boardId = String(account.metadata?.pinterest_board_id || account.handle || "");
  if (!boardId) {
    return { success: false, error: "Pinterest account is missing a board id" };
  }

  if (!post.image_url) {
    return { success: false, error: "Pinterest publishing requires an image_url" };
  }

  const finalCaption = formatCaptionForPlatform(post);
  const result = await createPinterestPin({
    accessToken: account.access_token,
    boardId,
    title: post.topic,
    description: finalCaption,
    link: "https://resumevaultgod.com/",
    imageUrl: post.image_url,
  });

  return {
    success: true,
    externalPostId: result.id || `pinterest_${post.id}`,
    finalCaption,
  };
}

async function publishToYouTube(post: SocialPost): Promise<PublishResult> {
  const account = await getConnectedAccount("youtube");
  if (!account?.access_token) {
    return { success: false, error: "No connected YouTube account found" };
  }

  if (!post.media_url) {
    return { success: false, error: "YouTube publishing requires a media_url for the video file" };
  }

  const response = await fetch(post.media_url);
  if (!response.ok) {
    return { success: false, error: "Could not download the YouTube video from media_url" };
  }

  const videoBuffer = Buffer.from(await response.arrayBuffer());
  const videoMimeType = response.headers.get("content-type") || "video/mp4";
  const finalCaption = formatCaptionForPlatform(post);
  const privacyStatus = post.status === "scheduled" && post.scheduled_time ? "private" : "public";
  const result = await uploadYouTubeVideo({
    accessToken: account.access_token,
    title: post.topic,
    description: finalCaption,
    privacyStatus,
    publishAt: post.status === "scheduled" ? post.scheduled_time || null : null,
    videoBuffer,
    videoMimeType,
  });

  return {
    success: true,
    externalPostId: result.id || `youtube_${post.id}`,
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
    finalCaption,
  };
}

async function publishToTikTok(post: SocialPost): Promise<PublishResult> {
<<<<<<< HEAD
  const finalCaption = formatCaptionForPlatform(post);

  return {
    success: true,
    externalPostId: `tiktok_${post.id}`,
=======
  const account = await getConnectedAccount("tiktok");
  if (!account?.access_token) {
    return { success: false, error: "No connected TikTok account found" };
  }

  if (!post.media_url) {
    return { success: false, error: "TikTok publishing requires a media_url for the video file" };
  }

  const finalCaption = formatCaptionForPlatform(post);
  const privacyLevel = await resolveTikTokPrivacyLevel(
    account.access_token,
    post.tiktok_privacy_level || undefined
  );
  const result = await initTikTokVideoPost({
    accessToken: account.access_token,
    title: finalCaption || post.topic,
    privacyLevel,
    videoUrl: post.media_url,
  });

  return {
    success: true,
    externalPostId: result.data?.publish_id || `tiktok_${post.id}`,
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
    finalCaption,
  };
}

async function publishToReddit(post: SocialPost): Promise<PublishResult> {
<<<<<<< HEAD
  const finalCaption = formatCaptionForPlatform(post);

  return {
    success: true,
    externalPostId: `reddit_${post.id}`,
=======
  const account = await getConnectedAccount("reddit");
  if (!account?.access_token) {
    return { success: false, error: "No connected Reddit account found" };
  }

  const subreddit = String(account.metadata?.reddit_subreddit || account.handle || "");
  if (!subreddit) {
    return { success: false, error: "Reddit account is missing a subreddit" };
  }

  const finalCaption = formatCaptionForPlatform(post);
  const result = await submitRedditPost({
    accessToken: account.access_token,
    subreddit,
    title: post.topic,
    text: `${finalCaption}\n\nLearn more at https://resumevaultgod.com/`,
  });

  const postId = result.json?.data?.id || result.json?.data?.name;

  return {
    success: true,
    externalPostId: postId || `reddit_${post.id}`,
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
    finalCaption,
  };
}

async function publishToThreads(post: SocialPost): Promise<PublishResult> {
<<<<<<< HEAD
  const finalCaption = formatCaptionForPlatform(post);

  return {
    success: true,
    externalPostId: `threads_${post.id}`,
=======
  const account = await getConnectedAccount("threads");
  if (!account?.access_token) {
    return { success: false, error: "No connected Threads account found" };
  }

  const finalCaption = formatCaptionForPlatform(post);
  const result = await createThreadsPost({
    accessToken: account.access_token,
    text: finalCaption,
    imageUrl: post.image_url,
    videoUrl: post.media_url,
  });

  return {
    success: true,
    externalPostId: result.id || `threads_${post.id}`,
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
    finalCaption,
  };
}

async function publishPost(post: SocialPost): Promise<PublishResult> {
  switch (post.platform) {
    case "instagram":
      return publishToInstagram(post);
<<<<<<< HEAD
=======
    case "facebook":
      return publishToFacebook(post);
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
    case "twitter":
      return publishToTwitter(post);
    case "linkedin":
      return publishToLinkedIn(post);
<<<<<<< HEAD
=======
    case "youtube":
      return publishToYouTube(post);
    case "pinterest":
      return publishToPinterest(post);
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
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
<<<<<<< HEAD
}
=======
}
>>>>>>> 69ab86b (Save all local changes and resolve conflicts)
