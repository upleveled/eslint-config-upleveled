// Override bundled lib/index.d.ts, which types the default export with only `configs`, causing TS2559 with FlatConfig.Plugin
declare module 'eslint-plugin-jsx-a11y-x' {
  import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

  let plugin: FlatConfig.Plugin;
  export default plugin;
}
