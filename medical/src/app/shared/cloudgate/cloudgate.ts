// Cloudgate singletons — powered by @cloudgatedevs/cloudgate-client.
//
// The package owns the IdP session flow (redirect-token consumption, storage,
// silent refresh, login redirects) and the workflow-gateway HTTP client
// (signing, timeouts, envelope unwrapping). Both are created lazily so they
// pick up AppConsts AFTER appconfig.json has loaded in AppPreBootstrap.

import {
  createCloudgateAuth,
  createCloudgateClient,
  IDP_ACCESS_TOKEN_KEY,
  IDP_REFRESH_TOKEN_KEY,
  IDP_ACCESS_TOKEN_EXPIRY_KEY,
} from '@cloudgatedevs/cloudgate-client';
import { AppConsts } from '../AppConsts';
import { getTenancyNameCookie } from '../core/multi-tenancy.util';
import {
  JWT_ACCESS_TOKEN_KEY,
  JWT_REFRESH_TOKEN_KEY,
  JWT_ACCESS_TOKEN_EXPIRY_KEY,
} from '../idp-auth/auth-storage';

// The package stores tokens under idp_* keys; these apps share their session
// with Cloudweb Apps under jwt_* keys. Map the package's keys onto ours.
const KEY_MAP: Record<string, string> = {
  [IDP_ACCESS_TOKEN_KEY]: JWT_ACCESS_TOKEN_KEY,
  [IDP_REFRESH_TOKEN_KEY]: JWT_REFRESH_TOKEN_KEY,
  [IDP_ACCESS_TOKEN_EXPIRY_KEY]: JWT_ACCESS_TOKEN_EXPIRY_KEY,
};

const mappedStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(KEY_MAP[key] ?? key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(KEY_MAP[key] ?? key, value);
    } catch {
      /* noop */
    }
  },
  removeItem(key: string): void {
    try {
      localStorage.removeItem(KEY_MAP[key] ?? key);
    } catch {
      /* noop */
    }
  },
};

function getCookieTenancy(): string {
  try {
    return getTenancyNameCookie() ?? '';
  } catch {
    return '';
  }
}

type CloudgateAuth = ReturnType<typeof createCloudgateAuth>;
type CloudgateClient = ReturnType<typeof createCloudgateClient>;

let authInstance: CloudgateAuth | null = null;

/** IdP auth manager. Create-on-first-use (needs AppConsts from appconfig.json). */
export function cloudgateAuth(): CloudgateAuth {
  if (!authInstance) {
    authInstance = createCloudgateAuth({
      idpBaseUrl: AppConsts.idpBaseUrl,
      idpApiUrl: (AppConsts.idpApiUrl ?? '').trim() || (AppConsts.workflowGatewayUrl ?? '').trim(),
      // Package resolution: ?idp_tenant=/?tenant= query -> this value -> subdomain.
      tenancyName: (AppConsts.idpTenancyName ?? '').trim() || getCookieTenancy(),
      storage: mappedStorage,
    });
  }
  return authInstance;
}

let clientInstance: CloudgateClient | null = null;

/** Workflow-gateway client, or null while the gateway URL is not configured. */
export function cloudgateClient(): CloudgateClient | null {
  const gatewayUrl = (AppConsts.workflowGatewayUrl ?? '').trim().replace(/\/$/, '');
  if (!clientInstance && gatewayUrl) {
    // Routes are passed as full paths (e.g. /sbx/api/hotels) built by
    // workflowConfig, so the client is created on the gateway origin alone.
    clientInstance = createCloudgateClient({ baseUrl: gatewayUrl });
  }
  return clientInstance;
}
