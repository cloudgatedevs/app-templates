import { Component, Injector, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';

@Component({
  selector: 'app-community',
  templateUrl: './community.component.html',
  standalone: true,
  imports: [],
})
export class CommunityComponent extends AppComponentBase implements OnInit {
  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.setPageName('Community');
    this.setPageAction('/profile');
    initFlowbite();
  }
}
