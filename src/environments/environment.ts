import type { AppEnvironment } from './environment.model';

/**
 * Default (production) environment.
 *
 * The `development` build configuration swaps this file for
 * `environment.development.ts` via `fileReplacements` in `angular.json`.
 */
export const environment: AppEnvironment = {
  production: true,
  appName: 'Lumen Store',
  apiBaseUrl: '/api',
};
