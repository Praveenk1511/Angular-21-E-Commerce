import type { Routes } from '@angular/router';

import { SEGMENTS } from '@core/config/route-paths';
import type { AppRouteData } from '@core/models';

/**
 * Static information pages linked from the footer.
 *
 * These carry over from the shell phase and sit outside the feature route list:
 * they are content pages, not features, and will never grow behaviour. That is why
 * they share one component driven by route metadata instead of each getting a
 * named placeholder — a per-page component would be five identical files.
 */
const INFO_PAGES: readonly { segment: string; heading: string }[] = [
  { segment: SEGMENTS.about, heading: 'About us' },
  { segment: SEGMENTS.contact, heading: 'Contact us' },
  { segment: SEGMENTS.shippingReturns, heading: 'Shipping & returns' },
  { segment: SEGMENTS.privacy, heading: 'Privacy policy' },
  { segment: SEGMENTS.terms, heading: 'Terms of service' },
];

export const INFO_ROUTES: Routes = INFO_PAGES.map(({ segment, heading }) => ({
  path: segment,
  title: heading,
  // `heading` reaches the component's input through withComponentInputBinding().
  data: { heading, breadcrumb: heading } satisfies AppRouteData,
  loadComponent: () =>
    import('@shared/components/placeholder-page/placeholder-page').then((m) => m.PlaceholderPage),
}));
