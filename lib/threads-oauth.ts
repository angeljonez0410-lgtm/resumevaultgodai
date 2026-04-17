export type ThreadsTokenResponse = {
  access_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
};

export type ThreadsProfileResponse = {
  id?: string;
  username?: string;
  name?: string;
  threads_profile_picture_url?: string;
  threads_biography?: string;
};

export type ThreadsPublishResponse = {
  id?: string;
};

const THREADS_AUTH_URL = "https://threads.net/oauth/authorize";
const THREADS_TOKEN_URL = "https://graph.threads.net/oauth/access_token";
const THREADS_API_BASE = "https://graph.threads.net";

export function getThreadsConfig() {
  const clientId = process.env.THREADS_APP_ID || process.env.META_APP_ID;
  const clientSecret = process.env.THREADS_APP_SECRET || process.env.META_APP_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Threads OAuth environment variables");
  }

  return {
    clientId,
    clientSecret,
  };
}

export function buildThreadsOAuthUrl(redirectUri: string, state: string) {
  const { clientId } = getThreadsConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "threads_basic,threads_content_publish",
    state,
  });

  return `${THREADS_AUTH_URL}?${params.toString()}`;
}

async function fetchThreadsJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = (await response.json().catch(() => ({}))) as T & { error?: { message?: string } };

  if (!response.ok) {
    const message = (payload as { error?: { message?: string } }).error?.message || `Threads request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

export async function exchangeThreadsCodeForToken(code: string, redirectUri: string) {
  const { clientId, clientSecret } = getThreadsConfig();
  return fetchThreadsJson<ThreadsTokenResponse>(THREADS_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });
}

export async function fetchThreadsProfile(accessToken: string) {
  return fetchThreadsJson<ThreadsProfileResponse>(`${THREADS_API_BASE}/me?fields=id,username,name,threads_profile_picture_url,threads_biography`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function createThreadsPost({
  accessToken,
  text,
  imageUrl,
  videoUrl,
}: {
  accessToken: string;
  text: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
}) {
  const mediaType = videoUrl ? "VIDEO" : imageUrl ? "IMAGE" : "TEXT";
  const body = new URLSearchParams({
    media_type: mediaType,
    text,
  });

  if (imageUrl) {
    body.set("image_url", imageUrl);
  }

  if (videoUrl) {
    body.set("video_url", videoUrl);
  }

  const createResponse = await fetch(`${THREADS_API_BASE}/me/threads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const createPayload = await createResponse.json().catch(() => ({}));
  if (!createResponse.ok) {
    throw new Error((createPayload as { error?: { message?: string } }).error?.message || "Threads creation failed");
  }

  const creationId = (createPayload as { id?: string }).id;
  if (!creationId) {
    throw new Error("Threads did not return a creation id");
  }

  const publishResponse = await fetch(`${THREADS_API_BASE}/me/threads_publish?creation_id=${encodeURIComponent(creationId)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const publishPayload = await publishResponse.json().catch(() => ({}));
  if (!publishResponse.ok) {
    throw new Error((publishPayload as { error?: { message?: string } }).error?.message || "Threads publish failed");
  }

  return publishPayload as ThreadsPublishResponse;
}
