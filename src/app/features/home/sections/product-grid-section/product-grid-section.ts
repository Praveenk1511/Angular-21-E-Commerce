import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { ProductSummary } from '@core/models';
import { ProductCard } from '@shared/components/product-card/product-card';
import { SectionHeader } from '@shared/components/section-header/section-header';

/**
 * A generic section displaying a heading and a grid of product cards.
 *
 * Reused for Featured, Bestsellers, New Arrivals and Deals — the only things that
 * differ are the heading text, the CTA URL and the product list. The layout,
 * responsive behaviour and card rendering are identical.
 */
@Component({
  selector: 'app-product-grid-section',
  imports: [SectionHeader, ProductCard],
  templateUrl: './product-grid-section.html',
  styleUrl: './product-grid-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductGridSection {
  readonly heading = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly ctaLabel = input<string | null>(null);
  readonly ctaUrl = input<string | null>(null);
  readonly products = input.required<readonly ProductSummary[]>();
}
