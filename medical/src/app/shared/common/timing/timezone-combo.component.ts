import {
  Component,
  Injector,
  Input,
  OnInit,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, UntypedFormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppComponentBase } from '../app-component-base';

interface NameValueDto {
  name?: string;
  value?: string;
}

function loadTimeZones(): NameValueDto[] {
  const intlWithSupportedValues = Intl as typeof Intl & {
    supportedValuesOf?: (key: string) => string[];
  };
  if (typeof intlWithSupportedValues.supportedValuesOf === 'function') {
    return intlWithSupportedValues.supportedValuesOf('timeZone').map((zone) => ({
      name: zone,
      value: zone,
    }));
  }
  return [];
}

@Component({
  selector: 'timezone-combo',
  template: `
    <select class="form-select" [formControl]="selectedTimeZone">
      <option *ngFor="let timeZone of timeZones" [value]="timeZone.value">{{ timeZone.name }}</option>
    </select>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimeZoneComboComponent),
      multi: true,
    },
  ],
})
export class TimeZoneComboComponent extends AppComponentBase implements OnInit, ControlValueAccessor {
  @Input() defaultTimezoneScope: any;

  timeZones: NameValueDto[] = [];
  selectedTimeZone = new UntypedFormControl('');

  constructor(injector: Injector) {
    super(injector);
  }

  onTouched: any = () => {};

  ngOnInit(): void {
    this.timeZones = loadTimeZones();
  }

  writeValue(obj: any): void {
    if (this.selectedTimeZone) {
      this.selectedTimeZone.setValue(obj);
    }
  }

  registerOnChange(fn: any): void {
    this.selectedTimeZone.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.selectedTimeZone.disable();
    } else {
      this.selectedTimeZone.enable();
    }
  }
}
