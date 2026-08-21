import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Coupon, CouponValidationRequest, CouponValidationResult } from '@core/models';

import { ApiClient } from './api-client';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly api = inject(ApiClient);

  /** `GET /coupons` — administrative listing of every code and its current status. */
  list(): Observable<readonly Coupon[]> {
    return this.api.get<readonly Coupon[]>('/coupons');
  }

  /**
   * `POST /coupons/validate` — check a code against a basket.
   *
   * Rejections are specific: 404 for an unknown code, and 409 with a distinct `code` for
   * expired, not-yet-started, exhausted, disabled, below-minimum-spend and
   * not-applicable. Callers can therefore explain the actual reason rather than
   * "invalid code", which is the most common failure of a checkout discount field.
   */
  validate(request: CouponValidationRequest): Observable<CouponValidationResult> {
    return this.api.post<CouponValidationResult>('/coupons/validate', request);
  }
}
