import { Component, Injector, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppConsts } from 'src/app/shared/AppConsts';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { FavouriteListItemComponent } from '../components/favourite-list-item/favourite-list-item.component';
import { initFlowbite } from 'flowbite';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'app-favourites',
  templateUrl: './favourites.component.html',
  standalone: true,
  imports: [RouterOutlet, FavouriteListItemComponent, AngularSvgIconModule],
})
export class FavouritesComponent extends AppComponentBase implements OnInit {
  testResult: string = '';

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    AppConsts.pageName = 'Favourites';
    AppConsts.pageAction = 'Menu';
    initFlowbite();
  }
}
