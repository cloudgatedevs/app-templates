import { jwtDecode } from 'jwt-decode';

/** @param {string} accessToken */
export function isTokenValid(accessToken) {
  if (!accessToken) return false;
  try {
    const decoded = jwtDecode(accessToken);
    const now = Date.now() / 1000;
    if (typeof decoded.exp !== 'number') return false;
    return decoded.exp > now;
  } catch {
    return false;
  }
}

/** @param {string} accessToken @returns {number | null} */
export function getTokenExpiry(accessToken) {
  if (!accessToken) return null;
  try {
    const decoded = jwtDecode(accessToken);
    return typeof decoded.exp === 'number' ? decoded.exp : null;
  } catch {
    return null;
  }
}

/**
 * Build a minimal user display from IdP JWT claims (fallback when the profile API is unavailable).
 * @param {string} accessToken
 */
export function userFromIdpToken(accessToken) {
  try {
    const decoded = jwtDecode(accessToken);
    const namePart =
      decoded.name || [decoded.given_name, decoded.family_name].filter(Boolean).join(' ').trim();
    const displayName = namePart || decoded.email || decoded.sub || 'User';
    return {
      id: decoded.sub ?? '',
      displayName,
      email: decoded.email,
      photoURL: undefined,
    };
  } catch {
    return null;
  }
}
