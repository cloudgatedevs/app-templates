import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { ErrorComponent } from './app/shared/common/error/error.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./app/modules/layout/layout.module').then((m) => m.LayoutModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('./app/modules/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'account',
    loadChildren: () => import('./app/modules/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'error',
    component: ErrorComponent,
    data: { preload: true },
  },
  {
    path: 'errors',
    loadChildren: () => import('./app/modules/error/error.module').then((m) => m.ErrorModule),
  },
  { path: '**', redirectTo: '/home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
  providers: [],
})
export class RootRoutingModule {
  constructor(private router: Router) {}
}
