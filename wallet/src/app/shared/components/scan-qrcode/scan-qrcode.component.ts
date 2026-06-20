import { Component, OnInit } from '@angular/core';
import { Modal } from 'flowbite';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { NgIf } from '@angular/common';

@Component({
  selector: 'scanQRCodeModal',
  templateUrl: './scan-qrcode.component.html',
  standalone: true,
  imports: [ZXingScannerModule, NgIf],
})
export class ScanQRCodeComponent implements OnInit {
  modal: Modal | undefined;
  format: BarcodeFormat = 11;
  options: any = {
    closable: false,
  };
  scan = false;
  callback: ((qrcode: string) => void) | undefined;

  constructor() {}

  ngOnInit(): void {
    const infoModal = document.getElementById('qrModal');
    this.modal = new Modal(infoModal, this.options);
    abp.event.on('showModalQR', () => {
      this.modal?.show();
    });
    abp.event.on('hideModalQR', () => {
      this.modal?.hide();
    });
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

  onScan() {
    this.scan = true;
  }

  onScanned(data: any) {
    this.scan = false;
    console.log(data);

    if (this.callback) {
      this.callback(data);
    }
    this.hide();
  }
}
