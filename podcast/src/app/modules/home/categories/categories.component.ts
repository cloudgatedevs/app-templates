import { Component, Injector, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { AppConsts } from 'src/app/shared/AppConsts';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { PodcastGridItemComponent } from '../components/podcast-grid-item/podcast-grid-item.component';
import { PodcastWorkflowService } from 'src/app/shared/workflow/podcast-workflow.service';
import { PodcastCatalog, PodcastItem } from 'src/app/shared/workflow/podcast.models';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  standalone: true,
  imports: [RouterOutlet, PodcastGridItemComponent, NgIf, NgFor],
})
export class CategoriesComponent extends AppComponentBase implements OnInit {
  catalog: PodcastCatalog | null = null;
  loading = true;
  loadError = false;

  constructor(
    injector: Injector,
    private readonly podcastWorkflow: PodcastWorkflowService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    AppConsts.pageName = 'Categories';
    AppConsts.pageAction = 'Menu';
    this.podcastWorkflow.loadCatalog().then((catalog) => {
      this.catalog = catalog;
      this.loading = false;
      this.loadError = this.podcastWorkflow.getState() === 'error';
    });
  }

  trackById(_index: number, item: PodcastItem): string {
    return item.id;
  }
}
