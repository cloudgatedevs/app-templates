import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AuthRoutingModule } from './auth-routing.module';
import { AccountRouteGuard } from 'src/shared/auth/account-route-guard';
import { AppCommonModule } from 'src/app/shared/common/app-common.module';
import { ZeroCommonModule } from '../common.module';
import { SharedModule } from 'src/app/shared.module';
import { AppInstanceComponent } from 'src/app/shared/common/app-instance/app-instance.component';

@NgModule({
  imports: [
    AppInstanceComponent,
    AuthRoutingModule,
    HttpClientModule,
    AngularSvgIconModule.forRoot(),
    SharedModule,
    AppCommonModule.forRoot(),
    ZeroCommonModule.forRoot(),
  ],
  providers: [AccountRouteGuard],
})
export class AuthModule {}
