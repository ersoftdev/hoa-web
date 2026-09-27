import { Routes } from '@angular/router';

import { permissionGuard } from '../../core/guards/permission.guard';

export const SERVICES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/service-list/service-list.component').then((m) => m.ServiceListComponent),
    canActivate: [permissionGuard],
    data: { permission: 'CAN_MANAGE_SERVICES', breadcrumb: 'Community Services' },
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/service-form/service-form.component').then((m) => m.ServiceFormComponent),
    canActivate: [permissionGuard],
    data: { permission: 'CAN_MANAGE_SERVICES', breadcrumb: 'New Service' },
  },
  {
    path: 'requests',
    loadComponent: () => import('./pages/service-request-list/service-request-list.component').then((m) => m.ServiceRequestListComponent),
    canActivate: [permissionGuard],
    data: { permission: 'CAN_REVIEW_SERVICE_REQUESTS', breadcrumb: 'Service Requests', mode: 'queue' },
  },
  {
    path: 'my-requests',
    loadComponent: () => import('./pages/service-request-list/service-request-list.component').then((m) => m.ServiceRequestListComponent),
    data: { breadcrumb: 'My Service Requests', mode: 'my' },
  },
  {
    path: 'request/new',
    loadComponent: () =>
      import('./pages/service-request-form/service-request-form.component').then((m) => m.ServiceRequestFormComponent),
    data: { breadcrumb: 'New Service Request' },
  },
  {
    path: 'requests/:id',
    loadComponent: () =>
      import('./pages/service-request-detail/service-request-detail.component').then((m) => m.ServiceRequestDetailComponent),
    data: { breadcrumb: 'Service Request' },
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/service-detail/service-detail.component').then((m) => m.ServiceDetailComponent),
    data: { breadcrumb: 'Service Details' },
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/service-form/service-form.component').then((m) => m.ServiceFormComponent),
    canActivate: [permissionGuard],
    data: { permission: 'CAN_MANAGE_SERVICES', breadcrumb: 'Edit Service' },
  },
  {
    path: ':id/request',
    loadComponent: () =>
      import('./pages/service-request-form/service-request-form.component').then((m) => m.ServiceRequestFormComponent),
    data: { breadcrumb: 'Request Service' },
  },
];
