import { Pipe, PipeTransform, inject } from '@angular/core';

import { CurrencyService } from '../services/currency.service';

/**
 * Replaces the old `| currency: 'PHP'` used across the app (dashboard,
 * stat-card, payments, service rates, reports) — that fed a fixed ISO
 * currency code into Angular's own CurrencyPipe/Intl formatting.
 * HoaConfiguration.currencySymbol is a plain display symbol, not an ISO
 * code, so this just prepends it to a `toLocaleString` 2-decimal number
 * instead.
 *
 * Impure (not the default `pure: true`): CurrencyService's `symbol` is read
 * from a service, not from this pipe's own arguments, so a pure pipe would
 * never re-run just because the symbol changed after
 * configuration-form.component.ts saves a new one.
 */
@Pipe({ name: 'hoaCurrency', pure: false })
export class HoaCurrencyPipe implements PipeTransform {
  private readonly currency = inject(CurrencyService);

  transform(value: number | null | undefined): string | null {
    if (value == null || Number.isNaN(value)) return null;
    return `${this.currency.symbol()}${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}
