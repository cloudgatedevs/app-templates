import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import {
  BsDatepickerModule,
  BsDatepickerConfig,
  BsDaterangepickerConfig,
  BsLocaleService,
} from 'ngx-bootstrap/datepicker';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { AppRouteGuard } from './auth/auth-route-guard';

import { DateRangePickerInitialValueSetterDirective } from './timing/date-range-picker-initial-value.directive';
import { DatePickerInitialValueSetterDirective } from './timing/date-picker-initial-value.directive';
import { DateTimeService } from './timing/date-time.service';
import { TimeZoneComboComponent } from './timing/timezone-combo.component';
import { NgxBootstrapDatePickerConfigService } from 'src/assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';
import { UtilsModule } from 'src/shared/utils/utils.module';
import { AppLocalizationService } from './localization/app-localization.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    UtilsModule,
    TableModule,
    PaginatorModule,
    TabsModule.forRoot(),
    BsDropdownModule.forRoot(),
    BsDatepickerModule.forRoot(),
  ],
  declarations: [
    TimeZoneComboComponent,
    DateRangePickerInitialValueSetterDirective,
    DatePickerInitialValueSetterDirective,
  ],
  exports: [TimeZoneComboComponent, DateRangePickerInitialValueSetterDirective, DatePickerInitialValueSetterDirective],
  providers: [
    DateTimeService,
    AppLocalizationService,
    { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
    { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
    { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale },
  ],
})
export class AppCommonModule {
  static forRoot(): ModuleWithProviders<AppCommonModule> {
    return {
      ngModule: AppCommonModule,
      providers: [AppRouteGuard],
    };
  }
}
