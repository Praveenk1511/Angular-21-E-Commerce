import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

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

    /** `withFetch` uses the Fetch API, which is also the SSR-friendly choice. */
    provideHttpClient(withFetch()),

    provideRouter(routes, ...APP_ROUTER_FEATURES),
  ],
};
