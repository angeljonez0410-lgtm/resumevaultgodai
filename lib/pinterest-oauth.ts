export type PinterestTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
};

export type PinterestBoardsResponse = {
  items?: Array<{
    id?: string;
    name?: string;
  }>;
};

const PINTEREST_AUTH_URL = "https://www.pinterest.com/oauth/";
const PINTEREST_TOKEN_URL = "https://api.pinterest.com/v5/oauth/token";
const PINTEREST_API_BASE = "https://api.pinterest.com/v5";

export function getPinterestConfig() {
  const clientId = process.env.PINTEREST_CLIENT_ID;
  const clientSecret = process.env.PINTEREST_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Pinterest OAuth environment variables");
  }

  return {
    clientId,
    clientSecret,
  };
}

export function buildPinterestOAuthUrl(redirectUri: string, state: string) {
  const { clientId } = getPinterestConfig();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "boards:read,pins:read,pins:write,user_accounts:read",
    state,
  });

  return `${PINTEREST_AUTH_URL}?${params.toString()}`;
}

async function fetchPinterestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = (await response.json().catch(() => ({}))) as T & { message?: string; error?: string };

  if (!response.ok) {
    const message = (payload as { message?: string }).message || (payload as { error?: string }).error || `Pinterest request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

export async function exchangePinterestCodeForToken(code: string, redirectUri: string) {
  const { clientId, clientSecret } = getPinterestConfig();
  return fetchPinterestJson<PinterestTokenResponse>(PINTEREST_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });
}

export async function refreshPinterestToken(refreshToken: string) {
  const { clientId, clientSecret } = getPinterestConfig();
  return fetchPinterestJson<PinterestTokenResponse>(PINTEREST_TOKEN_URL, {
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

export async function fetchPinterestBoards(accessToken: string) {
  return fetchPinterestJson<PinterestBoardsResponse>(`${PINTEREST_API_BASE}/boards?page_size=100`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function createPinterestBoard(accessToken: string, name: string, description: string) {
  return fetchPinterestJson<{ id?: string; name?: string }>(`${PINTEREST_API_BASE}/boards`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      description,
    }),
  });
}

export async function createPinterestPin({
  accessToken,
  boardId,
  title,
  description,
  link,
  imageUrl,
}: {
  accessToken: string;
  boardId: string;
  title: string;
  description: string;
  link: string;
  imageUrl: string;
}) {
  return fetchPinterestJson<{ id?: string }>(`${PINTEREST_API_BASE}/pins`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      board_id: boardId,
      title,
      description,
      link,
      media_source: {
        source_type: "image_url",
        url: imageUrl,
      },
    }),
  });
}
