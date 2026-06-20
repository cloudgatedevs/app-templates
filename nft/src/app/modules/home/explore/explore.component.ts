import { Component, Injector, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppConsts } from 'src/app/shared/AppConsts';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NftExploreItemComponent } from '../components/nft-explore-item/nft-explore-item.component';
import { NftUserItemComponent } from '../components/nft-user-item/nft-user-item.component';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  standalone: true,
  imports: [RouterOutlet, NftExploreItemComponent, AngularSvgIconModule, NftUserItemComponent],
})
export class ExploreComponent extends AppComponentBase implements OnInit {
  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    AppConsts.pageName = 'Explore';
    AppConsts.pageAction = 'Menu';
  }
}
