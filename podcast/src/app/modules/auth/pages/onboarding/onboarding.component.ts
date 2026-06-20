import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { NgClass, NgIf } from '@angular/common';
import { UtilsModule } from 'src/shared/utils/utils.module';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { NgOtpInputModule } from 'ng-otp-input';
import { ScanQRCodeComponent } from 'src/app/shared/components/scan-qrcode/scan-qrcode.component';
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
    NgOtpInputModule,
    ScanQRCodeComponent,
    SlideContentComponent,
  ],
})
export class OnboardingComponent extends AppComponentBase implements OnInit {
  @ViewChild('ngOtpInput', { static: false }) ngOtpInput: any;
  @ViewChild('scanQRCodeModal', { static: true }) scanQRCodeModal: ScanQRCodeComponent | undefined;

  otp: string = '';
  saving!: boolean;
  config = {
    allowNumbersOnly: true,
    length: 6,
    inputStyles: {
      width: '40px',
      height: '40px',
      color: '#000000',
    },
    disableAutoFocus: true,
  };

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    window.mySwipe = new Swipe(document.getElementById('slider')!);
    this.subscribeToEvent('app.show.scanQRCode', (callback: (qrcode: string) => void) => {
      this.scanQRCodeModal?.show(callback);
    });
  }

  ngAfterViewInit(): void {
    if (!window.mySwipe) {
      window.mySwipe = new Swipe(document.getElementById('slider')!);
    }
  }

  onOtpChange(otp: string) {
    this.otp = otp;
    if (this.otp.length == 6) {
      this.submit();
    }
  }

  setVal(val: string) {
    this.ngOtpInput.setValue(val);
  }

  submit() {
    this.saving = true;
    this.toastr.warning('Community code lookup requires a Cloudgate workflow. This feature is not available.');
    this.saving = false;
  }

  scanQR() {
    this.appEvents.trigger('app.show.scanQRCode', (code: any) => {
      this.setVal(code);
    });
  }

  next() {
    window.mySwipe.next();
  }

  prev() {
    window.mySwipe.prev();
  }

}
