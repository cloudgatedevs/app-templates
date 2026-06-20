import { BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { NgxBootstrapLocaleMappingService } from './ngx-bootstrap-locale-mapping.service';
import { getCurrentAppLanguage } from '../../app/shared/core/locale.util';

export class NgxBootstrapDatePickerConfigService {
  static getDaterangepickerConfig(): BsDaterangepickerConfig {
    return Object.assign(new BsDaterangepickerConfig(), {
      containerClass: 'theme-default',
    });
  }

  static getDatepickerConfig(): BsDatepickerConfig {
    return Object.assign(new BsDatepickerConfig(), {
      containerClass: 'theme-default',
    });
  }

  static getDatepickerLocale(): BsLocaleService {
    let localeService = new BsLocaleService();
    localeService.use(getCurrentAppLanguage().name);
    return localeService;
  }

  static registerNgxBootstrapDatePickerLocales(): Promise<boolean> {
    if (getCurrentAppLanguage().name === 'en') {
      return Promise.resolve(true);
    }

    let supportedLocale = new NgxBootstrapLocaleMappingService()
      .map(getCurrentAppLanguage().name)
      .toLowerCase();
    let moduleLocaleName = new NgxBootstrapLocaleMappingService().getModuleName(getCurrentAppLanguage().name);

    return new Promise<boolean>((resolve, reject) => {
      import(`/node_modules/ngx-bootstrap/chronos/esm2020/i18n/${supportedLocale}.mjs`).then((module) => {
        defineLocale(getCurrentAppLanguage().name.toLowerCase(), module[`${moduleLocaleName}Locale`]);
        resolve(true);
      }, reject);
    });
  }
}
