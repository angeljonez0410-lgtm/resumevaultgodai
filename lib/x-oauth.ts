export type XTokenResponse = {
  token_type?: string;
  expires_in?: number;
  access_token?: string;
  refresh_token?: string;
  scope?: string;
};

export type XMeResponse = {
  data?: {
    id?: string;
    name?: string;
    username?: string;
  };
};

const X_AUTH_URL = "https://twitter.com/i/oauth2/authorize";
const X_TOKEN_URL = "https://api.x.com/2/oauth2/token";
const X_API_BASE = "https://api.x.com";

export function getXConfig() {
  const clientId = process.env.X_CLIENT_ID || process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET || process.env.TWITTER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing X OAuth environment variables");
  }

  return { clientId, clientSecret };
}

export function buildXOAuthUrl(redirectUri: string, state: string, codeChallenge: string) {
  const { clientId } = getXConfig();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    scope: "tweet.read users.read tweet.write offline.access",
  });

  return `${X_AUTH_URL}?${params.toString()}`;
}

async function fetchXJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = (await response.json().catch(() => ({}))) as T & { detail?: string; title?: string; error?: string };

  if (!response.ok) {
    const message =
      (payload as { detail?: string }).detail ||
      (payload as { title?: string }).title ||
      (payload as { error?: string }).error ||
      `X request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

export async function exchangeXCodeForToken(code: string, redirectUri: string, codeVerifier: string) {
  const { clientId, clientSecret } = getXConfig();
  return fetchXJson<XTokenResponse>(X_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });
}

export async function refreshXToken(refreshToken: string) {
  const { clientId, clientSecret } = getXConfig();
  return fetchXJson<XTokenResponse>(X_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
}

export async function fetchXMe(accessToken: string) {
  return fetchXJson<XMeResponse>(`${X_API_BASE}/2/users/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function createXTweet(accessToken: string, text: string) {
  return fetchXJson<{ data?: { id?: string; text?: string } }>(`${X_API_BASE}/2/tweets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
}

export function base64UrlEncode(value: Uint8Array) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export async function createCodeChallenge(codeVerifier: string) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(codeVerifier));
  return base64UrlEncode(new Uint8Array(hash));
}

export function createCodeVerifier() {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)));
}
