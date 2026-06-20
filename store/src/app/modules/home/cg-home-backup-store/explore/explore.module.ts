import { NgModule } from '@angular/core';

import { ExploreRoutingModule } from './explore-routing.module';
import { AppCommonModule } from 'src/app/shared/common/app-common.module';
@NgModule({
  imports: [ExploreRoutingModule, AppCommonModule],
})
export class ExploreModule {}
