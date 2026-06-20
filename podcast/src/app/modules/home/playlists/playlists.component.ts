import { Component, Injector, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppConsts } from 'src/app/shared/AppConsts';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { PodcastListItemComponent } from '../components/podcast-list-item/podcast-list-item.component';
import { initFlowbite } from 'flowbite';
import { NgFor, NgIf } from '@angular/common';
import { PodcastWorkflowService } from 'src/app/shared/workflow/podcast-workflow.service';
import { PodcastCatalog, PodcastItem } from 'src/app/shared/workflow/podcast.models';

@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.component.html',
  standalone: true,
  imports: [RouterOutlet, PodcastListItemComponent, NgIf, NgFor],
})
export class PlaylistsComponent extends AppComponentBase implements OnInit {
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
    AppConsts.pageName = 'Playlists';
    AppConsts.pageAction = 'Menu';
    initFlowbite();
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
