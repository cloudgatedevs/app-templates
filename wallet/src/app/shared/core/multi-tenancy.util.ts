import { deleteCookie, getCookieValue, setCookieValue } from './cookie.util';

export const TENANT_ID_COOKIE_NAME = 'App-Id';
export const TENANCY_NAME_COOKIE = 'abp_tenancy_name';

export function getTenantIdCookie(): number | null {
  const value = getCookieValue(TENANT_ID_COOKIE_NAME);
  return value ? parseInt(value, 10) : null;
}

export function setTenantIdCookie(tenantId?: number | null): void {
  if (tenantId == null) {
    deleteCookie(TENANT_ID_COOKIE_NAME);
    return;
  }
  setCookieValue(TENANT_ID_COOKIE_NAME, String(tenantId));
}

export function getTenancyNameCookie(): string {
  return (getCookieValue(TENANCY_NAME_COOKIE) ?? '').trim();
}

export function setTenancyNameCookie(tenancyName: string): void {
  setCookieValue(TENANCY_NAME_COOKIE, tenancyName);
}
