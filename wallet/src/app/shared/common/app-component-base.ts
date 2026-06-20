import {
  PermissionCheckerService,
  FeatureCheckerService,
  LocalizationService,
  MessageService,
  NotifyService,
  SettingService,
} from '../core';
import { Component, Injector, OnDestroy } from '@angular/core';
import { AppConsts } from '../AppConsts';
import { AppUrlService } from './nav/app-url.service';
import { AppSessionService } from '../session/app-session.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgxSpinnerTextService } from '../ngx-spinner-text.service';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { CloudgateAuthService } from '../auth/cloudgate-auth.service';
import { AppLauncher } from '@capacitor/app-launcher';
import { LocalService } from '../session/local-storage.service';
import { ToastrService } from 'ngx-toastr';
import { ThemeService } from 'src/app/core/services/theme.service';
import { HttpClient } from '@angular/common/http';
import { AppBranding } from '../branding/app-branding';
import { AppEventsService } from '../core/app-events.service';

interface AppEventSubscription {
  eventName: string;
  callback: (...args: any[]) => void;
}

@Component({
  template: '',
})
export abstract class AppComponentBase implements OnDestroy {
  localizationSourceName = AppConsts.localization.defaultLocalizationSourceName;
  injector: Injector;

  localization: LocalizationService;
  permission: PermissionCheckerService;
  feature: FeatureCheckerService;
  notify: NotifyService;
  setting: SettingService;
  message: MessageService;
  appSession: AppSessionService;
  appUrlService: AppUrlService;
  spinnerService: NgxSpinnerService;
  eventSubscriptions: AppEventSubscription[] = [];
  router: Router;
  authService: CloudgateAuthService;
  localStore: LocalService;
  toastr: ToastrService;
  themeService: ThemeService;
  appEvents: AppEventsService;

  http: HttpClient;

  private ngxSpinnerTextService: NgxSpinnerTextService;
  isIOS: boolean | undefined;

  constructor(injector: Injector) {
    this.injector = injector;
    this.localization = injector.get(LocalizationService);
    this.permission = injector.get(PermissionCheckerService);
    this.feature = injector.get(FeatureCheckerService);
    this.notify = injector.get(NotifyService);
    this.setting = injector.get(SettingService);
    this.message = injector.get(MessageService);
    this.appSession = injector.get(AppSessionService);
    this.appUrlService = injector.get(AppUrlService);
    this.spinnerService = injector.get(NgxSpinnerService);
    this.ngxSpinnerTextService = injector.get(NgxSpinnerTextService);
    this.router = injector.get(Router);
    this.authService = injector.get(CloudgateAuthService);
    this.localStore = injector.get(LocalService);
    this.toastr = injector.get(ToastrService);
    this.themeService = injector.get(ThemeService);
    this.appEvents = injector.get(AppEventsService);
    this.isIOS = Capacitor.getPlatform() == 'ios';

    this.http = injector.get(HttpClient);
  }

  ngOnDestroy(): void {
    this.unSubscribeAllEvents();
  }

  navigate(path: string) {
    if (path == '/logout') {
      this.logout();
    } else {
      this.router.navigate([path]);
    }
  }

  openTransferDetail(itemId?: string) {
    this.router.navigate(['/home/transfer'], { queryParams: itemId ? { id: itemId } : {} });
  }

  logout(): void {
    this.authService.logout();
  }

  get pageName() {
    return AppConsts.pageName;
  }

  get pageAction() {
    return AppConsts.pageAction;
  }

  setPageName(pageName: string) {
    AppConsts.pageName = pageName;
  }

  setPageAction(pageAction: string) {
    if (AppConsts.pageAction != pageAction) {
      AppConsts.pageAction = pageAction;
      this.appEvents.trigger('app.show.nav');
    } else {
      AppConsts.pageAction = pageAction;
    }
  }

  flattenDeep(array: any[]): any {
    return array?.reduce(
      (acc: string | any[], val: any) => (Array.isArray(val) ? acc.concat(this.flattenDeep(val)) : acc.concat(val)),
      [],
    );
  }

  isGranted(permissionName: string): boolean {
    return this.permission.isGranted(permissionName);
  }

  isGrantedAny(...permissions: string[]): boolean {
    if (!permissions) {
      return false;
    }

    for (const permission of permissions) {
      if (this.isGranted(permission)) {
        return true;
      }
    }

    return false;
  }

  showMainSpinner(text?: string): void {
    this.ngxSpinnerTextService.setText(text);
    this.spinnerService.show();
  }

  hideMainSpinner(text?: string): void {
    this.spinnerService.hide();
  }

  protected subscribeToEvent(eventName: string, callback: (...args: any[]) => void): void {
    this.appEvents.on(eventName, callback);
    this.eventSubscriptions.push({
      eventName,
      callback,
    });
  }

  private unSubscribeAllEvents() {
    this.eventSubscriptions.forEach((s) => this.appEvents.off(s.eventName, s.callback));
    this.eventSubscriptions = [];
  }

  sendEmail() {
    this.appEvents.trigger('showModal', {
      title: 'Get in Touch',
      content:
        '<p class="text-center">Please email us at <a href="mailto:dev@cloudgate.dev" class="text-primary underline">dev@cloudgate.dev</a> and we will get back to you.</p>',
      buttonText: 'OK',
      buttonTextSecondary: undefined,
      onPositive: () => {},
      onNegative: () => {},
    });
  }

  async website() {
    await AppLauncher.openUrl({
      url: AppBranding.websiteUrl,
    });
  }

  get privacyUrl(): string {
    return `${AppBranding.websiteUrl}/privacy`;
  }

  get termsUrl(): string {
    return `${AppBranding.websiteUrl}/terms-plain`;
  }

  privacy(): void {
    window.open(this.privacyUrl, '_blank', 'noopener,noreferrer');
  }

  terms(): void {
    window.open(this.termsUrl, '_blank', 'noopener,noreferrer');
  }

  skeleton(width: string, height: string, radius: string, margin: string) {
    return {
      width: width,
      height: height,
      'border-radius': radius,
      'margin-bottom': margin,
      'background-color': this.themeService.isDark ? '#323232' : '',
    };
  }

  secondsToHms(d: number) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor((d % 3600) / 60);
    var s = Math.floor((d % 3600) % 60);

    var hDisplay = h > 0 ? h + 'h' + ' | ' : '';
    var mDisplay = m > 0 ? m + 'm' + ' | ' : '';
    var sDisplay = s > 0 ? s + 's' : '';
    return hDisplay + mDisplay + sDisplay;
  }

  download(url: string | undefined) {
    if (url) {
      this.http.get(url, { responseType: 'blob' }).subscribe(
        (blob) => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'QR-Image.jpg';

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        (error) => {
          console.error('Error downloading the image: ', error);
        },
      );
    }
  }
}

