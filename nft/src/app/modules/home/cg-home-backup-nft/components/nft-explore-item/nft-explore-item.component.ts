import { Component, Injector, Input, OnInit } from '@angular/core';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';

@Component({
  selector: 'app-nft-explore-item',
  templateUrl: './nft-explore-item.component.html',
  styleUrls: ['./nft-explore-item.component.scss'],
  standalone: true,
})
export class NftExploreItemComponent extends AppComponentBase implements OnInit {
  @Input() image: string | undefined;
  @Input() title: string | undefined;
  @Input() subTitle: string | undefined;
  @Input() amount: string | undefined;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {}
}
