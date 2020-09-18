# UpLeveled VS Code ESLint Base Config

If you would like to use the UpLeveled VS Code ESLint base configuration:

1. clone this repo to your projects directory
2. run `yarn` to install the dependencies
3. copy the following [`vscode-eslint`](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) configuration
4. open your `settings.json` in VS Code (<kbd>ctrl/cmd</kbd>-<kbd>shift</kbd>-<kbd>P</kbd> - "Open Settings (JSON)")
5. paste in the configuration and fix the paths to point at your directory

## Windows

```json
  "eslint.nodePath": "C:/Users/karl/projects/upleveled-vscode-eslint-base-config/node_modules",
  "eslint.options": {
    "configFile": "C:/Users/karl/projects/upleveled-vscode-eslint-base-config/.eslintrc.js",
    "resolvePluginsRelativeTo": "C:/Users/karl/projects/upleveled-vscode-eslint-base-config/node_modules"
  }
```

## macOS / Linux

```json
  "eslint.nodePath": "/Users/karl/projects/upleveled-vscode-eslint-base-config/node_modules",
  "eslint.options": {
    "configFile": "/Users/karl/projects/upleveled-vscode-eslint-base-config/.eslintrc.js",
    "resolvePluginsRelativeTo": "/Users/karl/projects/upleveled-vscode-eslint-base-config/node_modules"
  }
```
