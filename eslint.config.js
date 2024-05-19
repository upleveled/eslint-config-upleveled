import upleveled from './index.js';

/** @type {import('@typescript-eslint/utils/ts-eslint').FlatConfig.ConfigArray} */
const config = [
  ...upleveled,
  {
    ignores: [
      // Tests
      '__tests__/**/*',
      // Vendored packages (workarounds for incompatibilities)
      'vendor/**/*',
    ],
  },
];

export default config;
