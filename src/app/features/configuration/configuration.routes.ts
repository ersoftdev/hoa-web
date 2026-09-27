import { Routes } from '@angular/router';

export const CONFIGURATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/configuration-form/configuration-form.component').then((m) => m.ConfigurationFormComponent),
    data: { breadcrumb: 'Configuration' },
  },
];
