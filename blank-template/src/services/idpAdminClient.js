/** Tenant-admin APIs shared by user management and the media library. */
export function createIdpAdminClient({ auth, apiUrl, fetchImpl = fetch, timeoutMs = 20000 }) {
  const base = String(apiUrl || '')
    .trim()
    .replace(/\/+$/, '');
  return async function request(path, { method = 'POST', body, signal } = {}) {
    if (!base || !auth.tenancyName || !auth.getAccessToken())
      throw new Error('Sign in with a Cloudgate administrator account.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) controller.abort();
    try {
      const multipart = body instanceof FormData;
      const run = () =>
        fetchImpl(`${base}/api/idp/${encodeURIComponent(auth.tenancyName)}/${path}`, {
          method,
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            ...(!multipart && body !== undefined ? { 'Content-Type': 'application/json' } : {}),
            ...auth.authHeader(),
          },
          ...(body !== undefined ? { body: multipart ? body : JSON.stringify(body) } : {}),
        });
      let response = await run();
      if (response.status === 401 && (await auth.refresh())) response = await run();
      let raw;
      try {
        raw = await response.json();
      } catch {
        raw = null;
      }
      if (!response.ok || raw?.success === false) {
        const fallback =
          response.status === 404
            ? 'This feature is not available on this Cloudgate server yet.'
            : response.status === 401 || response.status === 403
              ? 'An active Cloudgate administrator account is required.'
              : 'Cloudgate could not complete this request. Please try again.';
        throw new Error(raw?.error?.message || raw?.result?.message || raw?.message || fallback);
      }
      return raw?.result ?? raw;
    } catch (error) {
      if (controller.signal.aborted && !signal?.aborted)
        throw new Error('Cloudgate took too long to respond. Please try again.');
      throw error;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
    }
  };
}
