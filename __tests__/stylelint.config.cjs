/** @type { import('stylelint').Config } */
const config = {
  extends: [
    'stylelint-config-recommended',
    'stylelint-config-recommended-scss',
    'stylelint-config-css-modules',
  ],
  rules: {
    'no-descending-specificity': null,
    // Allow files without any styles
    'no-empty-source': null,
    'no-extra-semicolons': null,
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
      customSyntax: 'postcss-styled-syntax',
    },
  ],
};

module.exports = config;
