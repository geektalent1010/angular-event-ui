import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EventComponent } from './event.component';

const routes: Routes = [
  {
    path: "create",
    data: { pageType: "create" },
    component: EventComponent
  },
  {
    path: "edit/:id",
    data: { pageType: "edit" },
    component: EventComponent
  },
  {
    path: "view/:id",
    data: { pageType: "view" },
    component: EventComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventRoutingModule { }
