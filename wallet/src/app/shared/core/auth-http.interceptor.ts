import { Injectable, Injector } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { getCookieValue } from './cookie.util';
import { TENANT_ID_COOKIE_NAME } from './multi-tenancy.util';
import { TokenService } from './token.service';
import { RefreshTokenService } from './refresh-token.service';
import { AppHttpConfigurationService } from './app-http-configuration.service';

@Injectable()
export class AuthHttpInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private readonly refreshTokenSubject = new BehaviorSubject<boolean | null>(null);

  constructor(
    private readonly configuration: AppHttpConfigurationService,
    private readonly injector: Injector,
    private readonly tokenService: TokenService,
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const modifiedRequest = this.normalizeRequestHeaders(request);
    return next.handle(modifiedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.tryAuthWithRefreshToken(modifiedRequest, next, error);
        }
        this.configuration.handleNonAbpErrorResponse(error);
        return throwError(() => error);
      }),
    );
  }

  private tryAuthWithRefreshToken(
    request: HttpRequest<unknown>,
    next: HttpHandler,
    error: HttpErrorResponse,
  ): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshTokenService = this.injector.get(RefreshTokenService, null);
      if (!refreshTokenService) {
        this.isRefreshing = false;
        this.configuration.handleNonAbpErrorResponse(error);
        return throwError(() => error);
      }

      return refreshTokenService.tryAuthWithRefreshToken().pipe(
        switchMap((authResult) => {
          this.isRefreshing = false;
          if (authResult) {
            this.refreshTokenSubject.next(true);
            return next.handle(this.normalizeRequestHeaders(request));
          }
          this.configuration.handleNonAbpErrorResponse(error);
          return throwError(() => error);
        }),
      );
    }

    return this.refreshTokenSubject.pipe(
      filter((authResult) => authResult != null),
      take(1),
      switchMap(() => next.handle(this.normalizeRequestHeaders(request))),
    );
  }

  private normalizeRequestHeaders(request: HttpRequest<unknown>): HttpRequest<unknown> {
    let headers = request.headers
      .set('Pragma', 'no-cache')
      .set('Cache-Control', 'no-cache')
      .set('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');

    headers = this.addXRequestedWithHeader(headers);
    headers = this.addAuthorizationHeaders(headers);
    headers = this.addAspNetCoreCultureHeader(headers);
    headers = this.addAcceptLanguageHeader(headers);
    headers = this.addTenantIdHeader(headers);

    return request.clone({ headers });
  }

  private addXRequestedWithHeader(headers: HttpHeaders): HttpHeaders {
    return headers.set('X-Requested-With', 'XMLHttpRequest');
  }

  private addAspNetCoreCultureHeader(headers: HttpHeaders): HttpHeaders {
    const cookieLangValue = getCookieValue('Abp.Localization.CultureName');
    if (cookieLangValue && !headers.has('.AspNetCore.Culture')) {
      return headers.set('.AspNetCore.Culture', cookieLangValue);
    }
    return headers;
  }

  private addAcceptLanguageHeader(headers: HttpHeaders): HttpHeaders {
    const cookieLangValue = getCookieValue('Abp.Localization.CultureName');
    if (cookieLangValue && !headers.has('Accept-Language')) {
      return headers.set('Accept-Language', cookieLangValue);
    }
    return headers;
  }

  private addTenantIdHeader(headers: HttpHeaders): HttpHeaders {
    const cookieTenantIdValue = getCookieValue(TENANT_ID_COOKIE_NAME);
    if (cookieTenantIdValue && !headers.has(TENANT_ID_COOKIE_NAME)) {
      return headers.set(TENANT_ID_COOKIE_NAME, cookieTenantIdValue);
    }
    return headers;
  }

  private addAuthorizationHeaders(headers: HttpHeaders): HttpHeaders {
    const authorizationHeaders = headers.getAll('Authorization') ?? [];
    const hasBearer = authorizationHeaders.some((item) => item.indexOf('Bearer ') === 0);
    if (!hasBearer) {
      const token = this.tokenService.getToken();
      if (token) {
        return headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  }
}
