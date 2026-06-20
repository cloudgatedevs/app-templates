import { NgIf } from '@angular/common';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';

@Component({
  selector: 'app-product-grid-item',
  templateUrl: './product-grid-item.component.html',
  styleUrls: ['./product-grid-item.component.scss'],
  imports: [AngularSvgIconModule, NgIf],
  standalone: true,
})
export class ProductGridItemComponent extends AppComponentBase implements OnInit {
  @Input() image: string | undefined;
  @Input() title: string | undefined;
  @Input() stars: string | undefined;
  @Input() ratings: string | undefined;
  @Input() amount: string | undefined;
  @Input() oldAmount: string | undefined;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {}
}
