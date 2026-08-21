// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      // Two accepted shapes: normal components are kebab-case elements, while
      // design-system components that style a native element (button[appButton])
      // are camelCase attributes, matching Angular's own convention.
      '@angular-eslint/component-selector': [
        'error',
        [
          {
            type: 'element',
            prefix: 'app',
            style: 'kebab-case',
          },
          {
            type: 'attribute',
            prefix: 'app',
            style: 'camelCase',
          },
        ],
      ],
    },
  },
  {
    // Architectural boundary, enforced rather than documented.
    //
    // The mock backend exists so it can be deleted. That only holds while nothing above
    // it reads the fixtures directly — one component importing a seed array turns
    // "remove one interceptor" into a refactor. The mock API itself is exempt, since
    // reading seed data is its entire job.
    files: ['**/*.ts'],
    ignores: ['src/app/mock-api/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@mock-data', '@mock-data/*', '**/mock-data', '**/mock-data/*'],
              message:
                'Only the mock API may import seed data. Use a service from @core/services so the mock backend can be replaced without touching this file.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
