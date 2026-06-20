import axios from 'axios';
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
  try {
    const { data } = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });
    return normalizeTokenResult(data);
  } catch (error) {
    throw new Error(parseIdpError(error, error.response));
  }
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
  return postIdp('Login', body);
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
  return postIdp('Register', body);
}

/**
 * @param {{ email: string; recaptchaToken?: string; recaptchaSecret?: string }} input
 */
export async function idpRequestPasswordReset(input) {
  const url = `${getBasePath()}/RequestPasswordReset`;
  const body = {
    email: input.email,
    ...(input.recaptchaToken && { recaptchaToken: input.recaptchaToken }),
    ...(input.recaptchaSecret && { recaptchaSecret: input.recaptchaSecret }),
  };
  try {
    await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });
  } catch (error) {
    throw new Error(parseIdpError(error, error.response));
  }
}

/**
 * @param {{ userId: number; resetCode: string; expireDate: string; tenantId: number; password: string; recaptchaToken?: string; recaptchaSecret?: string }} input
 */
export async function idpResetPassword(input) {
  const url = `${getBasePath()}/ResetPassword`;
  const body = {
    userId: input.userId,
    resetCode: input.resetCode,
    expireDate: input.expireDate,
    tenantId: input.tenantId,
    password: input.password,
    ...(input.recaptchaToken && { recaptchaToken: input.recaptchaToken }),
    ...(input.recaptchaSecret && { recaptchaSecret: input.recaptchaSecret }),
  };
  try {
    await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });
  } catch (error) {
    throw new Error(parseIdpError(error, error.response));
  }
}

/** @returns {string | null} */
export function getBrandingLogoUrl() {
  return idpConfig.getBrandingLogoUrl();
}
