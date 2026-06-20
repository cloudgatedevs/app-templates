import { Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { idpAuthConfig } from 'src/app/shared/idp-auth/idp-auth.config';
import { getStoredAccessToken } from 'src/app/shared/idp-auth/auth-storage';
import { isTokenValid } from 'src/app/shared/idp-auth/jwt.utils';
import { TokenService } from 'src/app/shared/core/token.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  standalone: true,
  imports: [],
})
export class SignInComponent extends AppComponentBase implements OnInit {
  protected redirecting = false;

  constructor(injector: Injector, private readonly _tokenService: TokenService) {
    super(injector);
  }

  ngOnInit(): void {
    if (idpAuthConfig.enabled) {
      const token = getStoredAccessToken() || this._tokenService.getToken();
      if (isTokenValid(token)) {
        window.location.href = '/#/home';
        return;
      }
      this.redirecting = true;
      window.location.href = idpAuthConfig.buildLoginUrl(window.location.href);
      return;
    }

    this.redirecting = true;
    if (!idpAuthConfig.baseUrl) {
      this.message.warn('IdP login is not configured. Set idpBaseUrl in assets/appconfig.json.');
      return;
    }
    this.message.warn(
      'IdP tenancy is not configured. Set idpTenancyName in assets/appconfig.json or open the app on a tenant subdomain (e.g. myapi.localhost:3000).',
    );
  }
}
