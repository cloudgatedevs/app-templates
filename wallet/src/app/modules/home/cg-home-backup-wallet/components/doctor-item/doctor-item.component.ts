import { NgIf } from '@angular/common';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';

@Component({
  selector: 'app-doctor-item',
  templateUrl: './doctor-item.component.html',
  styleUrls: ['./doctor-item.component.scss'],
  imports: [AngularSvgIconModule, NgIf],
  standalone: true,
})
export class DoctorItemComponent extends AppComponentBase implements OnInit {
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
