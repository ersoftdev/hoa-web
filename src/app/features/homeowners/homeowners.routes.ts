import { Routes } from '@angular/router';

export const HOMEOWNERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/homeowner-list/homeowner-list.component').then((m) => m.HomeownerListComponent),
    data: { breadcrumb: 'Homeowners' },
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/homeowner-form/homeowner-form.component').then((m) => m.HomeownerFormComponent),
    data: { breadcrumb: 'New Homeowner' },
  },
  {
    path: 'board-members',
    loadComponent: () => import('./pages/board-roster/board-roster.component').then((m) => m.BoardRosterComponent),
    data: { breadcrumb: 'Board Members', mode: 'members' },
  },
  {
    path: 'officers',
    loadComponent: () => import('./pages/board-roster/board-roster.component').then((m) => m.BoardRosterComponent),
    data: { breadcrumb: 'Officers', mode: 'officers' },
  },
  {
    path: 'officer-positions',
    loadComponent: () => import('./pages/officer-positions/officer-positions.component').then((m) => m.OfficerPositionsComponent),
    data: { breadcrumb: 'Officer Positions' },
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/homeowner-detail/homeowner-detail.component').then((m) => m.HomeownerDetailComponent),
    data: { breadcrumb: 'Homeowner Details' },
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/homeowner-form/homeowner-form.component').then((m) => m.HomeownerFormComponent),
    data: { breadcrumb: 'Edit Homeowner' },
  },
];
