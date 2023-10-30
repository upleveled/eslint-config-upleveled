/** @type {import('prettier').Config} */
const prettierConfig = {
  plugins: [
    'prettier-plugin-embed',
    'prettier-plugin-sql',
  ],
  singleQuote: true,
  trailingComma: 'all',
};

/** @type {import('prettier-plugin-embed').PrettierPluginEmbedOptions} */
const prettierPluginEmbedConfig = {
  embeddedSqlIdentifiers: ['sql'],
};

/** @type {import('prettier-plugin-sql').SqlBaseOptions} */
const prettierPluginSqlConfig = {
  language: 'postgresql',
  keywordCase: 'upper',
  // Wrap all parenthesized expressions to new lines (eg. INSERT columns)
  expressionWidth: 1,
};

const config = {
  ...prettierConfig,
  ...prettierPluginEmbedConfig,
  ...prettierPluginSqlConfig,
};

export default config;
