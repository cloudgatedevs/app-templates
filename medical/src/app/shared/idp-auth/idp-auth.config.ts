// IdP URLs and tenancy — delegated to @cloudgatedevs/cloudgate-client where
// covered (tenancy resolution, login URL). The sign-up URL and the configured
// post-login return URL are app concerns the package intentionally leaves out.
import { AppConsts } from '../AppConsts';
import { cloudgateAuth } from '../cloudgate/cloudgate';

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
    return cloudgateAuth().tenancyName;
  },
  get enabled() {
    return cloudgateAuth().enabled;
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
    return cloudgateAuth().loginUrl((returnUrl ?? this.returnUrl).trim() || undefined);
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
