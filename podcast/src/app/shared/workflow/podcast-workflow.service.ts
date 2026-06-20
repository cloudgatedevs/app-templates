import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EMPTY_PODCAST_CATALOG, PodcastCatalog, PodcastItem } from './podcast.models';
import { WorkflowHttpService } from './workflow-http.service';
import { workflowConfig } from './workflow.config';

export type PodcastCatalogLoadState = 'idle' | 'loading' | 'loaded' | 'error';

@Injectable({ providedIn: 'root' })
export class PodcastWorkflowService {
  private catalog: PodcastCatalog = { ...EMPTY_PODCAST_CATALOG };
  private byId = new Map<string, PodcastItem>();
  private loadPromise: Promise<PodcastCatalog> | null = null;
  private loggedLoadError = false;

  private readonly stateSubject = new BehaviorSubject<PodcastCatalogLoadState>('idle');
  readonly state$: Observable<PodcastCatalogLoadState> = this.stateSubject.asObservable();

  constructor(private readonly workflowHttp: WorkflowHttpService) {}

  getCatalog(): PodcastCatalog {
    return this.catalog;
  }

  getState(): PodcastCatalogLoadState {
    return this.stateSubject.value;
  }

  getById(id: string | null | undefined): PodcastItem | undefined {
    if (!id) return undefined;
    return this.byId.get(id);
  }

  loadCatalog(): Promise<PodcastCatalog> {
    if (this.stateSubject.value === 'loaded') {
      return Promise.resolve(this.catalog);
    }
    if (this.loadPromise) return this.loadPromise;

    this.stateSubject.next('loading');
    this.loadPromise = this.fetchCatalog()
      .then((catalog) => {
        this.catalog = catalog;
        this.rebuildIndex(catalog);
        this.stateSubject.next('loaded');
        return catalog;
      })
      .catch(() => {
        this.catalog = { ...EMPTY_PODCAST_CATALOG };
        this.byId.clear();
        this.stateSubject.next('error');
        if (!this.loggedLoadError) {
          this.loggedLoadError = true;
          console.warn(
            '[PodcastWorkflowService] Failed to load catalog from',
            workflowConfig.podcastCatalogUrl,
          );
        }
        return this.catalog;
      })
      .finally(() => {
        this.loadPromise = null;
      });

    return this.loadPromise;
  }

  private async fetchCatalog(): Promise<PodcastCatalog> {
    if (!workflowConfig.enabled) {
      throw new Error('Workflow is not configured');
    }
    const data = await this.workflowHttp.get<PodcastCatalog>();
    if (!data || typeof data !== 'object') {
      throw new Error('Empty workflow response');
    }
    return {
      featured: data.featured ?? [],
      trending: data.trending ?? [],
      categories: data.categories ?? [],
      playlists: data.playlists ?? [],
    };
  }

  private rebuildIndex(catalog: PodcastCatalog) {
    this.byId.clear();
    for (const item of [
      ...catalog.featured,
      ...catalog.trending,
      ...catalog.categories,
      ...catalog.playlists,
    ]) {
      if (item?.id) this.byId.set(item.id, item);
    }
  }
}
