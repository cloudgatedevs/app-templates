import { Component, Injector, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { AppConsts } from 'src/app/shared/AppConsts';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CategoryGridItemComponent } from './components/category-grid-item/category-grid-item.component';
import { TransactionListItemComponent } from './components/transaction-list-item/transaction-list-item.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [RouterOutlet, AngularSvgIconModule, CategoryGridItemComponent, TransactionListItemComponent],
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
