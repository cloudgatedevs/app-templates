import { clearIdpSession as clearIdpSessionStorage, getStoredAccessToken, getStoredRefreshToken, storeIdpTokens } from './auth-storage';
import { isTokenValid } from './jwt.utils';
import { TokenService } from '../core/token.service';

function getIdpCallbackParams(): URLSearchParams {
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash || '';
  const queryStart = hash.indexOf('?');
  if (queryStart >= 0) {
    const hashParams = new URLSearchParams(hash.slice(queryStart + 1));
    hashParams.forEach((value, key) => {
      if (!params.has(key)) {
        params.set(key, value);
      }
    });
  }
  return params;
}

function stripIdpCallbackParams() {
  const params = getIdpCallbackParams();
  const hadTokens =
    params.has('access_token') || params.has('refresh_token') || params.has('expires_in');
  if (!hadTokens) return;

  const search = new URLSearchParams(window.location.search);
  search.delete('access_token');
  search.delete('refresh_token');
  search.delete('expires_in');

  let hash = window.location.hash || '';
  const queryStart = hash.indexOf('?');
  if (queryStart >= 0) {
    const route = hash.slice(0, queryStart) || '#/';
    hash = route;
  }

  const searchString = search.toString();
  window.history.replaceState(
    {},
    '',
    window.location.pathname + (searchString ? `?${searchString}` : '') + hash,
  );
}

const tokenStorage = new TokenService();

function syncStoredTokens(accessToken: string, refreshToken?: string) {
  tokenStorage.setToken(accessToken);
  if (refreshToken) {
    tokenStorage.setRefreshToken(refreshToken);
  }
}

/** Handle IdP redirect callback and restore session from storage. Safe to call before Angular boot. */
export function bootstrapIdpSessionFromUrl(): boolean {
  const params = getIdpCallbackParams();
  const tokenFromUrl = params.get('access_token');
  const refreshFromUrl = params.get('refresh_token');
  const expiresInFromUrl = params.get('expires_in');

  if (tokenFromUrl && isTokenValid(tokenFromUrl)) {
    const expiresIn = expiresInFromUrl != null ? Number(expiresInFromUrl) : undefined;
    storeIdpTokens(
      tokenFromUrl,
      refreshFromUrl || undefined,
      Number.isFinite(expiresIn) ? expiresIn : undefined,
    );
    syncStoredTokens(tokenFromUrl, refreshFromUrl || getStoredRefreshToken() || undefined);
    stripIdpCallbackParams();
    return true;
  }

  const stored = getStoredAccessToken();
  if (isTokenValid(stored)) {
    syncStoredTokens(stored!, getStoredRefreshToken() || undefined);
    return true;
  }

  return false;
}

export function clearIdpSessionAndAbp() {
  clearIdpSessionStorage();
  tokenStorage.clearToken();
  tokenStorage.clearRefreshToken();
}
