/** @type { import('stylelint').Config } */
const config = {
  extends: [
    'stylelint-config-recommended',
    'stylelint-config-styled-components',
    'stylelint-config-recommended-scss',
    'stylelint-config-css-modules',
    'stylelint-config-prettier',
  ],
  rules: {
    'no-descending-specificity': null,
    // Allow files without any styles
    'no-empty-source': null,
  },
  overrides: [
    {
      files: [
        '**/*.js',
        '**/*.cjs',
        '**/*.mjs',
        '**/*.jsx',
        '**/*.ts',
        '**/*.tsx',
      ],
      // processors: ['stylelint-processor-styled-components'],
      customSyntax: 'postcss-scss',
    },
  ],
};

module.exports = config;
