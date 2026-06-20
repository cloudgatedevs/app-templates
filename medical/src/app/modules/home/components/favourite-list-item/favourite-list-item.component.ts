import { Component, Injector, Input, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';

@Component({
  selector: 'app-favourite-list-item',
  templateUrl: './favourite-list-item.component.html',
  styleUrls: ['./favourite-list-item.component.scss'],
  imports: [AngularSvgIconModule],
  standalone: true,
})
export class FavouriteListItemComponent extends AppComponentBase implements OnInit {
  @Input() image: string | undefined;
  @Input() name: string | undefined;
  @Input() type: string | undefined;
  @Input() stars: string | undefined;
  @Input() ratings: string | undefined;
  @Input() distance: string | undefined;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {}
}
