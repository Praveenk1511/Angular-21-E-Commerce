/**
 * Brand seed records.
 *
 * Brands are invented rather than real. Realistic *shape* is what matters for
 * building against, and shipping real trademarks in a repository's fixtures is an
 * avoidable liability.
 *
 * `productCount` is not stored here — the mock API counts the catalogue, so the two
 * cannot drift.
 */
export interface BrandSeed {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly countryOfOrigin: string;
  readonly foundedYear: number;
}

export const BRAND_SEEDS: readonly BrandSeed[] = [
  {
    id: 'brd-aurelia',
    slug: 'aurelia-audio',
    name: 'Aurelia Audio',
    description:
      'Studio monitoring specialists who moved into consumer headphones in the mid-2000s. Known for flat, uncoloured tuning and repairable designs.',
    countryOfOrigin: 'Denmark',
    foundedYear: 1978,
  },
  {
    id: 'brd-kestrel',
    slug: 'kestrel',
    name: 'Kestrel',
    description:
      'Portable audio and wearables built around long battery life. Every product ships with a published repair manual.',
    countryOfOrigin: 'South Korea',
    foundedYear: 2009,
  },
  {
    id: 'brd-northwind',
    slug: 'northwind-instruments',
    name: 'Northwind Instruments',
    description:
      'Precision optics and camera bodies, originally a maker of surveying equipment. Lens mounts have been backwards compatible since 1991.',
    countryOfOrigin: 'Germany',
    foundedYear: 1954,
  },
  {
    id: 'brd-vantage',
    slug: 'vantage-computing',
    name: 'Vantage Computing',
    description:
      'Laptops and displays aimed at developers and designers, with socketed memory and user-replaceable batteries.',
    countryOfOrigin: 'Taiwan',
    foundedYear: 1996,
  },
  {
    id: 'brd-ferrite',
    slug: 'ferrite',
    name: 'Ferrite',
    description:
      'Mechanical keyboards, pointing devices and desk accessories. Sells individual switches and keycaps as spares.',
    countryOfOrigin: 'United States',
    foundedYear: 2014,
  },
  {
    id: 'brd-solace',
    slug: 'solace-home',
    name: 'Solace Home',
    description:
      'Kitchen and living products with a preference for stainless steel and borosilicate glass over coatings that wear out.',
    countryOfOrigin: 'Italy',
    foundedYear: 1988,
  },
  {
    id: 'brd-lumina',
    slug: 'lumina',
    name: 'Lumina',
    description:
      'Lighting and smart home hardware. Runs local-first firmware so devices keep working without a cloud account.',
    countryOfOrigin: 'Netherlands',
    foundedYear: 2011,
  },
  {
    id: 'brd-marlow',
    slug: 'marlow-supply',
    name: 'Marlow Supply',
    description:
      'Bags, cables and travel goods made from recycled fabrics, with a stated ten-year repair commitment.',
    countryOfOrigin: 'United Kingdom',
    foundedYear: 2016,
  },
];
