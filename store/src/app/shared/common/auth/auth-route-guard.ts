import { PermissionCheckerService, RefreshTokenService } from 'src/app/shared/core';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanLoad,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { Observable } from 'rxjs/internal/Observable';
import { from, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { UrlHelper } from '../../helpers/UrlHelper';
import { AppSessionService } from '../../session/app-session.service';
import { idpAuthConfig } from '../../idp-auth/idp-auth.config';
import { getStoredAccessToken } from '../../idp-auth/auth-storage';
import { isTokenValid } from '../../idp-auth/jwt.utils';
import { TokenService } from '../../core/token.service';

@Injectable()
export class AppRouteGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(
    private _permissionChecker: PermissionCheckerService,
    private _router: Router,
    private _sessionService: AppSessionService,
    private _refreshTokenService: RefreshTokenService,
    private _tokenService: TokenService,
  ) {}

  private getAccessToken(): string | null {
    return getStoredAccessToken() || this._tokenService.getToken() || null;
  }

  private redirectToIdpLogin(state: RouterStateSnapshot | null): void {
    const returnUrl = state?.url ? `${window.location.origin}/#${state.url}` : window.location.href;
    window.location.href = idpAuthConfig.buildLoginUrl(returnUrl);
  }

  private ensureAuthenticated(state: RouterStateSnapshot | null): Observable<boolean> {
    let token = this.getAccessToken();
    if (isTokenValid(token)) {
      if (!this._sessionService.user) {
        return from(this._sessionService.ensureUserHydrated()).pipe(switchMap(() => of(true)));
      }
      return of(true);
    }

    return this._refreshTokenService.tryAuthWithRefreshToken().pipe(
      switchMap((refreshed) => {
        token = this.getAccessToken();
        if (refreshed && isTokenValid(token)) {
          return from(this._sessionService.ensureUserHydrated()).pipe(switchMap(() => of(true)));
        }

        if (idpAuthConfig.enabled && idpAuthConfig.loginUrl) {
          this.redirectToIdpLogin(state);
          return of(false);
        }

        this._router.navigate(['/auth/sign-in']);
        return of(false);
      }),
      catchError(() => {
        if (idpAuthConfig.enabled && idpAuthConfig.loginUrl) {
          this.redirectToIdpLogin(state);
          return of(false);
        }
        this._router.navigate(['/auth/sign-in']);
        return of(false);
      }),
    );
  }

  canActivateInternal(data: any, state: RouterStateSnapshot | null): Observable<boolean> {
    if (UrlHelper.isInstallUrl(location.href)) {
      return of(true);
    }

    if (idpAuthConfig.enabled) {
      return this.ensureAuthenticated(state).pipe(
        switchMap((authenticated) => {
          if (!authenticated) {
            return of(false);
          }

          if (!data || !data['permission']) {
            return of(true);
          }

          if (this._permissionChecker.isGranted(data['permission'])) {
            return of(true);
          }

          this._router.navigate([this.selectBestRoute()]);
          return of(false);
        }),
      );
    }

    if (!this._sessionService.user) {
      return this._refreshTokenService.tryAuthWithRefreshToken().pipe(
        switchMap((autResult) => {
          if (autResult) {
            return of(true);
          }
          this._router.navigate(['/auth/sign-in']);
          return of(false);
        }),
      );
    }

    if (!data || !data['permission']) {
      return of(true);
    }

    if (this._permissionChecker.isGranted(data['permission'])) {
      return of(true);
    }

    this._router.navigate([this.selectBestRoute()]);
    return of(false);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.canActivateInternal(route.data, state);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.canActivate(route, state);
  }

  canLoad(route: any): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivateInternal(route.data, null);
  }

  selectBestRoute(): string {
    return '/home';
  }
}
