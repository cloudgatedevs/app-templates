import { NgModule } from '@angular/core';
import { ErrorComponent } from './error.component';
import { BrowserModule } from '@angular/platform-browser';
import { UtilsModule } from '@shared/utils/utils.module';

@NgModule({
  declarations: [ErrorComponent],
  imports: [
    BrowserModule,
    UtilsModule
  ],
  bootstrap: [ErrorComponent],
})
export class ErrorModule {}