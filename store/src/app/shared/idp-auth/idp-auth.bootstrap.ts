// IdP session bootstrap — powered by @cloudgatedevs/cloudgate-client.
//
// The package consumes ?access_token=… redirect params from location.search.
// With hash routing (#/route?access_token=…) the IdP may return tokens inside
// the hash query, so we first promote them into the search string, then hand
// the whole flow (consume, store, clean URL, silent refresh) to the package.

import { cloudgateAuth } from '../cloudgate/cloudgate';
import { TokenService } from '../core/token.service';

const TOKEN_PARAMS = ['access_token', 'refresh_token', 'expires_in'];

/** Move IdP token params from the hash query (#/route?access_token=…) into location.search. */
function promoteHashTokensToSearch() {
  const hash = window.location.hash || '';
  const queryStart = hash.indexOf('?');
  if (queryStart < 0) return;

  const hashParams = new URLSearchParams(hash.slice(queryStart + 1));
  if (!TOKEN_PARAMS.some((p) => hashParams.has(p))) return;

  const search = new URLSearchParams(window.location.search);
  for (const param of TOKEN_PARAMS) {
    const value = hashParams.get(param);
    if (value != null && !search.has(param)) search.set(param, value);
    hashParams.delete(param);
  }

  const route = hash.slice(0, queryStart) || '#/';
  const rest = hashParams.toString();
  const searchString = search.toString();
  window.history.replaceState(
    {},
    '',
    window.location.pathname +
      (searchString ? `?${searchString}` : '') +
      route +
      (rest ? `?${rest}` : ''),
  );
}

/**
 * Handle the IdP redirect callback and restore the session from storage.
 * Safe to call before Angular boot. Token consumption and URL cleanup run
 * synchronously inside the package; an expired session is silently refreshed
 * in the background (the auth interceptor also retries 401s via refresh).
 */
export function bootstrapIdpSessionFromUrl(): boolean {
  const auth = cloudgateAuth();
  promoteHashTokensToSearch();
  void auth.init();
  return auth.isAuthenticated();
}

export function clearIdpSessionAndAbp() {
  cloudgateAuth().logout({ redirectToLogin: false });
  const tokenStorage = new TokenService();
  tokenStorage.clearToken();
  tokenStorage.clearRefreshToken();
}
