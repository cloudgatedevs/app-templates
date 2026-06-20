import { Injectable } from '@angular/core';
import { RefreshTokenService } from '../core/refresh-token.service';
import { TokenService } from '../core/token.service';
import { Observable, Subject, of } from 'rxjs';
import { AppConsts } from '../AppConsts';
import { LocalStorageService } from 'src/app/shared/utils/local-storage.service';
import { clearIdpSessionAndAbp } from '../idp-auth/idp-auth.bootstrap';
import { idpAuthConfig } from '../idp-auth/idp-auth.config';
import { IdpProfileService } from '../idp-auth/idp-profile.service';
import { getStoredRefreshToken, storeIdpTokens } from '../idp-auth/auth-storage';
import { isTokenValid } from '../idp-auth/jwt.utils';

@Injectable({
  providedIn: 'root',
})
export class CloudgateAuthService implements RefreshTokenService {
  constructor(
    private readonly _tokenService: TokenService,
    private readonly _idpProfileService: IdpProfileService,
  ) {}

  tryAuthWithRefreshToken(): Observable<boolean> {
    if (!idpAuthConfig.enabled) {
      return of(false);
    }
    return this.tryIdpRefresh();
  }

  logout(reload?: boolean, returnUrl?: string): void {
    clearIdpSessionAndAbp();
    new LocalStorageService().removeItem(AppConsts.authorization.encrptedAuthTokenName, () => {
      if (reload === false) {
        return;
      }
      if (returnUrl) {
        location.href = returnUrl;
      } else if (idpAuthConfig.loginUrl) {
        location.href = idpAuthConfig.buildLoginUrl();
      } else {
        location.href = '';
      }
    });
  }

  clearSession(): void {
    clearIdpSessionAndAbp();
  }

  private tryIdpRefresh(): Observable<boolean> {
    const refreshTokenObservable = new Subject<boolean>();
    const stored = getStoredRefreshToken();
    if (!stored) {
      return of(false);
    }

    void this._idpProfileService.refreshToken(stored).then((result) => {
      if (!result || !isTokenValid(result.accessToken)) {
        refreshTokenObservable.next(false);
        refreshTokenObservable.complete();
        return;
      }

      storeIdpTokens(result.accessToken, result.refreshToken, result.expiresIn);
      const tokenExpireDate = new Date(new Date().getTime() + 1000 * result.expiresIn);
      this._tokenService.setToken(result.accessToken, tokenExpireDate);
      this._tokenService.setRefreshToken(result.refreshToken);
      refreshTokenObservable.next(true);
      refreshTokenObservable.complete();
    });

    return refreshTokenObservable;
  }
}
