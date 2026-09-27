import { Routes } from '@angular/router';

import { permissionGuard } from '../../core/guards/permission.guard';

export const PAYMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/payment-list/payment-list.component').then((m) => m.PaymentListComponent),
    canActivate: [permissionGuard],
    data: { permission: 'CAN_REVIEW_PAYMENTS', breadcrumb: 'Payment Review', mode: 'review' },
  },
  {
    path: 'my',
    loadComponent: () => import('./pages/payment-list/payment-list.component').then((m) => m.PaymentListComponent),
    data: { breadcrumb: 'My Payments', mode: 'my' },
  },
  {
    path: 'rejected',
    loadComponent: () => import('./pages/payment-list/payment-list.component').then((m) => m.PaymentListComponent),
    data: { breadcrumb: 'Rejected Payments', mode: 'my', defaultStatus: 'Rejected' },
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/payment-submit/payment-submit.component').then((m) => m.PaymentSubmitComponent),
    data: { breadcrumb: 'New Payment' },
  },
  {
    path: 'submit/:serviceRequestId',
    loadComponent: () => import('./pages/payment-submit/payment-submit.component').then((m) => m.PaymentSubmitComponent),
    data: { breadcrumb: 'Submit Payment' },
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/payment-detail/payment-detail.component').then((m) => m.PaymentDetailComponent),
    data: { breadcrumb: 'Payment Details' },
  },
];
