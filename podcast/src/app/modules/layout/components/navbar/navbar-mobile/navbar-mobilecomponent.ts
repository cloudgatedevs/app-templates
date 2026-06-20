import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AppSessionService } from 'src/app/shared/session/app-session.service';
import { MenuService } from '../../../services/menu.service';
import { NavbarMobileMenuComponent } from './navbar-mobile-menu/navbar-mobile-menu.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgClass } from '@angular/common';
import { AppEventsService } from 'src/app/shared/core/app-events.service';

@Component({
    selector: 'app-navbar-mobile',
    templateUrl: './navbar-mobile.component.html',
    styleUrls: ['./navbar-mobile.component.scss'],
    standalone: true,
    imports: [
        NgClass,
        AngularSvgIconModule,
        NavbarMobileMenuComponent,
    ],
})
export class NavbarMobileComponent implements OnInit, OnDestroy {
  private readonly brandingHandler = () => this.cdr.detectChanges();

  constructor(
    public menuService: MenuService,
    public appSession: AppSessionService,
    private readonly cdr: ChangeDetectorRef,
    private readonly appEvents: AppEventsService,
  ) {}

  ngOnInit(): void {
    this.appEvents.on('app.branding.changed', this.brandingHandler);
  }

  ngOnDestroy(): void {
    this.appEvents.off('app.branding.changed', this.brandingHandler);
  }

  public toggleMobileMenu(): void {
    this.menuService.showMobileMenu = false;
  }
}
