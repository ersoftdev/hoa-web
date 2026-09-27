import { Routes } from '@angular/router';

import { permissionGuard } from '../../core/guards/permission.guard';

export const ANNOUNCEMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/announcement-list/announcement-list.component').then((m) => m.AnnouncementListComponent),
    data: { breadcrumb: 'Announcements' },
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/announcement-form/announcement-form.component').then((m) => m.AnnouncementFormComponent),
    canActivate: [permissionGuard],
    data: { permission: 'CAN_MANAGE_ANNOUNCEMENTS', breadcrumb: 'New Announcement' },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/announcement-detail/announcement-detail.component').then((m) => m.AnnouncementDetailComponent),
    data: { breadcrumb: 'Announcement Details' },
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/announcement-form/announcement-form.component').then((m) => m.AnnouncementFormComponent),
    canActivate: [permissionGuard],
    data: { permission: 'CAN_MANAGE_ANNOUNCEMENTS', breadcrumb: 'Edit Announcement' },
  },
];
