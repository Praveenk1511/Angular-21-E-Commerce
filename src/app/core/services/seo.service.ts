import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoConfig {
  readonly title: string;
  readonly description?: string | undefined;
  readonly image?: string | undefined;
  readonly url?: string | undefined;
  readonly type?: 'website' | 'product' | 'article' | undefined;
  readonly keywords?: readonly string[] | undefined;
}

/**
 * Root SEO & Social Metadata Manager.
 *
 * Provides reactive methods for updating dynamic page titles, meta descriptions,
 * Open Graph social tags (og:title, og:image, og:url), Twitter cards, canonical links,
 * and JSON-LD Schema.org structured data for Google Search rich snippets.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  private readonly defaultSiteName = 'Lumen Store';
  private readonly defaultDescription =
    'Discover premium workstation setup essentials, audio equipment, ergonomic furniture, and high-performance tech accessories at Lumen Store.';
  private readonly defaultOgImage = '/assets/images/lumen-og-cover.png';

  /**
   * Sets dynamic page title, meta description, Open Graph, Twitter cards, and canonical links.
   */
  setSeoMetadata(config: SeoConfig): void {
    const pageTitle = config.title.includes(this.defaultSiteName)
      ? config.title
      : `${config.title} | ${this.defaultSiteName}`;

    const desc = config.description || this.defaultDescription;
    const ogImage = config.image || this.defaultOgImage;
    const canonicalUrl = config.url || this.doc.location?.href || 'https://lumen-store.example.com';
    const ogType = config.type || 'website';

    // 1. Title & Description
    this.titleService.setTitle(pageTitle);
    this.metaService.updateTag({ name: 'description', content: desc });

    if (config.keywords && config.keywords.length > 0) {
      this.metaService.updateTag({ name: 'keywords', content: config.keywords.join(', ') });
    }

    // 2. Open Graph Metadata
    this.metaService.updateTag({ property: 'og:site_name', content: this.defaultSiteName });
    this.metaService.updateTag({ property: 'og:title', content: pageTitle });
    this.metaService.updateTag({ property: 'og:description', content: desc });
    this.metaService.updateTag({ property: 'og:type', content: ogType });
    this.metaService.updateTag({ property: 'og:url', content: canonicalUrl });
    this.metaService.updateTag({ property: 'og:image', content: ogImage });

    // 3. Twitter Cards
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: pageTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: desc });
    this.metaService.updateTag({ name: 'twitter:image', content: ogImage });

    // 4. Canonical URL Link
    this.setCanonicalUrl(canonicalUrl);
  }

  /**
   * Injects or updates Schema.org JSON-LD structured data script in head.
   */
  setJsonLdSchema(schemaObj: object): void {
    let script = this.doc.getElementById('app-json-ld') as HTMLScriptElement | null;
    if (!script) {
      script = this.doc.createElement('script');
      script.id = 'app-json-ld';
      script.type = 'application/ld+json';
      this.doc.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schemaObj, null, 2);
  }

  /**
   * Injects or updates <link rel="canonical"> in document head.
   */
  private setCanonicalUrl(url: string): void {
    let link = this.doc.querySelector<HTMLLinkElement>("link[rel='canonical']");
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
