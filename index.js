import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { fixupPluginRules } from '@eslint/compat';
import next from '@next/eslint-plugin-next';
import eslintTypescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import gitignore from 'eslint-config-flat-gitignore';
import eslintImportX from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactX from 'eslint-plugin-react-x';
import security from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import upleveled from 'eslint-plugin-upleveled';
import globals from 'globals';
import isPlainObject from 'is-plain-obj';
import stripJsonComments from 'strip-json-comments';

/** @type
 * {import('@typescript-eslint/utils/ts-eslint').FlatConfig.RuleLevelAndOptions}
 * */
export const noRestrictedSyntaxOptions = [
  'warn',
  // Currently it is not possible to use Markdown eg. links in
  // ESLint warnings / error messages
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

  // Currently it is not possible to use Markdown eg. links in
  // ESLint warnings / error messages
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

  {
    selector:
      "JSXAttribute[name.name='key'] > JSXExpressionContainer > :not(TemplateLiteral)",
    message:
      // eslint-disable-next-line no-template-curly-in-string -- Allow for the code example including template strings and interpolation
      'Use template literals including a prefixes for the values of key props (eg. <div key={`user-${user.id}`}> instead of <div key={user.id}>)',
  },

  // Warn on nesting <a> elements, <button> elements and
  // framework <Link> components inside of each other
  {
    selector:
      "JSXElement[openingElement.name.name='a'] > JSXElement[openingElement.name.name=/^(a|button|Link)$/]",
    message:
      'Invalid DOM Nesting: anchor elements cannot have anchor elements, button elements or Link components as children',
  },
  {
    selector:
      "JSXElement[openingElement.name.name='button'] > JSXElement[openingElement.name.name=/^(a|button|Link)$/]",
    message:
      'Invalid DOM Nesting: button elements cannot have anchor elements, button elements or Link components as children',
  },
  {
    selector:
      "JSXElement[openingElement.name.name='Link'] > JSXElement[openingElement.name.name=/^(a|button|Link)$/]",
    message:
      'Invalid DOM Nesting: Link components cannot have anchor elements, button elements or Link components as children',
  },

  // Warn on nesting of non-<li> elements inside of <ol> and <ul>
  // elements
  {
    selector:
      "JSXElement[openingElement.name.name=/^(ol|ul)$/] > JSXElement[openingElement.name.name!='li'][openingElement.name.name!=/^[A-Z]/]",
    message:
      'Invalid DOM Nesting: ol and ul elements cannot have non-li elements as children',
  },

  // Warn on nesting common invalid elements inside of <p>
  // elements
  {
    selector:
      "JSXElement[openingElement.name.name='p'] > JSXElement[openingElement.name.name=/^(div|h1|h2|h3|h4|h5|h6|hr|ol|p|table|ul)$/]",
    message:
      'Invalid DOM Nesting: p elements cannot have div, h1, h2, h3, h4, h5, h6, hr, ol, p, table or ul elements as children',
  },

  // Warn on nesting any invalid elements inside of <table>
  // elements
  {
    selector:
      "JSXElement[openingElement.name.name='table'] > JSXElement[openingElement.name.name!=/^(caption|colgroup|tbody|tfoot|thead)$/][openingElement.name.name!=/^[A-Z]/]",
    message:
      'Invalid DOM Nesting: table elements cannot have element which are not caption, colgroup, tbody, tfoot or thead elements as children',
  },

  // Warn on nesting any invalid elements inside of <tbody>,
  // <thead> and <tfoot> elements
  {
    selector:
      "JSXElement[openingElement.name.name=/(tbody|thead|tfoot)/] > JSXElement[openingElement.name.name!='tr'][openingElement.name.name!=/^[A-Z]/]",
    message:
      'Invalid DOM Nesting: tbody, thead and tfoot elements cannot have non-tr elements as children',
  },

  // Warn on nesting any invalid elements inside of <tr> elements
  {
    selector:
      "JSXElement[openingElement.name.name='tr'] > JSXElement[openingElement.name.name!=/(th|td)/][openingElement.name.name!=/^[A-Z]/]",
    message:
      'Invalid DOM Nesting: tr elements cannot have elements which are not th or td elements as children',
  },

  // Warn on sql tagged template literal without generic type
  // argument
  {
    selector:
      "VariableDeclarator > AwaitExpression > TaggedTemplateExpression[tag.name='sql']:not([typeArguments.params.0])",
    message: `sql tagged template literal missing generic type argument, eg.

  const animals = await sql<Animal[]>\`
    SELECT * FROM animals
  \`;

`,
  },

  // Warn on standalone && expressions at top level and inside
  // blocks
  {
    selector:
      "Program > ExpressionStatement > LogicalExpression[operator='&&'], BlockStatement > ExpressionStatement > LogicalExpression[operator='&&']",
    message: `Prefer if statements to standalone && expressions, eg. instead of a standalone expression like this:

  animal && showAnimal();

Prefer an if statement like this:

  if (animal) showAnimal();

`,
  },

  // Warn on standalone || expressions at top level and inside
  // blocks
  {
    selector:
      "Program > ExpressionStatement > LogicalExpression[operator='||'], BlockStatement > ExpressionStatement > LogicalExpression[operator='||']",
    message: `Prefer if statements to standalone || expressions, eg. instead of a standalone expression like this:

  animal || hideAnimal();

Prefer an if statement like this:

  if (!animal) hideAnimal();

`,
  },

  // Warn on standalone ternary expressions at top level and
  // inside blocks
  {
    selector:
      'Program > ExpressionStatement > ConditionalExpression, BlockStatement > ExpressionStatement > ConditionalExpression',
    message: `Prefer if...else statements to standalone ternary operators, eg. instead of a standalone ternary operator like this:

  animal ? showAnimal() : hideAnimal();

Prefer an if...else statement like this:

  if (animal) {
    showAnimal();
  } else {
    hideAnimal();
  }

`,
  },

  // Warn on import paths ending in /page to avoid errors with
  // Next.js Statically Typed Links
  {
    selector:
      'ImportDeclaration[source.value=/^\\.\\.?\\u002F(.+\\u002F)?page$/]',
    message: `Avoid imports from other pages in Next.js - this can cause errors with Next.js Statically Typed Links https://nextjs.org/docs/app/building-your-application/configuring/typescript#statically-typed-links

Instead, move anything you want to import to a non-page file`,
  },
];

/**
 * Copied contents from the defunct project
 * eslint-config-react-app
 *
 * - https://github.com/facebook/create-react-app/blob/main/packages/eslint-config-react-app/index.js
 * - https://github.com/facebook/create-react-app/blob/main/packages/eslint-config-react-app/base.js
 *
 * @type
 * {import('@typescript-eslint/utils/ts-eslint').FlatConfig.Rules}
 */
const eslintConfigReactAppRules = {
  'array-callback-return': 'warn',
  'default-case': ['warn', { commentPattern: '^no default$' }],
  'dot-location': ['warn', 'property'],
  eqeqeq: ['warn', 'smart'],
  'new-parens': 'warn',
  'no-caller': 'warn',
  'no-cond-assign': ['warn', 'except-parens'],
  'no-const-assign': 'warn',
  'no-control-regex': 'warn',
  'no-delete-var': 'warn',
  'no-dupe-args': 'warn',
  'no-dupe-class-members': 'warn',
  'no-dupe-keys': 'warn',
  'no-duplicate-case': 'warn',
  'no-empty-character-class': 'warn',
  'no-empty-pattern': 'warn',
  'no-eval': 'warn',
  'no-ex-assign': 'warn',
  'no-extend-native': 'warn',
  'no-extra-bind': 'warn',
  'no-extra-label': 'warn',
  'no-fallthrough': 'warn',
  'no-func-assign': 'warn',
  'no-implied-eval': 'warn',
  'no-invalid-regexp': 'warn',
  'no-iterator': 'warn',
  'no-label-var': 'warn',
  'no-labels': ['warn', { allowLoop: true, allowSwitch: false }],
  'no-lone-blocks': 'warn',
  'no-loop-func': 'warn',
  'no-mixed-operators': [
    'warn',
    {
      groups: [
        ['&', '|', '^', '~', '<<', '>>', '>>>'],
        ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
        ['&&', '||'],
        ['in', 'instanceof'],
      ],
      allowSamePrecedence: false,
    },
  ],
  'no-multi-str': 'warn',
  'no-global-assign': 'warn',
  'no-unsafe-negation': 'warn',
  'no-new-func': 'warn',
  'no-new-object': 'warn',
  'no-new-symbol': 'warn',
  'no-new-wrappers': 'warn',
  'no-obj-calls': 'warn',
  'no-octal': 'warn',
  'no-octal-escape': 'warn',
  'no-regex-spaces': 'warn',
  'no-script-url': 'warn',
  'no-self-assign': 'warn',
  'no-self-compare': 'warn',
  'no-sequences': 'warn',
  'no-shadow-restricted-names': 'warn',
  'no-sparse-arrays': 'warn',
  'no-template-curly-in-string': 'warn',
  'no-this-before-super': 'warn',
  'no-throw-literal': 'warn',
  'no-undef': 'error',
  'no-restricted-globals': [
    'error',
    // Confusing browser globals (copied from create-react-app)
    //
    // The ESLint browser environment defines all browser globals
    // as valid, even though most people don't know some of them
    // exist (e.g. `name` or `status`). This is dangerous as it
    // hides accidentally undefined variables. We blacklist the
    // globals that we deem potentially confusing. To use them,
    // explicitly reference them, e.g. `window.name` or
    // `window.status`.
    //
    // https://github.com/facebook/create-react-app/blob/main/packages/confusing-browser-globals/index.js
    'addEventListener',
    'blur',
    'close',
    'closed',
    'confirm',
    'defaultStatus',
    'defaultstatus',
    'event',
    'external',
    'find',
    'focus',
    'frameElement',
    'frames',
    'history',
    'innerHeight',
    'innerWidth',
    'length',
    'location',
    'locationbar',
    'menubar',
    'moveBy',
    'moveTo',
    'name',
    'onblur',
    'onerror',
    'onfocus',
    'onload',
    'onresize',
    'onunload',
    'open',
    'opener',
    'opera',
    'outerHeight',
    'outerWidth',
    'pageXOffset',
    'pageYOffset',
    'parent',
    'print',
    'removeEventListener',
    'resizeBy',
    'resizeTo',
    'screen',
    'screenLeft',
    'screenTop',
    'screenX',
    'screenY',
    'scroll',
    'scrollbars',
    'scrollBy',
    'scrollTo',
    'scrollX',
    'scrollY',
    'self',
    'status',
    'statusbar',
    'stop',
    'toolbar',
    'top',
  ],
  'no-unreachable': 'warn',
  'no-unused-labels': 'warn',
  'no-useless-computed-key': 'warn',
  'no-useless-concat': 'warn',
  'no-useless-escape': 'warn',
  'no-useless-rename': [
    'warn',
    {
      ignoreDestructuring: false,
      ignoreImport: false,
      ignoreExport: false,
    },
  ],
  'no-with': 'warn',
  'no-whitespace-before-property': 'warn',
  'react-hooks/exhaustive-deps': 'warn',
  'require-yield': 'warn',
  'rest-spread-spacing': ['warn', 'never'],
  strict: ['warn', 'never'],
  'unicode-bom': ['warn', 'never'],
  'use-isnan': 'warn',
  'valid-typeof': 'warn',
  'no-restricted-properties': [
    'error',
    {
      object: 'require',
      property: 'ensure',
      message:
        'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting',
    },
    {
      object: 'System',
      property: 'import',
      message:
        'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting',
    },
  ],
  'getter-return': 'warn',

  // https://github.com/benmosher/eslint-plugin-import/tree/master/docs/rules
  // 'import/first': 'error', 'import/no-amd': 'error',
  // 'import/no-anonymous-default-export': 'warn',
  // 'import/no-webpack-loader-syntax': 'error',

  // https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules
  'react/forbid-foreign-prop-types': ['warn', { allowInPropTypes: true }],
  'react/jsx-no-comment-textnodes': 'warn',
  'react/jsx-no-duplicate-props': 'warn',
  'react/jsx-no-target-blank': 'warn',
  'react/jsx-no-undef': 'error',
  'react/jsx-pascal-case': [
    'warn',
    {
      allowAllCaps: true,
      ignore: [],
    },
  ],
  'react/no-danger-with-children': 'warn',
  // Disabled because of undesirable warnings See
  // https://github.com/facebook/create-react-app/issues/5204 for
  // blockers until its re-enabled 'react/no-deprecated': 'warn',
  'react/no-direct-mutation-state': 'warn',
  'react/no-is-mounted': 'warn',
  'react/no-typos': 'error',
  'react/require-render-return': 'error',
  'react/style-prop-object': [
    'warn',
    {
      allow: [
        // Allow expo-status-bar style prop, which is a string,
        // eg: <StatusBar style="auto" />
        // https://github.com/expo/expo/blob/999572cd1036529ffa3a28a0490dd7c0f6f0d731/packages/expo-status-bar/src/StatusBar.types.ts#L2
        'StatusBar',
      ],
    },
  ],

  // https://github.com/evcohen/eslint-plugin-jsx-a11y/tree/master/docs/rules
  'jsx-a11y/alt-text': 'warn',
  'jsx-a11y/anchor-has-content': 'warn',
  'jsx-a11y/aria-activedescendant-has-tabindex': 'warn',
  'jsx-a11y/aria-props': 'warn',
  'jsx-a11y/aria-proptypes': 'warn',
  'jsx-a11y/aria-role': ['warn', { ignoreNonDOM: true }],
  'jsx-a11y/aria-unsupported-elements': 'warn',
  'jsx-a11y/heading-has-content': 'warn',
  'jsx-a11y/iframe-has-title': 'warn',
  'jsx-a11y/img-redundant-alt': 'warn',
  'jsx-a11y/no-access-key': 'warn',
  'jsx-a11y/no-distracting-elements': 'warn',
  'jsx-a11y/no-redundant-roles': 'warn',
  'jsx-a11y/role-has-required-aria-props': 'warn',
  'jsx-a11y/role-supports-aria-props': 'warn',
  'jsx-a11y/scope': 'warn',

  // https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
  'react-hooks/rules-of-hooks': 'error',
};

/** @type
 * {import('@typescript-eslint/utils/ts-eslint').FlatConfig.ConfigArray}
 * */
const configArray = [
  gitignore(),
  {
    // Lint common extensions by default with rules above
    files: [
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        // typescript-eslint specific options
        warnOnUnsupportedTypeScriptVersion: true,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.commonjs,
        ...globals.es2021,
        // Allow using React as a global without importing it
        React: true,
      },
    },
    plugins: {
      '@next/next': fixupPluginRules(next),
      '@typescript-eslint': {
        rules: eslintTypescript.rules,
      },
      'import-x': eslintImportX,
      'jsx-a11y': jsxA11y,
      'react-x': reactX,
      'react-hooks': reactHooks,
      react: fixupPluginRules(react),
      security,
      sonarjs: {
        rules: sonarjs.rules,
      },
      unicorn,
      upleveled:
        // TODO: Fix UpLeveled plugin for ESLint 9
        // - https://github.com/upleveled/eslint-plugin-upleveled/issues/117
        fixupPluginRules(upleveled),
    },
    settings: {
      'import-x/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import-x/resolver': {
        // Load <rootdir>/tsconfig.json
        typescript: true,
        node: true,
      },
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...eslintConfigReactAppRules,
      // eslint-disable-next-line rest-spread-spacing -- Allow JSDoc casting
      .../** @type {Exclude<Exclude<import('@typescript-eslint/utils/ts-eslint').FlatConfig.Plugin['configs'], undefined>[string], undefined>} */ (
        /** @type
         * {Exclude<import('@typescript-eslint/utils/ts-eslint').FlatConfig.Plugin['configs'],
         * undefined>} */ (jsxA11y.configs).recommended
      ).rules,

      // Error about importing next/document in a page other than
      // pages/_document.js
      // https://github.com/vercel/next.js/blob/canary/errors/no-document-import-in-page.md
      '@next/next/no-document-import-in-page': 'error',
      // Error about importing next/head in pages/_document.js
      // https://github.com/vercel/next.js/blob/canary/errors/no-head-import-in-document.md
      '@next/next/no-head-import-in-document': 'error',
      // Error about using <a> element to navigate to a page
      // route instead of Next.js <Link /> component
      // https://github.com/vercel/next.js/blob/canary/errors/no-html-link-for-pages.md
      '@next/next/no-html-link-for-pages': 'error',
      // Warn about using a custom font in a single page instead
      // of in pages/_document.js
      // https://github.com/vercel/next.js/blob/canary/errors/no-page-custom-font.md
      '@next/next/no-page-custom-font': 'warn',
      // Warn about setting a title for all pages in a single
      // page by importing <Head /> from next/document
      // https://github.com/vercel/next.js/blob/canary/errors/no-title-in-document-head.md
      '@next/next/no-title-in-document-head': 'warn',
      // Warn on usage of angle brackets for type assertions (eg.
      // `<Type>x`)
      // https://typescript-eslint.io/rules/consistent-type-assertions/
      '@typescript-eslint/consistent-type-assertions': 'warn',
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
          selector: 'method',
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
        // Disable @typescript-eslint/naming-convention format
        // for imports
        // https://github.com/typescript-eslint/typescript-eslint/pull/7269#issuecomment-1777628591
        {
          selector: 'import',
          format: null,
        },
      ],
      // Warn on usage of array constructor (eg. Array(0, 1), new
      // Array(0, 1))
      // https://typescript-eslint.io/rules/no-array-constructor/
      'no-array-constructor': 'off',
      '@typescript-eslint/no-array-constructor': 'warn',
      // Warn on .toString() usage on non-primitives which don't
      // define a custom toString() method
      // https://typescript-eslint.io/rules/no-base-to-string/
      '@typescript-eslint/no-base-to-string': 'warn',
      // Disable built-in ESLint no-dupe-class-members to use the
      // more powerful @typescript-eslint/no-dupe-class-members
      // https://typescript-eslint.io/rules/no-dupe-class-members/
      'no-dupe-class-members': 'off',
      '@typescript-eslint/no-dupe-class-members': 'warn',
      // Warn on duplicate constituents of unions or intersections
      // https://typescript-eslint.io/rules/no-duplicate-type-constituents/
      '@typescript-eslint/no-duplicate-type-constituents': 'warn',
      // Error on usage of {} type
      // https://github.com/typescript-eslint/typescript-eslint/blob/78ed7d4bc8897e77e46346bb19ccabf918373603/packages/eslint-plugin/docs/rules/no-empty-object-type.mdx
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'with-single-extends' },
      ],
      // Warn on extra non-null assertions
      // https://typescript-eslint.io/rules/no-extra-non-null-assertion/
      '@typescript-eslint/no-extra-non-null-assertion': 'warn',
      // Warn on dangling promises without await
      // https://typescript-eslint.io/rules/no-floating-promises/
      '@typescript-eslint/no-floating-promises': [
        'warn',
        { ignoreVoid: false },
      ],
      // Warn on for...in loops over arrays to avoid iterating
      // over array prototype properties and skipping holes
      // https://typescript-eslint.io/rules/no-for-in-array/
      '@typescript-eslint/no-for-in-array': 'warn',
      // Error on usage of `eval()`-like methods
      // https://typescript-eslint.io/rules/no-implied-eval/
      'no-implied-eval': 'off',
      '@typescript-eslint/no-implied-eval': 'error',
      // Warn on usage of promises in incorrect locations
      // https://typescript-eslint.io/rules/no-misused-promises/
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            // Allow async functions passed to event handler props
            // - https://github.com/typescript-eslint/typescript-eslint/pull/4623
            // - https://github.com/typescript-eslint/typescript-eslint/issues/4619
            //
            // Although technically, async functions are officially
            // discouraged to be passed to event handler props:
            // - https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/66505#discussioncomment-10411110
            attributes: false,
          },
        },
      ],
      // Warn on usage of TypeScript namespaces
      // https://typescript-eslint.io/rules/no-namespace/
      //
      // TODO: Enable when better globalThis module augmentation
      // option available
      // https://github.com/upleveled/eslint-config-upleveled/issues/402
      // '@typescript-eslint/no-namespace': 'warn',
      // Error on usage of non-null assertions after optional
      // chaining expressions
      // https://typescript-eslint.io/rules/no-non-null-asserted-optional-chain/
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
      // Error on no-op or overriding constituents in unions or
      // intersections
      // https://typescript-eslint.io/rules/no-redundant-type-constituents/
      '@typescript-eslint/no-redundant-type-constituents': 'error',
      // Warn on redeclare of variables
      // https://typescript-eslint.io/rules/no-redeclare/
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'warn',
      // Error on usage of require(), because this will often
      // result in a runtime error
      // https://typescript-eslint.io/rules/no-require-imports/
      '@typescript-eslint/no-require-imports': 'error',
      // Warn about variable shadowing
      // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-shadow.md
      '@typescript-eslint/no-shadow': 'warn',
      // Warn on aliasing `this`, common in legacy code
      // https://typescript-eslint.io/rules/no-this-alias/
      '@typescript-eslint/no-this-alias': 'warn',
      // Disable built-in ESLint no-constant-condition to use the
      // more powerful
      // @typescript-eslint/no-unnecessary-condition
      // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unnecessary-condition.md
      'no-constant-condition': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      // Warn about unnecessary template expressions
      // https://typescript-eslint.io/rules/no-unnecessary-template-expression/
      '@typescript-eslint/no-unnecessary-template-expression': 'warn',
      // Prevent unnecessary type arguments
      // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unnecessary-type-arguments.md
      '@typescript-eslint/no-unnecessary-type-arguments': 'warn',
      // Prevent unnecessary type assertions
      // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unnecessary-type-assertion.md
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      // Warn on unnecessary generic TS type constraints
      // https://typescript-eslint.io/rules/no-unnecessary-type-constraint/
      '@typescript-eslint/no-unnecessary-type-constraint': 'warn',
      // Warn on calling a value with type `any`
      // https://typescript-eslint.io/rules/no-unsafe-call/
      '@typescript-eslint/no-unsafe-call': 'warn',
      // Error on usage of Function type
      // https://github.com/typescript-eslint/typescript-eslint/blob/78ed7d4bc8897e77e46346bb19ccabf918373603/packages/eslint-plugin/docs/rules/no-unsafe-function-type.mdx
      '@typescript-eslint/no-unsafe-function-type': ['error'],
      // Warn on property access of values with `any` types
      // https://typescript-eslint.io/rules/no-unsafe-member-access/
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      // Warn on returning values with `any` types
      // https://typescript-eslint.io/rules/no-unsafe-return/
      '@typescript-eslint/no-unsafe-return': 'warn',
      // Warn on unused expressions
      // https://typescript-eslint.io/rules/no-unused-expression
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': [
        'warn',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
      // Disable built-in ESLint no-unused-vars to use the more
      // powerful @typescript-eslint/no-unused-vars
      // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unused-vars.md
      // https://eslint.org/docs/rules/no-unused-vars
      'no-unused-vars': 'off',
      // No need for this, @typescript-eslint/parser fully
      // understands JSX semantics
      // https://github.com/typescript-eslint/typescript-eslint/issues/2985#issuecomment-771771967
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'after-used',
          ignoreRestSiblings: true,
        },
      ],
      // Disable built-in ESLint no-use-before-define in order to
      // enable the rule from the @typescript-eslint plugin
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': [
        'error',
        {
          functions: false,
          typedefs: false,
        },
      ],
      // Warn on useless constructor in class
      // https://typescript-eslint.io/rules/no-useless-constructor/
      'no-useless-constructor': 'off',
      '@typescript-eslint/no-useless-constructor': 'warn',
      // Error on usage of Boolean, Number, String,
      // BigInt, Symbol, Object types
      // https://github.com/typescript-eslint/typescript-eslint/blob/78ed7d4bc8897e77e46346bb19ccabf918373603/packages/eslint-plugin/docs/rules/no-wrapper-object-types.mdx
      '@typescript-eslint/no-wrapper-object-types': ['error'],
      // Warn on `as <literal>` type assertions - instead suggest
      // usage of `as const`
      // https://typescript-eslint.io/rules/prefer-as-const/
      '@typescript-eslint/prefer-as-const': 'warn',
      // Warn on missing `await` within async functions
      // https://typescript-eslint.io/rules/require-await/
      'require-await': 'off',
      '@typescript-eslint/require-await': 'warn',
      // Error on incorrect or mismatching operands with the
      // `+` operator
      // https://typescript-eslint.io/rules/restrict-plus-operands/
      '@typescript-eslint/restrict-plus-operands': 'error',
      // Warn about template literal interpolation of
      // non-primitive data types like objects / arrays
      // https://typescript-eslint.io/rules/restrict-template-expressions/
      '@typescript-eslint/restrict-template-expressions': 'error',
      // Allow leaving out curlies only with single-line
      // condition blocks
      // https://github.com/eslint/eslint/blob/master/docs/rules/curly.md#multi-line
      curly: ['warn', 'multi-line', 'consistent'],
      // Warn on imports not at top of the file
      // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/first.md
      'import-x/first': 'warn',
      // Error on usage of AMD require() and define()
      // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-amd.md
      'import-x/no-amd': 'error',
      // Warn on anonymous (unnamed) default exports
      // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-anonymous-default-export.md
      'import-x/no-anonymous-default-export': 'warn',
      // Error on usage of non-standard, non-portable webpack
      // loader syntax
      // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-webpack-loader-syntax.md
      'import-x/no-webpack-loader-syntax': 'error',
      // Error on imports that don't match the underlying file
      // system
      // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-unresolved.md
      'import-x/no-unresolved': 'error',
      // Remove `href` warnings on anchor tags for Next.js Issue
      // in Next.js:
      // - https://github.com/zeit/next.js/issues/5533
      // Fix:
      // - https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/issues/402#issuecomment-368305051
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
      // Warn on async promise executor function
      // https://github.com/eslint/eslint/blob/main/docs/src/rules/no-async-promise-executor.md
      'no-async-promise-executor': 'warn',
      // Error on expressions where operations with ||, && and
      // ?? operators have likely unintended effects
      // https://eslint.org/docs/latest/rules/no-constant-binary-expression
      'no-constant-binary-expression': 'error',
      // Warn on return in promise executor function
      // https://github.com/eslint/eslint/blob/main/docs/src/rules/no-promise-executor-return.md
      'no-promise-executor-return': 'warn',
      // Warn on restricted syntax
      'no-restricted-syntax': noRestrictedSyntaxOptions,
      // Warn on usage of var (which doesn't follow block scope
      // rules)
      // https://eslint.org/docs/rules/no-var
      'no-var': 'warn',
      // Warn about non-changing variables not being constants
      // https://eslint.org/docs/rules/prefer-const
      'prefer-const': 'warn',
      // Warn on promise rejection without Error object
      // https://github.com/eslint/eslint/blob/main/docs/src/rules/prefer-promise-reject-errors.md
      'prefer-promise-reject-errors': 'warn',
      // Warn about state variable and setter names which are not
      // symmetrically named
      // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/hook-use-state.md
      'react/hook-use-state': 'warn',
      // Error on missing sandbox attribute on iframes (good
      // security practice)
      // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/iframe-missing-sandbox.md
      'react/iframe-missing-sandbox': 'error',
      // Warn about unnecessary curly braces around props and
      // string literal children
      // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-curly-brace-presence.md
      'react/jsx-curly-brace-presence': [
        'warn',
        { props: 'never', children: 'never', propElementValues: 'always' },
      ],
      // Error on missing or incorrect `key` props in maps in JSX
      // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-key.md
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
      // Disallow React being marked as unused
      // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-uses-react.md
      'react/jsx-uses-react': 'warn',
      // Warn if a `key` is set to an `index`
      // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-array-index-key.md
      'react/no-array-index-key': ['error'],
      // Error on invalid HTML attributes (only `rel` as of March
      // 2022)
      // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-invalid-html-attribute.md
      'react/no-invalid-html-attribute': 'error',
      // Warn on usage of `class` prop instead of `className`
      // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unknown-property.md
      'react/no-unknown-property': ['warn', { ignore: ['css'] }],
      // Error on creating components within components
      // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unstable-nested-components.md
      'react/no-unstable-nested-components': 'error',
      // Error on unused React prop types
      // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unused-prop-types.md
      'react/no-unused-prop-types': 'warn',
      // Disable rule because the new JSX transform in React 17,
      // Next.js and Gatsby no longer requires the import.
      // https://github.com/jsx-eslint/eslint-plugin-react/issues/2440#issuecomment-683433266
      'react/react-in-jsx-scope': 'off',
      // Warn about components that have a closing tag but no
      // children
      // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/self-closing-comp.md
      'react/self-closing-comp': 'warn',
      // Error on passing children to void elements
      // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/void-dom-elements-no-children.md
      'react/void-dom-elements-no-children': 'error',
      // Disallow potentially falsey string and number values in
      // logical && expressions
      // https://eslint-react.xyz/docs/rules/no-leaked-conditional-rendering
      'react-x/no-leaked-conditional-rendering': 'error',
      // Error on trojan source code attacks using bidirectional
      // characters
      // https://github.com/eslint-community/eslint-plugin-security/blob/main/docs/rules/detect-bidi-characters.md
      'security/detect-bidi-characters': 'error',
      // Error on child_process.exec usage with variables
      // https://github.com/eslint-community/eslint-plugin-security/blob/main/docs/rules/detect-child-process.md
      'security/detect-child-process': 'error',
      // Error on running eval with a variable
      // https://github.com/eslint-community/eslint-plugin-security/blob/main/docs/rules/detect-eval-with-expression.md
      'security/detect-eval-with-expression': 'error',
      // Warn on comments without a space between the `//` and
      // the comment
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
      // Warn on usage of .map(...).flat() and recommend
      // .flatMap()
      // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-array-flat-map.md
      'unicorn/prefer-array-flat-map': 'warn',
      // Warn on legacy techniques to flatten and recommend
      // .flat()
      // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-array-flat.md
      'unicorn/prefer-array-flat': 'warn',
      // Warn about importing or requiring builtin modules
      // without node: prefix
      // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-node-protocol.md
      'unicorn/prefer-node-protocol': ['warn'],
      // Warn about usage of substring or substr instead of slice
      'unicorn/prefer-string-slice': 'warn',
      // Warn about submit handler without event.preventDefault()
      // https://github.com/upleveled/eslint-plugin-upleveled/blob/main/docs/rules/no-submit-handler-without-preventDefault.md
      'upleveled/no-submit-handler-without-preventDefault': 'error',
      // Warn about unnecessary HTML attributes
      // https://github.com/upleveled/eslint-plugin-upleveled/blob/main/docs/rules/no-unnecessary-html-attributes.md
      'upleveled/no-unnecessary-html-attributes': 'warn',
      // Warn about unnecessary for and id attributes with inputs
      // nested inside of labels
      // https://github.com/upleveled/eslint-plugin-upleveled/blob/main/docs/rules/no-unnecessary-for-and-id.md
      'upleveled/no-unnecessary-for-and-id': 'warn',
    },
  },
  {
    files: [
      'app/**/layout.js',
      'app/**/layout.tsx',
      'app/**/page.js',
      'app/**/page.tsx',
    ],
    rules: {
      // Warn on restricted syntax
      'no-restricted-syntax': [
        ...noRestrictedSyntaxOptions,
        // Warn on 'use client' usage in pages and layouts
        {
          selector: "ExpressionStatement > Literal[value='use client']",
          message:
            'Performance: avoid making pages or layouts into Client Components - instead create a new Client Component and use it in your page / layout',
        },
      ],
    },
  },
  {
    files: ['app/**/route.js', 'app/**/route.ts'],
    rules: {
      // Warn on restricted syntax
      'no-restricted-syntax': [
        ...noRestrictedSyntaxOptions,
        // Warn on Route Handler function without NextResponse
        // return type annotation
        {
          selector:
            "FunctionDeclaration[id.name=/^(GET|POST|PUT|DELETE)$/]:not([returnType.typeAnnotation.typeName.name='Promise'][returnType.typeAnnotation.typeArguments.params.0.typeName.name='NextResponse'][returnType.typeAnnotation.typeArguments.params.0.typeArguments.params.0]):not([returnType.typeAnnotation.typeName.name='NextResponse'][returnType.typeAnnotation.typeArguments.params.0])",
          message:
            'Route Handler function missing return type annotation (eg. `async function PUT(request: NextRequest): Promise<NextResponse<AnimalResponseBodyPut>>`)',
        },
      ],
    },
  },
  {
    name: 'upleveled:database-auth',
    files: ['database/*.ts'],
    rules: {
      'no-restricted-syntax': [
        ...noRestrictedSyntaxOptions,
        // Enforce unambiguous exported database function patterns
        // (require either accepting a session token ("sessionToken")
        // as the first parameter or having a name ending with
        // "Insecure")
        {
          selector:
            "ExportNamedDeclaration > VariableDeclaration[declarations.0.init.callee.name='cache'][declarations.0.id.name!=/Insecure$/][declarations.0.init.arguments.0.params.0.name!='sessionToken']",
          message: `Ambiguous authentication of exported database query function - either pass \`sessionToken\` as the first parameter or destructured property in first parameter or name the function ending with \`Insecure\`:

const getUser = cache(async (sessionToken: string, userId: number) =>

const getArticleCategoriesInsecure = cache(async () =>

`,
        },
        {
          selector:
            "ExportNamedDeclaration > VariableDeclaration[declarations.0.init.type='ArrowFunctionExpression'][declarations.0.id.name!=/Insecure$/][declarations.0.init.params.0.name!='sessionToken']",
          message: `Ambiguous authentication of exported database query function - either pass \`sessionToken\` as the first parameter or destructured property in first parameter or name the function ending with \`Insecure\`:

const getUser = async (sessionToken: string, userId: number) =>

const getArticleCategoriesInsecure = async () =>

`,
        },
        // Enforce usage of session token ("sessionToken" first
        // parameter) within database functions
        {
          selector:
            "ExportNamedDeclaration > VariableDeclaration[declarations.0.init.callee.name='cache'][declarations.0.init.arguments.0.params.0.name='sessionToken'] > VariableDeclarator > CallExpression > ArrowFunctionExpression > BlockStatement:not(:has([type='Identifier'][name='sessionToken']))",
          message:
            'Unused `sessionToken` parameter in database query function - use `sessionToken` in database queries to implement authentication and authorization',
        },
        {
          selector:
            "ExportNamedDeclaration > VariableDeclaration[declarations.0.init.type='ArrowFunctionExpression'][declarations.0.init.params.0.name='sessionToken'] > VariableDeclarator > ArrowFunctionExpression > BlockStatement:not(:has([type='Identifier'][name='sessionToken']))",
          message:
            'Unused `sessionToken` parameter in database query function - use `sessionToken` in database queries to implement authentication and authorization',
        },
      ],
    },
  },
  {
    files: ['**/*.cjs'],
    rules: {
      // Allow require() in CommonJS files
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];

const tsconfigJson = JSON.parse(
  stripJsonComments(await readFile(`${process.cwd()}/tsconfig.json`, 'utf-8'))
    // Strip trailing comments, from strip-json-trailing-commas pkg:
    // https://www.npmjs.com/package/strip-json-trailing-commas
    // https://github.com/nokazn/strip-json-trailing-commas/blob/beced788eb7c35d8b5d26b368dff295455a0aef4/src/index.ts#L13
    .replace(/(?<=(true|false|null|["\d}\]])\s*)\s*,(?=\s*[}\]])/g, ''),
);

if (!isPlainObject(tsconfigJson)) {
  throw new Error('tsconfig.json contains non-object');
}

// Disable complex type-checking rules for JavaScript files
// if compilerOptions.checkJs is `false` or not set in tsconfig.json
if (
  !('compilerOptions' in tsconfigJson) ||
  !isPlainObject(tsconfigJson.compilerOptions) ||
  !tsconfigJson.compilerOptions.checkJs
) {
  configArray.push({
    files: ['**/*.js', '**/*.mjs', '**/*.cjs', '**/*.jsx'],
    rules: {
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  });
}

const packageJson = /** @type {Record<string, any>} */ (
  await import(pathToFileURL(`${process.cwd()}/package.json`).href, {
    with: { type: 'json' },
  })
);

if (
  // packageJson isn't a plain object, it's a module
  typeof packageJson !== 'object' ||
  !isPlainObject(packageJson.default)
) {
  throw new Error(
    'package.json either contains non-object or contains object without .dependencies property',
  );
}

// Only configure SafeQL if Postgres.js is installed
if (
  isPlainObject(packageJson.default.dependencies) &&
  'postgres' in packageJson.default.dependencies
) {
  // Abort early if either of these modules are not installed
  try {
    import.meta.resolve('@ts-safeql/eslint-plugin');
    import.meta.resolve('dotenv-safe');
  } catch (error) {
    throw new Error(
      `SafeQL configuration failed

Please reinstall the UpLeveled ESLint Config using the instructions on https://www.npmjs.com/package/eslint-config-upleveled

${/** @type {Error} */ (error).message}
`,
    );
  }

  // Intermediate variable because @typescript-eslint/no-unsafe-member-access
  // does not apply JSDoc type assertion in chained expression
  // https://github.com/typescript-eslint/typescript-eslint/issues/9568
  const dotenvSafe = /** @type {{ config: () => unknown }} */ (
    // @ts-ignore 2307 (module not found) -- The
    // import.meta.resolve() above will ensure that dotenv is
    // available before this line by throwing if it is not
    // available
    // eslint-disable-next-line import-x/no-unresolved
    await import('dotenv-safe')
  );

  dotenvSafe.config();

  const missingEnvVars = [
    'PGHOST',
    'PGUSERNAME',
    'PGPASSWORD',
    'PGDATABASE',
  ].filter((envVar) => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    throw new Error(
      `SafeQL configuration failed

The following environment variables are not set: ${missingEnvVars.join(', ')}
`,
    );
  }

  const firstConfig = configArray.find((config) => {
    return config.languageOptions && config.plugins && config.rules;
  });

  if (!firstConfig || !firstConfig.plugins || !firstConfig.rules) {
    throw new Error(
      `SafeQL configuration failed

The UpLeveled ESLint config object does not contain all of the properties: .plugins, .rules`,
    );
  }

  // @ts-expect-error 2307 Cannot find module
  // '@ts-safeql/eslint-plugin' because it is not a dependency of
  // the ESLint config
  // eslint-disable-next-line import-x/no-unresolved
  firstConfig.plugins['@ts-safeql'] = await import('@ts-safeql/eslint-plugin');

  firstConfig.rules['@ts-safeql/check-sql'] = [
    'error',
    {
      connections: [
        {
          databaseUrl: `postgres://${process.env.PGUSERNAME}:${process.env.PGPASSWORD}@${process.env.PGHOST}:5432/${process.env.PGDATABASE}`,
          targets: [
            {
              tag: 'sql',
              fieldTransform: 'camel',
              transform: '{type}[]',
            },
          ],
          overrides: {
            types: {
              json: 'JsonAgg',
            },
          },
        },
      ],
    },
  ];
}

export default configArray;
