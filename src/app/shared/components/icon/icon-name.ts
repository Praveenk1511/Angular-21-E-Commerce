/**
 * Names of the icons bundled with the {@link Icon} component.
 *
 * Icons are hand-rolled inline SVG rather than an icon font or third-party
 * package: the set is small, it costs no extra dependency, and inline SVG
 * inherits `currentColor` so icons follow the design tokens automatically.
 *
 * Tradeoff: the whole set ships in one chunk whether or not every glyph is used.
 * At this size that is cheaper than the machinery needed to split them.
 */
export const ICON_NAMES = [
  // Shell and navigation
  'search',
  'user',
  'heart',
  'cart',
  'menu',
  'close',
  'chevron-left',
  'chevron-right',
  'chevron-down',

  // Controls
  'check',
  'minus',
  'plus',
  'star',

  // Status and states
  'alert-triangle',
  'info',
  'check-circle',
  'inbox',
] as const;

export type IconName = (typeof ICON_NAMES)[number];
