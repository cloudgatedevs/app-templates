import { Component, Injector, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { NgClass, NgIf } from '@angular/common';
import { UtilsModule } from 'src/shared/utils/utils.module';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { SlideContentComponent } from './slide-content/slide-content.component';
import Swipe from 'swipejs';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AngularSvgIconModule,
    NgClass,
    NgIf,
    ButtonComponent,
    UtilsModule,
    SlideContentComponent,
  ],
})
export class OnboardingComponent extends AppComponentBase implements OnInit {
  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    window.mySwipe = new Swipe(document.getElementById('slider')!);
  }

  ngAfterViewInit(): void {
    if (!window.mySwipe) {
      window.mySwipe = new Swipe(document.getElementById('slider')!);
    }
  }

  getStarted(): void {
    this.navigate('/home');
  }

  next(): void {
    window.mySwipe.next();
  }

  prev(): void {
    window.mySwipe.prev();
  }
}
