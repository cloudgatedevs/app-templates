import { idpConfig } from '@/config/idpConfig';

/**
 * Build reCAPTCHA payload for IdP API requests using the tenant recaptchaSecret.
 * @returns {Promise<{ recaptchaSecret: string }>}
 */
export async function getRecaptchaPayload() {
  if (idpConfig.recaptchaSecret) {
    return { recaptchaSecret: idpConfig.recaptchaSecret };
  }
  throw new Error(
    'reCAPTCHA is not configured. Set VITE_IDP_RECAPTCHA_SECRET in .env to the recaptchaSecret value from Cloudgate IdP Settings.',
  );
}
