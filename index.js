module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  extends: ['react-app', 'plugin:jsx-a11y/recommended'],
  plugins: ['jsx-a11y', 'cypress', '@typescript-eslint'],
  env: {
    'cypress/globals': true,
  },
  rules: {
    // Error out on imports that don't match
    // the underlying file system
    // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-unresolved.md
    'import/no-unresolved': 'error',
    // Warn about constant conditions
    // https://eslint.org/docs/rules/no-constant-condition
    'no-constant-condition': 'warn',
    // Warn about variable shadowing
    // https://eslint.org/docs/rules/no-shadow
    'no-shadow': 'warn',
    // Remove `href` warnings on anchor tags for Next.js
    // Issue in Next.js: https://github.com/zeit/next.js/issues/5533
    // Fix: https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/issues/402#issuecomment-368305051
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['invalidHref', 'preferButton'],
      },
    ],
    // Warn about non-changing variables not being constants
    'prefer-const': 'warn',
    // Error on useless React fragments
    'react/jsx-no-useless-fragment': 'error',
    // Disable rule because the new JSX transform in React 17,
    // Next.js and Gatsby no longer requires the import.
    //
    // https://github.com/yannickcr/eslint-plugin-react/issues/2440#issuecomment-683433266
    'react/react-in-jsx-scope': 'off',
    // Naming conventions for variables
    '@typescript-eslint/naming-convention': [
      'warn',
      // Defaults from @typescript-eslint/eslint-plugin
      // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/naming-convention.md#options
      {
        selector: 'default',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'allow',
      },
      {
        selector: 'variable',
        types: ['boolean', 'string', 'number', 'array'],
        format: ['camelCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'allow',
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
      // Allow PascalCase for functions (React components)
      {
        selector: 'function',
        format: ['camelCase', 'PascalCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'variable',
        types: ['function'],
        format: ['camelCase', 'PascalCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'property',
        format: ['camelCase', 'snake_case', 'PascalCase'],
      },
      {
        selector: 'parameter',
        format: ['camelCase', 'snake_case', 'PascalCase'],
      },
    ],
    // Disable built-in ESLint no-use-before-define
    // in order to enable the rule from the
    // @typescript-eslint plugin
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'error',
  },
};
