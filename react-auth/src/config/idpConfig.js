/**
 * IdP portal configuration.
 * Tenancy resolution: ?idp_tenant= or ?tenant= query, then VITE_IDP_TENANCY_NAME.
 */
const idpApiUrl = String(import.meta.env.VITE_IDP_API_URL ?? '').trim();
const idpTenancyNameEnv = String(import.meta.env.VITE_IDP_TENANCY_NAME ?? '').trim();
const idpAppName = String(import.meta.env.VITE_IDP_APP_NAME ?? 'Sign in').trim();
const recaptchaSecret = String(import.meta.env.VITE_IDP_RECAPTCHA_SECRET ?? '').trim();

function getTenancyFromQuery() {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('idp_tenant') || params.get('tenant');
  return fromQuery?.trim() || '';
}

export const idpConfig = {
  get apiUrl() {
    return idpApiUrl.replace(/\/$/, '');
  },
  get tenancyName() {
    return getTenancyFromQuery() || idpTenancyNameEnv;
  },
  get appName() {
    return idpAppName;
  },
  get recaptchaSecret() {
    return recaptchaSecret;
  },
  get enabled() {
    return Boolean(this.apiUrl && this.tenancyName);
  },
  getBrandingLogoUrl(tenancyName) {
    const tenant = tenancyName || this.tenancyName;
    if (!this.apiUrl || !tenant) return null;
    return `${this.apiUrl}/api/idp/${encodeURIComponent(tenant)}/branding/logo`;
  },
};
