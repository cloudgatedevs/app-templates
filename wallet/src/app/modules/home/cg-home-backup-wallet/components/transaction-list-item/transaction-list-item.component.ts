import { NgClass } from '@angular/common';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';

@Component({
  selector: 'app-transaction-list-item',
  templateUrl: './transaction-list-item.component.html',
  styleUrls: ['./transaction-list-item.component.scss'],
  imports: [AngularSvgIconModule, NgClass],
  standalone: true,
})
export class TransactionListItemComponent extends AppComponentBase implements OnInit {
  @Input() image!: string;
  @Input() name: string | undefined;
  @Input() amount: string | undefined;
  @Input() date: string | undefined;
  @Input() imageCss: string | undefined;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {}
}
