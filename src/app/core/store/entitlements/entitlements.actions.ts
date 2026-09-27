import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const EntitlementsActions = createActionGroup({
  source: 'Entitlements',
  events: {
    'Entitlements Requested': emptyProps(),
    'Entitlements Success': props<{ enabledFeatureKeys: string[] }>(),
    'Entitlements Failure': props<{ error: string }>(),
    'Entitlements Cleared': emptyProps(),
  },
});
