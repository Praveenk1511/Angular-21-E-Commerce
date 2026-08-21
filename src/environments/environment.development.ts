import type { AppEnvironment } from './environment.model';

/** Environment used by `ng serve` and any `--configuration development` build. */
export const environment: AppEnvironment = {
  production: false,
  appName: 'Lumen Store',
  apiBaseUrl: '/api',
};
