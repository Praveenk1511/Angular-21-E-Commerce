/**
 * Compile-time flags substituted by the build's `define` option (see `angular.json`).
 *
 * These are not runtime configuration. Because the bundler replaces the identifier
 * with a literal before optimisation, a `false` value lets dead-code elimination
 * remove the guarded branch *and* everything it references — which is the difference
 * between a development-only feature being unreachable and it not being shipped at
 * all.
 */

/** True for development builds, false for production. Gates the design system page. */
declare const ngDevDesignSystem: boolean;
