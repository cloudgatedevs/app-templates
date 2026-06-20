import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { initFlowbite } from 'flowbite';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { GalleryGridItemComponent } from '../../components/gallery-grid-item/gallery-grid-item.component';
import { NgClass, NgFor } from '@angular/common';
import { HotelWorkflowService } from 'src/app/shared/workflow/hotel-workflow.service';
import { HotelPlace } from 'src/app/shared/workflow/hotel.models';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.component.html',
  standalone: true,
  imports: [AngularSvgIconModule, GalleryGridItemComponent, NgClass, NgFor],
})
export class PlaceDetailComponent extends AppComponentBase implements OnInit {
  place: HotelPlace | undefined;
  heroImage = './assets/images/image-07.jpg';
  readonly roomImages = [
    './assets/images/room-01.jpg',
    './assets/images/room-02.jpg',
    './assets/images/room-03.jpg',
    './assets/images/room-04.jpg',
    './assets/images/room-05.jpg',
  ];

  constructor(
    injector: Injector,
    private readonly _route: ActivatedRoute,
    private readonly _hotelWorkflow: HotelWorkflowService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.setPageName('Accommodation');
    this.setPageAction('/home');

    void this._hotelWorkflow.loadCatalog().then(() => {
      const placeId = this._route.snapshot.queryParamMap.get('id');
      this.place = this._hotelWorkflow.getById(placeId);
      if (this.place?.imageUrl) {
        this.heroImage = this.place.imageUrl;
      }
      this.setPageName(this.place?.title ?? 'Accommodation');
      initFlowbite();
    });
  }

  goBack(): void {
    this.navigate('/home');
  }

  get displayTitle(): string {
    return this.place?.title ?? 'Starlit Haven Suites';
  }

  get displayLocation(): string {
    return this.place?.location ?? 'Witzands Aquifer Nature Reserve, 1, Dassenberg Drive';
  }

  get displayRating(): string {
    return this.place?.rating ?? '4.7';
  }
}
