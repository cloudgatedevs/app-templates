import { NgModule } from '@angular/core';
import { AppCommonModule } from 'src/app/shared/common/app-common.module';
import { GalleryRoutingModule } from './gallery-routing.module';
@NgModule({
  imports: [GalleryRoutingModule, AppCommonModule],
})
export class GalleryModule {}
