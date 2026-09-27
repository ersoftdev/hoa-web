import { Injectable, inject, signal } from '@angular/core';

import { ConfigurationApiService } from '../../features/configuration/data-access/configuration-api.service';

/**
 * App-wide source of HoaConfiguration.currencySymbol — the one thing
 * hoa-currency.pipe.ts (and the couple of static '₱' spots that aren't
 * behind a pipe, e.g. payment-submit's input-group prefix) read to render
 * money consistently everywhere (dashboard tiles, stat-card, payments,
 * service rates, reports).
 *
 * Root singleton, same shape as AuthService/NotificationsService: a
 * readonly signal, populated once on construction (triggered by whichever
 * caller happens to inject this first — typically the first
 * `hoaCurrency`-piped value in view) and updated directly by
 * configuration-form.component.ts's save handler, the only place the
 * symbol ever changes, so an edit is reflected everywhere without a full
 * page reload.
 */
@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly api = inject(ConfigurationApiService);

  /** '₱' matches get-or-create-configuration.ts's own default — never
   * actually shown for more than the one network round-trip on first
   * load, but keeps every consumer from having to handle `null`. */
  private readonly _symbol = signal('₱');
  readonly symbol = this._symbol.asReadonly();

  constructor() {
    this.api.get().subscribe((config) => this._symbol.set(config.currencySymbol));
  }

  /** configuration-form.component.ts calls this with the PATCH response it
   * already has — no need to re-fetch what was just saved. */
  setSymbol(symbol: string): void {
    this._symbol.set(symbol);
  }
}
