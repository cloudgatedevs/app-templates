import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { AppRouteGuard } from 'src/app/shared/common/auth/auth-route-guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AppRouteGuard],
    canActivateChild: [AppRouteGuard],
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: '/home', pathMatch: 'full' },
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then((m) => m.HomeModule),
        canLoad: [AppRouteGuard],
      },
      {
        path: 'home/bid',
        loadChildren: () => import('../home/pages/place-bid/place-bid.module').then((m) => m.PlaceBidModule),
      },
      {
        path: 'home/gallery',
        loadChildren: () => import('../home/pages/gallery/gallery.module').then((m) => m.GalleryModule),
      },
      {
        path: 'favourites',
        loadChildren: () => import('../home/favourites/favourites.module').then((m) => m.FavouritesModule),
      },
      {
        path: 'explore',
        loadChildren: () => import('../home/explore/explore.module').then((m) => m.ExploreModule),
      },
      {
        path: 'profile',
        loadChildren: () => import('../home/profile/profile.module').then((m) => m.ProfileModule),
      },
      {
        path: 'profile/edit',
        loadChildren: () => import('../home/profile/profile-edit/profile-edit.module').then((m) => m.ProfileEditModule),
      },
      { path: '**', redirectTo: 'error/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutRoutingModule {}
