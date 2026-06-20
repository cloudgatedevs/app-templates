import { PlatformLocation, registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, DEFAULT_CURRENCY_CODE, Injector, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import * as localForage from 'localforage';
import { RootRoutingModule } from './root-routing.module';
import { RootComponent } from './root.component';
import { ZeroCommonModule } from './app/modules/common.module';
import { AppConsts } from './app/shared/AppConsts';
import { AppSessionService } from './app/shared/session/app-session.service';
import { ApplicationInfoDto } from './app/shared/session/session.models';
import { ServiceProxyModule } from './shared/service-proxies/service-proxy.module';
import { AppPreBootstrap } from './AppPreBootstrap';
import { CloudgateAuthService } from './app/shared/auth/cloudgate-auth.service';
import { UrlHelper } from './app/shared/helpers/UrlHelper';
import { LocaleMappingService } from './app/shared/locale-mapping.service';
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';
import { NgxBootstrapDatePickerConfigService } from './assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';
import { DateTimeService } from './app/shared/common/timing/date-time.service';
import { environment } from './environments/environment';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { AppCommonModule } from './app/shared/common/app-common.module';
import { getCurrentAppLanguage } from './app/shared/core/locale.util';

export function appInitializerFactory(injector: Injector, platformLocation: PlatformLocation) {
  return () => {
    let spinnerService = injector.get(NgxSpinnerService);
    spinnerService.show();

    return new Promise<boolean>((resolve, reject) => {
      AppConsts.appBaseHref = getBaseHref(platformLocation);
      let appBaseUrl = getDocumentOrigin() + AppConsts.appBaseHref;

      initializeLocalForage();

      AppPreBootstrap.run(
        appBaseUrl,
        injector,
        () => {
          handleLogoutRequest(injector.get(CloudgateAuthService));
          let appSessionService: AppSessionService = injector.get(AppSessionService);
          appSessionService.init().then(
            () => {
              spinnerService.hide();
              resolve(true);
            },
            (err) => {
              spinnerService.hide();
              reject(err);
            },
          );
        },
        resolve,
        reject,
      );
    });
  };
}

function initializeLocalForage() {
  localForage.config({
    driver: localForage.LOCALSTORAGE,
    name: 'Zero',
    version: 1.0,
    storeName: 'abpzerotemplate_local_storage',
    description: 'Cached data for Zero',
  });
}

function setApplicationInfoForInstallPage(injector: any) {
  let appSessionService: AppSessionService = injector.get(AppSessionService);
  let dateTimeService: DateTimeService = injector.get(DateTimeService);
  appSessionService.application = new ApplicationInfoDto();
  appSessionService.application.releaseDate = dateTimeService.getStartOfDay();
}

function doConfigurationForInstallPage(injector: any) {
  setApplicationInfoForInstallPage(injector);
}

function getDocumentOrigin() {
  if (!document.location.origin) {
    return (
      document.location.protocol +
      '//' +
      document.location.hostname +
      (document.location.port ? ':' + document.location.port : '')
    );
  }

  return document.location.origin;
}

function registerLocales(
  resolve: (value: boolean | Promise<boolean>) => void,
  reject: any,
  spinnerService: NgxSpinnerService,
) {
  if (shouldLoadLocale()) {
    let angularLocale = convertAbpLocaleToAngularLocale(getCurrentAppLanguage().name);
    import(`/node_modules/@angular/common/locales/${angularLocale}.mjs`).then((module) => {
      registerLocaleData(module.default);
      NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales().then((_) => {
        spinnerService.hide();
        resolve(true);
      });
    }, reject);
  } else {
    NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales().then((_) => {
      resolve(true);
      spinnerService.hide();
    });
  }
}

export function shouldLoadLocale(): boolean | string {
  return getCurrentAppLanguage().name && getCurrentAppLanguage().name !== 'en-US';
}

export function convertAbpLocaleToAngularLocale(locale: string): string {
  return new LocaleMappingService().map('angular', locale);
}

export function getCurrentLanguage(): string {
  const locale = getCurrentAppLanguage().name;
  if (!locale) {
    return 'en';
  }
  return convertAbpLocaleToAngularLocale(locale);
}

export function getCurrencyCode(injector: Injector): string | undefined {
  let appSessionService: AppSessionService = injector.get(AppSessionService);
  return appSessionService?.application?.currency ?? 'USD';
}

export function getBaseHref(platformLocation: PlatformLocation): string {
  let baseUrl = platformLocation.getBaseHrefFromDOM();
  if (baseUrl) {
    return baseUrl;
  }

  return '/';
}

function handleLogoutRequest(authService: CloudgateAuthService) {
  let currentUrl = UrlHelper.initialUrl;
  let returnUrl = UrlHelper.getReturnUrl();
  if (currentUrl.indexOf('account/logout') >= 0 && returnUrl) {
    authService.logout(true, returnUrl);
  }
}

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ServiceProxyModule,
    HttpClientModule,
    RootRoutingModule,
    NgxSpinnerModule,
    ToastrModule.forRoot(),
    AppCommonModule.forRoot(),
  ],
  declarations: [RootComponent],
  providers: [
    provideLottieOptions({
      player: () => player,
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [Injector, PlatformLocation],
      multi: true,
    },
    {
      provide: LOCALE_ID,
      useFactory: getCurrentLanguage,
    },
    {
      provide: DEFAULT_CURRENCY_CODE,
      useFactory: getCurrencyCode,
      deps: [Injector],
    },
  ],
  bootstrap: [RootComponent],
})
export class RootModule {}
