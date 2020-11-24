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
  settings: {
    'import/resolver': {
      // Load <rootdir>/tsconfig.json
      typescript: {},
    },
  },
  rules: {
    // Error out on imports that don't match
    // the underlying file system
    // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-unresolved.md
    'import/no-unresolved': 'error',
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
    // Warn about components that have a closing
    // tag but no children
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/self-closing-comp.md
    'react/self-closing-comp': 'warn',
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
        format: null,
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
    // Disable built-in ESLint no-constant-condition
    // to use the more powerful no-unnecessary-condition
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unnecessary-condition.md
    'no-constant-condition': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'warn',
    // Disable obsolete rule
    // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/issues/398#issuecomment-728976688
    'jsx-a11y/no-onchange': 'off',
    // Prevent unnecessary type assertions
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unnecessary-type-assertion.md
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    // Prevent unnecessary type arguments
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unnecessary-type-arguments.md
    '@typescript-eslint/no-unnecessary-type-arguments': 'error',
    // Prevent unused React prop types
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-unused-prop-types.md
    'react/no-unused-prop-types': 'error',
    // Warn on comments without a space between the `//` and the comment
    // https://github.com/eslint/eslint/blob/master/docs/rules/spaced-comment.md
    'spaced-comment': 'warn',
  },
};
