import { Component, Injector, Input, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';

@Component({
  selector: 'app-place-explore-item',
  templateUrl: './place-explore-item.component.html',
  styleUrls: ['./place-explore-item.component.scss'],
  imports: [AngularSvgIconModule],
  standalone: true,
})
export class PlaceExploreItemComponent extends AppComponentBase implements OnInit {
  @Input() image: string | undefined;
  @Input() title: string | undefined;
  @Input() subtitle: string | undefined;
  @Input() amount: string | undefined;
  @Input() rating: string | undefined;
  @Input() location: string | undefined;
  @Input() placeId: string | undefined;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {}
}

