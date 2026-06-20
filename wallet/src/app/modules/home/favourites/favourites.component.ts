import { Component, Injector, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppConsts } from 'src/app/shared/AppConsts';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { FavouriteListItemComponent } from '../components/favourite-list-item/favourite-list-item.component';
import { initFlowbite } from 'flowbite';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { TransactionListItemComponent } from '../components/transaction-list-item/transaction-list-item.component';
import { CategoryGridItemComponent } from '../components/category-grid-item/category-grid-item.component';
import { CardItemComponent } from '../components/card-item/card-item.component';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-favourites',
  templateUrl: './favourites.component.html',
  standalone: true,
  imports: [
    RouterOutlet,
    AngularSvgIconModule,
    CategoryGridItemComponent,
    TransactionListItemComponent,
    CardItemComponent,
    NgClass,
    NgIf,
  ],
})
export class FavouritesComponent extends AppComponentBase implements OnInit {
  tabMenu: string = 'physical';

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    AppConsts.pageName = 'My Wallet';
    AppConsts.pageAction = 'Menu';
    initFlowbite();
  }

  setTab(tab: string) {
    this.tabMenu = tab;
  }
}
