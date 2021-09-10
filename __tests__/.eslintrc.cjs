module.exports = {
  extends: ['@upleveled/upleveled'],
  plugins: ['@upleveled/upleveled'],
  rules: {
    '@upleveled/upleveled/no-unnecessary-html-attributes': 'error',
  },
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
