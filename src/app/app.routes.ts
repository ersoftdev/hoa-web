import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { AppLayoutComponent } from './core/layout/app-layout/app-layout.component';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'app',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'homeowners',
        canActivate: [permissionGuard],
        data: { permission: 'CAN_MANAGE_HOMEOWNERS' },
        loadChildren: () => import('./features/homeowners/homeowners.routes').then((m) => m.HOMEOWNERS_ROUTES),
      },
      {
        path: 'services',
        loadChildren: () => import('./features/services/services.routes').then((m) => m.SERVICES_ROUTES),
      },
      {
        path: 'payments',
        loadChildren: () => import('./features/payments/payments.routes').then((m) => m.PAYMENTS_ROUTES),
      },
      {
        path: 'events',
        loadChildren: () => import('./features/events/events.routes').then((m) => m.EVENTS_ROUTES),
      },
      {
        path: 'announcements',
        loadChildren: () => import('./features/events/announcements.routes').then((m) => m.ANNOUNCEMENTS_ROUTES),
      },
      {
        path: 'calendar',
        loadChildren: () => import('./features/calendar/calendar.routes').then((m) => m.CALENDAR_ROUTES),
      },
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.routes').then((m) => m.REPORTS_ROUTES),
      },
      {
        path: 'activities',
        canActivate: [permissionGuard],
        data: { permission: 'CAN_VIEW_ACTIVITIES' },
        loadChildren: () => import('./features/activities/activities.routes').then((m) => m.ACTIVITIES_ROUTES),
      },
      {
        path: 'configuration',
        canActivate: [permissionGuard],
        data: { permission: 'CAN_MANAGE_CONFIGURATION' },
        loadChildren: () => import('./features/configuration/configuration.routes').then((m) => m.CONFIGURATION_ROUTES),
      },
      {
        path: '**',
        loadComponent: () => import('./shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent),
        data: { breadcrumb: 'Page Not Found' },
      },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'app' },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
