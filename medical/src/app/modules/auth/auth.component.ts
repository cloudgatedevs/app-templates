import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { AlertModalComponent } from 'src/app/shared/components/alert/alert.component';
import { setTenantIdCookie } from 'src/app/shared/core/multi-tenancy.util';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  standalone: true,
  imports: [AngularSvgIconModule, RouterOutlet, NgIf, AlertModalComponent, NgClass],
})
export class AuthComponent extends AppComponentBase implements OnInit {
  constructor(
    injector: Injector,
    private readonly _router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.subscribeToEvent('app.branding.changed', () => this.cdr.detectChanges());
  }

  get isOnboarding() {
    return this._router.url === '/auth/onboarding';
  }

  get companyLogo() {
    return this.appSession.loginLogo;
  }

  switchApp() {
    this.appEvents.trigger('showModal', {
      title: 'Disconnect App',
      content: `
    <div class="text-center">
      <p>You are about to disconnect your current Connected App. <br/>Are you sure you want to switch Apps?</p>
    </div>
    `,
      buttonText: 'Yes, Disconnect',
      buttonTextSecondary: 'Cancel',
      danger: true,
      onPositive: () => {
        this.localStore.clearData();
        setTenantIdCookie();
        window.location.href = '/#/auth/onboarding';
        // window.location.reload();
      },
      onNegative: () => {},
    });
  }
}
