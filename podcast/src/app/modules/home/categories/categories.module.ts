import { NgModule } from '@angular/core';

import { CategoriesRoutingModule } from './categories-routing.module';
import { AppCommonModule } from 'src/app/shared/common/app-common.module';
@NgModule({
  imports: [CategoriesRoutingModule, AppCommonModule],
})
export class CategoriesModule {}
