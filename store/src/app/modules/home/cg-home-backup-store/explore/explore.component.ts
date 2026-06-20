import { Component, Injector, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppConsts } from 'src/app/shared/AppConsts';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NftUserItemComponent } from '../components/nft-user-item/nft-user-item.component';
import { ProductItemComponent } from '../components/product-item/product-item.component';
import { ProductGridItemComponent } from '../components/product-grid-item/product-grid-item.component';
import { initFlowbite } from 'flowbite';
import { ProductListItemComponent } from '../components/product-list-item/product-list-item.component';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  standalone: true,
  imports: [
    RouterOutlet,
    ProductItemComponent,
    AngularSvgIconModule,
    NftUserItemComponent,
    ProductItemComponent,
    ProductGridItemComponent,
    ProductListItemComponent,
  ],
})
export class ExploreComponent extends AppComponentBase implements OnInit {
  testResult: string = '';

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    AppConsts.pageName = 'Explore';
    AppConsts.pageAction = 'Menu';
    initFlowbite();
  }
}
