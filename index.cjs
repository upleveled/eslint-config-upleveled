module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    extraFileExtensions: ['.cjs', '.mjs'],
  },
  extends: ['react-app', 'plugin:jsx-a11y/recommended'],
  plugins: [
    '@next/next',
    '@typescript-eslint',
    'cypress',
    'import',
    'jsx-a11y',
    'react',
    'react-hooks',
    'unicorn',
  ],
  env: {
    es2020: true,
    'cypress/globals': true,
  },
  settings: {
    'import/resolver': {
      // Load <rootdir>/tsconfig.json
      typescript: {
        // Always try resolving any corresponding @types/* folders
        alwaysTryTypes: true,
      },
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
    // https://eslint.org/docs/rules/prefer-const
    'prefer-const': 'warn',
    // Warn on usage of var (which doesn't follow block scope rules)
    // https://eslint.org/docs/rules/no-var
    'no-var': 'warn',
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
    // to use the more powerful @typescript-eslint/no-unnecessary-condition
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
    'spaced-comment': ['warn', 'always', { markers: ['/'] }],
    // Disable built-in ESLint no-unused-vars
    // to use the more powerful @typescript-eslint/no-unused-vars
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unused-vars.md
    // https://eslint.org/docs/rules/no-unused-vars
    'no-unused-vars': 'off',
    // No need for this, @typescript-eslint/parser fully understands JSX semantics
    // https://github.com/typescript-eslint/typescript-eslint/issues/2985#issuecomment-771771967
    'react/jsx-uses-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        args: 'after-used',
        ignoreRestSiblings: true,
      },
    ],
    // Allow leaving out curlies only with single-line condition blocks
    // https://github.com/eslint/eslint/blob/master/docs/rules/curly.md#multi-line
    curly: ['error', 'multi-line', 'consistent'],
    // Detect missing `key` props in maps in JSX
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-key.md
    'react/jsx-key': ['error', { checkFragmentShorthand: true }],
    // Warn if a `key` is set to an `index`
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-array-index-key.md
    'react/no-array-index-key': ['error'],
    // Warn about unnecessary curly braces around props and string literal children
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-curly-brace-presence.md
    'react/jsx-curly-brace-presence': 'warn',
    // Warn about usage of substring or substr instead of slice
    'unicorn/prefer-string-slice': 'warn',
    // Error about creating components within components
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-unstable-nested-components.md
    'react/no-unstable-nested-components': 'error',
    // Warn about importing or requiring builtin modules without node: prefix
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-node-protocol.md
    'unicorn/prefer-node-protocol': ['warn', { checkRequire: true }],
    // Error about importing next/document in a page other than pages/_document.js
    // https://github.com/vercel/next.js/blob/canary/errors/no-document-import-in-page.md
    '@next/next/no-document-import-in-page': 'error',
    // Error about importing next/head in pages/_document.js
    // https://github.com/vercel/next.js/blob/canary/errors/no-head-import-in-document.md
    '@next/next/no-head-import-in-document': 'error',
    // Error about using <a> element to navigate to a page route instead of Next.js <Link /> component
    // https://github.com/vercel/next.js/blob/canary/errors/no-html-link-for-pages.md
    '@next/next/no-html-link-for-pages': 'error',
    // Warn about using a custom font in a single page instead of in pages/_document.js
    // https://github.com/vercel/next.js/blob/canary/errors/no-page-custom-font.md
    '@next/next/no-page-custom-font': 'warn',
    // Warn about setting a title for all pages in a single page by importing <Head /> from next/document
    // https://github.com/vercel/next.js/blob/canary/errors/no-title-in-document-head.md
    '@next/next/no-title-in-document-head': 'warn',
    // Error about not using passHref on a Next.js <Link /> component which wraps a custom component
    // https://github.com/vercel/next.js/blob/canary/errors/link-passhref.md
    '@next/next/link-passhref': 'error',
  },
};
