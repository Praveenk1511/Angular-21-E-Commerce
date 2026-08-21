/**
 * Category seed records.
 *
 * A flat list with `parentId` links, exactly as a relational backend would return it.
 * The mock API assembles the tree on request, which keeps the seed easy to edit and
 * means the nesting logic lives in one place rather than in the data.
 *
 * Product counts are computed by the API from the catalogue, not stored here.
 */
export interface CategorySeed {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly parentId: string | null;
  readonly position: number;
}

export const CATEGORY_SEEDS: readonly CategorySeed[] = [
  // ---------- Audio ----------
  {
    id: 'cat-audio',
    slug: 'audio',
    name: 'Audio',
    description: 'Headphones, earbuds and speakers for listening at home and on the move.',
    parentId: null,
    position: 1,
  },
  {
    id: 'cat-headphones',
    slug: 'headphones',
    name: 'Headphones',
    description: 'Over-ear and on-ear designs, wired and wireless.',
    parentId: 'cat-audio',
    position: 1,
  },
  {
    id: 'cat-earbuds',
    slug: 'earbuds',
    name: 'Earbuds',
    description: 'In-ear designs with charging cases.',
    parentId: 'cat-audio',
    position: 2,
  },
  {
    id: 'cat-speakers',
    slug: 'speakers',
    name: 'Speakers',
    description: 'Portable and shelf speakers.',
    parentId: 'cat-audio',
    position: 3,
  },

  // ---------- Computing ----------
  {
    id: 'cat-computing',
    slug: 'computing',
    name: 'Computing',
    description: 'Laptops, monitors and the peripherals that go with them.',
    parentId: null,
    position: 2,
  },
  {
    id: 'cat-laptops',
    slug: 'laptops',
    name: 'Laptops',
    description: 'Portable machines from ultralight to workstation.',
    parentId: 'cat-computing',
    position: 1,
  },
  {
    id: 'cat-monitors',
    slug: 'monitors',
    name: 'Monitors',
    description: 'Desktop displays, including colour-calibrated panels.',
    parentId: 'cat-computing',
    position: 2,
  },
  {
    id: 'cat-input',
    slug: 'keyboards-and-mice',
    name: 'Keyboards & mice',
    description: 'Mechanical keyboards, pointing devices and desk mats.',
    parentId: 'cat-computing',
    position: 3,
  },

  // ---------- Photography ----------
  {
    id: 'cat-photography',
    slug: 'photography',
    name: 'Photography',
    description: 'Camera bodies, lenses and support gear.',
    parentId: null,
    position: 3,
  },
  {
    id: 'cat-cameras',
    slug: 'cameras',
    name: 'Cameras',
    description: 'Mirrorless and compact bodies.',
    parentId: 'cat-photography',
    position: 1,
  },
  {
    id: 'cat-lenses',
    slug: 'lenses',
    name: 'Lenses',
    description: 'Primes and zooms for the Northwind mount.',
    parentId: 'cat-photography',
    position: 2,
  },

  // ---------- Wearables ----------
  {
    id: 'cat-wearables',
    slug: 'wearables',
    name: 'Wearables',
    description: 'Watches and trackers.',
    parentId: null,
    position: 4,
  },

  // ---------- Home ----------
  {
    id: 'cat-home',
    slug: 'home',
    name: 'Home',
    description: 'Kitchen equipment and lighting.',
    parentId: null,
    position: 5,
  },
  {
    id: 'cat-kitchen',
    slug: 'kitchen',
    name: 'Kitchen',
    description: 'Coffee, cookware and small appliances.',
    parentId: 'cat-home',
    position: 1,
  },
  {
    id: 'cat-lighting',
    slug: 'lighting',
    name: 'Lighting',
    description: 'Lamps and smart bulbs.',
    parentId: 'cat-home',
    position: 2,
  },

  // ---------- Accessories ----------
  {
    id: 'cat-accessories',
    slug: 'accessories',
    name: 'Accessories',
    description: 'Bags, cables and chargers.',
    parentId: null,
    position: 6,
  },
];
