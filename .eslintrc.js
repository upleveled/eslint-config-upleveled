module.exports = {
  extends: 'react-app',
  plugins: ['cypress'],
  env: {
    'cypress/globals': true,
  },
  rules: {
    // Warn about variable shadowing
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
    // Disable rule because the new JSX transform in React 17,
    // Next.js and Gatsby no longer requires the import.
    //
    // https://github.com/yannickcr/eslint-plugin-react/issues/2440#issuecomment-683433266
    'react/react-in-jsx-scope': 'off',
  },
};
