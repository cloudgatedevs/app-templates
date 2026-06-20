import { NgModule } from '@angular/core';

import { HistoryRoutingModule } from './history-routing.module';
import { AppCommonModule } from 'src/app/shared/common/app-common.module';
@NgModule({
  imports: [HistoryRoutingModule, AppCommonModule],
})
export class HistoryModule {}
