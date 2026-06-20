import { NgModule } from '@angular/core';

import { ProductRoutingModule } from './product-routing.module';
import { AppCommonModule } from 'src/app/shared/common/app-common.module';
@NgModule({
  imports: [ProductRoutingModule, AppCommonModule],
})
export class ProductModule {}
