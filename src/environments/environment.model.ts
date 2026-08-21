/**
 * Shape of the build-time environment configuration.
 *
 * Every environment file must satisfy this contract, so adding a new setting is
 * a compile-time break until all environments provide it.
 */
export interface AppEnvironment {
  /** True only for optimised production builds. */
  readonly production: boolean;

  /** Human readable application name, used for document titles and branding. */
  readonly appName: string;

  /**
   * Base URL every HTTP request is resolved against.
   *
   * While the application runs on mock data this stays a relative path so that
   * swapping in a real REST backend is a configuration change, not a code change.
   */
  readonly apiBaseUrl: string;
}
