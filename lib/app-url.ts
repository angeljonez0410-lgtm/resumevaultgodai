export function getAppBaseUrl(req?: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (req) {
    return new URL(req.url).origin;
  }

  return "http://localhost:3000";
}

export function getAppUrl(path: string, req?: Request) {
  return new URL(path, getAppBaseUrl(req)).toString();
}
