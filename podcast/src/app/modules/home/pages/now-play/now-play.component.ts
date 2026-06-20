import {

  ChangeDetectorRef,

  Component,

  EmbeddedViewRef,

  Injector,

  OnDestroy,

  OnInit,

  TemplateRef,

  ViewChild,

  ViewContainerRef,

} from '@angular/core';

import { ActivatedRoute, RouterOutlet } from '@angular/router';

import { NgFor, NgIf } from '@angular/common';

import { Drawer } from 'flowbite';

import type { DrawerInterface } from 'flowbite';

import { AppComponentBase } from 'src/app/shared/common/app-component-base';

import { PodcastWorkflowService } from 'src/app/shared/workflow/podcast-workflow.service';

import { PodcastItem } from 'src/app/shared/workflow/podcast.models';



@Component({

  selector: 'app-now-play',

  templateUrl: './now-play.component.html',

  standalone: true,

  imports: [RouterOutlet, NgIf, NgFor],

})

export class NowPlayComponent extends AppComponentBase implements OnInit, OnDestroy {

  @ViewChild('captionsDrawer') captionsDrawerTpl!: TemplateRef<unknown>;



  item: PodcastItem | undefined;

  loading = true;

  loadError = false;

  captionsExpanded = false;



  private captionsDrawer?: DrawerInterface;

  private drawerView?: EmbeddedViewRef<unknown>;

  private drawerMounted = false;



  constructor(

    injector: Injector,

    private readonly route: ActivatedRoute,

    private readonly podcastWorkflow: PodcastWorkflowService,

    private readonly viewContainerRef: ViewContainerRef,

    private readonly changeDetectorRef: ChangeDetectorRef,

  ) {

    super(injector);

  }



  ngOnInit(): void {

    this.setPageName('Now Play');

    this.setPageAction('/home');

    const id = this.route.snapshot.paramMap.get('id');

    this.podcastWorkflow.loadCatalog().then(() => {

      this.item = this.podcastWorkflow.getById(id) ?? this.podcastWorkflow.getById('chocolate-dreams');

      this.loading = false;

      this.loadError = !this.item && this.podcastWorkflow.getState() === 'error';

      setTimeout(() => this.mountCaptionsDrawer(), 0);

    });

  }



  override ngOnDestroy(): void {

    this.destroyCaptionsDrawer();

    super.ngOnDestroy();

  }



  toggleCaptionsDrawer(): void {

    this.captionsDrawer?.toggle();

  }



  private mountCaptionsDrawer(): void {

    if (this.drawerMounted || !this.item || !this.captionsDrawerTpl) {

      return;

    }



    const host = document.querySelector('.mobile-app-shell') ?? document.body;

    this.drawerView = this.viewContainerRef.createEmbeddedView(this.captionsDrawerTpl);

    this.drawerView.detectChanges();

    for (const node of this.drawerView.rootNodes) {

      if (node instanceof HTMLElement) {

        host.appendChild(node);

      }

    }



    const drawerEl = document.getElementById('drawer-swipe');

    if (drawerEl) {

      this.captionsDrawer = new Drawer(drawerEl, {

        placement: 'bottom',

        edge: true,

        edgeOffset: 'bottom-[6.25rem]',

        backdrop: true,

        bodyScrolling: false,

        onShow: () => {

          this.captionsExpanded = true;

          this.changeDetectorRef.markForCheck();

        },

        onHide: () => {

          this.captionsExpanded = false;

          this.changeDetectorRef.markForCheck();

        },

      });

      this.captionsDrawer.hide();

    }



    this.drawerMounted = true;

  }



  private destroyCaptionsDrawer(): void {

    this.captionsDrawer?.destroyAndRemoveInstance();

    this.captionsDrawer = undefined;

    this.drawerView?.destroy();

    this.drawerView = undefined;

    this.drawerMounted = false;

    this.captionsExpanded = false;

  }



  get progressPercent(): number {

    if (!this.item?.durationSeconds || !this.item.progressSeconds) return 50;

    return Math.min(100, Math.round((this.item.progressSeconds / this.item.durationSeconds) * 100));

  }



  formatTime(seconds?: number): string {

    if (!seconds || seconds < 0) return '0:00';

    const mins = Math.floor(seconds / 60);

    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, '0')}`;

  }

}


