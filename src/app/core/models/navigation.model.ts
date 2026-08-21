import type { IconName } from '@shared/components/icon/icon-name';

/** A single navigable destination rendered by the shell. */
export interface NavigationItem {
  /** Stable key used for `@for` tracking. */
  readonly id: string;
  /** Visible link text, and the accessible name of the link. */
  readonly label: string;
  /** Absolute router URL. Always a registered route, never a dead link. */
  readonly url: string;
  /**
   * Require the whole URL to match before the link is marked as current.
   * Needed for the root link, which would otherwise match every route.
   */
  readonly exact?: boolean;
}

/** A titled group of links, used to build the footer columns. */
export interface NavigationGroup {
  readonly id: string;
  readonly heading: string;
  readonly items: readonly NavigationItem[];
}

/**
 * An icon-led shortcut in the header utility bar (account, wishlist, cart).
 *
 * Phase 02 renders these as plain links. The badge counts and dropdown panels
 * they eventually grow belong to the phases that own that state.
 */
export interface HeaderAction extends NavigationItem {
  readonly icon: IconName;
  /** Show the label next to the icon on wide viewports instead of hiding it. */
  readonly showLabelOnDesktop?: boolean;
}
