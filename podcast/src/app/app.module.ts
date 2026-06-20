import { CommonModule } from '@angular/common';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ServiceProxyModule } from 'src/shared/service-proxies/service-proxy.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './modules/layout/components/footer/footer.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UtilsModule } from 'src/shared/utils/utils.module';
import { SharedModule } from './shared.module';
import { AppCommonModule } from './shared/common/app-common.module';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [AppComponent, FooterComponent],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      multi: true,
    },
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    BsDatepickerModule.forRoot(),
    AppCommonModule.forRoot(),
    AppRoutingModule,
    UtilsModule,
    ServiceProxyModule,
    NgxSpinnerModule,
    SharedModule,
    ToastrModule.forRoot(),
  ],
})
export class AppModule {}

function appInitializerFactory() {
  return () => {
    const url = new URL(location.href);
    const params = url.searchParams;

    if (params.has('t')) {
      params.delete('t');
      window.location.href = url.toString();
    }
  };
}
