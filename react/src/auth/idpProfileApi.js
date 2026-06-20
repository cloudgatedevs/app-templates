/**
 * IdP profile + refresh API.
 */
import axios from 'axios';
import { idpAuthConfig } from './idpAuthConfig';

/**
 * @typedef {{ accessToken: string; refreshToken: string; expiresIn: number; returnUrl?: string }} IdpTokenResult
 */

/**
 * @param {string} refreshToken
 * @returns {Promise<IdpTokenResult | null>}
 */
export async function idpRefreshToken(refreshToken) {
  const base = idpAuthConfig.apiUrl?.replace(/\/$/, '');
  const tenancyName = idpAuthConfig.tenancyName;
  if (!base || !tenancyName || !refreshToken) return null;
  const url = `${base}/api/idp/${encodeURIComponent(tenancyName)}/Refresh`;
  try {
    const body = { refreshToken, RefreshToken: refreshToken };
    const { data: raw } = await axios.post(url, body, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
    const data = raw?.result ?? raw;
    const accessToken = data.accessToken ?? data.AccessToken;
    const newRefresh = data.refreshToken ?? data.RefreshToken;
    const expiresIn = data.expiresIn ?? data.ExpiresIn ?? 0;
    if (!accessToken) return null;
    return {
      accessToken,
      refreshToken: newRefresh || refreshToken,
      expiresIn,
      returnUrl: data.returnUrl,
    };
  } catch {
    return null;
  }
}

/** @returns {string} */
export function getProfileDisplayName(profile) {
  const namePart = [profile?.name, profile?.surname].filter(Boolean).join(' ').trim();
  return namePart || profile?.email || 'User';
}

/** @returns {string | undefined} */
export function getProfilePictureSrc(profile) {
  const photoUrl = profile?.photoUrl ?? profile?.PhotoUrl;
  return photoUrl && typeof photoUrl === 'string' ? photoUrl.trim() || undefined : undefined;
}

/**
 * @param {string} accessToken
 * @param {string} tenancyName
 */
export async function getIdpProfile(accessToken, tenancyName) {
  const base = idpAuthConfig.apiUrl?.replace(/\/$/, '');
  if (!base || !tenancyName) return null;
  const url = `${base}/api/idp/${encodeURIComponent(tenancyName)}/profile`;
  try {
    const { data } = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const r = data?.result ?? data;
    if (!r || typeof r !== 'object' || r.id == null) return null;
    return {
      id: r.id,
      email: r.email ?? r.Email ?? undefined,
      name: r.name ?? r.Name ?? undefined,
      surname: r.surname ?? r.Surname ?? undefined,
      photoUrl: r.photoUrl ?? r.PhotoUrl ?? null,
      role: r.role ?? r.Role ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * @param {string} accessToken
 * @param {string} tenancyName
 * @param {{ name?: string; surname?: string; email?: string }} input
 */
export async function updateIdpProfile(accessToken, tenancyName, input) {
  const base = idpAuthConfig.apiUrl?.replace(/\/$/, '');
  if (!base || !tenancyName || !accessToken) return null;
  const url = `${base}/api/idp/${encodeURIComponent(tenancyName)}/profile`;
  try {
    const { data } = await axios.put(url, input, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const r = data?.result ?? data;
    if (!r || typeof r !== 'object') return null;
    const id = r.id ?? r.Id;
    if (id == null && r.name == null && r.Name == null && r.email == null && r.Email == null) return null;
    return {
      id: id ?? 0,
      email: r.email ?? r.Email ?? undefined,
      name: r.name ?? r.Name ?? undefined,
      surname: r.surname ?? r.Surname ?? undefined,
      photoUrl: r.photoUrl ?? r.PhotoUrl ?? null,
      role: r.role ?? r.Role ?? null,
    };
  } catch {
    return null;
  }
}
