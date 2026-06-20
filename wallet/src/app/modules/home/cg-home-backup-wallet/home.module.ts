import { NgModule } from '@angular/core';

import { HomeRoutingModule } from './home-routing.module';
import { AppCommonModule } from 'src/app/shared/common/app-common.module';
@NgModule({
  imports: [HomeRoutingModule, AppCommonModule],
})
export class HomeModule {}
