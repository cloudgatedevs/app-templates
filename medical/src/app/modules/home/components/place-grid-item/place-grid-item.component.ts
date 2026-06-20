import { Component, Injector, Input, OnInit } from '@angular/core';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';

@Component({
  selector: 'app-place-grid-item',
  templateUrl: './place-grid-item.component.html',
  styleUrls: ['./place-grid-item.component.scss'],
  standalone: true,
})
export class PlaceGridItemComponent extends AppComponentBase implements OnInit {
  @Input() image: string | undefined;
  @Input() title: string | undefined;
  @Input() subtitle: string | undefined;
  @Input() placeId: string | undefined;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {}
}
