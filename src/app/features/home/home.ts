import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { APP_URLS } from '@core/config/route-paths';
import { SeoService } from '@core/services/seo.service';
import { ErrorState } from '@shared/components/error-state/error-state';
import { PageContainer } from '@shared/components/page-container/page-container';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { Spinner } from '@shared/components/spinner/spinner';
import { HomeStore } from '@state/home.store';

import { CustomerBenefits } from './sections/customer-benefits/customer-benefits';
import { FeaturedCategories } from './sections/featured-categories/featured-categories';
import { Hero } from './sections/hero/hero';
import { Newsletter } from './sections/newsletter/newsletter';
import { ProductGridSection } from './sections/product-grid-section/product-grid-section';
import { PromoBanner } from './sections/promo-banner/promo-banner';

/**
 * Home page: the storefront landing experience.
 *
 * Sections are composed from standalone child components, each owning its own markup
 * and styling. The home component provides layout rhythm and the data boundary — it
 * owns the {@link HomeStore} that fetches everything in parallel and exposes loading
 * plus error state.
 */
@Component({
  selector: 'app-home',
  imports: [
    PageContainer,
    ErrorState,
    Skeleton,
    Spinner,
    Hero,
    FeaturedCategories,
    ProductGridSection,
    PromoBanner,
    CustomerBenefits,
    Newsletter,
  ],
  providers: [HomeStore],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly store = inject(HomeStore);
  private readonly seoService = inject(SeoService);
  protected readonly productsUrl = APP_URLS.products;

  constructor() {
    this.store.load();

    this.seoService.setSeoMetadata({
      title: 'Lumen — Modern Electronics, Workstation & Audio Essentials',
      description: 'Discover premium workstation setup essentials, studio audio equipment, ergonomic office furniture, and high-performance tech accessories at Lumen Store.',
      type: 'website',
      keywords: ['electronics', 'workstation', 'audio', 'headphones', 'ergonomic desk', 'tech accessories'],
    });

    this.seoService.setJsonLdSchema({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Lumen Store',
      url: 'https://lumen-store.example.com',
      logo: 'https://lumen-store.example.com/assets/images/lumen-logo.png',
      description: 'Premium workstation setup essentials, audio equipment, and tech accessories.',
    });
  }
}
