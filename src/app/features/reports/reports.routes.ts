import { Routes } from '@angular/router';

import { permissionGuard } from '../../core/guards/permission.guard';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/report-list/report-list.component').then((m) => m.ReportListComponent),
    data: { breadcrumb: 'Reports' },
  },
  {
    path: 'homeowners',
    loadComponent: () => import('./pages/homeowners-report/homeowners-report.component').then((m) => m.HomeownersReportComponent),
    canActivate: [permissionGuard],
    data: { permission: 'CAN_MANAGE_HOMEOWNERS', breadcrumb: 'Homeowners Report' },
  },
  {
    path: 'board-members',
    loadComponent: () =>
      import('./pages/board-member-report/board-member-report.component').then((m) => m.BoardMemberReportComponent),
    canActivate: [permissionGuard],
    data: { permission: 'CAN_MANAGE_HOMEOWNERS', breadcrumb: 'Board Member Report' },
  },
  {
    path: 'service-requests',
    loadComponent: () =>
      import('./pages/service-request-report/service-request-report.component').then((m) => m.ServiceRequestReportComponent),
    data: { breadcrumb: 'Service Request Report' },
  },
  {
    path: 'service-payments',
    loadComponent: () =>
      import('./pages/service-payment-report/service-payment-report.component').then((m) => m.ServicePaymentReportComponent),
    data: { breadcrumb: 'Service Payment Report' },
  },
  {
    path: 'user-activities',
    loadComponent: () =>
      import('./pages/user-activity-report/user-activity-report.component').then((m) => m.UserActivityReportComponent),
    data: { breadcrumb: 'User Activity Report' },
  },
];
