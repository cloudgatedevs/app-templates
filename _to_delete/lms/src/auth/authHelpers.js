import axios from 'axios';
import { isTokenValid } from './jwtUtils';

export const IDP_ACCESS_TOKEN_KEY = 'idp_access_token';
export const IDP_REFRESH_TOKEN_KEY = 'idp_refresh_token';
export const IDP_ACCESS_TOKEN_EXPIRY_KEY = 'idp_access_token_expiry';

export function getStoredAccessToken() {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(IDP_ACCESS_TOKEN_KEY) : null;
  } catch {
    return null;
  }
}

export function getStoredRefreshToken() {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(IDP_REFRESH_TOKEN_KEY) : null;
  } catch {
    return null;
  }
}

/**
 * @param {{ accessToken: string; refreshToken?: string; expiresIn?: number }} tokens
 */
export function storeIdpTokens({ accessToken, refreshToken, expiresIn }) {
  if (!accessToken) return;
  try {
    localStorage.setItem(IDP_ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(IDP_REFRESH_TOKEN_KEY, refreshToken);
    const seconds = Number(expiresIn) || 0;
    if (seconds > 0) {
      const expiryUnix = Math.floor(Date.now() / 1000) + Math.max(0, Math.floor(seconds));
      localStorage.setItem(IDP_ACCESS_TOKEN_EXPIRY_KEY, String(expiryUnix));
    }
  } catch {
    /* noop */
  }
}

export function clearIdpSession() {
  try {
    localStorage.removeItem(IDP_ACCESS_TOKEN_KEY);
    localStorage.removeItem(IDP_REFRESH_TOKEN_KEY);
    localStorage.removeItem(IDP_ACCESS_TOKEN_EXPIRY_KEY);
  } catch {
    /* noop */
  }
}

/** @param {Record<string, string>} headers */
export function setGlobalHeaders(headers) {
  if (headers.Authorization) {
    axios.defaults.headers.common.Authorization = headers.Authorization;
  }
}

/** @param {string[]} names */
export function removeGlobalHeaders(names = []) {
  names.forEach((n) => {
    if (n === 'Authorization') delete axios.defaults.headers.common.Authorization;
  });
}

/**
 * Attach the stored IdP bearer token to every outgoing request.
 * @param {import('axios').AxiosInstance} axiosInstance
 */
export function setupAxios(axiosInstance) {
  axiosInstance.defaults.headers.Accept = 'application/json';
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getStoredAccessToken();
      config.headers = config.headers || {};
      if (token && isTokenValid(token) && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (err) => Promise.reject(err),
  );
}
