// JWT helpers — thin wrappers over @cloudgatedevs/cloudgate-client.
import {
  decodeJwt,
  isTokenValid as packageIsTokenValid,
} from '@cloudgatedevs/cloudgate-client';

export function isTokenValid(accessToken: string | null | undefined): boolean {
  return accessToken ? packageIsTokenValid(accessToken) : false;
}

export function getTokenExpiry(accessToken: string | null | undefined): number | null {
  if (!accessToken) return null;
  const claims = decodeJwt(accessToken);
  return typeof claims?.['exp'] === 'number' ? (claims['exp'] as number) : null;
}

export function userFromIdpToken(accessToken: string) {
  const decoded = decodeJwt(accessToken) as {
    sub?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    email?: string;
  } | null;
  if (!decoded) return null;
  const namePart =
    decoded.name || [decoded.given_name, decoded.family_name].filter(Boolean).join(' ').trim();
  const displayName = namePart || decoded.email || decoded.sub || 'User';
  return {
    id: decoded.sub ?? '',
    displayName,
    email: decoded.email,
    photoURL: undefined as string | undefined,
  };
}
