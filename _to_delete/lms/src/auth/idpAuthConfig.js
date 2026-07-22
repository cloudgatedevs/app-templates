/**
 * IdP auth configuration.
 * Tenancy resolution order: ?idp_tenant= query, then VITE_IDP_TENANCY_NAME, then subdomain.
 * An explicitly configured tenancy name wins over the auto-detected subdomain so that
 * preview/dev hosts (e.g. t3u4.dev.cloudgate.dev) don't get mistaken for a tenant.
 */
const idpBaseUrl = String(import.meta.env.VITE_IDP_BASE_URL ?? '').trim();
const idpApiUrl = String(import.meta.env.VITE_IDP_API_URL ?? '').trim();
const idpTenancyNameEnv = String(import.meta.env.VITE_IDP_TENANCY_NAME ?? '').trim();
const idpReturnUrlEnv = String(import.meta.env.VITE_IDP_RETURN_URL ?? '').trim();

function getTenancyFromQuery() {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('idp_tenant') || params.get('tenant');
  return fromQuery && fromQuery.trim() ? fromQuery.trim() : '';
}

function getTenancyFromSubdomain() {
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;
  if (hostname === '127.0.0.1' || hostname === 'localhost') return '';
  const parts = hostname.split('.');
  if (hostname.endsWith('.localhost') && parts.length >= 2) return parts[0];
  return parts.length > 2 ? parts[0] : '';
}

export const idpAuthConfig = {
  baseUrl: idpBaseUrl,
  get apiUrl() {
    return idpApiUrl || idpBaseUrl;
  },
  get tenancyName() {
    return getTenancyFromQuery() || idpTenancyNameEnv || getTenancyFromSubdomain();
  },
  get enabled() {
    return Boolean(this.baseUrl && this.tenancyName);
  },
  get loginUrl() {
    const base = this.baseUrl.replace(/\/$/, '');
    return `${base}/idp/${encodeURIComponent(this.tenancyName)}/login`;
  },
  /**
   * Where the IdP should send the browser back to after login. Defaults to this app's origin.
   * Override with VITE_IDP_RETURN_URL (e.g. when running behind a fixed host).
   */
  get returnUrl() {
    if (idpReturnUrlEnv) return idpReturnUrlEnv;
    if (typeof window !== 'undefined') return `${window.location.origin}/`;
    return '';
  },
  /**
   * Login URL with a `returnUrl` query param so the IdP can redirect tokens back to this app.
   * @param {string} [returnUrl] Overrides the configured/default return URL.
   * @returns {string}
   */
  buildLoginUrl(returnUrl) {
    const base = this.loginUrl;
    const target = (returnUrl ?? this.returnUrl)?.trim?.() ?? '';
    if (!target) return base;
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}returnUrl=${encodeURIComponent(target)}`;
  },
};
