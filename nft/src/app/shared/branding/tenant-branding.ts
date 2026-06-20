import { AppBranding } from './app-branding';
import { idpAuthConfig } from '../idp-auth/idp-auth.config';

/** Public tenant logo from Cloudgate ClientAppSettings (same source as IdP / builder branding). */
export function buildTenantBrandingLogoUrl(tenancyName?: string): string | null {
  const tenancy = (tenancyName ?? idpAuthConfig.tenancyName)?.trim();
  const apiBase = idpAuthConfig.apiUrl?.trim();
  if (!tenancy || !apiBase) {
    return null;
  }
  return `${apiBase}/api/idp/${encodeURIComponent(tenancy)}/branding/logo`;
}

export function getDefaultLoginLogo(): string {
  return AppBranding.loginLogo;
}

export function getDefaultAppIcon(): string {
  return AppBranding.appIcon;
}
