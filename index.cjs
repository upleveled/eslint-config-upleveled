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
    '@upleveled/upleveled',
    'cypress',
    'import',
    'jsx-a11y',
    'jsx-expressions',
    'react',
    'react-hooks',
    'security',
    'sonarjs',
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
    // Error on dangerous types like:
    // - uppercase primitive types
    // - Function
    // - Object and {}
    // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/ban-types.md
    '@typescript-eslint/ban-types': ['error'],
    // Warn on variables not following naming convention
    // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/naming-convention.md
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
    // Warn on dangling promises without await
    '@typescript-eslint/no-floating-promises': ['warn', { ignoreVoid: false }],
    // Warn about variable shadowing
    // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-shadow.md
    '@typescript-eslint/no-shadow': 'warn',
    // Disable built-in ESLint no-constant-condition
    // to use the more powerful @typescript-eslint/no-unnecessary-condition
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unnecessary-condition.md
    'no-constant-condition': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'warn',
    // Prevent unnecessary type arguments
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unnecessary-type-arguments.md
    '@typescript-eslint/no-unnecessary-type-arguments': 'warn',
    // Prevent unnecessary type assertions
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unnecessary-type-assertion.md
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
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
    // Disable built-in ESLint no-use-before-define
    // in order to enable the rule from the
    // @typescript-eslint plugin
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'error',
    // Warn about submit handler without event.preventDefault()
    // https://github.com/upleveled/eslint-plugin-upleveled/blob/main/docs/rules/no-submit-handler-without-preventDefault.md
    '@upleveled/upleveled/no-submit-handler-without-preventDefault': 'error',
    // Warn about unnecessary HTML attributes
    // https://github.com/upleveled/eslint-plugin-upleveled/blob/main/docs/rules/no-unnecessary-html-attributes.md
    '@upleveled/upleveled/no-unnecessary-html-attributes': 'warn',
    // Warn about unnecessary for and id attributes with inputs nested inside of labels
    // https://github.com/upleveled/eslint-plugin-upleveled/blob/main/docs/rules/no-unnecessary-for-and-id.md
    '@upleveled/upleveled/no-unnecessary-for-and-id': 'warn',
    // Warn about unnecessary interpolations in template strings
    // https://github.com/upleveled/eslint-plugin-upleveled/blob/main/docs/rules/no-unnecessary-interpolations.md
    '@upleveled/upleveled/no-unnecessary-interpolations': 'warn',
    // Allow leaving out curlies only with single-line condition blocks
    // https://github.com/eslint/eslint/blob/master/docs/rules/curly.md#multi-line
    curly: ['error', 'multi-line', 'consistent'],
    // Error out on imports that don't match
    // the underlying file system
    // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-unresolved.md
    'import/no-unresolved': 'error',
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
    // Disable obsolete rule
    // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/issues/398#issuecomment-728976688
    'jsx-a11y/no-onchange': 'off',
    // Disallow potentially falsey string and number values in logical && expressions
    // https://github.com/hpersson/eslint-plugin-jsx-expressions/blob/master/docs/rules/strict-logical-expressions.md
    'jsx-expressions/strict-logical-expressions': 'error',
    // Warn on async promise executor function
    // https://github.com/eslint/eslint/blob/main/docs/src/rules/no-async-promise-executor.md
    'no-async-promise-executor': 'warn',
    // Warn on return in promise executor function
    // https://github.com/eslint/eslint/blob/main/docs/src/rules/no-promise-executor-return.md
    'no-promise-executor-return': 'warn',
    // Warn on restricted syntax
    'no-restricted-syntax': [
      'warn',
      // Currently it is not possible to use Markdown eg. links in ESLint warnings / error messages
      //
      // FIXME: Switch to a custom rule
      // https://github.com/upleveled/eslint-config-upleveled/issues/123
      {
        selector:
          "ExpressionStatement CallExpression[callee.object.name='document'][callee.property.name='querySelector'], VariableDeclaration VariableDeclarator CallExpression[callee.object.name='document'][callee.property.name='querySelector']",
        message: `Using document.querySelector() can lead to problems, and is not commonly used in React code - prefer instead usage of basic React patterns such as state and controlled components
https://github.com/reactjs/reactjs.org/issues/4626#issuecomment-1117535930`,
      },
      {
        selector:
          "ExpressionStatement CallExpression[callee.object.name='document'][callee.property.name='querySelectorAll'], VariableDeclaration VariableDeclarator CallExpression[callee.object.name='document'][callee.property.name='querySelectorAll']",
        message: `Using document.querySelectorAll() can lead to problems, and is not commonly used in React code - prefer instead usage of basic React patterns such as state and controlled components
https://github.com/reactjs/reactjs.org/issues/4626#issuecomment-1117535930`,
      },
      {
        selector:
          "ExpressionStatement CallExpression[callee.object.name='document'][callee.property.name='getElementById'], VariableDeclaration VariableDeclarator[init.callee.object.name!='ReactDOM'][init.callee.property.name!='createRoot'] CallExpression[callee.object.name='document'][callee.property.name='getElementById']",
        message: `Using document.getElementById() can lead to problems, and is not commonly used in React code - prefer instead usage of basic React patterns such as state and controlled components
https://github.com/reactjs/reactjs.org/issues/4626#issuecomment-1117535930`,
      },

      // Currently it is not possible to use Markdown eg. links in ESLint warnings / error messages
      //
      // FIXME: Switch to a custom rule
      // https://github.com/upleveled/eslint-config-upleveled/issues/126
      {
        selector:
          'FunctionDeclaration VariableDeclaration:has(VariableDeclarator > TaggedTemplateExpression > MemberExpression[object.name="styled"][property]), FunctionDeclaration VariableDeclaration:has(VariableDeclarator > TaggedTemplateExpression[tag.name="css"])',
        message:
          'Declaring Emotion styles or a styled component within a React component will cause the element to get recreated, causing loss of state and other problems - see the react/no-unstable-nested-components docs for more info https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unstable-nested-components.md',
      },

      {
        selector:
          "ExpressionStatement CallExpression[callee.object.name='location'][callee.property.name='reload']",
        message:
          'Update content and elements with React instead of using location.reload()',
      },
      {
        selector:
          "ExpressionStatement CallExpression[callee.object.object.name='window'][callee.object.property.name='location'][callee.property.name='reload']",
        message:
          'Update content and elements with React instead of using location.reload()',
      },

      {
        selector:
          "JSXAttribute[name.name='href'] > Literal[value=/^\\./], JSXAttribute[name.name='href'] > JSXExpressionContainer > TemplateLiteral TemplateElement:first-child[value.cooked=/^\\./]",
        message:
          'Always start href relative URLs with a forward slash (aka use root relative URLs) - read more at https://www.webdevbydoing.com/absolute-relative-and-root-relative-file-paths/',
      },
    ],
    // Warn on usage of var (which doesn't follow block scope rules)
    // https://eslint.org/docs/rules/no-var
    'no-var': 'warn',
    // Warn about non-changing variables not being constants
    // https://eslint.org/docs/rules/prefer-const
    'prefer-const': 'warn',
    // Warn on promise rejection without Error object
    // https://github.com/eslint/eslint/blob/main/docs/src/rules/prefer-promise-reject-errors.md
    'prefer-promise-reject-errors': 'warn',
    // Warn about state variable and setter names which are not symmetrically named
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/hook-use-state.md
    'react/hook-use-state': 'warn',
    // Error on missing sandbox attribute on iframes (good security practice)
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/iframe-missing-sandbox.md
    'react/iframe-missing-sandbox': 'error',
    // Warn about unnecessary curly braces around props and string literal children
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-curly-brace-presence.md
    'react/jsx-curly-brace-presence': [
      'warn',
      { props: 'never', children: 'never', propElementValues: 'always' },
    ],
    // Error on missing or incorrect `key` props in maps in JSX
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-key.md
    'react/jsx-key': [
      'error',
      {
        checkFragmentShorthand: true,
        checkKeyMustBeforeSpread: true,
        warnOnDuplicates: true,
      },
    ],
    // Error on useless React fragments
    'react/jsx-no-useless-fragment': 'warn',
    // Warn if a `key` is set to an `index`
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-array-index-key.md
    'react/no-array-index-key': ['error'],
    // Error on invalid HTML attributes (only `rel` as of March 2022)
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-invalid-html-attribute.md
    'react/no-invalid-html-attribute': 'error',
    // Warn on usage of `class` prop instead of `className`
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-unknown-property.md
    'react/no-unknown-property': ['warn', { ignore: ['css'] }],
    // Error on creating components within components
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-unstable-nested-components.md
    'react/no-unstable-nested-components': 'error',
    // Error on unused React prop types
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-unused-prop-types.md
    'react/no-unused-prop-types': 'warn',
    // Disable rule because the new JSX transform in React 17,
    // Next.js and Gatsby no longer requires the import.
    // https://github.com/yannickcr/eslint-plugin-react/issues/2440#issuecomment-683433266
    'react/react-in-jsx-scope': 'off',
    // Warn about components that have a closing
    // tag but no children
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/self-closing-comp.md
    'react/self-closing-comp': 'warn',
    // Error on passing children to void elements
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/void-dom-elements-no-children.md
    'react/void-dom-elements-no-children': 'error',
    // Warn on missing `await` within async functions
    // https://eslint.org/docs/rules/require-await
    'require-await': 'warn',
    // Error on child_process.exec usage with variables
    // https://github.com/nodesecurity/eslint-plugin-security#detect-child-process
    'security/detect-child-process': 'error',
    // Error on running eval with a variable
    // https://github.com/nodesecurity/eslint-plugin-security#detect-eval-with-expression
    'security/detect-eval-with-expression': 'error',
    // Warn on comments without a space between the `//` and the comment
    // https://github.com/eslint/eslint/blob/master/docs/rules/spaced-comment.md
    'spaced-comment': ['warn', 'always', { markers: ['/'] }],
    // Warn on duplicate code in if / else if branches
    // https://github.com/SonarSource/eslint-plugin-sonarjs/blob/master/docs/rules/no-duplicated-branches.md
    'sonarjs/no-duplicated-branches': 'warn',
    // Warn on identical conditions for if / else if chains
    // https://github.com/SonarSource/eslint-plugin-sonarjs/blob/master/docs/rules/no-identical-conditions.md
    'sonarjs/no-identical-conditions': 'warn',
    // Warn on return of boolean literals inside if / else
    // https://github.com/SonarSource/eslint-plugin-sonarjs/blob/master/docs/rules/prefer-single-boolean-return.md
    'sonarjs/prefer-single-boolean-return': 'warn',
    // Warn on usage of .map(...).flat() and recommend .flatMap()
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-array-flat-map.md
    'unicorn/prefer-array-flat-map': 'warn',
    // Warn on legacy techniques to flatten and recommend .flat()
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-array-flat.md
    'unicorn/prefer-array-flat': 'warn',
    // Warn about importing or requiring builtin modules without node: prefix
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-node-protocol.md
    'unicorn/prefer-node-protocol': ['warn'],
    // Warn about usage of substring or substr instead of slice
    'unicorn/prefer-string-slice': 'warn',
  },
};
