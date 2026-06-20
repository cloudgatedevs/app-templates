import { Component, Injector, Input, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';

@Component({
  selector: 'app-nft-user-item',
  templateUrl: './nft-user-item.component.html',
  styleUrls: ['./nft-user-item.component.scss'],
  imports: [AngularSvgIconModule],
  standalone: true,
})
export class NftUserItemComponent extends AppComponentBase implements OnInit {
  @Input() image: string | undefined;
  @Input() handle: string | undefined;
  @Input() followers: string | undefined;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {}
}
