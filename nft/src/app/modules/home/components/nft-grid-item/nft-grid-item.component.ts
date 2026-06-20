import { Component, Injector, Input, OnInit } from '@angular/core';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';

@Component({
  selector: 'app-nft-grid-item',
  templateUrl: './nft-grid-item.component.html',
  styleUrls: ['./nft-grid-item.component.scss'],
  standalone: true,
})
export class NftGridItemComponent extends AppComponentBase implements OnInit {
  @Input() image: string | undefined;
  @Input() title: string | undefined;
  @Input() handle: string | undefined;
  @Input() amount: string | undefined;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {}
}
