import { AppConsts } from '../AppConsts';

function getTenancyFromQuery(): string {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('idp_tenant') || params.get('tenant');
  return fromQuery?.trim() ?? '';
}

function getTenancyFromSubdomain(): string {
  const hostname = window.location.hostname;
  if (hostname === '127.0.0.1' || hostname === 'localhost') {
    return '';
  }
  const parts = hostname.split('.');
  if (hostname.endsWith('.localhost') && parts.length >= 2) {
    return parts[0];
  }
  return parts.length > 2 ? parts[0] : '';
}

import { getTenancyNameCookie } from '../core/multi-tenancy.util';

function getTenancyFromCookie(): string {
  try {
    return getTenancyNameCookie();
  } catch {
    return '';
  }
}

export const idpAuthConfig = {
  get baseUrl() {
    return (AppConsts.idpBaseUrl ?? '').trim();
  },
  get apiUrl() {
    const configured = (AppConsts.idpApiUrl ?? '').trim();
    const fallback = (AppConsts.workflowGatewayUrl ?? '').trim();
    return (configured || fallback).replace(/\/$/, '');
  },
  get tenancyName() {
    return (
      getTenancyFromQuery() ||
      (AppConsts.idpTenancyName ?? '').trim() ||
      getTenancyFromCookie() ||
      getTenancyFromSubdomain()
    );
  },
  get enabled() {
    return Boolean(this.baseUrl && this.tenancyName);
  },
  get loginUrl() {
    const base = this.baseUrl.replace(/\/$/, '');
    return `${base}/idp/${encodeURIComponent(this.tenancyName)}/login`;
  },
  get returnUrl() {
    const configured = (AppConsts.idpReturnUrl ?? '').trim();
    if (configured) return configured;
    return `${window.location.origin}${AppConsts.appBaseHref || '/'}`.replace(/\/$/, '') + '/';
  },
  buildLoginUrl(returnUrl?: string) {
    const base = this.loginUrl;
    const target = (returnUrl ?? this.returnUrl).trim();
    if (!target) return base;
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}returnUrl=${encodeURIComponent(target)}`;
  },
  get signUpUrl() {
    const base = this.baseUrl.replace(/\/$/, '');
    return `${base}/idp/${encodeURIComponent(this.tenancyName)}/register`;
  },
  buildSignUpUrl(returnUrl?: string) {
    const base = this.signUpUrl;
    const target = (returnUrl ?? this.returnUrl).trim();
    if (!target) return base;
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}returnUrl=${encodeURIComponent(target)}`;
  },
};
