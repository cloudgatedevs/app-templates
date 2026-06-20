import { NgClass } from '@angular/common';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';

@Component({
  selector: 'app-category-grid-item',
  templateUrl: './category-grid-item.component.html',
  styleUrls: ['./category-grid-item.component.scss'],
  standalone: true,
  imports: [AngularSvgIconModule, NgClass],
})
export class CategoryGridItemComponent extends AppComponentBase implements OnInit {
  @Input() name: string | undefined;
  @Input() backgroundImage: string | undefined;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {}
}
