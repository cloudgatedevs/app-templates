import { NgClass, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ThemeService } from 'src/app/core/services/theme.service';
import { AppConsts } from 'src/app/shared/AppConsts';

@Component({
  selector: 'slide-content',
  templateUrl: './slide-content.component.html',
  imports: [AngularSvgIconModule, NgIf, NgClass],
  standalone: true,
})
export class SlideContentComponent {
  @Input() heading: string | undefined;
  @Input() showLogo: boolean | undefined;
  @Input() description: string | undefined;
  @Input() svgimage: string = '';

  timeStamp: number = new Date().valueOf();

  constructor(public themeService: ThemeService) {}

  ngOnInit(): void {}

  get companyLogo() {
    return (
      AppConsts.remoteServiceBaseUrl +
      '/TenantCustomization/GetTenantLogo?skin=' +
      (this.themeService?.isDark ? 'dark' : 'light') +
      '&' +
      'timeStamp' +
      '=' +
      this.timeStamp
    );
  }
}
