import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlaceBidComponent } from './place-bid.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: PlaceBidComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlaceBidRoutingModule {}
