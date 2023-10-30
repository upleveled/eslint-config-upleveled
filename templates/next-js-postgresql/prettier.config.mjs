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
  // - Wrap all parenthesized expressions to new lines (eg. `INSERT` columns)
  // - Do not wrap foreign keys (eg. `REFERENCES table_name (id)`)
  // - Do not wrap column type expressions (eg. `VARCHAR(255)`)
  expressionWidth: 8,
};

const config = {
  ...prettierConfig,
  ...prettierPluginEmbedConfig,
  ...prettierPluginSqlConfig,
};

export default config;
