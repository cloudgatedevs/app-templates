// Direct IdP API calls (Login / Register / password reset).
//
// NOTE: this template IS the hosted login UI, so it talks to the IdP's
// credentialed endpoints directly. The `createCloudgateAuth` flow in
// @cloudgatedevs/cloudgate-client is for apps CONSUMING this hosted login —
// those endpoints are intentionally outside the package's scope.
import { idpConfig } from '@/config/idpConfig';
import { normalizeTokenResult, parseIdpError } from '@/utils/errors';

function getBasePath(tenancyName) {
  const base = idpConfig.apiUrl;
  const tenant = tenancyName || idpConfig.tenancyName;
  if (!base || !tenant) {
    throw new Error('IdP is not configured. Set VITE_IDP_API_URL and VITE_IDP_TENANCY_NAME.');
  }
  return `${base}/api/idp/${encodeURIComponent(tenant)}`;
}

async function postIdp(path, body) {
  const url = `${getBasePath()}/${path}`;
  let res;
  let data = null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    res = await fetch(url, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
  } catch (error) {
    throw new Error(parseIdpError(error, null));
  }
  if (!res.ok) {
    throw new Error(parseIdpError(null, { status: res.status, data }));
  }
  return data;
}

/**
 * @param {{ email: string; password: string; returnUrl?: string; recaptchaToken?: string; recaptchaSecret?: string }} input
 */
export async function idpLogin(input) {
  const body = {
    email: input.email,
    password: input.password,
    ...(input.returnUrl && { returnUrl: input.returnUrl }),
    ...(input.recaptchaToken && { recaptchaToken: input.recaptchaToken }),
    ...(input.recaptchaSecret && { recaptchaSecret: input.recaptchaSecret }),
  };
  return normalizeTokenResult(await postIdp('Login', body));
}

/**
 * @param {{ email: string; password: string; name?: string; surname?: string; returnUrl?: string; isEmailConfirmed?: boolean; recaptchaToken?: string; recaptchaSecret?: string }} input
 */
export async function idpRegister(input) {
  const body = {
    email: input.email,
    password: input.password,
    name: input.name,
    surname: input.surname,
    isEmailConfirmed: input.isEmailConfirmed ?? false,
    ...(input.returnUrl && { returnUrl: input.returnUrl }),
    ...(input.recaptchaToken && { recaptchaToken: input.recaptchaToken }),
    ...(input.recaptchaSecret && { recaptchaSecret: input.recaptchaSecret }),
  };
  return normalizeTokenResult(await postIdp('Register', body));
}

/**
 * @param {{ email: string; recaptchaToken?: string; recaptchaSecret?: string }} input
 */
export async function idpRequestPasswordReset(input) {
  const body = {
    email: input.email,
    ...(input.recaptchaToken && { recaptchaToken: input.recaptchaToken }),
    ...(input.recaptchaSecret && { recaptchaSecret: input.recaptchaSecret }),
  };
  await postIdp('RequestPasswordReset', body);
}

/**
 * @param {{ userId: number; resetCode: string; expireDate: string; tenantId: number; password: string; recaptchaToken?: string; recaptchaSecret?: string }} input
 */
export async function idpResetPassword(input) {
  const body = {
    userId: input.userId,
    resetCode: input.resetCode,
    expireDate: input.expireDate,
    tenantId: input.tenantId,
    password: input.password,
    ...(input.recaptchaToken && { recaptchaToken: input.recaptchaToken }),
    ...(input.recaptchaSecret && { recaptchaSecret: input.recaptchaSecret }),
  };
  await postIdp('ResetPassword', body);
}

/** @returns {string | null} */
export function getBrandingLogoUrl() {
  return idpConfig.getBrandingLogoUrl();
}
