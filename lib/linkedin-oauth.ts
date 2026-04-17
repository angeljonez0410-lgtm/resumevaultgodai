export type LinkedInAccessTokenResponse = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope?: string;
};

export type LinkedInProfileResponse = {
  id?: string;
  localizedFirstName?: string;
  localizedLastName?: string;
};

const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const LINKEDIN_API_BASE = "https://api.linkedin.com";

export function getLinkedInConfig() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing LinkedIn OAuth environment variables");
  }

  return {
    clientId,
    clientSecret,
  };
}

export function buildLinkedInOAuthUrl(redirectUri: string, state: string) {
  const { clientId } = getLinkedInConfig();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: "r_liteprofile w_member_social",
  });

  return `${LINKEDIN_AUTH_URL}?${params.toString()}`;
}

async function fetchLinkedInJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = (await response.json().catch(() => ({}))) as T & { message?: string; error?: string };

  if (!response.ok) {
    const message =
      (payload as { message?: string }).message ||
      (payload as { error?: string }).error ||
      `LinkedIn request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

export async function exchangeLinkedInCodeForToken(code: string, redirectUri: string) {
  const { clientId, clientSecret } = getLinkedInConfig();
  return fetchLinkedInJson<LinkedInAccessTokenResponse>(LINKEDIN_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });
}

export async function fetchLinkedInProfile(accessToken: string) {
  return fetchLinkedInJson<LinkedInProfileResponse>(`${LINKEDIN_API_BASE}/v2/me?projection=(id,localizedFirstName,localizedLastName)`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Restli-Protocol-Version": "2.0.0",
    },
  });
}

export async function createLinkedInPost(accessToken: string, authorUrn: string, commentary: string) {
  const response = await fetch(`${LINKEDIN_API_BASE}/v2/ugcPosts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Restli-Protocol-Version": "2.0.0",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: commentary,
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }),
  });

  const restliId = response.headers.get("x-restli-id") || response.headers.get("X-RestLi-Id") || undefined;
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = (payload as { message?: string; error?: string }).message || (payload as { error?: string }).error || "LinkedIn post failed";
    throw new Error(message);
  }

  return {
    id: restliId,
    payload,
  };
}
