import axios from 'axios';
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { idpAuthConfig } from './idpAuthConfig';
import { getIdpProfile, getProfilePictureSrc, idpRefreshToken, updateIdpProfile } from './idpProfileApi';
import { getTokenExpiry, isTokenValid, userFromIdpToken } from './jwtUtils';
import {
  clearIdpSession,
  getStoredAccessToken,
  getStoredRefreshToken,
  removeGlobalHeaders,
  setGlobalHeaders,
  storeIdpTokens,
  IDP_ACCESS_TOKEN_EXPIRY_KEY,
} from './authHelpers';

const AuthContext = createContext(null);

const REFRESH_COOLDOWN_MS = 5000;
const ACCESS_TOKEN_EXPIRY_BUFFER_SECONDS = 30;

/** @param {import('./idpProfileApi').IdpProfileDto | Record<string, unknown>} profile */
function buildCurrentUser(profile, tenancyName) {
  return {
    user: {
      id: profile.id,
      name: profile.name ?? '',
      surname: profile.surname ?? '',
      emailAddress: profile.email ?? '',
      userName: profile.email ?? '',
      photoUrl: getProfilePictureSrc(profile),
      role: profile.role ?? null,
    },
    tenant: { tenancyName: tenancyName ?? idpAuthConfig.tenancyName },
  };
}

/** @param {string} accessToken */
function buildCurrentUserFromJwt(accessToken) {
  const base = userFromIdpToken(accessToken);
  if (!base) return null;
  const parts = String(base.displayName || '').trim().split(/\s+/).filter(Boolean);
  const name = parts[0] ?? base.displayName ?? 'User';
  const surname = parts.length > 1 ? parts.slice(1).join(' ') : '';
  return {
    user: {
      id: base.id,
      name,
      surname,
      emailAddress: base.email ?? '',
      userName: base.email ?? '',
      photoUrl: base.photoURL,
    },
    tenant: { tenancyName: idpAuthConfig.tenancyName },
  };
}

const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);

  const refreshInFlightRef = useRef(null);
  const logoutRef = useRef(() => {});

  const applyTokens = useCallback((accessToken, refreshToken, expiresIn) => {
    storeIdpTokens({ accessToken, refreshToken, expiresIn });
    setGlobalHeaders({ Authorization: `Bearer ${accessToken}` });
    setAuth({ accessToken, refreshToken: refreshToken || getStoredRefreshToken() || undefined });
  }, []);

  const tryRefresh = useCallback(async () => {
    if (!idpAuthConfig.enabled) return null;
    const stored = getStoredRefreshToken();
    if (!stored) return null;
    const result = await idpRefreshToken(stored);
    if (!result || !isTokenValid(result.accessToken)) return null;
    applyTokens(result.accessToken, result.refreshToken, result.expiresIn);
    return result.accessToken;
  }, [applyTokens]);

  const tryRefreshOnce = useCallback(async () => {
    let p = refreshInFlightRef.current;
    if (!p) {
      p = tryRefresh();
      refreshInFlightRef.current = p;
      p.finally(() => {
        setTimeout(() => {
          refreshInFlightRef.current = null;
        }, REFRESH_COOLDOWN_MS);
      });
    }
    return p;
  }, [tryRefresh]);

  const loadProfile = useCallback(async (accessToken) => {
    if (idpAuthConfig.tenancyName) {
      const profile = await getIdpProfile(accessToken, idpAuthConfig.tenancyName);
      if (profile) {
        setCurrentUser(buildCurrentUser(profile));
        return;
      }
    }
    const fb = buildCurrentUserFromJwt(accessToken);
    if (fb) setCurrentUser(fb);
  }, []);

  const logout = useCallback((redirectToLogin = true) => {
    clearIdpSession();
    removeGlobalHeaders(['Authorization']);
    setAuth(undefined);
    setCurrentUser(undefined);
    if (redirectToLogin && idpAuthConfig.enabled && idpAuthConfig.loginUrl) {
      window.location.href = idpAuthConfig.buildLoginUrl();
    }
  }, []);

  logoutRef.current = logout;

  const updateUserProfile = useCallback(async ({ name, surname, email }) => {
    const token = getStoredAccessToken();
    if (!token || !idpAuthConfig.tenancyName) {
      throw new Error('IdP session is not available. Sign in again.');
    }
    const updated = await updateIdpProfile(token, idpAuthConfig.tenancyName, { name, surname, email });
    if (!updated) throw new Error('Profile update failed');
    setCurrentUser(buildCurrentUser(updated));
  }, []);

  // Bootstrap: consume tokens from the IdP redirect URL, or restore the stored session.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get('access_token');
      const refreshFromUrl = params.get('refresh_token');
      const expiresInFromUrl = params.get('expires_in');

      if (tokenFromUrl && isTokenValid(tokenFromUrl)) {
        const expiresIn = expiresInFromUrl != null ? Number(expiresInFromUrl) : undefined;
        applyTokens(tokenFromUrl, refreshFromUrl || undefined, Number.isFinite(expiresIn) ? expiresIn : undefined);

        params.delete('access_token');
        params.delete('refresh_token');
        params.delete('expires_in');
        const search = params.toString();
        window.history.replaceState(
          {},
          '',
          window.location.pathname + (search ? `?${search}` : '') + (window.location.hash || ''),
        );

        if (!cancelled) await loadProfile(tokenFromUrl);
        if (!cancelled) setLoading(false);
        return;
      }

      let accessToken = getStoredAccessToken() || '';

      if (!isTokenValid(accessToken)) {
        const refreshed = await tryRefreshOnce();
        if (refreshed) accessToken = refreshed;
      }

      if (!isTokenValid(accessToken)) {
        clearIdpSession();
        if (!cancelled) {
          setAuth(undefined);
          setCurrentUser(undefined);
          setLoading(false);
        }
        return;
      }

      setGlobalHeaders({ Authorization: `Bearer ${accessToken}` });
      if (!cancelled) {
        setAuth({ accessToken, refreshToken: getStoredRefreshToken() || undefined });
        await loadProfile(accessToken);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyTokens, loadProfile, tryRefreshOnce]);

  // Axios 401: refresh once, then retry the original request.
  useEffect(() => {
    const id = axios.interceptors.response.use(
      (res) => res,
      async (error) => {
        const originalRequest = error.config || {};
        const status = error.response?.status;
        if (status !== 401 || originalRequest._retry) {
          return Promise.reject(error);
        }
        const url = typeof originalRequest.url === 'string' ? originalRequest.url : '';
        if (url.includes('/api/idp/') && url.includes('/Refresh')) {
          return Promise.reject(error);
        }
        if (!idpAuthConfig.enabled) {
          logoutRef.current(true);
          return Promise.reject(error);
        }
        originalRequest._retry = true;
        const newToken = await tryRefreshOnce();
        if (newToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalRequest);
        }
        logoutRef.current(true);
        return Promise.reject(error);
      },
    );
    return () => axios.interceptors.response.eject(id);
  }, [tryRefreshOnce]);

  // Proactive refresh shortly before the access token expires.
  useEffect(() => {
    if (!auth?.accessToken || !idpAuthConfig.enabled) return undefined;

    const checkAndRefresh = async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      let rawStored = null;
      try {
        rawStored = localStorage.getItem(IDP_ACCESS_TOKEN_EXPIRY_KEY);
      } catch {
        /* noop */
      }
      const storedExpiry = rawStored != null ? Number(rawStored) : null;
      const expirySeconds =
        storedExpiry != null && Number.isFinite(storedExpiry)
          ? storedExpiry
          : getTokenExpiry(auth.accessToken);
      if (expirySeconds == null) return;
      if (expirySeconds - ACCESS_TOKEN_EXPIRY_BUFFER_SECONDS > nowSeconds) return;
      const newToken = await tryRefreshOnce();
      if (!newToken && !isTokenValid(auth.accessToken)) {
        logoutRef.current(true);
      }
    };

    checkAndRefresh();
    const intervalId = setInterval(checkAndRefresh, 5000);
    return () => clearInterval(intervalId);
  }, [auth?.accessToken, tryRefreshOnce]);

  const value = useMemo(
    () => ({
      loading,
      auth,
      currentUser,
      headerUser: currentUser,
      logout,
      updateUser: updateUserProfile,
      refreshLoginDetails: async () => {
        const token = getStoredAccessToken();
        if (token) await loadProfile(token);
      },
    }),
    [loading, auth, currentUser, logout, updateUserProfile, loadProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
