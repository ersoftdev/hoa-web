import { Routes } from '@angular/router';

export const ACTIVITIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/activity-list/activity-list.component').then((m) => m.ActivityListComponent),
    data: { breadcrumb: 'Activities' },
  },
];
