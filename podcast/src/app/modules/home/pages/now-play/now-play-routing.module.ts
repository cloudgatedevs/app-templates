import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NowPlayComponent } from './now-play.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: NowPlayComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NowPlayRoutingModule {}
