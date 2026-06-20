import { NgModule } from '@angular/core';

import { NowPlayRoutingModule } from './now-play-routing.module';
import { AppCommonModule } from 'src/app/shared/common/app-common.module';
@NgModule({
  imports: [NowPlayRoutingModule, AppCommonModule],
})
export class NowPlayModule {}
