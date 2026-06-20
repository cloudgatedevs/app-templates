import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { initFlowbite } from 'flowbite';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { CommonModule } from '@angular/common';
import { Share } from '@capacitor/share';
import { AppBranding } from 'src/app/shared/branding/app-branding';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [AngularSvgIconModule, ProfileMenuComponent, CommonModule],
})
export class NavbarComponent extends AppComponentBase implements OnInit, OnDestroy {
  private _drawerBackdropObserver?: MutationObserver;
  private _routerSubscription?: Subscription;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    initFlowbite();
    this._drawerBackdropObserver = new MutationObserver(() => this.moveDrawerBackdropIntoShell());
    this._drawerBackdropObserver.observe(document.body, { childList: true });
    this._routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.closeDrawer());
  }

  override ngOnDestroy(): void {
    this._drawerBackdropObserver?.disconnect();
    this._routerSubscription?.unsubscribe();
  }

  private moveDrawerBackdropIntoShell(): void {
    const shell = document.querySelector('.mobile-app-shell');
    const backdrop = document.querySelector('[drawer-backdrop]');
    if (shell && backdrop && backdrop.parentElement !== shell) {
      shell.appendChild(backdrop);
    }
  }

  closeDrawer(): void {
    const hideButton = document.querySelector(
      '[data-drawer-hide="sidebar-multi-level-sidebar"]',
    ) as HTMLButtonElement | null;
    hideButton?.click();
  }

  aboutUs() {
    this.closeDrawer();
    this.appEvents.trigger('showModal', {
      title: 'About Us',
      content: `
      <div class="text-center">
        <div class="flex w-full justify-center">
          <img src="${AppBranding.headerLogoLight}" alt="Cloudgate" class="mb-5 w-[200px] dark:hidden" />
          <img src="${AppBranding.headerLogo}" alt="Cloudgate" class="mb-5 hidden w-[200px] dark:block" />
        </div>
        <p>© ${new Date().getFullYear()} <strong>Cloudgate.dev LLC</strong>. All rights reserved.</p>
        <p class="mt-2 text-sm">Part of the <a href="https://cloudgate.dev" target="_blank" class="text-primary">Cloudgate</a> platform.</p>
      </div>
      `,
      buttonText: 'OK',
      buttonTextSecondary: undefined,
      onPositive: () => {},
      onNegative: () => {},
    });
  }

  async share() {
    this.closeDrawer();
    await Share.share({
      title: AppBranding.friendlyName,
      url: AppBranding.websiteUrl,
      dialogTitle: 'Share with Friends',
    });
  }
}
