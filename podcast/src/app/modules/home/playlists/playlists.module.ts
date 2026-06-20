import { NgModule } from '@angular/core';

import { PlaylistsRoutingModule } from './playlists-routing.module';
import { AppCommonModule } from 'src/app/shared/common/app-common.module';
@NgModule({
  imports: [PlaylistsRoutingModule, AppCommonModule],
})
export class PlaylistsModule {}
