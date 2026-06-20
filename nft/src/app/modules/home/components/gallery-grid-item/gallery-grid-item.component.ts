import { Component, Injector, Input, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';

@Component({
  selector: 'app-gallery-grid-item',
  templateUrl: './gallery-grid-item.component.html',
  styleUrls: ['./gallery-grid-item.component.scss'],
  standalone: true,
  imports: [AngularSvgIconModule],
})
export class GalleryGridItemComponent extends AppComponentBase implements OnInit {
  @Input() image!: string;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {}
}
