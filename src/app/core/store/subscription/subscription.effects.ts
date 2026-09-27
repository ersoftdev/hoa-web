import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, merge, of, switchMap } from 'rxjs';

import { HoaApiService } from '../../api/hoa-api.service';
import { AuthActions } from '../auth/auth.actions';
import { EntitlementsActions } from '../entitlements/entitlements.actions';
import { SubscriptionActions, SubscriptionResponse } from './subscription.actions';

export const subscriptionInitEffect = createEffect(
  (actions$ = inject(Actions), hoaApi = inject(HoaApiService)) =>
    merge(
      actions$.pipe(ofType(AuthActions.loginSuccess)),
      actions$.pipe(ofType(AuthActions.refreshSuccess)),
      actions$.pipe(ofType(AuthActions.demoSessionStarted)),
    ).pipe(
      switchMap(() =>
        hoaApi.get<SubscriptionResponse>('/subscription').pipe(
          map((subscription) => SubscriptionActions.subscriptionSuccess({ subscription })),
          catchError(() =>
            of(SubscriptionActions.subscriptionFailure({ error: 'Unable to load subscription state.' })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const entitlementsFromSubscriptionEffect = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(SubscriptionActions.subscriptionSuccess),
      map(({ subscription }) =>
        EntitlementsActions.entitlementsSuccess({
          enabledFeatureKeys: subscription.features.filter((f) => f.enabled).map((f) => f.key),
        }),
      ),
    ),
  { functional: true },
);

export const subscriptionEffects = { subscriptionInitEffect, entitlementsFromSubscriptionEffect };
