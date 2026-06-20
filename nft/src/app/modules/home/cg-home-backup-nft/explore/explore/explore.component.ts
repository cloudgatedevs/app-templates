import { afterNextRender, Component, Injector, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { AppConsts } from 'src/app/shared/AppConsts';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { PlaceGridItemComponent } from '../components/place-grid-item/place-grid-item.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { PlaceExploreItemComponent } from '../components/place-explore-item/place-explore-item.component';
import { NftWorkflowService } from 'src/app/shared/workflow/nft-workflow.service';
import { NftCatalog, NftCatalogItem } from 'src/app/shared/workflow/nft-catalog.models';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  standalone: true,
  imports: [RouterOutlet, PlaceGridItemComponent, AngularSvgIconModule, PlaceExploreItemComponent, NgIf, NgFor],
})
export class ExploreComponent extends AppComponentBase implements OnInit {
  catalog: NftCatalog | null = null;
  loading = true;
  loadError = false;

  constructor(
    injector: Injector,
    private readonly nftWorkflowService: NftWorkflowService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    AppConsts.pageName = 'Explore';
    AppConsts.pageAction = 'Menu';
    this.nftWorkflowService.loadCatalog().then((catalog) => {
      this.catalog = catalog;
      this.loading = false;
      this.loadError = this.nftWorkflowService.getState() === 'error';
      if (!this.loadError && catalog.exploreRecent.length > 0) {
        afterNextRender(() => initFlowbite(), { injector: this.injector });
      }
    });
  }

  trackById(_index: number, item: NftCatalogItem): string {
    return item.id;
  }
}


