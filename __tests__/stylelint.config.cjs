/** @type { import('stylelint').Config } */
const config = {
  extends: [
    'stylelint-config-recommended',
    'stylelint-config-styled-components',
    'stylelint-config-prettier',
  ],
  rules: {
    'no-descending-specificity': null,
  },
  overrides: [
    {
      files: ['**/*.cjs', '**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
      processors: ['stylelint-processor-styled-components'],
      customSyntax: 'postcss-scss',
    },
  ],
};

module.exports = config;
