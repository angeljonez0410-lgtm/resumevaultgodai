export type YouTubeTokenResponse = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
};

export type YouTubeChannelResponse = {
  items?: Array<{
    id?: string;
    snippet?: {
      title?: string;
      description?: string;
    };
  }>;
};

const YOUTUBE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const YOUTUBE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_UPLOAD_BASE = "https://www.googleapis.com/upload/youtube/v3";

export function getYouTubeConfig() {
  const clientId = process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing YouTube OAuth environment variables");
  }

  return {
    clientId,
    clientSecret,
  };
}

export function buildYouTubeOAuthUrl(redirectUri: string, state: string) {
  const { clientId } = getYouTubeConfig();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly openid email profile",
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return `${YOUTUBE_AUTH_URL}?${params.toString()}`;
}

async function fetchYouTubeJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = (await response.json().catch(() => ({}))) as T & { error?: { message?: string } };

  if (!response.ok) {
    const message = (payload as { error?: { message?: string } }).error?.message || `YouTube request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

export async function exchangeYouTubeCodeForToken(code: string, redirectUri: string) {
  const { clientId, clientSecret } = getYouTubeConfig();
  return fetchYouTubeJson<YouTubeTokenResponse>(YOUTUBE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
}

export async function refreshYouTubeToken(refreshToken: string) {
  const { clientId, clientSecret } = getYouTubeConfig();
  return fetchYouTubeJson<YouTubeTokenResponse>(YOUTUBE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });
}

export async function fetchYouTubeChannel(accessToken: string) {
  return fetchYouTubeJson<YouTubeChannelResponse>(`${YOUTUBE_API_BASE}/channels?part=id,snippet&mine=true`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

function encodeMultipartJsonPart(boundary: string, name: string, value: unknown) {
  return [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    `Content-Disposition: form-data; name="${name}"`,
    "",
    JSON.stringify(value),
    "",
  ].join("\r\n");
}

export async function uploadYouTubeVideo({
  accessToken,
  title,
  description,
  privacyStatus,
  publishAt,
  videoBuffer,
  videoMimeType,
}: {
  accessToken: string;
  title: string;
  description: string;
  privacyStatus: "public" | "private" | "unlisted";
  publishAt?: string | null;
  videoBuffer: Buffer;
  videoMimeType: string;
}) {
  const boundary = `resumevault-${crypto.randomUUID()}`;
  const metadata = {
    snippet: {
      title,
      description,
      categoryId: "22",
    },
    status: {
      privacyStatus,
      ...(publishAt ? { publishAt } : {}),
      selfDeclaredMadeForKids: false,
    },
  };

  const metadataPart = encodeMultipartJsonPart(boundary, "metadata", metadata);
  const videoPartHeader = [
    `--${boundary}`,
    `Content-Type: ${videoMimeType}`,
    'Content-Disposition: form-data; name="video"; filename="video"',
    "",
  ].join("\r\n");
  const closingBoundary = `\r\n--${boundary}--\r\n`;

  const body = Buffer.concat([
    Buffer.from(`${metadataPart}\r\n`),
    Buffer.from(`${videoPartHeader}\r\n`),
    videoBuffer,
    Buffer.from(closingBoundary),
  ]);

  const response = await fetch(`${YOUTUBE_UPLOAD_BASE}/videos?uploadType=multipart&part=snippet,status`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
      "Content-Length": String(body.length),
    },
    body,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((payload as { error?: { message?: string } }).error?.message || "YouTube upload failed");
  }

  return payload as { id?: string };
}
