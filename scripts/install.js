import { execSync } from 'node:child_process';
import fs from 'node:fs';

const packageJsonPath = `${process.cwd()}/package.json`;
const packageJsonObj = JSON.parse(fs.readFileSync(packageJsonPath));

packageJsonObj.resolutions = {
  ...packageJsonObj.resolutions,
  '@typescript-eslint/eslint-plugin':
    packageJsonObj.devDependencies['@typescript-eslint/eslint-plugin'],
  '@typescript-eslint/parser':
    packageJsonObj.devDependencies['@typescript-eslint/parser'],
  'eslint-plugin-react': packageJsonObj.devDependencies['eslint-plugin-react'],
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
