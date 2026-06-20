import { NgModule } from '@angular/core';

import { DoctorRoutingModule } from './doctor-routing.module';
import { AppCommonModule } from 'src/app/shared/common/app-common.module';
@NgModule({
  imports: [DoctorRoutingModule, AppCommonModule],
})
export class DoctorModule {}
