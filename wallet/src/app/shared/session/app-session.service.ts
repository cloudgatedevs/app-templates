import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  UserLoginInfoDto,
  ApplicationInfoDto,
  TenantLoginInfoDto,
  AppInformationDto,
} from './session.models';
import { AppConsts } from '../AppConsts';
import { AppBranding } from '../branding/app-branding';
import { buildTenantBrandingLogoUrl, getDefaultLoginLogo } from '../branding/tenant-branding';
import { idpAuthConfig } from '../idp-auth/idp-auth.config';
import { IdpProfileService } from '../idp-auth/idp-profile.service';
import { getProfilePictureSrc, IdpProfile } from '../idp-auth/idp-profile.models';
import { getStoredAccessToken, getStoredRefreshToken, storeIdpTokens } from '../idp-auth/auth-storage';
import { isTokenValid, userFromIdpToken } from '../idp-auth/jwt.utils';
import { AppEventsService } from '../core/app-events.service';
import { TokenService } from '../core/token.service';

@Injectable({
  providedIn: 'root',
})
export class AppSessionService {
  private _user: UserLoginInfoDto | undefined;
  private _impersonatorUser: UserLoginInfoDto | undefined;
  private _tenant: TenantLoginInfoDto | undefined;
  private _impersonatorTenant: TenantLoginInfoDto | undefined;
  private _application: ApplicationInfoDto | undefined;
  private _platform: string | undefined;
  private _isIOS: boolean | undefined;
  private _profilePicture = AppConsts.appBaseUrl + '/assets/avatars/placeholder-profile.jpg';
  private _app: AppInformationDto | undefined;
  private _tenantLogoUrl: string | undefined;

  constructor(
    private readonly _idpProfileService: IdpProfileService,
    private readonly _appEvents: AppEventsService,
    private readonly _tokenService: TokenService,
  ) {}

  get application(): ApplicationInfoDto | undefined {
    return this._application;
  }

  get user(): UserLoginInfoDto | undefined {
    return this._user;
  }

  get userId(): number | null {
    return this.user ? this.user.id : null;
  }

  get tenant(): TenantLoginInfoDto | undefined {
    return this._tenant;
  }

  get tenancyName(): string | undefined {
    return this._tenant ? this.tenant?.tenancyName : '';
  }

  get tenantId(): number | null {
    return this.tenant?.id ?? null;
  }

  get impersonatorUser(): UserLoginInfoDto | undefined {
    return this._impersonatorUser;
  }

  get impersonatorUserId(): number | null {
    return this.impersonatorUser ? this.impersonatorUser.id : null;
  }

  get impersonatorTenant(): TenantLoginInfoDto | undefined {
    return this._impersonatorTenant;
  }

  set application(val: ApplicationInfoDto) {
    this._application = val;
  }

  get isIOS(): boolean | undefined {
    return this._isIOS;
  }

  get isMobile(): boolean | undefined {
    return this._platform == 'ios' || this._platform == 'android';
  }

  get profilePicture(): string | undefined {
    return this._profilePicture;
  }

  get app(): AppInformationDto | undefined {
    return this._app;
  }

  get appUrl(): string | undefined {
    return this._app?.appUrl;
  }

  get saasType(): number | undefined {
    return this._app?.saaSType;
  }

  get appIcon(): string | undefined {
    return this._tenantLogoUrl ?? AppBranding.appIcon;
  }

  get loginLogo(): string {
    return this._tenantLogoUrl ?? getDefaultLoginLogo();
  }

  /** Use the public branding URL directly — img tags load cross-origin without CORS (fetch does not). */
  private applyTenantBrandingUrl(): void {
    const tenancyName = this._tenant?.tenancyName ?? idpAuthConfig.tenancyName;
    const logoUrl = buildTenantBrandingLogoUrl(tenancyName);
    if (!logoUrl) {
      return;
    }

    if (this._tenantLogoUrl === logoUrl) {
      return;
    }

    this._tenantLogoUrl = logoUrl;
    this._appEvents.trigger('app.branding.changed');
  }

  clearTenantBrandingUrl(): void {
    if (!this._tenantLogoUrl) {
      return;
    }
    this._tenantLogoUrl = undefined;
    this._appEvents.trigger('app.branding.changed');
  }

  setUser(name: string, surname: string) {
    this._user!.name = name;
    this._user!.surname = surname;
  }

  applyIdpProfileUpdate(profile: Pick<IdpProfile, 'name' | 'surname' | 'email' | 'photoUrl'>) {
    if (!this._user) return;
    if (profile.name != null) this._user.name = profile.name;
    if (profile.surname != null) this._user.surname = profile.surname;
    if (profile.email != null) {
      this._user.emailAddress = profile.email;
      this._user.userName = profile.email;
    }
    const photo = getProfilePictureSrc(profile);
    if (photo) {
      this._profilePicture = photo;
    }
  }

  isBusy: boolean | undefined;

  init(): Promise<boolean> {
    this._platform = Capacitor.getPlatform();
    this._isIOS = this._platform == 'ios';
    this.applyTenantBrandingUrl();

    return this.ensureUserHydrated().then(() => {
      if (this._user) {
        this._appEvents.trigger('abp.session.user');
      }
      this.applyTenantBrandingUrl();
      return true;
    });
  }

  async ensureUserHydrated(): Promise<void> {
    let accessToken = getStoredAccessToken() || this._tokenService.getToken() || '';

    if (!isTokenValid(accessToken)) {
      const refreshed = await this.tryRefreshAccessToken();
      if (refreshed) {
        accessToken = refreshed;
      }
    }

    if (!isTokenValid(accessToken)) {
      return;
    }

    await this.hydrateUserFromIdpProfile();
    if (!this._user) {
      this.applyUserFromJwt(accessToken);
    }
  }

  getShownLoginName(): string | undefined {
    return this._user?.userName;
  }

  private async hydrateUserFromIdpProfile(): Promise<void> {
    const token = getStoredAccessToken() || this._tokenService.getToken();
    if (!isTokenValid(token) || !idpAuthConfig.tenancyName) return;

    const profile = await this._idpProfileService.getProfile(token!, idpAuthConfig.tenancyName);
    if (!profile) return;

    this.applyProfileToSession(profile);
  }

  private applyProfileToSession(profile: IdpProfile): void {
    const numericId =
      typeof profile.id === 'number' ? profile.id : parseInt(String(profile.id), 10) || 0;
    const user = new UserLoginInfoDto();
    user.id = numericId;
    user.name = profile.name ?? '';
    user.surname = profile.surname ?? '';
    user.emailAddress = profile.email ?? '';
    user.userName = profile.email ?? '';
    this._user = user;

    const photo = getProfilePictureSrc(profile);
    if (photo) {
      this._profilePicture = photo;
    }

    this.ensureTenantFromConfig();
  }

  private applyUserFromJwt(accessToken: string): void {
    const claims = userFromIdpToken(accessToken);
    if (!claims) return;

    const parts = String(claims.displayName || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const user = new UserLoginInfoDto();
    user.id = parseInt(String(claims.id), 10) || 0;
    user.name = parts[0] ?? claims.displayName ?? 'User';
    user.surname = parts.length > 1 ? parts.slice(1).join(' ') : '';
    user.emailAddress = claims.email ?? '';
    user.userName = claims.email ?? claims.displayName ?? '';
    this._user = user;

    if (claims.photoURL) {
      this._profilePicture = claims.photoURL;
    }

    this.ensureTenantFromConfig();
  }

  private ensureTenantFromConfig(): void {
    if (!this._tenant && idpAuthConfig.tenancyName) {
      const tenant = new TenantLoginInfoDto();
      tenant.tenancyName = idpAuthConfig.tenancyName;
      this._tenant = tenant;
    }
  }

  private async tryRefreshAccessToken(): Promise<string | null> {
    if (!idpAuthConfig.enabled) return null;

    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) return null;

    const result = await this._idpProfileService.refreshToken(refreshToken);
    if (!result || !isTokenValid(result.accessToken)) return null;

    storeIdpTokens(result.accessToken, result.refreshToken, result.expiresIn);
    this._tokenService.setToken(result.accessToken);
    this._tokenService.setRefreshToken(result.refreshToken);
    return result.accessToken;
  }
}
