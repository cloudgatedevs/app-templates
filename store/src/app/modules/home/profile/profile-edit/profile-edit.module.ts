import { NgModule } from '@angular/core';

import { ProfileEditRoutingModule } from './profile-edit-routing.module';
import { AppCommonModule } from 'src/app/shared/common/app-common.module';
@NgModule({
  imports: [ProfileEditRoutingModule, AppCommonModule],
})
export class ProfileEditModule {}
