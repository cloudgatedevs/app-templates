import { NgModule } from '@angular/core';

import { FavouritesRoutingModule } from './favourites-routing.module';
import { AppCommonModule } from 'src/app/shared/common/app-common.module';
@NgModule({
  imports: [FavouritesRoutingModule, AppCommonModule],
})
export class FavouritesModule {}
