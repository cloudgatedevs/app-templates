import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { CloudgateAuthService } from 'src/app/shared/auth/cloudgate-auth.service';
import { AuthHttpInterceptor } from 'src/app/shared/core/auth-http.interceptor';
import { RefreshTokenService } from 'src/app/shared/core/refresh-token.service';

@NgModule({
  providers: [
    { provide: RefreshTokenService, useClass: CloudgateAuthService },
    { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },
  ],
})
export class ServiceProxyModule {}
