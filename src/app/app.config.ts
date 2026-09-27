import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners, inject } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Actions, ofType, provideEffects } from '@ngrx/effects';
import { Store, provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { errorInterceptor } from './core/http/error.interceptor';
import { authInterceptor } from './core/http/auth.interceptor';
import { authEffects } from './core/store/auth/auth.effects';
import { authFeature } from './core/store/auth/auth.reducer';
import { entitlementsFeature } from './core/store/entitlements/entitlements.reducer';
import { subscriptionEffects } from './core/store/subscription/subscription.effects';
import { subscriptionFeature } from './core/store/subscription/subscription.reducer';
import { tenantEffects } from './core/store/tenant/tenant.effects';
import { TenantActions } from './core/store/tenant/tenant.actions';
import { tenantFeature } from './core/store/tenant/tenant.reducer';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptor, authInterceptor])),
    provideStore({
      [authFeature.name]: authFeature.reducer,
      [tenantFeature.name]: tenantFeature.reducer,
      [subscriptionFeature.name]: subscriptionFeature.reducer,
      [entitlementsFeature.name]: entitlementsFeature.reducer,
    }),
    provideEffects(authEffects, tenantEffects, subscriptionEffects),
    ...(environment.production ? [] : [provideStoreDevtools({ maxAge: 25, logOnly: false })]),
    provideAppInitializer(async () => {
      const store = inject(Store);
      const actions$ = inject(Actions);
      store.dispatch(TenantActions.tenantInitRequested());
      await firstValueFrom(
        actions$.pipe(ofType(TenantActions.tenantInitSuccess, TenantActions.tenantInitFailure)),
      );
    }),
    provideAppInitializer(() => firstValueFrom(inject(AuthService).refresh())),
  ],
};
