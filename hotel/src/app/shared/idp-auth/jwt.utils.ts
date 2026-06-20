import { jwtDecode } from 'jwt-decode';

export function isTokenValid(accessToken: string | null | undefined): boolean {
  if (!accessToken) return false;
  try {
    const decoded = jwtDecode<{ exp?: number }>(accessToken);
    const now = Date.now() / 1000;
    return typeof decoded.exp === 'number' && decoded.exp > now;
  } catch {
    return false;
  }
}

export function getTokenExpiry(accessToken: string | null | undefined): number | null {
  if (!accessToken) return null;
  try {
    const decoded = jwtDecode<{ exp?: number }>(accessToken);
    return typeof decoded.exp === 'number' ? decoded.exp : null;
  } catch {
    return null;
  }
}

export function userFromIdpToken(accessToken: string) {
  try {
    const decoded = jwtDecode<{
      sub?: string;
      name?: string;
      given_name?: string;
      family_name?: string;
      email?: string;
    }>(accessToken);
    const namePart =
      decoded.name || [decoded.given_name, decoded.family_name].filter(Boolean).join(' ').trim();
    const displayName = namePart || decoded.email || decoded.sub || 'User';
    return {
      id: decoded.sub ?? '',
      displayName,
      email: decoded.email,
      photoURL: undefined as string | undefined,
    };
  } catch {
    return null;
  }
}
