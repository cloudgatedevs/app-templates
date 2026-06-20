import { Component, Injector, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppConsts } from 'src/app/shared/AppConsts';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { initFlowbite } from 'flowbite';
import { DoctorGridItemComponent } from '../components/doctor-grid-item/doctor-grid-item.component';
import { DoctorItemComponent } from '../components/doctor-item/doctor-item.component';
import { CategoryGridItemComponent } from '../components/category-grid-item/category-grid-item.component';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  standalone: true,
  imports: [
    RouterOutlet,
    AngularSvgIconModule,
    DoctorGridItemComponent,
    DoctorItemComponent,
    CategoryGridItemComponent,
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
