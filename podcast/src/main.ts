import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import Swal from 'sweetalert2';

import { environment } from './environments/environment';
import { RootModule } from './root.module';

declare global {
  interface Window {
    Swal: typeof Swal;
    eftSec: any;
    confetti: any;
    fwSettings: {
      widget_id: number;
    };
    FreshworksWidget?: any;
    mySwipe: any;
  }
}

if (environment.production) {
  enableProdMode();
}

window.Swal = Swal;

platformBrowserDynamic().bootstrapModule(RootModule);
