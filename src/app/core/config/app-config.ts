import { InjectionToken } from '@angular/core';
import { environment } from '@env';
import type { AppEnvironment } from '@environments/environment.model';

/**
 * Application configuration, exposed through DI rather than imported directly.
 *
 * Components and services inject this token instead of reaching for the
 * `environment` object, which keeps them decoupled from build-time file
 * replacement and makes configuration trivially overridable in tests.
 */
export const APP_CONFIG = new InjectionToken<AppEnvironment>('APP_CONFIG', {
  factory: () => environment,
});
