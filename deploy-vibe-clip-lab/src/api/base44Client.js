import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;
export const base44ServerUrl = import.meta.env.VITE_BASE44_SERVER_URL || 'https://base44.app';

//Create a client with authentication required
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: base44ServerUrl,
  requiresAuth: false,
  appBaseUrl
});
