import { Component, Injector, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { AppConsts } from 'src/app/shared/AppConsts';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { FavouriteListItemComponent } from '../components/favourite-list-item/favourite-list-item.component';
import { initFlowbite } from 'flowbite';
import { NftWorkflowService } from 'src/app/shared/workflow/nft-workflow.service';
import { NftCatalog, NftCatalogItem } from 'src/app/shared/workflow/nft-catalog.models';

@Component({
  selector: 'app-favourites',
  templateUrl: './favourites.component.html',
  standalone: true,
  imports: [RouterOutlet, FavouriteListItemComponent, NgIf, NgFor],
})
export class FavouritesComponent extends AppComponentBase implements OnInit {
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
    AppConsts.pageName = 'Favourites';
    AppConsts.pageAction = 'Menu';
    initFlowbite();
    this.nftWorkflowService.loadCatalog().then((catalog) => {
      this.catalog = catalog;
      this.loading = false;
      this.loadError = this.nftWorkflowService.getState() === 'error';
    });
  }

  trackById(_index: number, item: NftCatalogItem): string {
    return item.id;
  }
}


