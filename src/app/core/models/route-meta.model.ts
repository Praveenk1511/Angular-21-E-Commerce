/**
 * Typed contract for the static `data` attached to a route.
 *
 * Route metadata is declared here rather than scattered as loose object literals
 * so that:
 *
 * - guards can read access requirements from `ActivatedRouteSnapshot.data`
 *   instead of pattern-matching URLs;
 * - a breadcrumb trail can be built by walking the activated route tree;
 * - a typo in a metadata key fails at compile time via `satisfies AppRouteData`.
 *
 * No guard reads these flags yet. They exist so the guards added in the auth phase
 * are a pure addition — declaring `canActivate` on routes that already state their
 * requirements — rather than a restructuring of the route table.
 */
export interface AppRouteData {
  /** Human-readable label for this segment in a breadcrumb trail. */
  readonly breadcrumb?: string;

  /**
   * Page heading for views that render their `h1` from route metadata rather than
   * from their own template — currently the static information pages, which share
   * one component.
   */
  readonly heading?: string;

  /** Route is only reachable by a signed-in user. */
  readonly requiresAuth?: boolean;

  /** Route additionally requires administrator privileges. */
  readonly requiresAdmin?: boolean;
}
