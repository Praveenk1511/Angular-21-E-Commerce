import type { AppEnvironment } from './environment.model';

/**
 * Explicit Production environment config.
 */
export const environment: AppEnvironment = {
  production: true,
  appName: 'Lumen Store',
  apiBaseUrl: '/api/v1',
};
