import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';

import { LayoutRoutingModule } from './layout-routing.module';
import { SharedModule } from 'src/app/shared.module';
import { AppCommonModule } from 'src/app/shared/common/app-common.module';
import { ZeroCommonModule } from '../common.module';
import { UtilsModule } from 'src/shared/utils/utils.module';

@NgModule({
  providers: [],
  imports: [
    LayoutRoutingModule,
    HttpClientModule,
    AngularSvgIconModule.forRoot(),
    SharedModule,
    AppCommonModule.forRoot(),
    ZeroCommonModule.forRoot(),
  ],
})
export class LayoutModule {}
