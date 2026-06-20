import { Component, Injector, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  standalone: true,
  imports: [RouterOutlet],
})
export class HistoryComponent extends AppComponentBase implements OnInit {
  testResult: string = '';

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {}
}
