import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AppSessionService } from 'src/app/shared/session/app-session.service';

@Injectable()
export class AccountRouteGuard implements CanActivate {
  constructor(
    private _router: Router,
    private _sessionService: AppSessionService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (route.queryParams['ss'] && route.queryParams['ss'] === 'true') {
      return true;
    }

    if (this._sessionService.user) {
      this._router.navigate([this.selectBestRoute()]);
      return false;
    }

    return true;
  }

  selectBestRoute(): string {
    return '/home';
  }
}
