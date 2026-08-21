import type { ActivatedRouteSnapshot } from '@angular/router';

import type { AppRouteData } from '@core/models';

/**
 * Resolve the effective {@link AppRouteData} for an activated route by merging the
 * metadata declared along its whole ancestor chain, deepest value winning.
 *
 * Necessary because Angular's default `paramsInheritanceStrategy` of `emptyOnly`
 * only passes a parent's `data` down to children that *themselves* have an empty
 * path. `/admin/dashboard` therefore does not see the `requiresAdmin` flag declared
 * on the admin layout route, even though the layout route is its parent.
 *
 * Walking the chain is preferred over switching the router to `'always'`, which
 * would also cascade route *parameters* and let a nested component silently receive
 * an ancestor's `:id` through `withComponentInputBinding()`.
 *
 * Guards attached directly to an area's parent route do not need this — they read
 * their own route's `data`. This is for consumers that start from a leaf, such as
 * breadcrumbs or a "is the current page protected?" check.
 */
export function resolveRouteData(snapshot: ActivatedRouteSnapshot): AppRouteData {
  return snapshot.pathFromRoot.reduce<AppRouteData>(
    (merged, route) => ({ ...merged, ...(route.data as AppRouteData) }),
    {},
  );
}
