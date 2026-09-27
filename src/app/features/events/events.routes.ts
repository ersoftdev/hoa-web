import { Routes } from '@angular/router';

import { permissionGuard } from '../../core/guards/permission.guard';

export const EVENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/event-list/event-list.component').then((m) => m.EventListComponent),
    data: { breadcrumb: 'Events' },
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/event-form/event-form.component').then((m) => m.EventFormComponent),
    canActivate: [permissionGuard],
    data: { permission: 'CAN_MANAGE_EVENTS', breadcrumb: 'New Event' },
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/event-detail/event-detail.component').then((m) => m.EventDetailComponent),
    data: { breadcrumb: 'Event Details' },
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/event-form/event-form.component').then((m) => m.EventFormComponent),
    canActivate: [permissionGuard],
    data: { permission: 'CAN_MANAGE_EVENTS', breadcrumb: 'Edit Event' },
  },
];
