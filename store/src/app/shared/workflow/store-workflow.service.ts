import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EMPTY_STORECATALOG, StoreCatalog, StoreCatalogItem } from './store-catalog.models';
import { WorkflowHttpService } from './workflow-http.service';
import { workflowConfig } from './workflow.config';

export type StoreCatalogLoadState = 'idle' | 'loading' | 'loaded' | 'error';

@Injectable({ providedIn: 'root' })
export class StoreWorkflowService {
  private catalog: StoreCatalog = { ...EMPTY_STORECATALOG };
  private byId = new Map<string, StoreCatalogItem>();
  private loadPromise: Promise<StoreCatalog> | null = null;
  private loggedLoadError = false;

  private readonly stateSubject = new BehaviorSubject<StoreCatalogLoadState>('idle');
  readonly state$: Observable<StoreCatalogLoadState> = this.stateSubject.asObservable();

  constructor(private readonly workflowHttp: WorkflowHttpService) {}

  getCatalog(): StoreCatalog {
    return this.catalog;
  }

  getState(): StoreCatalogLoadState {
    return this.stateSubject.value;
  }

  getById(id: string | null | undefined): StoreCatalogItem | undefined {
    if (!id) return undefined;
    return this.byId.get(id);
  }

  reloadCatalog(): Promise<StoreCatalog> {
    this.catalog = { ...EMPTY_STORECATALOG };
    this.byId.clear();
    this.loadPromise = null;
    this.loggedLoadError = false;
    this.stateSubject.next('idle');
    return this.loadCatalog();
  }

  loadCatalog(): Promise<StoreCatalog> {
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
        this.catalog = { ...EMPTY_STORECATALOG };
        this.byId.clear();
        this.stateSubject.next('error');
        if (!this.loggedLoadError) {
          this.loggedLoadError = true;
          console.warn(
            '[StoreWorkflowService] Failed to load catalog from',
            workflowConfig.storeCatalogUrl,
            '— import .template/workflow-template.json and publish GET /products.',
          );
        }
        return this.catalog;
      })
      .finally(() => {
        this.loadPromise = null;
      });

    return this.loadPromise;
  }

  private async fetchCatalog(): Promise<StoreCatalog> {
    if (!workflowConfig.enabled) {
      throw new Error('Workflow is not configured');
    }
    const data = await this.workflowHttp.get<unknown>();
    const catalog = this.normalizeCatalogResponse(data);
    if (!catalog) {
      throw new Error('Empty or invalid workflow response');
    }
    return catalog;
  }

  private normalizeCatalogResponse(data: unknown): StoreCatalog | null {
    let parsed: unknown = data;

    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        return null;
      }
    }

    if (parsed && typeof parsed === 'object') {
      const record = parsed as Record<string, unknown>;
      if (typeof record['result'] === 'string') {
        try {
          parsed = JSON.parse(record['result']);
        } catch {
          return null;
        }
      } else if (record['result'] && typeof record['result'] === 'object') {
        parsed = record['result'];
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const catalog = parsed as Partial<StoreCatalog>;
    if (
      !Array.isArray(catalog.forYou) &&
      !Array.isArray(catalog.favourites) &&
      !Array.isArray(catalog.exploreRecent) &&
      !Array.isArray(catalog.explore)
    ) {
      return null;
    }

    return {
      forYou: catalog.forYou ?? [],
      favourites: catalog.favourites ?? [],
      exploreRecent: catalog.exploreRecent ?? [],
      explore: catalog.explore ?? [],
    };
  }

  private rebuildIndex(catalog: StoreCatalog) {
    this.byId.clear();
    for (const item of [
      ...catalog.forYou,
      ...catalog.favourites,
      ...catalog.exploreRecent,
      ...catalog.explore,
    ]) {
      if (item?.id) this.byId.set(item.id, item);
    }
  }
}


