import { Injectable } from '@angular/core';
import {
  getStoredAccessToken,
  getStoredRefreshToken,
  JWT_ACCESS_TOKEN_KEY,
  JWT_REFRESH_TOKEN_KEY,
} from '../idp-auth/auth-storage';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  getToken(): string | null {
    return getStoredAccessToken();
  }

  getTokenCookieName(): string {
    return JWT_ACCESS_TOKEN_KEY;
  }

  clearToken(): void {
    try {
      localStorage.removeItem(JWT_ACCESS_TOKEN_KEY);
    } catch {
      /* noop */
    }
  }

  setToken(authToken: string, _expireDate?: Date): void {
    if (!authToken) {
      this.clearToken();
      return;
    }
    try {
      localStorage.setItem(JWT_ACCESS_TOKEN_KEY, authToken);
    } catch {
      /* noop */
    }
  }

  getRefreshToken(): string | null {
    return getStoredRefreshToken();
  }

  getRefreshTokenCookieName(): string {
    return JWT_REFRESH_TOKEN_KEY;
  }

  clearRefreshToken(): void {
    try {
      localStorage.removeItem(JWT_REFRESH_TOKEN_KEY);
    } catch {
      /* noop */
    }
  }

  setRefreshToken(refreshToken: string, _expireDate?: Date): void {
    if (!refreshToken) {
      this.clearRefreshToken();
      return;
    }
    try {
      localStorage.setItem(JWT_REFRESH_TOKEN_KEY, refreshToken);
    } catch {
      /* noop */
    }
  }
}
