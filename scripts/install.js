import { execSync } from 'node:child_process';
import fs from 'node:fs';

const packageJsonPath = `${process.cwd()}/package.json`;
const packageJsonObj = JSON.parse(fs.readFileSync(packageJsonPath));

packageJsonObj.resolutions = {
  ...packageJsonObj.resolutions,
  // There is not yet a PR to upgrade this, but
  // after facebook/create-react-app#10817 below
  // is merged, it's possible that we can instead
  // run `yarn upgrade react-scripts`, which acts
  // the same as using this resolution (and then
  // we don't need to keep maintaining this version
  // number)
  'eslint-plugin-react': '7.24.0',
  // Should be resolved by this PR:
  // https://github.com/facebook/create-react-app/pull/10817
  'eslint-plugin-testing-library': '4.6.0',
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
