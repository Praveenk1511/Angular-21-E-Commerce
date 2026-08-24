import { TestBed } from '@angular/core/testing';

import { SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update document title and meta description', () => {
    service.setSeoMetadata({
      title: 'Ergonomic Desk Chair',
      description: 'High performance ergonomic workstation chair.',
    });

    expect(document.title).toContain('Ergonomic Desk Chair');
    const descMeta = document.querySelector('meta[name="description"]');
    expect(descMeta?.getAttribute('content')).toBe('High performance ergonomic workstation chair.');
  });

  it('should inject JSON-LD script into head', () => {
    service.setJsonLdSchema({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Test Product',
    });

    const script = document.getElementById('app-json-ld');
    expect(script).toBeTruthy();
    expect(script?.textContent).toContain('Test Product');
  });
});
