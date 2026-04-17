export type RedditTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
};

export type RedditMeResponse = {
  id?: string;
  name?: string;
  subreddit?: {
    display_name?: string;
    title?: string;
  };
};

export type RedditSubmitResponse = {
  json?: {
    errors?: Array<[string, string, string?]>;
    data?: {
      url?: string;
      name?: string;
      id?: string;
    };
  };
};

const REDDIT_AUTH_URL = "https://www.reddit.com/api/v1/authorize";
const REDDIT_TOKEN_URL = "https://www.reddit.com/api/v1/access_token";
const REDDIT_API_BASE = "https://oauth.reddit.com";
const REDDIT_USER_AGENT = process.env.REDDIT_USER_AGENT || "ResumeVaultGod/1.0";

export function getRedditConfig() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Reddit OAuth environment variables");
  }

  return {
    clientId,
    clientSecret,
  };
}

export function buildRedditOAuthUrl(redirectUri: string, state: string) {
  const { clientId } = getRedditConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    state,
    redirect_uri: redirectUri,
    duration: "permanent",
    scope: "identity submit read",
  });

  return `${REDDIT_AUTH_URL}?${params.toString()}`;
}

async function fetchRedditJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error((payload as { error?: string }).error || `Reddit request failed (${response.status})`);
  }

  return payload;
}

export async function exchangeRedditCodeForToken(code: string, redirectUri: string) {
  const { clientId, clientSecret } = getRedditConfig();
  return fetchRedditJson<RedditTokenResponse>(REDDIT_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": REDDIT_USER_AGENT,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      duration: "permanent",
    }),
  });
}

export async function refreshRedditToken(refreshToken: string) {
  const { clientId, clientSecret } = getRedditConfig();
  return fetchRedditJson<RedditTokenResponse>(REDDIT_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": REDDIT_USER_AGENT,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
}

export async function fetchRedditMe(accessToken: string) {
  return fetchRedditJson<RedditMeResponse>(`${REDDIT_API_BASE}/api/v1/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": REDDIT_USER_AGENT,
    },
  });
}

export async function submitRedditPost({
  accessToken,
  subreddit,
  title,
  text,
}: {
  accessToken: string;
  subreddit: string;
  title: string;
  text: string;
}) {
  return fetchRedditJson<RedditSubmitResponse>(`${REDDIT_API_BASE}/api/submit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": REDDIT_USER_AGENT,
    },
    body: new URLSearchParams({
      sr: subreddit,
      kind: "self",
      title,
      text,
      api_type: "json",
      resubmit: "true",
      sendreplies: "true",
    }),
  });
}
