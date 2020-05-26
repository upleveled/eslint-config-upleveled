# UpLeveled VS Code ESLint Base Config

If you would like to use the UpLeveled VS Code ESLint base configuration:

1. clone this repo to your projects directory
2. run `yarn` to install the dependencies
3. add the following [`vscode-eslint`](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) configuration to your `settings.json` in VS Code (fix the paths to point at your directory)

```json
  "eslint.nodePath": "/Users/karl/projects/upleveled-vscode-eslint-base-config/node_modules",
  "eslint.options": {
    "configFile": "/Users/karl/projects/upleveled-vscode-eslint-base-config/.eslintrc.js",
    "resolvePluginsRelativeTo": "/Users/karl/projects/upleveled-vscode-eslint-base-config/node_modules"
  }
```
