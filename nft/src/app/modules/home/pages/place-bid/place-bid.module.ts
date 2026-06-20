import { NgModule } from '@angular/core';

import { PlaceBidRoutingModule } from './place-bid-routing.module';
import { AppCommonModule } from 'src/app/shared/common/app-common.module';
@NgModule({
  imports: [PlaceBidRoutingModule, AppCommonModule],
})
export class PlaceBidModule {}
