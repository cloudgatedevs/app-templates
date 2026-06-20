import { NgClass, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Modal } from 'flowbite';
import { AppEventsService } from '../../core/app-events.service';

@Component({
  selector: 'alertModal',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
  standalone: true,
  imports: [NgIf, NgClass],
})
export class AlertModalComponent implements OnInit, OnDestroy {
  modal: Modal | undefined;
  options: any = {
    closable: false,
  };
  frameReady: boolean = false;
  modalTemplate: any = {
    title: '',
    content: undefined,
    frameUrl: undefined,
    buttonText: '',
    buttonTextSecondary: '',
    danger: undefined,
    onPositive: () => {},
    onNegative: () => {},
  };

  private readonly showModalHandler = ({
    title,
    content,
    frameUrl,
    buttonText,
    buttonTextSecondary,
    danger,
    onPositive,
    onNegative,
  }: any) => {
    this.modalTemplate = {
      title,
      content,
      frameUrl,
      buttonText,
      buttonTextSecondary,
      danger,
      onPositive,
      onNegative,
    };
    this.show();
  };

  private readonly hideModalHandler = () => {
    this.hide();
  };

  constructor(private _sanitizer: DomSanitizer, private readonly appEvents: AppEventsService) {}

  ngOnInit(): void {
    const infoModal = document.getElementById('infoModal');
    this.modal = new Modal(infoModal, this.options);
    this.appEvents.on('showModal', this.showModalHandler);
    this.appEvents.on('hideModal', this.hideModalHandler);
  }

  ngOnDestroy(): void {
    this.appEvents.off('showModal', this.showModalHandler);
    this.appEvents.off('hideModal', this.hideModalHandler);
  }

  show(): void {
    this.modal?.toggle();
  }

  hide(): void {
    this.frameReady = false;
    this.modalTemplate = {};
    this.modal?.hide();
  }

  positiveAction() {
    if (this.modalTemplate?.onPositive) {
      this.modalTemplate?.onPositive();
    }
    this.hide();
  }

  negativeAction() {
    if (this.modalTemplate?.onNegative) {
      this.modalTemplate?.onNegative();
    }
    this.hide();
  }

  safeUrl(url: string) {
    return this._sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  frameLoad(event: any) {
    this.frameReady = true;
  }
}
