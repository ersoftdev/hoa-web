import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import { HoaApiService } from '../../api/hoa-api.service';
import { resolveAssociationSlug } from '../../tenant/subdomain';
import { TenantActions } from './tenant.actions';

interface AssociationResponse {
  id: string;
  slug: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export const tenantInitEffect = createEffect(
  (actions$ = inject(Actions), hoaApi = inject(HoaApiService)) =>
    actions$.pipe(
      ofType(TenantActions.tenantInitRequested),
      switchMap(() => {
        const slug = resolveAssociationSlug();
        return hoaApi.get<AssociationResponse>(`/associations/by-slug/${slug}`).pipe(
          map((association) =>
            TenantActions.tenantInitSuccess({
              associationId: association.id,
              associationName: association.name,
              associationSlug: association.slug,
            }),
          ),
          catchError(() =>
            of(TenantActions.tenantInitFailure({ error: 'Unable to resolve this Association.' })),
          ),
        );
      }),
    ),
  { functional: true },
);

export const tenantEffects = { tenantInitEffect };
