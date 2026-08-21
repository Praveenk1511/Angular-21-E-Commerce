import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { authTokenInterceptor } from '@core/interceptors/auth-token.interceptor';
import { errorNormalisationInterceptor } from '@core/interceptors/error-normalisation.interceptor';
import { loadingInterceptor } from '@core/interceptors/loading.interceptor';
import { retryInterceptor } from '@core/interceptors/retry.interceptor';
import { unauthorisedInterceptor } from '@core/interceptors/unauthorised.interceptor';
import { mockApiInterceptor } from '@mock-api/mock-api.interceptor';

import { routes } from './app.routes';

/**
 * Router features shared by the application and by any test that boots the real
 * route table.
 *
 * Exported deliberately: routed views rely on `withComponentInputBinding()` to
 * receive their inputs, so a test harness that configures the router without it
 * silently changes behaviour. Keeping one list removes that drift.
 */
export const APP_ROUTER_FEATURES = [
  /** Route params, query params and static `data` bind straight to component inputs. */
  withComponentInputBinding(),
  withInMemoryScrolling({
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
  }),
] as const;

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    /**
     * Zoneless change detection.
     *
     * Angular 21 already omits `zone.js` for new applications, so this call is
     * declaring intent rather than flipping a default: it makes the choice
     * explicit and keeps the app zoneless even if a dependency later pulls
     * `zone.js` onto the page. Every component uses `OnPush` and signals so
     * updates are driven by Angular APIs instead of monkey-patched browser events.
     */
    provideZonelessChangeDetection(),

    /**
     * HTTP stack with a layered interceptor chain.
     *
     * ┌─────────────────────────────────────────────────────────────────┐
     * │  OUTGOING (request flows top → bottom)                          │
     * │                                                                 │
     * │  1. errorNormalisationInterceptor  — catches errors on the way  │
     * │     back up; outermost so it sees everything                     │
     * │  2. unauthorisedInterceptor — 401 triggers auto-logout          │
     * │  3. loadingInterceptor — increments the global in-flight count  │
     * │  4. authTokenInterceptor — attaches Bearer token                │
     * │  5. retryInterceptor — retries transient GET failures           │
     * │  6. mockApiInterceptor — answers requests from seed data        │
     * │     (only when ngUseMockApi is true; eliminated otherwise)      │
     * │                                                                 │
     * │  INCOMING (response flows bottom → top)                         │
     * └─────────────────────────────────────────────────────────────────┘
     *
     * Design rationale for the order:
     *
     * • Error normalisation is outermost so *every* error — including ones from
     *   the auth or retry interceptors — is translated into ApiRequestError
     *   before it reaches a store or component.
     *
     * • Unauthorised sits above loading so that a 401 clears the session before
     *   the loading counter decrements (the redirect happens synchronously, and a
     *   brief flash of "still loading" on the login page looks wrong).
     *
     * • Loading sits above auth-token so that re-attaching a fresh token after a
     *   silent refresh does not produce a second "request started" event.
     *
     * • Auth-token sits above retry so retried requests carry the *current* token
     *   rather than the one that was attached before the first attempt failed.
     *
     * • Retry is innermost (before the mock) so each attempt counts as one
     *   logical request to the loading indicator, not N.
     *
     * • Mock is the terminal handler: it never calls `next(request)`, so nothing
     *   reaches the network while it is active.
     *
     * REPLACING THE MOCK BACKEND: set `ngUseMockApi` to `false` in production's
     * `angular.json` define block. The mock interceptor, handlers and all seed
     * data are eliminated from the build. No other file changes.
     */
    provideHttpClient(
      withFetch(),
      withInterceptors([
        errorNormalisationInterceptor,
        unauthorisedInterceptor,
        loadingInterceptor,
        authTokenInterceptor,
        retryInterceptor,
        ...(ngUseMockApi ? [mockApiInterceptor] : []),
      ]),
    ),

    provideRouter(routes, ...APP_ROUTER_FEATURES),
  ],
};
