import { afterNextRender, Component, Injector, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initCarousels } from 'flowbite';
import { NgFor, NgIf } from '@angular/common';
import { AppConsts } from 'src/app/shared/AppConsts';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { PodcastListItemComponent } from './components/podcast-list-item/podcast-list-item.component';
import { PodcastBlockItemComponent } from './components/podcast-block-item/podcast-block-item.component';
import { PodcastWorkflowService } from 'src/app/shared/workflow/podcast-workflow.service';
import { PodcastCatalog, PodcastItem } from 'src/app/shared/workflow/podcast.models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [RouterOutlet, PodcastListItemComponent, PodcastBlockItemComponent, NgIf, NgFor],
})
export class HomeComponent extends AppComponentBase implements OnInit {
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
    AppConsts.pageName = 'Home';
    AppConsts.pageAction = 'Menu';
    this.loadCatalog();
  }

  private loadCatalog(): void {
    this.podcastWorkflow.loadCatalog().then((catalog) => {
      this.catalog = catalog;
      this.loading = false;
      this.loadError = this.podcastWorkflow.getState() === 'error';
      if (!this.loadError && catalog.featured.length > 0) {
        afterNextRender(() => this.initFeaturedCarousel(), { injector: this.injector });
      }
    });
  }

  private initFeaturedCarousel(): void {
    initCarousels();
  }

  trackById(_index: number, item: PodcastItem): string {
    return item.id;
  }
}
