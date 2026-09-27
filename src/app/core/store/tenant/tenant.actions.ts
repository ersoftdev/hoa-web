import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const TenantActions = createActionGroup({
  source: 'Tenant',
  events: {
    'Tenant Init Requested': emptyProps(),
    'Tenant Init Success': props<{ associationId: string; associationName: string; associationSlug: string }>(),
    'Tenant Init Failure': props<{ error: string }>(),
    'Tenant Cleared': emptyProps(),
  },
});
