import { Component, Injector, Input, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';

@Component({
  selector: 'app-nft-feature-item',
  templateUrl: './nft-feature-item.component.html',
  styleUrls: ['./nft-feature-item.component.scss'],
  imports: [AngularSvgIconModule],
  standalone: true,
})
export class NFTFeatureItemComponent extends AppComponentBase implements OnInit {
  @Input() image: string | undefined;
  @Input() title: string | undefined;
  @Input() handle: string | undefined;
  @Input() followers: string | undefined;
  @Input() amount: string | undefined;
  @Input() days: string | undefined;
  @Input() hours: string | undefined;
  @Input() minutes: string | undefined;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {}
}
