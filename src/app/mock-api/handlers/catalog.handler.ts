import { type MockRoute, notFound, ok } from '../mock-api.types';
import { allBrands, allCategories, categoryTree, findBrand, findCategory } from '../mock-db';

/** Category and brand endpoints. Both are small enough to return unpaged. */
export function createCatalogRoutes(): readonly MockRoute[] {
  return [
    {
      method: 'GET',
      path: '/categories',
      handle: ({ query }) =>
        // Two shapes from one endpoint: the nested tree for navigation, the flat list
        // for pickers that need every category as an option.
        ok(query['flat'] === 'true' ? allCategories() : categoryTree()),
    },

    {
      method: 'GET',
      path: '/categories/:idOrSlug',
      handle: ({ params }) => {
        const idOrSlug = params['idOrSlug'] ?? '';
        const category = findCategory(idOrSlug);

        if (!category) {
          throw notFound(`No category matches "${idOrSlug}".`);
        }

        return ok(category);
      },
    },

    {
      method: 'GET',
      path: '/brands',
      handle: () => ok(allBrands()),
    },

    {
      method: 'GET',
      path: '/brands/:idOrSlug',
      handle: ({ params }) => {
        const idOrSlug = params['idOrSlug'] ?? '';
        const brand = findBrand(idOrSlug);

        if (!brand) {
          throw notFound(`No brand matches "${idOrSlug}".`);
        }

        return ok(brand);
      },
    },
  ];
}
