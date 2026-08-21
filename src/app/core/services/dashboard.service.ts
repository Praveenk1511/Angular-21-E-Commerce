import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import type { DashboardStats } from '@core/models';

import { ApiClient } from './api-client';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiClient);

  /**
   * `GET /dashboard/stats`.
   *
   * @param windowDays Reporting window. Each headline figure is compared against the
   *   immediately preceding window of the same length.
   */
  getStats(windowDays?: number): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('/dashboard/stats', { days: windowDays });
  }
}
