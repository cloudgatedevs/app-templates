import { Component, Injector, NgZone, OnInit } from '@angular/core';
import { FooterComponent } from './components/footer/footer.component';
import { NavigationEnd, RouterOutlet, Event } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { BottomNavbarComponent } from './components/bottom-navbar/bottom-navbar.component';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { CommonModule } from '@angular/common';
import { AlertModalComponent } from 'src/app/shared/components/alert/alert.component';
import { UserNotificationPayload } from 'src/app/shared/core/user-notification.models';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: true,
  imports: [
    NavbarComponent,
    RouterOutlet,
    FooterComponent,
    BottomNavbarComponent,
    CommonModule,
    AlertModalComponent,
  ],
})
export class LayoutComponent extends AppComponentBase implements OnInit {
  private mainContent: HTMLElement | null = null;

  constructor(injector: Injector, public _zone: NgZone) {
    super(injector);
    document.body.classList.add('overflow-y-clip');
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if (this.mainContent) {
          this.mainContent!.scrollTop = 0;
        }
      }
    });
  }

  ngOnInit(): void {
    this.registerToEvents();
  }

  registerToEvents() {
    const self = this;

    this.subscribeToEvent('abp.notifications.received', (userNotification: UserNotificationPayload) => {
      self._zone.run(() => {
        this.toastr.info(
          userNotification.notification.data.properties.Message,
          userNotification.notification.notificationName,
        );
      });
    });

    this.subscribeToEvent('app.notifications.refresh', () => {
      self._zone.run(() => {});
    });

    this.subscribeToEvent('app.notifications.read', () => {
      self._zone.run(() => {});
    });
  }
}

