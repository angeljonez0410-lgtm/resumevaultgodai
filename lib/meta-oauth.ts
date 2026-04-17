export type MetaProvider = "facebook" | "instagram";

export type MetaPage = {
  id: string;
  name?: string;
  access_token?: string;
  instagram_business_account?: {
    id?: string;
    username?: string;
  } | null;
};

type MetaTokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: {
    message?: string;
  };
};

type MetaPagesResponse = {
  data?: MetaPage[];
  error?: {
    message?: string;
  };
};

const META_GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v20.0";

export function isMetaProvider(provider: string): provider is MetaProvider {
  return provider === "facebook" || provider === "instagram";
}

export function getMetaConfig() {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error("Missing Meta OAuth environment variables");
  }

  return {
    appId,
    appSecret,
    graphVersion: META_GRAPH_VERSION,
  };
}

function getMetaScopes(provider: MetaProvider) {
  const scopes = [
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_metadata",
    "pages_manage_posts",
  ];

  if (provider === "instagram") {
    scopes.push("instagram_basic", "instagram_content_publish");
  }

  return scopes;
}

export function buildMetaOAuthUrl(provider: MetaProvider, redirectUri: string, state: string) {
  const { appId, graphVersion } = getMetaConfig();
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: getMetaScopes(provider).join(","),
    state,
    auth_type: "rerequest",
  });

  return `https://www.facebook.com/${graphVersion}/dialog/oauth?${params.toString()}`;
}

async function fetchMetaJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const payload = (await response.json().catch(() => ({}))) as T & { error?: { message?: string } };

  if (!response.ok || (payload as { error?: unknown }).error) {
    const message = (payload as { error?: { message?: string } }).error?.message || "Meta request failed";
    throw new Error(message);
  }

  return payload;
}

export async function exchangeMetaCodeForToken(code: string, redirectUri: string) {
  const { appId, appSecret, graphVersion } = getMetaConfig();

  const shortTokenUrl = new URL(`https://graph.facebook.com/${graphVersion}/oauth/access_token`);
  shortTokenUrl.search = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code,
  }).toString();

  const shortToken = await fetchMetaJson<MetaTokenResponse>(shortTokenUrl.toString());
  if (!shortToken.access_token) {
    throw new Error("Meta did not return an access token");
  }

  const longTokenUrl = new URL(`https://graph.facebook.com/${graphVersion}/oauth/access_token`);
  longTokenUrl.search = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortToken.access_token,
  }).toString();

  const longToken = await fetchMetaJson<MetaTokenResponse>(longTokenUrl.toString());

  return {
    accessToken: longToken.access_token || shortToken.access_token,
    expiresIn: longToken.expires_in || shortToken.expires_in || null,
  };
}

export async function fetchMetaProfile(accessToken: string) {
  const { graphVersion } = getMetaConfig();
  const url = new URL(`https://graph.facebook.com/${graphVersion}/me`);
  url.search = new URLSearchParams({
    fields: "id,name",
    access_token: accessToken,
  }).toString();

  return fetchMetaJson<{ id?: string; name?: string }>(url.toString());
}

export async function fetchMetaPages(accessToken: string) {
  const { graphVersion } = getMetaConfig();
  const url = new URL(`https://graph.facebook.com/${graphVersion}/me/accounts`);
  url.search = new URLSearchParams({
    fields: "id,name,access_token,instagram_business_account{id,username}",
    limit: "100",
    access_token: accessToken,
  }).toString();

  return fetchMetaJson<MetaPagesResponse>(url.toString());
}
