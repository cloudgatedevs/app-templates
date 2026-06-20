import { Component, Injector, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppConsts } from 'src/app/shared/AppConsts';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { initFlowbite } from 'flowbite';
import { CategoryGridItemComponent } from '../components/category-grid-item/category-grid-item.component';
import { TransactionListItemComponent } from '../components/transaction-list-item/transaction-list-item.component';
import { ChartsWidget1Component } from './charts-widget1/charts-widget1.component';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  standalone: true,
  imports: [
    RouterOutlet,
    AngularSvgIconModule,
    CategoryGridItemComponent,
    TransactionListItemComponent,
    ChartsWidget1Component,
  ],
})
export class ExploreComponent extends AppComponentBase implements OnInit {
  testResult: string = '';

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    AppConsts.pageName = 'Statistics';
    AppConsts.pageAction = 'Menu';
    initFlowbite();
  }
}
