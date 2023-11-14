import upleveled from './index.js';

/** @type {import('@typescript-eslint/utils/ts-eslint').FlatConfig.ConfigArray} */
const config = [
  ...upleveled,
  {
    ignores: ['__tests__/**/*'],
  },
];

export default config;
