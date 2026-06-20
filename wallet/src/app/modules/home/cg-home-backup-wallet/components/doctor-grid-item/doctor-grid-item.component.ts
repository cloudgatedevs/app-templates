import { NgIf } from '@angular/common';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';

@Component({
  selector: 'app-doctor-grid-item',
  templateUrl: './doctor-grid-item.component.html',
  styleUrls: ['./doctor-grid-item.component.scss'],
  imports: [AngularSvgIconModule, NgIf],
  standalone: true,
})
export class DoctorGridItemComponent extends AppComponentBase implements OnInit {
  @Input() image: string | undefined;
  @Input() name: string | undefined;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {}
}
