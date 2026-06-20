/**
 * Redirect to returnUrl with access_token, refresh_token, and expires_in query params.
 * @param {string} returnUrl
 * @param {{ accessToken: string; refreshToken?: string; expiresIn?: number }} tokens
 */
export function redirectWithTokens(returnUrl, tokens) {
  if (!isValidReturnUrl(returnUrl)) return false;
  const separator = returnUrl.includes('?') ? '&' : '?';
  let target = `${returnUrl}${separator}access_token=${encodeURIComponent(tokens.accessToken)}`;
  if (tokens.refreshToken) {
    target += `&refresh_token=${encodeURIComponent(tokens.refreshToken)}`;
  }
  if (tokens.expiresIn != null && typeof tokens.expiresIn === 'number') {
    target += `&expires_in=${encodeURIComponent(tokens.expiresIn)}`;
  }
  window.location.href = target;
  return true;
}

/** @param {string | null | undefined} url */
export function isValidReturnUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const u = new URL(trimmed);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}
