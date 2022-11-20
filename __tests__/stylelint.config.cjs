/** @type { import('stylelint').Config } */
const config = {
  processors: ['stylelint-processor-styled-components'],
  customSyntax: 'postcss-scss',
  extends: [
    'stylelint-config-recommended',
    'stylelint-config-styled-components',
    'stylelint-config-prettier',
  ],
  rules: {
    'no-descending-specificity': null,
  },
};

module.exports = config;
