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
        path: 'home/play/:id',
        loadChildren: () => import('../home/pages/now-play/now-play.module').then((m) => m.NowPlayModule),
      },
      {
        path: 'home/play',
        loadChildren: () => import('../home/pages/now-play/now-play.module').then((m) => m.NowPlayModule),
      },
      {
        path: 'categories',
        loadChildren: () => import('../home/categories/categories.module').then((m) => m.CategoriesModule),
      },
      {
        path: 'playlists',
        loadChildren: () => import('../home/playlists/playlists.module').then((m) => m.PlaylistsModule),
      },
      {
        path: 'history',
        loadChildren: () => import('../home/history/history.module').then((m) => m.HistoryModule),
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
