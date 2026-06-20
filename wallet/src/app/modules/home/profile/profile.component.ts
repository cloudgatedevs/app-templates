import { Component, Injector, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppConsts } from 'src/app/shared/AppConsts';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: true,
  imports: [RouterOutlet, AngularSvgIconModule],
})
export class ProfileComponent extends AppComponentBase implements OnInit {
  profilePicture = AppConsts.appBaseUrl + '/assets/avatars/avt-01.jpg';

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.setPageName('Profile');
    this.setPageAction('Menu');
  }
}
