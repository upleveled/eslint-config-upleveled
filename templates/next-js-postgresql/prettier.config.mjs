import { postgresql } from 'sql-formatter';

/** @type {import('prettier').Config} */
const prettierConfig = {
  plugins: ['prettier-plugin-embed', 'prettier-plugin-sql'],
  singleQuote: true,
  trailingComma: 'all',
};

/** @type {import('prettier-plugin-embed').PrettierPluginEmbedOptions} */
const prettierPluginEmbedConfig = {
  embeddedSqlIdentifiers: ['sql'],
};

/** @type {import('prettier-plugin-sql').SqlBaseOptions} */
const prettierPluginSqlConfig = {
  dialect: JSON.stringify(postgresql),
  keywordCase: 'upper',
  identifierCase: 'lower',
  dataTypeCase: 'lower',
  functionCase: 'lower',
  // - Wrap all parenthesized expressions to new lines (eg. `INSERT` columns)
  // - Do not wrap foreign keys (eg. `REFERENCES table_name (id)`)
  // - Do not wrap column type expressions (eg. `VARCHAR(255)`)
  // - Do not wrap longer field names when used alone (eg. `address_line_one`)
  // - Do not wrap shorter expressions in function calls (eg. `avg(ratings.rating)`)
  expressionWidth: 30,
};

const config = {
  ...prettierConfig,
  ...prettierPluginEmbedConfig,
  ...prettierPluginSqlConfig,
};

export default config;
