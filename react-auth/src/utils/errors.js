/**
 * Parse error messages from IdP API responses.
 * @param {unknown} error
 * @param {import('axios').AxiosResponse | null} [response]
 */
export function parseIdpError(error, response) {
  const data = response?.data ?? error?.response?.data;
  if (data?.error?.message) return data.error.message;
  if (data?.message) return data.message;
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return parsed?.error?.message || parsed?.message || 'Request failed.';
    } catch {
      return data || 'Request failed.';
    }
  }
  if (response?.status === 404 || response?.status === 501) {
    return 'This feature is not available. Please contact support.';
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Request failed. Please try again.';
}

/**
 * @param {unknown} raw
 * @returns {{ accessToken?: string; refreshToken?: string; expiresIn?: number; returnUrl?: string | null }}
 */
export function normalizeTokenResult(raw) {
  const data = raw?.result ?? raw;
  if (!data || typeof data !== 'object') return {};
  return {
    accessToken: data.accessToken ?? data.AccessToken,
    refreshToken: data.refreshToken ?? data.RefreshToken,
    expiresIn: data.expiresIn ?? data.ExpiresIn,
    returnUrl: data.returnUrl ?? data.ReturnUrl ?? null,
  };
}
