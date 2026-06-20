import { Directive, Self, Output, EventEmitter, Input, SimpleChanges, OnDestroy, OnChanges } from '@angular/core';
import { BsDaterangepickerDirective } from 'ngx-bootstrap/datepicker';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DateTime } from 'luxon';
import compare from 'just-compare';
import { DateTimeService } from 'src/app/shared/common/timing/date-time.service';
import { APP_TIME_ZONE_ID, supportsMultipleTimezone } from 'src/app/shared/core/clock.util';

///this directive ensures that date values will always be the luxon.
@Directive({
  selector: '[dateRangePickerLuxonModifier]',
})
export class DateRangePickerLuxonModifierDirective implements OnDestroy, OnChanges {
  @Input() date = new EventEmitter();
  @Output() dateChange = new EventEmitter();

  subscribe: Subscription;
  lastDates: Date[] = [];

  constructor(
    @Self() private bsDateRangepicker: BsDaterangepickerDirective,
    private _dateTimeService: DateTimeService,
  ) {
    this.subscribe = bsDateRangepicker.bsValueChange
      .pipe(
        filter(
          (dates) =>
            !!(
              dates &&
              dates[0] instanceof Date &&
              dates[1] instanceof Date &&
              !compare(this.lastDates, dates) &&
              dates[0].toString() !== 'Invalid Date' &&
              dates[1].toString() !== 'Invalid Date'
            ),
        ),
      )
      .subscribe((dates: any) => {
        // clear time info of given dates because DateRangePicker doesn't support selecting time
        dates[0] = this.clearTime(dates[0]);
        dates[1] = this.clearTime(dates[1]);

        this.lastDates = dates;

        if (supportsMultipleTimezone()) {
          this.lastDates = [
            this._dateTimeService.changeTimeZone(dates[0], APP_TIME_ZONE_ID),
            this._dateTimeService.changeTimeZone(dates[1], APP_TIME_ZONE_ID),
          ];
        }

        let startDate = this._dateTimeService.fromJSDate(this.lastDates[0]);
        let endDate = this._dateTimeService.fromJSDate(this.lastDates[1]);
        this.dateChange.emit([startDate, endDate]);
      });
  }

  ngOnDestroy() {
    this.subscribe.unsubscribe();
  }

  ngOnChanges({ date }: SimpleChanges) {
    if (date && date.currentValue && !compare(date.currentValue, date.previousValue)) {
      setTimeout(
        () => (this.bsDateRangepicker.bsValue = [new Date(date.currentValue[0]), new Date(date.currentValue[1])]),
        0,
      );
    }
  }

  clearTime(date: Date): Date {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }
}
