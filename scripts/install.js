import { execSync } from 'node:child_process';
import fs from 'node:fs';

const packageJsonPath = `${process.cwd()}/package.json`;
const packageJsonObj = JSON.parse(fs.readFileSync(packageJsonPath));

packageJsonObj.resolutions = {
  ...packageJsonObj.resolutions,
  // Force installation of the "dependencies" version of these
  // ESLint dependencies to avoid conflicting version numbers
  // between `eslint-config-react-app` and
  // `@upleveled/eslint-config-upleveled` (they use the same
  // ESLint dependencies, but may have slightly different
  // versions).
  //
  // These conflicts can result in ESLint errors like:
  //
  // ESLint couldn't determine the plugin "import" uniquely.
  //
  // - /home/runner/work/preflight/preflight/node_modules/eslint-plugin-import/lib/index.js (loaded in ".eslintrc.cjs » @upleveled/eslint-config-upleveled")
  // - /home/runner/work/preflight/preflight/node_modules/eslint-config-react-app/node_modules/eslint-plugin-import/lib/index.js (loaded in ".eslintrc.cjs » @upleveled/eslint-config-upleveled » eslint-config-react-app")
  ...[
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
    'eslint-plugin-import',
    'eslint-plugin-jest',
    'eslint-plugin-react',
    'eslint-plugin-react-hooks',
  ].reduce(
    (resolutions, packageName) => ({
      ...resolutions,
      [packageName]: packageJsonObj.devDependencies[packageName],
    }),
    {},
  ),
  '@typescript-eslint/utils':
    packageJsonObj.devDependencies['@typescript-eslint/parser'],
};

fs.writeFileSync(
  packageJsonPath,
  JSON.stringify(packageJsonObj, null, 2) + '\n',
);

console.log(
  'Forced latest version of ESLint Plugin React with Yarn Resolution in package.json',
);

console.log('Installing new packages from resolutions...');

execSync('yarn install');

console.log('Done');
