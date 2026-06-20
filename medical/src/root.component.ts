import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerTextService } from './app/shared/ngx-spinner-text.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="mobile-app-shell">
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./app/app.component.scss'],
})
export class RootComponent implements OnInit, OnDestroy {
  ngxSpinnerText: NgxSpinnerTextService;

  constructor(_ngxSpinnerText: NgxSpinnerTextService) {
    this.ngxSpinnerText = _ngxSpinnerText;
  }

  ngOnInit(): void {
    document.body.classList.add('force-mobile-layout');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('force-mobile-layout');
  }

  getSpinnerText(): string {
    return this.ngxSpinnerText.getText();
  }
}
