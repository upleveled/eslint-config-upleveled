import upleveled from './index.js';

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  ...upleveled,
  {
    ignores: ['__tests__/**/*'],
  },
];

export default config;
