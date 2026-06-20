import { NgModule } from '@angular/core';

import { ProfileRoutingModule } from './profile-routing.module';
import { AppCommonModule } from 'src/app/shared/common/app-common.module';
@NgModule({
  imports: [ProfileRoutingModule, AppCommonModule],
})
export class ProfileModule {}
