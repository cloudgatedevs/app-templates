import { Component, Injector, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { initFlowbite } from 'flowbite';
import { AppConsts } from 'src/app/shared/AppConsts';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { GalleryGridItemComponent } from '../../components/gallery-grid-item/gallery-grid-item.component';
import { NgClass } from '@angular/common';
import { NftUserItemComponent } from '../../components/nft-user-item/nft-user-item.component';
import { CategoryGridItemComponent } from '../../components/category-grid-item/category-grid-item.component';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  standalone: true,
  imports: [
    RouterOutlet,
    AngularSvgIconModule,
    GalleryGridItemComponent,
    NgClass,
    NftUserItemComponent,
    CategoryGridItemComponent,
  ],
})
export class TransferComponent extends AppComponentBase implements OnInit {
  testResult: string = '';

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    AppConsts.pageName = 'Transfer';
    AppConsts.pageAction = '/home';
    initFlowbite();
  }
}
