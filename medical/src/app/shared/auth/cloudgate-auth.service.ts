import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { RefreshTokenService } from '../core/refresh-token.service';
import { AppConsts } from '../AppConsts';
import { LocalStorageService } from 'src/app/shared/utils/local-storage.service';
import { cloudgateAuth } from '../cloudgate/cloudgate';
import { clearIdpSessionAndAbp } from '../idp-auth/idp-auth.bootstrap';
import { idpAuthConfig } from '../idp-auth/idp-auth.config';

@Injectable({
  providedIn: 'root',
})
export class CloudgateAuthService implements RefreshTokenService {
  tryAuthWithRefreshToken(): Observable<boolean> {
    if (!idpAuthConfig.enabled) {
      return of(false);
    }
    // @cloudgatedevs/cloudgate-client refreshes AND persists the new tokens.
    return from(cloudgateAuth().refresh().then((tokens) => Boolean(tokens)));
  }

  logout(reload?: boolean, returnUrl?: string): void {
    clearIdpSessionAndAbp();
    new LocalStorageService().removeItem(AppConsts.authorization.encrptedAuthTokenName, () => {
      if (reload === false) {
        return;
      }
      if (returnUrl) {
        location.href = returnUrl;
      } else if (idpAuthConfig.enabled) {
        location.href = idpAuthConfig.buildLoginUrl();
      } else {
        location.href = '';
      }
    });
  }

  clearSession(): void {
    clearIdpSessionAndAbp();
  }
}
