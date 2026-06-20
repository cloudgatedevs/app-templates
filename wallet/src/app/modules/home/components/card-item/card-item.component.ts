import { NgClass } from '@angular/common';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';

@Component({
  selector: 'app-card-item',
  templateUrl: './card-item.component.html',
  styleUrls: ['./card-item.component.scss'],
  standalone: true,
  imports: [AngularSvgIconModule, NgClass],
})
export class CardItemComponent extends AppComponentBase implements OnInit {
  @Input() backgroundImage!: string;
  @Input() cardNumber: string | undefined;
  @Input() cardName: string | undefined;
  @Input() cardDate: string | undefined;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {}
}
