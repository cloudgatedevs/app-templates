import { Component, Injector, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { initFlowbite } from 'flowbite';
import { AppConsts } from 'src/app/shared/AppConsts';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { GalleryGridItemComponent } from '../../components/gallery-grid-item/gallery-grid-item.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  standalone: true,
  imports: [RouterOutlet, AngularSvgIconModule, GalleryGridItemComponent, NgClass],
})
export class GalleryComponent extends AppComponentBase implements OnInit {
  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    AppConsts.pageName = 'Gallery';
    AppConsts.pageAction = '/explore';
    initFlowbite();
  }
}
