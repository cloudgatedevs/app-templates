import { Component, Injector, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { AppConsts } from 'src/app/shared/AppConsts';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CategoryGridItemComponent } from './components/category-grid-item/category-grid-item.component';
import { NFTFeatureItemComponent } from './components/nft-feature-item/nft-feature-item.component';
import { ProductItemComponent } from './components/product-item/product-item.component';
import { ProductGridItemComponent } from './components/product-grid-item/product-grid-item.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [
    RouterOutlet,
    AngularSvgIconModule,
    CategoryGridItemComponent,
    NFTFeatureItemComponent,
    ProductGridItemComponent,
    ProductItemComponent,
  ],
})
export class HomeComponent extends AppComponentBase implements OnInit {
  testResult: string = '';

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    AppConsts.pageName = 'Home';
    AppConsts.pageAction = 'Menu';
    initFlowbite();
  }
}
