import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { AppUrlService } from '../shared/common/nav/app-url.service';
import { AppSessionService } from '../shared/session/app-session.service';

@NgModule({
  imports: [CommonModule],
})
export class ZeroCommonModule {
  static forRoot(): ModuleWithProviders<CommonModule> {
    return {
      ngModule: CommonModule,
      providers: [AppSessionService, AppUrlService],
    };
  }
}
