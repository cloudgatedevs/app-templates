import { NgModule } from '@angular/core';

import { CommunityRoutingModule } from './community-routing.module';
import { AppCommonModule } from 'src/app/shared/common/app-common.module';
@NgModule({
  imports: [CommunityRoutingModule, AppCommonModule],
})
export class CommunityModule {}
