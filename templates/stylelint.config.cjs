/** @type { import('stylelint').Config } */
const config = {
  extends: ['stylelint-config-recommended'],
  rules: {
    'no-descending-specificity': null,
    // Allow files without any styles
    'no-empty-source': null,
  },
  overrides: [
    {
      files: ['**/*.css', '**/*.scss', '**/*.sass', '**/*.less'],
      extends: ['stylelint-config-recommended-scss'],
      rules: {
        'scss/at-rule-no-unknown': [
          true,
          {
            ignoreAtRules: ['tailwind'],
          },
        ],
      },
    },
    {
      files: ['**/*.module.css', '**/*.module.scss', '**/*.module.sass'],
      extends: ['stylelint-config-css-modules'],
    },
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
