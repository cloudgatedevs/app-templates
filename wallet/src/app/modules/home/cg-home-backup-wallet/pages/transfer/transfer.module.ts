import { NgModule } from '@angular/core';

import { TransferRoutingModule } from './transfer-routing.module';
import { AppCommonModule } from 'src/app/shared/common/app-common.module';
@NgModule({
  imports: [TransferRoutingModule, AppCommonModule],
})
export class TransferModule {}
