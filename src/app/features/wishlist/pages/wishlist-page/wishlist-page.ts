import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

/** Route placeholder for the wishlist. Replaced by the wishlist phase. */
@Component({
  selector: 'app-wishlist-page',
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page heading="Your wishlist" description="Saved products will appear here." />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishlistPage {}
