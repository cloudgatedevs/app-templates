import { NgFor, NgClass } from '@angular/common';
import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';

@Component({
  selector: 'app-bottom-navbar',
  templateUrl: './bottom-navbar.component.html',
  styleUrls: ['./bottom-navbar.component.scss'],
  standalone: true,
  imports: [NgFor, NgClass, AngularSvgIconModule],
})
export class BottomNavbarComponent extends AppComponentBase implements OnInit {
  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {}

  action() {
    this.appEvents.trigger('showModal', {
      title: 'Main Action',
      content: `
      <div class="text-center">
        <p>Sample of primary action for scanning barcode or similar action</p>
      </div>
      `,
      buttonText: 'OK',
      buttonTextSecondary: undefined,
      onPositive: () => {},
      onNegative: () => {},
    });
  }
}
