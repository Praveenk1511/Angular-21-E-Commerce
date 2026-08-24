import { Pipe, type PipeTransform } from '@angular/core';

import type { CurrencyCode } from '@core/models';

const SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  GBP: '₹',
  EUR: '₹',
  USD: '₹',
};

/**
 * Formats minor-unit integers (paisa, cents) into a readable currency string.
 *
 * @example {{ product.price.amountMinor | price:'INR' }}  → ₹329.00
 *
 * Using a pipe rather than repeating the division in every template keeps the
 * formatting logic in one place and the decision about decimal places uniform.
 */
@Pipe({ name: 'price', pure: true })
export class PricePipe implements PipeTransform {
  transform(amountMinor: number | null | undefined, currency: CurrencyCode = 'INR'): string {
    if (amountMinor === null || amountMinor === undefined) {
      return '';
    }

    const symbol = SYMBOLS[currency] ?? currency;
    const major = (amountMinor / 100).toFixed(2);

    return `${symbol}${major}`;
  }
}
