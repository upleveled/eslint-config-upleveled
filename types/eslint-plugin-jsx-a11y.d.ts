declare module 'eslint-plugin-jsx-a11y' {
  import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

  let plugin: FlatConfig.Plugin & {
    configs: {
      recommended: FlatConfig.Config;
    };
  };
  export default plugin;
}
