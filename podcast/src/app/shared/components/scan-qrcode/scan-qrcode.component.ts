import { Component, OnDestroy, OnInit } from '@angular/core';
import { Modal } from 'flowbite';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { NgIf } from '@angular/common';
import { AppEventsService } from '../../core/app-events.service';

@Component({
  selector: 'scanQRCodeModal',
  templateUrl: './scan-qrcode.component.html',
  standalone: true,
  imports: [ZXingScannerModule, NgIf],
})
export class ScanQRCodeComponent implements OnInit, OnDestroy {
  modal: Modal | undefined;
  format: BarcodeFormat = 11;
  options: any = {
    closable: false,
  };
  scan = false;
  callback: ((qrcode: string) => void) | undefined;

  private readonly showHandler = () => {
    this.modal?.show();
  };

  private readonly hideHandler = () => {
    this.modal?.hide();
  };

  constructor(private readonly appEvents: AppEventsService) {}

  ngOnInit(): void {
    const infoModal = document.getElementById('qrModal');
    this.modal = new Modal(infoModal, this.options);
    this.appEvents.on('showModalQR', this.showHandler);
    this.appEvents.on('hideModalQR', this.hideHandler);
  }

  ngOnDestroy(): void {
    this.appEvents.off('showModalQR', this.showHandler);
    this.appEvents.off('hideModalQR', this.hideHandler);
  }

  show(callback: (qrcode: string) => void): void {
    const self = this;
    this.scan = true;

    self.modal?.show();
    this.callback = callback;
  }

  hide(): void {
    this.scan = false;
    this.modal?.hide();
  }

  onScanned($event: string) {
    this.scanSuccessHandler($event);
  }

  scanSuccessHandler($event: any) {
    this.scan = false;
    this.hide();
    if (this.callback) {
      this.callback($event);
    }
  }

  scanErrorHandler($event: any) {
    console.log($event);
  }

  scanCompleteHandler($event: any) {
    console.log($event);
  }
}
