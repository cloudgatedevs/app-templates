import { afterNextRender, Component, Injector, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { AppConsts } from 'src/app/shared/AppConsts';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgIf } from '@angular/common';
import { CategoryGridItemComponent } from './components/category-grid-item/category-grid-item.component';
import { PlaceFeatureItemComponent } from './components/place-feature-item/place-feature-item.component';
import { HotelWorkflowService } from 'src/app/shared/workflow/hotel-workflow.service';
import { HotelCatalog, HotelPlace } from 'src/app/shared/workflow/hotel.models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [RouterOutlet, AngularSvgIconModule, CategoryGridItemComponent, PlaceFeatureItemComponent, NgIf, NgFor],
})
export class HomeComponent extends AppComponentBase implements OnInit {
  catalog: HotelCatalog | null = null;
  loading = true;
  loadError = false;

  constructor(
    injector: Injector,
    private readonly hotelWorkflow: HotelWorkflowService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    AppConsts.pageName = 'Home';
    AppConsts.pageAction = 'Menu';
    initFlowbite();
    this.loadCatalog();
  }

  private loadCatalog(): void {
    this.hotelWorkflow.loadCatalog().then((catalog) => {
      this.catalog = catalog;
      this.loading = false;
      this.loadError = this.hotelWorkflow.getState() === 'error';
      if (!this.loadError && catalog.forYou.length > 0) {
        afterNextRender(() => initFlowbite(), { injector: this.injector });
      }
    });
  }

  trackById(_index: number, item: HotelPlace): string {
    return item.id;
  }
}
