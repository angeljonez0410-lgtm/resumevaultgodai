export type TikTokTokenResponse = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  refresh_expires_in?: number;
  scope?: string;
  token_type?: string;
  open_id?: string;
};

export type TikTokUserInfoResponse = {
  data?: {
    user?: {
      open_id?: string;
      union_id?: string;
      avatar_url?: string;
      avatar_url_100?: string;
      avatar_large_url?: string;
      display_name?: string;
      bio_description?: string;
      profile_deep_link?: string;
      is_verified?: boolean;
      username?: string;
      follower_count?: number;
      following_count?: number;
      likes_count?: number;
      video_count?: number;
    };
  };
  error?: {
    code?: string;
    message?: string;
    logid?: string;
  };
};

export type TikTokCreatorInfoResponse = {
  data?: {
    creator_avatar_url?: string;
    creator_username?: string;
    creator_nickname?: string;
    privacy_level_options?: string[];
    comment_disabled?: boolean;
    duet_disabled?: boolean;
    stitch_disabled?: boolean;
    max_video_post_duration_sec?: number;
  };
  error?: {
    code?: string;
    message?: string;
    log_id?: string;
  };
};

export type TikTokVideoInitResponse = {
  data?: {
    publish_id?: string;
    upload_url?: string;
  };
  error?: {
    code?: string;
    message?: string;
    log_id?: string;
  };
};

const TIKTOK_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/";
const TIKTOK_CREATOR_INFO_URL = "https://open.tiktokapis.com/v2/post/publish/creator_info/query/";
const TIKTOK_VIDEO_INIT_URL = "https://open.tiktokapis.com/v2/post/publish/video/init/";

export function getTikTokConfig() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY || process.env.TIKTOK_CLIENT_ID;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

  if (!clientKey || !clientSecret) {
    throw new Error("Missing TikTok OAuth environment variables");
  }

  return { clientKey, clientSecret };
}

export function buildTikTokOAuthUrl(redirectUri: string, state: string) {
  const { clientKey } = getTikTokConfig();
  const params = new URLSearchParams({
    client_key: clientKey,
    response_type: "code",
    scope: "user.info.basic video.publish video.upload",
    redirect_uri: redirectUri,
    state,
  });

  return `${TIKTOK_AUTH_URL}?${params.toString()}`;
}

async function fetchTikTokJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = (await response.json().catch(() => ({}))) as T;
  const errorObject = payload as {
    error?: { code?: string; message?: string };
    message?: string;
  };

  if (!response.ok || (errorObject.error && errorObject.error.code && errorObject.error.code !== "ok")) {
    const message =
      errorObject.error?.message ||
      errorObject.message ||
      `TikTok request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

export async function exchangeTikTokCodeForToken(code: string, redirectUri: string) {
  const { clientKey, clientSecret } = getTikTokConfig();
  return fetchTikTokJson<TikTokTokenResponse>(TIKTOK_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });
}

export async function refreshTikTokToken(refreshToken: string) {
  const { clientKey, clientSecret } = getTikTokConfig();
  return fetchTikTokJson<TikTokTokenResponse>(TIKTOK_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
}

export async function fetchTikTokUserInfo(accessToken: string) {
  return fetchTikTokJson<TikTokUserInfoResponse>(`${TIKTOK_USER_INFO_URL}?fields=open_id,union_id,avatar_url,avatar_url_100,avatar_large_url,display_name,bio_description,profile_deep_link,is_verified,username`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function fetchTikTokCreatorInfo(accessToken: string) {
  return fetchTikTokJson<TikTokCreatorInfoResponse>(TIKTOK_CREATOR_INFO_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: "{}",
  });
}

export async function resolveTikTokPrivacyLevel(accessToken: string, requestedPrivacyLevel?: string) {
  const creatorInfo = await fetchTikTokCreatorInfo(accessToken);
  const options = creatorInfo.data?.privacy_level_options || [];

  if (requestedPrivacyLevel) {
    if (options.length === 0 || options.includes(requestedPrivacyLevel)) {
      return requestedPrivacyLevel;
    }

    throw new Error(
      `TikTok privacy level "${requestedPrivacyLevel}" is not available for this connected account`
    );
  }

  const fallbackPrivacyLevel = options[0];
  if (!fallbackPrivacyLevel) {
    throw new Error("TikTok account did not return any privacy level options");
  }

  return fallbackPrivacyLevel;
}

export async function initTikTokVideoPost({
  accessToken,
  title,
  privacyLevel,
  videoUrl,
}: {
  accessToken: string;
  title: string;
  privacyLevel: string;
  videoUrl: string;
}) {
  return fetchTikTokJson<TikTokVideoInitResponse>(TIKTOK_VIDEO_INIT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      post_info: {
        title,
        privacy_level: privacyLevel,
        disable_duet: false,
        disable_stitch: false,
        disable_comment: false,
      },
      source_info: {
        source: "PULL_FROM_URL",
        video_url: videoUrl,
      },
    }),
  });
}
