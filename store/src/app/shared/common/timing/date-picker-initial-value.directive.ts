import { AfterViewInit, Directive, ElementRef, EventEmitter, Injector, Input, Output } from '@angular/core';

@Directive({
  selector: '[datePickerInitialValue]',
})
export class DatePickerInitialValueSetterDirective implements AfterViewInit {
  @Input() ngModel: any;
  hostElement: ElementRef;

  constructor(injector: Injector, private _element: ElementRef) {
    this.hostElement = _element;
  }

  ngAfterViewInit(): void {
    if (this.ngModel) {
      setTimeout(() => {
        (this.hostElement.nativeElement as any).value = this.ngModel.toFormat('D');
      });
    }
  }
}
