import fs from 'node:fs';

const packageJsonPath = `${process.cwd()}/package.json`;
const packageJsonObj = JSON.parse(fs.readFileSync(packageJsonPath));

packageJsonObj.resolutions = {
  ...packageJsonObj.resolutions,
  'eslint-plugin-react': '7.23.2',
};

fs.writeFileSync(
  packageJsonPath,
  JSON.stringify(packageJsonObj, null, 2) + '\n',
);

console.log(
  'Forced latest version of ESLint Plugin React with Yarn Resolution in package.json',
);
