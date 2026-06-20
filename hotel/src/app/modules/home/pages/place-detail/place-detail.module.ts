import { NgModule } from '@angular/core';

import { PlaceDetailRoutingModule } from './place-detail-routing.module';
import { AppCommonModule } from 'src/app/shared/common/app-common.module';
@NgModule({
  imports: [PlaceDetailRoutingModule, AppCommonModule],
})
export class PlaceDetailModule {}
